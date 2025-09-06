import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../ui/table';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../ui/select';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '../ui/dialog';
import { 
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../ui/tabs';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '../ui/dropdown-menu';
import { useToast } from '../../hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const TeacherExamsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [classes, setClasses] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [classFilter, setClassFilter] = useState('all');
  const [selectedExam, setSelectedExam] = useState(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Mock data - replace with actual API calls
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Simulate API calls
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockClasses = [
          {
            id: 1,
            name: 'CS101 - Introduction to Programming',
            code: 'CS101-2024',
            students: 42,
            status: 'active'
          },
          {
            id: 2,
            name: 'CS201 - Data Structures',
            code: 'CS201-2024',
            students: 38,
            status: 'active'
          }
        ];

        const mockQuestions = [
          {
            id: 1,
            title: 'Two Sum',
            difficulty: 'Easy',
            topic: 'Arrays',
            points: 20
          },
          {
            id: 2,
            title: 'Reverse Linked List',
            difficulty: 'Medium',
            topic: 'Linked Lists',
            points: 30
          },
          {
            id: 3,
            title: 'Binary Tree Traversal',
            difficulty: 'Hard',
            topic: 'Trees',
            points: 40
          }
        ];

        const mockExams = [
          {
            id: 1,
            title: 'Midterm Exam - Programming Basics',
            class: mockClasses[0],
            startDate: '2024-01-25',
            endDate: '2024-01-25',
            startTime: '10:00',
            endTime: '12:00',
            duration: 120, // minutes
            totalMarks: 100,
            questions: 5,
            status: 'scheduled',
            instructions: 'This is a coding exam. You will have 2 hours to complete 5 programming questions.',
            allowedLanguages: ['python', 'java', 'cpp', 'javascript'],
            totalStudents: 42,
            submittedStudents: 0,
            averageScore: null,
            questionsList: [1, 2, 3]
          },
          {
            id: 2,
            title: 'Final Exam - Data Structures',
            class: mockClasses[1],
            startDate: '2024-02-15',
            endDate: '2024-02-15',
            startTime: '14:00',
            endTime: '17:00',
            duration: 180, // minutes
            totalMarks: 150,
            questions: 7,
            status: 'draft',
            instructions: 'Comprehensive exam covering all data structure topics.',
            allowedLanguages: ['python', 'java', 'cpp'],
            totalStudents: 38,
            submittedStudents: 0,
            averageScore: null,
            questionsList: [2, 3]
          },
          {
            id: 3,
            title: 'Weekly Quiz - Arrays',
            class: mockClasses[0],
            startDate: '2024-01-22',
            endDate: '2024-01-22',
            startTime: '15:00',
            endTime: '16:00',
            duration: 60,
            totalMarks: 50,
            questions: 3,
            status: 'completed',
            instructions: 'Quick quiz on array operations.',
            allowedLanguages: ['python', 'java'],
            totalStudents: 42,
            submittedStudents: 38,
            averageScore: 78.5,
            questionsList: [1]
          }
        ];
        
        setClasses(mockClasses);
        setQuestions(mockQuestions);
        setExams(mockExams);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch data",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  const filteredExams = exams.filter(exam => {
    const matchesSearch = exam.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         exam.class.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || exam.status === statusFilter;
    const matchesClass = classFilter === 'all' || exam.class.id.toString() === classFilter;
    return matchesSearch && matchesStatus && matchesClass;
  });

  const handleCreateExam = async (examData) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newExam = {
        id: Date.now(),
        ...examData,
        totalStudents: examData.class.students,
        submittedStudents: 0,
        averageScore: null,
        questionsList: examData.selectedQuestions
      };
      
      setExams(prevExams => [newExam, ...prevExams]);
      setIsCreateDialogOpen(false);
      
      toast({
        title: "Success",
        description: "Exam created successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create exam",
        variant: "destructive"
      });
    }
  };

  const handleUpdateExam = async (examId, examData) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setExams(prevExams => 
        prevExams.map(exam => 
          exam.id === examId ? { ...exam, ...examData } : exam
        )
      );
      
      setIsEditDialogOpen(false);
      
      toast({
        title: "Success",
        description: "Exam updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update exam",
        variant: "destructive"
      });
    }
  };

  const handleDeleteExam = async (examId) => {
    if (!confirm('Are you sure you want to delete this exam? This action cannot be undone.')) {
      return;
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setExams(prevExams => prevExams.filter(exam => exam.id !== examId));
      
      toast({
        title: "Success",
        description: "Exam deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete exam",
        variant: "destructive"
      });
    }
  };

  const handleStatusChange = async (examId, newStatus) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setExams(prevExams => 
        prevExams.map(exam => 
          exam.id === examId ? { ...exam, status: newStatus } : exam
        )
      );
      
      toast({
        title: "Success",
        description: `Exam ${newStatus === 'scheduled' ? 'scheduled' : 'saved as draft'} successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update exam status",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      draft: 'secondary',
      scheduled: 'default',
      active: 'default',
      completed: 'success',
      archived: 'secondary'
    };
    
    return (
      <Badge variant={variants[status] || 'secondary'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getDifficultyBadge = (difficulty) => {
    const variants = {
      Easy: 'default',
      Medium: 'secondary',
      Hard: 'destructive'
    };
    
    return (
      <Badge variant={variants[difficulty] || 'secondary'}>
        {difficulty}
      </Badge>
    );
  };

  const stats = {
    total: exams.length,
    draft: exams.filter(e => e.status === 'draft').length,
    scheduled: exams.filter(e => e.status === 'scheduled').length,
    active: exams.filter(e => e.status === 'active').length,
    completed: exams.filter(e => e.status === 'completed').length,
    totalStudents: exams.reduce((sum, exam) => sum + exam.totalStudents, 0),
    totalSubmissions: exams.reduce((sum, exam) => sum + exam.submittedStudents, 0)
  };

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
          <h1 className="text-3xl font-bold mb-2">Exam Management</h1>
          <p className="text-muted-foreground">
            Create, schedule, and manage exams for your classes.
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          Create New Exam
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Exams</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Drafts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-600">{stats.draft}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Scheduled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{stats.scheduled}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{stats.active}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{stats.completed}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{stats.totalStudents}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-indigo-600">{stats.totalSubmissions}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Exam Management</CardTitle>
          <CardDescription>Search and filter your exams</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search by exam title or class..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={classFilter} onValueChange={setClassFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {classes.map(cls => (
                  <SelectItem key={cls.id} value={cls.id.toString()}>{cls.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Exams Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Exam</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Schedule</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Questions</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExams.map((exam) => (
                  <TableRow key={exam.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{exam.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {exam.instructions.substring(0, 80)}...
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{exam.class.name}</div>
                        <div className="text-sm text-muted-foreground">{exam.class.code}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{new Date(exam.startDate).toLocaleDateString()}</div>
                        <div className="text-sm text-muted-foreground">
                          {exam.startTime} - {exam.endTime}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-center">
                        <div className="font-medium">{Math.floor(exam.duration / 60)}h {exam.duration % 60}m</div>
                        <div className="text-xs text-muted-foreground">{exam.totalMarks} marks</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-center">
                        <div className="font-medium">{exam.questions}</div>
                        <div className="text-xs text-muted-foreground">
                          {exam.questionsList.length} selected
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-center">
                        <div className="font-medium">{exam.submittedStudents}/{exam.totalStudents}</div>
                        {exam.averageScore && (
                          <div className="text-xs text-muted-foreground">
                            Avg: {exam.averageScore.toFixed(1)}%
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Select 
                        value={exam.status} 
                        onValueChange={(value) => handleStatusChange(exam.id, value)}
                        disabled={exam.status === 'completed'}
                      >
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="scheduled">Scheduled</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            ⋮
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => {
                            setSelectedExam(exam);
                            setIsViewDialogOpen(true);
                          }}>
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            setSelectedExam(exam);
                            setIsEditDialogOpen(true);
                          }}>
                            Edit Exam
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigate(`/teacher/exams/${exam.id}/results`)}>
                            View Results
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigate(`/teacher/exams/${exam.id}/submissions`)}>
                            View Submissions
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteExam(exam.id)}
                            className="text-red-600"
                          >
                            Delete Exam
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredExams.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No exams found matching your criteria.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Exam Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Create New Exam</DialogTitle>
            <DialogDescription>
              Create a new exam with questions from your question bank.
            </DialogDescription>
          </DialogHeader>
          <div className="p-4 text-center">
            <p className="text-muted-foreground">Exam creation form will be implemented here.</p>
            <Button onClick={() => setIsCreateDialogOpen(false)} className="mt-4">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Exam Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Exam Details</DialogTitle>
            <DialogDescription>
              View complete exam details and configuration.
            </DialogDescription>
          </DialogHeader>
          {selectedExam && (
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-4">{selectedExam.title}</h3>
              <p className="text-muted-foreground mb-4">{selectedExam.instructions}</p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Class:</strong> {selectedExam.class.name}
                </div>
                <div>
                  <strong>Duration:</strong> {Math.floor(selectedExam.duration / 60)}h {selectedExam.duration % 60}m
                </div>
                <div>
                  <strong>Questions:</strong> {selectedExam.questions}
                </div>
                <div>
                  <strong>Total Marks:</strong> {selectedExam.totalMarks}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Exam Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Edit Exam</DialogTitle>
            <DialogDescription>
              Modify exam settings and questions.
            </DialogDescription>
          </DialogHeader>
          <div className="p-4 text-center">
            <p className="text-muted-foreground">Exam editing form will be implemented here.</p>
            <Button onClick={() => setIsEditDialogOpen(false)} className="mt-4">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TeacherExamsPage;
