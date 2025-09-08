import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { useNavigate, useLocation } from 'react-router-dom';
import classesService from '../../services/classesService';
import learningPathService from '../../services/learningPathService';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // State for real-time data
  const [studentStats, setStudentStats] = React.useState({
    totalClasses: 0,
    totalExams: 0,
    completedExams: 0,
    averageScore: 0,
    problemsSolved: 0,
    totalSubmissions: 0,
    currentStreak: 0,
    totalStudyHours: 0
  });
  const [enrolledClasses, setEnrolledClasses] = React.useState([]);
  const [learningPaths, setLearningPaths] = React.useState([]);
  const [learningPathProgress, setLearningPathProgress] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  // Fetch real-time data
  React.useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch enrolled classes data using the service
        const classesData = await classesService.getStudentDashboardClasses();
        setEnrolledClasses(classesData.classes);
        setStudentStats(prev => ({
          ...prev,
          totalClasses: classesData.stats.totalClasses
        }));

        // Fetch learning paths data
        try {
          const learningPathsData = await learningPathService.getAllLearningPaths();
          setLearningPaths(learningPathsData.data || []);
          
          // Fetch overall progress
          const progressData = await learningPathService.getStudentOverallProgress();
          setLearningPathProgress(progressData.data);
        } catch (error) {
          console.log('No learning paths data available');
        }

        // TODO: Add other API calls for exams, submissions, etc.
        // For now, using mock data for other stats
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [location.pathname]);

  const upcomingExams = [
    { id: 1, title: 'Midterm Exam - Data Structures', class: 'CS201', date: '2024-01-15', time: '10:00 AM', duration: '2 hours', status: 'upcoming' },
    { id: 2, title: 'Quiz - Calculus I', class: 'MATH101', date: '2024-01-18', time: '2:00 PM', duration: '1 hour', status: 'upcoming' },
    { id: 3, title: 'Final Project - Programming', class: 'CS101', date: '2024-01-20', time: '11:00 AM', duration: '3 hours', status: 'upcoming' }
  ];

  const recentResults = [
    { id: 1, exam: 'Quiz - Programming Basics', class: 'CS101', score: 92, date: '2024-01-10', status: 'completed' },
    { id: 2, exam: 'Midterm - Calculus I', class: 'MATH101', score: 78, date: '2024-01-08', status: 'completed' },
    { id: 3, exam: 'Assignment - Data Structures', class: 'CS201', score: 85, date: '2024-01-05', status: 'completed' }
  ];

  const practiceProgress = [
    { difficulty: 'Easy', solved: 25, total: 30, color: '#10B981' },
    { difficulty: 'Medium', solved: 15, total: 25, color: '#F59E0B' },
    { difficulty: 'Hard', solved: 5, total: 15, color: '#EF4444' }
  ];

  const performanceData = [
    { month: 'Sep', score: 75, problems: 10 },
    { month: 'Oct', score: 78, problems: 15 },
    { month: 'Nov', score: 82, problems: 20 },
    { month: 'Dec', score: 79, problems: 18 },
    { month: 'Jan', score: 85, problems: 25 }
  ];

  const skillProgress = [
    { skill: 'Programming', level: 75, color: '#3B82F6' },
    { skill: 'Data Structures', level: 60, color: '#10B981' },
    { skill: 'Algorithms', level: 45, color: '#F59E0B' },
    { skill: 'Mathematics', level: 80, color: '#8B5CF6' },
    { skill: 'Problem Solving', level: 70, color: '#EF4444' }
  ];

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    if (score >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBadge = (score) => {
    if (score >= 90) return { variant: 'default', className: 'bg-green-100 text-green-800' };
    if (score >= 80) return { variant: 'default', className: 'bg-blue-100 text-blue-800' };
    if (score >= 70) return { variant: 'default', className: 'bg-yellow-100 text-yellow-800' };
    if (score >= 60) return { variant: 'default', className: 'bg-orange-100 text-orange-800' };
    return { variant: 'default', className: 'bg-red-100 text-red-800' };
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Student Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.name}! Here's your learning progress and upcoming activities.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Button 
          onClick={() => navigate('/student/classes')}
          className="h-20 flex flex-col items-center justify-center space-y-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border-2 border-blue-200"
        >
          <span className="text-2xl">🏫</span>
          <span className="text-sm font-medium">My Classes</span>
        </Button>
        <Button 
          onClick={() => navigate('/student/exams')}
          className="h-20 flex flex-col items-center justify-center space-y-2 bg-green-50 hover:bg-green-100 text-green-700 border-2 border-green-200"
        >
          <span className="text-2xl">📝</span>
          <span className="text-sm font-medium">Take Exams</span>
        </Button>
        <Button 
          onClick={() => navigate('/student/practice')}
          className="h-20 flex flex-col items-center justify-center space-y-2 bg-purple-50 hover:bg-purple-100 text-purple-700 border-2 border-purple-200"
        >
          <span className="text-2xl">💻</span>
          <span className="text-sm font-medium">Practice Problems</span>
        </Button>
        <Button 
          onClick={() => navigate('/student/progress')}
          className="h-20 flex flex-col items-center justify-center space-y-2 bg-orange-50 hover:bg-orange-100 text-orange-700 border-2 border-orange-200"
        >
          <span className="text-2xl">📊</span>
          <span className="text-sm font-medium">My Progress</span>
        </Button>
      </div>

      {/* Student Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Average Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{studentStats.averageScore}%</div>
            <div className="text-sm text-muted-foreground mt-1">
              Across all exams
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Problems Solved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{studentStats.problemsSolved}</div>
            <div className="text-sm text-muted-foreground mt-1">
              out of {studentStats.totalSubmissions} attempts
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Study Streak</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{studentStats.currentStreak}</div>
            <div className="text-sm text-muted-foreground mt-1">
              consecutive days
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Study Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{studentStats.totalStudyHours}h</div>
            <div className="text-sm text-muted-foreground mt-1">
              this week
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Trend</CardTitle>
            <CardDescription>Your scores and problem-solving progress</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="month" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  name="Average Score"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Skill Progress */}
        <Card>
          <CardHeader>
            <CardTitle>Skill Progress</CardTitle>
            <CardDescription>Your proficiency in different areas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {skillProgress.map((skill) => (
                <div key={skill.skill}>
                  <div className="flex justify-between text-sm mb-2">
                    <span>{skill.skill}</span>
                    <span className="font-medium">{skill.level}%</span>
                  </div>
                  <Progress value={skill.level} className="h-2" style={{ '--progress-color': skill.color }} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Classes and Exams */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Enrolled Classes */}
        <Card>
          <CardHeader>
            <CardTitle>My Classes</CardTitle>
            <CardDescription>Your enrolled courses and progress</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-sm text-muted-foreground mt-2">Loading classes...</p>
              </div>
            ) : enrolledClasses.length > 0 ? (
              <div className="space-y-4">
                {enrolledClasses.map((classItem) => (
                  <div key={classItem.join_code} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{classItem.class_name}</h4>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                        <span>Teacher: {classItem.creator?.name || 'Unknown'}</span>
                        <span>Join Code: {classItem.join_code}</span>
                      </div>
                      <div className="mt-2">
                        <div className="flex justify-between text-xs mb-1">
                          <span>Students</span>
                          <span>{classItem.student_count || 0}</span>
                        </div>
                        <Progress value={Math.min((classItem.student_count || 0) / 50 * 100, 100)} className="h-2" />
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate(`/student/classes/${classItem.join_code}`)}
                    >
                      View
                    </Button>
                  </div>
                ))}
                <Button 
                  variant="outline" 
                  className="w-full mt-2"
                  onClick={() => navigate('/student/classes')}
                >
                  View All Classes
                </Button>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-muted-foreground mb-3">Not enrolled in any classes yet</p>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/student/classes')}
                >
                  Join a Class
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Learning Paths */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Learning Paths</CardTitle>
                <CardDescription>Your structured learning journeys</CardDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/learning-paths')}
              >
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-sm text-muted-foreground mt-2">Loading learning paths...</p>
              </div>
            ) : learningPaths.length > 0 ? (
              <div className="space-y-4">
                {learningPaths.slice(0, 3).map((path) => {
                  const pathProgress = learningPathProgress?.learning_paths?.find(p => p.learning_path_id === path.path_id);
                  const completionPercentage = pathProgress?.completion_percentage || 0;
                  
                  return (
                    <div key={path.path_id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{path.title}</h4>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {path.description}
                        </p>
                        <div className="mt-2">
                          <div className="flex justify-between text-xs mb-1">
                            <span>Progress</span>
                            <span>{completionPercentage}%</span>
                          </div>
                          <Progress value={completionPercentage} className="h-2" />
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 ml-4">
                        <Badge variant="outline" className="text-xs">
                          {path.modules?.length || 0} modules
                        </Badge>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigate(`/learning-paths/${path.path_id}`)}
                        >
                          Continue
                        </Button>
                      </div>
                    </div>
                  );
                })}
                {learningPaths.length > 3 && (
                  <div className="text-center pt-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => navigate('/learning-paths')}
                    >
                      View {learningPaths.length - 3} more learning paths
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <div className="text-4xl mb-4">📚</div>
                <p className="mb-4">You haven't joined any learning paths yet.</p>
                <Button onClick={() => navigate('/learning-paths')}>
                  Browse Learning Paths
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Exams */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Exams</CardTitle>
            <CardDescription>Your scheduled exams and deadlines</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingExams.map((exam) => (
                <div key={exam.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{exam.title}</h4>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                      <span>{exam.class}</span>
                      <span>{exam.date} at {exam.time}</span>
                      <span>{exam.duration}</span>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate(`/student/exams/${exam.id}`)}
                  >
                    Start
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Practice Progress and Recent Results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Practice Progress */}
        <Card>
          <CardHeader>
            <CardTitle>Practice Progress</CardTitle>
            <CardDescription>Your problem-solving achievements</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {practiceProgress.map((level) => (
                <div key={level.difficulty}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium">{level.difficulty}</span>
                    <span>{level.solved}/{level.total}</span>
                  </div>
                  <Progress value={(level.solved / level.total) * 100} className="h-3" />
                </div>
              ))}
            </div>
            <div className="mt-6">
              <Button 
                onClick={() => navigate('/student/practice')}
                className="w-full"
              >
                Continue Practicing
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Results */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Results</CardTitle>
            <CardDescription>Your latest exam and assignment scores</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentResults.map((result) => {
                const scoreBadge = getScoreBadge(result.score);
                return (
                  <div key={result.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{result.exam}</h4>
                      <div className="flex items-center space-x-4 mt-1 text-xs text-muted-foreground">
                        <span>{result.class}</span>
                        <span>{result.date}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge 
                        variant={scoreBadge.variant} 
                        className={scoreBadge.className}
                      >
                        {result.score}%
                      </Badge>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate(`/student/results/${result.id}`)}
                      >
                        View
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Learning Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Recommended for You</CardTitle>
          <CardDescription>Based on your learning patterns and performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
              <div className="flex items-center space-x-3 mb-3">
                <span className="text-2xl">📚</span>
                <div>
                  <h4 className="font-medium">Data Structures Deep Dive</h4>
                  <p className="text-sm text-muted-foreground">Improve your CS201 performance</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full">
                Start Learning
              </Button>
            </div>
            
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
              <div className="flex items-center space-x-3 mb-3">
                <span className="text-2xl">💡</span>
                <div>
                  <h4 className="font-medium">Algorithm Practice</h4>
                  <p className="text-sm text-muted-foreground">Medium difficulty problems</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full">
                Practice Now
              </Button>
            </div>
            
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
              <div className="flex items-center space-x-3 mb-3">
                <span className="text-2xl">🎯</span>
                <div>
                  <h4 className="font-medium">Exam Preparation</h4>
                  <p className="text-sm text-muted-foreground">Mock tests for upcoming exams</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full">
                Take Mock Test
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentDashboard;
