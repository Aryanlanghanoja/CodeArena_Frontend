import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
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

const StudentPracticePage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [topicFilter, setTopicFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [isProblemDetailsOpen, setIsProblemDetailsOpen] = useState(false);
  const [isCodeEditorOpen, setIsCodeEditorOpen] = useState(false);

  // Mock data - replace with actual API calls
  useEffect(() => {
    const fetchProblems = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockProblems = [
          {
            id: 1,
            title: 'Two Sum',
            difficulty: 'Easy',
            topic: 'Arrays',
            description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
            constraints: '2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9',
            examples: [
              {
                input: 'nums = [2,7,11,15], target = 9',
                output: '[0,1]',
                explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].'
              },
              {
                input: 'nums = [3,2,4], target = 6',
                output: '[1,2]',
                explanation: 'Because nums[1] + nums[2] == 6, we return [1, 2].'
              }
            ],
            testCases: [
              { input: '[2,7,11,15]\n9', expectedOutput: '[0,1]' },
              { input: '[3,2,4]\n6', expectedOutput: '[1,2]' },
              { input: '[3,3]\n6', expectedOutput: '[0,1]' }
            ],
            acceptanceRate: 85.2,
            totalSubmissions: 1250,
            solved: true,
            bestScore: 100,
            lastAttempt: '2024-01-18T14:30:00Z',
            timeLimit: 1000, // ms
            memoryLimit: 128, // MB
            allowedLanguages: ['python', 'java', 'cpp', 'javascript']
          },
          {
            id: 2,
            title: 'Reverse Linked List',
            difficulty: 'Medium',
            topic: 'Linked Lists',
            description: 'Given the head of a singly linked list, reverse the list, and return the reversed list.',
            constraints: 'The number of nodes in the list is the range [0, 5000].\n-5000 <= Node.val <= 5000',
            examples: [
              {
                input: 'head = [1,2,3,4,5]',
                output: '[5,4,3,2,1]',
                explanation: ''
              }
            ],
            testCases: [
              { input: '[1,2,3,4,5]', expectedOutput: '[5,4,3,2,1]' },
              { input: '[1,2]', expectedOutput: '[2,1]' },
              { input: '[]', expectedOutput: '[]' }
            ],
            acceptanceRate: 72.8,
            totalSubmissions: 890,
            solved: false,
            bestScore: null,
            lastAttempt: null,
            timeLimit: 1000,
            memoryLimit: 128,
            allowedLanguages: ['python', 'java', 'cpp']
          },
          {
            id: 3,
            title: 'Binary Tree Traversal',
            difficulty: 'Hard',
            topic: 'Trees',
            description: 'Given the root of a binary tree, return the inorder traversal of its nodes\' values.',
            constraints: 'The number of nodes in the tree is in the range [0, 100].\n-100 <= Node.val <= 100',
            examples: [
              {
                input: 'root = [1,null,2,3]',
                output: '[1,3,2]',
                explanation: ''
              }
            ],
            testCases: [
              { input: '[1,null,2,3]', expectedOutput: '[1,3,2]' },
              { input: '[]', expectedOutput: '[]' },
              { input: '[1]', expectedOutput: '[1]' }
            ],
            acceptanceRate: 65.4,
            totalSubmissions: 456,
            solved: false,
            bestScore: null,
            lastAttempt: null,
            timeLimit: 1000,
            memoryLimit: 128,
            allowedLanguages: ['python', 'java', 'cpp']
          },
          {
            id: 4,
            title: 'Valid Parentheses',
            difficulty: 'Easy',
            topic: 'Stacks',
            description: 'Given a string s containing just the characters \'(\', \')\', \'{\', \'}\', \'[\' and \']\', determine if the input string is valid.',
            constraints: '1 <= s.length <= 10^4\ns consists of parentheses only \'()[]{}\'',
            examples: [
              {
                input: 's = "()"',
                output: 'true',
                explanation: ''
              },
              {
                input: 's = "()[]{}"',
                output: 'true',
                explanation: ''
              }
            ],
            testCases: [
              { input: '"()"', expectedOutput: 'true' },
              { input: '"()[]{}"', expectedOutput: 'true' },
              { input: '"(]"', expectedOutput: 'false' }
            ],
            acceptanceRate: 78.9,
            totalSubmissions: 2100,
            solved: true,
            bestScore: 95,
            lastAttempt: '2024-01-15T10:20:00Z',
            timeLimit: 1000,
            memoryLimit: 128,
            allowedLanguages: ['python', 'java', 'cpp', 'javascript']
          }
        ];
        
        setProblems(mockProblems);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch problems",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProblems();
  }, [toast]);

  const filteredProblems = problems.filter(problem => {
    const matchesSearch = problem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         problem.topic.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDifficulty = difficultyFilter === 'all' || problem.difficulty === difficultyFilter;
    const matchesTopic = topicFilter === 'all' || problem.topic === topicFilter;
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'solved' && problem.solved) ||
                         (statusFilter === 'unsolved' && !problem.solved);
    return matchesSearch && matchesDifficulty && matchesTopic && matchesStatus;
  });

  const handleStartProblem = (problem) => {
    setSelectedProblem(problem);
    setIsCodeEditorOpen(true);
  };

  const handleViewProblem = (problem) => {
    setSelectedProblem(problem);
    setIsProblemDetailsOpen(true);
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

  const getStatusBadge = (solved) => {
    return (
      <Badge variant={solved ? 'default' : 'secondary'}>
        {solved ? 'Solved' : 'Unsolved'}
      </Badge>
    );
  };

  const getScoreBadge = (score) => {
    if (score === null) return null;
    
    let variant = 'secondary';
    if (score >= 90) variant = 'default';
    else if (score >= 70) variant = 'secondary';
    else variant = 'destructive';
    
    return (
      <Badge variant={variant}>
        {score}%
      </Badge>
    );
  };

  const stats = {
    total: problems.length,
    solved: problems.filter(p => p.solved).length,
    easy: problems.filter(p => p.difficulty === 'Easy').length,
    medium: problems.filter(p => p.difficulty === 'Medium').length,
    hard: problems.filter(p => p.difficulty === 'Hard').length,
    totalSubmissions: problems.reduce((sum, p) => sum + p.totalSubmissions, 0),
    averageScore: problems.filter(p => p.solved).reduce((sum, p) => sum + p.bestScore, 0) / 
                 Math.max(problems.filter(p => p.solved).length, 1)
  };

  const topics = [...new Set(problems.map(p => p.topic))];

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
          <h1 className="text-3xl font-bold mb-2">Practice Problems</h1>
          <p className="text-muted-foreground">
            Solve coding problems to improve your programming skills.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Problems</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Solved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{stats.solved}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Easy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{stats.easy}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Medium</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">{stats.medium}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Hard</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{stats.hard}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{stats.totalSubmissions}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">
              {stats.averageScore.toFixed(1)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Problem Browser</CardTitle>
          <CardDescription>Search and filter coding problems</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search by title or topic..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Difficulties</SelectItem>
                <SelectItem value="Easy">Easy</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Hard">Hard</SelectItem>
              </SelectContent>
            </Select>
            <Select value={topicFilter} onValueChange={setTopicFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by topic" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Topics</SelectItem>
                {topics.map(topic => (
                  <SelectItem key={topic} value={topic}>{topic}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Problems</SelectItem>
                <SelectItem value="solved">Solved</SelectItem>
                <SelectItem value="unsolved">Unsolved</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Problems Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProblems.map((problem) => (
              <Card key={problem.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex gap-2">
                      {getDifficultyBadge(problem.difficulty)}
                      {getStatusBadge(problem.solved)}
                    </div>
                    {problem.solved && (
                      <div className="text-right">
                        {getScoreBadge(problem.bestScore)}
                      </div>
                    )}
                  </div>
                  <CardTitle className="text-lg">{problem.title}</CardTitle>
                  <CardDescription className="text-sm">
                    {problem.description.substring(0, 100)}...
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Topic: {problem.topic}</span>
                      <span>Acceptance: {problem.acceptanceRate}%</span>
                    </div>
                    
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Submissions: {problem.totalSubmissions}</span>
                      <span>Time: {problem.timeLimit}ms</span>
                    </div>

                    {problem.solved && (
                      <div className="text-sm text-muted-foreground">
                        Last solved: {new Date(problem.lastAttempt).toLocaleDateString()}
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleStartProblem(problem)}
                      >
                        {problem.solved ? 'Solve Again' : 'Start Solving'}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleViewProblem(problem)}
                      >
                        View
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredProblems.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No problems found matching your criteria.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Problem Details Dialog */}
      <Dialog open={isProblemDetailsOpen} onOpenChange={setIsProblemDetailsOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Problem Details</DialogTitle>
            <DialogDescription>
              View complete problem description and examples.
            </DialogDescription>
          </DialogHeader>
          {selectedProblem && (
            <ProblemDetails problem={selectedProblem} onStart={() => {
              setIsProblemDetailsOpen(false);
              setIsCodeEditorOpen(true);
            }} />
          )}
        </DialogContent>
      </Dialog>

      {/* Code Editor Dialog */}
      <Dialog open={isCodeEditorOpen} onOpenChange={setIsCodeEditorOpen}>
        <DialogContent className="max-w-6xl">
          <DialogHeader>
            <DialogTitle>Code Editor - {selectedProblem?.title}</DialogTitle>
            <DialogDescription>
              Write and test your solution.
            </DialogDescription>
          </DialogHeader>
          {selectedProblem && (
            <CodeEditor problem={selectedProblem} onClose={() => setIsCodeEditorOpen(false)} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Problem Details Component
const ProblemDetails = ({ problem, onStart }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex gap-2 mb-2">
            {getDifficultyBadge(problem.difficulty)}
            {getStatusBadge(problem.solved)}
            {problem.solved && getScoreBadge(problem.bestScore)}
          </div>
          <h2 className="text-2xl font-bold">{problem.title}</h2>
          <p className="text-muted-foreground">{problem.topic}</p>
        </div>
        <div className="text-right text-sm text-muted-foreground">
          <div>Acceptance: {problem.acceptanceRate}%</div>
          <div>Submissions: {problem.totalSubmissions}</div>
          <div>Time Limit: {problem.timeLimit}ms</div>
          <div>Memory Limit: {problem.memoryLimit}MB</div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Problem Description</h3>
        <p className="text-sm leading-relaxed">{problem.description}</p>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Constraints</h3>
        <pre className="text-sm bg-muted p-3 rounded-lg whitespace-pre-wrap">{problem.constraints}</pre>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Examples</h3>
        <div className="space-y-4">
          {problem.examples.map((example, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <strong>Input:</strong>
                  <pre className="text-sm bg-muted p-2 rounded mt-1">{example.input}</pre>
                </div>
                <div>
                  <strong>Output:</strong>
                  <pre className="text-sm bg-muted p-2 rounded mt-1">{example.output}</pre>
                </div>
              </div>
              {example.explanation && (
                <div className="mt-2">
                  <strong>Explanation:</strong>
                  <p className="text-sm text-muted-foreground mt-1">{example.explanation}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Allowed Languages</h3>
        <div className="flex gap-2">
          {problem.allowedLanguages.map(lang => (
            <Badge key={lang} variant="outline" className="capitalize">
              {lang}
            </Badge>
          ))}
        </div>
      </div>

      <div className="pt-4">
        <Button onClick={onStart} className="w-full">
          Start Solving
        </Button>
      </div>
    </div>
  );
};

// Code Editor Component
const CodeEditor = ({ problem, onClose }) => {
  const [selectedLanguage, setSelectedLanguage] = useState('python');
  const [code, setCode] = useState('');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState([]);

  // Default code templates
  const codeTemplates = {
    python: `def solution(nums, target):
    # Your solution here
    pass

# Test the function
if __name__ == "__main__":
    # Example usage
    nums = [2, 7, 11, 15]
    target = 9
    result = solution(nums, target)
    print(result)`,
    java: `public class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Your solution here
        return new int[]{};
    }
    
    public static void main(String[] args) {
        Solution solution = new Solution();
        int[] nums = {2, 7, 11, 15};
        int target = 9;
        int[] result = solution.twoSum(nums, target);
        System.out.println(Arrays.toString(result));
    }
}`,
    cpp: `#include <iostream>
#include <vector>
using namespace std;

class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        // Your solution here
        return {};
    }
};

int main() {
    Solution solution;
    vector<int> nums = {2, 7, 11, 15};
    int target = 9;
    vector<int> result = solution.twoSum(nums, target);
    
    cout << "[";
    for (int i = 0; i < result.size(); i++) {
        cout << result[i];
        if (i < result.size() - 1) cout << ",";
    }
    cout << "]" << endl;
    
    return 0;
}`,
    javascript: `function twoSum(nums, target) {
    // Your solution here
}

// Test the function
const nums = [2, 7, 11, 15];
const target = 9;
const result = twoSum(nums, target);
console.log(result);`
  };

  useEffect(() => {
    setCode(codeTemplates[selectedLanguage] || '');
  }, [selectedLanguage]);

  const handleRunCode = async () => {
    setIsRunning(true);
    setOutput('Running code...');
    
    try {
      // Simulate code execution
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock output - replace with actual Judge0 API call
      setOutput('Code executed successfully!\nOutput: [0, 1]');
      
      // Mock test results
      setTestResults([
        { testCase: 1, input: '[2,7,11,15]\n9', expected: '[0,1]', actual: '[0,1]', status: 'passed' },
        { testCase: 2, input: '[3,2,4]\n6', expected: '[1,2]', actual: '[1,2]', status: 'passed' },
        { testCase: 3, input: '[3,3]\n6', expected: '[0,1]', actual: '[0,1]', status: 'passed' }
      ]);
      
    } catch (error) {
      setOutput('Error executing code: ' + error.message);
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    setIsRunning(true);
    setOutput('Submitting solution...');
    
    try {
      // Simulate submission
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      setOutput('Solution submitted successfully!\nAll test cases passed!\nScore: 100%');
      
      toast({
        title: "Success!",
        description: "Problem solved successfully!",
      });
      
    } catch (error) {
      setOutput('Error submitting solution: ' + error.message);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue="editor" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="editor">Code Editor</TabsTrigger>
          <TabsTrigger value="output">Output</TabsTrigger>
          <TabsTrigger value="tests">Test Cases</TabsTrigger>
        </TabsList>
        
        <TabsContent value="editor" className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium">Language:</label>
              <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {problem.allowedLanguages.map(lang => (
                    <SelectItem key={lang} value={lang} className="capitalize">
                      {lang}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={handleRunCode} disabled={isRunning}>
                {isRunning ? 'Running...' : 'Run Code'}
              </Button>
              <Button onClick={handleSubmit} disabled={isRunning}>
                {isRunning ? 'Submitting...' : 'Submit'}
              </Button>
            </div>
          </div>
          
          <div className="border rounded-lg">
            <Textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Write your solution here..."
              className="min-h-[400px] font-mono text-sm"
            />
          </div>
        </TabsContent>
        
        <TabsContent value="output" className="space-y-4">
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">Output</h3>
            <pre className="text-sm bg-muted p-3 rounded-lg whitespace-pre-wrap min-h-[200px]">
              {output || 'No output yet. Run your code to see results.'}
            </pre>
          </div>
        </TabsContent>
        
        <TabsContent value="tests" className="space-y-4">
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">Test Cases</h3>
            {testResults.length > 0 ? (
              <div className="space-y-2">
                {testResults.map((result, index) => (
                  <div key={index} className={`p-3 rounded-lg border ${
                    result.status === 'passed' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                  }`}>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Test Case {result.testCase}</span>
                      <Badge variant={result.status === 'passed' ? 'default' : 'destructive'}>
                        {result.status === 'passed' ? 'Passed' : 'Failed'}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      <div>Input: {result.input}</div>
                      <div>Expected: {result.expected}</div>
                      <div>Actual: {result.actual}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">Run your code to see test results.</p>
            )}
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  );
};

export default StudentPracticePage;
