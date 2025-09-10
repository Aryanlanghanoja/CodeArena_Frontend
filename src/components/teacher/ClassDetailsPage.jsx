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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '../ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Search, Users, BarChart2, BookOpen, ArrowLeft, PlusCircle, Download, MoreVertical, Clock, CheckCircle, AlertCircle, UserPlus, UserMinus, Crown, Shield, RefreshCw, FileText, Megaphone } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import classesService from '../../services/classesService';
import assignmentsService from '../../services/assignmentsService';
import announcementsService from '../../services/announcementsService';
import CreateAnnouncementModal from './CreateAnnouncementModal';
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
  const [students, setStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [assignments, setAssignments] = useState([]);
  const [assignmentsLoading, setAssignmentsLoading] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [announcementsLoading, setAnnouncementsLoading] = useState(false);
  const [showCreateAnnouncement, setShowCreateAnnouncement] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [announcementTagFilter, setAnnouncementTagFilter] = useState('all');
  const [deleteAssignmentId, setDeleteAssignmentId] = useState(null);
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
    assistants: 0,
    students: 0,
    daysActive: 0,
  });

  // Calculate performance distribution
  const performanceData = React.useMemo(() => {
    if (students.length === 0) return {};
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
        data: students.length > 0 && students[0]?.assignments ? 
          students[0].assignments.map((_, i) => {
          const scores = students.map(s => s.assignments[i]?.score || 0);
          return scores.reduce((a, b) => a + b, 0) / scores.length;
          }) : [0, 0, 0],
        borderColor: 'rgba(59, 130, 246, 1)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.3,
        fill: true,
      },
      {
        label: 'Completion Rate (%)',
        data: students.length > 0 && students[0]?.assignments ?
          students[0].assignments.map((_, i) => {
          const completed = students.filter(s => s.assignments[i]?.completed).length;
          return (completed / students.length) * 100;
          }) : [0, 0, 0],
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
        
        // Fetch class details from API
        const classResponse = await classesService.getClassDetails(classId);
        
        if (!isMounted) return;
        
        if (classResponse.success) {
          setClassData(classResponse.data.class);
          
          // Set stats from API data
        setStats({
            totalStudents: classResponse.data.class.student_count || 0,
            activeStudents: classResponse.data.class.student_count || 0,
            totalExams: classResponse.data.class.exam_count || 0,
            avgScore: 0, // Will be calculated from student data
          });
        }
        
        // Fetch class members, stats, assignments, and announcements
        await Promise.all([
          fetchClassMembers(),
          fetchClassStats(),
          fetchAssignments(),
          fetchAnnouncements()
        ]);
        
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
  }, [classId]);

  // Fetch class members
  const fetchClassMembers = async () => {
    try {
      setStudentsLoading(true);
      const response = await classesService.listClassMembers(classId);
      
      if (response.success) {
        // Transform API data to match component expectations
        const transformedStudents = response.data.members.map(member => ({
          id: member.user.user_id,
          name: member.user.name || `${member.user.first_name} ${member.user.last_name}`,
          email: member.user.email,
          joined: member.created_at,
          lastActive: member.updated_at,
          role: member.role || 'student',
          status: member.status,
          performance: getPerformanceLevel(member.user.studentProfile?.average_score || 0),
          assignments: [], // Will be populated from exam data
          avatar: member.user.avatar_url,
          averageScore: member.user.studentProfile?.average_score || 0
        }));
        
        setStudents(transformedStudents);
        
        // Update stats with real data
        setStats(prev => ({
          ...prev,
          totalStudents: transformedStudents.length,
          activeStudents: transformedStudents.filter(s => s.status === 'active').length,
          avgScore: transformedStudents.length > 0 
            ? Math.round(transformedStudents.reduce((sum, s) => sum + s.averageScore, 0) / transformedStudents.length)
            : 0
        }));
      }
    } catch (error) {
      console.error('Error fetching class members:', error);
      toast({
        title: 'Error',
        description: 'Failed to load class members. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setStudentsLoading(false);
    }
  };

  // Fetch class statistics
  const fetchClassStats = async () => {
    try {
      const response = await classesService.getClassStats(classId);
      
      if (response.success) {
        const statsData = response.data.stats;
        
        // Update stats with comprehensive data from API
        setStats(prev => ({
          ...prev,
          totalStudents: statsData.total_members,
          activeStudents: statsData.active_members,
          totalExams: statsData.exams_assigned,
          assistants: statsData.assistants,
          students: statsData.students,
          daysActive: statsData.days_active
        }));
      }
    } catch (error) {
      console.error('Error fetching class stats:', error);
      // Don't show error toast for stats as it's not critical
    }
  };

  // Fetch assignments
  const fetchAssignments = async () => {
    try {
      setAssignmentsLoading(true);
      const response = await assignmentsService.getClassAssignments(classId);
      
      if (response.success) {
        const formattedAssignments = response.data.assignments.map(assignment => 
          assignmentsService.formatAssignmentData(assignment)
        );
        setAssignments(formattedAssignments);
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
      toast({
        title: 'Error',
        description: 'Failed to load assignments. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setAssignmentsLoading(false);
    }
  };

  // Fetch announcements
  const fetchAnnouncements = async () => {
    try {
      setAnnouncementsLoading(true);
      const response = await announcementsService.getClassAnnouncements(classId);
      
      if (response.success) {
        const formattedAnnouncements = response.data.announcements.map(announcement => 
          announcementsService.formatAnnouncementData(announcement)
        );
        setAnnouncements(formattedAnnouncements);
      }
    } catch (error) {
      console.error('Error fetching announcements:', error);
      toast({
        title: 'Error',
        description: 'Failed to load announcements. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setAnnouncementsLoading(false);
    }
  };

  // Get all unique tags from announcements
  const getAllUniqueTags = () => {
    const allTags = announcements.flatMap(announcement => announcement.tags || []);
    return [...new Set(allTags)].sort();
  };

  // Filter announcements based on selected tag
  const getFilteredAnnouncements = () => {
    if (announcementTagFilter === 'all') {
      return announcements;
    }
    return announcements.filter(announcement => 
      announcement.tags && announcement.tags.includes(announcementTagFilter)
    );
  };

  // Assignment functions
  const handleViewAssignmentDetails = (assignmentId) => {
    navigate(`/teacher/classes/${classId}/assignments/${assignmentId}`);
  };

  const handleEditAssignment = (assignmentId) => {
    navigate(`/teacher/classes/${classId}/assignments/${assignmentId}/edit`);
  };

  const handleViewSubmissions = (assignmentId) => {
    navigate(`/teacher/classes/${classId}/assignments/${assignmentId}/submissions`);
  };

  const handleDeleteAssignment = async (assignmentId) => {
    try {
      const response = await assignmentsService.deleteAssignment(assignmentId);
      if (response.success) {
        toast({
          title: 'Success',
          description: 'Assignment deleted successfully',
        });
        fetchAssignments();
        setDeleteAssignmentId(null);
      } else {
        toast({
          title: 'Error',
          description: response.message || 'Failed to delete assignment',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error deleting assignment:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete assignment. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Handle edit announcement
  const handleEditAnnouncement = (announcement) => {
    setEditingAnnouncement(announcement);
    setShowCreateAnnouncement(true);
  };

  // Handle delete announcement
  const handleDeleteAnnouncement = async (announcementId) => {
    if (!confirm('Are you sure you want to delete this announcement? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await announcementsService.deleteAnnouncement(announcementId);
      if (response.success) {
        toast({
          title: 'Success',
          description: 'Announcement deleted successfully.',
        });
        await fetchAnnouncements(); // Refresh the list
      }
    } catch (error) {
      console.error('Error deleting announcement:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete announcement. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Get performance level based on score
  const getPerformanceLevel = (score) => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Good';
    if (score >= 70) return 'Average';
    return 'Needs Improvement';
  };

  // User management functions
  const handlePromoteMember = async (userId) => {
    try {
      const response = await classesService.promoteMember(classId, userId);
      if (response.success) {
        toast({
          title: 'Success',
          description: 'Member promoted to assistant successfully.',
        });
        await fetchClassMembers(); // Refresh the list
      }
    } catch (error) {
      console.error('Error promoting member:', error);
      toast({
        title: 'Error',
        description: 'Failed to promote member. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDemoteMember = async (userId) => {
    try {
      const response = await classesService.demoteMember(classId, userId);
      if (response.success) {
        toast({
          title: 'Success',
          description: 'Member demoted to student successfully.',
        });
        await fetchClassMembers(); // Refresh the list
      }
    } catch (error) {
      console.error('Error demoting member:', error);
      toast({
        title: 'Error',
        description: 'Failed to demote member. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleRemoveMember = async (userId, studentName) => {
    if (window.confirm(`Are you sure you want to remove ${studentName} from this class?`)) {
      try {
        const response = await classesService.removeMember(classId, userId);
        if (response.success) {
          toast({
            title: 'Success',
            description: 'Member removed from class successfully.',
          });
          await fetchClassMembers(); // Refresh the list
        }
      } catch (error) {
        console.error('Error removing member:', error);
        toast({
          title: 'Error',
          description: 'Failed to remove member. Please try again.',
          variant: 'destructive',
        });
      }
    }
  };

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
            <h1 className="text-2xl font-bold">{classData?.class_name || 'Class Details'}</h1>
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
          <TabsList className="grid w-full grid-cols-5 bg-muted/50 p-1 rounded-lg">
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
              value="assignments" 
              className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md transition-all"
            >
              <FileText className="mr-2 h-4 w-4" />
              <span className="whitespace-nowrap">Assignments ({assignments.length})</span>
            </TabsTrigger>
            <TabsTrigger 
              value="announcements" 
              className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md transition-all"
            >
              <Megaphone className="mr-2 h-4 w-4" />
              <span className="whitespace-nowrap">Announcements ({announcements.length})</span>
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
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                <div className="p-2 rounded-full bg-primary/10">
                  <Users className="h-4 w-4 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalStudents}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.activeStudents} active students
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
                <div className="text-2xl font-bold">{stats.avgScore}%</div>
                <p className="text-xs text-muted-foreground">
                  {stats.avgScore >= 80 ? 'Excellent' : stats.avgScore >= 70 ? 'Good' : 'Needs improvement'}
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
                <div className="text-2xl font-bold">{stats.totalExams}</div>
                <p className="text-xs text-muted-foreground">
                  {exams.filter(e => e.status === 'completed').length} completed
                </p>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Assistants</CardTitle>
                <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/20">
                  <Crown className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.assistants}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.students} regular students
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
                <div className="text-2xl font-mono font-bold">{classData?.join_code}</div>
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
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      fetchClassMembers();
                      fetchClassStats();
                      fetchAssignments();
                      fetchAnnouncements();
                    }}
                    disabled={studentsLoading}
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${studentsLoading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
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
              </div>
            </CardHeader>
            <CardContent>
              {studentsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
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
                              <div>
                                <div className="font-medium">{student.name}</div>
                                <div className="text-xs text-muted-foreground">
                                  Joined {new Date(student.joined).toLocaleDateString()}
                                </div>
                              </div>
                          </div>
                        </TableCell>
                        <TableCell>{student.email}</TableCell>
                          <TableCell>
                            <Badge 
                              variant={student.role === 'assistant' ? 'default' : 'secondary'}
                              className="capitalize"
                            >
                              {student.role === 'assistant' ? (
                                <>
                                  <Crown className="h-3 w-3 mr-1" />
                                  Assistant
                                </>
                              ) : (
                                <>
                                  <Users className="h-3 w-3 mr-1" />
                                  Student
                                </>
                              )}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={student.status === 'active' ? 'default' : 'outline'}
                              className="capitalize"
                            >
                              {student.status === 'active' ? (
                                <>
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Active
                                </>
                              ) : (
                                <>
                                  <AlertCircle className="h-3 w-3 mr-1" />
                                  Inactive
                                </>
                              )}
                            </Badge>
                          </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <span className="font-medium">
                                {student.averageScore}%
                            </span>
                            <Progress 
                                value={student.averageScore} 
                              className="w-20 h-2" 
                            />
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {student.role === 'student' ? (
                                  <DropdownMenuItem 
                                    onClick={() => handlePromoteMember(student.id)}
                                    className="text-green-600"
                                  >
                                    <UserPlus className="h-4 w-4 mr-2" />
                                    Promote to Assistant
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem 
                                    onClick={() => handleDemoteMember(student.id)}
                                    className="text-yellow-600"
                                  >
                                    <UserMinus className="h-4 w-4 mr-2" />
                                    Demote to Student
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={() => handleRemoveMember(student.id, student.name)}
                                  className="text-red-600"
                                >
                                  <UserMinus className="h-4 w-4 mr-2" />
                                  Remove from Class
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                        {searchQuery ? (
                          <p>No students found matching "{searchQuery}"</p>
                        ) : (
                            <div className="flex flex-col items-center justify-center space-y-2">
                              <Users className="h-8 w-8 text-muted-foreground" />
                          <p>No students enrolled in this class yet</p>
                              <p className="text-sm text-muted-foreground">
                                Share the class code to invite students
                              </p>
                            </div>
                        )}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              )}
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

        {/* Assignments Tab */}
        <TabsContent value="assignments" className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Assignments</h2>
              <p className="text-muted-foreground">Manage class assignments and track student progress</p>
            </div>
            <Button onClick={() => navigate(`/teacher/classes/${classId}/create-assignment`)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Assignment
            </Button>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Assignment List</CardTitle>
              <CardDescription>
                {assignments.length} assignments created for this class
              </CardDescription>
            </CardHeader>
            <CardContent>
              {assignmentsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : assignments.length > 0 ? (
                <div className="space-y-4">
                  {assignments.map((assignment) => (
                    <Card key={assignment.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold">{assignment.title}</h3>
                              <Badge variant={assignment.status === 'published' ? 'default' : 'secondary'}>
                                {assignment.status}
                              </Badge>
                              {assignment.isOverdue && (
                                <Badge variant="destructive">Overdue</Badge>
                              )}
                            </div>
                            
                            {assignment.description && (
                              <div className="text-muted-foreground mb-3 prose prose-sm max-w-none dark:prose-invert">
                                <ReactMarkdown
                                  components={{
                                    p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                                    strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
                                    em: ({ children }) => <em className="italic">{children}</em>,
                                    code: ({ children }) => <code className="bg-muted px-1 py-0.5 rounded text-sm font-mono">{children}</code>,
                                    pre: ({ children }) => <pre className="bg-muted p-3 rounded-lg overflow-x-auto text-sm">{children}</pre>,
                                    ul: ({ children }) => <ul className="list-disc list-inside space-y-1">{children}</ul>,
                                    ol: ({ children }) => <ol className="list-decimal list-inside space-y-1">{children}</ol>,
                                    li: ({ children }) => <li className="text-muted-foreground">{children}</li>,
                                    h1: ({ children }) => <h1 className="text-xl font-bold text-foreground mb-2">{children}</h1>,
                                    h2: ({ children }) => <h2 className="text-lg font-semibold text-foreground mb-2">{children}</h2>,
                                    h3: ({ children }) => <h3 className="text-base font-semibold text-foreground mb-1">{children}</h3>,
                                    blockquote: ({ children }) => <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground">{children}</blockquote>,
                                    a: ({ href, children }) => <a href={href} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">{children}</a>
                                  }}
                                >
                                  {assignment.description}
                                </ReactMarkdown>
                              </div>
                            )}
                            
                            <div className="flex items-center gap-6 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <FileText className="h-4 w-4" />
                                <span>{assignment.questions?.length || assignment.questionIds?.length || 0} questions</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <BarChart2 className="h-4 w-4" />
                                <span>{assignment.totalPoints} points</span>
                              </div>
                              {assignment.dueDate && (
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                <span>{assignment.submissionCount} submissions</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleViewAssignmentDetails(assignment.id)}
                            >
                              View Details
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEditAssignment(assignment.id)}>
                                  Edit Assignment
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleViewSubmissions(assignment.id)}>
                                  View Submissions
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  className="text-red-600"
                                  onClick={() => setDeleteAssignmentId(assignment.id)}
                                >
                                  Delete Assignment
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No assignments yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first assignment to get started with this class.
                  </p>
                  <Button onClick={() => navigate(`/teacher/classes/${classId}/create-assignment`)}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create Assignment
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Announcements Tab */}
        <TabsContent value="announcements" className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Announcements</h2>
              <p className="text-muted-foreground">Communicate with your class members</p>
            </div>
            <Button onClick={() => setShowCreateAnnouncement(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Announcement
            </Button>
          </div>
          
          {/* Filter Section */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label htmlFor="tag-filter" className="text-sm font-medium">
                Filter by tag:
              </label>
              <Select value={announcementTagFilter} onValueChange={setAnnouncementTagFilter}>
                <SelectTrigger id="tag-filter" className="w-48">
                  <SelectValue placeholder="Select a tag" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Announcements</SelectItem>
                  {getAllUniqueTags().map((tag) => (
                    <SelectItem key={tag} value={tag}>
                      {tag}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {announcementTagFilter !== 'all' && (
              <Badge variant="secondary" className="text-xs">
                {getFilteredAnnouncements().length} announcement{getFilteredAnnouncements().length !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Recent Announcements</CardTitle>
              <CardDescription>
                {announcements.length} announcements posted
              </CardDescription>
            </CardHeader>
            <CardContent>
              {announcementsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : getFilteredAnnouncements().length > 0 ? (
                <div className="space-y-4">
                  {getFilteredAnnouncements().map((announcement) => (
                    <Card key={announcement.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold">{announcement.title}</h3>
                              {announcement.tags && announcement.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {announcement.tags.map((tag, index) => (
                                    <Badge key={index} variant="secondary" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                            
                            <div className="text-muted-foreground mb-3">
                              <div 
                                dangerouslySetInnerHTML={{ 
                                  __html: announcement.content
                                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                    .replace(/\*(.*?)\*/g, '<em>$1</em>')
                                    .replace(/`(.*?)`/g, '<code class="bg-muted px-1 rounded text-sm">$1</code>')
                                    .replace(/^\- (.*$)/gm, '<li>$1</li>')
                                    .replace(/^\d+\. (.*$)/gm, '<li>$1</li>')
                                    .replace(/^> (.*$)/gm, '<blockquote class="border-l-2 border-muted pl-2 italic mb-2">$1</blockquote>')
                                    .replace(/\n/g, '<br>')
                                }}
                              />
                            </div>
                            
                            <div className="flex items-center gap-6 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                <span>Posted by {announcement.createdBy.name}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                <span>{announcement.timeAgo}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEditAnnouncement(announcement)}>
                                  Edit Announcement
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  className="text-red-600" 
                                  onClick={() => handleDeleteAnnouncement(announcement.id)}
                                >
                                  Delete Announcement
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Megaphone className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  {announcementTagFilter === 'all' ? (
                    <>
                      <h3 className="text-lg font-semibold mb-2">No announcements yet</h3>
                      <p className="text-muted-foreground mb-4">
                        Create your first announcement to communicate with your class.
                      </p>
                      <Button onClick={() => setShowCreateAnnouncement(true)}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create Announcement
                      </Button>
                    </>
                  ) : (
                    <>
                      <h3 className="text-lg font-semibold mb-2">No announcements with this tag</h3>
                      <p className="text-muted-foreground mb-4">
                        No announcements found with the "{announcementTagFilter}" tag.
                      </p>
                      <Button variant="outline" onClick={() => setAnnouncementTagFilter('all')}>
                        Show All Announcements
                      </Button>
                    </>
                  )}
                </div>
              )}
            </CardContent>
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

      {/* Modals */}

      <CreateAnnouncementModal
        isOpen={showCreateAnnouncement}
        onClose={() => {
          setShowCreateAnnouncement(false);
          setEditingAnnouncement(null);
        }}
        classId={classId}
        editingAnnouncement={editingAnnouncement}
        onSuccess={() => {
          fetchAnnouncements();
          setEditingAnnouncement(null);
        }}
      />

      {/* Delete Assignment Confirmation Dialog */}
      <Dialog open={!!deleteAssignmentId} onOpenChange={() => setDeleteAssignmentId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Assignment</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this assignment? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleteAssignmentId(null)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => handleDeleteAssignment(deleteAssignmentId)}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}