import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useToast } from '../../hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import questionsService from '../../services/questionsService';
import { Trash2, Eye, Search, Filter, Plus, Edit, Copy, PlusCircle, Settings } from 'lucide-react';

const TeacherQuestionBank = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('all');

  // Fetch questions
  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async (filters = {}) => {
    try {
      setLoading(true);
      const result = await questionsService.getTeacherDashboardQuestions();
      if (result.success) {
        setQuestions(result.data.questions);
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch questions",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
      toast({
        title: "Error",
        description: "Failed to fetch questions",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    const filters = {};
    if (searchTerm) filters.search = searchTerm;
    if (difficultyFilter && difficultyFilter !== 'all') filters.difficulty = difficultyFilter;
    
    await fetchQuestions(filters);
  };

  const handleDeleteQuestion = async (questionId) => {
    if (!window.confirm('Are you sure you want to delete this question?')) {
      return;
    }

    try {
      const result = await questionsService.deleteQuestion(questionId);
      if (result.success) {
        toast({
          title: "Success",
          description: "Question deleted successfully"
        });
        fetchQuestions();
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to delete question",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error deleting question:', error);
      toast({
        title: "Error",
        description: "Failed to delete question",
        variant: "destructive"
      });
    }
  };

  const handleDuplicateQuestion = async (question) => {
    try {
      const duplicateData = {
        question_title: `${question.question_title} (Copy)`,
        description: question.description,
        markdown_content: question.markdown_content,
        markdown_path: question.markdown_path,
        difficulty: question.difficulty,
        tags: question.tags,
        constraints: question.constraints,
        testcases: question.testcases?.map(tc => ({
          stdin: tc.stdin,
          expected_output: tc.expected_output,
          weight: tc.weight
        })) || []
      };

      const result = await questionsService.createQuestion(duplicateData);
      if (result.success) {
        toast({
          title: "Success",
          description: "Question duplicated successfully"
        });
        fetchQuestions();
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to duplicate question",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error duplicating question:', error);
      toast({
        title: "Error",
        description: "Failed to duplicate question",
        variant: "destructive"
      });
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTotalQuestions = () => questions.length;
  const getQuestionsByDifficulty = (difficulty) => 
    questions.filter(q => q.difficulty === difficulty).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">My Questions</h2>
          <p className="text-muted-foreground">
            Create and manage your question bank
          </p>
        </div>
        <Button onClick={() => navigate('/teacher/questions/create')}>
          <Plus className="mr-2 h-4 w-4" />
          Create Question
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Questions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{getTotalQuestions()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Easy Questions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {getQuestionsByDifficulty('Easy')}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Medium Questions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">
              {getQuestionsByDifficulty('Medium')}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Hard Questions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {getQuestionsByDifficulty('Hard')}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filter Questions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search your questions by title, description, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Difficulties</SelectItem>
                <SelectItem value="Easy">Easy</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Hard">Hard</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleSearch}>
              <Search className="mr-2 h-4 w-4" />
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Questions List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Questions</CardTitle>
          <CardDescription>
            Manage and organize your question bank
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : questions.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-muted-foreground mb-4">
                <PlusCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No questions created yet</p>
                <p className="text-sm">Create your first question to get started</p>
              </div>
              <Button onClick={() => navigate('/teacher/questions/create')}>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Question
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {questions.map((question) => (
                <div
                  key={question.question_id}
                  className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{question.question_title}</h3>
                        <Badge className={getDifficultyColor(question.difficulty)}>
                          {question.difficulty}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground mb-2 line-clamp-2">
                        {question.description}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Created: {formatDate(question.created_at)}</span>
                        <span>Testcases: {question.testcases?.length || 0}</span>
                        {question.tags && (
                          <span>Tags: {question.tags}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/teacher/questions/${question.question_id}`)}
                        title="View Question"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/teacher/questions/${question.question_id}/edit`)}
                        title="Edit Question"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/teacher/questions/${question.question_id}/testcases`)}
                        title="Manage Testcases"
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDuplicateQuestion(question)}
                        title="Duplicate Question"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteQuestion(question.question_id)}
                        className="text-red-600 hover:text-red-700"
                        title="Delete Question"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common tasks for managing your questions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              className="h-20 flex flex-col gap-2"
              onClick={() => navigate('/teacher/questions/create')}
            >
              <Plus className="h-6 w-6" />
              <span>Create New Question</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col gap-2"
              onClick={() => navigate('/teacher/exams/create')}
            >
              <PlusCircle className="h-6 w-6" />
              <span>Create Exam</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col gap-2"
              onClick={() => navigate('/teacher/classes')}
            >
              <Eye className="h-6 w-6" />
              <span>View Classes</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherQuestionBank;
