import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
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
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '../ui/dropdown-menu';
import { useToast } from '../../hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import classesService from '../../services/classesService';

const AdminClassesPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [selectedClass, setSelectedClass] = useState(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);

  // Fetch real classes data from API
  useEffect(() => {
    const fetchClasses = async () => {
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
              id: classItem.created_by,
              name: classItem.creator?.name || 'Unknown Teacher',
              email: classItem.creator?.email || 'unknown@university.edu',
              profilePhoto: null
            },
            department: 'Computer Science', // Default since backend doesn't have this field
            students: classItem.student_count || 0,
            exams: classItem.exam_count || 0,
            status: classItem.status || 'active',
            createdDate: new Date(classItem.created_at).toISOString().split('T')[0],
            description: classItem.description || ''
          }));
          
          setClasses(transformedClasses);
        } else {
          throw new Error(result.message || 'Failed to fetch classes');
        }
      } catch (error) {
        console.error('Error fetching classes:', error);
        toast({
          title: "Error",
          description: "Failed to fetch classes: " + error.message,
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, [toast]);

  // Mock data for testing - remove when API is fully integrated
  const mockClasses = [
          {
            id: 1,
            name: 'CS101 - Introduction to Programming',
            code: 'CS101-2024',
            teacher: {
              id: 1,
              name: 'Dr. Sarah Smith',
              email: 'sarah.smith@university.edu',
              profilePhoto: null
            },
            department: 'Computer Science',
            students: 42,
            exams: 3,
            status: 'active',
            createdDate: '2024-01-15',
            description: 'Introduction to programming concepts using Python'
          },
          {
            id: 2,
            name: 'CS201 - Data Structures',
            code: 'CS201-2024',
            teacher: {
              id: 2,
              name: 'Prof. John Davis',
              email: 'john.davis@university.edu',
              profilePhoto: null
            },
            department: 'Computer Science',
            students: 38,
            exams: 4,
            status: 'active',
            createdDate: '2024-01-10',
            description: 'Advanced data structures and algorithms'
          },
          {
            id: 3,
            name: 'MATH101 - Calculus I',
            code: 'MATH101-2024',
            teacher: {
              id: 3,
              name: 'Dr. Emily Brown',
              email: 'emily.brown@university.edu',
              profilePhoto: null
            },
            department: 'Mathematics',
            students: 55,
            exams: 2,
            status: 'active',
            createdDate: '2024-01-12',
            description: 'Fundamental concepts of calculus'
          },
          {
            id: 4,
            name: 'PHYS101 - Physics I',
            code: 'PHYS101-2024',
            teacher: {
              id: 4,
              name: 'Prof. Michael Wilson',
              email: 'michael.wilson@university.edu',
              profilePhoto: null
            },
            department: 'Physics',
            students: 48,
            exams: 3,
            status: 'inactive',
            createdDate: '2024-01-08',
            description: 'Introduction to classical mechanics'
          },
          {
            id: 5,
            name: 'ENG101 - Technical Writing',
            code: 'ENG101-2024',
            teacher: {
              id: 5,
              name: 'Dr. Lisa Johnson',
              email: 'lisa.johnson@university.edu',
              profilePhoto: null
            },
            department: 'English',
            students: 35,
            exams: 2,
            status: 'active',
            createdDate: '2024-01-14',
            description: 'Technical writing and communication skills'
          }
        ];

  const filteredClasses = classes.filter(classItem => {
    const matchesSearch = classItem.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         classItem.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         classItem.teacher.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDepartment = departmentFilter === 'all' || classItem.department === departmentFilter;
    return matchesSearch && matchesDepartment;
  });

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
      // Call the real API to update class status
      const result = await classesService.updateClassStatus(classId, newStatus);
      
      if (result.success) {
        setClasses(prevClasses => 
          prevClasses.map(classItem => 
            classItem.id === classId ? { ...classItem, status: newStatus } : classItem
          )
        );
        
        toast({
          title: "Success",
          description: `Class ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`,
        });
      } else {
        throw new Error(result.message || 'Failed to update class status');
      }
    } catch (error) {
      console.error('Error updating class status:', error);
      toast({
        title: "Error",
        description: "Failed to update class status: " + error.message,
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
    inactive: classes.filter(c => c.status === 'inactive').length,
    totalStudents: classes.reduce((sum, c) => sum + c.students, 0),
    totalExams: classes.reduce((sum, c) => sum + c.exams, 0)
  };

  const departments = [...new Set(classes.map(c => c.department).filter(dept => dept && dept.trim() !== ''))];

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
      <div>
        <h1 className="text-3xl font-bold mb-2">All Classes</h1>
        <p className="text-muted-foreground">
          Monitor and manage all classes across the platform.
        </p>
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
            <CardTitle className="text-sm font-medium text-muted-foreground">Inactive Classes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-600">{stats.inactive}</div>
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
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Class Management</CardTitle>
          <CardDescription>Search and filter classes by department and status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search by class name, code, or teacher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.filter(dept => dept && dept.trim() !== '').map(dept => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Classes Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Class</TableHead>
                  <TableHead>Teacher</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead>Exams</TableHead>
                  <TableHead>Status</TableHead>
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
                    <TableCell>
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
                    </TableCell>
                    <TableCell>{classItem.department}</TableCell>
                    <TableCell>
                      <div className="text-center">
                        <div className="font-medium">{classItem.students}</div>
                        <div className="text-xs text-muted-foreground">enrolled</div>
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
                    <TableCell>{new Date(classItem.createdDate).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            ⋮
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => {
                            setSelectedClass(classItem);
                            setIsDetailsDialogOpen(true);
                          }}>
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigate(`/admin/classes/${classItem.id}/students`)}>
                            View Students
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigate(`/admin/classes/${classItem.id}/exams`)}>
                            View Exams
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleStatusChange(classItem.id, classItem.status === 'active' ? 'inactive' : 'active')}
                            className={classItem.status === 'active' ? 'text-orange-600' : 'text-green-600'}
                          >
                            {classItem.status === 'active' ? 'Deactivate Class' : 'Activate Class'}
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

      {/* Class Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Class Details</DialogTitle>
            <DialogDescription>
              Detailed information about the selected class.
            </DialogDescription>
          </DialogHeader>
          {selectedClass && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Class Name</label>
                  <p className="text-lg font-medium">{selectedClass.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Class Code</label>
                  <p className="text-lg font-medium">{selectedClass.code}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Department</label>
                  <p className="text-lg font-medium">{selectedClass.department}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <div className="mt-1">{getStatusBadge(selectedClass.status)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Students</label>
                  <p className="text-lg font-medium">{selectedClass.students}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Exams</label>
                  <p className="text-lg font-medium">{selectedClass.exams}</p>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Description</label>
                <p className="mt-1">{selectedClass.description}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Teacher</label>
                <div className="flex items-center space-x-3 mt-2">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={selectedClass.teacher.profilePhoto} alt={selectedClass.teacher.name} />
                    <AvatarFallback>
                      {selectedClass.teacher.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{selectedClass.teacher.name}</div>
                    <div className="text-sm text-muted-foreground">{selectedClass.teacher.email}</div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button onClick={() => navigate(`/admin/classes/${selectedClass.id}/students`)}>
                  View Students
                </Button>
                <Button onClick={() => navigate(`/admin/classes/${selectedClass.id}/exams`)}>
                  View Exams
                </Button>
                <Button variant="outline" onClick={() => setIsDetailsDialogOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminClassesPage;
