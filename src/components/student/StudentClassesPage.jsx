import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Progress } from '../ui/progress';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '../ui/dialog';
import { useToast } from '../../hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const StudentClassesPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [enrolledClasses, setEnrolledClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isJoinClassDialogOpen, setIsJoinClassDialogOpen] = useState(false);
  const [joinCode, setJoinCode] = useState('');

  // Mock data - replace with actual API calls
  useEffect(() => {
    const fetchEnrolledClasses = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockEnrolledClasses = [
          {
            id: 1,
            name: 'CS101 - Introduction to Programming',
            code: 'CS101-2024',
            teacher: {
              name: 'Dr. Sarah Smith',
              email: 'sarah.smith@university.edu',
              profilePhoto: null
            },
            department: 'Computer Science',
            progress: 75,
            exams: 3,
            completedExams: 2,
            nextExam: '2024-01-25',
            joinDate: '2024-01-15',
            description: 'Introduction to programming concepts using Python',
            status: 'active'
          },
          {
            id: 2,
            name: 'CS201 - Data Structures',
            code: 'CS201-2024',
            teacher: {
              name: 'Prof. John Davis',
              email: 'john.davis@university.edu',
              profilePhoto: null
            },
            department: 'Computer Science',
            progress: 60,
            exams: 4,
            completedExams: 2,
            nextExam: '2024-01-20',
            joinDate: '2024-01-10',
            description: 'Advanced data structures and algorithms',
            status: 'active'
          },
          {
            id: 3,
            name: 'MATH101 - Calculus I',
            code: 'MATH101-2024',
            teacher: {
              name: 'Dr. Emily Brown',
              email: 'emily.brown@university.edu',
              profilePhoto: null
            },
            department: 'Mathematics',
            progress: 85,
            exams: 2,
            completedExams: 1,
            nextExam: '2024-01-18',
            joinDate: '2024-01-12',
            description: 'Fundamental concepts of calculus',
            status: 'active'
          },
          {
            id: 4,
            name: 'ENG101 - Technical Writing',
            code: 'ENG101-2024',
            teacher: {
              name: 'Prof. Lisa Johnson',
              email: 'lisa.johnson@university.edu',
              profilePhoto: null
            },
            department: 'English',
            progress: 90,
            exams: 2,
            completedExams: 2,
            nextExam: null,
            joinDate: '2024-01-14',
            description: 'Technical writing and communication skills',
            status: 'active'
          }
        ];
        
        setEnrolledClasses(mockEnrolledClasses);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch enrolled classes",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchEnrolledClasses();
  }, [toast]);

  const filteredClasses = enrolledClasses.filter(classItem => {
    return classItem.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           classItem.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
           classItem.teacher.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleJoinClass = async () => {
    if (!joinCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter a join code",
        variant: "destructive"
      });
      return;
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock successful join
      const newClass = {
        id: Date.now(),
        name: 'New Class - ' + joinCode,
        code: 'NEW-2024',
        teacher: {
          name: 'New Teacher',
          email: 'teacher@university.edu',
          profilePhoto: null
        },
        department: 'Computer Science',
        progress: 0,
        exams: 0,
        completedExams: 0,
        nextExam: null,
        joinDate: new Date().toISOString().split('T')[0],
        description: 'Newly joined class',
        status: 'active'
      };
      
      setEnrolledClasses(prevClasses => [newClass, ...prevClasses]);
      setIsJoinClassDialogOpen(false);
      setJoinCode('');
      
      toast({
        title: "Success",
        description: "Successfully joined the class!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to join class. Please check the join code.",
        variant: "destructive"
      });
    }
  };

  const handleLeaveClass = async (classId) => {
    if (!confirm('Are you sure you want to leave this class? You will lose access to all class materials and exams.')) {
      return;
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setEnrolledClasses(prevClasses => prevClasses.filter(classItem => classItem.id !== classId));
      
      toast({
        title: "Success",
        description: "Successfully left the class",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to leave class",
        variant: "destructive"
      });
    }
  };

  const stats = {
    total: enrolledClasses.length,
    active: enrolledClasses.filter(c => c.status === 'active').length,
    totalExams: enrolledClasses.reduce((sum, c) => sum + c.exams, 0),
    completedExams: enrolledClasses.reduce((sum, c) => sum + c.completedExams, 0),
    averageProgress: enrolledClasses.length > 0 
      ? Math.round(enrolledClasses.reduce((sum, c) => sum + c.progress, 0) / enrolledClasses.length)
      : 0
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
          <h1 className="text-3xl font-bold mb-2">My Classes</h1>
          <p className="text-muted-foreground">
            View your enrolled classes and track your progress.
          </p>
        </div>
        <Button onClick={() => setIsJoinClassDialogOpen(true)}>
          Join New Class
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Classes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Classes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{stats.active}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Exams</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{stats.totalExams}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed Exams</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{stats.completedExams}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Average Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{stats.averageProgress}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Enrolled Classes</CardTitle>
          <CardDescription>Search through your enrolled classes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <Input
              placeholder="Search by class name, code, or teacher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full max-w-md"
            />
          </div>

          {/* Classes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClasses.map((classItem) => (
              <Card key={classItem.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{classItem.name}</CardTitle>
                      <CardDescription className="mt-1">
                        Code: {classItem.code} • {classItem.department}
                      </CardDescription>
                    </div>
                    <Badge variant={classItem.status === 'active' ? 'default' : 'secondary'}>
                      {classItem.status.charAt(0).toUpperCase() + classItem.status.slice(1)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Teacher Info */}
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={classItem.teacher.profilePhoto} alt={classItem.teacher.name} />
                      <AvatarFallback className="text-xs">
                        {classItem.teacher.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-sm font-medium">{classItem.teacher.name}</div>
                      <div className="text-xs text-muted-foreground">{classItem.teacher.email}</div>
                    </div>
                  </div>

                  {/* Progress */}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Progress</span>
                      <span>{classItem.progress}%</span>
                    </div>
                    <Progress value={classItem.progress} className="h-2" />
                  </div>

                  {/* Exam Info */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Exams</div>
                      <div className="font-medium">{classItem.completedExams}/{classItem.exams}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Next Exam</div>
                      <div className="font-medium">
                        {classItem.nextExam 
                          ? new Date(classItem.nextExam).toLocaleDateString()
                          : 'None scheduled'
                        }
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button 
                      onClick={() => navigate(`/student/classes/${classItem.id}`)}
                      className="flex-1"
                    >
                      View Class
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => navigate(`/student/classes/${classItem.id}/exams`)}
                    >
                      Exams
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => handleLeaveClass(classItem.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Leave
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredClasses.length === 0 && (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">📚</div>
              <h3 className="text-lg font-medium mb-2">No classes found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery ? 'No classes match your search criteria.' : 'You haven\'t joined any classes yet.'}
              </p>
              {!searchQuery && (
                <Button onClick={() => setIsJoinClassDialogOpen(true)}>
                  Join Your First Class
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Join Class Dialog */}
      <Dialog open={isJoinClassDialogOpen} onOpenChange={setIsJoinClassDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Join a Class</DialogTitle>
            <DialogDescription>
              Enter the join code provided by your teacher to join their class.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Join Code</label>
              <Input
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="e.g., CS101-ABC123"
                className="mt-1 font-mono"
                maxLength={20}
              />
            </div>
            <div className="flex gap-4">
              <Button 
                onClick={handleJoinClass}
                className="flex-1"
                disabled={!joinCode.trim()}
              >
                Join Class
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsJoinClassDialogOpen(false);
                  setJoinCode('');
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentClassesPage;
