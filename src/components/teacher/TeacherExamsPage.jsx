import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
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
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '../ui/dropdown-menu';
import { useToast } from '../../hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import examsService from '../../services/examsService';
import classesService from '../../services/classesService';
import questionsService from '../../services/questionsService';
import { ScrollArea } from '../ui/scroll-area';

const TeacherExamsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [classes, setClasses] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [classFilter, setClassFilter] = useState('all');
  const [selectedExam, setSelectedExam] = useState(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Load data from services
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [classesRes, examsRes] = await Promise.all([
          classesService.listClasses().catch(() => ({ success: false, data: { classes: [] } })),
          examsService.listExams().catch(() => ({ success: false, data: [] })),
        ]);
        const classList = classesRes?.data?.classes?.map(c => ({ id: c.class_id || c.id || c.join_code, name: c.class_name || c.name, code: c.join_code || c.code, students: c.student_count })) || [];
        setClasses(classList);
        setExams((examsRes?.data || []).map(e => {
          const id = e.id || e.exam_id;
          const duration = e.duration_minutes ?? e.duration;
          const totalMarks = e.total_marks ?? e.total_marks;
          const qIds = e.question_ids || [];
          const cls = classList.find(c => String(c.id) === String(e.class_id || e.class?.id));
          return {
            id,
            title: e.title || 'Untitled',
            class: cls || { name: e.class_name || 'Class', code: e.class_code || '-' },
            startDate: e.start_date || e.startDate,
            endDate: e.end_date || e.endDate,
            startTime: e.start_time || e.startTime,
            endTime: e.end_time || e.endTime,
            duration: duration,
            totalMarks: totalMarks,
            questions: e.questions_count ?? (Array.isArray(qIds) ? qIds.length : 0),
            status: e.status || 'draft',
            instructions: e.instructions || '',
            allowedLanguages: e.allowed_languages || ['python','cpp','javascript'],
            totalStudents: e.total_students ?? 0,
            submittedStudents: e.submitted_students ?? 0,
            averageScore: e.average_score,
            questionsList: qIds
          };
        }));
        // Load a minimal questions list for selection form (if needed later)
        const qs = await questionsService.getAll?.().catch(() => ({ success: false, data: [] }));
        setQuestions(qs?.data || []);
      } catch (error) {
        toast({ title: 'Error', description: 'Failed to fetch data', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [toast]);

  const filteredExams = exams.filter(exam => {
    const matchesSearch = exam.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         exam.class.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || exam.status === statusFilter;
    const matchesClass = classFilter === 'all' || exam.class.id.toString() === classFilter;
    return matchesSearch && matchesStatus && matchesClass;
  });

  const handleCreateExam = async (examData) => {
    try {
      const payload = {
        title: examData.title,
        class_id: examData.classId,
        start_date: examData.startDate,
        end_date: examData.endDate,
        start_time: examData.startTime,
        end_time: examData.endTime,
        duration_minutes: examData.duration,
        total_marks: examData.totalMarks,
        instructions: examData.instructions,
        allowed_languages: examData.allowedLanguages,
        question_ids: examData.selectedQuestions,
        status: examData.status || 'draft',
      };
      const res = await examsService.createExam(payload);
      if (res.success) {
        setIsCreateDialogOpen(false);
        toast({ title: 'Success', description: 'Exam created successfully' });
      } else {
        throw new Error(res.message || 'Failed to create exam');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to create exam",
        variant: "destructive"
      });
    }
  };

  const handleUpdateExam = async (examId, examData) => {
    try {
      const res = await examsService.updateExam(examId, examData);
      if (!res.success) throw new Error(res.message || 'Failed to update exam');
      setIsEditDialogOpen(false);
      toast({ title: 'Success', description: 'Exam updated successfully' });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to update exam",
        variant: "destructive"
      });
    }
  };

  const handleDeleteExam = async (examId) => {
    if (!confirm('Are you sure you want to delete this exam? This action cannot be undone.')) {
      return;
    }

    try {
      const res = await examsService.deleteExam(examId);
      if (!res.success) throw new Error(res.message || 'Failed to delete exam');
      setExams(prevExams => prevExams.filter(exam => exam.id !== examId));
      toast({ title: 'Success', description: 'Exam deleted successfully' });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete exam",
        variant: "destructive"
      });
    }
  };

  const handleStatusChange = async (examId, newStatus) => {
    try {
      const res = await examsService.updateExam(examId, { status: newStatus });
      if (!res.success) throw new Error(res.message || 'Failed to update exam status');
      setExams(prev => prev.map(e => e.id === examId ? { ...e, status: newStatus } : e));
      toast({ title: 'Success', description: `Exam ${newStatus} successfully` });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to update exam status",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      draft: 'secondary',
      scheduled: 'default',
      active: 'default',
      completed: 'success',
      archived: 'secondary'
    };
    
    return (
      <Badge variant={variants[status] || 'secondary'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getDifficultyBadge = (difficulty) => {
    const variants = {
      Easy: 'default',
      Medium: 'secondary',
      Hard: 'destructive'
    };
    
    return (
      <Badge variant={variants[difficulty] || 'secondary'}>
        {difficulty}
      </Badge>
    );
  };

  // Format helpers
  const isValidDate = (d) => {
    const t = Date.parse(d);
    return !isNaN(t);
  };
  const formatDate = (dateStr) => (dateStr && isValidDate(dateStr) ? new Date(dateStr).toLocaleDateString() : '—');
  const formatTimeRange = (startTime, endTime) => {
    if (!startTime || !endTime) return '—';
    return `${startTime} - ${endTime}`;
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

  // Reusable Exam Form
  const ExamForm = ({ initial = {}, classesOptions = [], questionsOptions = [], onSubmit, onCancel }) => {
    const [form, setForm] = useState({
      title: initial.title || '',
      classId: initial.class_id || initial.classId || classesOptions?.[0]?.id || '',
      startDate: initial.start_date || initial.startDate || '',
      endDate: initial.end_date || initial.endDate || '',
      startTime: initial.start_time || initial.startTime || '',
      endTime: initial.end_time || initial.endTime || '',
      duration: initial.duration_minutes || initial.duration || 60,
      totalMarks: initial.total_marks || initial.totalMarks || 100,
      instructions: initial.instructions || '',
      allowedLanguages: initial.allowed_languages || initial.allowedLanguages || ['python', 'cpp', 'javascript'],
      selectedQuestions: initial.question_ids || initial.selectedQuestions || [],
      status: initial.status || 'draft',
    });

    const toggleQuestion = (qid) => {
      setForm(prev => {
        const set = new Set(prev.selectedQuestions);
        if (set.has(qid)) set.delete(qid); else set.add(qid);
        return { ...prev, selectedQuestions: Array.from(set) };
      });
    };

    const update = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

    const handleSubmit = (e) => {
      e.preventDefault();
      if (!form.title?.trim()) { return; }
      if (!form.classId) { return; }
      onSubmit?.(form);
    };

    const languageChoices = [
      { value: 'python', label: 'Python' },
      { value: 'cpp', label: 'C++' },
      { value: 'javascript', label: 'JavaScript' },
      { value: 'java', label: 'Java' },
    ];

    const toggleLanguage = (lang) => {
      setForm(prev => {
        const set = new Set(prev.allowedLanguages);
        if (set.has(lang)) set.delete(lang); else set.add(lang);
        return { ...prev, allowedLanguages: Array.from(set) };
      });
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Title</label>
            <Input value={form.title} onChange={(e) => update('title', e.target.value)} placeholder="Exam title" />
          </div>
          <div>
            <label className="text-sm font-medium">Class</label>
            <Select value={String(form.classId)} onValueChange={(v) => update('classId', v)}>
              <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
              <SelectContent>
                {classesOptions.map(c => (
                  <SelectItem key={c.id} value={String(c.id)}>{c.name} ({c.code})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium">Start Date</label>
            <Input type="date" value={form.startDate} onChange={(e) => update('startDate', e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium">End Date</label>
            <Input type="date" value={form.endDate} onChange={(e) => update('endDate', e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium">Start Time</label>
            <Input type="time" value={form.startTime} onChange={(e) => update('startTime', e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium">End Time</label>
            <Input type="time" value={form.endTime} onChange={(e) => update('endTime', e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium">Duration (mins)</label>
            <Input type="number" min="1" value={form.duration} onChange={(e) => update('duration', Number(e.target.value))} />
          </div>
          <div>
            <label className="text-sm font-medium">Total Marks</label>
            <Input type="number" min="1" value={form.totalMarks} onChange={(e) => update('totalMarks', Number(e.target.value))} />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium">Instructions</label>
          <Textarea value={form.instructions} onChange={(e) => update('instructions', e.target.value)} rows={3} placeholder="Exam instructions for students" />
        </div>
        <div>
          <label className="text-sm font-medium">Allowed Languages</label>
          <div className="flex flex-wrap gap-2 mt-2">
            {languageChoices.map(l => (
              <Button key={l.value} type="button" variant={form.allowedLanguages.includes(l.value) ? 'default' : 'outline'} size="sm" onClick={() => toggleLanguage(l.value)}>
                {l.label}
              </Button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-sm font-medium">Select Questions</label>
          <ScrollArea className="h-48 mt-2 border rounded p-2">
            <div className="space-y-2">
              {questionsOptions.length === 0 ? (
                <div className="text-sm text-muted-foreground">No questions available.</div>
              ) : questionsOptions.map(q => (
                <div key={q.id || q.question_id} className="flex items-center justify-between p-2 border rounded">
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{q.title || q.question_title}</div>
                    <div className="text-xs text-muted-foreground">{q.difficulty || '—'}</div>
                  </div>
                  <Button type="button" size="sm" variant={form.selectedQuestions.includes(q.id || q.question_id) ? 'default' : 'outline'} onClick={() => toggleQuestion(q.id || q.question_id)}>
                    {form.selectedQuestions.includes(q.id || q.question_id) ? 'Selected' : 'Select'}
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
          <Button type="submit">Save</Button>
        </div>
      </form>
    );
  };

  const stats = {
    total: exams.length,
    draft: exams.filter(e => e.status === 'draft').length,
    scheduled: exams.filter(e => e.status === 'scheduled').length,
    active: exams.filter(e => e.status === 'active').length,
    completed: exams.filter(e => e.status === 'completed').length,
    totalStudents: exams.reduce((sum, exam) => sum + exam.totalStudents, 0),
    totalSubmissions: exams.reduce((sum, exam) => sum + exam.submittedStudents, 0)
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
          <h1 className="text-3xl font-bold mb-2">Exam Management</h1>
          <p className="text-muted-foreground">
            Create, schedule, and manage exams for your classes.
          </p>
        </div>
        <Button onClick={() => navigate('/teacher/exams/create')}>
          Create New Exam
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-6">
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
            <CardTitle className="text-sm font-medium text-muted-foreground">Drafts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-600">{stats.draft}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Scheduled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{stats.scheduled}</div>
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
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{stats.totalStudents}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-indigo-600">{stats.totalSubmissions}</div>
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
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
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
                  <SelectItem key={cls.id} value={cls.id.toString()}>{cls.name}</SelectItem>
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
                  <TableHead>Questions</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead>Status</TableHead>
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
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-center">
                        <div className="font-medium">{formatDurationHM(exam.duration)}</div>
                        <div className="text-xs text-muted-foreground">{formatMarks(exam.totalMarks)}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-center">
                        <div className="font-medium">{exam.questions}</div>
                        {Array.isArray(exam.questionsList) && (
                          <div className="text-xs text-muted-foreground">
                            {exam.questionsList.length} selected
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-center">
                        <div className="font-medium">{exam.submittedStudents}/{exam.totalStudents}</div>
                        {exam.averageScore && (
                          <div className="text-xs text-muted-foreground">
                            Avg: {exam.averageScore.toFixed(1)}%
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Select 
                        value={exam.status} 
                        onValueChange={(value) => handleStatusChange(exam.id, value)}
                        disabled={exam.status === 'completed'}
                      >
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="scheduled">Scheduled</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            ⋮
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => {
                            setSelectedExam(exam);
                            setIsViewDialogOpen(true);
                          }}>
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            setSelectedExam(exam);
                            setIsEditDialogOpen(true);
                          }}>
                            Edit Exam
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigate(`/teacher/exams/${exam.id}/results`)}>
                            View Results
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigate(`/teacher/exams/${exam.id}/submissions`)}>
                            View Submissions
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteExam(exam.id)}
                            className="text-red-600"
                          >
                            Delete Exam
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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

      {/* Create Exam now handled via /teacher/exams/create page */}

      {/* View Exam Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Exam Details</DialogTitle>
            <DialogDescription>
              View complete exam details and configuration.
            </DialogDescription>
          </DialogHeader>
          {selectedExam && (
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-4">{selectedExam.title}</h3>
              <p className="text-muted-foreground mb-4">{selectedExam.instructions}</p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Class:</strong> {selectedExam.class.name}
                </div>
                <div>
                  <strong>Duration:</strong> {Math.floor(selectedExam.duration / 60)}h {selectedExam.duration % 60}m
                </div>
                <div>
                  <strong>Questions:</strong> {selectedExam.questions}
                </div>
                <div>
                  <strong>Total Marks:</strong> {selectedExam.totalMarks}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Exam Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Edit Exam</DialogTitle>
            <DialogDescription>
              Modify exam settings and questions.
            </DialogDescription>
          </DialogHeader>
          <div className="p-2">
            {selectedExam && (
              <ExamForm
                initial={{
                  title: selectedExam.title,
                  class_id: selectedExam.class?.id,
                  start_date: selectedExam.startDate,
                  end_date: selectedExam.endDate,
                  start_time: selectedExam.startTime,
                  end_time: selectedExam.endTime,
                  duration_minutes: selectedExam.duration,
                  total_marks: selectedExam.totalMarks,
                  instructions: selectedExam.instructions,
                  allowed_languages: selectedExam.allowedLanguages,
                  question_ids: selectedExam.questionsList,
                  status: selectedExam.status,
                }}
                classesOptions={classes}
                questionsOptions={questions}
                onCancel={() => setIsEditDialogOpen(false)}
                onSubmit={async (form) => {
                  await handleUpdateExam(selectedExam.id, form);
                }}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TeacherExamsPage;
