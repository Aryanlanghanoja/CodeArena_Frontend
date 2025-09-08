import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { useToast } from '../../hooks/use-toast';
import learningPathService from '../../services/learningPathService';
import { Skeleton } from '../ui/skeleton';
import { ArrowLeft, ArrowUp, ArrowDown, Save, RotateCcw } from 'lucide-react';

const ReorderModules = () => {
  const { pathId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [learningPath, setLearningPath] = useState(null);

  useEffect(() => {
    fetchData();
  }, [pathId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch learning path details
      const pathResponse = await learningPathService.getLearningPath(pathId);
      setLearningPath(pathResponse.data);
      
      // Fetch modules
      const modulesResponse = await learningPathService.getModules(pathId);
      const sortedModules = (modulesResponse.data || []).sort((a, b) => a.order_index - b.order_index);
      setModules(sortedModules);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast({
        title: "Error",
        description: "Failed to load data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const moveModule = (index, direction) => {
    const newModules = [...modules];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex < 0 || targetIndex >= newModules.length) {
      return; // Can't move beyond boundaries
    }
    
    // Swap modules
    [newModules[index], newModules[targetIndex]] = [newModules[targetIndex], newModules[index]];
    
    // Update order_index for all modules
    newModules.forEach((module, idx) => {
      module.order_index = idx + 1;
    });
    
    setModules(newModules);
  };

  const resetOrder = () => {
    fetchData();
  };

  const saveOrder = async () => {
    try {
      setSaving(true);
      
      const moduleOrders = modules.map((module, index) => ({
        module_id: module.module_id,
        order_index: index + 1
      }));
      
      await learningPathService.reorderModules(pathId, moduleOrders);
      
      toast({
        title: "Success!",
        description: "Module order updated successfully.",
      });
      
      // Refresh the data
      await fetchData();
    } catch (error) {
      console.error('Failed to save module order:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to save module order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = () => {
    return modules.some((module, index) => module.order_index !== index + 1);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-64" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-96" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (modules.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => navigate(`/learning-paths/${pathId}`)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Reorder Modules</h1>
            <p className="text-muted-foreground">
              Reorder modules in "{learningPath?.title}"
            </p>
          </div>
        </div>

        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground mb-4">No modules found in this learning path.</p>
            <Button onClick={() => navigate(`/learning-paths/${pathId}/modules/create`)}>
              Add First Module
            </Button>
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
          <h1 className="text-3xl font-bold">Reorder Modules</h1>
          <p className="text-muted-foreground">
            Reorder modules in "{learningPath?.title}"
          </p>
        </div>
      </div>

      {/* Actions */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Module Order</CardTitle>
              <CardDescription>
                Drag modules up or down to reorder them. The order will be saved when you click "Save Order".
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={resetOrder}
                disabled={saving}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
              <Button 
                onClick={saveOrder}
                disabled={saving || !hasChanges()}
                className="flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Order
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {modules.map((module, index) => (
              <div key={module.module_id} className="flex items-center gap-4 p-4 border rounded-lg bg-card">
                <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                  {index + 1}
                </div>
                
                <div className="flex-1">
                  <h3 className="font-medium">{module.title}</h3>
                  {module.description && (
                    <p className="text-sm text-muted-foreground">{module.description}</p>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span>{module.questions?.length || 0} questions</span>
                    <span>{module.resources?.length || 0} resources</span>
                  </div>
                </div>
                
                <div className="flex flex-col gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => moveModule(index, 'up')}
                    disabled={index === 0}
                    className="h-8 w-8"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => moveModule(index, 'down')}
                    disabled={index === modules.length - 1}
                    className="h-8 w-8"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReorderModules;
