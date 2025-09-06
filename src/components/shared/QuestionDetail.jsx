import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useToast } from '../../hooks/use-toast';
import questionsService from '../../services/questionsService';
import MarkdownRenderer from '../ui/MarkdownRenderer';
import { Play, Clock, Target, User, Calendar, Tag, Settings } from 'lucide-react';

const QuestionDetail = ({ userRole = 'student' }) => {
  const { questionId } = useParams();
  const { toast } = useToast();
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTestcases, setShowTestcases] = useState(false);

  useEffect(() => {
    if (questionId) {
      fetchQuestion();
    }
  }, [questionId]);

  const fetchQuestion = async () => {
    try {
      setLoading(true);
      const result = await questionsService.getQuestion(questionId);
      if (result.success) {
        setQuestion(result.data);
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
      setLoading(false);
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
      month: 'long',
      day: 'numeric'
    });
  };

  const handleStartSolving = () => {
    // Navigate to code editor or open code editor modal
    window.location.href = `/student/practice/${questionId}/solve`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Question not found
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Question Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <CardTitle className="text-2xl">{question.question_title}</CardTitle>
                <Badge className={getDifficultyColor(question.difficulty)}>
                  {question.difficulty}
                </Badge>
              </div>
              <CardDescription className="text-base">
                {question.description}
              </CardDescription>
            </div>
            {userRole === 'student' && (
              <Button onClick={handleStartSolving} size="lg">
                <Play className="mr-2 h-4 w-4" />
                Start Solving
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Created by:</span>
              <span className="font-medium">{question.creator?.name || 'Unknown'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Created:</span>
              <span className="font-medium">{formatDate(question.created_at)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Test cases:</span>
              <span className="font-medium">{question.testcases?.length || 0}</span>
            </div>
            {question.tags && (
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Tags:</span>
                <span className="font-medium">{question.tags}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Problem Statement */}
      <Card>
        <CardHeader>
          <CardTitle>Problem Statement</CardTitle>
        </CardHeader>
        <CardContent>
          {question.markdown_content ? (
            <MarkdownRenderer content={question.markdown_content} />
          ) : (
            <div className="text-muted-foreground italic">
              No detailed problem statement available. Please refer to the description above.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Constraints */}
      {question.constraints && (
        <Card>
          <CardHeader>
            <CardTitle>Constraints</CardTitle>
          </CardHeader>
          <CardContent>
            <MarkdownRenderer content={question.constraints} />
          </CardContent>
        </Card>
      )}

      {/* Test Cases */}
      {question.testcases && question.testcases.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Test Cases</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowTestcases(!showTestcases)}
              >
                {showTestcases ? 'Hide' : 'Show'} Test Cases
              </Button>
            </div>
            <CardDescription>
              {question.testcases.length} test case{question.testcases.length !== 1 ? 's' : ''} available
            </CardDescription>
          </CardHeader>
          {showTestcases && (
            <CardContent>
              <div className="space-y-4">
                {question.testcases.map((testcase, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-semibold">Test Case {index + 1}</h4>
                      <Badge variant="outline">
                        Weight: {testcase.weight}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="font-medium mb-2 text-sm text-muted-foreground">Input:</h5>
                        <pre className="bg-muted p-3 rounded-md text-sm overflow-x-auto">
                          {testcase.stdin}
                        </pre>
                      </div>
                      <div>
                        <h5 className="font-medium mb-2 text-sm text-muted-foreground">Expected Output:</h5>
                        <pre className="bg-muted p-3 rounded-md text-sm overflow-x-auto">
                          {testcase.expected_output}
                        </pre>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4">
        {userRole === 'student' && (
          <Button onClick={handleStartSolving} size="lg">
            <Play className="mr-2 h-4 w-4" />
            Start Solving
          </Button>
        )}
        {userRole === 'teacher' && (
          <>
            <Button 
              variant="outline" 
              onClick={() => window.location.href = `/teacher/questions/${questionId}/edit`}
            >
              Edit Question
            </Button>
            <Button 
              variant="outline"
              onClick={() => window.location.href = `/teacher/questions/${questionId}/testcases`}
            >
              <Settings className="mr-2 h-4 w-4" />
              Manage Testcases
            </Button>
            <Button 
              variant="outline"
              onClick={() => window.location.href = `/teacher/exams/create?question=${questionId}`}
            >
              Add to Exam
            </Button>
          </>
        )}
        <Button 
          variant="outline" 
          onClick={() => window.history.back()}
        >
          Back
        </Button>
      </div>
    </div>
  );
};

export default QuestionDetail;
