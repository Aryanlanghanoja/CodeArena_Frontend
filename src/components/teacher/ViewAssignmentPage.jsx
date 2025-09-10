import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../hooks/use-toast';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { ArrowLeft, Clock, FileText, Users, Edit, Trash2, Eye } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import assignmentsService from '../../services/assignmentsService';

const ViewAssignmentPage = () => {
  const { classId, assignmentId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssignment();
  }, [assignmentId]);

  const fetchAssignment = async () => {
    try {
      setLoading(true);
      const response = await assignmentsService.getAssignmentDetails(assignmentId);
      if (response.success) {
        setAssignment(response.data.assignment);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to load assignment',
          variant: 'destructive',
        });
        navigate(`/teacher/classes/${classId}`);
      }
    } catch (error) {
      console.error('Error fetching assignment:', error);
      toast({
        title: 'Error',
        description: 'Failed to load assignment',
        variant: 'destructive',
      });
      navigate(`/teacher/classes/${classId}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigate(`/teacher/classes/${classId}/assignments/${assignmentId}/edit`);
  };

  const handleViewSubmissions = () => {
    navigate(`/teacher/classes/${classId}/assignments/${assignmentId}/submissions`);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this assignment? This action cannot be undone.')) {
      try {
        const response = await assignmentsService.deleteAssignment(assignmentId);
        if (response.success) {
          toast({
            title: 'Success',
            description: 'Assignment deleted successfully',
          });
          navigate(`/teacher/classes/${classId}`);
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
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'hard': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="text-center py-8">
        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Assignment not found</h3>
        <p className="text-muted-foreground mb-4">
          The assignment you're looking for doesn't exist or you don't have access to it.
        </p>
        <Button onClick={() => navigate(`/teacher/classes/${classId}`)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Class
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/teacher/classes/${classId}`)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Class
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{assignment.title}</h1>
              <p className="text-muted-foreground">
                Assignment Details
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleEdit}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <Button variant="outline" onClick={handleViewSubmissions}>
              <Eye className="mr-2 h-4 w-4" />
              View Submissions
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Assignment Info */}
          <div className="lg:col-span-1">
            <Card className="h-fit">
              <CardHeader>
                <CardTitle>Assignment Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant={assignment.status === 'published' ? 'default' : 'secondary'}>
                    {assignment.status}
                  </Badge>
                  {assignment.isOverdue && (
                    <Badge variant="destructive">Overdue</Badge>
                  )}
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span>{assignment.questions?.length || 0} questions</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{assignment.submissionCount || 0} submissions</span>
                  </div>
                  
                  {assignment.dueDate && (
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium">Total Points:</span>
                    <span>{assignment.totalPoints || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Assignment Content */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                {assignment.description ? (
                  <div className="prose prose-sm max-w-none dark:prose-invert">
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
                ) : (
                  <p className="text-muted-foreground">No description provided.</p>
                )}
              </CardContent>
            </Card>

            {/* Questions List */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Questions</CardTitle>
                <CardDescription>
                  {assignment.questions?.length || 0} questions in this assignment
                </CardDescription>
              </CardHeader>
              <CardContent>
                {assignment.questions && assignment.questions.length > 0 ? (
                  <div className="space-y-4">
                    {assignment.questions.map((question, index) => (
                      <div key={question.question_id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Q{index + 1}</span>
                            <h3 className="font-semibold">{question.question_title}</h3>
                            <Badge className={getDifficultyColor(question.difficulty)}>
                              {question.difficulty}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {question.description}
                        </p>
                        {question.tags && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {question.tags.split(',').map((tag, tagIndex) => (
                              <Badge key={tagIndex} variant="outline" className="text-xs">
                                {tag.trim()}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No questions</h3>
                    <p className="text-muted-foreground">
                      This assignment doesn't have any questions yet.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewAssignmentPage;
