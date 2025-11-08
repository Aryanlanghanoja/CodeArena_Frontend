import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../hooks/use-toast';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { ArrowLeft, Search, Download, Eye, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import examsService from '../../services/examsService';
import { getLanguageById } from '../../data/judge0Languages';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

const ViewExamSubmissionsPage = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [exam, setExam] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchRollNumber, setSearchRollNumber] = useState('');
  const [selectedQuestion, setSelectedQuestion] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 15,
    total: 0,
    last_page: 1,
  });

  useEffect(() => {
    fetchExam();
  }, [examId]);

  useEffect(() => {
    fetchSubmissions();
  }, [examId, currentPage, searchRollNumber, selectedQuestion]);

  const fetchExam = async () => {
    try {
      const result = await examsService.getExamDetails(examId);
      if (result.success && result.data) {
        setExam(result.data);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to fetch exam details',
          variant: 'destructive',
        });
        navigate('/teacher/exams');
      }
    } catch (error) {
      console.error('Error fetching exam:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch exam details',
        variant: 'destructive',
      });
    }
  };

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        per_page: 15,
      };

      if (searchRollNumber.trim()) {
        params.roll_number = searchRollNumber.trim();
      }

      if (selectedQuestion && selectedQuestion !== 'all') {
        params.question_id = selectedQuestion;
      }

      const result = await examsService.getExamSubmissions(examId, params);
      if (result.success && result.data) {
        setSubmissions(result.data.submissions || []);
        setPagination(result.data.pagination || pagination);
      } else {
        toast({
          title: 'Error',
          description: result.message || 'Failed to fetch submissions',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch submissions',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchSubmissions();
  };

  const getStatusBadge = (status) => {
    const statusLower = (status || '').toLowerCase();
    if (statusLower.includes('accepted') || statusLower === 'passed') {
      return <Badge variant="default" className="bg-green-500">Accepted</Badge>;
    } else if (statusLower.includes('wrong') || statusLower === 'failed') {
      return <Badge variant="destructive">Wrong Answer</Badge>;
    } else if (statusLower === 'pending') {
      return <Badge variant="secondary">Pending</Badge>;
    } else {
      return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getLanguageName = (languageId) => {
    const lang = getLanguageById(languageId);
    return lang?.name || `Language ${languageId}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  };

  const formatScore = (score, totalMarks) => {
    if (score === null || score === undefined) return '—';
    const percentage = totalMarks ? ((score / totalMarks) * 100).toFixed(1) : '0';
    return `${score} (${percentage}%)`;
  };

  if (loading && !exam) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="flex items-center justify-center h-64">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Exam not found</CardTitle>
            <CardDescription>The exam you're looking for doesn't exist.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/teacher/exams')}>Back to Exams</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => navigate('/teacher/exams')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Exams
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{exam.title}</h1>
            <p className="text-muted-foreground">View and manage student submissions</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pagination.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{exam.questions_count || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Marks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{exam.total_marks || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Duration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{exam.duration_minutes || 0} min</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter submissions by student or question</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by roll number..."
                value={searchRollNumber}
                onChange={(e) => setSearchRollNumber(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch();
                  }
                }}
              />
            </div>
            <Select value={selectedQuestion} onValueChange={setSelectedQuestion}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by question" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Questions</SelectItem>
                {exam.questions && Array.isArray(exam.questions) && exam.questions.map((q) => (
                  <SelectItem key={q.question_id || q.id} value={String(q.question_id || q.id)}>
                    {q.question_title || q.title || `Question ${q.question_id || q.id}`}
                  </SelectItem>
                ))}
                {exam.question_ids && Array.isArray(exam.question_ids) && exam.question_ids.length > 0 && 
                  !exam.questions && exam.question_ids.map((qId) => (
                    <SelectItem key={qId} value={String(qId)}>
                      Question {qId}
                    </SelectItem>
                  ))
                }
              </SelectContent>
            </Select>
            <Button onClick={handleSearch}>
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Submissions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Submissions</CardTitle>
          <CardDescription>
            Showing {submissions.length} of {pagination.total} submissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : submissions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No submissions found
            </div>
          ) : (
            <>
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Roll Number</TableHead>
                      <TableHead>Question</TableHead>
                      <TableHead>Language</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Test Cases</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Submitted At</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {submissions.map((submission) => (
                      <TableRow key={submission.submission_id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{submission.user_name}</div>
                            <div className="text-sm text-muted-foreground">{submission.user_email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {submission.roll_number || '—'}
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs truncate">
                            {submission.question_title}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {getLanguageName(submission.language_id)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(submission.status)}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>Passed: {submission.passed_testcases}/{submission.total_testcases}</div>
                            {submission.public_testcases > 0 && (
                              <div className="text-muted-foreground">
                                Public: {submission.public_passed}/{submission.public_testcases}
                              </div>
                            )}
                            {submission.hidden_testcases > 0 && (
                              <div className="text-muted-foreground">
                                Hidden: {submission.hidden_passed}/{submission.hidden_testcases}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {formatScore(submission.score, exam.total_marks)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {formatDate(submission.submitted_at)}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              // Navigate to submission details
                              navigate(`/submissions/${submission.submission_id}/details`);
                            }}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {pagination.last_page > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Page {pagination.current_page} of {pagination.last_page}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.min(pagination.last_page, p + 1))}
                      disabled={currentPage === pagination.last_page}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ViewExamSubmissionsPage;

