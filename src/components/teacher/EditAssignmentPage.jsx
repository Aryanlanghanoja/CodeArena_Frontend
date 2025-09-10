import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../hooks/use-toast';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { ArrowLeft, Save, X } from 'lucide-react';
import RichTextEditor from '../ui/rich-text-editor';
import assignmentsService from '../../services/assignmentsService';

const EditAssignmentPage = () => {
  const { classId, assignmentId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    due_date: '',
    due_time: '',
    status: 'published'
  });

  useEffect(() => {
    fetchAssignment();
  }, [assignmentId]);

  const fetchAssignment = async () => {
    try {
      setLoading(true);
      const response = await assignmentsService.getAssignmentDetails(assignmentId);
      if (response.success) {
        const assignmentData = response.data.assignment;
        setAssignment(assignmentData);
        
        // Parse due date and time
        let dueDate = '';
        let dueTime = '';
        if (assignmentData.due_date) {
          const date = new Date(assignmentData.due_date);
          dueDate = date.toISOString().split('T')[0];
          dueTime = date.toTimeString().slice(0, 5);
        }
        
        setFormData({
          title: assignmentData.title || '',
          description: assignmentData.description || '',
          due_date: dueDate,
          due_time: dueTime,
          status: assignmentData.status || 'published'
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to load assignment',
          variant: 'destructive',
        });
        navigate(`/teacher/classes/${classId}`);
      }
    } catch (error) {
      console.error('Error fetching assignment:', error);
      toast({
        title: 'Error',
        description: 'Failed to load assignment',
        variant: 'destructive',
      });
      navigate(`/teacher/classes/${classId}`);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter an assignment title',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSaving(true);
      
      // Combine date and time if both are provided
      let dueDateTime = null;
      if (formData.due_date && formData.due_time) {
        dueDateTime = `${formData.due_date}T${formData.due_time}`;
      } else if (formData.due_date) {
        dueDateTime = `${formData.due_date}T23:59`; // Default to end of day if no time specified
      }

      const updateData = {
        title: formData.title,
        description: formData.description,
        due_date: dueDateTime,
        status: formData.status
      };

      const response = await assignmentsService.updateAssignment(assignmentId, updateData);
      
      if (response.success) {
        toast({
          title: 'Success',
          description: 'Assignment updated successfully',
        });
        navigate(`/teacher/classes/${classId}/assignments/${assignmentId}`);
      } else {
        toast({
          title: 'Error',
          description: response.message || 'Failed to update assignment',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error updating assignment:', error);
      toast({
        title: 'Error',
        description: 'Failed to update assignment. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-semibold mb-2">Assignment not found</h3>
        <p className="text-muted-foreground mb-4">
          The assignment you're trying to edit doesn't exist or you don't have access to it.
        </p>
        <Button onClick={() => navigate(`/teacher/classes/${classId}`)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Class
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/teacher/classes/${classId}/assignments/${assignmentId}`)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Assignment
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Edit Assignment</h1>
            <p className="text-muted-foreground">
              Update assignment details
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Assignment Details</CardTitle>
            <CardDescription>
              Update the assignment information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="title">Assignment Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter assignment title"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <div className="mt-2">
                  <RichTextEditor
                    value={formData.description}
                    onChange={(value) => handleInputChange('description', value)}
                    placeholder="Enter assignment description..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="due_date">Due Date</Label>
                  <Input
                    id="due_date"
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => handleInputChange('due_date', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="due_time">Due Time</Label>
                  <Input
                    id="due_time"
                    type="time"
                    value={formData.due_time}
                    onChange={(e) => handleInputChange('due_time', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md bg-background"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              <div className="flex items-center gap-4 pt-4">
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => navigate(`/teacher/classes/${classId}/assignments/${assignmentId}`)}
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Questions Info */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Questions</CardTitle>
            <CardDescription>
              Questions cannot be modified after assignment creation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                This assignment has {assignment.questions?.length || 0} questions.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                To modify questions, you would need to create a new assignment.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EditAssignmentPage;
