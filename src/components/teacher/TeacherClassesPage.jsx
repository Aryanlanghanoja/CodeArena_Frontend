import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../ui/select';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '../ui/dialog';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '../ui/dropdown-menu';
import { useToast } from '../../hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const TeacherClassesPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState(null);
  const [isCreateClassDialogOpen, setIsCreateClassDialogOpen] = useState(false);
  const [isJoinCodeDialogOpen, setIsJoinCodeDialogOpen] = useState(false);
  const [isStudentsDialogOpen, setIsStudentsDialogOpen] = useState(false);

  // Mock data - replace with actual API calls
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockClasses = [
          {
            id: 1,
            name: 'CS101 - Introduction to Programming',
            code: 'CS101-2024',
            department: 'Computer Science',
            students: 42,
            exams: 3,
            status: 'active',
            createdDate: '2024-01-15',
            description: 'Introduction to programming concepts using Python',
            joinCode: 'CS101-ABC123',
            pendingStudents: 2
          },
          {
            id: 2,
            name: 'CS201 - Data Structures',
            code: 'CS201-2024',
            department: 'Computer Science',
            students: 38,
            exams: 4,
            status: 'active',
            createdDate: '2024-01-10',
            description: 'Advanced data structures and algorithms',
            joinCode: 'CS201-DEF456',
            pendingStudents: 0
          },
          {
            id: 3,
            name: 'CS301 - Algorithms',
            code: 'CS301-2024',
            department: 'Computer Science',
            students: 35,
            exams: 2,
            status: 'active',
            createdDate: '2024-01-12',
            description: 'Algorithm design and analysis',
            joinCode: 'CS301-GHI789',
            pendingStudents: 1
          },
          {
            id: 4,
            name: 'CS401 - Software Engineering',
            code: 'CS401-2024',
            department: 'Computer Science',
            students: 41,
            exams: 3,
            status: 'inactive',
            createdDate: '2024-01-08',
            description: 'Software development methodologies and practices',
            joinCode: 'CS401-JKL012',
            pendingStudents: 0
          }
        ];
        
        setClasses(mockClasses);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch classes",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, [toast]);

  const filteredClasses = classes.filter(classItem => {
    return classItem.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           classItem.code.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleCreateClass = async (classData) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newClass = {
        id: Date.now(),
        ...classData,
        students: 0,
        exams: 0,
        status: 'active',
        createdDate: new Date().toISOString().split('T')[0],
        joinCode: `${classData.code}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        pendingStudents: 0
      };
      
      setClasses(prevClasses => [newClass, ...prevClasses]);
      setIsCreateClassDialogOpen(false);
      
      toast({
        title: "Success",
        description: "Class created successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create class",
        variant: "destructive"
      });
    }
  };

  const handleDeleteClass = async (classId) => {
    if (!confirm('Are you sure you want to delete this class? This action cannot be undone.')) {
      return;
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setClasses(prevClasses => prevClasses.filter(classItem => classItem.id !== classId));
      
      toast({
        title: "Success",
        description: "Class deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete class",
        variant: "destructive"
      });
    }
  };

  const handleStatusChange = async (classId, newStatus) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setClasses(prevClasses => 
        prevClasses.map(classItem => 
          classItem.id === classId ? { ...classItem, status: newStatus } : classItem
        )
      );
      
      toast({
        title: "Success",
        description: `Class ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update class status",
        variant: "destructive"
      });
    }
  };

  const regenerateJoinCode = async (classId) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newJoinCode = `${Math.random().toString(36).substr(2, 6).toUpperCase()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
      
      setClasses(prevClasses => 
        prevClasses.map(classItem => 
          classItem.id === classId ? { ...classItem, joinCode: newJoinCode } : classItem
        )
      );
      
      toast({
        title: "Success",
        description: "Join code regenerated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to regenerate join code",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status) => {
    return (
      <Badge variant={status === 'active' ? 'default' : 'secondary'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const stats = {
    total: classes.length,
    active: classes.filter(c => c.status === 'active').length,
    totalStudents: classes.reduce((sum, c) => sum + c.students, 0),
    totalExams: classes.reduce((sum, c) => sum + c.exams, 0),
    pendingStudents: classes.reduce((sum, c) => sum + c.pendingStudents, 0)
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
            Manage your classes, view students, and create exams.
          </p>
        </div>
        <Button onClick={() => setIsCreateClassDialogOpen(true)}>
          Create New Class
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
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{stats.totalStudents}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Exams</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{stats.totalExams}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{stats.pendingStudents}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Class Management</CardTitle>
          <CardDescription>Search and manage your classes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <Input
              placeholder="Search by class name or code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full max-w-md"
            />
          </div>

          {/* Classes Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Class</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead>Exams</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Join Code</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClasses.map((classItem) => (
                  <TableRow key={classItem.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{classItem.name}</div>
                        <div className="text-sm text-muted-foreground">Code: {classItem.code}</div>
                      </div>
                    </TableCell>
                    <TableCell>{classItem.department}</TableCell>
                    <TableCell>
                      <div className="text-center">
                        <div className="font-medium">{classItem.students}</div>
                        {classItem.pendingStudents > 0 && (
                          <div className="text-xs text-orange-600">
                            +{classItem.pendingStudents} pending
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-center">
                        <div className="font-medium">{classItem.exams}</div>
                        <div className="text-xs text-muted-foreground">created</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Select 
                        value={classItem.status} 
                        onValueChange={(value) => handleStatusChange(classItem.id, value)}
                      >
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <code className="text-sm bg-muted px-2 py-1 rounded">
                          {classItem.joinCode}
                        </code>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            setSelectedClass(classItem);
                            setIsJoinCodeDialogOpen(true);
                          }}
                        >
                          Copy
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>{new Date(classItem.createdDate).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            ⋮
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => navigate(`/teacher/classes/${classItem.id}`)}>
                            View Class
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            setSelectedClass(classItem);
                            setIsStudentsDialogOpen(true);
                          }}>
                            Manage Students
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigate(`/teacher/classes/${classItem.id}/exams`)}>
                            Manage Exams
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => regenerateJoinCode(classItem.id)}>
                            Regenerate Join Code
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteClass(classItem.id)}
                            className="text-red-600"
                          >
                            Delete Class
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredClasses.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No classes found matching your criteria.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Class Dialog */}
      <Dialog open={isCreateClassDialogOpen} onOpenChange={setIsCreateClassDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Class</DialogTitle>
            <DialogDescription>
              Create a new class and generate a join code for students.
            </DialogDescription>
          </DialogHeader>
          <CreateClassForm onSubmit={handleCreateClass} onCancel={() => setIsCreateClassDialogOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Join Code Dialog */}
      <Dialog open={isJoinCodeDialogOpen} onOpenChange={setIsJoinCodeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Join Code</DialogTitle>
            <DialogDescription>
              Share this code with students to join your class.
            </DialogDescription>
          </DialogHeader>
          {selectedClass && (
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <div className="text-sm text-muted-foreground mb-2">Join Code:</div>
                <div className="text-2xl font-mono font-bold text-center">
                  {selectedClass.joinCode}
                </div>
              </div>
              <div className="flex gap-4">
                <Button 
                  onClick={() => {
                    navigator.clipboard.writeText(selectedClass.joinCode);
                    toast({
                      title: "Copied!",
                      description: "Join code copied to clipboard",
                    });
                  }}
                  className="flex-1"
                >
                  Copy to Clipboard
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => regenerateJoinCode(selectedClass.id)}
                >
                  Regenerate
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Students Dialog */}
      <Dialog open={isStudentsDialogOpen} onOpenChange={setIsStudentsDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Manage Students - {selectedClass?.name}</DialogTitle>
            <DialogDescription>
              View and manage students in this class.
            </DialogDescription>
          </DialogHeader>
          {selectedClass && (
            <StudentsList classId={selectedClass.id} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Create Class Form Component
const CreateClassForm = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    department: '',
    description: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium">Class Name</label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g., CS101 - Introduction to Programming"
          required
        />
      </div>
      <div>
        <label className="text-sm font-medium">Class Code</label>
        <Input
          value={formData.code}
          onChange={(e) => setFormData({ ...formData, code: e.target.value })}
          placeholder="e.g., CS101-2024"
          required
        />
      </div>
      <div>
        <label className="text-sm font-medium">Department</label>
        <Input
          value={formData.department}
          onChange={(e) => setFormData({ ...formData, department: e.target.value })}
          placeholder="e.g., Computer Science"
          required
        />
      </div>
      <div>
        <label className="text-sm font-medium">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Brief description of the class..."
          className="w-full p-3 border rounded-md"
          rows={3}
        />
      </div>
      <div className="flex gap-4">
        <Button type="submit" className="flex-1">
          Create Class
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
};

// Students List Component
const StudentsList = ({ classId }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const mockStudents = [
          { id: 1, name: 'John Doe', email: 'john.doe@student.edu', status: 'enrolled', joinedDate: '2024-01-15' },
          { id: 2, name: 'Jane Smith', email: 'jane.smith@student.edu', status: 'enrolled', joinedDate: '2024-01-16' },
          { id: 3, name: 'Mike Johnson', email: 'mike.johnson@student.edu', status: 'pending', joinedDate: '2024-01-17' },
        ];
        
        setStudents(mockStudents);
      } catch (error) {
        console.error('Failed to fetch students:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [classId]);

  if (loading) {
    return <div>Loading students...</div>;
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Student</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.map((student) => (
            <TableRow key={student.id}>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs">
                      {student.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{student.name}</span>
                </div>
              </TableCell>
              <TableCell>{student.email}</TableCell>
              <TableCell>
                <Badge variant={student.status === 'enrolled' ? 'default' : 'secondary'}>
                  {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                </Badge>
              </TableCell>
              <TableCell>{new Date(student.joinedDate).toLocaleDateString()}</TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm">
                  {student.status === 'pending' ? 'Approve' : 'Remove'}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default TeacherClassesPage;
