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
import classesService from '../../services/classesService';

const StudentClassesPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [enrolledClasses, setEnrolledClasses] = useState([]);
  const [activeClasses, setActiveClasses] = useState([]);
  const [pastClasses, setPastClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isJoinClassDialogOpen, setIsJoinClassDialogOpen] = useState(false);
  const [joinCode, setJoinCode] = useState('');

  // Fetch real enrolled classes data from API
  useEffect(() => {
    const fetchEnrolledClasses = async () => {
      try {
        setLoading(true);
        const result = await classesService.listClasses();
        
        if (result.success) {
          // Transform API data to match our component structure
          const transformedClasses = result.data.classes.map(classItem => ({
            id: classItem.join_code,
            name: classItem.class_name,
            code: classItem.join_code,
            teacher: {
              name: classItem.creator?.name || 'Unknown Teacher',
              email: classItem.creator?.email || 'unknown@university.edu',
              profilePhoto: null
            },
            department: 'Computer Science', // Default since backend doesn't have this field
            progress: Math.min((classItem.student_count || 0) / 50 * 100, 100), // Mock progress based on student count
            exams: classItem.exam_count || 0,
            completedExams: Math.floor((classItem.exam_count || 0) * 0.7), // Mock completed exams
            nextExam: null, // Backend doesn't have this field yet
            joinDate: new Date(classItem.created_at).toISOString().split('T')[0],
            description: classItem.description || '',
            status: classItem.status || 'active'
          }));
          
          setEnrolledClasses(transformedClasses);
          
          // Separate active and past classes
          const active = transformedClasses.filter(classItem => classItem.status === 'active');
          const past = transformedClasses.filter(classItem => classItem.status === 'inactive');
          setActiveClasses(active);
          setPastClasses(past);
        } else {
          throw new Error(result.message || 'Failed to fetch enrolled classes');
        }
      } catch (error) {
        console.error('Error fetching enrolled classes:', error);
        toast({
          title: "Error",
          description: "Failed to fetch enrolled classes: " + error.message,
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchEnrolledClasses();
  }, [toast]);

  const filteredActiveClasses = activeClasses.filter(classItem => {
    return classItem.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           classItem.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
           classItem.teacher.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const filteredPastClasses = pastClasses.filter(classItem => {
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
      // Call the real API to join class
      const result = await classesService.joinClass(joinCode.trim());
      
      if (result.success) {
        // Refresh the enrolled classes list
        const refreshResult = await classesService.listClasses();
        
        if (refreshResult.success) {
          const transformedClasses = refreshResult.data.classes.map(classItem => ({
            id: classItem.join_code,
            name: classItem.class_name,
            code: classItem.join_code,
            teacher: {
              name: classItem.creator?.name || 'Unknown Teacher',
              email: classItem.creator?.email || 'unknown@university.edu',
              profilePhoto: null
            },
            department: 'Computer Science',
            progress: Math.min((classItem.student_count || 0) / 50 * 100, 100),
            exams: classItem.exam_count || 0,
            completedExams: Math.floor((classItem.exam_count || 0) * 0.7),
            nextExam: null,
            joinDate: new Date(classItem.created_at).toISOString().split('T')[0],
            description: classItem.description || '',
            status: classItem.status || 'active'
          }));
          
          setEnrolledClasses(transformedClasses);
          
          // Update separated active and past classes
          const active = transformedClasses.filter(classItem => classItem.status === 'active');
          const past = transformedClasses.filter(classItem => classItem.status === 'inactive');
          setActiveClasses(active);
          setPastClasses(past);
        }
        
        setIsJoinClassDialogOpen(false);
        setJoinCode('');
        
        toast({
          title: "Success",
          description: `Successfully joined the class: ${result.data.class_name}`,
        });
      } else {
        throw new Error(result.message || 'Failed to join class');
      }
    } catch (error) {
      console.error('Error joining class:', error);
      toast({
        title: "Error",
        description: "Failed to join class: " + error.message,
        variant: "destructive"
      });
    }
  };

  const handleLeaveClass = async (classId) => {
    if (!confirm('Are you sure you want to leave this class? You will lose access to all class materials and exams.')) {
      return;
    }

    try {
      // Call the real API to leave class (remove member)
      const result = await classesService.removeMember(classId, user.user_id);
      
      if (result.success) {
        // Remove the class from the local state
        setEnrolledClasses(prevClasses => prevClasses.filter(classItem => classItem.id !== classId));
        setActiveClasses(prevClasses => prevClasses.filter(classItem => classItem.id !== classId));
        setPastClasses(prevClasses => prevClasses.filter(classItem => classItem.id !== classId));
        
        toast({
          title: "Success",
          description: "Successfully left the class",
        });
      } else {
        throw new Error(result.message || 'Failed to leave class');
      }
    } catch (error) {
      console.error('Error leaving class:', error);
      toast({
        title: "Error",
        description: "Failed to leave class: " + error.message,
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

          {/* Active Classes Section */}
          {filteredActiveClasses.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4 text-green-700">Active Classes ({filteredActiveClasses.length})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredActiveClasses.map((classItem) => (
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
            </div>
          )}

          {/* Past Classes Section */}
          {filteredPastClasses.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4 text-gray-600">Past Classes ({filteredPastClasses.length})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPastClasses.map((classItem) => (
                  <Card key={classItem.id} className="hover:shadow-lg transition-shadow opacity-75">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{classItem.name}</CardTitle>
                          <CardDescription className="mt-1">
                            Code: {classItem.code} • {classItem.department}
                          </CardDescription>
                        </div>
                        <Badge variant="secondary">
                          Past
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-6 w-6">
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
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Exams:</span>
                          <span>{classItem.exams}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Completed:</span>
                          <span>{classItem.completedExams}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Joined:</span>
                          <span>{new Date(classItem.joinDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      <div className="pt-2">
                        <Button 
                          variant="outline"
                          onClick={() => navigate(`/student/classes/${classItem.id}`)}
                          className="w-full"
                        >
                          View Class
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {filteredActiveClasses.length === 0 && filteredPastClasses.length === 0 && (
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
              <br />
              <span className="text-sm text-muted-foreground">
                Note: You cannot join classes that have been deactivated by the teacher.
              </span>
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
