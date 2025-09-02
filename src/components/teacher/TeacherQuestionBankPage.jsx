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

const TeacherQuestionBankPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [topicFilter, setTopicFilter] = useState('all');
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  // Mock data - replace with actual API calls
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockQuestions = [
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
              }
            ],
            testCases: [
              { input: '[2,7,11,15]\n9', expectedOutput: '[0,1]', isPublic: true },
              { input: '[3,2,4]\n6', expectedOutput: '[1,2]', isPublic: false },
              { input: '[3,3]\n6', expectedOutput: '[0,1]', isPublic: false }
            ],
            createdDate: '2024-01-15',
            usedInExams: 2,
            status: 'active'
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
              { input: '[1,2,3,4,5]', expectedOutput: '[5,4,3,2,1]', isPublic: true },
              { input: '[1,2]', expectedOutput: '[2,1]', isPublic: false },
              { input: '[]', expectedOutput: '[]', isPublic: false }
            ],
            createdDate: '2024-01-12',
            usedInExams: 1,
            status: 'active'
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
              { input: '[1,null,2,3]', expectedOutput: '[1,3,2]', isPublic: true },
              { input: '[]', expectedOutput: '[]', isPublic: false },
              { input: '[1]', expectedOutput: '[1]', isPublic: false }
            ],
            createdDate: '2024-01-10',
            usedInExams: 0,
            status: 'draft'
          }
        ];
        
        setQuestions(mockQuestions);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch questions",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [toast]);

  const filteredQuestions = questions.filter(question => {
    const matchesSearch = question.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         question.topic.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDifficulty = difficultyFilter === 'all' || question.difficulty === difficultyFilter;
    const matchesTopic = topicFilter === 'all' || question.topic === topicFilter;
    return matchesSearch && matchesDifficulty && matchesTopic;
  });

  const handleCreateQuestion = async (questionData) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newQuestion = {
        id: Date.now(),
        ...questionData,
        createdDate: new Date().toISOString().split('T')[0],
        usedInExams: 0,
        status: 'draft'
      };
      
      setQuestions(prevQuestions => [newQuestion, ...prevQuestions]);
      setIsCreateDialogOpen(false);
      
      toast({
        title: "Success",
        description: "Question created successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create question",
        variant: "destructive"
      });
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    if (!confirm('Are you sure you want to delete this question? This action cannot be undone.')) {
      return;
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setQuestions(prevQuestions => prevQuestions.filter(q => q.id !== questionId));
      
      toast({
        title: "Success",
        description: "Question deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete question",
        variant: "destructive"
      });
    }
  };

  const handleStatusChange = async (questionId, newStatus) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setQuestions(prevQuestions => 
        prevQuestions.map(q => 
          q.id === questionId ? { ...q, status: newStatus } : q
        )
      );
      
      toast({
        title: "Success",
        description: `Question ${newStatus === 'active' ? 'published' : 'saved as draft'} successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update question status",
        variant: "destructive"
      });
    }
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

  const getStatusBadge = (status) => {
    return (
      <Badge variant={status === 'active' ? 'default' : 'secondary'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const stats = {
    total: questions.length,
    active: questions.filter(q => q.status === 'active').length,
    draft: questions.filter(q => q.status === 'draft').length,
    easy: questions.filter(q => q.difficulty === 'Easy').length,
    medium: questions.filter(q => q.difficulty === 'Medium').length,
    hard: questions.filter(q => q.difficulty === 'Hard').length
  };

  const topics = [...new Set(questions.map(q => q.topic))];

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
          <h1 className="text-3xl font-bold mb-2">Question Bank</h1>
          <p className="text-muted-foreground">
            Create and manage coding questions for your exams.
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          Create New Question
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Published</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{stats.active}</div>
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
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Question Management</CardTitle>
          <CardDescription>Search and filter your coding questions</CardDescription>
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
          </div>

          {/* Questions Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Question</TableHead>
                  <TableHead>Difficulty</TableHead>
                  <TableHead>Topic</TableHead>
                  <TableHead>Test Cases</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Used in Exams</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredQuestions.map((question) => (
                  <TableRow key={question.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{question.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {question.description.substring(0, 80)}...
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getDifficultyBadge(question.difficulty)}
                    </TableCell>
                    <TableCell>{question.topic}</TableCell>
                    <TableCell>
                      <div className="text-center">
                        <div className="font-medium">{question.testCases.length}</div>
                        <div className="text-xs text-muted-foreground">
                          {question.testCases.filter(tc => tc.isPublic).length} public
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Select 
                        value={question.status} 
                        onValueChange={(value) => handleStatusChange(question.id, value)}
                      >
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="draft">Draft</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <div className="text-center">
                        <div className="font-medium">{question.usedInExams}</div>
                        <div className="text-xs text-muted-foreground">exams</div>
                      </div>
                    </TableCell>
                    <TableCell>{new Date(question.createdDate).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            ⋮
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => {
                            setSelectedQuestion(question);
                            setIsViewDialogOpen(true);
                          }}>
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigate(`/teacher/questions/${question.id}/edit`)}>
                            Edit Question
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigate(`/teacher/questions/${question.id}/test`)}>
                            Test Question
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteQuestion(question.id)}
                            className="text-red-600"
                          >
                            Delete Question
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredQuestions.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No questions found matching your criteria.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Question Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Create New Question</DialogTitle>
            <DialogDescription>
              Create a new coding question with test cases.
            </DialogDescription>
          </DialogHeader>
          <CreateQuestionForm 
            onSubmit={handleCreateQuestion} 
            onCancel={() => setIsCreateDialogOpen(false)} 
          />
        </DialogContent>
      </Dialog>

      {/* View Question Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Question Details</DialogTitle>
            <DialogDescription>
              View complete question details and test cases.
            </DialogDescription>
          </DialogHeader>
          {selectedQuestion && (
            <QuestionDetails question={selectedQuestion} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Create Question Form Component
const CreateQuestionForm = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    difficulty: 'Easy',
    topic: '',
    description: '',
    constraints: '',
    examples: [{ input: '', output: '', explanation: '' }],
    testCases: [{ input: '', expectedOutput: '', isPublic: true }]
  });

  const addExample = () => {
    setFormData({
      ...formData,
      examples: [...formData.examples, { input: '', output: '', explanation: '' }]
    });
  };

  const addTestCase = () => {
    setFormData({
      ...formData,
      testCases: [...formData.testCases, { input: '', expectedOutput: '', isPublic: false }]
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="examples">Examples</TabsTrigger>
          <TabsTrigger value="testcases">Test Cases</TabsTrigger>
        </TabsList>
        
        <TabsContent value="basic" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Question Title</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Two Sum"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Topic</label>
              <Input
                value={formData.topic}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                placeholder="e.g., Arrays"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium">Difficulty</label>
            <Select value={formData.difficulty} onValueChange={(value) => setFormData({ ...formData, difficulty: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Easy">Easy</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium">Description</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the problem..."
              rows={4}
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">Constraints</label>
            <Textarea
              value={formData.constraints}
              onChange={(e) => setFormData({ ...formData, constraints: e.target.value })}
              placeholder="List the constraints..."
              rows={3}
            />
          </div>
        </TabsContent>

        <TabsContent value="examples" className="space-y-4">
          {formData.examples.map((example, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="text-lg">Example {index + 1}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Input</label>
                  <Textarea
                    value={example.input}
                    onChange={(e) => {
                      const newExamples = [...formData.examples];
                      newExamples[index].input = e.target.value;
                      setFormData({ ...formData, examples: newExamples });
                    }}
                    placeholder="Input example"
                    rows={2}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Output</label>
                  <Textarea
                    value={example.output}
                    onChange={(e) => {
                      const newExamples = [...formData.examples];
                      newExamples[index].output = e.target.value;
                      setFormData({ ...formData, examples: newExamples });
                    }}
                    placeholder="Expected output"
                    rows={2}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Explanation (Optional)</label>
                  <Textarea
                    value={example.explanation}
                    onChange={(e) => {
                      const newExamples = [...formData.examples];
                      newExamples[index].explanation = e.target.value;
                      setFormData({ ...formData, examples: newExamples });
                    }}
                    placeholder="Explain the example"
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
          <Button type="button" onClick={addExample} variant="outline">
            Add Example
          </Button>
        </TabsContent>

        <TabsContent value="testcases" className="space-y-4">
          {formData.testCases.map((testCase, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="text-lg">Test Case {index + 1}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Input</label>
                  <Textarea
                    value={testCase.input}
                    onChange={(e) => {
                      const newTestCases = [...formData.testCases];
                      newTestCases[index].input = e.target.value;
                      setFormData({ ...formData, testCases: newTestCases });
                    }}
                    placeholder="Test case input"
                    rows={2}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Expected Output</label>
                  <Textarea
                    value={testCase.expectedOutput}
                    onChange={(e) => {
                      const newTestCases = [...formData.testCases];
                      newTestCases[index].expectedOutput = e.target.value;
                      setFormData({ ...formData, testCases: newTestCases });
                    }}
                    placeholder="Expected output"
                    rows={2}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={testCase.isPublic}
                    onChange={(e) => {
                      const newTestCases = [...formData.testCases];
                      newTestCases[index].isPublic = e.target.checked;
                      setFormData({ ...formData, testCases: newTestCases });
                    }}
                  />
                  <label className="text-sm">Public (visible to students)</label>
                </div>
              </CardContent>
            </Card>
          ))}
          <Button type="button" onClick={addTestCase} variant="outline">
            Add Test Case
          </Button>
        </TabsContent>
      </Tabs>

      <div className="flex gap-4 pt-4">
        <Button type="submit" className="flex-1">
          Create Question
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
};

// Question Details Component
const QuestionDetails = ({ question }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-muted-foreground">Title</label>
          <p className="text-lg font-medium">{question.title}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-muted-foreground">Topic</label>
          <p className="text-lg font-medium">{question.topic}</p>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-muted-foreground">Description</label>
        <p className="mt-1">{question.description}</p>
      </div>

      <div>
        <label className="text-sm font-medium text-muted-foreground">Constraints</label>
        <pre className="mt-1 text-sm bg-muted p-3 rounded-lg whitespace-pre-wrap">{question.constraints}</pre>
      </div>

      <div>
        <label className="text-sm font-medium text-muted-foreground">Examples</label>
        <div className="mt-2 space-y-4">
          {question.examples.map((example, index) => (
            <Card key={index}>
              <CardContent className="pt-4">
                <div className="space-y-2">
                  <div>
                    <strong>Input:</strong> {example.input}
                  </div>
                  <div>
                    <strong>Output:</strong> {example.output}
                  </div>
                  {example.explanation && (
                    <div>
                      <strong>Explanation:</strong> {example.explanation}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-muted-foreground">Test Cases ({question.testCases.length})</label>
        <div className="mt-2 space-y-2">
          {question.testCases.map((testCase, index) => (
            <div key={index} className="flex items-center justify-between p-2 border rounded">
              <span>Test Case {index + 1}</span>
              <Badge variant={testCase.isPublic ? 'default' : 'secondary'}>
                {testCase.isPublic ? 'Public' : 'Hidden'}
              </Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TeacherQuestionBankPage;
