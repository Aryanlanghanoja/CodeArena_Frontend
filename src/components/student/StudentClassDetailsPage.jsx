import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../hooks/use-toast';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Progress } from '../ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { ArrowLeft, Users, FileText, Megaphone, BookOpen, Clock, CheckCircle, AlertCircle, BarChart2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import classesService from '../../services/classesService';
import assignmentsService from '../../services/assignmentsService';
import announcementsService from '../../services/announcementsService';

export default function StudentClassDetailsPage() {
  const { classId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [classData, setClassData] = useState(null);
  const [students, setStudents] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [announcementTagFilter, setAnnouncementTagFilter] = useState('all');

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
        
        // Fetch class details, assignments, and announcements in parallel
        const [classResponse, assignmentsResponse, announcementsResponse] = await Promise.all([
          classesService.getClassDetails(classId),
          assignmentsService.getClassAssignments(classId).catch(() => ({ success: false, data: { assignments: [] } })),
          announcementsService.getClassAnnouncements(classId).catch(() => ({ success: false, data: { announcements: [] } }))
        ]);
        
        if (!isMounted) return;
        
        if (classResponse.success) {
          setClassData(classResponse.data.class);
          
          // Fetch class members
          const membersResponse = await classesService.listClassMembers(classId);
          if (membersResponse.success) {
            const transformedStudents = membersResponse.data.members.map(member => ({
              id: member.user.user_id,
              name: member.user.name || `${member.user.first_name} ${member.user.last_name}`,
              email: member.user.email,
              role: member.role || 'student',
              status: member.status,
              avatar: member.user.avatar_url,
              joined: member.created_at
            }));
            setStudents(transformedStudents);
          }
        }
        
        // Set assignments
        if (assignmentsResponse.success) {
          const formattedAssignments = assignmentsResponse.data.assignments.map(assignment => 
            assignmentsService.formatAssignmentData(assignment)
          );
          setAssignments(formattedAssignments);
        }
        
        // Set announcements
        if (announcementsResponse.success) {
          const formattedAnnouncements = announcementsResponse.data.announcements.map(announcement => 
            announcementsService.formatAnnouncementData(announcement)
          );
          setAnnouncements(formattedAnnouncements);
        }
        
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


  const getDifficultyColor = (difficulty) => {
    const colors = {
      'Easy': 'bg-green-100 text-green-800',
      'Medium': 'bg-yellow-100 text-yellow-800',
      'Hard': 'bg-red-100 text-red-800'
    };
    return colors[difficulty] || 'bg-gray-100 text-gray-800';
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
  const handleStartAssignment = (assignmentId) => {
    navigate(`/student/classes/${classId}/assignments/${assignmentId}/solve`);
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
        <Button onClick={() => navigate('/student/classes')} className="mt-4">
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
            <h1 className="text-2xl font-bold">{classData.class_name}</h1>
            <p className="text-muted-foreground text-sm">Class Code: {classData.join_code}</p>
          </div>
        </div>
      </div>

      <Tabs 
        defaultValue="overview" 
        className="flex-1 flex flex-col overflow-hidden"
        onValueChange={setActiveTab}
      >
        <div className="px-6 pt-4">
          <TabsList className="grid w-full grid-cols-4 bg-muted/50 p-1 rounded-lg">
            <TabsTrigger 
              value="overview" 
              className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md transition-all"
            >
              <BarChart2 className="mr-2 h-4 w-4" />
              <span className="whitespace-nowrap">Overview</span>
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
              value="students" 
              className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md transition-all"
            >
              <Users className="mr-2 h-4 w-4" />
              <span className="whitespace-nowrap">Students ({students.length})</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Overview Tab */}
        <TabsContent value="overview" className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Class Info */}
          <Card>
            <CardHeader>
              <CardTitle>Class Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h3 className="font-semibold mb-2">Instructor</h3>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={classData.creator?.avatar_url} />
                      <AvatarFallback>
                        {classData.creator?.name?.split(' ').map(n => n[0]).join('') || 'T'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{classData.creator?.name || 'Unknown Teacher'}</p>
                      <p className="text-sm text-muted-foreground">{classData.creator?.email}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Class Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Class Code:</span>
                      <span className="font-mono font-medium">{classData.join_code}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Students:</span>
                      <span>{students.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Assignments:</span>
                      <span>{assignments.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Created:</span>
                      <span>{new Date(classData.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Assignments</CardTitle>
                <CardDescription>Latest assignments posted</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {assignments.slice(0, 3).map((assignment) => (
                    <div key={assignment.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{assignment.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {assignment.totalPoints} pts
                          </Badge>
                          {assignment.dueDate && (
                            <span className="text-xs text-muted-foreground">
                              Due: {new Date(assignment.dueDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </div>
                  ))}
                  {assignments.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No assignments yet
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Announcements</CardTitle>
                <CardDescription>Latest announcements from instructor</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {announcements.slice(0, 3).map((announcement) => (
                    <div key={announcement.id} className="p-3 border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-sm">{announcement.title}</h4>
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
                      <div className="text-xs text-muted-foreground max-h-12 overflow-hidden">
                        <div 
                          dangerouslySetInnerHTML={{ 
                            __html: announcement.content
                              .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                              .replace(/\*(.*?)\*/g, '<em>$1</em>')
                              .replace(/`(.*?)`/g, '<code class="bg-muted px-1 rounded text-xs">$1</code>')
                              .replace(/^\- (.*$)/gm, '<li>$1</li>')
                              .replace(/^\d+\. (.*$)/gm, '<li>$1</li>')
                              .replace(/^> (.*$)/gm, '<blockquote class="border-l-2 border-muted pl-2 italic">$1</blockquote>')
                              .replace(/\n/g, '<br>')
                          }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        {announcement.timeAgo}
                      </p>
                    </div>
                  ))}
                  {announcements.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No announcements yet
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Assignments Tab */}
        <TabsContent value="assignments" className="flex-1 overflow-y-auto p-6 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Assignments</CardTitle>
              <CardDescription>
                {assignments.length} assignments available
              </CardDescription>
            </CardHeader>
            <CardContent>
              {assignments.length > 0 ? (
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
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleStartAssignment(assignment.id)}
                            >
                              Start Assignment
                            </Button>
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
                  <p className="text-muted-foreground">
                    Your instructor hasn't posted any assignments yet.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Announcements Tab */}
        <TabsContent value="announcements" className="flex-1 overflow-y-auto p-6 space-y-4">
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
              <CardTitle>Announcements</CardTitle>
              <CardDescription>
                {announcements.length} announcements posted
              </CardDescription>
            </CardHeader>
            <CardContent>
              {getFilteredAnnouncements().length > 0 ? (
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
                      <p className="text-muted-foreground">
                        Your instructor hasn't posted any announcements yet.
                      </p>
                    </>
                  ) : (
                    <>
                      <h3 className="text-lg font-semibold mb-2">No announcements with this tag</h3>
                      <p className="text-muted-foreground">
                        No announcements found with the "{announcementTagFilter}" tag.
                      </p>
                      <Button variant="outline" onClick={() => setAnnouncementTagFilter('all')} className="mt-4">
                        Show All Announcements
                      </Button>
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Students Tab */}
        <TabsContent value="students" className="flex-1 overflow-y-auto p-6 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Class Members</CardTitle>
              <CardDescription>
                {students.length} students enrolled in this class
              </CardDescription>
            </CardHeader>
            <CardContent>
              {students.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {students.map((student) => (
                    <div key={student.id} className="flex items-center gap-3 p-3 border rounded-lg">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={student.avatar} />
                        <AvatarFallback>
                          {student.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{student.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge 
                            variant={student.role === 'assistant' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {student.role === 'assistant' ? 'Assistant' : 'Student'}
                          </Badge>
                          <Badge 
                            variant={student.status === 'active' ? 'default' : 'outline'}
                            className="text-xs"
                          >
                            {student.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No students found</h3>
                  <p className="text-muted-foreground">
                    No students are enrolled in this class yet.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
