import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../hooks/use-toast';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { ArrowLeft, Download, Eye, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import assignmentsService from '../../services/assignmentsService';

const ViewSubmissionsPage = () => {
  const { classId, assignmentId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [assignment, setAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssignment();
    fetchSubmissions();
  }, [assignmentId]);

  const fetchAssignment = async () => {
    try {
      const response = await assignmentsService.getAssignmentDetails(assignmentId);
      if (response.success) {
        setAssignment(response.data.assignment);
      }
    } catch (error) {
      console.error('Error fetching assignment:', error);
    }
  };

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      // This would be a new API endpoint for fetching submissions
      // For now, we'll use mock data
      const mockSubmissions = [
        {
          id: 1,
          student: {
            id: 1,
            name: 'John Doe',
            email: 'john.doe@student.edu',
            avatar: null
          },
          question: {
            id: 1,
            title: 'Two Sum'
          },
          code: 'def twoSum(nums, target):\n    for i in range(len(nums)):\n        for j in range(i+1, len(nums)):\n            if nums[i] + nums[j] == target:\n                return [i, j]\n    return []',
          language: 'python',
          status: 'accepted',
          score: 100,
          submitted_at: '2025-01-09T10:30:00Z',
          execution_time: 0.05
        },
        {
          id: 2,
          student: {
            id: 2,
            name: 'Jane Smith',
            email: 'jane.smith@student.edu',
            avatar: null
          },
          question: {
            id: 1,
            title: 'Two Sum'
          },
          code: 'def twoSum(nums, target):\n    hashmap = {}\n    for i, num in enumerate(nums):\n        complement = target - num\n        if complement in hashmap:\n            return [hashmap[complement], i]\n        hashmap[num] = i\n    return []',
          language: 'python',
          status: 'accepted',
          score: 100,
          submitted_at: '2025-01-09T11:15:00Z',
          execution_time: 0.02
        },
        {
          id: 3,
          student: {
            id: 3,
            name: 'Bob Johnson',
            email: 'bob.johnson@student.edu',
            avatar: null
          },
          question: {
            id: 2,
            title: 'Reverse Linked List'
          },
          code: 'def reverseList(head):\n    prev = None\n    current = head\n    while current:\n        next_temp = current.next\n        current.next = prev\n        prev = current\n        current = next_temp\n    return prev',
          language: 'python',
          status: 'wrong_answer',
          score: 0,
          submitted_at: '2025-01-09T12:00:00Z',
          execution_time: 0.01
        }
      ];
      setSubmissions(mockSubmissions);
    } catch (error) {
      console.error('Error fetching submissions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load submissions',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'wrong_answer':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'time_limit_exceeded':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'runtime_error':
        return <AlertCircle className="h-4 w-4 text-orange-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'wrong_answer':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'time_limit_exceeded':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'runtime_error':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const handleViewSubmission = (submissionId) => {
    // Navigate to detailed submission view
    console.log('View submission:', submissionId);
  };

  const handleDownloadSubmissions = () => {
    // Download all submissions as CSV or ZIP
    console.log('Download submissions');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/teacher/classes/${classId}/assignments/${assignmentId}`)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Assignment
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Submissions</h1>
              <p className="text-muted-foreground">
                {assignment?.title} - Student Submissions
              </p>
            </div>
          </div>
          <Button onClick={handleDownloadSubmissions}>
            <Download className="mr-2 h-4 w-4" />
            Download All
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Submissions</p>
                  <p className="text-2xl font-bold">{submissions.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Accepted</p>
                  <p className="text-2xl font-bold">
                    {submissions.filter(s => s.status === 'accepted').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                  <XCircle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Failed</p>
                  <p className="text-2xl font-bold">
                    {submissions.filter(s => s.status !== 'accepted').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <Clock className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg. Score</p>
                  <p className="text-2xl font-bold">
                    {submissions.length > 0 
                      ? Math.round(submissions.reduce((sum, s) => sum + s.score, 0) / submissions.length)
                      : 0}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Submissions Table */}
        <Card>
          <CardHeader>
            <CardTitle>Student Submissions</CardTitle>
            <CardDescription>
              View and manage student submissions for this assignment
            </CardDescription>
          </CardHeader>
          <CardContent>
            {submissions.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Question</TableHead>
                    <TableHead>Language</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissions.map((submission) => (
                    <TableRow key={submission.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={submission.student.avatar} />
                            <AvatarFallback>
                              {submission.student.name
                                .split(' ')
                                .map((n) => n[0])
                                .join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{submission.student.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {submission.student.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{submission.question.title}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{submission.language}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(submission.status)}
                          <Badge className={getStatusColor(submission.status)}>
                            {submission.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{submission.score}%</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {new Date(submission.submitted_at).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(submission.submitted_at).toLocaleTimeString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewSubmission(submission.id)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No submissions yet</h3>
                <p className="text-muted-foreground">
                  Students haven't submitted any solutions for this assignment yet.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ViewSubmissionsPage;
