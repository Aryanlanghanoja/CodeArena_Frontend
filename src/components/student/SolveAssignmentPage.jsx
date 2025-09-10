import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../hooks/use-toast';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { ArrowLeft, Clock, FileText, CheckCircle, AlertCircle, Play, Save, RefreshCw, Send, Eye, LayoutPanelLeft, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { ScrollArea } from '../ui/scroll-area';
import assignmentsService from '../../services/assignmentsService';
import assignmentRunsService from '../../services/assignmentRunsService';
import questionsService from '../../services/questionsService';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { cpp } from '@codemirror/lang-cpp';
import { oneDark } from '@codemirror/theme-one-dark';
import AssignmentSubmissionTestcasesModal from './AssignmentSubmissionTestcasesModal';
import AssignmentProblemSolvingInner from './AssignmentProblemSolvingInner';

const Modal = ({ open, onClose, title, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">{title}</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>Close</Button>
          </CardHeader>
          <CardContent>
            {children}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const SolveAssignmentPage = () => {
  const { classId, assignmentId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [assignment, setAssignment] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [submissions, setSubmissions] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState('');
  const containerRef = useRef(null);
  const autoSaveTimeoutRef = useRef(null);

  // Sidebar toggle
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Resizer between tabs and editor (like ProblemSolvingPage)
  const [leftWidth, setLeftWidth] = useState(50);
  const resizerRef = useRef(null);

  // Question details/testcases
  const [testcases, setTestcases] = useState([]);
  const [loadingTestcases, setLoadingTestcases] = useState(false);
  const [customInput, setCustomInput] = useState('');
  const [lastRunResults, setLastRunResults] = useState(null);
  const [lastSubmitResults, setLastSubmitResults] = useState(null);

  // Submissions history state
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState(null);


  // Supported languages
  const languages = [
    { value: 'javascript', label: 'JavaScript (Node.js 12.14.0)', judge0Id: 63, extension: javascript() },
    { value: 'python', label: 'Python (3.8.1)', judge0Id: 71, extension: python() },
    { value: 'cpp', label: 'C++ (GCC 9.2.0)', judge0Id: 54, extension: cpp() },
  ];

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
        toast({ title: 'Error', description: 'Failed to load assignment', variant: 'destructive' });
        navigate(`/student/classes/${classId}`);
      }
    } catch (error) {
      console.error('Error fetching assignment:', error);
      toast({ title: 'Error', description: 'Failed to load assignment', variant: 'destructive' });
      navigate(`/student/classes/${classId}`);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentQuestion = () => assignment?.questions?.[currentQuestionIndex];
  const currentQuestion = getCurrentQuestion();
  const currentQuestionId = currentQuestion?.question_id;

  const getAutoSaveKey = (questionId, language) => `assign_code_${assignmentId}_${questionId}_${language}`;

  const loadSavedCode = useCallback((questionId, language) => {
    try {
      const key = getAutoSaveKey(questionId, language);
      const saved = localStorage.getItem(key);
      if (!saved) return '';
      return saved;
    } catch {
      return '';
    }
  }, [assignmentId]);

  const debouncedAutoSave = useCallback((questionId, language, code) => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    autoSaveTimeoutRef.current = setTimeout(() => {
      try { localStorage.setItem(getAutoSaveKey(questionId, language), code); } catch {}
    }, 800);
  }, [assignmentId]);

  useEffect(() => {
    if (!currentQuestionId) return;
    setOutput('');
    setSubmissions(prev => {
      const prevQ = prev[currentQuestionId] || {};
      const defaultLang = prevQ.language || languages[0].value;
      const savedCode = loadSavedCode(currentQuestionId, defaultLang);
      return {
        ...prev,
        [currentQuestionId]: {
          language: defaultLang,
          code: savedCode || prevQ.code || '',
          submitted: prevQ.submitted || false,
          score: prevQ.score,
          status: prevQ.status,
          output: prevQ.output || '',
        }
      };
    });

    const fetchQuestionDetails = async () => {
      try {
        setLoadingTestcases(true);
        const result = await questionsService.getQuestion(currentQuestionId);
        if (result.success) setTestcases(result.data.testcases || []);
        else setTestcases([]);
      } catch {
        setTestcases([]);
      } finally {
        setLoadingTestcases(false);
      }
    };

    fetchQuestionDetails();
    fetchHistory();
  }, [currentQuestionId, loadSavedCode]);

  useEffect(() => {
    const handler = (e) => {
      if (!currentQuestionId) return;
      const isCmdOrCtrl = e.metaKey || e.ctrlKey;
      if (isCmdOrCtrl && e.key === 'Enter') { e.preventDefault(); handleRunCode(currentQuestionId); }
      else if (e.shiftKey && e.key === 'Enter') { e.preventDefault(); handleSubmitCode(currentQuestionId); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [currentQuestionId, submissions]);

  // Resizer like ProblemSolvingPage
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const newLeftWidth = ((e.clientX - rect.left - (sidebarOpen ? (rect.width * 0.25) : 0)) / (sidebarOpen ? (rect.width * 0.75) : rect.width)) * 100;
        setLeftWidth(Math.max(20, Math.min(80, newLeftWidth)));
      }
    };
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
    };
    const handleMouseDown = () => {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    };
    const resizer = resizerRef.current;
    if (resizer) {
      resizer.addEventListener('mousedown', handleMouseDown);
      return () => resizer.removeEventListener('mousedown', handleMouseDown);
    }
  }, [sidebarOpen]);

  const handleCodeChange = (questionId, code) => {
    setSubmissions(prev => {
      const language = prev[questionId]?.language || languages[0].value;
      debouncedAutoSave(questionId, language, code);
      return { ...prev, [questionId]: { ...prev[questionId], code } };
    });
  };

  const handleLanguageChange = (questionId, language) => {
    setSubmissions(prev => {
      const savedCode = loadSavedCode(questionId, language);
      return { ...prev, [questionId]: { ...prev[questionId], language, code: savedCode || prev[questionId]?.code || '' } };
    });
  };

  const safeFormatNumber = (value, decimals = 1, fallback = 'N/A') => {
    if (value === null || value === undefined || typeof value !== 'number' || isNaN(value)) return fallback;
    return value.toFixed(decimals);
  };

  const handleRunCode = async (questionId) => {
    const submission = submissions[questionId];
    if (!submission?.code || !submission?.language) {
      toast({ title: 'Error', description: 'Please write code and select a language', variant: 'destructive' });
      return;
    }

    try {
      setIsRunning(true);
      const lang = languages.find(l => l.value === submission.language);
      const publicTestcases = testcases.filter(tc => tc.is_visible === true);
      if (publicTestcases.length === 0) {
        setOutput(`Running ${lang?.label || submission.language} code...\n\nInput:\n${customInput || 'No custom input provided'}\n\nOutput:\n// No public testcases available for this question\n// Using custom input only\nResult: Code executed successfully`);
        toast({ title: 'Code Executed', description: 'Your code has been run successfully (no public testcases).' });
        return;
      }

      const response = await assignmentRunsService.runSolution({
        sourceCode: submission.code,
        languageId: lang?.judge0Id,
        stdin: '',
        questionId,
        assignmentId,
        classId,
      });

      if (response.success && response.data) {
        const results = response.data.results || [];
        let passedTests = 0, failedTests = 0;
        results.forEach((r) => { if (r.status === 'Accepted') passedTests++; else failedTests++; });

        let outputText = `Running ${lang?.label || submission.language} code...\n\n`;
        outputText += `📊 PUBLIC TEST CASES SUMMARY:\n`;
        outputText += `Total: ${results.length} | Passed: ${passedTests} | Failed: ${failedTests}\n\n`;

        if (failedTests > 0) {
          outputText += `❌ FAILED TEST CASES:\n`;
          outputText += `═══════════════════════════════════════\n\n`;
          results.forEach((r, index) => {
            if (r.status !== 'Accepted') {
              const tc = publicTestcases[index];
              if (tc) {
                outputText += `❌ Test Case ${index + 1} - ${r.status}\n`;
                outputText += `─────────────────────────────────────────\n`;
                outputText += `Input: ${tc.stdin}\n`;
                outputText += `Expected: ${tc.expected_output}\n`;
                outputText += `Actual: ${r.stdout || 'No output'}\n`;
                if (r.stderr) outputText += `Error Details: ${r.stderr}\n`;
                if (r.compile_output) outputText += `Compilation Error: ${r.compile_output}\n`;
                if (tc.explanation) outputText += `Test Case Explanation: ${tc.explanation}\n`;
                if (r.suggestion) outputText += `💡 Suggestion: ${r.suggestion}\n`;
                outputText += `Runtime: ${safeFormatNumber(r.time, 2, '0')}ms | Memory: ${safeFormatNumber(r.memory, 0, '0')}KB\n\n`;
              }
            }
          });
        }

        if (passedTests > 0) {
          outputText += `✅ PASSED TEST CASES:\n`;
          outputText += `═══════════════════════════════════════\n`;
          results.forEach((r, index) => {
            if (r.status === 'Accepted') {
              const tc = publicTestcases[index];
              if (tc) {
                outputText += `Test Case ${index + 1} - ✅ PASSED\n`;
                if (tc.explanation) outputText += `  Explanation: ${tc.explanation}\n`;
                outputText += `  Runtime: ${safeFormatNumber(r.time, 2, '0')}ms | Memory: ${safeFormatNumber(r.memory, 0, '0')}KB\n`;
              }
            }
          });
        }

        setOutput(outputText);
        setLastRunResults({ passed: passedTests, total: results.length, results, timestamp: new Date().toISOString() });
        toast({ title: failedTests > 0 ? 'Code Execution Failed ❌' : 'Code Executed Successfully ✅', description: failedTests > 0 ? `Public test cases: ${passedTests}/${results.length} passed` : `All ${passedTests} public test cases passed!`, variant: failedTests > 0 ? 'destructive' : undefined });
      } else {
        throw new Error(response.message || 'Failed to run code');
      }
    } catch (error) {
      console.error('Error running code:', error);
      setOutput(`Error: ${error.message}`);
      toast({ title: 'Error', description: 'Failed to run code', variant: 'destructive' });
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmitCode = async (questionId) => {
    const submission = submissions[questionId];
    if (!submission?.code || !submission?.language) {
      toast({ title: 'Error', description: 'Please write code and select a language', variant: 'destructive' });
      return;
    }

    try {
      setSubmitting(true);
      const lang = languages.find(l => l.value === submission.language);
      const response = await assignmentRunsService.submitSolution({
        sourceCode: submission.code,
        languageId: lang?.judge0Id,
        questionId,
        assignmentId,
        classId,
      });

      if (response.success && response.data) {
        const { results, summary } = response.data;
        const total = summary?.total_testcases ?? results?.length ?? 0;
        const passed = summary?.passed_testcases ?? (results ? results.filter(r => r.passed || r.status === 'Accepted').length : 0);
        const failed = total - passed;
        const score = summary?.score;

        let outputText = `Submission Result: ${summary?.success ? 'ACCEPTED ✅' : 'WRONG ANSWER ❌'}\n\n`;
        if (summary) {
          outputText += `📊 SUMMARY:\n`;
          outputText += `Total Test Cases: ${summary.passed_testcases}/${summary.total_testcases} passed\n`;
          outputText += `Public Test Cases: ${summary.public_passed}/${summary.public_testcases} passed\n`;
          outputText += `Hidden Test Cases: ${summary.hidden_passed}/${summary.hidden_testcases} passed\n`;
          outputText += `Score: ${safeFormatNumber(summary.score, 1)}%\n\n`;
        }

        if (results && results.length > 0) {
          if (!summary?.success) {
            outputText += `❌ FAILED TEST CASES:\n`;
            outputText += `═══════════════════════════════════════\n\n`;
            results.forEach((tr) => {
              if (!(tr.passed || tr.status === 'Accepted')) {
                outputText += `❌ Test Case ${tr.testcase_number} (${tr.is_visible ? 'Public' : 'Hidden'}) - ${tr.status}\n`;
                outputText += `─────────────────────────────────────────\n`;
                if (tr.is_visible) {
                  outputText += `Input: ${tr.stdin}\n`;
                  outputText += `Expected: ${tr.expected_output}\n`;
                } else {
                  outputText += `Input: [Hidden]\nExpected: [Hidden]\n`;
                }
                outputText += `Actual: ${tr.stdout || 'No output'}\n`;
                if (tr.stderr) outputText += `Error Details: ${tr.stderr}\n`;
                if (tr.compile_output) outputText += `Compilation Error: ${tr.compile_output}\n`;
                if (tr.explanation && tr.is_visible) outputText += `Test Case Explanation: ${tr.explanation}\n`;
                if (tr.suggestion) outputText += `💡 Suggestion: ${tr.suggestion}\n`;
                outputText += `Runtime: ${safeFormatNumber(tr.runtime ?? tr.time, 2)}ms | Memory: ${safeFormatNumber(tr.memory, 0)}KB\n\n`;
              }
            });
          } else {
            outputText += `🎉 Congratulations! Your solution is correct.\n`;
            outputText += `All test cases passed successfully.\n\n`;
            outputText += `✅ ALL TEST CASES PASSED:\n`;
            outputText += `═══════════════════════════════════════\n`;
            results.forEach((tr) => {
              outputText += `Test Case ${tr.testcase_number} (${tr.is_visible ? 'Public' : 'Hidden'}) - ✅ PASSED\n`;
              if (tr.is_visible && tr.explanation) outputText += `  Explanation: ${tr.explanation}\n`;
              outputText += `  Runtime: ${safeFormatNumber(tr.runtime ?? tr.time, 2)}ms | Memory: ${safeFormatNumber(tr.memory, 0)}KB\n`;
            });
          }
        }

        setOutput(outputText);
        setLastSubmitResults({
          passed: summary?.passed_testcases ?? passed,
          total: summary?.total_testcases ?? total,
          publicPassed: summary?.public_passed,
          publicTotal: summary?.public_testcases,
          hiddenPassed: summary?.hidden_passed,
          hiddenTotal: summary?.hidden_testcases,
          score: score,
          success: summary?.success,
          results: results,
          timestamp: new Date().toISOString()
        });

        toast({ title: summary?.success ? 'Submission Accepted! 🎉' : 'Submission Failed ❌', description: summary?.success ? `All ${total} test cases passed (${safeFormatNumber(score, 1)}% score).` : `${failed} test cases failed (${passed}/${total} passed).`, variant: summary?.success ? undefined : 'destructive' });
        fetchHistory();
      } else {
        throw new Error(response.message || 'Failed to submit code');
      }
    } catch (error) {
      console.error('Error submitting code:', error);
      setOutput(`Error: ${error.message}`);
      toast({ title: 'Error', description: 'Failed to submit code', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const fetchHistory = async () => {
    try {
      if (!currentQuestionId) return;
      setHistoryLoading(true);
      const resp = await assignmentRunsService.listSubmissions({ assignmentId, classId, questionId: currentQuestionId });
      if (resp.success) setHistory(resp.data || []);
      else setHistory([]);
    } catch (e) {
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const openDetails = (submission) => {
    setSelectedSubmissionId(submission.submission_id || submission.id);
    setDetailsOpen(true);
  };

  const getProgress = () => {
    if (!assignment?.questions) return 0;
    const total = assignment.questions.length;
    const completed = assignment.questions.filter(q => {
      const submission = submissions[q.question_id];
      return submission?.submitted && submission?.score >= 100;
    }).length;
    return (completed / total) * 100;
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
        <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Assignment not found</h3>
        <p className="text-muted-foreground mb-4">The assignment you're looking for doesn't exist or you don't have access to it.</p>
        <Button onClick={() => navigate(`/student/classes/${classId}`)}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Class
        </Button>
      </div>
    );
  }

  const currentSubmission = currentQuestionId ? submissions[currentQuestionId] : null;

  return (
    <div className="assignment-page-container bg-background flex flex-col">
      <div className="container mx-auto px-4 py-6 lg:py-8 max-w-none flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 lg:mb-8">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate(`/student/classes/${classId}`)} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" /> Back to Class
            </Button>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">{assignment.title}</h1>
          </div>
          <div className="hidden sm:flex items-center gap-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground"><Save className="w-4 h-4" /><span>autosave</span></div>
            {lastRunResults && (
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium text-green-600">{lastRunResults.passed}/{lastRunResults.total}</span>
                <span className="text-xs text-muted-foreground">Public</span>
              </div>
            )}
            {lastSubmitResults && (
              <div className="flex items-center gap-2">
                {lastSubmitResults.success ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-500" />
                )}
                <span className={`text-sm font-medium ${lastSubmitResults.success ? 'text-green-600' : 'text-red-600'}`}>{lastSubmitResults.passed}/{lastSubmitResults.total}</span>
                <span className="text-xs text-muted-foreground">{(typeof lastSubmitResults.score === 'number') ? lastSubmitResults.score.toFixed(1) : '--'}%</span>
              </div>
            )}
            <div className="min-w-[220px] hidden md:block">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="font-medium">Progress</span>
                <span className="text-muted-foreground">
                  {assignment?.questions ? 
                    `${assignment.questions.filter(q => {
                      const submission = submissions[q.question_id];
                      return submission?.submitted && submission?.score >= 100;
                    }).length}/${assignment.questions.length} completed` 
                    : '0/0 completed'
                  }
                </span>
              </div>
              <Progress value={getProgress()} className="h-2" />
            </div>
            <Button variant="outline" size="sm" onClick={() => setSidebarOpen(s => !s)} className="ml-2">
              {sidebarOpen ? <PanelLeftClose className="w-4 h-4 mr-2" /> : <PanelLeftOpen className="w-4 h-4 mr-2" />}
              {sidebarOpen ? 'Hide Sidebar' : 'Show Sidebar'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6 lg:gap-8 assignment-content-area" ref={containerRef}>
          {/* Questions Sidebar (hideable) */}
          {sidebarOpen && (
            <div className="col-span-12 lg:col-span-3">
              <Card className="lg:sticky lg:top-6">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Questions</CardTitle>
                  <CardDescription>Select a question to solve</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <ScrollArea className="h-[300px] lg:h-[70vh] pr-2">
                    <div className="space-y-1">
                      {assignment.questions?.map((question, index) => {
                        const submission = submissions[question.question_id];
                        const isCompleted = submission?.submitted;
                        const isCurrent = index === currentQuestionIndex;
                        return (
                          <div key={question.question_id} className="mb-2">
                            <Button variant={isCurrent ? 'secondary' : 'ghost'} className={`w-full justify-start h-auto py-2 px-3 rounded-md ${isCurrent ? 'bg-secondary' : ''} ${isCompleted ? 'data-[completed=true]:bg-green-50 dark:data-[completed=true]:bg-green-900/20' : ''}`} data-completed={isCompleted} onClick={() => setCurrentQuestionIndex(index)}>
                              <div className="flex items-center gap-3 w-full">
                                <div className="flex items-center justify-center w-6 h-6 rounded-md bg-muted text-xs font-semibold">{index + 1}</div>
                                <div className="flex-1 min-w-0 text-left">
                                  <div className="text-sm font-medium truncate">{question.question_title}</div>
                                  <div className="text-xs text-muted-foreground truncate">{question.difficulty}</div>
                                </div>
                                {isCompleted && <CheckCircle className="h-4 w-4 text-green-600" />}
                              </div>
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Compiler Area now uses inner identical component */}
          <div className={`${sidebarOpen ? 'col-span-12 lg:col-span-9' : 'col-span-12'} h-full`}>
            {currentQuestion && (
              <AssignmentProblemSolvingInner
                problem={{
                  question_id: currentQuestion.question_id,
                  id: currentQuestion.question_id,
                  title: currentQuestion.question_title || 'Question',
                  difficulty: currentQuestion.difficulty || 'Easy',
                  topic: (currentQuestion.tags?.split(',')?.[0] || 'General').trim(),
                  company: (currentQuestion.company_tags?.split(',')?.[0] || 'CodeArena').trim(),
                  description: currentQuestion.description || '',
                  examples: [],
                  constraints: currentQuestion.constraints ? currentQuestion.constraints.split('\n') : [],
                  starterCode: {},
                }}
                assignmentId={assignmentId}
                classId={classId}
                onBack={() => navigate(`/student/classes/${classId}`)}
                backButtonText="Back to Assignment"
                onSubmissionUpdate={(submissionData) => {
                  setSubmissions(prev => ({
                    ...prev,
                    [submissionData.questionId]: {
                      ...prev[submissionData.questionId],
                      submitted: submissionData.submitted,
                      score: submissionData.score,
                      status: submissionData.status
                    }
                  }));
                }}
              />
            )}
          </div>
        </div>
      </div>


      {/* Submission Details Modal */}
      <AssignmentSubmissionTestcasesModal submissionId={selectedSubmissionId} isOpen={detailsOpen} onClose={() => setDetailsOpen(false)} />
    </div>
  );
};

export default SolveAssignmentPage;
