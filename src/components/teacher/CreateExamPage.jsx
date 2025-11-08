import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { useToast } from '../../hooks/use-toast';
import classesService from '../../services/classesService';
import examsService from '../../services/examsService';
import questionsService from '../../services/questionsService';
import { JUDGE0_LANGUAGES, POPULAR_LANGUAGES } from '../../data/judge0Languages';

const StepHeader = ({ step, total, title, description }) => (
  <div className="mb-4">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        {description && <p className="text-muted-foreground">{description}</p>}
      </div>
      <Badge variant="outline">Step {step} of {total}</Badge>
    </div>
    <div className="mt-3"><Progress value={(step / total) * 100} className="h-2" /></div>
  </div>
);

const CreateExamPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const totalSteps = 4;

  // Data
  const [classes, setClasses] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [form, setForm] = useState({
    title: '',
    instructions: '',
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    duration: 60,
    totalMarks: 100,
    allowedLanguages: [71, 54, 63], // Default: Python, C++, JavaScript (Judge0 IDs)
    classIds: [],
    questionIds: [],
    status: 'draft',
  });

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const clsRes = await classesService.listClasses().catch(() => ({ success: false, data: { classes: [] } }));
        const clsList = clsRes?.data?.classes?.map(c => ({ 
          id: c.join_code || c.class_id || c.id, // Use join_code as primary identifier
          name: c.class_name || c.name, 
          code: c.join_code || c.code, 
          students: c.student_count 
        })) || [];
        setClasses(clsList);

        // Use existing questionsService for consistency
        const qResult = await questionsService.getQuestions().catch(() => null);
        // Support both paginated and non-paginated shapes
        const raw = Array.isArray(qResult?.data)
          ? qResult.data
          : (Array.isArray(qResult?.data?.data) ? qResult.data.data : (Array.isArray(qResult) ? qResult : []));
        const qList = Array.isArray(raw) ? raw.map(q => ({ id: q.question_id || q.id, title: q.question_title || q.title, difficulty: q.difficulty })) : [];
        setQuestions(qList);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const update = (key, value) => setForm(prev => ({ ...prev, [key]: value }));
  const toggleLang = (langId) => {
    setForm(prev => {
      const set = new Set(prev.allowedLanguages);
      if (set.has(langId)) {
        set.delete(langId);
      } else {
        set.add(langId);
      }
      return { ...prev, allowedLanguages: Array.from(set) };
    });
  };
  const toggleClass = (id) => setForm(prev => {
    const set = new Set(prev.classIds);
    if (set.has(id)) set.delete(id); else set.add(id);
    return { ...prev, classIds: Array.from(set) };
  });
  const toggleQuestion = (id) => setForm(prev => {
    const set = new Set(prev.questionIds);
    if (set.has(id)) set.delete(id); else set.add(id);
    return { ...prev, questionIds: Array.from(set) };
  });

  const canNext = useMemo(() => {
    if (step === 1) {
      const hasTitle = form.title.trim().length > 0;
      const hasDates = form.startDate && form.endDate && form.startTime && form.endTime;
      const hasDuration = form.duration > 0;
      const hasMarks = form.totalMarks > 0;
      const hasLanguages = form.allowedLanguages.length > 0;
      
      // Validate datetime: end datetime must be after start datetime
      let validDateTime = true;
      if (hasDates) {
        const startDateTime = new Date(`${form.startDate}T${form.startTime}`);
        const endDateTime = new Date(`${form.endDate}T${form.endTime}`);
        validDateTime = endDateTime > startDateTime;
      }
      
      return hasTitle && hasDates && hasDuration && hasMarks && hasLanguages && validDateTime;
    }
    if (step === 2) return form.classIds.length > 0;
    if (step === 3) return form.questionIds.length > 0;
    return true;
  }, [step, form]);

  const handleCreate = async () => {
    try {
      // Validate datetime before submission
      const startDateTime = new Date(`${form.startDate}T${form.startTime}`);
      const endDateTime = new Date(`${form.endDate}T${form.endTime}`);
      
      if (endDateTime <= startDateTime) {
        toast({ 
          title: 'Invalid Schedule', 
          description: 'End date/time must be after start date/time', 
          variant: 'destructive' 
        });
        return;
      }

      const payload = {
        title: form.title,
        start_date: form.startDate,
        end_date: form.endDate,
        start_time: form.startTime,
        end_time: form.endTime,
        duration_minutes: form.duration,
        total_marks: form.totalMarks,
        instructions: form.instructions,
        allowed_languages: form.allowedLanguages, // Array of Judge0 language IDs
        question_ids: form.questionIds,
        class_ids: form.classIds, // Array of join_codes
        status: form.status,
      };
      const res = await examsService.createExam(payload);
      if (!res.success) throw new Error(res.message || 'Failed to create exam');
      toast({ title: 'Exam created', description: 'Your exam was created successfully.' });
      navigate('/teacher/exams');
    } catch (e) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <StepHeader step={step} total={totalSteps} title="Create Proctored Exam" description="Follow the steps to configure your exam" />

      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Basic Details</CardTitle>
            <CardDescription>Title, schedule, duration, and instructions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input value={form.title} onChange={(e) => update('title', e.target.value)} placeholder="e.g., Midterm Exam - Data Structures" />
              </div>
              <div>
                <label className="text-sm font-medium">Duration (mins)</label>
                <Input type="number" min="1" value={form.duration} onChange={(e) => update('duration', Number(e.target.value))} />
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
              <div className="md:col-span-2">
                <label className="text-sm font-medium">Total Marks</label>
                <Input type="number" min="1" value={form.totalMarks} onChange={(e) => update('totalMarks', Number(e.target.value))} />
              </div>
            </div>
            <div className="mt-4">
              <label className="text-sm font-medium">Instructions</label>
              <Textarea rows={4} value={form.instructions} onChange={(e) => update('instructions', e.target.value)} placeholder="Write instructions for students..." />
            </div>
            <div className="mt-4">
              <label className="text-sm font-medium">Allowed Languages (Judge0 IDs)</label>
              <p className="text-xs text-muted-foreground mb-2">
                Select programming languages that students can use for this exam
              </p>
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-medium mb-2">Popular Languages</p>
                  <div className="flex flex-wrap gap-2">
                    {POPULAR_LANGUAGES.map(lang => (
                      <Button
                        key={`${lang.id}-${lang.value}`}
                        type="button"
                        size="sm"
                        variant={form.allowedLanguages.includes(lang.id) ? 'default' : 'outline'}
                        onClick={() => toggleLang(lang.id)}
                      >
                        {lang.name}
                        {form.allowedLanguages.includes(lang.id) && ' ✓'}
                      </Button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium mb-2">All Languages</p>
                  <div className="max-h-48 overflow-y-auto border rounded p-2">
                    <div className="flex flex-wrap gap-2">
                      {JUDGE0_LANGUAGES.map(lang => (
                        <Button
                          key={`${lang.id}-${lang.value}`}
                          type="button"
                          size="sm"
                          variant={form.allowedLanguages.includes(lang.id) ? 'default' : 'outline'}
                          onClick={() => toggleLang(lang.id)}
                          className="text-xs"
                        >
                          {lang.name}
                          {form.allowedLanguages.includes(lang.id) && ' ✓'}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
                {form.allowedLanguages.length > 0 && (
                  <div className="text-xs text-muted-foreground">
                    Selected: {form.allowedLanguages.length} language(s)
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Select Classes</CardTitle>
            <CardDescription>Choose one or more classes to assign this exam</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {classes.length === 0 ? (
                <div className="text-sm text-muted-foreground">No classes found.</div>
              ) : classes.map(cls => (
                <div key={cls.id} className={`p-3 border rounded flex items-center justify-between ${form.classIds.includes(cls.id) ? 'bg-muted/50' : ''}`}>
                  <div>
                    <div className="font-medium text-sm">{cls.name}</div>
                    <div className="text-xs text-muted-foreground">{cls.code}</div>
                  </div>
                  <Button type="button" size="sm" variant={form.classIds.includes(cls.id) ? 'default' : 'outline'} onClick={() => toggleClass(cls.id)}>
                    {form.classIds.includes(cls.id) ? 'Selected' : 'Select'}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Select Questions</CardTitle>
            <CardDescription>Pick questions from your bank for this exam</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {questions.length === 0 ? (
                <div className="text-sm text-muted-foreground">No questions available.</div>
              ) : questions.map(q => (
                <div key={q.id} className={`p-3 border rounded flex items-center justify-between ${form.questionIds.includes(q.id) ? 'bg-muted/50' : ''}`}>
                  <div className="min-w-0">
                    <div className="font-medium text-sm truncate">{q.title}</div>
                    <div className="text-xs text-muted-foreground">{q.difficulty || '—'}</div>
                  </div>
                  <Button type="button" size="sm" variant={form.questionIds.includes(q.id) ? 'default' : 'outline'} onClick={() => toggleQuestion(q.id)}>
                    {form.questionIds.includes(q.id) ? 'Selected' : 'Select'}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {step === 4 && (
        <Card>
          <CardHeader>
            <CardTitle>Review & Create</CardTitle>
            <CardDescription>Confirm your exam configuration</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div><strong>Title:</strong> {form.title}</div>
              <div><strong>Schedule:</strong> {form.startDate} {form.startTime} → {form.endDate} {form.endTime}</div>
              <div><strong>Duration:</strong> {form.duration} mins</div>
              <div><strong>Total Marks:</strong> {form.totalMarks}</div>
              <div>
                <strong>Allowed Languages:</strong>
                <div className="flex flex-wrap gap-1 mt-1">
                  {form.allowedLanguages.map(langId => {
                     const lang = JUDGE0_LANGUAGES.find(l => l.id === langId);
                     return lang ? (
                      <Badge key={`${lang.id}-${lang.value}`} variant="outline" className="text-xs">
                        {lang.name}
                      </Badge>
                     ) : null;
                  })}
                </div>
              </div>
              <div><strong>Classes:</strong> {classes.filter(c => form.classIds.includes(c.id)).map(c => c.name).join(', ') || 'None'}</div>
              <div><strong>Questions:</strong> {questions.filter(q => form.questionIds.includes(q.id)).map(q => q.title).join(', ') || 'None'}</div>
              <div>
                <strong>Instructions:</strong>
                <div className="mt-1 whitespace-pre-wrap text-muted-foreground">{form.instructions || '—'}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between pt-2">
        <Button variant="outline" onClick={() => (step > 1 ? setStep(step - 1) : navigate('/teacher/exams'))}>{step > 1 ? 'Back' : 'Cancel'}</Button>
        {step < totalSteps ? (
          <Button onClick={() => setStep(step + 1)} disabled={!canNext}>Next</Button>
        ) : (
          <Button onClick={handleCreate} disabled={!canNext}>Create Exam</Button>
        )}
      </div>
    </div>
  );
};

export default CreateExamPage;


