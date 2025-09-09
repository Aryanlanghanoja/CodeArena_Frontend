import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { useToast } from '../../hooks/use-toast';
import learningPathService from '../../services/learningPathService';
import { Skeleton } from '../ui/skeleton';
import { ArrowLeft, GripVertical, Save, RotateCcw } from 'lucide-react';

const ReorderQuestions = () => {
  const { pathId, moduleId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (pathId && moduleId) {
      fetchQuestions();
    }
  }, [pathId, moduleId]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const response = await learningPathService.getModule(pathId, moduleId);
      const moduleData = response.data;
      const questionsData = moduleData?.questions || [];
      
      // Sort questions by order_index
      const sortedQuestions = questionsData.sort((a, b) => a.order_index - b.order_index);
      setQuestions(sortedQuestions);
    } catch (error) {
      console.error('Failed to fetch questions:', error);
      toast({
        title: "Error",
        description: "Failed to load questions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const moveQuestion = (fromIndex, toIndex) => {
    if (toIndex < 0 || toIndex >= questions.length) return;
    
    const newQuestions = [...questions];
    const [movedQuestion] = newQuestions.splice(fromIndex, 1);
    newQuestions.splice(toIndex, 0, movedQuestion);
    
    // Update order_index for all questions
    const updatedQuestions = newQuestions.map((question, index) => ({
      ...question,
      order_index: index
    }));
    
    setQuestions(updatedQuestions);
    setHasChanges(true);
  };

  const moveUp = (index) => {
    if (index > 0) {
      moveQuestion(index, index - 1);
    }
  };

  const moveDown = (index) => {
    if (index < questions.length - 1) {
      moveQuestion(index, index + 1);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      const questionOrders = questions.map((question, index) => ({
        question_id: question.question_id,
        order_index: index
      }));
      
      await learningPathService.reorderQuestions(pathId, moduleId, questionOrders);
      
      toast({
        title: "Success!",
        description: "Questions reordered successfully.",
      });
      
      setHasChanges(false);
      
    } catch (error) {
      console.error('Failed to reorder questions:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to reorder questions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    fetchQuestions();
    setHasChanges(false);
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => navigate(`/learning-paths/${pathId}/modules/${moduleId}`)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Reorder Questions</h1>
            <p className="text-muted-foreground">Loading questions...</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          size="icon"
          onClick={() => navigate(`/learning-paths/${pathId}/modules/${moduleId}`)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Reorder Questions</h1>
          <p className="text-muted-foreground">
            Drag and drop or use the arrow buttons to reorder questions in this module
          </p>
        </div>
      </div>

      {/* Questions List */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Questions in Module</CardTitle>
              <CardDescription>
                {questions.length} question(s) in this module
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleReset}
                disabled={!hasChanges || saving}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
              <Button
                onClick={handleSave}
                disabled={!hasChanges || saving}
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Order
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {questions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No questions in this module yet.</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => navigate(`/learning-paths/${pathId}/modules/${moduleId}/add-questions`)}
              >
                Add Questions
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {questions.map((question, index) => (
                <Card key={question.question_id} className="border-l-4 border-l-primary">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      {/* Drag Handle */}
                      <div className="flex flex-col gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => moveUp(index)}
                          disabled={index === 0}
                          className="h-6 w-6 p-0"
                        >
                          ↑
                        </Button>
                        <div className="flex items-center justify-center h-8 w-8 bg-gray-100 rounded cursor-move">
                          <GripVertical className="h-4 w-4 text-gray-500" />
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => moveDown(index)}
                          disabled={index === questions.length - 1}
                          className="h-6 w-6 p-0"
                        >
                          ↓
                        </Button>
                      </div>

                      {/* Question Info */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-sm font-medium text-gray-500">
                                #{index + 1}
                              </span>
                              <h3 className="font-semibold text-lg">{question.question_title}</h3>
                              {getDifficultyBadge(question.difficulty)}
                            </div>
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {question.description}
                            </p>
                            {question.tags && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {question.tags.split(',').slice(0, 3).map((tag, tagIndex) => (
                                  <Badge key={tagIndex} variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                    {tag.trim()}
                                  </Badge>
                                ))}
                                {question.tags.split(',').length > 3 && (
                                  <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                    +{question.tags.split(',').length - 3} more
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ReorderQuestions;
