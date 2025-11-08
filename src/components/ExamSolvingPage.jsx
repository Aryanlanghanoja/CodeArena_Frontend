import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useToast } from '../hooks/use-toast';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { cpp } from '@codemirror/lang-cpp';
import { oneDark } from '@codemirror/theme-one-dark';
import useRestrictClipboardOutsideEditor from '../hooks/useRestrictClipboardOutsideEditor';
import useProctoring from '../hooks/useProctoring';
import proctorService from '../services/proctorService';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigate, useParams } from 'react-router-dom';
import questionsService from '../services/questionsService';
import examsService from '../services/examsService';
import { getLanguageById } from '../data/judge0Languages';
import { EditorView, keymap } from '@codemirror/view';
import { Separator } from './ui/separator';

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

const ExamSolvingPage = () => {
  const { examId } = useParams();
  const { isDarkMode } = useTheme();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Exam state
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  
  // Code editor state
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [languageOptions, setLanguageOptions] = useState([]);
  const [code, setCode] = useState('');
  
  // Question details
  const [questionDetails, setQuestionDetails] = useState(null);
  const [testcases, setTestcases] = useState([]);
  const [questionLoading, setQuestionLoading] = useState(false);
  
  // Timer state
  const [timeRemaining, setTimeRemaining] = useState(0); // in seconds
  const [examStarted, setExamStarted] = useState(false);
  const [sessionStatus, setSessionStatus] = useState(null); // 'active', 'paused', 'expired'
  const timerIntervalRef = useRef(null);
  const heartbeatIntervalRef = useRef(null);
  const visibilityChangeHandlerRef = useRef(null);
  const beforeUnloadHandlerRef = useRef(null);
  
  // Fullscreen state
  const [isFullscreen, setIsFullscreen] = useState(() => !!document.fullscreenElement);
  const [fullscreenBlocked, setFullscreenBlocked] = useState(false);
  
  // Proctoring state
  const [violationCount, setViolationCount] = useState(0);
  const violationThreshold = 3;
  const contentBlurred = violationCount >= violationThreshold;
  
  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState({}); // question_id -> status
  
  // Auto-save state
  const [autoSaveStatus, setAutoSaveStatus] = useState('saved');
  const autoSaveTimeoutRef = useRef(null);
  
  // Resizer state
  const [leftWidth, setLeftWidth] = useState(50);
  const resizerRef = useRef(null);
  const containerRef = useRef(null);

  // Log event helper
  const logEvent = useCallback(async (type, details = {}) => {
    try {
      await proctorService.logEvent({ 
        type, 
        page: 'exam_solve', 
        details: { examId, ...details } 
      });
    } catch (error) {
      console.error('Failed to log event:', error);
    }
  }, [examId]);

  // Sync timer with backend session
  const syncTimerWithBackend = useCallback(async () => {
    if (!examStarted || !examId) return;
    
    try {
      const result = await examsService.getExamSessionStatus(examId);
      if (result.success && result.data && result.data.has_session) {
        const { remaining_seconds, status } = result.data;
        setTimeRemaining(remaining_seconds || 0);
        setSessionStatus(status || 'active');
        
        if (status === 'expired' || (remaining_seconds && remaining_seconds <= 0)) {
          handleAutoSubmit('time_up');
        }
      }
    } catch (error) {
      console.error('Error syncing timer:', error);
    }
  }, [examStarted, examId, handleAutoSubmit]);

  // Heartbeat to keep session active and sync timer
  const sendHeartbeat = useCallback(async () => {
    if (!examStarted || !examId || sessionStatus !== 'active') return;
    
    try {
      await examsService.updateExamSessionActivity(examId);
      // Also sync timer
      await syncTimerWithBackend();
    } catch (error) {
      console.error('Error sending heartbeat:', error);
    }
  }, [examStarted, examId, sessionStatus, syncTimerWithBackend]);

  // Auto-save code helper
  const saveCode = useCallback((questionId, languageId, code) => {
    try {
      const key = `exam_${examId}_question_${questionId}_lang_${languageId}`;
      const data = {
        code,
        timestamp: Date.now(),
        examId,
        questionId,
        languageId
      };
      localStorage.setItem(key, JSON.stringify(data));
      setAutoSaveStatus('saved');
    } catch (error) {
      console.error('Failed to save code:', error);
      setAutoSaveStatus('error');
    }
  }, [examId]);

  const getSavedCode = useCallback((questionId, languageId) => {
    try {
      const key = `exam_${examId}_question_${questionId}_lang_${languageId}`;
      const saved = localStorage.getItem(key);
      if (saved) {
        const data = JSON.parse(saved);
        return data.code || '';
      }
    } catch (error) {
      console.error('Failed to load saved code:', error);
    }
    return '';
  }, [examId]);

  // Auto-submit on threshold
  const handleAutoSubmit = useCallback(async (reason = 'violation_threshold') => {
    if (isSubmitting || !examStarted) return;
    
    try {
      setIsSubmitting(true);
      logEvent('auto_submit', { reason });
      
      // Submit all questions with current code
      for (let i = 0; i < questions.length; i++) {
        const question = questions[i];
        if (!question?.question_id) continue;
        
        // Get saved code for this question
        const savedCode = getSavedCode(question.question_id, selectedLanguage?.judge0Id);
        if (savedCode && savedCode.trim()) {
          try {
            await examsService.submitSolution({
              examId,
              questionId: question.question_id,
              sourceCode: savedCode,
              languageId: selectedLanguage?.judge0Id || languageOptions[0]?.judge0Id
            });
          } catch (error) {
            console.error(`Failed to submit question ${question.question_id}:`, error);
          }
        }
      }
      
      toast({ 
        title: 'Exam auto-submitted', 
        description: `Reason: ${reason}. Your exam has been submitted automatically.`,
        variant: 'destructive'
      });
      
      navigate('/student/exams');
    } catch (error) {
      console.error('Auto-submit failed:', error);
      toast({ 
        title: 'Auto-submit failed', 
        description: error.message, 
        variant: 'destructive' 
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [examId, questions, selectedLanguage, languageOptions, examStarted, isSubmitting, logEvent, toast, navigate, getSavedCode]);

  // Proctoring violation handler
  const handleViolation = useCallback((type) => {
    setViolationCount((v) => {
      const newCount = v + 1;
      if (newCount >= violationThreshold) {
        handleAutoSubmit('violation_threshold');
      }
      return newCount;
    });
    logEvent('violation', { type, violationCount: violationCount + 1 });
    try {
      toast({ 
        title: 'Proctoring notice', 
        description: `Policy violation detected: ${type}`, 
        variant: 'destructive' 
      });
    } catch {}
  }, [violationCount, violationThreshold, logEvent, toast, handleAutoSubmit]);

  // Proctoring hook
  useProctoring({ 
    enabled: examStarted, 
    threshold: violationThreshold, 
    onViolation: handleViolation,
    onThreshold: () => handleAutoSubmit('proctoring_threshold')
  });

  // Pause exam session
  const pauseExamSession = useCallback(async () => {
    if (!examId) return;
    
    try {
      const result = await examsService.pauseExamSession(examId);
      if (result.success && result.data) {
        setSessionStatus('paused');
        setTimeRemaining(result.data.remaining_seconds || 0);
      }
    } catch (error) {
      console.error('Error pausing exam session:', error);
    }
  }, [examId]);

  // Resume exam session
  const resumeExamSession = useCallback(async () => {
    if (!examId) return;
    
    try {
      const deviceInfo = navigator.userAgent || 'Unknown';
      const result = await examsService.startExamSession(examId, deviceInfo);
      if (result.success && result.data) {
        setSessionStatus('active');
        setTimeRemaining(result.data.remaining_seconds || 0);
      }
    } catch (error) {
      console.error('Error resuming exam session:', error);
    }
  }, [examId]);

  // Fetch exam details and check for existing session
  useEffect(() => {
    const fetchExam = async () => {
      try {
        setLoading(true);
        const result = await examsService.getExamDetails(examId);
        
        if (result.success && result.data) {
          const examData = result.data;
          setExam(examData);
          setQuestions(examData.questions || []);
          
          // Check for existing session
          try {
            const sessionResult = await examsService.getExamSessionStatus(examId);
            if (sessionResult.success && sessionResult.data && sessionResult.data.has_session) {
              // Resume existing session
              const sessionData = sessionResult.data;
              setTimeRemaining(sessionData.remaining_seconds || 0);
              setSessionStatus(sessionData.status || 'paused');
              
              // If there's an active session, automatically resume exam
              if (sessionData.status === 'active' && sessionData.remaining_seconds > 0) {
                setExamStarted(true);
                logEvent('exam_resumed', { 
                  examId, 
                  sessionId: sessionData.session_id,
                  resumeTime: new Date().toISOString() 
                });
              }
            } else {
              // Set initial timer (will be set when session starts)
              const durationSeconds = examData.durationSec || (examData.duration_minutes ? examData.duration_minutes * 60 : 3600);
              setTimeRemaining(durationSeconds);
              setSessionStatus(null);
            }
          } catch (sessionError) {
            console.error('Error checking session:', sessionError);
            // Set default timer if session check fails
            const durationSeconds = examData.durationSec || (examData.duration_minutes ? examData.duration_minutes * 60 : 3600);
            setTimeRemaining(durationSeconds);
          }
          
          // Set up allowed languages
          const allowedIds = Array.isArray(examData.allowed_languages) && examData.allowed_languages.length > 0
            ? examData.allowed_languages
            : [63, 71, 54]; // Default: JavaScript, Python, C++
          
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
          if (fallbackOptions.length > 0) {
            setSelectedLanguage(fallbackOptions[0]);
          }
        } else {
          toast({
            title: "Error",
            description: "Failed to fetch exam details",
            variant: "destructive"
          });
          navigate('/student/exams');
        }
      } catch (error) {
        console.error('Error fetching exam:', error);
        toast({
          title: "Error",
          description: "Failed to fetch exam details",
          variant: "destructive"
        });
        navigate('/student/exams');
      } finally {
        setLoading(false);
      }
    };

    if (examId) {
      fetchExam();
    }
  }, [examId, navigate, toast, logEvent]);

  // Fetch current question details
  useEffect(() => {
    const fetchQuestion = async () => {
      const currentQuestion = questions[currentQuestionIndex];
      if (!currentQuestion?.question_id) return;
      
      try {
        setQuestionLoading(true);
        const result = await questionsService.getQuestion(currentQuestion.question_id);
        
        if (result.success) {
          setQuestionDetails(result.data);
          setTestcases(result.data.testcases || []);
          
          // Load saved code or starter code
          const savedCode = getSavedCode(currentQuestion.question_id, selectedLanguage?.judge0Id);
          if (savedCode) {
            setCode(savedCode);
          } else {
            const starterCode = result.data.starterCode || result.data.starter_code || {};
            const langKey = selectedLanguage?.value || 'javascript';
            setCode(starterCode[langKey] || starterCode.javascript || '');
          }
        } else {
          toast({
            title: "Error",
            description: "Failed to fetch question details",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error('Error fetching question:', error);
        toast({
          title: "Error",
          description: "Failed to fetch question details",
          variant: "destructive"
        });
      } finally {
        setQuestionLoading(false);
      }
    };

    if (questions.length > 0 && selectedLanguage) {
      fetchQuestion();
    }
  }, [questions, currentQuestionIndex, selectedLanguage, toast]);

  // Timer functionality - sync with backend periodically
  useEffect(() => {
    if (!examStarted || sessionStatus !== 'active') {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
      return;
    }

    // Sync with backend every 5 seconds
    timerIntervalRef.current = setInterval(() => {
      syncTimerWithBackend();
    }, 5000);

    // Initial sync
    syncTimerWithBackend();

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [examStarted, sessionStatus, syncTimerWithBackend]);

  // Local timer countdown (for smooth UI updates)
  useEffect(() => {
    if (!examStarted || sessionStatus !== 'active' || timeRemaining <= 0) {
      return;
    }

    const localTimer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleAutoSubmit('time_up');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(localTimer);
  }, [examStarted, sessionStatus, timeRemaining, handleAutoSubmit]);

  // Heartbeat to keep session active
  useEffect(() => {
    if (!examStarted || sessionStatus !== 'active') {
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = null;
      }
      return;
    }

    // Send heartbeat every 30 seconds
    heartbeatIntervalRef.current = setInterval(() => {
      sendHeartbeat();
    }, 30000);

    // Send initial heartbeat
    sendHeartbeat();

    return () => {
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
      }
    };
  }, [examStarted, sessionStatus, sendHeartbeat]);

  // Format time
  const formatTime = useCallback((seconds) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  }, []);

  // Fullscreen handling
  const requestFullscreen = useCallback(async () => {
    try {
      if (document.fullscreenElement) {
        setIsFullscreen(true);
        setFullscreenBlocked(false);
        return;
      }
      
      await document.documentElement.requestFullscreen();
      setIsFullscreen(true);
      setFullscreenBlocked(false);
    } catch (error) {
      console.error('Failed to enter fullscreen:', error);
      setFullscreenBlocked(true);
      toast({
        title: "Fullscreen Required",
        description: "Please enable fullscreen to start the exam",
        variant: "destructive"
      });
    }
  }, [toast]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const fs = !!document.fullscreenElement;
      setIsFullscreen(fs);
      
      if (!fs && examStarted) {
        handleViolation('fullscreen_exit');
        // Pause session when fullscreen exits
        if (sessionStatus === 'active') {
          pauseExamSession();
        }
        // Try to re-enter fullscreen
        setTimeout(() => {
          requestFullscreen();
        }, 100);
      } else if (fs && examStarted && sessionStatus === 'paused') {
        // Resume session when fullscreen is restored
        resumeExamSession();
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [examStarted, sessionStatus, handleViolation, requestFullscreen, pauseExamSession, resumeExamSession]);

  // Handle visibility change (tab switch, minimize) - pause/resume session
  useEffect(() => {
    if (!examStarted) return;

    const handleVisibilityChange = async () => {
      if (document.hidden) {
        // Tab/window hidden - pause session
        if (sessionStatus === 'active') {
          await pauseExamSession();
          logEvent('session_paused', { reason: 'visibility_hidden', examId });
        }
      } else {
        // Tab/window visible - resume session if paused
        if (sessionStatus === 'paused') {
          await resumeExamSession();
          logEvent('session_resumed', { reason: 'visibility_visible', examId });
        } else if (sessionStatus === 'active') {
          // Sync timer when coming back
          await syncTimerWithBackend();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [examStarted, sessionStatus, examId, logEvent, syncTimerWithBackend, pauseExamSession, resumeExamSession]);

  // Handle page unload - pause session
  useEffect(() => {
    if (!examStarted) return;

    const handleBeforeUnload = async (e) => {
      // Pause session before page unload
      if (sessionStatus === 'active') {
        // Use sendBeacon for reliable delivery during page unload
        try {
          await examsService.pauseExamSession(examId);
        } catch (error) {
          console.error('Error pausing session on unload:', error);
        }
        logEvent('session_paused', { reason: 'page_unload', examId });
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [examStarted, sessionStatus, examId, logEvent]);


  // Start exam (after fullscreen) - creates/resumes backend session
  const handleStartExam = useCallback(async () => {
    if (!isFullscreen) {
      await requestFullscreen();
      // Wait a bit for fullscreen to be established
      setTimeout(() => {
        if (document.fullscreenElement) {
          startExamSession();
        }
      }, 100);
      return;
    }
    
    startExamSession();
  }, [isFullscreen, requestFullscreen]);

  // Start exam session with backend
  const startExamSession = useCallback(async () => {
    try {
      const deviceInfo = navigator.userAgent || 'Unknown';
      const result = await examsService.startExamSession(examId, deviceInfo);
      
      if (result.success && result.data) {
        setExamStarted(true);
        setTimeRemaining(result.data.remaining_seconds || 0);
        setSessionStatus(result.data.status || 'active');
        logEvent('exam_started', { 
          examId, 
          sessionId: result.data.session_id,
          startTime: new Date().toISOString() 
        });
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to start exam session",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error starting exam session:', error);
      toast({
        title: "Error",
        description: "Failed to start exam session",
        variant: "destructive"
      });
    }
  }, [examId, logEvent, toast]);

  // Prevent context menu and dev tools
  useEffect(() => {
    if (!examStarted) return;

    const preventContext = (e) => {
      e.preventDefault();
      handleViolation('contextmenu');
    };

    const preventKeys = (e) => {
      const isMac = navigator.platform.toUpperCase().includes('MAC');
      const ctrl = isMac ? e.metaKey : e.ctrlKey;
      if (
        e.key === 'F12' ||
        (ctrl && e.shiftKey && (e.key.toLowerCase() === 'i' || e.key.toLowerCase() === 'j' || e.key.toLowerCase() === 'c'))
      ) {
        e.preventDefault();
        e.stopPropagation();
        handleViolation('devtools_shortcut');
      }
    };

    document.addEventListener('contextmenu', preventContext, { capture: true });
    window.addEventListener('keydown', preventKeys, true);
    
    return () => {
      document.removeEventListener('contextmenu', preventContext, { capture: true });
      window.removeEventListener('keydown', preventKeys, true);
    };
  }, [examStarted, handleViolation]);

  // Dev tools detection
  useEffect(() => {
    if (!examStarted) return;

    let devtoolsOpen = false;
    const check = () => {
      const widthThreshold = window.outerWidth - window.innerWidth > 160;
      const heightThreshold = window.outerHeight - window.innerHeight > 160;
      const opened = widthThreshold || heightThreshold;
      if (opened && !devtoolsOpen) {
        devtoolsOpen = true;
        handleViolation('devtools_detected');
      } else if (!opened && devtoolsOpen) {
        devtoolsOpen = false;
      }
    };
    
    const intervalId = setInterval(check, 1500);
    return () => clearInterval(intervalId);
  }, [examStarted, handleViolation]);

  // Prevent copying outside editor
  useRestrictClipboardOutsideEditor(examStarted, 'outside');

  // Disable clipboard in editor
  const noClipboard = [
    keymap.of([
      { key: 'Mod-c', preventDefault: true, run: () => true },
      { key: 'Mod-v', preventDefault: true, run: () => true },
      { key: 'Mod-x', preventDefault: true, run: () => true },
      { key: 'Shift-Insert', preventDefault: true, run: () => true },
      { key: 'Mod-Insert', preventDefault: true, run: () => true },
    ]),
    EditorView.domEventHandlers({
      copy: (e) => e.preventDefault(),
      cut: (e) => e.preventDefault(),
      paste: (e) => e.preventDefault(),
      drop: (e) => e.preventDefault(),
      dragstart: (e) => e.preventDefault(),
      contextmenu: (e) => e.preventDefault(),
    }),
  ];


  // Auto-save on code change
  useEffect(() => {
    if (!examStarted || !questions[currentQuestionIndex]?.question_id || !selectedLanguage) return;

    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    setAutoSaveStatus('saving');
    autoSaveTimeoutRef.current = setTimeout(() => {
      saveCode(questions[currentQuestionIndex].question_id, selectedLanguage.judge0Id, code);
    }, 2000);

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [code, examStarted, questions, currentQuestionIndex, selectedLanguage, saveCode]);

  // Handle question change
  const handleQuestionChange = useCallback((index) => {
    // Save current question code
    if (questions[currentQuestionIndex]?.question_id && selectedLanguage) {
      saveCode(questions[currentQuestionIndex].question_id, selectedLanguage.judge0Id, code);
    }
    
    setCurrentQuestionIndex(index);
  }, [currentQuestionIndex, questions, selectedLanguage, code, saveCode]);

  // Handle language change
  const handleLanguageChange = useCallback((languageValue) => {
    const lang = languageOptions.find(l => l.value === languageValue || l.judge0Id.toString() === languageValue);
    if (lang) {
      // Save current language code
      if (questions[currentQuestionIndex]?.question_id && selectedLanguage) {
        saveCode(questions[currentQuestionIndex].question_id, selectedLanguage.judge0Id, code);
      }
      
      setSelectedLanguage(lang);
      
      // Load code for new language
      const questionId = questions[currentQuestionIndex]?.question_id;
      if (questionId) {
        const savedCode = getSavedCode(questionId, lang.judge0Id);
        if (savedCode) {
          setCode(savedCode);
        } else {
          const starterCode = questionDetails?.starterCode || questionDetails?.starter_code || {};
          const langKey = lang.value || 'javascript';
          setCode(starterCode[langKey] || starterCode.javascript || '');
        }
      }
    }
  }, [languageOptions, questions, currentQuestionIndex, selectedLanguage, code, questionDetails, saveCode, getSavedCode]);

  // Handle submit question
  const handleSubmitQuestion = useCallback(async () => {
    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion?.question_id || !selectedLanguage || !code.trim()) {
      toast({
        title: "Error",
        description: "Please write some code before submitting",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const result = await examsService.submitSolution({
        examId,
        questionId: currentQuestion.question_id,
        sourceCode: code,
        languageId: selectedLanguage.judge0Id
      });

      if (result.success) {
        setSubmissionStatus(prev => ({
          ...prev,
          [currentQuestion.question_id]: 'submitted'
        }));
        toast({
          title: "Submitted",
          description: "Your solution has been submitted successfully",
        });
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to submit solution",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error submitting solution:', error);
      toast({
        title: "Error",
        description: "Failed to submit solution",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [examId, questions, currentQuestionIndex, selectedLanguage, code, toast]);

  // Handle submit exam
  const handleSubmitExam = useCallback(async () => {
    if (!examStarted) return;

    const confirmSubmit = window.confirm(
      'Are you sure you want to submit the exam? This action cannot be undone.'
    );

    if (!confirmSubmit) return;

    try {
      setIsSubmitting(true);
      logEvent('exam_submit_initiated', { examId });
      
      // Submit all questions
      for (let i = 0; i < questions.length; i++) {
        const question = questions[i];
        if (!question?.question_id) continue;
        
        const savedCode = getSavedCode(question.question_id, selectedLanguage?.judge0Id || languageOptions[0]?.judge0Id);
        if (savedCode && savedCode.trim()) {
          try {
            await examsService.submitSolution({
              examId,
              questionId: question.question_id,
              sourceCode: savedCode,
              languageId: selectedLanguage?.judge0Id || languageOptions[0]?.judge0Id
            });
          } catch (error) {
            console.error(`Failed to submit question ${question.question_id}:`, error);
          }
        }
      }
      
      logEvent('exam_submitted', { examId, submitTime: new Date().toISOString() });
      toast({
        title: "Exam Submitted",
        description: "Your exam has been submitted successfully",
      });
      
      navigate('/student/exams');
    } catch (error) {
      console.error('Error submitting exam:', error);
      toast({
        title: "Error",
        description: "Failed to submit exam",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [examId, examStarted, questions, selectedLanguage, languageOptions, getSavedCode, logEvent, toast, navigate]);

  // Resizer functionality
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (containerRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        const newLeftWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
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
  }, []);

  // Get difficulty class
  const getDifficultyClass = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'text-difficulty-easy';
      case 'Medium': return 'text-difficulty-medium';
      case 'Hard': return 'text-difficulty-hard';
      default: return '';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Exam not found</CardTitle>
            <CardDescription>The exam you're looking for doesn't exist or you don't have access to it.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/student/exams')}>Back to Exams</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Pre-exam screen (fullscreen requirement)
  if (!examStarted) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <Card className="max-w-2xl w-full mx-4">
          <CardHeader>
            <CardTitle className="text-2xl">{exam.title}</CardTitle>
            <CardDescription>{exam.instructions || 'Please read the instructions carefully before starting.'}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <h3 className="font-semibold">Exam Details</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Duration:</span>
                  <span className="ml-2 font-medium">{exam.duration_minutes} minutes</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Questions:</span>
                  <span className="ml-2 font-medium">{questions.length}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Total Marks:</span>
                  <span className="ml-2 font-medium">{exam.total_marks || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Allowed Languages:</span>
                  <span className="ml-2 font-medium">{languageOptions.length}</span>
                </div>
              </div>
            </div>

            {exam.instructions && (
              <div className="space-y-2">
                <h3 className="font-semibold">Instructions</h3>
                <div className="bg-muted p-4 rounded-lg text-sm whitespace-pre-wrap">
                  {exam.instructions}
                </div>
              </div>
            )}

            <Separator />

            <div className="space-y-4">
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">Important Requirements</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-yellow-800 dark:text-yellow-200">
                  <li>You must enter fullscreen mode to start the exam</li>
                  <li>Do not exit fullscreen during the exam</li>
                  <li>Do not use copy/paste functionality</li>
                  <li>Do not open developer tools</li>
                  <li>Stay on this page throughout the exam</li>
                </ul>
              </div>

              <Button 
                onClick={handleStartExam} 
                className="w-full" 
                size="lg"
              >
                {isFullscreen ? 'Start Exam' : 'Enter Fullscreen to Start'}
              </Button>
              {!isFullscreen && (
                <p className="text-sm text-center text-muted-foreground">
                  You must enter fullscreen mode before starting the exam
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="h-[100dvh] max-h-[100dvh] overflow-hidden flex flex-col" style={contentBlurred ? { filter: 'blur(6px)', pointerEvents: 'none' } : undefined}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-card">
        <div className="flex items-center space-x-4">
          <div>
            <h1 className="text-xl font-bold">{exam.title}</h1>
            <div className="flex items-center space-x-2 mt-1">
              <Badge variant="outline">Question {currentQuestionIndex + 1} / {questions.length}</Badge>
              {currentQuestion?.difficulty && (
                <Badge variant="secondary" className={getDifficultyClass(currentQuestion.difficulty)}>
                  {currentQuestion.difficulty}
                </Badge>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Timer */}
          <div className="flex items-center space-x-2">
            {sessionStatus === 'paused' && (
              <Badge variant="secondary" className="text-xs">
                Paused
              </Badge>
            )}
            {sessionStatus === 'expired' && (
              <Badge variant="destructive" className="text-xs">
                Expired
              </Badge>
            )}
            <div className={`px-3 py-1 rounded font-mono font-semibold ${
              timeRemaining < 300 ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200' :
              timeRemaining < 600 ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-200' :
              'bg-muted text-foreground'
            }`}>
              {formatTime(timeRemaining)}
            </div>
          </div>

          {/* Auto-save status */}
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <span className="capitalize">{autoSaveStatus}</span>
          </div>

          {/* Violations */}
          <Badge variant={violationCount >= violationThreshold ? 'destructive' : 'outline'}>
            Violations: {violationCount}
          </Badge>
        </div>
      </div>

      {/* Main Content */}
      <div ref={containerRef} className="flex-1 flex relative min-h-0 overflow-hidden">
        {/* Left Panel - Questions Sidebar */}
        <div className="w-64 border-r border-border bg-muted/30 flex flex-col min-h-0">
          <div className="p-4 border-b border-border">
            <h3 className="font-semibold">Questions</h3>
            <p className="text-sm text-muted-foreground">{questions.length} total</p>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {questions.map((question, index) => {
              const isSubmitted = submissionStatus[question.question_id] === 'submitted';
              return (
                <Button
                  key={question.question_id || index}
                  variant={index === currentQuestionIndex ? 'secondary' : 'outline'}
                  className="w-full justify-start"
                  onClick={() => handleQuestionChange(index)}
                >
                  <div className="flex items-center space-x-2 w-full">
                    <div className={`w-6 h-6 rounded flex items-center justify-center text-xs font-semibold ${
                      isSubmitted ? 'bg-green-500 text-white' :
                      index === currentQuestionIndex ? 'bg-primary text-primary-foreground' :
                      'bg-muted'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <div className="text-sm font-medium truncate">
                        {question.question_title || `Question ${index + 1}`}
                      </div>
                      {question.difficulty && (
                        <div className="text-xs text-muted-foreground">{question.difficulty}</div>
                      )}
                    </div>
                    {isSubmitted && (
                      <Badge variant="outline" className="text-xs">✓</Badge>
                    )}
                  </div>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Resizer */}
        <div
          ref={resizerRef}
          className="w-1 bg-border hover:bg-primary cursor-col-resize transition-colors"
        />

        {/* Center Panel - Question Description */}
        <div style={{ width: `${leftWidth}%` }} className="flex flex-col bg-background min-h-0">
          <Tabs defaultValue="description" className="flex-1 flex flex-col min-h-0">
            <TabsList className="m-4 mb-0">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="testcase">Test Cases</TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="flex-1 min-h-0 p-4 overflow-auto custom-scrollbar no-select">
              {questionLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : questionDetails ? (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">{currentQuestion?.question_title || 'Question'}</h3>
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                        {questionDetails.problem_statement || questionDetails.description || 'No description available.'}
                      </p>
                    </div>
                  </div>

                  {(() => {
                    // Handle examples - could be array, string, or null
                    let examples = questionDetails.examples;
                    if (examples) {
                      if (typeof examples === 'string') {
                        try {
                          examples = JSON.parse(examples);
                        } catch {
                          // If not JSON, treat as single example or skip
                          examples = null;
                        }
                      }
                      if (Array.isArray(examples) && examples.length > 0) {
                        return (
                          <>
                            <Separator />
                            <div>
                              <h3 className="text-lg font-semibold mb-3">Examples</h3>
                              <div className="space-y-4">
                                {examples.map((example, index) => (
                                  <div key={index} className="bg-code p-4 rounded-lg">
                                    <div className="space-y-2">
                                      <div>
                                        <strong>Input:</strong> <code className="ml-2">{example.input}</code>
                                      </div>
                                      <div>
                                        <strong>Output:</strong> <code className="ml-2">{example.output}</code>
                                      </div>
                                      {example.explanation && (
                                        <div>
                                          <strong>Explanation:</strong> <span className="ml-2">{example.explanation}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </>
                        );
                      }
                    }
                    return null;
                  })()}

                  {(() => {
                    // Handle constraints - could be array, string, or null
                    let constraints = questionDetails.constraints;
                    if (constraints) {
                      if (typeof constraints === 'string') {
                        try {
                          // Try to parse as JSON first
                          constraints = JSON.parse(constraints);
                        } catch {
                          // If not JSON, split by newlines or treat as single constraint
                          constraints = constraints.split('\n').filter(c => c.trim());
                        }
                      }
                      if (Array.isArray(constraints) && constraints.length > 0) {
                        return (
                          <>
                            <Separator />
                            <div>
                              <h3 className="text-lg font-semibold mb-3">Constraints</h3>
                              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                                {constraints.map((constraint, index) => (
                                  <li key={index}>{constraint}</li>
                                ))}
                              </ul>
                            </div>
                          </>
                        );
                      }
                    }
                    return null;
                  })()}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No question details available
                </div>
              )}
            </TabsContent>

            <TabsContent value="testcase" className="flex-1 min-h-0 p-4 overflow-auto custom-scrollbar no-select">
              <div className="space-y-4">
                {testcases.filter(tc => tc.is_visible === true).length > 0 ? (
                  testcases.filter(tc => tc.is_visible === true).map((testcase, index) => (
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
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No public test cases available
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Panel - Code Editor */}
        <div style={{ width: `${100 - leftWidth}%` }} className="flex flex-col min-h-0">
          {/* Code Editor Header */}
          <div className="p-4 border-b border-border bg-card">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h3 className="font-semibold">Code Editor</h3>
                <Select 
                  value={selectedLanguage?.value || selectedLanguage?.judge0Id?.toString()} 
                  onValueChange={handleLanguageChange}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {languageOptions.map((lang) => (
                      <SelectItem key={lang.judge0Id} value={lang.value || lang.judge0Id.toString()}>
                        {lang.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleSubmitQuestion}
                  disabled={isSubmitting || !code.trim()}
                >
                  Submit Question
                </Button>
                <Button 
                  variant="default" 
                  size="sm" 
                  onClick={handleSubmitExam}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Exam'}
                </Button>
              </div>
            </div>
          </div>

          {/* Code Editor */}
          <div className="flex-1 flex flex-col min-h-0">
            <CodeMirror
              value={code}
              onChange={(value) => setCode(value)}
              extensions={[
                selectedLanguage?.extension,
                ...noClipboard,
              ].filter(Boolean)}
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
                highlightSelectionMatches: false,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamSolvingPage;

