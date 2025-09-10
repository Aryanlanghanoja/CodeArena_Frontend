import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useToast } from '../../hooks/use-toast';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import RichTextEditor from '../ui/rich-text-editor';
import { Search, Plus, X, Calendar, Clock, BookOpen, FileText, CheckCircle } from 'lucide-react';
import assignmentsService from '../../services/assignmentsService';
import questionsService from '../../services/questionsService';

export default function CreateAssignmentModal({ isOpen, onClose, classId, onSuccess }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    due_date: '',
    total_points: ''
  });

  const loadQuestions = useCallback(async () => {
    try {
      setLoading(true);
      const response = await questionsService.getQuestions();
      if (response.success) {
        setQuestions(response.data.data);
      }
    } catch (error) {
      console.error('Error loading questions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load questions. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Load questions when modal opens
  useEffect(() => {
    if (isOpen) {
      loadQuestions();
    }
  }, [isOpen, loadQuestions]);

  // Filter questions based on search using useMemo to prevent infinite loops
  const filteredQuestions = useMemo(() => {
    if (!questions || questions.length === 0) {
      return [];
    }
    
    if (searchQuery.trim()) {
      return questions.filter(q =>
        q.question_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.difficulty.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (q.tags && q.tags.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    } else {
      return questions;
    }
  }, [searchQuery, questions]);

  const handleQuestionToggle = (question) => {
    setSelectedQuestions(prev => {
      const isSelected = prev.some(q => q.question_id === question.question_id);
      if (isSelected) {
        return prev.filter(q => q.question_id !== question.question_id);
      } else {
        return [...prev, question];
      }
    });
  };

  const calculateTotalPoints = () => {
    return selectedQuestions.reduce((total, q) => {
      const points = {
        'Easy': 10,
        'Medium': 20,
        'Hard': 30
      };
      return total + (points[q.difficulty] || 15);
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (selectedQuestions.length === 0) {
      toast({
        title: 'Error',
        description: 'Please select at least one question for the assignment.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      
      const assignmentData = {
        join_code: classId,
        title: formData.title,
        description: formData.description,
        question_ids: selectedQuestions.map(q => q.question_id),
        due_date: formData.due_date || null,
        total_points: formData.total_points || calculateTotalPoints()
      };

      const response = await assignmentsService.createAssignment(classId, assignmentData);
      
      if (response.success) {
        toast({
          title: 'Success',
          description: 'Assignment created successfully!',
        });
        
        // Reset form
        setFormData({
          title: '',
          description: '',
          due_date: '',
          total_points: ''
        });
        setSelectedQuestions([]);
        setSearchQuery('');
        
        onSuccess && onSuccess(response.data.assignment);
        onClose();
      }
    } catch (error) {
      console.error('Error creating assignment:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create assignment. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      'Easy': 'bg-green-100 text-green-800 dark:bg-green-950/20 dark:text-green-400',
      'Medium': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950/20 dark:text-yellow-400',
      'Hard': 'bg-red-100 text-red-800 dark:bg-red-950/20 dark:text-red-400'
    };
    return colors[difficulty] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-background border border-border rounded-xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col animate-in fade-in-0 zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-border bg-muted/30 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">Create New Assignment</h2>
              <p className="text-sm text-muted-foreground">Create assignments using questions from CodeArena</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-muted">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-hidden min-h-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 h-full">
              {/* Left side - Assignment Details */}
              <div className="p-6 border-r border-border overflow-y-auto bg-muted/10">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-sm font-medium text-foreground">
                      Assignment Title *
                    </Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter assignment title"
                      className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm font-medium text-foreground">
                      Description
                    </Label>
                    <RichTextEditor
                      value={formData.description}
                      onChange={(description) => setFormData(prev => ({ ...prev, description }))}
                      placeholder="Enter assignment description... Use Markdown for formatting!"
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="due_date" className="text-sm font-medium text-foreground">
                      Due Date
                    </Label>
                    <Input
                      id="due_date"
                      type="datetime-local"
                      value={formData.due_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
                      min={new Date().toISOString().slice(0, 16)}
                      className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="total_points" className="text-sm font-medium text-foreground">
                      Total Points
                    </Label>
                    <Input
                      id="total_points"
                      type="number"
                      value={formData.total_points || calculateTotalPoints()}
                      onChange={(e) => setFormData(prev => ({ ...prev, total_points: e.target.value }))}
                      placeholder="Auto-calculated based on selected questions"
                      min="0"
                      className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                    />
                    <p className="text-xs text-muted-foreground">
                      Points are automatically calculated based on question difficulty
                    </p>
                  </div>

                  {/* Selected Questions Summary */}
                  {selectedQuestions.length > 0 && (
                    <Card className="border-border bg-muted/20">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                          Selected Questions ({selectedQuestions.length})
                        </CardTitle>
                        <CardDescription className="text-muted-foreground">
                          Total Points: <span className="font-semibold text-foreground">{calculateTotalPoints()}</span>
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-2 max-h-24 overflow-y-auto">
                          {selectedQuestions.map((question) => (
                            <div key={question.question_id} className="flex items-center justify-between p-3 bg-background border border-border rounded-lg hover:bg-muted/50 transition-colors">
                              <div className="flex-1">
                                <p className="text-sm font-medium truncate text-foreground">{question.question_title}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge className={`${getDifficultyColor(question.difficulty)} border`}>
                                    {question.difficulty}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    {question.difficulty === 'Easy' ? 10 : question.difficulty === 'Medium' ? 20 : 30} pts
                                  </span>
                                </div>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleQuestionToggle(question)}
                                className="hover:bg-destructive/10 hover:text-destructive"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>

              {/* Right side - Question Selection */}
              <div className="p-6 overflow-y-auto">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-foreground">Select Questions *</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search questions..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Choose questions from the CodeArena question bank
                    </p>
                  </div>

                  <ScrollArea className="h-96">
                    <div className="space-y-2">
                      {loading ? (
                        <div className="text-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto"></div>
                          <p className="text-sm text-muted-foreground mt-2">Loading questions...</p>
                        </div>
                      ) : filteredQuestions && filteredQuestions.length > 0 ? (
                        filteredQuestions.map((question) => {
                          const isSelected = selectedQuestions.some(q => q.question_id === question.question_id);
                          return (
                            <Card 
                              key={question.question_id} 
                              className={`cursor-pointer transition-all duration-200 border-border ${
                                isSelected ? 'ring-2 ring-primary bg-primary/5 border-primary/20' : 'hover:bg-muted/50 hover:border-border/80'
                              }`}
                              onClick={() => handleQuestionToggle(question)}
                            >
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <h4 className="font-medium text-sm mb-2 text-foreground">{question.question_title}</h4>
                                    <div className="flex items-center gap-2 mb-2">
                                      <Badge className={`${getDifficultyColor(question.difficulty)} border`}>
                                        {question.difficulty}
                                      </Badge>
                                      <span className="text-xs text-muted-foreground">
                                        {question.difficulty === 'Easy' ? 10 : question.difficulty === 'Medium' ? 20 : 30} pts
                                      </span>
                                    </div>
                                    {question.tags && (
                                      <p className="text-xs text-muted-foreground truncate">
                                        Tags: {question.tags}
                                      </p>
                                    )}
                                  </div>
                                  <Checkbox 
                                    checked={isSelected}
                                    onChange={() => handleQuestionToggle(question)}
                                    className="ml-2 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                  />
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })
                      ) : (
                        <div className="text-center py-8">
                          <BookOpen className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">No questions found</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-border bg-muted/30 flex-shrink-0">
            <div className="text-xs text-muted-foreground">
              {selectedQuestions.length > 0 ? (
                <span className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3 text-green-600 dark:text-green-400" />
                  {selectedQuestions.length} question{selectedQuestions.length !== 1 ? 's' : ''} selected • {calculateTotalPoints()} points
                </span>
              ) : (
                <span>Select at least one question to continue</span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Button type="button" variant="outline" onClick={onClose} className="hover:bg-muted">
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={loading || selectedQuestions.length === 0}
                className="bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-200"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2" />
                    Creating...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4 mr-2" />
                    Create Assignment
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
