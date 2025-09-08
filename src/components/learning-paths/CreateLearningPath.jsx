import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useToast } from '../../hooks/use-toast';
import learningPathService from '../../services/learningPathService';
import { ArrowLeft, Save } from 'lucide-react';

const CreateLearningPath = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const isEditMode = Boolean(id);
  
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    description: '',
    visibility: 'draft'
  });
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditMode);

  // Load existing data when in edit mode
  useEffect(() => {
    if (isEditMode && id) {
      const loadLearningPath = async () => {
        try {
          setInitialLoading(true);
          const response = await learningPathService.getLearningPath(id);
          const pathData = response.data;
          
          setFormData({
            name: pathData.name || '',
            title: pathData.title || '',
            description: pathData.description || '',
            visibility: pathData.visibility || 'draft'
          });
        } catch (error) {
          console.error('Error loading learning path:', error);
          toast({
            title: "Error",
            description: "Failed to load learning path details.",
            variant: "destructive",
          });
          navigate('/learning-paths');
        } finally {
          setInitialLoading(false);
        }
      };
      
      loadLearningPath();
    }
  }, [isEditMode, id, navigate, toast]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.title.trim()) {
      toast({
        title: "Validation Error",
        description: "Name and title are required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      let response;
      if (isEditMode) {
        response = await learningPathService.updateLearningPath(id, formData);
      } else {
        response = await learningPathService.createLearningPath(formData);
      }
      
      toast({
        title: "Success!",
        description: isEditMode ? "Learning path updated successfully." : "Learning path created successfully.",
      });
      
      // Navigate to the learning path
      if (isEditMode) {
        navigate(`/learning-paths/${id}`);
      } else {
        navigate(`/learning-paths/${response.data.path_id}`);
      }
    } catch (error) {
      console.error(`Failed to ${isEditMode ? 'update' : 'create'} learning path:`, error);
      toast({
        title: "Error",
        description: error.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} learning path. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => navigate('/learning-paths')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Edit Learning Path</h1>
            <p className="text-muted-foreground">Loading learning path details...</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          size="icon"
          onClick={() => navigate('/learning-paths')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">
            {isEditMode ? 'Edit Learning Path' : 'Create Learning Path'}
          </h1>
          <p className="text-muted-foreground">
            {isEditMode 
              ? 'Update the details of your learning path'
              : 'Create a structured learning journey for your students'
            }
          </p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Learning Path Details</CardTitle>
          <CardDescription>
            {isEditMode 
              ? 'Update the basic information for your learning path'
              : 'Provide the basic information for your new learning path'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name Field */}
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="e.g., programming-fundamentals"
                  required
                />
                <p className="text-sm text-muted-foreground">
                  A short, URL-friendly name for the learning path
                </p>
              </div>

              {/* Title Field */}
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="e.g., Programming Fundamentals"
                  required
                />
                <p className="text-sm text-muted-foreground">
                  The display title for your learning path
                </p>
              </div>
            </div>

            {/* Description Field */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe what students will learn in this learning path..."
                rows={4}
              />
              <p className="text-sm text-muted-foreground">
                Provide a detailed description of the learning path content and objectives
              </p>
            </div>

            {/* Visibility Field */}
            <div className="space-y-2">
              <Label htmlFor="visibility">Visibility</Label>
              <Select
                value={formData.visibility}
                onValueChange={(value) => handleInputChange('visibility', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select visibility" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft - Only you can see this path</SelectItem>
                  <SelectItem value="published">Published - Students can browse and join</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Draft paths are only visible to you. Published paths can be discovered and joined by students.
              </p>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-4 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/learning-paths')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    {isEditMode ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {isEditMode ? 'Update Learning Path' : 'Create Learning Path'}
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Help Section */}
      <Card>
        <CardHeader>
          <CardTitle>Next Steps</CardTitle>
          <CardDescription>
            After creating your learning path, you can:
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-primary mb-2">1</div>
              <h3 className="font-semibold mb-2">Add Modules</h3>
              <p className="text-sm text-muted-foreground">
                Create structured modules to organize your content
              </p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-primary mb-2">2</div>
              <h3 className="font-semibold mb-2">Add Questions</h3>
              <p className="text-sm text-muted-foreground">
                Select practice questions from your question bank
              </p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-primary mb-2">3</div>
              <h3 className="font-semibold mb-2">Add Resources</h3>
              <p className="text-sm text-muted-foreground">
                Attach videos, articles, and other learning materials
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateLearningPath;
