import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { 
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../ui/tabs';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../hooks/use-toast';
import learningPathService from '../../services/learningPathService';
import { Skeleton } from '../ui/skeleton';

const LearningPathList = ({ onPathSelect, onBackToDashboard }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [learningPaths, setLearningPaths] = useState([]);
  const [publishedPaths, setPublishedPaths] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState({});

  useEffect(() => {
    fetchLearningPaths();
  }, []);

  const fetchLearningPaths = async () => {
    try {
      setLoading(true);
      
      // Fetch enrolled learning paths
      const enrolledResponse = await learningPathService.getAllLearningPaths();
      setLearningPaths(enrolledResponse.data || []);

      // Fetch published paths for browsing (students only)
      if (user?.role === 'student') {
        const publishedResponse = await learningPathService.getPublishedLearningPaths();
        setPublishedPaths(publishedResponse.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch learning paths:', error);
      toast({
        title: "Error",
        description: "Failed to load learning paths. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleJoinPath = async (pathId) => {
    try {
      setEnrolling(prev => ({ ...prev, [pathId]: true }));
      
      await learningPathService.joinLearningPath(pathId);
      
      toast({
        title: "Success!",
        description: "You've successfully joined the learning path.",
      });
      
      // Refresh the list
      await fetchLearningPaths();
    } catch (error) {
      console.error('Failed to join learning path:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to join learning path. Please try again.",
        variant: "destructive",
      });
    } finally {
      setEnrolling(prev => ({ ...prev, [pathId]: false }));
    }
  };

  const handleLeavePath = async (pathId) => {
    try {
      await learningPathService.leaveLearningPath(pathId);
      
      toast({
        title: "Success!",
        description: "You've left the learning path.",
      });
      
      // Refresh the list
      await fetchLearningPaths();
    } catch (error) {
      console.error('Failed to leave learning path:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to leave learning path. Please try again.",
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

  const getRoleSpecificPaths = () => {
    switch (user?.role) {
      case 'admin':
        return learningPaths; // Admin can see all paths
      case 'teacher':
        return learningPaths.filter(path => 
          path.created_by === user.user_id || path.visibility === 'published'
        );
      case 'student':
        return learningPaths; // Students see enrolled paths
      default:
        return learningPaths;
    }
  };

  const getAvailablePaths = () => {
    if (user?.role === 'student') {
      return publishedPaths;
    }
    return [];
  };

  const rolePaths = getRoleSpecificPaths();
  const availablePaths = getAvailablePaths();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold mb-2">Learning Paths</h1>
          <p className="text-muted-foreground">
            {user?.role === 'admin' && "Manage all learning paths on the platform."}
            {user?.role === 'teacher' && "Create and manage your learning paths."}
            {user?.role === 'student' && "Discover and join structured learning journeys."}
          </p>
        </div>
        {onBackToDashboard && (
          <Button onClick={onBackToDashboard} variant="outline">
            Back to Dashboard
          </Button>
        )}
        {!onBackToDashboard && (
          <Button onClick={() => navigate('/dashboard')} variant="outline">
            Back to Dashboard
          </Button>
        )}
      </div>

      {/* Role-Specific Welcome */}
      <Card>
        <CardHeader>
          <CardTitle>Welcome, {user?.name}!</CardTitle>
          <CardDescription>
            {user?.role === 'admin' && "You can view and manage all learning paths on the platform."}
            {user?.role === 'teacher' && "Create structured learning experiences for your students."}
            {user?.role === 'student' && "Track your progress across all enrolled learning paths."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {rolePaths.length}
              </div>
              <div className="text-sm text-muted-foreground">
                {user?.role === 'student' ? 'Enrolled Paths' : 'Total Paths'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {rolePaths.filter(p => p.visibility === 'published').length}
              </div>
              <div className="text-sm text-muted-foreground">Published Paths</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {rolePaths.filter(p => p.visibility === 'draft').length}
              </div>
              <div className="text-sm text-muted-foreground">Draft Paths</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Learning Paths */}
      <Tabs defaultValue="enrolled" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="enrolled">
            {user?.role === 'student' ? 'My Learning Paths' : 'Learning Paths'}
          </TabsTrigger>
          {user?.role === 'student' && (
            <TabsTrigger value="available">Available Paths</TabsTrigger>
          )}
        </TabsList>
        
        <TabsContent value="enrolled" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">
              {user?.role === 'student' ? 'Enrolled Learning Paths' : 'Learning Paths'}
            </h2>
            {user?.role !== 'student' && (
              <Button onClick={() => navigate('/learning-paths/create')}>
                Create New Path
              </Button>
            )}
          </div>
          
          {rolePaths.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rolePaths.map((path) => (
                <Card key={path.path_id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex gap-2">
                        {getVisibilityBadge(path.visibility)}
                        {path.created_by === user?.user_id && (
                          <Badge variant="outline">My Path</Badge>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">Modules</div>
                        <div className="font-medium">{path.modules?.length || 0}</div>
                      </div>
                    </div>
                    <CardTitle className="text-lg">{path.title}</CardTitle>
                    <CardDescription>{path.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Path Details */}
                      <div className="text-sm space-y-2">
                        <div className="flex justify-between">
                          <span>Created by:</span>
                          <span className="font-medium">{path.creator?.name || 'Unknown'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Created:</span>
                          <span className="font-medium">
                            {new Date(path.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        {path.enrolled_students && (
                          <div className="flex justify-between">
                            <span>Students:</span>
                            <span className="font-medium">{path.enrolled_students.length}</span>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <Button 
                          className="flex-1"
                          onClick={() => navigate(`/learning-paths/${path.path_id}`)}
                        >
                          {user?.role === 'student' ? 'Continue Learning' : 'View Details'}
                        </Button>
                        {user?.role === 'student' && (
                          <Button 
                            variant="outline"
                            onClick={() => handleLeavePath(path.path_id)}
                          >
                            Leave
                          </Button>
                        )}
                        {user?.role !== 'student' && path.created_by === user?.user_id && (
                          <Button 
                            variant="outline"
                            onClick={() => navigate(`/learning-paths/${path.path_id}/edit`)}
                          >
                            Edit
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p className="mb-4">
                {user?.role === 'student' 
                  ? "You haven't enrolled in any learning paths yet."
                  : "No learning paths found."
                }
              </p>
              {user?.role === 'student' && (
                <Button onClick={() => document.querySelector('[data-value="available"]').click()}>
                  Browse Available Paths
                </Button>
              )}
              {user?.role !== 'student' && (
                <Button onClick={() => navigate('/learning-paths/create')}>
                  Create Your First Path
                </Button>
              )}
            </div>
          )}
        </TabsContent>
        
        {user?.role === 'student' && (
          <TabsContent value="available" className="space-y-4">
            <h2 className="text-xl font-semibold">Available Learning Paths</h2>
            {availablePaths.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availablePaths.map((path) => (
                  <Card key={path.path_id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex gap-2">
                          {getVisibilityBadge(path.visibility)}
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">Modules</div>
                          <div className="font-medium">{path.modules?.length || 0}</div>
                        </div>
                      </div>
                      <CardTitle className="text-lg">{path.title}</CardTitle>
                      <CardDescription>{path.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Path Details */}
                        <div className="text-sm space-y-2">
                          <div className="flex justify-between">
                            <span>Created by:</span>
                            <span className="font-medium">{path.creator?.name || 'Unknown'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Created:</span>
                            <span className="font-medium">
                              {new Date(path.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          <Button 
                            className="flex-1"
                            onClick={() => handleJoinPath(path.path_id)}
                            disabled={enrolling[path.path_id]}
                          >
                            {enrolling[path.path_id] ? 'Joining...' : 'Join Path'}
                          </Button>
                          <Button 
                            variant="outline"
                            onClick={() => navigate(`/learning-paths/${path.path_id}`)}
                          >
                            Learn More
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No available learning paths found.</p>
              </div>
            )}
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default LearningPathList;
