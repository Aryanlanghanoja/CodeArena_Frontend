import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../hooks/use-toast';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Checkbox } from '../ui/checkbox';
import { ScrollArea } from '../ui/scroll-area';
import { ArrowLeft, Search, Plus, Check, Clock, FileText, BarChart2 } from 'lucide-react';
import RichTextEditor from '../ui/rich-text-editor';
import questionsService from '../../services/questionsService';
import assignmentsService from '../../services/assignmentsService';
import classesService from '../../services/classesService';

export default function CreateAssignmentPage() {
  const { classId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [classData, setClassData] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    due_date: '',
    due_time: '',
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

  const loadClassData = useCallback(async () => {
    try {
      const response = await classesService.getClassDetails(classId);
      if (response.success) {
        setClassData(response.data.class);
      }
    } catch (error) {
      console.error('Error loading class data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load class information.',
        variant: 'destructive',
      });
    }
  }, [classId, toast]);

  // Load data when component mounts
  useEffect(() => {
    if (classId) {
      loadClassData();
      loadQuestions();
    }
  }, [classId, loadClassData, loadQuestions]);

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

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const calculateTotalPoints = () => {
    return selectedQuestions.reduce((total, question) => {
      // Default points per question if not specified
      return total + (question.points || 10);
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter an assignment title.',
        variant: 'destructive',
      });
      return;
    }

    if (selectedQuestions.length === 0) {
      toast({
        title: 'Error',
        description: 'Please select at least one question.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      
      // Combine date and time if both are provided
      let dueDateTime = null;
      if (formData.due_date && formData.due_time) {
        dueDateTime = `${formData.due_date}T${formData.due_time}`;
      } else if (formData.due_date) {
        dueDateTime = `${formData.due_date}T23:59`; // Default to end of day if no time specified
      }

      const assignmentData = {
        title: formData.title,
        description: formData.description,
        question_ids: selectedQuestions.map(q => q.question_id),
        due_date: dueDateTime,
        total_points: calculateTotalPoints()
      };

      const response = await assignmentsService.createAssignment(classId, assignmentData);
      
      if (response.success) {
        toast({
          title: 'Success',
          description: 'Assignment created successfully!',
        });
        
        // Navigate back to class details
        navigate(`/teacher/classes/${classId}`);
      }
    } catch (error) {
      console.error('Error creating assignment:', error);
      toast({
        title: 'Error',
        description: 'Failed to create assignment. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      'Easy': 'bg-green-100 text-green-800',
      'Medium': 'bg-yellow-100 text-yellow-800',
      'Hard': 'bg-red-100 text-red-800'
    };
    return colors[difficulty] || 'bg-gray-100 text-gray-800';
  };

  if (!classData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/teacher/classes/${classId}`)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Class
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Create Assignment</h1>
            <p className="text-muted-foreground">
              Create a new assignment for {classData.class_name}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Assignment Form */}
          <div className="lg:col-span-2">
            <Card className="h-fit">
              <CardHeader>
                <CardTitle>Assignment Details</CardTitle>
                <CardDescription>
                  Fill in the assignment information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <Label htmlFor="title">Assignment Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="Enter assignment title"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <div className="mt-2">
                      <RichTextEditor
                        value={formData.description}
                        onChange={(value) => handleInputChange('description', value)}
                        placeholder="Enter assignment description..."
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="due_date">Due Date</Label>
                      <Input
                        id="due_date"
                        type="date"
                        value={formData.due_date}
                        onChange={(e) => handleInputChange('due_date', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="due_time">Due Time</Label>
                      <Input
                        id="due_time"
                        type="time"
                        value={formData.due_time}
                        onChange={(e) => handleInputChange('due_time', e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Selected Questions</Label>
                    <div className="mt-2 p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <FileText className="h-4 w-4" />
                        <span>{selectedQuestions.length} questions selected</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <BarChart2 className="h-4 w-4" />
                        <span>{calculateTotalPoints()} total points</span>
                      </div>
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Creating...' : 'Create Assignment'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Question Selection */}
          <div className="lg:col-span-3">
            <Card className="h-full flex flex-col">
              <CardHeader>
                <CardTitle>Select Questions</CardTitle>
                <CardDescription>
                  Choose questions from the CodeArena question bank
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                {/* Search */}
                <div className="relative mb-6">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search questions by title, difficulty, or tags..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Questions List */}
                <div className="flex-1 min-h-0">
                  <ScrollArea className="h-full">
                    <div className="space-y-3 pr-4">
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
                            className={`cursor-pointer transition-all hover:shadow-md ${
                              isSelected ? 'ring-2 ring-primary bg-primary/5' : ''
                            }`}
                            onClick={() => handleQuestionToggle(question)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start gap-3">
                                <Checkbox
                                  checked={isSelected}
                                  onChange={() => handleQuestionToggle(question)}
                                  className="mt-1"
                                />
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <h3 className="font-semibold">{question.question_title}</h3>
                                    <Badge 
                                      variant="secondary" 
                                      className={getDifficultyColor(question.difficulty)}
                                    >
                                      {question.difficulty}
                                    </Badge>
                                    {isSelected && (
                                      <Badge variant="default" className="bg-primary">
                                        <Check className="h-3 w-3 mr-1" />
                                        Selected
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-sm text-muted-foreground mb-2">
                                    {question.description}
                                  </p>
                                  {question.tags && (
                                    <div className="flex flex-wrap gap-1">
                                      {question.tags.split(',').map((tag, index) => (
                                        <Badge key={index} variant="outline" className="text-xs">
                                          {tag.trim()}
                                        </Badge>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })
                    ) : (
                      <div className="text-center py-8">
                        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No questions found</h3>
                        <p className="text-muted-foreground">
                          {searchQuery ? 'Try adjusting your search terms.' : 'No questions available in the question bank.'}
                        </p>
                      </div>
                    )}
                    </div>
                  </ScrollArea>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
