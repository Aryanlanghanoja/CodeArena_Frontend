import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { useToast } from '../../hooks/use-toast';
import learningPathService from '../../services/learningPathService';
import { Skeleton } from '../ui/skeleton';
import { ArrowLeft, BookOpen, Users, Calendar, Edit, Trash2, Eye, EyeOff, Plus } from 'lucide-react';

const LearningPathDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [learningPath, setLearningPath] = useState(null);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (id) {
      fetchLearningPathDetails();
    }
  }, [id]);

  const fetchLearningPathDetails = async () => {
    try {
      setLoading(true);
      
      // Fetch learning path details
      const pathResponse = await learningPathService.getLearningPath(id);
      setLearningPath(pathResponse.data);
      
      // Fetch modules
      const modulesResponse = await learningPathService.getModules(id);
      setModules(modulesResponse.data || []);
      
      // Fetch progress for students
      if (user?.role === 'student') {
        try {
          const progressResponse = await learningPathService.getPathProgress(id);
          setProgress(progressResponse.data);
        } catch (error) {
          // Progress might not exist if not enrolled
          console.log('No progress found for this path');
        }
      }
      
      // Fetch stats for teachers/admins
      if (user?.role !== 'student' && learningPath?.created_by === user?.user_id) {
        try {
          const statsResponse = await learningPathService.getPathStats(id);
          setStats(statsResponse.data);
        } catch (error) {
          console.log('No stats available');
        }
      }
    } catch (error) {
      console.error('Failed to fetch learning path details:', error);
      toast({
        title: "Error",
        description: "Failed to load learning path details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleJoinPath = async () => {
    try {
      await learningPathService.joinLearningPath(id);
      toast({
        title: "Success!",
        description: "You've successfully joined the learning path.",
      });
      // Refresh the page to show updated data
      await fetchLearningPathDetails();
    } catch (error) {
      console.error('Failed to join learning path:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to join learning path. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleLeavePath = async () => {
    try {
      await learningPathService.leaveLearningPath(id);
      toast({
        title: "Success!",
        description: "You've left the learning path.",
      });
      // Refresh the page to show updated data
      await fetchLearningPathDetails();
    } catch (error) {
      console.error('Failed to leave learning path:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to leave learning path. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleToggleVisibility = async () => {
    if (!learningPath) return;
    
    try {
      const newVisibility = learningPath.visibility === 'published' ? 'draft' : 'published';
      await learningPathService.updateLearningPath(id, { visibility: newVisibility });
      
      setLearningPath(prev => ({ ...prev, visibility: newVisibility }));
      
      toast({
        title: "Success!",
        description: `Learning path is now ${newVisibility}.`,
      });
    } catch (error) {
      console.error('Failed to update visibility:', error);
      toast({
        title: "Error",
        description: "Failed to update learning path visibility. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeletePath = async () => {
    if (!confirm('Are you sure you want to delete this learning path? This action cannot be undone.')) {
      return;
    }
    
    try {
      await learningPathService.deleteLearningPath(id);
      toast({
        title: "Success!",
        description: "Learning path deleted successfully.",
      });
      navigate('/learning-paths');
    } catch (error) {
      console.error('Failed to delete learning path:', error);
      toast({
        title: "Error",
        description: "Failed to delete learning path. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getVisibilityBadge = (visibility) => {
    const variants = {
      published: 'default',
      draft: 'secondary'
    };
    
    return (
      <Badge variant={variants[visibility] || 'secondary'}>
        {visibility}
      </Badge>
    );
  };

  const isEnrolled = learningPath?.is_enrolled || false;
  const canEdit = user?.role === 'admin' || learningPath?.created_by === user?.user_id;
  const isStudent = user?.role === 'student';

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

  if (!learningPath) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold mb-4">Learning Path Not Found</h2>
        <p className="text-muted-foreground mb-4">
          The learning path you're looking for doesn't exist or you don't have access to it.
        </p>
        <Button onClick={() => navigate('/learning-paths')}>
          Back to Learning Paths
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
          onClick={() => navigate('/learning-paths')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-3xl font-bold">{learningPath.title}</h1>
            {getVisibilityBadge(learningPath.visibility)}
            {canEdit && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleToggleVisibility}
                >
                  {learningPath.visibility === 'published' ? (
                    <>
                      <EyeOff className="h-4 w-4 mr-2" />
                      Unpublish
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4 mr-2" />
                      Publish
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/learning-paths/${id}/edit`)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDeletePath}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            )}
          </div>
          <p className="text-muted-foreground">{learningPath.description}</p>
        </div>
      </div>

      {/* Path Info */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <div>
                <div className="text-2xl font-bold">{modules.length}</div>
                <div className="text-sm text-muted-foreground">Modules</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <div>
                <div className="text-2xl font-bold">
                  {stats?.total_students || learningPath.enrolled_students?.length || 0}
                </div>
                <div className="text-sm text-muted-foreground">Students</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <div>
                <div className="text-2xl font-bold">
                  {new Date(learningPath.created_at).toLocaleDateString()}
                </div>
                <div className="text-sm text-muted-foreground">Created</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 rounded-full bg-primary" />
              <div>
                <div className="text-2xl font-bold">{learningPath.creator?.name || 'Unknown'}</div>
                <div className="text-sm text-muted-foreground">Creator</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Student Actions */}
      {isStudent && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  {isEnrolled ? 'You are enrolled in this learning path' : 'Join this learning path'}
                </h3>
                <p className="text-muted-foreground">
                  {isEnrolled 
                    ? 'Continue your learning journey and track your progress.'
                    : 'Start your learning journey with structured modules and practice questions.'
                  }
                </p>
              </div>
              <div className="flex gap-2">
                {isEnrolled ? (
                  <Button onClick={handleLeavePath} variant="outline">
                    Leave Path
                  </Button>
                ) : (
                  <Button onClick={handleJoinPath}>
                    Join Path
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Progress Overview for Students */}
      {isStudent && isEnrolled && progress && (
        <Card>
          <CardHeader>
            <CardTitle>Your Progress</CardTitle>
            <CardDescription>
              Track your completion across all modules and questions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Overall Progress</span>
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

      {/* Modules */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Modules</CardTitle>
              <CardDescription>
                {modules.length > 0 
                  ? 'Explore the structured learning modules in this path'
                  : 'No modules have been added to this learning path yet'
                }
              </CardDescription>
            </div>
            {canEdit && (
              <div className="flex gap-2">
                {modules.length > 1 && (
                  <Button 
                    variant="outline"
                    onClick={() => navigate(`/learning-paths/${id}/modules/reorder`)}
                    className="flex items-center gap-2"
                  >
                    <Edit className="h-4 w-4" />
                    Reorder
                  </Button>
                )}
                <Button 
                  onClick={() => navigate(`/learning-paths/${id}/modules/create`)}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Module
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {modules.length > 0 ? (
            <div className="space-y-4">
              {modules.map((module, index) => (
                <Card key={module.module_id} className="border-l-4 border-l-primary">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">
                          Module {index + 1}: {module.title}
                        </CardTitle>
                        <CardDescription>{module.description}</CardDescription>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">Questions</div>
                        <div className="font-medium">{module.questions?.length || 0}</div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Module Progress for Students */}
                      {isStudent && isEnrolled && module.completion_percentage !== undefined && (
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span>Your Progress</span>
                            <span className="font-medium">{module.completion_percentage}%</span>
                          </div>
                          <Progress value={module.completion_percentage} className="mb-2" />
                          <div className="text-xs text-muted-foreground">
                            {module.completed_questions} of {module.total_questions} questions completed
                          </div>
                        </div>
                      )}

                      {/* Questions Preview */}
                      {module.questions && module.questions.length > 0 && (
                        <div>
                          <div className="text-sm font-medium mb-2">Questions:</div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {module.questions.slice(0, 4).map((question) => (
                              <div key={question.question_id} className="text-sm p-2 bg-muted rounded">
                                {question.question_title}
                              </div>
                            ))}
                            {module.questions.length > 4 && (
                              <div className="text-sm p-2 bg-muted rounded text-muted-foreground">
                                +{module.questions.length - 4} more questions
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Resources */}
                      {module.resources && module.resources.length > 0 && (
                        <div>
                          <div className="text-sm font-medium mb-2">Resources:</div>
                          <div className="flex flex-wrap gap-2">
                            {module.resources.map((resource) => (
                              <Badge key={resource.resource_id} variant="outline">
                                {resource.title}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Action Button */}
                      <div className="flex justify-end">
                        <Button 
                          variant="outline"
                          onClick={() => navigate(`/learning-paths/${id}/modules/${module.module_id}`)}
                        >
                          {isStudent && isEnrolled ? 'Continue Module' : 'View Module'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p className="mb-4">No modules have been added to this learning path yet.</p>
              {canEdit && (
                <Button onClick={() => navigate(`/learning-paths/${id}/modules/create`)}>
                  Add First Module
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Student Statistics for Teachers/Admins */}
      {stats && stats.student_progress && stats.student_progress.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Student Progress</CardTitle>
            <CardDescription>
              Overview of student progress in this learning path
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.student_progress.map((student) => (
                <div key={student.student_id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-medium">{student.student_name}</div>
                    <div className="text-sm text-muted-foreground">{student.student_email}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{student.completion_percentage}%</div>
                    <div className="text-xs text-muted-foreground">
                      {student.completed_questions}/{student.total_questions} questions
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LearningPathDetail;
