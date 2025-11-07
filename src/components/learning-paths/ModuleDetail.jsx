import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { useToast } from '../../hooks/use-toast';
import learningPathService from '../../services/learningPathService';
import { Skeleton } from '../ui/skeleton';
import { ArrowLeft, BookOpen, Plus, Edit, Trash2, Play, CheckCircle, ArrowUpDown } from 'lucide-react';

const ModuleDetail = () => {
  const { pathId, moduleId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [module, setModule] = useState(null);
  const [learningPath, setLearningPath] = useState(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(null);

  useEffect(() => {
    if (pathId && moduleId) {
      fetchModuleDetails();
    }
  }, [pathId, moduleId]);

  const fetchModuleDetails = async () => {
    try {
      setLoading(true);
      
      // Fetch module details
      const moduleResponse = await learningPathService.getModule(pathId, moduleId);
      setModule(moduleResponse.data);
      
      // Fetch learning path details
      const pathResponse = await learningPathService.getLearningPath(pathId);
      setLearningPath(pathResponse.data);
      
      // Fetch progress for students
      if (user?.role === 'student') {
        try {
          const progressResponse = await learningPathService.getPathProgress(pathId);
          const moduleProgress = progressResponse.data.modules.find(m => m.module_id === parseInt(moduleId));
          setProgress(moduleProgress);
        } catch (error) {
          console.log('No progress found for this module');
        }
      }
    } catch (error) {
      console.error('Failed to fetch module details:', error);
      toast({
        title: "Error",
        description: "Failed to load module details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleQuestionComplete = async (questionId, isCompleted) => {
    try {
      await learningPathService.updateQuestionProgress(pathId, moduleId, questionId, isCompleted);
      
      toast({
        title: "Success!",
        description: isCompleted ? "Question marked as completed!" : "Question marked as incomplete.",
      });
      
      // Refresh progress
      await fetchModuleDetails();
    } catch (error) {
      console.error('Failed to update question progress:', error);
      toast({
        title: "Error",
        description: "Failed to update question progress. Please try again.",
        variant: "destructive",
      });
    }
  };

  const canEdit = user?.role === 'admin' || learningPath?.created_by === user?.user_id;
  const isStudent = user?.role === 'student';
  const isEnrolled = learningPath?.is_enrolled || false;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-64" />
        </div>
        <Skeleton className="h-64 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  if (!module || !learningPath) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold mb-4">Module Not Found</h2>
        <p className="text-muted-foreground mb-4">
          The module you're looking for doesn't exist or you don't have access to it.
        </p>
        <Button onClick={() => navigate(`/learning-paths/${pathId}`)}>
          Back to Learning Path
        </Button>
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
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-3xl font-bold">{module.title}</h1>
            {canEdit && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/learning-paths/${pathId}/modules/${moduleId}/edit`)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    if (confirm('Are you sure you want to delete this module?')) {
                      // Handle delete
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            )}
          </div>
          <p className="text-muted-foreground">{module.description}</p>
        </div>
      </div>

      {/* Module Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <div>
                <div className="text-2xl font-bold">{module.questions?.length || 0}</div>
                <div className="text-sm text-muted-foreground">Questions</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 rounded-full bg-primary" />
              <div>
                <div className="text-2xl font-bold">{module.resources?.length || 0}</div>
                <div className="text-sm text-muted-foreground">Resources</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {isStudent && isEnrolled && progress && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <div className="text-2xl font-bold">{progress.completion_percentage}%</div>
                  <div className="text-sm text-muted-foreground">Complete</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Progress Overview for Students */}
      {isStudent && isEnrolled && progress && (
        <Card>
          <CardHeader>
            <CardTitle>Your Progress</CardTitle>
            <CardDescription>
              Track your completion in this module
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Module Progress</span>
                  <span className="font-medium">{progress.completion_percentage}%</span>
                </div>
                <Progress value={progress.completion_percentage} className="mb-2" />
                <div className="text-xs text-muted-foreground">
                  {progress.completed_questions} of {progress.total_questions} questions completed
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resources */}
      {module.resources && module.resources.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Learning Resources</CardTitle>
            <CardDescription>
              Study materials and resources for this module
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {module.resources.map((resource) => (
                <Card key={resource.resource_id} className="border-l-4 border-l-blue-500">
                  <CardHeader>
                    <CardTitle className="text-lg">{resource.title}</CardTitle>
                    <CardDescription>{resource.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">{resource.type}</Badge>
                      {resource.url && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={resource.url} target="_blank" rel="noopener noreferrer">
                            Open Resource
                          </a>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Questions */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Practice Questions</CardTitle>
              <CardDescription>
                {module.questions?.length > 0 
                  ? 'Complete these questions to master the module content'
                  : 'No questions have been added to this module yet'
                }
              </CardDescription>
            </div>
            {canEdit && (
              <div className="flex gap-2">
                <Button onClick={() => navigate(`/learning-paths/${pathId}/modules/${moduleId}/add-questions`)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Questions
                </Button>
                {module.questions && module.questions.length > 1 && (
                  <Button 
                    variant="outline"
                    onClick={() => navigate(`/learning-paths/${pathId}/modules/${moduleId}/reorder-questions`)}
                  >
                    <ArrowUpDown className="h-4 w-4 mr-2" />
                    Reorder Questions
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {module.questions && module.questions.length > 0 ? (
            <div className="space-y-4">
              {module.questions.map((question, index) => {
                const questionProgress = progress?.questions?.find(q => q.question_id === question.question_id);
                const isCompleted = questionProgress?.is_completed || false;
                
                return (
                  <Card key={question.question_id} className={`border-l-4 ${isCompleted ? 'border-l-green-500' : 'border-l-gray-300'}`}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle className="text-lg">
                            Question {index + 1}: {question.question_title}
                          </CardTitle>
                          {/* Description hidden as requested */}
                        </div>
                        <div className="flex items-center gap-2">
                          {isCompleted && (
                            <Badge variant="default" className="bg-green-600">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Completed
                            </Badge>
                          )}
                          <Badge variant="outline">{question.difficulty}</Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex gap-2">
                          <Button 
                            variant="outline"
                            onClick={() => navigate(`/problems/${question.question_id}?backTo=learning-path&pathId=${pathId}&moduleId=${moduleId}`)}
                          >
                            <Play className="h-4 w-4 mr-2" />
                            Solve Question
                          </Button>
                          {/* Mark Complete button removed as requested */}
                        </div>
                        {questionProgress?.completed_at && (
                          <div className="text-sm text-muted-foreground">
                            Completed: {new Date(questionProgress.completed_at).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p className="mb-4">No questions have been added to this module yet.</p>
              {canEdit && (
                <Button onClick={() => navigate(`/learning-paths/${pathId}/modules/${moduleId}/add-questions`)}>
                  Add First Question
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ModuleDetail;
