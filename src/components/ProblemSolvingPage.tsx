import React, { useState, useRef, useEffect } from 'react';
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

const ProblemSolvingPage = ({ problem, onBackToProblemList }) => {
  const { isDarkMode } = useTheme();
  const { toast } = useToast();
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [code, setCode] = useState(problem.starterCode?.javascript || '');
  const [customInput, setCustomInput] = useState('');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [leftWidth, setLeftWidth] = useState(50);
  const resizerRef = useRef(null);
  const containerRef = useRef(null);

  const languages = [
    { value: 'javascript', label: 'JavaScript', extension: javascript() },
    { value: 'python', label: 'Python', extension: python() },
    { value: 'cpp', label: 'C++', extension: cpp() }
  ];

  useEffect(() => {
    const newCode = problem.starterCode?.[selectedLanguage] || '';
    setCode(newCode);
  }, [selectedLanguage, problem.starterCode]);

  const handleLanguageChange = (language) => {
    setSelectedLanguage(language);
  };

  const handleRun = async () => {
    setIsRunning(true);
    
    // Simulate code execution
    setTimeout(() => {
      setOutput(`Running ${languages.find(l => l.value === selectedLanguage)?.label} code...\n\nInput:\n${customInput || 'No custom input provided'}\n\nOutput:\n// This would be the actual output from your code execution\n// Mock output for demonstration\nResult: Success`);
      setIsRunning(false);
      
      toast({
        title: "Code Executed",
        description: "Your code has been run successfully.",
      });
    }, 2000);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    // Simulate submission
    setTimeout(() => {
      const success = Math.random() > 0.3; // 70% success rate for demo
      
      if (success) {
        toast({
          title: "Submission Accepted!",
          description: "Your solution passed all test cases.",
        });
        setOutput(`Submission Result: ACCEPTED ✅\n\nTest Cases Passed: 15/15\nRuntime: 124ms\nMemory Usage: 14.2MB\n\nCongratulations! Your solution is correct.`);
      } else {
        toast({
          title: "Submission Failed",
          description: "Your solution failed some test cases.",
          variant: "destructive",
        });
        setOutput(`Submission Result: WRONG ANSWER ❌\n\nTest Cases Passed: 12/15\nFailed on test case 13:\nInput: [1, 2, 3, 4, 5]\nExpected: [5, 4, 3, 2, 1]\nActual: [1, 2, 3, 4, 5]\n\nPlease check your logic and try again.`);
      }
      setIsSubmitting(false);
    }, 3000);
  };

  const handleReset = () => {
    const confirmReset = window.confirm('Are you sure you want to reset your code? This will restore the starter code.');
    if (confirmReset) {
      setCode(problem.starterCode?.[selectedLanguage] || '');
      setOutput('');
      setCustomInput('');
      
      toast({
        title: "Code Reset",
        description: "Your code has been reset to the starter template.",
      });
    }
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

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-card">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={onBackToProblemList}>
            <BackIcon className="w-4 h-4 mr-2" />
            Back to Problems
          </Button>
          <div>
            <h1 className="text-xl font-bold">{problem.title}</h1>
            <div className="flex items-center space-x-2 mt-1">
              <span className={`text-sm font-medium ${getDifficultyClass(problem.difficulty)}`}>
                {problem.difficulty}
              </span>
              <Badge variant="outline">{problem.topic}</Badge>
              <Badge variant="secondary">{problem.company}</Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div ref={containerRef} className="flex-1 flex relative">
        {/* Left Panel */}
        <div style={{ width: `${leftWidth}%` }} className="flex flex-col bg-background">
          <Tabs defaultValue="description" className="flex-1 flex flex-col">
            <TabsList className="m-4 mb-0">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="testcase">Test Case</TabsTrigger>
              <TabsTrigger value="submissions">Submissions</TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="flex-1 p-4 overflow-auto custom-scrollbar">
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

            <TabsContent value="testcase" className="flex-1 p-4 overflow-auto custom-scrollbar">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Custom Test Case</h3>
                  <p className="text-muted-foreground mb-4">
                    Test your solution with custom input before submitting.
                  </p>
                </div>

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
            </TabsContent>

            <TabsContent value="submissions" className="flex-1 p-4 overflow-auto custom-scrollbar">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Your Submissions</h3>
                <div className="text-center py-8 text-muted-foreground">
                  <SendIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No submissions yet for this problem.</p>
                  <p className="text-sm">Submit your solution to see your submission history.</p>
                </div>
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
        <div style={{ width: `${100 - leftWidth}%` }} className="flex flex-col">
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
                      <SelectItem key={lang.value} value={lang.value}>
                        {lang.label}
                      </SelectItem>
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
          <div className="flex-1 overflow-hidden">
            <CodeMirror
              value={code}
              onChange={(value) => setCode(value)}
              extensions={[languages.find(l => l.value === selectedLanguage)?.extension]}
              theme={isDarkMode ? oneDark : undefined}
              style={{
                height: '100%',
                fontSize: '14px',
              }}
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

export default ProblemSolvingPage;