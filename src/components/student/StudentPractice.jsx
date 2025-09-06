import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useToast } from '../../hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import questionsService from '../../services/questionsService';
import { Play, Search, Filter, Clock, Target, Trophy } from 'lucide-react';

const StudentPractice = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [showCodeEditor, setShowCodeEditor] = useState(false);

  // Fetch questions
  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async (filters = {}) => {
    try {
      setLoading(true);
      const result = await questionsService.getStudentPracticeQuestions(filters);
      if (result.success) {
        setQuestions(result.data.questions);
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch practice questions",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
      toast({
        title: "Error",
        description: "Failed to fetch practice questions",
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

  const handleStartQuestion = (question) => {
    setSelectedQuestion(question);
    setShowCodeEditor(true);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyIcon = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return '🟢';
      case 'Medium': return '🟡';
      case 'Hard': return '🔴';
      default: return '⚪';
    }
  };

  const getTotalQuestions = () => questions.length;
  const getQuestionsByDifficulty = (difficulty) => 
    questions.filter(q => q.difficulty === difficulty).length;

  // Practice stats based on real data
  const practiceStats = {
    totalSolved: 0, // TODO: Implement from submissions API
    currentStreak: 0, // TODO: Implement from submissions API
    averageTime: 0, // TODO: Implement from submissions API
    accuracy: 0 // TODO: Implement from submissions API
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Practice Problems</h2>
          <p className="text-muted-foreground">
            Sharpen your coding skills with practice questions
          </p>
        </div>
      </div>

      {/* Practice Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Problems Solved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{practiceStats.totalSolved}</div>
            <div className="text-sm text-muted-foreground mt-1">
              Total solved
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Current Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{practiceStats.currentStreak}</div>
            <div className="text-sm text-muted-foreground mt-1">
              Days in a row
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{practiceStats.averageTime}m</div>
            <div className="text-sm text-muted-foreground mt-1">
              Per problem
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Accuracy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{practiceStats.accuracy}%</div>
            <div className="text-sm text-muted-foreground mt-1">
              Success rate
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Question Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Available Questions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{getTotalQuestions()}</div>
            <div className="text-sm text-muted-foreground mt-1">
              Total problems
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Easy Problems
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {getQuestionsByDifficulty('Easy')}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              Beginner level
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Medium Problems
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">
              {getQuestionsByDifficulty('Medium')}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              Intermediate level
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Find Practice Problems</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search problems by title, description, or tags..."
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
          <CardTitle>Practice Problems</CardTitle>
          <CardDescription>
            Choose a problem to start practicing your coding skills
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : questions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No practice problems available
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
                        <span className="text-lg">{getDifficultyIcon(question.difficulty)}</span>
                        <h3 className="font-semibold text-lg">{question.question_title}</h3>
                        <Badge className={getDifficultyColor(question.difficulty)}>
                          {question.difficulty}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground mb-3 line-clamp-2">
                        {question.description}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Target className="h-4 w-4" />
                          {question.testcases?.length || 0} test cases
                        </span>
                        {question.tags && (
                          <span>Tags: {question.tags}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/student/practice/${question.question_id}`)}
                      >
                        <Play className="mr-2 h-4 w-4" />
                        Start
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Practice Tips</CardTitle>
          <CardDescription>
            Make the most of your practice sessions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <Trophy className="h-4 w-4 text-yellow-500" />
                Start with Easy Problems
              </h4>
              <p className="text-sm text-muted-foreground">
                Build confidence by solving easier problems first before tackling harder ones.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-500" />
                Practice Regularly
              </h4>
              <p className="text-sm text-muted-foreground">
                Consistent practice is key to improving your coding skills and problem-solving abilities.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <Target className="h-4 w-4 text-green-500" />
                Read Carefully
              </h4>
              <p className="text-sm text-muted-foreground">
                Take time to understand the problem requirements and constraints before coding.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <Filter className="h-4 w-4 text-purple-500" />
                Use Filters
              </h4>
              <p className="text-sm text-muted-foreground">
                Filter problems by difficulty and tags to focus on specific topics or skill levels.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentPractice;
