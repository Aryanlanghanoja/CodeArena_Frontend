import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Separator } from './ui/separator';
import { useToast } from '../hooks/use-toast';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { cpp } from '@codemirror/lang-cpp';
import { oneDark } from '@codemirror/theme-one-dark';
import { useTheme } from '../contexts/ThemeContext';
import questionsService from '../services/questionsService';
import judge0Service from '../services/judge0Service';
import SubmissionTestcasesModal from './SubmissionTestcasesModal';
import { EditorView, keymap } from '@codemirror/view';

const ProblemSolvingPage = ({ problem, onBackToProblemList, backButtonText = 'Back to Problems' }) => {
  const { isDarkMode } = useTheme();
  const { toast } = useToast();
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [code, setCode] = useState(problem.starterCode?.javascript || '');
  const [customInput, setCustomInput] = useState('');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [leftWidth, setLeftWidth] = useState(50);
  const [testcases, setTestcases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [lastRunResults, setLastRunResults] = useState(null);
  const [lastSubmitResults, setLastSubmitResults] = useState(null);
  const [autoSaveStatus, setAutoSaveStatus] = useState('saved'); // 'saving', 'saved', 'error'
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
    { value: 'c', label: 'C (GCC 9.2.0)', judge0Id: 50, extension: cpp() }, // C uses C++ extension
    
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

  // Disable copy, cut, paste, drag/drop and related shortcuts in the editor
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
  // const noClipboard = [];

  // Auto-save functionality with 6-hour expiration
  const saveToLocalStorage = useCallback((questionId, language, code) => {
    try {
      const key = `code_${questionId}_${language}`;
      const timestamp = Date.now();
      const cacheData = {
        code: code,
        timestamp: timestamp,
        expiresAt: timestamp + (6 * 60 * 60 * 1000) // 6 hours in milliseconds
      };
      localStorage.setItem(key, JSON.stringify(cacheData));
      setAutoSaveStatus('saved');
      
      // Update cache expiration info for display
      const now = Date.now();
      const timeLeft = cacheData.expiresAt - now;
      const hoursLeft = Math.floor(timeLeft / (60 * 60 * 1000));
      const minutesLeft = Math.floor((timeLeft % (60 * 60 * 1000)) / (60 * 1000));
      
      if (hoursLeft > 0) {
        setCacheExpirationInfo(`${hoursLeft}h ${minutesLeft}m left`);
      } else {
        setCacheExpirationInfo(`${minutesLeft}m left`);
      }
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
      setAutoSaveStatus('error');
    }
  }, []);

  const loadFromLocalStorage = useCallback((questionId, language) => {
    try {
      const key = `code_${questionId}_${language}`;
      const savedData = localStorage.getItem(key);
      
      if (!savedData) {
        return '';
      }
      
      // Try to parse as new format with timestamp
      try {
        const cacheData = JSON.parse(savedData);
        
        // Check if the cache has expired
        if (cacheData.expiresAt && Date.now() > cacheData.expiresAt) {
          // Cache expired, remove it and return empty string
          localStorage.removeItem(key);
          console.log(`Code cache expired for ${key}, removed from storage`);
          return '';
        }
        
        // Cache is still valid, return the code
        // Update cache expiration info for display
        const now = Date.now();
        const timeLeft = cacheData.expiresAt - now;
        const hoursLeft = Math.floor(timeLeft / (60 * 60 * 1000));
        const minutesLeft = Math.floor((timeLeft % (60 * 60 * 1000)) / (60 * 1000));
        
        if (hoursLeft > 0) {
          setCacheExpirationInfo(`${hoursLeft}h ${minutesLeft}m left`);
        } else {
          setCacheExpirationInfo(`${minutesLeft}m left`);
        }
        return cacheData.code || '';
      } catch (parseError) {
        // If parsing fails, it might be old format (just code string)
        // Return the raw data for backward compatibility
        return savedData;
      }
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
      return '';
    }
  }, []);

  // Clean up expired cache entries
  const cleanupExpiredCache = useCallback(() => {
    try {
      const keysToRemove = [];
      
      // Check all localStorage keys that start with 'code_'
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
          } catch (parseError) {
            // If it's not JSON format, it's old format - keep it for backward compatibility
            continue;
          }
        }
      }
      
      // Remove expired entries
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
        console.log(`Removed expired code cache: ${key}`);
      });
      
      if (keysToRemove.length > 0) {
        console.log(`Cleaned up ${keysToRemove.length} expired code cache entries`);
      }
    } catch (error) {
      console.error('Error cleaning up expired cache:', error);
    }
  }, []);

  const debouncedAutoSave = useCallback((questionId, language, code) => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    
    setAutoSaveStatus('saving');
    autoSaveTimeoutRef.current = setTimeout(() => {
      saveToLocalStorage(questionId, language, code);
    }, 2000); // Auto-save after 2 seconds of inactivity
  }, [saveToLocalStorage]);

  // Load saved code on component mount and cleanup expired cache
  useEffect(() => {
    // Clean up expired cache entries on component mount
    cleanupExpiredCache();
    
    const questionId = problem.question_id || problem.id;
    if (questionId) {
      const savedCode = loadFromLocalStorage(questionId, selectedLanguage);
      if (savedCode) {
        setCode(savedCode);
      } else {
        setCode(problem.starterCode?.[selectedLanguage] || '');
      }
    }
  }, [problem.question_id, problem.id, selectedLanguage, problem.starterCode, loadFromLocalStorage, cleanupExpiredCache]);

  // Periodic cleanup of expired cache entries (every hour)
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      cleanupExpiredCache();
    }, 60 * 60 * 1000); // 1 hour in milliseconds

    return () => clearInterval(cleanupInterval);
  }, [cleanupExpiredCache]);

  // Update cache expiration info display every minute
  useEffect(() => {
    const questionId = problem.question_id || problem.id;
    if (questionId) {
      const updateExpirationInfo = () => {
        try {
          const key = `code_${questionId}_${selectedLanguage}`;
          const savedData = localStorage.getItem(key);
          
          if (!savedData) {
            setCacheExpirationInfo(null);
            return;
          }
          
          try {
            const cacheData = JSON.parse(savedData);
            if (cacheData.expiresAt) {
              const now = Date.now();
              const timeLeft = cacheData.expiresAt - now;
              
              if (timeLeft > 0) {
                const hoursLeft = Math.floor(timeLeft / (60 * 60 * 1000));
                const minutesLeft = Math.floor((timeLeft % (60 * 60 * 1000)) / (60 * 1000));
                
                if (hoursLeft > 0) {
                  setCacheExpirationInfo(`${hoursLeft}h ${minutesLeft}m left`);
                } else {
                  setCacheExpirationInfo(`${minutesLeft}m left`);
                }
              } else {
                setCacheExpirationInfo(null);
              }
            } else {
              setCacheExpirationInfo(null);
            }
          } catch (parseError) {
            setCacheExpirationInfo(null);
          }
        } catch (error) {
          setCacheExpirationInfo(null);
        }
      };
      
      // Update immediately
      updateExpirationInfo();
      
      // Update every minute
      const updateInterval = setInterval(updateExpirationInfo, 60 * 1000);
      
      return () => clearInterval(updateInterval);
    }
  }, [problem.question_id, problem.id, selectedLanguage]);

  // Auto-save when code changes
  useEffect(() => {
    const questionId = problem.question_id || problem.id;
    if (questionId && code !== (problem.starterCode?.[selectedLanguage] || '')) {
      debouncedAutoSave(questionId, selectedLanguage, code);
    }
  }, [code, problem.question_id, problem.id, selectedLanguage, problem.starterCode, debouncedAutoSave]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  // Fetch question details and testcases
  useEffect(() => {
    const fetchQuestionDetails = async () => {
      try {
        setLoading(true);
        const result = await questionsService.getQuestion(problem.question_id || problem.id);
        
        if (result.success) {
          setTestcases(result.data.testcases || []);
        } else {
          toast({
            title: "Error",
            description: "Failed to fetch question details",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error('Error fetching question details:', error);
        toast({
          title: "Error",
          description: "Failed to fetch question details",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    if (problem.question_id || problem.id) {
      fetchQuestionDetails();
    }
  }, [problem.question_id, problem.id, toast]);

  // Fetch past submissions
  const fetchSubmissions = useCallback(async () => {
    try {
      setSubmissionsLoading(true);
      const result = await questionsService.getPastSubmissions(problem.question_id || problem.id);
      
      if (result.success) {
        setSubmissions(result.data || []);
      } else {
        console.error('Failed to fetch submissions:', result.message);
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
    } finally {
      setSubmissionsLoading(false);
    }
  }, [problem.question_id, problem.id]);

  // Fetch submissions when component mounts
  useEffect(() => {
    if (problem.question_id || problem.id) {
      fetchSubmissions();
    }
  }, [fetchSubmissions]);

  const handleLanguageChange = (language) => {
    setSelectedLanguage(language);
  };

  const handleRun = async () => {
    if (!code.trim()) {
      toast({
        title: "Error",
        description: "Please write some code before running",
        variant: "destructive"
      });
      return;
    }

    setIsRunning(true);
    
    try {
      const selectedLang = languages.find(l => l.value === selectedLanguage);
      if (!selectedLang) {
        throw new Error('Selected language not supported');
      }

      // Get only public testcases for running
      const publicTestcases = testcases.filter(tc => tc.is_visible === true);
      
      if (publicTestcases.length === 0) {
        setOutput(`Running ${selectedLang.label} code...\n\nInput:\n${customInput || 'No custom input provided'}\n\nOutput:\n// No public testcases available for this question\n// Using custom input only\nResult: Code executed successfully`);
        setIsRunning(false);
        toast({
          title: "Code Executed",
          description: "Your code has been run successfully (no public testcases).",
        });
        return;
      }

      // Run code against public testcases using backend API
      try {
        const result = await judge0Service.practiceRun({
          question_id: problem.question_id || problem.id,
          code: code,
          language_id: selectedLang.judge0Id
        });

        if (result.success && result.data) {
          const results = result.data.results || [];
          let passedTests = 0;
          let failedTests = 0;
          
          results.forEach((result, index) => {
            if (result.status === 'Accepted') {
              passedTests++;
            } else {
              failedTests++;
            }
          });

          // Format output
          let outputText = `Running ${selectedLang.label} code...\n\n`;
          outputText += `📊 PUBLIC TEST CASES SUMMARY:\n`;
          outputText += `Total: ${results.length} | Passed: ${passedTests} | Failed: ${failedTests}\n\n`;
          
          if (failedTests > 0) {
            outputText += `❌ FAILED TEST CASES:\n`;
            outputText += `═══════════════════════════════════════\n\n`;
            
            results.forEach((result, index) => {
              if (result.status !== 'Accepted') {
                const testcase = publicTestcases[index];
                if (testcase) {
                  // Get error category and styling
                  const getErrorEmoji = (category) => {
                    switch (category) {
                      case 'syntax_error': return '🔧';
                      case 'performance_error': return '⏱️';
                      case 'memory_error': return '💥';
                      case 'math_error': return '🔢';
                      case 'runtime_error': return '⚠️';
                      case 'logic_error': return '🤔';
                      case 'system_error': return '🔧';
                      default: return '❌';
                    }
                  };

                  const errorEmoji = getErrorEmoji(result.category);
                  const isCritical = result.is_critical;
                  
                  outputText += `${errorEmoji} Test Case ${index + 1} - ${result.status}\n`;
                  outputText += `─────────────────────────────────────────\n`;
                  
                  if (isCritical) {
                    outputText += `🚨 CRITICAL ERROR: ${result.suggestion}\n\n`;
                  }
                  
                  outputText += `Input: ${testcase.stdin}\n`;
                  outputText += `Expected: ${testcase.expected_output}\n`;
                  outputText += `Actual: ${result.stdout || 'No output'}\n`;
                  
                  if (result.stderr) {
                    outputText += `Error Details: ${result.stderr}\n`;
                  }
                  
                  if (result.compile_output) {
                    outputText += `Compilation Error: ${result.compile_output}\n`;
                  }
                  
                  if (testcase.explanation) {
                    outputText += `Test Case Explanation: ${testcase.explanation}\n`;
                  }
                  
                  if (result.suggestion && !isCritical) {
                    outputText += `💡 Suggestion: ${result.suggestion}\n`;
                  }
                  
                  outputText += `Runtime: ${safeFormatNumber(result.time, 2, '0')}ms | Memory: ${safeFormatNumber(result.memory, 0, '0')}KB\n\n`;
                }
              }
            });
          }
          
          if (passedTests > 0) {
            outputText += `✅ PASSED TEST CASES:\n`;
            outputText += `═══════════════════════════════════════\n`;
            
            results.forEach((result, index) => {
              if (result.status === 'Accepted') {
                const testcase = publicTestcases[index];
                if (testcase) {
                  outputText += `Test Case ${index + 1} - ✅ PASSED\n`;
                  if (testcase.explanation) {
                    outputText += `  Explanation: ${testcase.explanation}\n`;
                  }
                  outputText += `  Runtime: ${safeFormatNumber(result.time, 2, '0')}ms | Memory: ${safeFormatNumber(result.memory, 0, '0')}KB\n`;
                }
              }
            });
          }

          setOutput(outputText);
          
          // Store results for progress model
          setLastRunResults({
            passed: passedTests,
            total: results.length,
            results: results,
            timestamp: new Date().toISOString()
          });
          
          // Enhanced toast message for run results
          if (failedTests > 0) {
            // Get the most common error type for better messaging
            const errorTypes = results
              .filter(r => r.status !== 'Accepted')
              .map(r => r.category)
              .reduce((acc, category) => {
                acc[category] = (acc[category] || 0) + 1;
                return acc;
              }, {});
            
            const mostCommonError = Object.keys(errorTypes).reduce((a, b) => 
              errorTypes[a] > errorTypes[b] ? a : b, 'unknown_error'
            );
            
            const getErrorTitle = (category) => {
              switch (category) {
                case 'syntax_error': return 'Syntax Error 🔧';
                case 'performance_error': return 'Time Limit Exceeded ⏱️';
                case 'memory_error': return 'Memory Error 💥';
                case 'math_error': return 'Math Error 🔢';
                case 'runtime_error': return 'Runtime Error ⚠️';
                case 'logic_error': return 'Wrong Answer 🤔';
                default: return 'Code Execution Failed ❌';
              }
            };
            
            toast({
              title: getErrorTitle(mostCommonError),
              description: `Public test cases: ${passedTests}/${results.length} passed (${failedTests} failed). Check the output for detailed error messages and suggestions.`,
              variant: "destructive"
            });
          } else {
            toast({
              title: "Code Executed Successfully ✅",
              description: `All ${passedTests} public test cases passed!`,
            });
          }
        } else {
          throw new Error(result.message || 'Failed to run code');
        }
      } catch (error) {
        console.error('Error running code:', error);
        setOutput(`Error: ${error.message}`);
        toast({
          title: "Error",
          description: "Failed to run code",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error running code:', error);
      setOutput(`Error: ${error.message}`);
      toast({
        title: "Error",
        description: "Failed to run code",
        variant: "destructive"
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    if (!code.trim()) {
      toast({
        title: "Error",
        description: "Please write some code before submitting",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const selectedLang = languages.find(l => l.value === selectedLanguage);
      if (!selectedLang) {
        throw new Error('Selected language not supported');
      }

      if (testcases.length === 0) {
        setOutput(`Submission Result: ERROR ❌\n\nNo test cases available for this question.`);
        toast({
          title: "Submission Failed",
          description: "No test cases available",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }

      // Submit code against ALL testcases (public + hidden)
      try {
        const result = await judge0Service.submitCode({
          question_id: problem.question_id || problem.id,
          code: code,
          language_id: selectedLang.judge0Id
        });

        if (result.success && result.data) {
          const { results, summary } = result.data;
          const { 
            total_testcases, 
            passed_testcases, 
            failed_testcases,
            public_testcases,
            public_passed,
            public_failed,
            hidden_testcases,
            hidden_passed,
            hidden_failed,
            total_weight, 
            earned_weight, 
            score, 
            success 
          } = summary;

          // Format output
          let outputText = `Submission Result: ${success ? 'ACCEPTED ✅' : 'WRONG ANSWER ❌'}\n\n`;
          outputText += `📊 SUMMARY:\n`;
          outputText += `Total Test Cases: ${passed_testcases}/${total_testcases} passed\n`;
          outputText += `Public Test Cases: ${public_passed}/${public_testcases} passed\n`;
          outputText += `Hidden Test Cases: ${hidden_passed}/${hidden_testcases} passed\n`;
          outputText += `Score: ${safeFormatNumber(score, 1)}% (${safeFormatNumber(earned_weight, 1)}/${safeFormatNumber(total_weight, 1)} points)\n\n`;
          
          if (!success) {
            outputText += `❌ FAILED TEST CASES:\n`;
            outputText += `═══════════════════════════════════════\n\n`;
            
            results.forEach((testResult, index) => {
              if (!testResult.passed) {
                // Get error category and styling
                const getErrorEmoji = (category) => {
                  switch (category) {
                    case 'syntax_error': return '🔧';
                    case 'performance_error': return '⏱️';
                    case 'memory_error': return '💥';
                    case 'math_error': return '🔢';
                    case 'runtime_error': return '⚠️';
                    case 'logic_error': return '🤔';
                    case 'system_error': return '🔧';
                    default: return '❌';
                  }
                };

                const errorEmoji = getErrorEmoji(testResult.category);
                const isCritical = testResult.is_critical;
                
                outputText += `${errorEmoji} Test Case ${testResult.testcase_number} (${testResult.is_visible ? 'Public' : 'Hidden'}) - ${testResult.status}\n`;
                outputText += `─────────────────────────────────────────\n`;
                
                if (isCritical) {
                  outputText += `🚨 CRITICAL ERROR: ${testResult.suggestion}\n\n`;
                }
                
                if (testResult.is_visible) {
                  outputText += `Input: ${testResult.stdin}\n`;
                  outputText += `Expected: \n${testResult.expected_output}\n`;
                  outputText += `Actual: ${testResult.stdout || 'No output'}\n`;
                } else {
                  outputText += `Input: [Hidden]\n`;
                  outputText += `Expected: [Hidden]\n`;
                 // outputText += `Actual: ${testResult.stdout || 'No output'}\n`;
                }
                
                if (testResult.stderr) {
                  outputText += `Error Details: ${testResult.stderr}\n`;
                }
                
                if (testResult.compile_output) {
                  outputText += `Compilation Error: ${testResult.compile_output}\n`;
                }
                
                if (testResult.explanation && testResult.is_visible) {
                  outputText += `Test Case Explanation: ${testResult.explanation}\n`;
                }
                
                if (testResult.suggestion && !isCritical) {
                  outputText += `💡 Suggestion: ${testResult.suggestion}\n`;
                }
                
                outputText += `Runtime: ${safeFormatNumber(testResult.runtime, 2)}ms | Memory: ${safeFormatNumber(testResult.memory, 0)}KB\n\n`;
              }
            });
            
            outputText += `✅ PASSED TEST CASES:\n`;
            outputText += `═══════════════════════════════════════\n`;
            
            results.forEach((testResult, index) => {
              if (testResult.passed) {
                outputText += `Test Case ${testResult.testcase_number} (${testResult.is_visible ? 'Public' : 'Hidden'}) - ✅ PASSED\n`;
                if (testResult.is_visible && testResult.explanation) {
                  outputText += `  Explanation: ${testResult.explanation}\n`;
                }
                outputText += `  Runtime: ${safeFormatNumber(testResult.runtime, 2)}ms | Memory: ${safeFormatNumber(testResult.memory, 0)}KB\n`;
              }
            });
          } else {
            outputText += `🎉 Congratulations! Your solution is correct.\n`;
            outputText += `All test cases passed successfully.\n\n`;
            outputText += `✅ ALL TEST CASES PASSED:\n`;
            outputText += `═══════════════════════════════════════\n`;
            
            results.forEach((testResult, index) => {
              outputText += `Test Case ${testResult.testcase_number} (${testResult.is_visible ? 'Public' : 'Hidden'}) - ✅ PASSED\n`;
              if (testResult.is_visible && testResult.explanation) {
                outputText += `  Explanation: ${testResult.explanation}\n`;
              }
              outputText += `  Runtime: ${safeFormatNumber(testResult.runtime, 2)}ms | Memory: ${safeFormatNumber(testResult.memory, 0)}KB\n`;
            });
          }

          setOutput(outputText);
          
          // Store results for progress model
          setLastSubmitResults({
            passed: passed_testcases,
            total: total_testcases,
            publicPassed: public_passed,
            publicTotal: public_testcases,
            hiddenPassed: hidden_passed,
            hiddenTotal: hidden_testcases,
            score: score,
            success: success,
            results: results,
            timestamp: new Date().toISOString()
          });
          
          // Refresh submissions list
          fetchSubmissions();
          
          if (success) {
            toast({
              title: "Submission Accepted! 🎉",
              description: `All ${total_testcases} test cases passed (${safeFormatNumber(score, 1)}% score).`,
            });
          } else {
            // Get the most common error type for better messaging
            const errorTypes = results
              .filter(r => !r.passed)
              .map(r => r.category)
              .reduce((acc, category) => {
                acc[category] = (acc[category] || 0) + 1;
                return acc;
              }, {});
            
            const mostCommonError = Object.keys(errorTypes).reduce((a, b) => 
              errorTypes[a] > errorTypes[b] ? a : b, 'unknown_error'
            );
            
            const getErrorTitle = (category) => {
              switch (category) {
                case 'syntax_error': return 'Syntax Error 🔧';
                case 'performance_error': return 'Time Limit Exceeded ⏱️';
                case 'memory_error': return 'Memory Error 💥';
                case 'math_error': return 'Math Error 🔢';
                case 'runtime_error': return 'Runtime Error ⚠️';
                case 'logic_error': return 'Wrong Answer 🤔';
                default: return 'Submission Failed ❌';
              }
            };
            
            toast({
              title: getErrorTitle(mostCommonError),
              description: `${failed_testcases} test cases failed (${passed_testcases}/${total_testcases} passed). Check the output for detailed error messages and suggestions.`,
              variant: "destructive"
            });
          }
        } else {
          throw new Error(result.message || 'Failed to submit code');
        }
      } catch (error) {
        console.error('Error submitting code:', error);
        setOutput(`Error: ${error.message}`);
        toast({
          title: "Error",
          description: "Failed to submit code",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error submitting code:', error);
      setOutput(`Error: ${error.message}`);
      toast({
        title: "Error",
        description: "Failed to submit code",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    const confirmReset = window.confirm('Are you sure you want to reset your code? This will restore the starter code and clear saved progress.');
    if (confirmReset) {
      const questionId = problem.question_id || problem.id;
      const key = `code_${questionId}_${selectedLanguage}`;
      localStorage.removeItem(key);
      
      setCode(problem.starterCode?.[selectedLanguage] || '');
      setOutput('');
      setCustomInput('');
      setLastRunResults(null);
      setLastSubmitResults(null);
      setAutoSaveStatus('saved');
      
      toast({
        title: "Code Reset",
        description: "Your code has been reset to the starter template.",
      });
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

  const getDifficultyClass = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'text-difficulty-easy';
      case 'Medium': return 'text-difficulty-medium';
      case 'Hard': return 'text-difficulty-hard';
      default: return '';
    }
  };

  // Helper function to safely format numbers
  const safeFormatNumber = (value, decimals = 1, fallback = 'N/A') => {
    if (value === null || value === undefined || typeof value !== 'number' || isNaN(value)) {
      return fallback;
    }
    return value.toFixed(decimals);
  };

  // Helper function to get error category styling
  const getErrorCategoryInfo = (status) => {
    if (status === 'Accepted') {
      return { emoji: '✅', color: 'text-green-600', bgColor: 'bg-green-500' };
    }
    
    if (status === 'Wrong Answer') {
      return { emoji: '🤔', color: 'text-red-600', bgColor: 'bg-red-500' };
    }
    
    if (status === 'Time Limit Exceeded (TLE)') {
      return { emoji: '⏱️', color: 'text-yellow-600', bgColor: 'bg-yellow-500' };
    }
    
    if (status === 'Compilation Error') {
      return { emoji: '🔧', color: 'text-purple-600', bgColor: 'bg-purple-500' };
    }
    
    if (status.includes('Runtime Error')) {
      return { emoji: '⚠️', color: 'text-orange-600', bgColor: 'bg-orange-500' };
    }
    
    if (status === 'Internal Error') {
      return { emoji: '🔧', color: 'text-gray-600', bgColor: 'bg-gray-500' };
    }
    
    return { emoji: '❌', color: 'text-gray-600', bgColor: 'bg-gray-400' };
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

  const EyeIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );

  return (
    <div className="h-[100dvh] max-h-[100dvh] overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-card">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={onBackToProblemList}>
            <BackIcon className="w-4 h-4 mr-2" />
{backButtonText}
          </Button>
          <div>
            <h1 className="text-xl font-bold">{problem.title}</h1>
            <div className="flex items-center space-x-2 mt-1">
              <span className={`text-sm font-medium ${getDifficultyClass(problem.difficulty)}`}>{problem.difficulty}</span>
              <Badge variant="outline">{problem.topic}</Badge>
              <Badge variant="secondary">{problem.company}</Badge>
            </div>
          </div>
        </div>
        
        {/* Progress Model */}
        <div className="flex items-center space-x-4">
          {/* Auto-save Status */}
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <SaveIcon className="w-4 h-4" />
            <span className="capitalize">{autoSaveStatus}</span>
            {cacheExpirationInfo && (
              <span className="text-xs bg-muted px-2 py-1 rounded">
                Cache expires in {cacheExpirationInfo}
              </span>
            )}
          </div>
          
          {/* Last Run Results */}
          {lastRunResults && (
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <CheckIcon className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium text-green-600">
                  {lastRunResults.passed}/{lastRunResults.total}
                </span>
              </div>
              <span className="text-xs text-muted-foreground">Public</span>
            </div>
          )}
          
          {/* Last Submit Results */}
          {lastSubmitResults && (
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                {lastSubmitResults.success ? (
                  <CheckIcon className="w-4 h-4 text-green-500" />
                ) : (
                  <XIcon className="w-4 h-4 text-red-500" />
                )}
                <span className={`text-sm font-medium ${lastSubmitResults.success ? 'text-green-600' : 'text-red-600'}`}>
                  {lastSubmitResults.passed}/{lastSubmitResults.total}
                </span>
              </div>
              <span className="text-xs text-muted-foreground">
                {safeFormatNumber(lastSubmitResults.score, 1)}%
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div ref={containerRef} className="flex-1 flex relative min-h-0 overflow-hidden">
        {/* Left Panel */}
        <div style={{ width: `${leftWidth}%` }} className="flex flex-col bg-background min-h-0">
          <Tabs defaultValue="description" className="flex-1 flex flex-col min-h-0">
            <TabsList className="m-4 mb-0">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="testcase">Test Case</TabsTrigger>
              <TabsTrigger value="submissions">Submissions</TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="flex-1 min-h-0 p-4 overflow-auto custom-scrollbar">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Problem Description</h3>
                  <p className="text-muted-foreground leading-relaxed">{problem.description}</p>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-semibold mb-3">Examples</h3>
                  <div className="space-y-4">
                    {problem.examples.map((example, index) => (
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

                <Separator />

                <div>
                  <h3 className="text-lg font-semibold mb-3">Constraints</h3>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    {problem.constraints.map((constraint, index) => (
                      <li key={index}>{constraint}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="testcase" className="flex-1 min-h-0 p-4 overflow-auto custom-scrollbar">
              <div className="space-y-6">
                {/* Public Test Cases */}
                {loading ? (
                  <div className="text-center py-8">
                    <div className="text-muted-foreground">Loading test cases...</div>
                  </div>
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
                      </div>
                    )}

                    <Separator />

                    {/* Custom Test Case */}
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Custom Test Case</h3>
                      <p className="text-muted-foreground mb-4">Test your solution with custom input before submitting.</p>

                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium mb-2 block">Input</label>
                          <Textarea
                            placeholder="Enter your test input here..."
                            value={customInput}
                            onChange={(e) => setCustomInput(e.target.value)}
                            className="min-h-[100px] font-mono"
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium mb-2 block">Output</label>
                          <div className="bg-code p-4 rounded-lg min-h-[100px] font-mono text-sm whitespace-pre-wrap">
                            {output || 'Run your code to see the output here...'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </TabsContent>

            <TabsContent value="submissions" className="flex-1 min-h-0 p-4 overflow-auto custom-scrollbar">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Your Submissions</h3>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={fetchSubmissions}
                    disabled={submissionsLoading}
                  >
                    <RefreshIcon className="w-4 h-4 mr-2" />
                    {submissionsLoading ? 'Loading...' : 'Refresh'}
                  </Button>
                </div>
                
                {submissionsLoading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <ClockIcon className="w-8 h-8 mx-auto mb-2 animate-spin" />
                    <p>Loading submissions...</p>
                  </div>
                ) : submissions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <SendIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No submissions yet for this problem.</p>
                    <p className="text-sm">Submit your solution to see your submission history.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {submissions.map((submission, index) => {
                      // Add error boundary for individual submission rendering
                      try {
                        return (
                      <Card key={submission.submission_id || index} className="hover:bg-muted/50 transition-colors">
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            {/* Header */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                {(() => {
                                  const errorInfo = getErrorCategoryInfo(submission.status);
                                  return (
                                    <>
                                      <div className={`w-3 h-3 rounded-full ${errorInfo.bgColor}`} />
                                      <div>
                                        <div className="flex items-center space-x-2">
                                          <span className="text-lg">{errorInfo.emoji}</span>
                                          <span className={`font-medium ${errorInfo.color}`}>
                                            {submission.status}
                                          </span>
                                          {submission.score !== undefined && submission.score !== null && (
                                            <Badge variant="outline">
                                              {safeFormatNumber(submission.score, 1)}%
                                            </Badge>
                                          )}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                          {new Date(submission.created_at).toLocaleString()}
                                        </div>
                                      </div>
                                    </>
                                  );
                                })()}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {languages.find(l => l.judge0Id === submission.language_id)?.label || 'Unknown Language'}
                              </div>
                            </div>
                            
                            {/* Detailed Results */}
                            {submission.total_testcases && (
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div className="text-center">
                                  <div className="font-medium text-green-600">
                                    {submission.passed_testcases}/{submission.total_testcases}
                                  </div>
                                  <div className="text-xs text-muted-foreground">Test Cases</div>
                                </div>
                                
                                {submission.public_testcases > 0 && (
                                  <div className="text-center">
                                    <div className="font-medium text-blue-600">
                                      {submission.public_passed}/{submission.public_testcases}
                                    </div>
                                    <div className="text-xs text-muted-foreground">Public</div>
                                  </div>
                                )}
                                
                                {submission.hidden_testcases > 0 && (
                                  <div className="text-center">
                                    <div className="font-medium text-purple-600">
                                      {submission.hidden_passed}/{submission.hidden_testcases}
                                    </div>
                                    <div className="text-xs text-muted-foreground">Hidden</div>
                                  </div>
                                )}
                                
                                {submission.average_execution_time && (
                                  <div className="text-center">
                                    <div className="font-medium text-orange-600">
                                      {safeFormatNumber(submission.average_execution_time, 2)}ms
                                    </div>
                                    <div className="text-xs text-muted-foreground">Avg Time</div>
                                  </div>
                                )}
                              </div>
                            )}
                            
                            {/* Performance Metrics */}
                            {(submission.total_execution_time || submission.total_memory_used) && (
                              <div className="flex items-center justify-between text-xs text-muted-foreground border-t pt-2">
                                <div>
                                  Total Time: {safeFormatNumber(submission.total_execution_time, 2)}ms
                                </div>
                                <div>
                                  Total Memory: {submission.total_memory_used || 'N/A'}KB
                                </div>
                                <div>
                                  Type: {submission.submission_type || 'practice'}
                                </div>
                              </div>
                            )}
                            
                            {/* View Testcases Button */}
                            {submission.public_testcases > 0 && (
                              <div className="flex justify-end pt-2 border-t">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleViewTestcases(submission.submission_id)}
                                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                >
                                  <EyeIcon className="h-4 w-4 mr-2" />
                                  View Testcases
                                </Button>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                        );
                      } catch (error) {
                        console.error('Error rendering submission:', error, submission);
                        return (
                          <Card key={submission.submission_id || index} className="border-red-200 bg-red-50">
                            <CardContent className="p-4">
                              <div className="text-red-600 text-sm">
                                Error displaying submission: {error.message}
                              </div>
                            </CardContent>
                          </Card>
                        );
                      }
                    })}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Resizer */}
        <div
          ref={resizerRef}
          className="w-1 bg-border hover:bg-primary cursor-col-resize transition-colors"
        />

        {/* Right Panel */}
        <div style={{ width: `${100 - leftWidth}%` }} className="flex flex-col min-h-0">
          {/* Code Editor Header */}
          <div className="p-4 border-b border-border bg-card">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h3 className="font-semibold">Code Editor</h3>
                <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang.value} value={lang.value}>{lang.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={handleReset}>
                  <RefreshIcon className="w-4 h-4 mr-2" />
                  Reset
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleRun}
                  disabled={isRunning}
                >
                  <PlayIcon className="w-4 h-4 mr-2" />
                  {isRunning ? 'Running...' : 'Run'}
                </Button>
                <Button 
                  size="sm" 
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  <SendIcon className="w-4 h-4 mr-2" />
                  {isSubmitting ? 'Submitting...' : 'Submit'}
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
                languages.find(l => l.value === selectedLanguage)?.extension,
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

      {/* Submission Testcases Modal */}
      <SubmissionTestcasesModal
        submissionId={selectedSubmissionId}
        isOpen={testcasesModalOpen}
        onClose={handleCloseTestcasesModal}
      />
    </div>
  );
};

export default ProblemSolvingPage;