import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../hooks/use-toast';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Progress } from '../ui/progress';
import { Input } from '../ui/input';
import { Search, Users, BarChart2, BookOpen, ArrowLeft, PlusCircle, Download, MoreVertical, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import classesService from '../../services/classesService';
import { Bar, Line, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement } from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function ClassDetailsPage() {
  const { classId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [classData, setClassData] = useState(null);
  const [students, setStudents] = useState([
    { 
      id: 1, 
      name: 'John Doe', 
      email: 'john@example.com', 
      joined: '2023-01-15', 
      lastActive: '2023-10-25',
      performance: 'Good',
      assignments: [
        { week: 'Week 1', completed: true, score: 85 },
        { week: 'Week 2', completed: true, score: 78 },
        { week: 'Week 3', completed: true, score: 92 },
      ]
    },
    { 
      id: 2, 
      name: 'Jane Smith', 
      email: 'jane@example.com', 
      joined: '2023-02-20', 
      lastActive: '2023-10-24',
      performance: 'Excellent',
      assignments: [
        { week: 'Week 1', completed: true, score: 92 },
        { week: 'Week 2', completed: true, score: 95 },
        { week: 'Week 3', completed: true, score: 98 },
      ]
    },
    { 
      id: 3, 
      name: 'Alice Johnson', 
      email: 'alice@example.com', 
      joined: '2023-03-10', 
      lastActive: '2023-10-23',
      performance: 'Average',
      assignments: [
        { week: 'Week 1', completed: true, score: 72 },
        { week: 'Week 2', completed: true, score: 68 },
        { week: 'Week 3', completed: true, score: 75 },
      ]
    },
    { 
      id: 4, 
      name: 'Bob Williams', 
      email: 'bob@example.com', 
      joined: '2023-03-15', 
      lastActive: '2023-10-22',
      performance: 'Needs Improvement',
      assignments: [
        { week: 'Week 1', completed: true, score: 55 },
        { week: 'Week 2', completed: true, score: 58 },
        { week: 'Week 3', completed: true, score: 62 },
      ]
    },
  ]);
  const [exams, setExams] = useState([
    { 
      id: 1, 
      title: 'Midterm Exam', 
      date: '2023-11-15', 
      duration: 60, 
      status: 'upcoming', 
      submissions: 0, 
      totalStudents: 4, 
      averageScore: 0 
    },
    { 
      id: 2, 
      title: 'Final Exam', 
      date: '2023-12-20', 
      duration: 90, 
      status: 'upcoming', 
      submissions: 0, 
      totalStudents: 4, 
      averageScore: 0 
    },
  ]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');

  // Stats for the dashboard
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeStudents: 0,
    totalExams: 0,
    avgScore: 0,
  });

  // Calculate performance distribution
  const performanceData = React.useMemo(() => {
    return students.reduce((acc, student) => {
      acc[student.performance] = (acc[student.performance] || 0) + 1;
      return acc;
    }, {});
  }, [students]);

  // Prepare pie chart data for performance distribution
  const pieChartData = {
    labels: Object.keys(performanceData),
    datasets: [
      {
        data: Object.values(performanceData),
        backgroundColor: [
          'rgba(16, 185, 129, 0.7)', // Green for Excellent
          'rgba(34, 197, 94, 0.7)',  // Green for Good
          'rgba(251, 191, 36, 0.7)', // Yellow for Average
          'rgba(239, 68, 68, 0.7)',  // Red for Needs Improvement
        ],
        borderWidth: 1,
      },
    ],
  };

  // Prepare line chart data for assignment completion
  const lineChartData = {
    labels: ['Week 1', 'Week 2', 'Week 3'],
    datasets: [
      {
        label: 'Average Score (%)',
        data: students[0]?.assignments.map((_, i) => {
          const scores = students.map(s => s.assignments[i]?.score || 0);
          return scores.reduce((a, b) => a + b, 0) / scores.length;
        }),
        borderColor: 'rgba(59, 130, 246, 1)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.3,
        fill: true,
      },
      {
        label: 'Completion Rate (%)',
        data: students[0]?.assignments.map((_, i) => {
          const completed = students.filter(s => s.assignments[i]?.completed).length;
          return (completed / students.length) * 100;
        }),
        borderColor: 'rgba(16, 185, 129, 1)',
        borderDash: [5, 5],
        backgroundColor: 'transparent',
        tension: 0.3,
        yAxisID: 'y1',
      },
    ],
  };

  const lineChartOptions = {
    responsive: true,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Average Score (%)',
        },
        min: 0,
        max: 100,
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Completion Rate (%)',
        },
        min: 0,
        max: 100,
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  // Fetch class details
  useEffect(() => {
    let isMounted = true;
    
    const fetchClassDetails = async () => {
      try {
        setLoading(true);
        
        if (!classId) {
          console.error('No classId provided');
          return;
        }
        
        // Mock data for now - replace with actual API call
        const mockClassData = {
          id: classId,
          name: `Class ${classId}`,
          description: 'This is a sample class for demonstration purposes.',
          createdAt: new Date().toISOString(),
          studentCount: 35,
          examCount: 2,
          code: classId // Format: CS followed by 4-digit class ID
        };
        
        if (!isMounted) return;
        
        setClassData(mockClassData);
        
        // Set mock exams
        setExams([
          { 
            id: '1',
            title: 'Midterm Exam',
            date: '2024-03-15',
            duration: 120,
            status: 'completed',
            averageScore: 78.5,
            submissions: 32,
            totalStudents: 35,
          },
          { 
            id: '2',
            title: 'Final Exam',
            date: '2024-06-20',
            duration: 180,
            status: 'upcoming',
            averageScore: 0,
            submissions: 0,
            totalStudents: 35,
          },
        ]);
        
        // Set stats
        setStats({
          totalStudents: 35,
          activeStudents: 28, // 80% of total
          totalExams: 2,
          avgScore: 78.5,
        });
        
      } catch (error) {
        console.error('Error fetching class details:', error);
        toast({
          title: 'Error',
          description: 'Failed to load class details. Please try again.',
          variant: 'destructive',
        });
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    if (classId) {
      fetchClassDetails();
    }
    
    return () => {
      isMounted = false;
    };
  }, [classId, toast]);

  // Handle search
  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get status badge
  const getStatusBadge = (status) => {
    const statusMap = {
      active: 'default',
      completed: 'success',
      upcoming: 'secondary',
      draft: 'outline',
    };
    
    return (
      <Badge variant={statusMap[status] || 'outline'} className="capitalize">
        {status}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!classData) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Class not found</p>
        <Button onClick={() => navigate('/teacher/classes')} className="mt-4">
          Back to Classes
        </Button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="px-6 pt-4 pb-2 border-b">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{classData?.name || 'Class Details'}</h1>
            <p className="text-muted-foreground text-sm">{classData?.description || 'View and manage class details'}</p>
          </div>
        </div>
      </div>

      <Tabs 
        defaultValue="dashboard" 
        className="flex-1 flex flex-col overflow-hidden"
        onValueChange={setActiveTab}
      >
        <div className="px-6 pt-4">
          <TabsList className="grid w-full grid-cols-3 bg-muted/50 p-1 rounded-lg">
            <TabsTrigger 
              value="dashboard" 
              className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md transition-all"
            >
              <BarChart2 className="mr-2 h-4 w-4" />
              <span className="whitespace-nowrap">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger 
              value="students" 
              className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md transition-all"
            >
              <Users className="mr-2 h-4 w-4" />
              <span className="whitespace-nowrap">Students ({students.length})</span>
            </TabsTrigger>
            <TabsTrigger 
              value="exams" 
              className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md transition-all"
            >
              <BookOpen className="mr-2 h-4 w-4" />
              <span className="whitespace-nowrap">Exams ({exams.length})</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Stats Overview */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                <div className="p-2 rounded-full bg-primary/10">
                  <Users className="h-4 w-4 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{students.length}</div>
                <p className="text-xs text-muted-foreground">
                  +{Math.floor(students.length * 0.2)} from last month
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/20">
                  <BarChart2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">78%</div>
                <p className="text-xs text-muted-foreground">
                  +5% from last month
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Exams</CardTitle>
                <div className="p-2 rounded-full bg-muted">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{exams.length}</div>
                <p className="text-xs text-muted-foreground">
                  {exams.filter(e => e.status === 'completed').length} completed
                </p>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Class Code</CardTitle>
                <div className="p-2 rounded-full bg-muted">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-mono font-bold">{classData?.code}</div>
                <p className="text-xs text-muted-foreground">
                  Share to add students
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Performance Charts */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Performance Distribution</CardTitle>
                <CardDescription>Student performance across different levels</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] relative">
                  <Pie 
                    data={pieChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom',
                        },
                        tooltip: {
                          callbacks: {
                            label: function(context) {
                              const label = context.label || '';
                              const value = context.raw || 0;
                              const total = context.dataset.data.reduce((a, b) => a + b, 0);
                              const percentage = Math.round((value / total) * 100);
                              return `${label}: ${value} (${percentage}%)`;
                            }
                          }
                        }
                      }
                    }}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Assignment Progress</CardTitle>
                <CardDescription>Completion and performance over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] relative">
                  <Line 
                    data={lineChartData}
                    options={lineChartOptions}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity & Upcoming Exams */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest submissions and updates</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] overflow-y-auto">
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((item) => (
                    <div key={item} className="flex items-center gap-4 p-2 hover:bg-muted/50 rounded-md">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={`/avatars/0${item}.png`} />
                        <AvatarFallback>U{item}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Student {item} submitted Midterm Exam</p>
                        <p className="text-xs text-muted-foreground">2 hours ago</p>
                      </div>
                      <Badge variant="outline" className="ml-auto">
                        85%
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Upcoming Exams</CardTitle>
                <CardDescription>Next scheduled assessments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {exams
                    .filter(exam => exam.status === 'upcoming')
                    .slice(0, 3)
                    .map((exam) => (
                      <div key={exam.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{exam.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {new Date(exam.date).toLocaleDateString()} • {Math.floor(exam.duration / 60)}h {exam.duration % 60}m
                            </p>
                          </div>
                          <Badge variant="secondary" className="capitalize">
                            {exam.status}
                          </Badge>
                        </div>
                        <div className="mt-4">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-muted-foreground">Starts in</span>
                            <span className="font-medium">14 days</span>
                          </div>
                          <Progress value={30} className="h-2" />
                        </div>
                      </div>
                    ))}
                  {exams.filter(exam => exam.status === 'upcoming').length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No upcoming exams</p>
                      <Button 
                        variant="link" 
                        className="mt-2" 
                        onClick={() => setActiveTab('exams')}
                      >
                        Schedule an exam
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Students Tab */}
        <TabsContent value="students" className="flex-1 overflow-y-auto p-6 space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <CardTitle>Students</CardTitle>
                  <CardDescription>
                    {students.length} students enrolled in this class
                  </CardDescription>
                </div>
                <div className="relative w-full sm:w-auto">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search students..."
                    className="w-full sm:w-[200px] pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="text-right">Avg. Score</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={student.avatar} />
                              <AvatarFallback>
                                {student.name
                                  .split(' ')
                                  .map((n) => n[0])
                                  .join('')}
                              </AvatarFallback>
                            </Avatar>
                            {student.name}
                          </div>
                        </TableCell>
                        <TableCell>{student.email}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <span className="font-medium">
                              {Math.floor(Math.random() * 40) + 60}%
                            </span>
                            <Progress 
                              value={Math.floor(Math.random() * 40) + 60} 
                              className="w-20 h-2" 
                            />
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8">
                        {searchQuery ? (
                          <p>No students found matching "{searchQuery}"</p>
                        ) : (
                          <p>No students enrolled in this class yet</p>
                        )}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="text-sm text-muted-foreground">
                Showing <span className="font-medium">{Math.min(filteredStudents.length, 10)}</span> of{' '}
                <span className="font-medium">{students.length}</span> students
              </div>
              <div className="space-x-2">
                <Button variant="outline" size="sm" disabled={students.length <= 10}>
                  Previous
                </Button>
                <Button variant="outline" size="sm" disabled={students.length <= 10}>
                  Next
                </Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Exams Tab */}
        <TabsContent value="exams" className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => navigate(`/teacher/exams/create?classId=${classId}`)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Exam
            </Button>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Exams</CardTitle>
              <CardDescription>
                {exams.length} exams scheduled for this class
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Exam</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Submissions</TableHead>
                    <TableHead className="text-right">Avg. Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {exams.length > 0 ? (
                    exams.map((exam) => (
                      <TableRow 
                        key={exam.id} 
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => navigate(`/teacher/exams/${exam.id}`)}
                      >
                        <TableCell className="font-medium">{exam.title}</TableCell>
                        <TableCell>
                          {new Date(exam.date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {Math.floor(exam.duration / 60)}h {exam.duration % 60}m
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(exam.status)}
                        </TableCell>
                        <TableCell className="text-right">
                          {exam.submissions}/{exam.totalStudents}
                        </TableCell>
                        <TableCell className="text-right">
                          {exam.averageScore > 0 ? `${exam.averageScore}%` : '-'}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <div className="flex flex-col items-center justify-center space-y-2">
                          <BookOpen className="h-8 w-8 text-muted-foreground" />
                          <p>No exams scheduled yet</p>
                          <Button 
                            variant="link" 
                            className="mt-2" 
                            onClick={() => navigate(`/teacher/exams/create?classId=${classId}`)}
                          >
                            Create your first exam
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}