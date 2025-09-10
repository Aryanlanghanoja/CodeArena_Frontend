import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Separator } from '../ui/separator';
import { useToast } from '../../hooks/use-toast';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { cpp } from '@codemirror/lang-cpp';
import { oneDark } from '@codemirror/theme-one-dark';
import { useTheme } from '../../contexts/ThemeContext';
import questionsService from '../../services/questionsService';
import assignmentRunsService from '../../services/assignmentRunsService';
import AssignmentSubmissionTestcasesModal from './AssignmentSubmissionTestcasesModal';

const AssignmentProblemSolvingInner = ({ problem, assignmentId, classId, onBack, backButtonText = 'Back to Questions', onSubmissionUpdate }) => {
  const { isDarkMode } = useTheme();
  const { toast } = useToast();
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [code, setCode] = useState(problem.starterCode?.javascript || '');
  const [customInput, setCustomInput] = useState('');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [leftWidth, setLeftWidth] = useState(40);
  const [testcases, setTestcases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [lastRunResults, setLastRunResults] = useState(null);
  const [lastSubmitResults, setLastSubmitResults] = useState(null);
  const [autoSaveStatus, setAutoSaveStatus] = useState('saved');
  const [cacheExpirationInfo, setCacheExpirationInfo] = useState(null);
  const [testcasesModalOpen, setTestcasesModalOpen] = useState(false);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState(null);
  const resizerRef = useRef(null);
  const containerRef = useRef(null);
  const autoSaveTimeoutRef = useRef(null);

  const languages = [
    // Popular Languages with CodeMirror support
    { value: 'javascript', label: 'JavaScript (Node.js 12.14.0)', judge0Id: 63, extension: javascript() },
    { value: 'python', label: 'Python (3.8.1)', judge0Id: 71, extension: python() },
    { value: 'cpp', label: 'C++ (GCC 9.2.0)', judge0Id: 54, extension: cpp() },
    { value: 'c', label: 'C (GCC 9.2.0)', judge0Id: 50, extension: cpp() },

    // Popular Languages without CodeMirror extensions (still supported by Judge0)
    { value: 'java', label: 'Java (OpenJDK 13.0.1)', judge0Id: 62 },
    { value: 'csharp', label: 'C# (Mono 6.6.0.161)', judge0Id: 51 },
    { value: 'php', label: 'PHP (7.4.1)', judge0Id: 68 },
    { value: 'ruby', label: 'Ruby (2.7.0)', judge0Id: 72 },
    { value: 'go', label: 'Go (1.13.5)', judge0Id: 60 },
    { value: 'rust', label: 'Rust (1.40.0)', judge0Id: 73 },
    { value: 'swift', label: 'Swift (5.2.3)', judge0Id: 83 },
    { value: 'kotlin', label: 'Kotlin (1.3.70)', judge0Id: 78 },
    { value: 'scala', label: 'Scala (2.13.2)', judge0Id: 81 },
    { value: 'perl', label: 'Perl (5.28.1)', judge0Id: 85 },
    { value: 'haskell', label: 'Haskell (GHC 8.8.1)', judge0Id: 61 },
    { value: 'lua', label: 'Lua (5.3.5)', judge0Id: 64 },
    { value: 'r', label: 'R (4.0.0)', judge0Id: 80 },
    { value: 'dart', label: 'Dart (2.7.2)', judge0Id: 69 },
    { value: 'elixir', label: 'Elixir (1.9.4)', judge0Id: 57 },
    { value: 'erlang', label: 'Erlang (OTP 22.2)', judge0Id: 58 },
    { value: 'clojure', label: 'Clojure (1.10.1)', judge0Id: 86 },
    { value: 'fsharp', label: 'F# (.NET Core SDK 3.1.202)', judge0Id: 87 },
    { value: 'fortran', label: 'Fortran (GFortran 9.2.0)', judge0Id: 59 },
    { value: 'ocaml', label: 'OCaml (4.09.0)', judge0Id: 79 },
    { value: 'pascal', label: 'Pascal (FPC 3.0.4)', judge0Id: 67 },
    { value: 'prolog', label: 'Prolog (GNU Prolog 1.4.5)', judge0Id: 70 },
    { value: 'scheme', label: 'Scheme (Gauche 0.9.8)', judge0Id: 82 },
    { value: 'vbnet', label: 'VB.NET (vbnc 0.0.0.5943)', judge0Id: 84 },
    { value: 'bash', label: 'Bash (5.0.0)', judge0Id: 46 },
    { value: 'powershell', label: 'PowerShell (6.2.3)', judge0Id: 89 },
    { value: 'typescript', label: 'TypeScript (3.7.4)', judge0Id: 74 },
    { value: 'assembly', label: 'Assembly (NASM 2.14.02)', judge0Id: 45 },
    { value: 'cobol', label: 'COBOL (GnuCOBOL 2.2)', judge0Id: 77 },
    { value: 'vim', label: 'Vim (8.1.2269)', judge0Id: 90 },
    { value: 'zig', label: 'Zig (0.6.0)', judge0Id: 91 }
  ];

  // Auto-save with 6-hour expiration (same as ProblemSolvingPage)
  const saveToLocalStorage = useCallback((questionId, language, codeToSave) => {
    try {
      const key = `code_${questionId}_${language}`;
      const timestamp = Date.now();
      const cacheData = { code: codeToSave, timestamp, expiresAt: timestamp + (6 * 60 * 60 * 1000) };
      localStorage.setItem(key, JSON.stringify(cacheData));
      setAutoSaveStatus('saved');
      const now = Date.now();
      const timeLeft = cacheData.expiresAt - now;
      const hoursLeft = Math.floor(timeLeft / (60 * 60 * 1000));
      const minutesLeft = Math.floor((timeLeft % (60 * 60 * 1000)) / (60 * 1000));
      setCacheExpirationInfo(hoursLeft > 0 ? `${hoursLeft}h ${minutesLeft}m left` : `${minutesLeft}m left`);
    } catch {
      setAutoSaveStatus('error');
    }
  }, []);

  const loadFromLocalStorage = useCallback((questionId, language) => {
    try {
      const key = `code_${questionId}_${language}`;
      const savedData = localStorage.getItem(key);
      if (!savedData) return '';
      try {
        const cacheData = JSON.parse(savedData);
        if (cacheData.expiresAt && Date.now() > cacheData.expiresAt) {
          localStorage.removeItem(key);
          return '';
        }
        const now = Date.now();
        const timeLeft = cacheData.expiresAt - now;
        const hoursLeft = Math.floor(timeLeft / (60 * 60 * 1000));
        const minutesLeft = Math.floor((timeLeft % (60 * 60 * 1000)) / (60 * 1000));
        setCacheExpirationInfo(hoursLeft > 0 ? `${hoursLeft}h ${minutesLeft}m left` : `${minutesLeft}m left`);
        return cacheData.code || '';
      } catch {
        return savedData;
      }
    } catch {
      return '';
    }
  }, []);

  const cleanupExpiredCache = useCallback(() => {
    try {
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('code_')) {
          try {
            const savedData = localStorage.getItem(key);
            if (savedData) {
              const cacheData = JSON.parse(savedData);
              if (cacheData.expiresAt && Date.now() > cacheData.expiresAt) {
                keysToRemove.push(key);
              }
            }
          } catch {
            continue;
          }
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
    } catch {}
  }, []);

  const debouncedAutoSave = useCallback((questionId, language, codeValue) => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    setAutoSaveStatus('saving');
    autoSaveTimeoutRef.current = setTimeout(() => {
      saveToLocalStorage(questionId, language, codeValue);
    }, 2000);
  }, [saveToLocalStorage]);

  // Mount
  useEffect(() => {
    cleanupExpiredCache();
    const qid = problem.question_id || problem.id;
    if (qid) {
      const saved = loadFromLocalStorage(qid, selectedLanguage);
      setCode(saved || problem.starterCode?.[selectedLanguage] || '');
    }
  }, [problem.question_id, problem.id, selectedLanguage, problem.starterCode, loadFromLocalStorage, cleanupExpiredCache]);

  // Periodic cleanup + expiration display
  useEffect(() => {
    const cleanupInterval = setInterval(() => cleanupExpiredCache(), 60 * 60 * 1000);
    return () => clearInterval(cleanupInterval);
  }, [cleanupExpiredCache]);

  useEffect(() => {
    const qid = problem.question_id || problem.id;
    if (qid) {
      const key = `code_${qid}_${selectedLanguage}`;
      const updateInfo = () => {
        const savedData = localStorage.getItem(key);
        if (!savedData) { setCacheExpirationInfo(null); return; }
        try {
          const cacheData = JSON.parse(savedData);
          if (cacheData.expiresAt) {
            const now = Date.now();
            const timeLeft = cacheData.expiresAt - now;
            if (timeLeft > 0) {
              const hoursLeft = Math.floor(timeLeft / (60 * 60 * 1000));
              const minutesLeft = Math.floor((timeLeft % (60 * 60 * 1000)) / (60 * 1000));
              setCacheExpirationInfo(hoursLeft > 0 ? `${hoursLeft}h ${minutesLeft}m left` : `${minutesLeft}m left`);
            } else {
              setCacheExpirationInfo(null);
            }
          } else {
            setCacheExpirationInfo(null);
          }
        } catch { setCacheExpirationInfo(null); }
      };
      updateInfo();
      const intId = setInterval(updateInfo, 60 * 1000);
      return () => clearInterval(intId);
    }
  }, [problem.question_id, problem.id, selectedLanguage]);

  useEffect(() => {
    const qid = problem.question_id || problem.id;
    if (qid && code !== (problem.starterCode?.[selectedLanguage] || '')) {
      debouncedAutoSave(qid, selectedLanguage, code);
    }
  }, [code, problem.question_id, problem.id, selectedLanguage, problem.starterCode, debouncedAutoSave]);

  useEffect(() => () => { if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current); }, []);

  // Fetch question details/testcases
  useEffect(() => {
    const fetchQuestionDetails = async () => {
      try {
        setLoading(true);
        const result = await questionsService.getQuestion(problem.question_id || problem.id);
        if (result.success) setTestcases(result.data.testcases || []);
        else toast({ title: 'Error', description: 'Failed to fetch question details', variant: 'destructive' });
      } catch (e) {
        toast({ title: 'Error', description: 'Failed to fetch question details', variant: 'destructive' });
      } finally { setLoading(false); }
    };
    if (problem.question_id || problem.id) fetchQuestionDetails();
  }, [problem.question_id, problem.id, toast]);

  // Fetch past submissions (assignment context)
  const fetchSubmissions = useCallback(async () => {
    try {
      setSubmissionsLoading(true);
      const result = await assignmentRunsService.listSubmissions({ assignmentId, classId, questionId: (problem.question_id || problem.id) });
      if (result.success) setSubmissions(result.data || []); else setSubmissions([]);
    } catch (e) { setSubmissions([]); } finally { setSubmissionsLoading(false); }
  }, [assignmentId, classId, problem.question_id, problem.id]);

  useEffect(() => { if (problem.question_id || problem.id) fetchSubmissions(); }, [fetchSubmissions]);

  const handleLanguageChange = (language) => setSelectedLanguage(language);

  const handleRun = async () => {
    if (!code.trim()) { toast({ title: 'Error', description: 'Please write some code before running', variant: 'destructive' }); return; }
    setIsRunning(true);
    try {
      const selectedLang = languages.find(l => l.value === selectedLanguage);
      if (!selectedLang) throw new Error('Selected language not supported');
      const publicTestcases = testcases.filter(tc => tc.is_visible === true);
      if (publicTestcases.length === 0) {
        setOutput(`Running ${selectedLang.label} code...\n\nInput:\n${customInput || 'No custom input provided'}\n\nOutput:\n// No public testcases available for this question\n// Using custom input only\nResult: Code executed successfully`);
        setIsRunning(false);
        toast({ title: 'Code Executed', description: 'Your code has been run successfully (no public testcases).' });
        return;
      }
      const result = await assignmentRunsService.runSolution({
        sourceCode: code,
        languageId: selectedLang.judge0Id,
        stdin: '',
        questionId: (problem.question_id || problem.id),
        assignmentId,
        classId,
      });
      if (result.success && result.data) {
        const results = result.data.results || [];
        let passedTests = 0, failedTests = 0;
        results.forEach(r => { if (r.status === 'Accepted') passedTests++; else failedTests++; });
        let outputText = `Running ${selectedLang.label} code...\n\n`;
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
        if (failedTests > 0) {
          toast({ title: 'Code Execution Failed ❌', description: `Public test cases: ${passedTests}/${results.length} passed`, variant: 'destructive' });
        } else {
          toast({ title: 'Code Executed Successfully ✅', description: `All ${passedTests} public test cases passed!` });
        }
      } else {
        throw new Error(result.message || 'Failed to run code');
      }
    } catch (error) {
      setOutput(`Error: ${error.message}`);
      toast({ title: 'Error', description: 'Failed to run code', variant: 'destructive' });
    } finally { setIsRunning(false); }
  };

  const handleSubmit = async () => {
    if (!code.trim()) { toast({ title: 'Error', description: 'Please write some code before submitting', variant: 'destructive' }); return; }
    setIsSubmitting(true);
    try {
      const selectedLang = languages.find(l => l.value === selectedLanguage);
      if (!selectedLang) throw new Error('Selected language not supported');
      if (testcases.length === 0) {
        setOutput(`Submission Result: ERROR ❌\n\nNo test cases available for this question.`);
        toast({ title: 'Submission Failed', description: 'No test cases available', variant: 'destructive' });
        setIsSubmitting(false);
        return;
      }
      const result = await assignmentRunsService.submitSolution({
        sourceCode: code,
        languageId: selectedLang.judge0Id,
        questionId: (problem.question_id || problem.id),
        assignmentId,
        classId,
      });
      if (result.success && result.data) {
        const { results, summary } = result.data;
        const { total_testcases, passed_testcases, failed_testcases, public_testcases, public_passed, hidden_testcases, hidden_passed, total_weight, earned_weight, score, success } = summary || {};
        let outputText = `Submission Result: ${success ? 'ACCEPTED ✅' : 'WRONG ANSWER ❌'}\n\n`;
        outputText += `📊 SUMMARY:\n`;
        outputText += `Total Test Cases: ${passed_testcases}/${total_testcases} passed\n`;
        outputText += `Public Test Cases: ${public_passed}/${public_testcases} passed\n`;
        outputText += `Hidden Test Cases: ${hidden_passed}/${hidden_testcases} passed\n`;
        if (typeof score === 'number') outputText += `Score: ${safeFormatNumber(score, 1)}%${(total_weight!=null&&earned_weight!=null)?` (${safeFormatNumber(earned_weight,1)}/${safeFormatNumber(total_weight,1)} points)`:''}\n\n`;
        if (results && results.length > 0) {
          if (!success) {
            outputText += `❌ FAILED TEST CASES:\n`;
            outputText += `═══════════════════════════════════════\n\n`;
            results.forEach((tr) => {
              const passed = tr.passed || tr.status === 'Accepted';
              if (!passed) {
                outputText += `❌ Test Case ${tr.testcase_number} (${tr.is_visible ? 'Public' : 'Hidden'}) - ${tr.status}\n`;
                outputText += `─────────────────────────────────────────\n`;
                if (tr.is_visible) {
                  outputText += `Input: ${tr.stdin}\nExpected: ${tr.expected_output}\n`;
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
          passed: passed_testcases,
          total: total_testcases,
          publicPassed: public_passed,
          publicTotal: public_testcases,
          hiddenPassed: hidden_passed,
          hiddenTotal: hidden_testcases,
          score,
          success,
          results,
          timestamp: new Date().toISOString()
        });
        
        // Update parent component with submission status
        if (onSubmissionUpdate) {
          onSubmissionUpdate({
            questionId: problem.question_id || problem.id,
            submitted: true,
            score: score,
            status: success ? 'graded' : 'failed'
          });
        }
        
        fetchSubmissions();
        if (success) {
          toast({ title: 'Submission Accepted! 🎉', description: `All ${total_testcases} test cases passed (${safeFormatNumber(score, 1)}% score).` });
        } else {
          toast({ title: 'Submission Failed ❌', description: `${failed_testcases} test cases failed (${passed_testcases}/${total_testcases} passed). Check the output for details.`, variant: 'destructive' });
        }
      } else {
        throw new Error(result.message || 'Failed to submit code');
      }
    } catch (error) {
      setOutput(`Error: ${error.message}`);
      toast({ title: 'Error', description: 'Failed to submit code', variant: 'destructive' });
    } finally { setIsSubmitting(false); }
  };

  const handleReset = () => {
    const confirmReset = window.confirm('Are you sure you want to reset your code? This will restore the starter code and clear saved progress.');
    if (confirmReset) {
      const qid = problem.question_id || problem.id;
      const key = `code_${qid}_${selectedLanguage}`;
      localStorage.removeItem(key);
      setCode(problem.starterCode?.[selectedLanguage] || '');
      setOutput('');
      setCustomInput('');
      setLastRunResults(null);
      setLastSubmitResults(null);
      setAutoSaveStatus('saved');
      toast({ title: 'Code Reset', description: 'Your code has been reset to the starter template.' });
    }
  };

  const handleViewTestcases = (submissionId) => {
    setSelectedSubmissionId(submissionId);
    setTestcasesModalOpen(true);
  };

  const handleCloseTestcasesModal = () => {
    setTestcasesModalOpen(false);
    setSelectedSubmissionId(null);
  };

  // Resizer functionality
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (containerRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        const newLeftWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
        setLeftWidth(Math.max(25, Math.min(70, newLeftWidth)));
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
  }, []);

  const getDifficultyClass = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'text-difficulty-easy';
      case 'Medium': return 'text-difficulty-medium';
      case 'Hard': return 'text-difficulty-hard';
      default: return '';
    }
  };

  const safeFormatNumber = (value, decimals = 1, fallback = 'N/A') => {
    if (value === null || value === undefined || typeof value !== 'number' || isNaN(value)) { return fallback; }
    return value.toFixed(decimals);
  };

  const BackIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  );

  const PlayIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8m2-10v.01M12 17h.01M12 6H9a3 3 0 000 6h3m0-6a3 3 0 110 6m0-6H9" />
    </svg>
  );

  const SendIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
  );

  const RefreshIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  );

  const CheckIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );

  const XIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );

  const ClockIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );

  const SaveIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
    </svg>
  );

  return (
    <div className="h-full flex flex-col">
      {/* Main Content */}
      <div ref={containerRef} className="flex-1 flex relative h-full">
        {/* Left Panel */}
        <div style={{ width: `${leftWidth}%` }} className="flex flex-col bg-background h-full">
          <Tabs defaultValue="description" className="flex-1 flex flex-col h-full">
            <TabsList className="m-4 mb-0 flex-shrink-0">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="testcase">Test Case</TabsTrigger>
              <TabsTrigger value="submissions">Submissions</TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="assignment-tabs-content p-4 custom-scrollbar">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Problem Description</h3>
                  <p className="text-muted-foreground leading-relaxed">{problem.description}</p>
                </div>
                <Separator />
                <div>
                  <h3 className="text-lg font-semibold mb-3">Examples</h3>
                  <div className="space-y-4">
                    {(problem.examples || []).map((example, index) => (
                      <div key={index} className="bg-code p-4 rounded-lg">
                        <div className="space-y-2">
                          <div><strong>Input:</strong> <code className="ml-2">{example.input}</code></div>
                          <div><strong>Output:</strong> <code className="ml-2">{example.output}</code></div>
                          {example.explanation && (<div><strong>Explanation:</strong> <span className="ml-2">{example.explanation}</span></div>)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <Separator />
                <div>
                  <h3 className="text-lg font-semibold mb-3">Constraints</h3>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    {(problem.constraints || []).map((c, index) => (<li key={index}>{c}</li>))}
                  </ul>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-semibold mb-3">Public Test Cases</h3>
                  {loading ? (
                    <div className="text-center py-8">
                      <div className="text-muted-foreground">Loading test cases...</div>
                    </div>
                  ) : (
                    <>
                      {testcases.filter(tc => tc.is_visible === true).length > 0 ? (
                        <div className="space-y-4">
                          {testcases.filter(tc => tc.is_visible === true).map((testcase, index) => (
                            <Card key={index}>
                              <CardHeader>
                                <CardTitle className="text-base">Test Case {index + 1}</CardTitle>
                                {testcase.explanation && (
                                  <CardDescription className="text-sm">
                                    {testcase.explanation}
                                  </CardDescription>
                                )}
                              </CardHeader>
                              <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <label className="text-sm font-medium text-muted-foreground">Input</label>
                                    <pre className="bg-muted p-3 rounded-md text-sm mt-1 overflow-x-auto">
                                      {testcase.stdin}
                                    </pre>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-muted-foreground">Expected Output</label>
                                    <pre className="bg-muted p-3 rounded-md text-sm mt-1 overflow-x-auto">
                                      {testcase.expected_output}
                                    </pre>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <div>No public test cases available for this question.</div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="testcase" className="assignment-tabs-content p-4 custom-scrollbar">
              <div className="space-y-6">
                {loading ? (
                  <div className="text-center py-8"><div className="text-muted-foreground">Loading test cases...</div></div>
                ) : (
                  <>
                    {testcases.filter(tc => tc.is_visible === true).length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold mb-3">Public Test Cases</h3>
                        <p className="text-muted-foreground mb-4">These test cases are visible to help you understand the problem.</p>
                        <div className="space-y-4">
                          {testcases.filter(tc => tc.is_visible === true).map((testcase, index) => (
                            <Card key={index}>
                              <CardHeader>
                                <CardTitle className="text-base">Test Case {index + 1}</CardTitle>
                                {testcase.explanation && (<CardDescription className="text-sm">{testcase.explanation}</CardDescription>)}
                              </CardHeader>
                              <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <label className="text-sm font-medium text-muted-foreground">Input</label>
                                    <pre className="bg-muted p-3 rounded-md text-sm mt-1 overflow-x-auto">{testcase.stdin}</pre>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-muted-foreground">Expected Output</label>
                                    <pre className="bg-muted p-3 rounded-md text-sm mt-1 overflow-x-auto">{testcase.expected_output}</pre>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}
                    <Separator />
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Custom Test Case</h3>
                      <p className="text-muted-foreground mb-4">Test your solution with custom input before submitting.</p>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium mb-2 block">Input</label>
                          <Textarea placeholder="Enter your test input here..." value={customInput} onChange={(e) => setCustomInput(e.target.value)} className="min-h-[100px] max-h-[200px] font-mono overflow-y-auto" />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-2 block">Output</label>
                          <div className="bg-code p-4 rounded-lg min-h-[100px] max-h-[300px] font-mono text-sm whitespace-pre-wrap overflow-y-auto custom-scrollbar">{output || 'Run your code to see the output here...'}</div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </TabsContent>

            <TabsContent value="submissions" className="assignment-tabs-content p-4 custom-scrollbar">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Your Submissions</h3>
                  <Button variant="outline" size="sm" onClick={fetchSubmissions} disabled={submissionsLoading}>
                    <RefreshIcon className="w-4 h-4 mr-2" /> {submissionsLoading ? 'Loading...' : 'Refresh'}
                  </Button>
                </div>
                {submissionsLoading ? (
                  <div className="text-center py-8 text-muted-foreground"><ClockIcon className="w-8 h-8 mx-auto mb-2 animate-spin" /><p>Loading submissions...</p></div>
                ) : submissions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <SendIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No submissions yet for this problem.</p>
                    <p className="text-sm">Submit your solution to see your submission history.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {submissions.map((submission, index) => (
                      <Card key={submission.submission_id || index} className="hover:bg-muted/50 transition-colors">
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className={`w-3 h-3 rounded-full ${submission.status === 'Accepted' ? 'bg-green-500' : 'bg-red-500'}`} />
                                <div>
                                  <div className="flex items-center space-x-2">
                                    <span className="font-medium">{submission.status || (submission.success ? 'Accepted' : 'Failed')}</span>
                                    {typeof submission.score === 'number' && (<Badge variant="outline">{safeFormatNumber(submission.score, 1)}%</Badge>)}
                                  </div>
                                  <div className="text-sm text-muted-foreground">{new Date(submission.created_at).toLocaleString()}</div>
                                </div>
                              </div>
                              <div className="text-sm text-muted-foreground">{languages.find(l => l.judge0Id === submission.language_id)?.label || 'Unknown Language'}</div>
                            </div>
                            <div className="flex justify-end pt-2 border-t">
                              <Button variant="outline" size="sm" onClick={() => handleViewTestcases(submission.submission_id)} className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                                View Testcases
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Resizer */}
        <div ref={resizerRef} className="w-1 bg-border hover:bg-primary cursor-col-resize transition-colors" />

        {/* Right Panel */}
        <div style={{ width: `${100 - leftWidth}%` }} className="flex flex-col h-full">
          <div className="p-4 border-b border-border bg-card flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
                  <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                  <SelectContent>{languages.map(lang => (<SelectItem key={lang.value} value={lang.value}>{lang.label}</SelectItem>))}</SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={handleReset}>Reset</Button>
                <Button variant="outline" size="sm" onClick={handleRun} disabled={isRunning}>{isRunning ? 'Running...' : 'Run'}</Button>
                <Button size="sm" onClick={handleSubmit} disabled={isSubmitting}>{isSubmitting ? 'Submitting...' : 'Submit'}</Button>
              </div>
            </div>
          </div>
          <div className="flex-1 min-h-0">
            <CodeMirror
              value={code}
              onChange={(value) => setCode(value)}
              extensions={[languages.find(l => l.value === selectedLanguage)?.extension].filter(Boolean)}
              theme={isDarkMode ? oneDark : undefined}
              style={{ height: '100%', width: '100%', fontSize: '14px' }}
              basicSetup={{ 
                lineNumbers: true, 
                foldGutter: true, 
                dropCursor: false, 
                allowMultipleSelections: false, 
                indentOnInput: true, 
                bracketMatching: true, 
                closeBrackets: true, 
                autocompletion: true, 
                highlightSelectionMatches: false 
              }}
            />
          </div>
        </div>
      </div>

      {/* Submission Testcases Modal */}
      <AssignmentSubmissionTestcasesModal submissionId={selectedSubmissionId} isOpen={testcasesModalOpen} onClose={handleCloseTestcasesModal} />
    </div>
  );
};

export default AssignmentProblemSolvingInner;
