import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { useToast } from '../../hooks/use-toast';
import learningPathService from '../../services/learningPathService';
import { ArrowLeft, Save, Plus } from 'lucide-react';

const CreateModule = () => {
  const { pathId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    order_index: 1
  });
  const [loading, setLoading] = useState(false);
  const [learningPath, setLearningPath] = useState(null);
  const [modules, setModules] = useState([]);

  useEffect(() => {
    fetchLearningPathDetails();
  }, [pathId]);

  const fetchLearningPathDetails = async () => {
    try {
      const response = await learningPathService.getLearningPath(pathId);
      setLearningPath(response.data);
      
      // Fetch existing modules to set the correct order_index
      const modulesResponse = await learningPathService.getModules(pathId);
      setModules(modulesResponse.data || []);
      
      // Set the order_index to the next available number
      const nextOrderIndex = modulesResponse.data ? modulesResponse.data.length + 1 : 1;
      setFormData(prev => ({
        ...prev,
        order_index: nextOrderIndex
      }));
    } catch (error) {
      console.error('Failed to fetch learning path details:', error);
      toast({
        title: "Error",
        description: "Failed to load learning path details. Please try again.",
        variant: "destructive",
      });
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
        title: "Validation Error",
        description: "Module title is required.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      const response = await learningPathService.createModule(pathId, formData);
      
      toast({
        title: "Success!",
        description: "Module created successfully.",
      });
      
      // Navigate to the module detail page
      navigate(`/learning-paths/${pathId}/modules/${response.data.module_id}`);
    } catch (error) {
      console.error('Failed to create module:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create module. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!learningPath) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 bg-muted animate-pulse rounded" />
          <div className="h-8 w-64 bg-muted animate-pulse rounded" />
        </div>
        <Card>
          <CardHeader>
            <div className="h-6 w-48 bg-muted animate-pulse rounded" />
            <div className="h-4 w-96 bg-muted animate-pulse rounded" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="h-10 w-full bg-muted animate-pulse rounded" />
              <div className="h-20 w-full bg-muted animate-pulse rounded" />
              <div className="h-10 w-32 bg-muted animate-pulse rounded" />
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
          onClick={() => navigate(`/learning-paths/${pathId}`)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Create New Module</h1>
          <p className="text-muted-foreground">
            Add a new module to "{learningPath.title}"
          </p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Module Details</CardTitle>
          <CardDescription>
            Fill in the details for your new module
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Module Title *</Label>
              <Input
                id="title"
                type="text"
                placeholder="e.g., Introduction to Programming"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe what students will learn in this module..."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="order_index">Order Index</Label>
              <Input
                id="order_index"
                type="number"
                min="1"
                placeholder="1"
                value={formData.order_index}
                onChange={(e) => handleInputChange('order_index', parseInt(e.target.value) || 1)}
              />
              <p className="text-sm text-muted-foreground">
                The order in which this module appears in the learning path
              </p>
            </div>

            <div className="flex gap-4">
              <Button 
                type="submit" 
                disabled={loading}
                className="flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Create Module
                  </>
                )}
              </Button>
              
              <Button 
                type="button" 
                variant="outline"
                onClick={() => navigate(`/learning-paths/${pathId}`)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Existing Modules */}
      {modules.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Existing Modules</CardTitle>
            <CardDescription>
              Current modules in this learning path (ordered by index)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {modules
                .sort((a, b) => a.order_index - b.order_index)
                .map((module, index) => (
                  <div key={module.module_id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                      {module.order_index}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{module.title}</p>
                      {module.description && (
                        <p className="text-sm text-muted-foreground">{module.description}</p>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {module.questions?.length || 0} questions
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Learning Path Info */}
      <Card>
        <CardHeader>
          <CardTitle>Learning Path Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p><strong>Path:</strong> {learningPath.title}</p>
            <p><strong>Description:</strong> {learningPath.description}</p>
            <p><strong>Visibility:</strong> {learningPath.visibility}</p>
            <p><strong>Created by:</strong> {learningPath.creator?.name}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateModule;
