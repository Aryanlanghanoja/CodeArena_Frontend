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
import { Search, Users, BarChart2, BookOpen, ArrowLeft, PlusCircle, Download, MoreVertical } from 'lucide-react';
import classesService from '../../services/classesService';

export default function ClassDetailsPage() {
  const { classId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [classData, setClassData] = useState(null);
  const [students, setStudents] = useState([]);
  const [exams, setExams] = useState([]);
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

  // Fetch class details
  useEffect(() => {
    let isMounted = true;
    
    const fetchClassDetails = async () => {
      try {
        setLoading(true);
        
        if (!classId) {
          console.error('No classId provided');
          toast({
            title: 'Error',
            description: 'No class ID provided',
            variant: 'destructive',
          });
          navigate('/teacher/classes');
          return;
        }
        
        console.log('Fetching class details for join code:', classId);
        
        // Simulate API call with mock data
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Mock response data
        const mockClassData = {
          id: classId,
          name: 'Sample Class',
          code: classId,
          description: 'This is a sample class for demonstration purposes.',
          createdAt: new Date().toISOString(),
          studentCount: 35,
          examCount: 2
        };
        
        if (!isMounted) return;
        
        setClassData(mockClassData);
        
        // Set mock students
        setStudents([
          { id: 1, name: 'John Doe', email: 'john@example.com', status: 'active', joinedDate: '2024-01-15' },
          { id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'active', joinedDate: '2024-01-16' },
          { id: 3, name: 'Bob Johnson', email: 'bob@example.com', status: 'pending', joinedDate: '2024-01-17' },
        ]);
        
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
            date: '2024-05-20',
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
          avgScore: 75,
        });
        
      } catch (error) {
        console.error('Error fetching class details:', error);
        if (isMounted) {
          toast({
            title: 'Error',
            description: error.message || 'Failed to load class details',
            variant: 'destructive',
          });
          navigate('/teacher/classes');
        }
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
  }, [classId, navigate, toast]);

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{classData.name}</h1>
            <p className="text-muted-foreground">{classData.code} • {classData.studentCount} students</p>
          </div>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>
          <Button size="sm">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Students
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs 
        defaultValue="dashboard" 
        className="space-y-4"
        onValueChange={setActiveTab}
      >
        <TabsList>
          <TabsTrigger value="dashboard">
            <BarChart2 className="mr-2 h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="students">
            <Users className="mr-2 h-4 w-4" />
            Students
          </TabsTrigger>
          <TabsTrigger value="exams">
            <BookOpen className="mr-2 h-4 w-4" />
            Exams
          </TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-4">
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalStudents}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.activeStudents} active this month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Exams</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalExams}</div>
                <p className="text-xs text-muted-foreground">
                  {exams.filter(e => e.status === 'completed').length} completed
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg. Exam Score</CardTitle>
                <BarChart2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.avgScore}%</div>
                <div className="mt-2">
                  <Progress value={stats.avgScore} className="h-2" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Class Code</CardTitle>
                <span className="text-muted-foreground text-xs">Share to add students</span>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-mono font-bold bg-muted px-3 py-1.5 rounded-md inline-block">
                  {classData.code}
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
                      <Button variant="link" className="mt-2" onClick={() => setActiveTab('exams')}>
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
        <TabsContent value="students" className="space-y-4">
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
        <TabsContent value="exams" className="space-y-4">
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
