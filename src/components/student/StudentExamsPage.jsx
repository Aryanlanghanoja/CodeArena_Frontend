import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
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
import { useToast } from '../../hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import examsService from '../../services/examsService';

const StudentExamsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [classFilter, setClassFilter] = useState('all');
  const [selectedExam, setSelectedExam] = useState(null);
  const [isExamDetailsOpen, setIsExamDetailsOpen] = useState(false);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        setLoading(true);
        const res = await examsService.listExams();
        const mapExam = (e) => ({
          id: e.id || e.exam_id,
          title: e.title || 'Untitled',
          class: {
            name: e.class?.name || e.class_name || 'Class',
            code: e.class?.code || e.class_code || '-'
          },
          startDate: e.start_date || e.startDate,
          endDate: e.end_date || e.endDate,
          startTime: e.start_time || e.startTime,
          endTime: e.end_time || e.endTime,
          duration: e.duration_minutes ?? e.duration,
          totalMarks: e.total_marks ?? e.totalMarks,
          questions: e.questions_count ?? (Array.isArray(e.question_ids) ? e.question_ids.length : 0),
          status: e.status || 'draft',
          instructions: e.instructions || '',
          allowedLanguages: e.allowed_languages || [],
          submitted: false,
          score: null
        });
        const list = (res.data || []).map(mapExam);
        setExams(list);
      } catch (error) {
        toast({ title: 'Error', description: 'Failed to fetch exams', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    fetchExams();
  }, [toast]);

  // Formatting helpers (align with TeacherExamsPage)
  const isValidDate = (d) => {
    const t = Date.parse(d);
    return !isNaN(t);
  };
  const formatDate = (dateStr) => (dateStr && isValidDate(dateStr) ? new Date(dateStr).toLocaleDateString() : '—');
  const formatTimeRange = (startTime, endTime) => {
    if (!startTime || !endTime) return '—';
    const formatTimePart = (v) => {
      try {
        if (typeof v === 'string' && v.includes('T')) {
          const dt = new Date(v);
          return isNaN(dt.getTime()) ? v : dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
      } catch {}
      return v;
    };
    return `${formatTimePart(startTime)} - ${formatTimePart(endTime)}`;
  };
  const formatDurationHM = (minutes) => {
    const m = Number(minutes);
    if (!isFinite(m) || m <= 0) return '—';
    const h = Math.floor(m / 60);
    const rem = m % 60;
    return `${h}h ${rem}m`;
  };
  const formatMarks = (totalMarks) => {
    const n = Number(totalMarks);
    if (!isFinite(n) || n <= 0) return '—';
    return `${n} marks`;
  };

  const filteredExams = exams.filter(exam => {
    const matchesSearch = exam.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         exam.class.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || exam.status === statusFilter;
    const matchesClass = classFilter === 'all' || exam.class.id?.toString() === classFilter;
    return matchesSearch && matchesStatus && matchesClass;
  });

  const handleStartExam = (exam) => {
    // Navigate to exam taking interface
    navigate(`/student/exams/${exam.id}/take`);
  };

  const handleViewResults = (exam) => {
    // Navigate to results page
    navigate(`/student/exams/${exam.id}/results`);
  };

  const getStatusBadge = (status) => {
    const variants = {
      upcoming: 'secondary',
      active: 'default',
      completed: 'success',
      expired: 'destructive'
    };
    
    return (
      <Badge variant={variants[status] || 'secondary'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getScoreBadge = (score, totalMarks) => {
    if (score === null) return null;
    
    const percentage = (score / totalMarks) * 100;
    let variant = 'secondary';
    
    if (percentage >= 90) variant = 'default';
    else if (percentage >= 80) variant = 'default';
    else if (percentage >= 70) variant = 'secondary';
    else if (percentage >= 60) variant = 'secondary';
    else variant = 'destructive';
    
    return (
      <Badge variant={variant}>
        {score}/{totalMarks} ({percentage.toFixed(1)}%)
      </Badge>
    );
  };

  const formatTimeRemaining = (seconds) => {
    if (!seconds) return null;
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const stats = {
    total: exams.length,
    upcoming: exams.filter(e => e.status === 'upcoming').length,
    active: exams.filter(e => e.status === 'active').length,
    completed: exams.filter(e => e.status === 'completed').length,
    totalMarks: exams.filter(e => e.submitted).reduce((sum, exam) => sum + exam.score, 0),
    maxMarks: exams.filter(e => e.submitted).reduce((sum, exam) => sum + exam.totalMarks, 0)
  };

  const classes = [...new Map(exams.map(e => [e.class.code || e.class.name, e.class])).values()];

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
          <h1 className="text-3xl font-bold mb-2">My Exams</h1>
          <p className="text-muted-foreground">
            View and take exams for your enrolled classes.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
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
            <CardTitle className="text-sm font-medium text-muted-foreground">Upcoming</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{stats.upcoming}</div>
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
            <CardTitle className="text-sm font-medium text-muted-foreground">Average Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">
              {stats.maxMarks > 0 ? ((stats.totalMarks / stats.maxMarks) * 100).toFixed(1) : 0}%
            </div>
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
                <SelectItem value="upcoming">Upcoming</SelectItem>
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
                  <SelectItem key={cls.code} value={cls.code}>
                    {cls.name}
                  </SelectItem>
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
                  <TableHead>Status</TableHead>
                  <TableHead>Score</TableHead>
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
                        <div className="font-medium">{formatDate(exam.startDate)}</div>
                        <div className="text-sm text-muted-foreground">
                          {formatTimeRange(exam.startTime, exam.endTime)}
                        </div>
                        {exam.status === 'active' && exam.timeRemaining && (
                          <div className="text-xs text-red-600 font-medium">
                            ⏰ {formatTimeRemaining(exam.timeRemaining)} remaining
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-center">
                        <div className="font-medium">{formatDurationHM(exam.duration)}</div>
                        <div className="text-xs text-muted-foreground">{formatMarks(exam.totalMarks)}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(exam.status)}
                    </TableCell>
                    <TableCell>
                      {getScoreBadge(exam.score, exam.totalMarks)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        {exam.status === 'upcoming' && exam.canStart && (
                          <Button 
                            size="sm" 
                            onClick={() => handleStartExam(exam)}
                            disabled={new Date() < new Date(exam.startDate + 'T' + exam.startTime)}
                          >
                            {new Date() < new Date(exam.startDate + 'T' + exam.startTime) ? 'Not Started' : 'Start Exam'}
                          </Button>
                        )}
                        {exam.status === 'active' && exam.canStart && (
                          <Button 
                            size="sm" 
                            onClick={() => handleStartExam(exam)}
                          >
                            Continue Exam
                          </Button>
                        )}
                        {exam.status === 'completed' && exam.submitted && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleViewResults(exam)}
                          >
                            View Results
                          </Button>
                        )}
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => {
                            setSelectedExam(exam);
                            setIsExamDetailsOpen(true);
                          }}
                        >
                          Details
                        </Button>
                      </div>
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

      {/* Exam Details Dialog */}
      <Dialog open={isExamDetailsOpen} onOpenChange={setIsExamDetailsOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Exam Details</DialogTitle>
            <DialogDescription>
              View complete exam information and instructions.
            </DialogDescription>
          </DialogHeader>
          {selectedExam && (
            <ExamDetails exam={selectedExam} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Exam Details Component
const ExamDetails = ({ exam }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-muted-foreground">Title</label>
          <p className="text-lg font-medium">{exam.title}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-muted-foreground">Class</label>
          <p className="text-lg font-medium">{exam.class.name} ({exam.class.code})</p>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-muted-foreground">Instructions</label>
        <p className="mt-1">{exam.instructions}</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="text-sm font-medium text-muted-foreground">Schedule</label>
          <p className="mt-1">
            {new Date(exam.startDate).toLocaleDateString()}<br/>
            {exam.startTime} - {exam.endTime}
          </p>
        </div>
        <div>
          <label className="text-sm font-medium text-muted-foreground">Duration</label>
          <p className="mt-1">
            {Math.floor(exam.duration / 60)}h {exam.duration % 60}m<br/>
            {exam.totalMarks} marks
          </p>
        </div>
        <div>
          <label className="text-sm font-medium text-muted-foreground">Questions</label>
          <p className="mt-1">
            {exam.questions} questions<br/>
            {exam.totalMarks} total marks
          </p>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-muted-foreground">Allowed Programming Languages</label>
        <div className="flex gap-2 mt-2">
          {exam.allowedLanguages.map(lang => (
            <Badge key={lang} variant="outline" className="capitalize">
              {lang}
            </Badge>
          ))}
        </div>
      </div>

      {exam.submitted && (
        <div>
          <label className="text-sm font-medium text-muted-foreground">Submission Details</label>
          <div className="mt-2 space-y-2">
            <div className="flex justify-between items-center p-2 border rounded">
              <span>Started:</span>
              <span>{new Date(exam.startTime).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center p-2 border rounded">
              <span>Submitted:</span>
              <span>{new Date(exam.endTime).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center p-2 border rounded">
              <span>Score:</span>
              <span className="font-medium">{exam.score}/{exam.totalMarks} ({(exam.score / exam.totalMarks * 100).toFixed(1)}%)</span>
            </div>
          </div>
        </div>
      )}

      <div className="pt-4">
        {exam.status === 'upcoming' && exam.canStart && (
          <Button 
            className="w-full"
            onClick={() => {
              // Navigate to exam taking interface
              window.location.href = `/student/exams/${exam.id}/take`;
            }}
            disabled={new Date() < new Date(exam.startDate + 'T' + exam.startTime)}
          >
            {new Date() < new Date(exam.startDate + 'T' + exam.startTime) ? 'Exam Not Started Yet' : 'Start Exam Now'}
          </Button>
        )}
        {exam.status === 'active' && exam.canStart && (
          <Button 
            className="w-full"
            onClick={() => {
              // Navigate to exam taking interface
              window.location.href = `/student/exams/${exam.id}/take`;
            }}
          >
            Continue Exam
          </Button>
        )}
        {exam.status === 'completed' && exam.submitted && (
          <Button 
            className="w-full"
            variant="outline"
            onClick={() => {
              // Navigate to results page
              window.location.href = `/student/exams/${exam.id}/results`;
            }}
          >
            View Detailed Results
          </Button>
        )}
      </div>
    </div>
  );
};

export default StudentExamsPage;
