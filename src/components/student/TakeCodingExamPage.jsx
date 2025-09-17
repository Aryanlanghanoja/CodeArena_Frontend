import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { useToast } from '../../hooks/use-toast';
import { useTheme } from '../../contexts/ThemeContext';
import examsService from '../../services/examsService';
import questionsService from '../../services/questionsService';
import useProctoring from '../../hooks/useProctoring';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { cpp } from '@codemirror/lang-cpp';
import { oneDark } from '@codemirror/theme-one-dark';

const TakeCodingExamPage = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isDarkMode } = useTheme();

  const [loading, setLoading] = useState(true);
  const [exam, setExam] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  const [testcases, setTestcases] = useState([]);
  const [output, setOutput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(3600);

  const languages = useMemo(() => ([
    { value: 'javascript', label: 'JavaScript (Node.js 12.14.0)', judge0Id: 63, extension: javascript() },
    { value: 'python', label: 'Python (3.8.1)', judge0Id: 71, extension: python() },
    { value: 'cpp', label: 'C++ (GCC 9.2.0)', judge0Id: 54, extension: cpp() },
  ]), []);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      // Try backend if available; fallback to mock
      const resp = await examsService.getExamDetails(examId).catch(() => ({ success: false }));
      if (resp.success && resp.data) {
        setExam(resp.data);
      } else {
        // Mock exam with coding questions using existing questions API ids if needed
        setExam({
          id: examId,
          title: 'Proctored Coding Exam',
          durationSec: 3600,
          questions: [
            { question_id: 1, question_title: 'Two Sum', difficulty: 'Easy' },
            { question_id: 2, question_title: 'Valid Parentheses', difficulty: 'Medium' },
          ],
        });
      }
      setLoading(false);
    };
    fetch();
  }, [examId]);

  // Timer
  useEffect(() => {
    if (!exam) return;
    setTimeRemaining(exam.durationSec || 3600);
    const intId = setInterval(() => {
      setTimeRemaining((t) => {
        if (t <= 1) {
          clearInterval(intId);
          handleAutoSubmit('time_up');
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(intId);
  }, [exam]);

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const currentQuestion = exam?.questions?.[currentIndex];

  // Load question details/testcases and starter code
  useEffect(() => {
    const run = async () => {
      if (!currentQuestion?.question_id) return;
      const res = await questionsService.getQuestion(currentQuestion.question_id).catch(() => ({ success: false }));
      if (res.success) {
        setTestcases(res.data.testcases || []);
        setCode('');
      } else {
        setTestcases([]);
        setCode('');
      }
      setOutput('');
    };
    run();
  }, [currentQuestion?.question_id]);

  // Proctoring
  const onViolation = useCallback((type) => {
    toast({ title: 'Proctoring violation detected', description: type, variant: 'destructive' });
  }, [toast]);

  const handleAutoSubmit = useCallback(async (reason = 'violation_threshold') => {
    if (!currentQuestion?.question_id || submitting) return;
    try {
      setSubmitting(true);
      const lang = languages.find(l => l.value === selectedLanguage);
      await examsService.submitSolution({
        examId,
        questionId: currentQuestion.question_id,
        sourceCode: code || '// empty',
        languageId: lang?.judge0Id,
      });
      toast({ title: 'Exam auto-submitted', description: `Reason: ${reason}` });
      navigate('/student/exams');
    } catch (e) {
      toast({ title: 'Auto-submit failed', description: e.message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  }, [examId, currentQuestion?.question_id, code, selectedLanguage, languages, submitting, toast, navigate]);

  const { violationCount } = useProctoring({ enabled: true, threshold: 2, onViolation, onThreshold: () => handleAutoSubmit('proctoring_threshold') });

  // Request fullscreen on mount
  useEffect(() => {
    const enterFs = async () => {
      try { await document.documentElement.requestFullscreen(); } catch {}
    };
    enterFs();
    return () => { if (document.fullscreenElement) { document.exitFullscreen().catch(() => {}); } };
  }, []);

  const safeFormat = (v, d = 1) => (typeof v === 'number' && !isNaN(v) ? v.toFixed(d) : 'N/A');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-semibold mb-2">Exam not found</h3>
        <Button onClick={() => navigate('/student/exams')}>Back to Exams</Button>
      </div>
    );
  }

  return (
    <div className="h-[100dvh] max-h-[100dvh] overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold">{exam.title}</h1>
          <Badge variant="outline">Violations: {violationCount}</Badge>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="secondary">Question {currentIndex + 1} / {exam.questions.length}</Badge>
          <div className="flex items-center gap-2 px-3 py-1 rounded bg-muted">
            <span className="font-mono font-semibold text-error">{formatTime(timeRemaining)}</span>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="px-4 pt-3">
        <Progress value={((currentIndex + 1) / exam.questions.length) * 100} className="h-2" />
      </div>

      {/* Body */}
      <div className="flex-1 min-h-0 grid grid-cols-12 gap-4 p-4">
        {/* Sidebar */}
        <div className="col-span-12 lg:col-span-3">
          <Card className="lg:sticky lg:top-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Questions</CardTitle>
              <CardDescription>Select and solve</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                {exam.questions.map((q, i) => (
                  <Button key={q.question_id} variant={i === currentIndex ? 'secondary' : 'outline'} className="w-full justify-start" onClick={() => setCurrentIndex(i)}>
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded bg-muted flex items-center justify-center text-xs font-semibold">{i + 1}</div>
                      <div className="text-left">
                        <div className="text-sm font-medium truncate">{q.question_title || `Question ${i + 1}`}</div>
                        <div className="text-xs text-muted-foreground">{q.difficulty || '—'}</div>
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main panel */}
        <div className="col-span-12 lg:col-span-9 min-h-0 flex flex-col">
          <Tabs defaultValue="description" className="flex-1 min-h-0 flex flex-col">
            <div className="flex items-center justify-between px-1">
              <TabsList className="mb-2">
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="testcase">Test Case</TabsTrigger>
              </TabsList>
              <div className="flex items-center gap-2">
                <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                  <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
                  <SelectContent>{languages.map(lang => (<SelectItem key={lang.value} value={lang.value}>{lang.label}</SelectItem>))}</SelectContent>
                </Select>
                <Button onClick={() => handleAutoSubmit('manual_submit')} disabled={submitting}>{submitting ? 'Submitting...' : 'Submit Exam'}</Button>
              </div>
            </div>

            <TabsContent value="description" className="flex-1 min-h-0 overflow-auto p-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">{currentQuestion?.question_title || 'Question'}</CardTitle>
                  <CardDescription>{currentQuestion?.difficulty}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Solve the problem in the editor. Public test cases are shown below.</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="testcase" className="flex-1 min-h-0 overflow-auto p-2">
              <div className="space-y-4">
                {testcases.filter(tc => tc.is_visible).map((tc, idx) => (
                  <Card key={idx}><CardHeader><CardTitle className="text-base">Test Case {idx + 1}</CardTitle></CardHeader><CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div><label className="text-sm text-muted-foreground">Input</label><pre className="bg-muted p-3 rounded text-sm overflow-x-auto">{tc.stdin}</pre></div>
                      <div><label className="text-sm text-muted-foreground">Expected</label><pre className="bg-muted p-3 rounded text-sm overflow-x-auto">{tc.expected_output}</pre></div>
                    </div>
                  </CardContent></Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          {/* Editor */}
          <div className="flex-1 min-h-0 border-t">
            <CodeMirror
              value={code}
              onChange={setCode}
              extensions={[languages.find(l => l.value === selectedLanguage)?.extension].filter(Boolean)}
              theme={isDarkMode ? oneDark : undefined}
              style={{ height: '100%', width: '100%', fontSize: '14px' }}
              basicSetup={{ lineNumbers: true, foldGutter: true, bracketMatching: true, closeBrackets: true, autocompletion: true }}
            />
          </div>

          {/* Nav */}
          <div className="flex justify-between py-3">
            <Button variant="outline" onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))} disabled={currentIndex === 0}>Previous</Button>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => setCurrentIndex((i) => Math.min((exam.questions.length - 1), i + 1))} disabled={currentIndex >= exam.questions.length - 1}>Next</Button>
              <Button onClick={() => handleAutoSubmit('manual_submit')} disabled={submitting}>Submit Exam</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TakeCodingExamPage;


