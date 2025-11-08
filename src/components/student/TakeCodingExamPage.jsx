import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
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
import { getLanguageById } from '../../data/judge0Languages';
import ReactMarkdown from 'react-markdown';

const getCodeMirrorExtension = (languageValue) => {
  switch (languageValue) {
    case 'javascript':
    case 'nodejs':
      return javascript();
    case 'typescript':
      return javascript({ typescript: true });
    case 'python':
    case 'python3':
    case 'python2':
      return python();
    case 'cpp':
    case 'c':
      return cpp();
    default:
      return null;
  }
};

const TakeCodingExamPage = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isDarkMode } = useTheme();

  const [loading, setLoading] = useState(true);
  const [exam, setExam] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [languageOptions, setLanguageOptions] = useState([]);
  const [selectedLanguageId, setSelectedLanguageId] = useState(null);
  const [code, setCode] = useState('');
  const [testcases, setTestcases] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(3600);
  const [questionDetails, setQuestionDetails] = useState(null);
  const questionCount = exam?.questions?.length || 0;

  const selectedLanguageOption = languageOptions.find(lang => lang.judge0Id === selectedLanguageId);

  useEffect(() => {
    if (!exam) return;

    const allowedIds = Array.isArray(exam.allowed_languages) && exam.allowed_languages.length > 0
      ? exam.allowed_languages
      : [63, 71, 54]; // Default fallback languages

    const uniqueIds = Array.from(new Set(allowedIds));

    const options = uniqueIds.map((id) => {
      const meta = getLanguageById(id);
      const value = meta?.value || `lang-${id}`;
      const label = meta?.name || `Language ${id}`;

      return {
        judge0Id: id,
        label,
        value,
        extension: getCodeMirrorExtension(value),
      };
    });

    const fallbackOptions = options.length > 0 ? options : [{
      judge0Id: 63,
      label: 'JavaScript (Node.js 12.14.0)',
      value: 'javascript',
      extension: getCodeMirrorExtension('javascript'),
    }];

    setLanguageOptions(fallbackOptions);
    setSelectedLanguageId((prev) => {
      if (prev && fallbackOptions.some(opt => opt.judge0Id === prev)) {
        return prev;
      }
      return fallbackOptions[0]?.judge0Id ?? null;
    });
  }, [exam]);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      // Try backend if available; fallback to mock
      const resp = await examsService.getExamDetails(examId).catch(() => ({ success: false }));
      if (resp.success && resp.data) {
        const data = resp.data;
        setExam({
          ...data,
          questions: Array.isArray(data.questions) ? data.questions : [],
        });
      } else {
        // Mock exam with coding questions using existing questions API ids if needed
        setExam({
          id: examId,
          title: 'Proctored Coding Exam',
          duration_minutes: 60,
          allowed_languages: [63, 71, 54],
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

    const durationSeconds = exam.durationSec || (exam.duration_minutes ? exam.duration_minutes * 60 : 3600);
    setTimeRemaining(durationSeconds > 0 ? durationSeconds : 3600);
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
  }, [exam, handleAutoSubmit]);

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
        setQuestionDetails(res.data || null);
      } else {
        setTestcases([]);
        setQuestionDetails(null);
      }
      setCode('');
    };
    run();
  }, [currentQuestion?.question_id]);

  useEffect(() => {
    if (!questionDetails || !selectedLanguageOption) return;

    const starter = questionDetails.starter_code || questionDetails.starterCode;
    if (!starter || typeof starter !== 'object') return;

    const candidates = [
      selectedLanguageOption.value,
      selectedLanguageOption.value?.toLowerCase?.(),
      selectedLanguageOption.value?.toUpperCase?.(),
      selectedLanguageOption.judge0Id,
      selectedLanguageOption.label,
    ];

    let snippet = '';
    for (const candidate of candidates) {
      if (candidate !== undefined && starter[candidate] !== undefined) {
        snippet = starter[candidate];
        break;
      }
    }

    if (typeof snippet === 'string' && code.trim().length === 0) {
      setCode(snippet);
    }
  }, [questionDetails, selectedLanguageOption, code]);

  // Proctoring
  const onViolation = useCallback((type) => {
    toast({ title: 'Proctoring violation detected', description: type, variant: 'destructive' });
  }, [toast]);

  const handleAutoSubmit = useCallback(async (reason = 'violation_threshold') => {
    if (!currentQuestion?.question_id || submitting) return;
    try {
      setSubmitting(true);
      const lang = selectedLanguageOption;
      if (!lang) {
        toast({ title: 'No language selected', description: 'Please choose a programming language before submitting.', variant: 'destructive' });
        return;
      }
      await examsService.submitSolution({
        examId,
        questionId: currentQuestion.question_id,
        sourceCode: code || '// empty',
        languageId: lang.judge0Id,
      });
      toast({ title: 'Exam auto-submitted', description: `Reason: ${reason}` });
      navigate('/student/exams');
    } catch (e) {
      toast({ title: 'Auto-submit failed', description: e.message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  }, [examId, currentQuestion?.question_id, code, selectedLanguageOption, submitting, toast, navigate]);

  const { violationCount } = useProctoring({ enabled: true, threshold: 2, onViolation, onThreshold: () => handleAutoSubmit('proctoring_threshold') });

  // Request fullscreen on mount
  useEffect(() => {
    const enterFs = async () => {
      try { await document.documentElement.requestFullscreen(); } catch {}
    };
    enterFs();
    return () => { if (document.fullscreenElement) { document.exitFullscreen().catch(() => {}); } };
  }, []);

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
          <Badge variant="secondary">Question {questionCount > 0 ? currentIndex + 1 : 0} / {questionCount}</Badge>
          <div className="flex items-center gap-2 px-3 py-1 rounded bg-muted">
            <span className="font-mono font-semibold text-error">{formatTime(timeRemaining)}</span>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="px-4 pt-3">
        <Progress value={questionCount > 0 ? ((currentIndex + 1) / questionCount) * 100 : 0} className="h-2" />
      </div>

      {exam.instructions && (
        <div className="px-4">
          <Card className="mt-3">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Exam Instructions</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown>{exam.instructions}</ReactMarkdown>
            </CardContent>
          </Card>
        </div>
      )}

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
                {(exam.questions || []).map((q, i) => (
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
                <Select
                  value={selectedLanguageId !== null ? String(selectedLanguageId) : undefined}
                  onValueChange={(value) => setSelectedLanguageId(Number(value))}
                  disabled={languageOptions.length === 0}
                >
                  <SelectTrigger className="w-52">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    {languageOptions.map(lang => (
                      <SelectItem key={lang.judge0Id} value={String(lang.judge0Id)}>
                        {lang.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={() => handleAutoSubmit('manual_submit')} disabled={submitting || !selectedLanguageOption || questionCount === 0}>
                  {submitting ? 'Submitting...' : 'Submit Exam'}
                </Button>
              </div>
            </div>

            <TabsContent value="description" className="flex-1 min-h-0 overflow-auto p-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">{currentQuestion?.question_title || 'Question'}</CardTitle>
                  <CardDescription>{currentQuestion?.difficulty}</CardDescription>
                </CardHeader>
                <CardContent>
                  {questionDetails?.problem_statement || questionDetails?.description ? (
                    <ReactMarkdown className="prose prose-sm dark:prose-invert max-w-none">
                      {questionDetails.problem_statement || questionDetails.description}
                    </ReactMarkdown>
                  ) : (
                    <p className="text-sm text-muted-foreground">Solve the problem in the editor. Public test cases are shown below.</p>
                  )}
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
              extensions={selectedLanguageOption?.extension ? [selectedLanguageOption.extension] : []}
              theme={isDarkMode ? oneDark : undefined}
              style={{ height: '100%', width: '100%', fontSize: '14px' }}
              basicSetup={{ lineNumbers: true, foldGutter: true, bracketMatching: true, closeBrackets: true, autocompletion: true }}
            />
          </div>

          {/* Nav */}
          <div className="flex justify-between py-3">
            <Button variant="outline" onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))} disabled={currentIndex === 0}>Previous</Button>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setCurrentIndex((i) => {
                  if (questionCount === 0) return 0;
                  return Math.min(questionCount - 1, i + 1);
                })}
                disabled={questionCount === 0 || currentIndex >= questionCount - 1}
              >
                Next
              </Button>
              <Button onClick={() => handleAutoSubmit('manual_submit')} disabled={submitting || !selectedLanguageOption || questionCount === 0}>
                Submit Exam
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TakeCodingExamPage;


