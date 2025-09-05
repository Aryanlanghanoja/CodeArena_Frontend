import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { useNavigate } from 'react-router-dom';
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

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // State for real-time data
  const [systemStats, setSystemStats] = React.useState({
    totalUsers: 0,
    totalClasses: 0,
    totalExams: 0,
    activeUsers: 0,
    systemHealth: 0,
    judge0Workers: 0,
    databaseConnections: 0
  });
  const [recentClasses, setRecentClasses] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  // Fetch real-time data
  React.useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch classes data using the service
        const classesData = await classesService.getAdminDashboardClasses();
        setRecentClasses(classesData.classes);
        setSystemStats(prev => ({
          ...prev,
          totalClasses: classesData.total
        }));

        // TODO: Add other API calls for users, exams, system health
        // For now, using mock data for other stats
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const userStats = {
    students: 980,
    teachers: 45,
    admins: 3,
    newUsersThisWeek: 23
  };

  const recentActivity = [
    { id: 1, type: 'user_registered', user: 'John Doe', time: '2 minutes ago', role: 'student' },
    { id: 2, type: 'exam_created', user: 'Dr. Smith', time: '15 minutes ago', exam: 'Data Structures' },
    { id: 3, type: 'class_created', user: 'Prof. Johnson', time: '1 hour ago', class: 'CS101' },
    { id: 4, type: 'system_alert', message: 'Judge0 worker restarted', time: '2 hours ago' }
  ];

  const chartData = [
    { month: 'Jan', users: 120, exams: 15, classes: 8 },
    { month: 'Feb', users: 180, exams: 22, classes: 12 },
    { month: 'Mar', users: 250, exams: 28, classes: 18 },
    { month: 'Apr', users: 320, exams: 35, classes: 25 },
    { month: 'May', users: 450, exams: 42, classes: 32 },
    { month: 'Jun', users: 580, exams: 48, classes: 38 }
  ];

  const userRoleData = [
    { name: 'Students', value: userStats.students, color: '#3B82F6' },
    { name: 'Teachers', value: userStats.teachers, color: '#10B981' },
    { name: 'Admins', value: userStats.admins, color: '#F59E0B' }
  ];

  const getActivityIcon = (type) => {
    switch (type) {
      case 'user_registered':
        return '👤';
      case 'exam_created':
        return '📝';
      case 'class_created':
        return '🏫';
      case 'system_alert':
        return '⚠️';
      default:
        return '📋';
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'user_registered':
        return 'text-blue-600';
      case 'exam_created':
        return 'text-green-600';
      case 'class_created':
        return 'text-purple-600';
      case 'system_alert':
        return 'text-orange-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.name}! Here's your platform overview and system health.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Button 
          onClick={() => navigate('/admin/users')}
          className="h-20 flex flex-col items-center justify-center space-y-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border-2 border-blue-200"
        >
          <span className="text-2xl">👥</span>
          <span className="text-sm font-medium">Manage Users</span>
        </Button>
        <Button 
          onClick={() => navigate('/admin/classes')}
          className="h-20 flex flex-col items-center justify-center space-y-2 bg-green-50 hover:bg-green-100 text-green-700 border-2 border-green-200"
        >
          <span className="text-2xl">🏫</span>
          <span className="text-sm font-medium">View Classes</span>
        </Button>
        <Button 
          onClick={() => navigate('/admin/exams')}
          className="h-20 flex flex-col items-center justify-center space-y-2 bg-purple-50 hover:bg-purple-100 text-purple-700 border-2 border-purple-200"
        >
          <span className="text-2xl">📝</span>
          <span className="text-sm font-medium">Monitor Exams</span>
        </Button>
        <Button 
          onClick={() => navigate('/admin/system')}
          className="h-20 flex flex-col items-center justify-center space-y-2 bg-orange-50 hover:bg-orange-100 text-orange-700 border-2 border-orange-200"
        >
          <span className="text-2xl">⚙️</span>
          <span className="text-sm font-medium">System Health</span>
        </Button>
      </div>

      {/* System Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{systemStats.totalUsers.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground mt-1">
              +{userStats.newUsersThisWeek} this week
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Classes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{systemStats.totalClasses}</div>
            <div className="text-sm text-muted-foreground mt-1">
              Across all departments
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Exams</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{systemStats.totalExams}</div>
            <div className="text-sm text-muted-foreground mt-1">
              Created by teachers
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">System Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{systemStats.systemHealth}%</div>
            <div className="text-sm text-muted-foreground mt-1">
              All systems operational
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Growth Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Platform Growth</CardTitle>
            <CardDescription>Monthly growth of users, exams, and classes</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="users" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  name="Users"
                />
                <Line 
                  type="monotone" 
                  dataKey="exams" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  name="Exams"
                />
                <Line 
                  type="monotone" 
                  dataKey="classes" 
                  stroke="#F59E0B" 
                  strokeWidth={2}
                  name="Classes"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* User Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>User Distribution</CardTitle>
            <CardDescription>Breakdown by user roles</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={userRoleData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {userRoleData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Classes */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Recent Classes</CardTitle>
          <CardDescription>Latest classes created on the platform</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-sm text-muted-foreground mt-2">Loading classes...</p>
            </div>
          ) : recentClasses.length > 0 ? (
            <div className="space-y-4">
              {recentClasses.map((classItem) => (
                <div key={classItem.join_code} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{classItem.class_name}</p>
                    <p className="text-xs text-muted-foreground">
                      Created by: {classItem.creator?.name || 'Unknown'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Join Code: {classItem.join_code}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary" className="text-xs">
                      {classItem.student_count || 0} students
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(classItem.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
              <Button 
                variant="outline" 
                className="w-full mt-2"
                onClick={() => navigate('/admin/classes')}
              >
                View All Classes
              </Button>
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              <p>No classes found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* System Health & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Health */}
        <Card>
          <CardHeader>
            <CardTitle>System Health</CardTitle>
            <CardDescription>Current system status and resources</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Judge0 Workers</span>
                <span className="font-medium">{systemStats.judge0Workers}/5 Active</span>
              </div>
              <Progress value={(systemStats.judge0Workers / 5) * 100} className="h-2" />
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Database Connections</span>
                <span className="font-medium">{systemStats.databaseConnections}/20 Used</span>
              </div>
              <Progress value={(systemStats.databaseConnections / 20) * 100} className="h-2" />
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Active Users</span>
                <span className="font-medium">{systemStats.activeUsers} Online</span>
              </div>
              <Progress value={(systemStats.activeUsers / systemStats.totalUsers) * 100} className="h-2" />
            </div>

            <div className="pt-4 border-t">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-600 font-medium">All systems operational</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest platform activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className="text-xl">{getActivityIcon(activity.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className={`text-sm font-medium ${getActivityColor(activity.type)}`}>
                        {activity.user || activity.message}
                      </span>
                      {activity.role && (
                        <Badge variant="secondary" className="text-xs">
                          {activity.role}
                        </Badge>
                      )}
                    </div>
                    {activity.exam && (
                      <p className="text-sm text-muted-foreground">Created exam: {activity.exam}</p>
                    )}
                    {activity.class && (
                      <p className="text-sm text-muted-foreground">Created class: {activity.class}</p>
                    )}
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
