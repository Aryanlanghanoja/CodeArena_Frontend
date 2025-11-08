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
import classesService from '../../services/classesService';
import { getLanguageById } from '../../data/judge0Languages';

const parseDateTime = (dateStr, timeStr) => {
  if (!dateStr) return null;

  if (timeStr && timeStr.includes('T')) {
    const dt = new Date(timeStr);
    return Number.isNaN(dt.getTime()) ? null : dt;
  }

  const isoCandidate = timeStr ? `${dateStr}T${timeStr}` : dateStr;
  let dt = new Date(isoCandidate);

  if (!Number.isNaN(dt.getTime())) {
    return dt;
  }

  dt = new Date(`${dateStr} ${timeStr}`);
  return Number.isNaN(dt.getTime()) ? null : dt;
};

const deriveExamRuntimeStatus = (exam) => {
  const start = parseDateTime(exam.startDate || exam.start_date, exam.startTime || exam.start_time);
  const end = parseDateTime(exam.endDate || exam.end_date, exam.endTime || exam.end_time);
  const now = new Date();

  if (start && now < start) return 'upcoming';
  if (start && end && now >= start && now <= end) return 'active';
  if (end && now > end) return 'completed';
  return exam.status || 'draft';
};

const secondsUntil = (endDateTime) => {
  if (!endDateTime) return null;
  const diffMs = endDateTime.getTime() - Date.now();
  return diffMs > 0 ? Math.floor(diffMs / 1000) : 0;
};

const StudentExamsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [studentClasses, setStudentClasses] = useState([]);
  const [classLookup, setClassLookup] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [classFilter, setClassFilter] = useState('all');
  const [selectedExam, setSelectedExam] = useState(null);
  const [isExamDetailsOpen, setIsExamDetailsOpen] = useState(false);

  const normalizeClassRef = (cls) => {
    if (!cls) return null;
    return cls.join_code || cls.joinCode || cls.code || cls.class_id || cls.id || null;
  };

  const buildExamRecord = (exam, lookup) => {
    const examClasses = Array.isArray(exam.classes) ? exam.classes : [];

    const matchingClasses = examClasses
      .map(cls => {
        const joinCode = normalizeClassRef(cls);
        if (!joinCode) return null;
        const classInfo = lookup[joinCode];
        if (!classInfo) return null;
        return {
          joinCode,
          name: classInfo.name,
          status: classInfo.status || cls.status || 'draft',
          code: joinCode,
        };
      })
      .filter(Boolean);

    if (matchingClasses.length === 0) {
      // Fallback: allow exam if it declares classes but we don't have lookup info yet
      const fallbackClass = examClasses[0];
      const joinCode = normalizeClassRef(fallbackClass);
      if (!joinCode) {
        return null;
      }

      const fallback = {
        joinCode,
        name: fallbackClass.name || 'Class',
        status: fallbackClass.status || 'draft',
        code: joinCode,
      };

      matchingClasses.push(fallback);
      lookup[joinCode] = lookup[joinCode] || fallback;
    }

    const primaryClass = matchingClasses[0];

    const startDate = exam.start_date || exam.startDate || null;
    const endDate = exam.end_date || exam.endDate || null;
    const startTime = exam.start_time || exam.startTime || null;
    const endTime = exam.end_time || exam.endTime || null;

    const runtimeStatus = deriveExamRuntimeStatus({
      startDate,
      endDate,
      startTime,
      endTime,
      status: exam.status,
    });

    const startDateTime = parseDateTime(startDate, startTime);
    const endDateTime = parseDateTime(endDate, endTime);

    const allowedLanguageIds = Array.isArray(exam.allowed_languages)
      ? exam.allowed_languages
      : Array.isArray(exam.allowedLanguages)
        ? exam.allowedLanguages
        : [];

    const allowedLanguages = allowedLanguageIds.map((id) => {
      const meta = getLanguageById(id);
      return { id, name: meta?.name || `Language ${id}` };
    });

    const durationMinutes = exam.duration_minutes ?? exam.duration ?? null;
    const questionsCount = exam.questions_count
      ?? (Array.isArray(exam.question_ids) ? exam.question_ids.length : 0)
      ?? (Array.isArray(exam.questions) ? exam.questions.length : 0);

    const canStart = runtimeStatus === 'active' && primaryClass.status === 'active';

    return {
      id: exam.exam_id || exam.id,
      title: exam.title || exam.name || 'Untitled Exam',
      startDate,
      endDate,
      startTime,
      endTime,
      duration: durationMinutes,
      totalMarks: exam.total_marks ?? exam.totalMarks ?? null,
      instructions: exam.instructions || '',
      allowedLanguageIds,
      allowedLanguages,
      questions: questionsCount,
      classes: matchingClasses,
      primaryClass,
      classStatus: primaryClass.status,
      status: runtimeStatus,
      rawStatus: exam.status || 'draft',
      canStart,
      startDateTime,
      endDateTime,
      timeRemaining: runtimeStatus === 'active' ? secondsUntil(endDateTime) : null,
      score: exam.score ?? null,
      submitted: exam.submitted ?? false,
    };
  };

  useEffect(() => {
    const fetchExams = async () => {
      try {
        setLoading(true);

        const [classesRes, examsRes] = await Promise.all([
          classesService.listClasses().catch(() => null),
          examsService.listExams().catch(() => ({ data: [] })),
        ]);

        const classesData = (classesRes?.data?.classes || []).map(cls => ({
          joinCode: normalizeClassRef(cls),
          name: cls.class_name || cls.name || 'Class',
          status: cls.status || 'draft',
          students: cls.student_count ?? 0,
        })).filter(cls => cls.joinCode);

        setStudentClasses(classesData);

        const lookup = classesData.reduce((acc, cls) => {
          acc[cls.joinCode] = cls;
          return acc;
        }, {});

        setClassLookup(lookup);

        const rawExams = Array.isArray(examsRes?.data) ? examsRes.data : [];
        const normalized = rawExams
          .filter(exam => !exam?.isLocalDraft)
          .map(exam => buildExamRecord(exam, lookup))
          .filter(Boolean);

        setExams(normalized);
      } catch (error) {
        console.error('Failed to load exams', error);
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
    const search = searchQuery.toLowerCase();
    const matchesSearch = exam.title.toLowerCase().includes(search) ||
      exam.classes.some(cls => cls.name.toLowerCase().includes(search) || cls.joinCode.toLowerCase().includes(search));

    const matchesStatus = statusFilter === 'all' || exam.status === statusFilter || exam.rawStatus === statusFilter;
    const matchesClass = classFilter === 'all' || exam.classes.some(cls => cls.joinCode === classFilter);
    return matchesSearch && matchesStatus && matchesClass;
  });

  const handleStartExam = (exam) => {
    if (!exam.canStart) {
      toast({
        title: 'Exam not available',
        description: exam.classStatus !== 'active'
          ? 'The associated class is not active yet. Please check with your instructor.'
          : 'This exam is not currently active.',
        variant: 'destructive'
      });
      return;
    }
    navigate(`/student/exams/${exam.id}/take`);
  };

  const handleViewResults = (exam) => {
    // Navigate to results page
    navigate(`/student/exams/${exam.id}/results`);
  };

  const getStatusBadge = (status) => {
    const normalized = status?.toLowerCase?.() || 'draft';
    const variants = {
      upcoming: 'secondary',
      scheduled: 'secondary',
      active: 'default',
      completed: 'success',
      draft: 'outline',
      archived: 'outline',
      expired: 'destructive',
    };

    const label = normalized.replace(/_/g, ' ');

    return (
      <Badge variant={variants[normalized] || 'secondary'}>
        {label.charAt(0).toUpperCase() + label.slice(1)}
      </Badge>
    );
  };

  const getClassStatusBadge = (status) => {
    const normalized = status?.toLowerCase?.() || 'draft';
    const variants = {
      active: 'default',
      draft: 'outline',
      inactive: 'secondary',
    };

    const label = normalized.replace(/_/g, ' ');
    return (
      <Badge variant={variants[normalized] || 'secondary'} className="text-xs">
        {label.charAt(0).toUpperCase() + label.slice(1)}
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
    totalMarks: exams.filter(e => e.submitted).reduce((sum, exam) => sum + (Number(exam.score) || 0), 0),
    maxMarks: exams.filter(e => e.submitted).reduce((sum, exam) => sum + (Number(exam.totalMarks) || 0), 0)
  };
 
  const classes = studentClasses.filter(cls => exams.some(exam => exam.classes.some(ec => ec.joinCode === cls.joinCode)));

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
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
            <Select value={classFilter} onValueChange={setClassFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {classes.map(cls => (
                  <SelectItem key={cls.joinCode} value={cls.joinCode}>
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
                          {exam.instructions
                            ? `${exam.instructions.slice(0, 80)}${exam.instructions.length > 80 ? '…' : ''}`
                            : 'No instructions provided yet.'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{exam.primaryClass.name}</div>
                        <div className="text-sm text-muted-foreground">{exam.primaryClass.joinCode}</div>
                        <div className="mt-1">
                          {getClassStatusBadge(exam.classStatus)}
                        </div>
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
                        {exam.status === 'upcoming' && (
                          <Button size="sm" variant="outline" disabled>
                            Opens Soon
                          </Button>
                        )}
                        {exam.status === 'active' && (
                          <Button 
                            size="sm" 
                            onClick={() => handleStartExam(exam)}
                            disabled={!exam.canStart}
                          >
                            {exam.canStart ? 'Continue Exam' : 'Class Inactive'}
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
            <ExamDetails
              exam={selectedExam}
              getStatusBadge={getStatusBadge}
              getClassStatusBadge={getClassStatusBadge}
              formatDate={formatDate}
              formatTimeRange={formatTimeRange}
              formatDurationHM={formatDurationHM}
              formatMarks={formatMarks}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Exam Details Component
const ExamDetails = ({ exam, getStatusBadge, getClassStatusBadge, formatDate, formatTimeRange, formatDurationHM, formatMarks }) => {
  const otherClasses = exam.classes.slice(1);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-muted-foreground">Title</label>
          <p className="text-lg font-medium">{exam.title}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {getStatusBadge(exam.status)}
            {getClassStatusBadge(exam.classStatus)}
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-muted-foreground">Primary Class</label>
          <p className="text-lg font-medium flex items-center gap-2">
            {exam.primaryClass.name} ({exam.primaryClass.joinCode})
          </p>
        </div>
      </div>

      {otherClasses.length > 0 && (
        <div>
          <label className="text-sm font-medium text-muted-foreground">Additional Classes</label>
          <div className="flex flex-wrap gap-2 mt-2">
            {otherClasses.map(cls => (
              <Badge key={cls.joinCode} variant="outline">
                {cls.name} ({cls.joinCode})
              </Badge>
            ))}
          </div>
        </div>
      )}

      <div>
        <label className="text-sm font-medium text-muted-foreground">Instructions</label>
        <p className="mt-1 whitespace-pre-wrap text-muted-foreground">
          {exam.instructions || 'No instructions provided.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="text-sm font-medium text-muted-foreground">Schedule</label>
          <p className="mt-1">
            {formatDate(exam.startDate)}
            <br />
            {formatTimeRange(exam.startTime, exam.endTime)}
          </p>
        </div>
        <div>
          <label className="text-sm font-medium text-muted-foreground">Duration</label>
          <p className="mt-1">
            {formatDurationHM(exam.duration)}
            <br />
            {formatMarks(exam.totalMarks)}
          </p>
        </div>
        <div>
          <label className="text-sm font-medium text-muted-foreground">Questions</label>
          <p className="mt-1">
            {exam.questions} questions
            <br />
            {exam.totalMarks ? `${exam.totalMarks} total marks` : '—'}
          </p>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-muted-foreground">Allowed Programming Languages</label>
        <div className="flex gap-2 mt-2 flex-wrap">
          {exam.allowedLanguages.length > 0 ? (
            exam.allowedLanguages.map(lang => (
              <Badge key={lang.id} variant="outline">
                {lang.name}
              </Badge>
            ))
          ) : (
            <span className="text-sm text-muted-foreground">Not specified</span>
          )}
        </div>
      </div>

      {exam.submitted && (
        <div>
          <label className="text-sm font-medium text-muted-foreground">Submission Details</label>
          <div className="mt-2 space-y-2">
            <div className="flex justify-between items-center p-2 border rounded">
              <span>Started:</span>
              <span>{exam.startDateTime ? exam.startDateTime.toLocaleString() : '—'}</span>
            </div>
            <div className="flex justify-between items-center p-2 border rounded">
              <span>Completed:</span>
              <span>{exam.endDateTime ? exam.endDateTime.toLocaleString() : '—'}</span>
            </div>
            <div className="flex justify-between items-center p-2 border rounded">
              <span>Score:</span>
              <span className="font-medium">
                {exam.score}/{exam.totalMarks} ({exam.totalMarks ? ((exam.score / exam.totalMarks) * 100).toFixed(1) : '0'}%)
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="pt-4 space-y-2">
        {exam.status === 'active' && (
          <Button
            className="w-full"
            onClick={() => {
              if (exam.canStart) {
                window.location.href = `/student/exams/${exam.id}/take`;
              }
            }}
            disabled={!exam.canStart}
          >
            {exam.canStart ? 'Continue Exam' : 'Class Inactive'}
          </Button>
        )}
        {exam.status === 'completed' && exam.submitted && (
          <Button
            className="w-full"
            variant="outline"
            onClick={() => {
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
