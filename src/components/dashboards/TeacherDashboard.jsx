import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { useNavigate, useLocation } from 'react-router-dom';
import classesService from '../../services/classesService';
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

const TeacherDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // State for real-time data
  const [teacherStats, setTeacherStats] = React.useState({
    totalClasses: 0,
    totalStudents: 0,
    totalExams: 0,
    activeExams: 0,
    averageScore: 0,
    questionsCreated: 0
  });
  const [classes, setClasses] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  // Fetch real-time data
  React.useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch classes data using the service
        const classesData = await classesService.getTeacherDashboardClasses();
        setClasses(classesData.classes);
        setTeacherStats(prev => ({
          ...prev,
          totalClasses: classesData.stats.totalClasses,
          totalStudents: classesData.stats.totalStudents
        }));

        // TODO: Add other API calls for exams, questions, etc.
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
    { id: 1, title: 'Midterm Exam - Data Structures', class: 'CS201', date: '2024-01-15', time: '10:00 AM', duration: '2 hours' },
    { id: 2, title: 'Final Project - Software Engineering', class: 'CS401', date: '2024-01-20', time: '11:00 AM', duration: '3 hours' },
    { id: 3, title: 'Quiz - Algorithms', class: 'CS301', date: '2024-01-18', time: '2:00 PM', duration: '1 hour' }
  ];

  const recentSubmissions = [
    { id: 1, student: 'John Doe', exam: 'Midterm Exam', class: 'CS201', score: 85, submitted: '2 hours ago' },
    { id: 2, student: 'Jane Smith', exam: 'Midterm Exam', class: 'CS201', score: 92, submitted: '3 hours ago' },
    { id: 3, student: 'Mike Johnson', exam: 'Final Project', class: 'CS401', score: 78, submitted: '1 day ago' },
    { id: 4, student: 'Sarah Wilson', exam: 'Quiz', class: 'CS301', score: 95, submitted: '2 days ago' }
  ];

  const performanceData = [
    { month: 'Sep', avgScore: 75, students: 120 },
    { month: 'Oct', avgScore: 78, students: 125 },
    { month: 'Nov', avgScore: 82, students: 130 },
    { month: 'Dec', avgScore: 79, students: 135 },
    { month: 'Jan', avgScore: 85, students: 140 }
  ];

  const scoreDistribution = [
    { range: '90-100', count: 25, color: '#10B981' },
    { range: '80-89', count: 45, color: '#3B82F6' },
    { range: '70-79', count: 35, color: '#F59E0B' },
    { range: '60-69', count: 20, color: '#EF4444' },
    { range: '0-59', count: 10, color: '#6B7280' }
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
        <h1 className="text-3xl font-bold mb-2">Teacher Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.name}! Here's your teaching overview and class management.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Button 
          onClick={() => navigate('/teacher/classes')}
          className="h-20 flex flex-col items-center justify-center space-y-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border-2 border-blue-200"
        >
          <span className="text-2xl">🏫</span>
          <span className="text-sm font-medium">My Classes</span>
        </Button>
        <Button 
          onClick={() => navigate('/teacher/questions')}
          className="h-20 flex flex-col items-center justify-center space-y-2 bg-green-50 hover:bg-green-100 text-green-700 border-2 border-green-200"
        >
          <span className="text-2xl">❓</span>
          <span className="text-sm font-medium">Question Bank</span>
        </Button>
        <Button 
          onClick={() => navigate('/teacher/exams')}
          className="h-20 flex flex-col items-center justify-center space-y-2 bg-purple-50 hover:bg-purple-100 text-purple-700 border-2 border-purple-200"
        >
          <span className="text-2xl">📝</span>
          <span className="text-sm font-medium">Create Exam</span>
        </Button>
        <Button 
          onClick={() => navigate('/teacher/leaderboard')}
          className="h-20 flex flex-col items-center justify-center space-y-2 bg-orange-50 hover:bg-orange-100 text-orange-700 border-2 border-orange-200"
        >
          <span className="text-2xl">🏆</span>
          <span className="text-sm font-medium">Leaderboards</span>
        </Button>
      </div>

      {/* Teacher Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Classes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{teacherStats.totalClasses}</div>
            <div className="text-sm text-muted-foreground mt-1">
              Active classes
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{teacherStats.totalStudents}</div>
            <div className="text-sm text-muted-foreground mt-1">
              Enrolled students
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Average Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{teacherStats.averageScore}%</div>
            <div className="text-sm text-muted-foreground mt-1">
              Across all exams
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Exams</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{teacherStats.activeExams}</div>
            <div className="text-sm text-muted-foreground mt-1">
              Currently running
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Student Performance Trend</CardTitle>
            <CardDescription>Average scores over the semester</CardDescription>
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
                  dataKey="avgScore" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  name="Average Score"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Score Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Score Distribution</CardTitle>
            <CardDescription>Distribution of student scores</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={scoreDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ range, count }) => `${range}: ${count}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {scoreDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Classes and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Classes */}
        <Card>
          <CardHeader>
            <CardTitle>My Classes</CardTitle>
            <CardDescription>Manage your classes and students</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-sm text-muted-foreground mt-2">Loading classes...</p>
              </div>
            ) : classes.length > 0 ? (
              <div className="space-y-4">
                {classes.map((classItem) => (
                  <div key={classItem.join_code} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{classItem.class_name}</h4>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                        <span>{classItem.student_count || 0} students</span>
                        <span>{classItem.exam_count || 0} exams</span>
                        <span>Code: {classItem.join_code}</span>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate(`/teacher/classes/${classItem.join_code}`)}
                    >
                      View
                    </Button>
                  </div>
                ))}
                <Button 
                  variant="outline" 
                  className="w-full mt-2"
                  onClick={() => navigate('/teacher/classes')}
                >
                  Manage All Classes
                </Button>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-muted-foreground mb-3">No classes created yet</p>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/teacher/classes')}
                >
                  Create Your First Class
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Exams */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Exams</CardTitle>
            <CardDescription>Scheduled exams and deadlines</CardDescription>
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
                    onClick={() => navigate(`/teacher/exams/${exam.id}`)}
                  >
                    Manage
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Submissions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Submissions</CardTitle>
          <CardDescription>Latest student exam submissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentSubmissions.map((submission) => {
              const scoreBadge = getScoreBadge(submission.score);
              return (
                <div key={submission.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        {submission.student.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-medium text-sm">{submission.student}</h4>
                      <div className="flex items-center space-x-4 mt-1 text-xs text-muted-foreground">
                        <span>{submission.exam}</span>
                        <span>{submission.class}</span>
                        <span>{submission.submitted}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge 
                      variant={scoreBadge.variant} 
                      className={scoreBadge.className}
                    >
                      {submission.score}%
                    </Badge>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate(`/teacher/submissions/${submission.id}`)}
                    >
                      Review
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherDashboard;
