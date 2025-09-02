import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { 
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from './ui/tabs';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../hooks/use-toast';

const LearningPathsPage = ({ onPathSelect, onBackToDashboard }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [learningPaths, setLearningPaths] = useState([]);
  const [userProgress, setUserProgress] = useState({});
  const [loading, setLoading] = useState(true);

  // Mock data - replace with actual API calls
  useEffect(() => {
    const fetchLearningPaths = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockPaths = [
          {
            id: 1,
            title: 'Programming Fundamentals',
            description: 'Master the basics of programming with hands-on projects',
            difficulty: 'Beginner',
            duration: '8 weeks',
            topics: ['Variables', 'Control Structures', 'Functions', 'Data Types'],
            totalLessons: 24,
            totalExercises: 48,
            totalProjects: 6,
            prerequisites: [],
            suitableFor: ['student'],
            category: 'Programming',
            instructor: 'Dr. Sarah Smith',
            rating: 4.8,
            enrolledStudents: 156,
            completionRate: 78.5
          },
          {
            id: 2,
            title: 'Data Structures & Algorithms',
            description: 'Learn essential data structures and algorithmic thinking',
            difficulty: 'Intermediate',
            duration: '12 weeks',
            topics: ['Arrays', 'Linked Lists', 'Trees', 'Graphs', 'Sorting', 'Searching'],
            totalLessons: 36,
            totalExercises: 72,
            totalProjects: 8,
            prerequisites: ['Programming Fundamentals'],
            suitableFor: ['student'],
            category: 'Computer Science',
            instructor: 'Prof. John Davis',
            rating: 4.9,
            enrolledStudents: 89,
            completionRate: 65.2
          },
          {
            id: 3,
            title: 'Web Development Mastery',
            description: 'Build modern web applications from frontend to backend',
            difficulty: 'Intermediate',
            duration: '16 weeks',
            topics: ['HTML/CSS', 'JavaScript', 'React', 'Node.js', 'Databases'],
            totalLessons: 48,
            totalExercises: 96,
            totalProjects: 12,
            prerequisites: ['Programming Fundamentals'],
            suitableFor: ['student'],
            category: 'Web Development',
            instructor: 'Dr. Emily Brown',
            rating: 4.7,
            enrolledStudents: 203,
            completionRate: 71.3
          },
          {
            id: 4,
            title: 'Advanced Algorithm Design',
            description: 'Master complex algorithms and optimization techniques',
            difficulty: 'Advanced',
            duration: '14 weeks',
            topics: ['Dynamic Programming', 'Greedy Algorithms', 'Graph Algorithms', 'Complexity Analysis'],
            totalLessons: 42,
            totalExercises: 84,
            totalProjects: 10,
            prerequisites: ['Data Structures & Algorithms'],
            suitableFor: ['student'],
            category: 'Computer Science',
            instructor: 'Prof. John Davis',
            rating: 4.6,
            enrolledStudents: 45,
            completionRate: 58.9
          },
          {
            id: 5,
            title: 'Teaching Programming',
            description: 'Learn effective methods for teaching programming concepts',
            difficulty: 'Intermediate',
            duration: '10 weeks',
            topics: ['Pedagogy', 'Assessment Design', 'Student Engagement', 'Curriculum Planning'],
            totalLessons: 30,
            totalExercises: 45,
            totalProjects: 5,
            prerequisites: ['Programming Fundamentals'],
            suitableFor: ['teacher'],
            category: 'Education',
            instructor: 'Dr. Sarah Smith',
            rating: 4.8,
            enrolledStudents: 67,
            completionRate: 82.1
          },
          {
            id: 6,
            title: 'Platform Administration',
            description: 'Master the tools and techniques for managing CodeArena',
            difficulty: 'Advanced',
            duration: '6 weeks',
            topics: ['User Management', 'System Monitoring', 'Security', 'Performance Optimization'],
            totalLessons: 18,
            totalExercises: 24,
            totalProjects: 3,
            prerequisites: [],
            suitableFor: ['admin'],
            category: 'Administration',
            instructor: 'System Admin',
            rating: 4.9,
            enrolledStudents: 12,
            completionRate: 91.7
          }
        ];

        // Mock user progress data
        const mockProgress = {
          1: { completedLessons: 18, completedExercises: 35, completedProjects: 4, currentLesson: 19 },
          2: { completedLessons: 12, completedExercises: 24, completedProjects: 3, currentLesson: 13 },
          3: { completedLessons: 0, completedExercises: 0, completedProjects: 0, currentLesson: 1 },
          4: { completedLessons: 0, completedExercises: 0, completedProjects: 0, currentLesson: 1 },
          5: { completedLessons: 8, completedExercises: 12, completedProjects: 1, currentLesson: 9 },
          6: { completedLessons: 0, completedExercises: 0, completedProjects: 0, currentLesson: 1 }
        };
        
        setLearningPaths(mockPaths);
        setUserProgress(mockProgress);
      } catch (error) {
        console.error('Failed to fetch learning paths:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLearningPaths();
  }, []);

  const getDifficultyBadge = (difficulty) => {
    const variants = {
      Beginner: 'default',
      Intermediate: 'secondary',
      Advanced: 'destructive'
    };
    
    return (
      <Badge variant={variants[difficulty] || 'secondary'}>
        {difficulty}
      </Badge>
    );
  };

  const getCategoryBadge = (category) => {
    return (
      <Badge variant="outline">
        {category}
      </Badge>
    );
  };

  const calculateProgress = (pathId) => {
    const progress = userProgress[pathId];
    if (!progress) return 0;
    
    const totalItems = progress.completedLessons + progress.completedExercises + progress.completedProjects;
    const maxItems = learningPaths.find(p => p.id === pathId)?.totalLessons + 
                    learningPaths.find(p => p.id === pathId)?.totalExercises + 
                    learningPaths.find(p => p.id === pathId)?.totalProjects;
    
    return maxItems ? Math.round((totalItems / maxItems) * 100) : 0;
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'text-green-600';
    if (progress >= 60) return 'text-yellow-600';
    if (progress >= 40) return 'text-blue-600';
    return 'text-gray-600';
  };

  const filteredPaths = learningPaths.filter(path => {
    // Filter by role suitability
    if (path.suitableFor && !path.suitableFor.includes(user?.role)) {
      return false;
    }
    return true;
  });

  const getRoleSpecificPaths = () => {
    switch (user?.role) {
      case 'admin':
        return filteredPaths.filter(path => path.category === 'Administration');
      case 'teacher':
        return filteredPaths.filter(path => path.category === 'Education');
      case 'student':
        return filteredPaths.filter(path => path.category !== 'Administration' && path.category !== 'Education');
      default:
        return filteredPaths;
    }
  };

  const rolePaths = getRoleSpecificPaths();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
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
            Structured learning journeys designed for your role and skill level.
          </p>
        </div>
        <Button onClick={onBackToDashboard} variant="outline">
          Back to Dashboard
        </Button>
      </div>

      {/* Role-Specific Welcome */}
      <Card>
        <CardHeader>
          <CardTitle>Welcome, {user?.name}!</CardTitle>
          <CardDescription>
            Here are learning paths tailored for your role as a <strong>{user?.role}</strong>.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {rolePaths.filter(p => userProgress[p.id]).length}
              </div>
              <div className="text-sm text-muted-foreground">Enrolled Paths</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {rolePaths.filter(p => userProgress[p.id] && calculateProgress(p.id) === 100).length}
              </div>
              <div className="text-sm text-muted-foreground">Completed Paths</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {rolePaths.filter(p => userProgress[p.id]).reduce((sum, p) => sum + calculateProgress(p.id), 0) / 
                 Math.max(rolePaths.filter(p => userProgress[p.id]).length, 1)}
              </div>
              <div className="text-sm text-muted-foreground">Average Progress</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Learning Paths */}
      <Tabs defaultValue="enrolled" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="enrolled">My Learning Paths</TabsTrigger>
          <TabsTrigger value="available">Available Paths</TabsTrigger>
        </TabsList>
        
        <TabsContent value="enrolled" className="space-y-4">
          <h2 className="text-xl font-semibold">Enrolled Learning Paths</h2>
          {rolePaths.filter(p => userProgress[p.id]).length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rolePaths.filter(p => userProgress[p.id]).map((path) => {
                const progress = calculateProgress(path.id);
                const userPathProgress = userProgress[path.id];
                
                return (
                  <Card key={path.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex gap-2">
                          {getDifficultyBadge(path.difficulty)}
                          {getCategoryBadge(path.category)}
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">Rating</div>
                          <div className="font-medium">{path.rating}/5.0</div>
                        </div>
                      </div>
                      <CardTitle className="text-lg">{path.title}</CardTitle>
                      <CardDescription>{path.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Progress Section */}
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span>Progress</span>
                            <span className={`font-medium ${getProgressColor(progress)}`}>
                              {progress}%
                            </span>
                          </div>
                          <Progress value={progress} className="mb-2" />
                          <div className="text-xs text-muted-foreground">
                            {userPathProgress.completedLessons}/{path.totalLessons} lessons • 
                            {userPathProgress.completedExercises}/{path.totalExercises} exercises • 
                            {userPathProgress.completedProjects}/{path.totalProjects} projects
                          </div>
                        </div>

                        {/* Current Status */}
                        <div className="text-sm">
                          <div className="flex justify-between">
                            <span>Current Lesson:</span>
                            <span className="font-medium">{userPathProgress.currentLesson}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Duration:</span>
                            <span className="font-medium">{path.duration}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Instructor:</span>
                            <span className="font-medium">{path.instructor}</span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          <Button 
                            className="flex-1"
                            onClick={() => onPathSelect(path.id)}
                          >
                            Continue Learning
                          </Button>
                          <Button 
                            variant="outline"
                            onClick={() => navigate(`/learning-paths/${path.id}`)}
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p className="mb-4">You haven't enrolled in any learning paths yet.</p>
              <Button onClick={() => document.querySelector('[data-value="available"]').click()}>
                Browse Available Paths
              </Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="available" className="space-y-4">
          <h2 className="text-xl font-semibold">Available Learning Paths</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rolePaths.map((path) => {
              const isEnrolled = userProgress[path.id];
              const progress = isEnrolled ? calculateProgress(path.id) : 0;
              
              return (
                <Card key={path.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex gap-2">
                        {getDifficultyBadge(path.difficulty)}
                        {getCategoryBadge(path.category)}
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">Rating</div>
                        <div className="font-medium">{path.rating}/5.0</div>
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
                          <span>Duration:</span>
                          <span className="font-medium">{path.duration}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Lessons:</span>
                          <span className="font-medium">{path.totalLessons}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Exercises:</span>
                          <span className="font-medium">{path.totalExercises}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Projects:</span>
                          <span className="font-medium">{path.totalProjects}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Students:</span>
                          <span className="font-medium">{path.enrolledStudents}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Completion Rate:</span>
                          <span className="font-medium">{path.completionRate}%</span>
                        </div>
                      </div>

                      {/* Topics */}
                      <div>
                        <div className="text-sm font-medium mb-2">Topics Covered:</div>
                        <div className="flex flex-wrap gap-1">
                          {path.topics.slice(0, 4).map((topic, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {topic}
                            </Badge>
                          ))}
                          {path.topics.length > 4 && (
                            <Badge variant="outline" className="text-xs">
                              +{path.topics.length - 4} more
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Prerequisites */}
                      {path.prerequisites.length > 0 && (
                        <div>
                          <div className="text-sm font-medium mb-2">Prerequisites:</div>
                          <div className="text-sm text-muted-foreground">
                            {path.prerequisites.join(', ')}
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        {isEnrolled ? (
                          <>
                            <Button 
                              className="flex-1"
                              onClick={() => onPathSelect(path.id)}
                            >
                              Continue Learning
                            </Button>
                            <Button 
                              variant="outline"
                              onClick={() => navigate(`/learning-paths/${path.id}`)}
                            >
                              View Details
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button 
                              className="flex-1"
                              onClick={() => {
                                // Simulate enrollment
                                setUserProgress(prev => ({
                                  ...prev,
                                  [path.id]: {
                                    completedLessons: 0,
                                    completedExercises: 0,
                                    completedProjects: 0,
                                    currentLesson: 1
                                  }
                                }));
                                toast({
                                  title: "Enrolled!",
                                  description: `You've successfully enrolled in "${path.title}"`,
                                });
                              }}
                            >
                              Enroll Now
                            </Button>
                            <Button 
                              variant="outline"
                              onClick={() => navigate(`/learning-paths/${path.id}`)}
                            >
                              Learn More
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LearningPathsPage;