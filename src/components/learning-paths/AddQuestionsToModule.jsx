import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import { useToast } from '../../hooks/use-toast';
import learningPathService from '../../services/learningPathService';
import questionsService from '../../services/questionsService';
import { Skeleton } from '../ui/skeleton';
import { ArrowLeft, Plus, Search, Check, Filter, Trash2 } from 'lucide-react';

const AddQuestionsToModule = () => {
  console.log('AddQuestionsToModule component rendered');
  const { pathId, moduleId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  console.log('AddQuestionsToModule - pathId:', pathId, 'moduleId:', moduleId);
  console.log('AddQuestionsToModule - user:', user);
  
  const [questions, setQuestions] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [existingQuestions, setExistingQuestions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [questionToRemove, setQuestionToRemove] = useState(null);
  const [filters, setFilters] = useState({
    difficulty: '',
    tags: '',
    company_tags: ''
  });
  const [availableTags, setAvailableTags] = useState([]);
  const [availableCompanyTags, setAvailableCompanyTags] = useState([]);
  const [availableDifficulties, setAvailableDifficulties] = useState([]);

  useEffect(() => {
    console.log('AddQuestionsToModule: useEffect called on mount');
    fetchQuestions();
    fetchAvailableOptions();
    fetchExistingQuestions();
  }, []);

  useEffect(() => {
    console.log('AddQuestionsToModule: useEffect called for filters/searchTerm change');
    fetchQuestions();
  }, [filters, searchTerm]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      
      const params = {
        is_visible: true, // Only show visible questions
        ...filters
      };
      
      if (searchTerm) {
        params.search = searchTerm;
      }
      
      // Remove empty string filters to avoid backend issues
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === null || params[key] === undefined) {
          delete params[key];
        }
      });
      
      console.log('AddQuestionsToModule: Original filters:', filters);
      console.log('AddQuestionsToModule: Final params after cleanup:', params);
      const response = await questionsService.getQuestions(params);
      console.log('AddQuestionsToModule: API response:', response);
      console.log('AddQuestionsToModule: response.data:', response.data);
      console.log('AddQuestionsToModule: response.data.data:', response.data?.data);
      console.log('AddQuestionsToModule: response.data.data.data:', response.data?.data?.data);
      
      // Handle paginated response structure
      // The API returns: { success: true, data: { current_page: 1, data: [...] } }
      // questionsService.getQuestions returns response.data, so we need to access data.data
      const questionsData = response.data?.data || response.data || [];
      console.log('AddQuestionsToModule: Questions data:', questionsData);
      const finalQuestions = Array.isArray(questionsData) ? questionsData : [];
      console.log('AddQuestionsToModule: Setting questions to:', finalQuestions);
      setQuestions(finalQuestions);
    } catch (error) {
      console.error('AddQuestionsToModule: Failed to fetch questions:', error);
      toast({
        title: "Error",
        description: "Failed to load questions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchExistingQuestions = async () => {
    try {
      const moduleResponse = await learningPathService.getModule(pathId, moduleId);
      const existingQuestions = moduleResponse.data?.questions || [];
      setExistingQuestions(existingQuestions);
    } catch (error) {
      console.error('Failed to fetch existing questions:', error);
    }
  };

  const fetchAvailableOptions = async () => {
    try {
      const [tagsData, difficulties] = await Promise.all([
        questionsService.getAllTags(),
        questionsService.getAllDifficulties()
      ]);
      
      setAvailableTags(tagsData.tags.filter(tag => tag && tag.trim() !== ''));
      setAvailableCompanyTags(tagsData.companyTags.filter(tag => tag && tag.trim() !== ''));
      setAvailableDifficulties(difficulties.filter(difficulty => difficulty && difficulty.trim() !== ''));
    } catch (error) {
      console.error('Failed to fetch available options:', error);
    }
  };

  const handleQuestionSelect = (questionId) => {
    // Check if question already exists in module
    const alreadyExists = existingQuestions.some(q => q.question_id === questionId);
    if (alreadyExists) {
      toast({
        title: "Question Already in Module",
        description: "This question is already added to the module.",
        variant: "destructive",
      });
      return;
    }

    setSelectedQuestions(prev => {
      if (prev.includes(questionId)) {
        return prev.filter(id => id !== questionId);
      } else {
        return [...prev, questionId];
      }
    });
  };

  const handleAddQuestions = async () => {
    if (selectedQuestions.length === 0) {
      toast({
        title: "No Questions Selected",
        description: "Please select at least one question to add to the module.",
        variant: "destructive",
      });
      return;
    }

    try {
      setAdding(true);
      
      // Add each selected question to the module
      for (const questionId of selectedQuestions) {
        await learningPathService.addQuestionToModule(pathId, moduleId, questionId);
      }
      
      toast({
        title: "Success!",
        description: `${selectedQuestions.length} question(s) added to the module successfully.`,
      });
      
      // Refresh existing questions and clear selection
      await fetchExistingQuestions();
      setSelectedQuestions([]);
    } catch (error) {
      console.error('Failed to add questions:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to add questions to module. Please try again.",
        variant: "destructive",
      });
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveQuestion = (questionId, questionTitle) => {
    setQuestionToRemove({ id: questionId, title: questionTitle });
  };

  const confirmRemoveQuestion = async () => {
    if (!questionToRemove) return;

    try {
      setRemoving(true);
      
      await learningPathService.removeQuestionFromModule(pathId, moduleId, questionToRemove.id);
      
      toast({
        title: "Question Removed",
        description: `"${questionToRemove.title}" has been removed from the module.`,
      });
      
      // Refresh existing questions
      await fetchExistingQuestions();
      
    } catch (error) {
      console.error('Failed to remove question from module:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to remove question from module. Please try again.",
        variant: "destructive",
      });
    } finally {
      setRemoving(false);
      setQuestionToRemove(null);
    }
  };

  const cancelRemoveQuestion = () => {
    setQuestionToRemove(null);
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value === 'all' ? '' : value
    }));
  };

  const clearFilters = () => {
    setFilters({
      difficulty: '',
      tags: '',
      company_tags: ''
    });
    setSearchTerm('');
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
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
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
          <h1 className="text-3xl font-bold">Add Questions to Module</h1>
          <p className="text-muted-foreground">
            Select questions from the question bank to add to this module
          </p>
        </div>
      </div>

      {/* Existing Questions in Module */}
      {existingQuestions.length > 0 && (
        <Card className="border-green-200 bg-green-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <Check className="h-5 w-5" />
              Questions Already in Module
            </CardTitle>
            <CardDescription className="text-green-700">
              {existingQuestions.length} question(s) are already added to this module
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {existingQuestions.map((question) => (
                <Card key={question.question_id} className="border-green-200 bg-white shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-base font-semibold text-gray-900 line-clamp-2">
                          {question.question_title}
                        </CardTitle>
                        <CardDescription className="mt-1 text-sm text-gray-600 line-clamp-2">
                          {question.description}
                        </CardDescription>
                      </div>
                      <div className="ml-2 flex flex-col gap-1">
                        <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs font-medium">
                          In Module
                        </Badge>
                        {getDifficultyBadge(question.difficulty)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      {question.tags && (
                        <div>
                          <Label className="text-xs font-medium text-gray-500">Tags:</Label>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {question.tags.split(',').slice(0, 3).map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                {tag.trim()}
                              </Badge>
                            ))}
                            {question.tags.split(',').length > 3 && (
                              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                +{question.tags.split(',').length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {question.company_tags && (
                        <div>
                          <Label className="text-xs font-medium text-gray-500">Company Tags:</Label>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {question.company_tags.split(',').slice(0, 2).map((tag, index) => (
                              <Badge key={index} variant="secondary" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                                {tag.trim()}
                              </Badge>
                            ))}
                            {question.company_tags.split(',').length > 2 && (
                              <Badge variant="secondary" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                                +{question.company_tags.split(',').length - 2} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Remove Button */}
                    <div className="pt-3 border-t border-green-200 flex justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleRemoveQuestion(question.question_id, question.question_title)}
                        disabled={removing}
                        title="Remove from Module"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Selection Summary */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Question Bank</CardTitle>
              <CardDescription>
                {selectedQuestions.length > 0 
                  ? `${selectedQuestions.length} question(s) selected`
                  : 'Select questions to add to the module'
                }
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {selectedQuestions.length > 0 && (
                <Button 
                  onClick={handleAddQuestions}
                  disabled={adding}
                >
                  {adding ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Add {selectedQuestions.length} Question(s)
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search questions by title, description, tags, or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="difficulty-filter">Difficulty</Label>
                <Select value={filters.difficulty || 'all'} onValueChange={(value) => handleFilterChange('difficulty', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All difficulties" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All difficulties</SelectItem>
                    {availableDifficulties.filter(difficulty => difficulty && difficulty.trim() !== '').map(difficulty => (
                      <SelectItem key={difficulty} value={difficulty}>{difficulty}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="tags-filter">Tags</Label>
                <Select value={filters.tags || 'all'} onValueChange={(value) => handleFilterChange('tags', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All tags" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All tags</SelectItem>
                    {availableTags.filter(tag => tag && tag.trim() !== '').map(tag => (
                      <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="company-tags-filter">Company Tags</Label>
                <Select value={filters.company_tags || 'all'} onValueChange={(value) => handleFilterChange('company_tags', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All companies" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All companies</SelectItem>
                    {availableCompanyTags.filter(tag => tag && tag.trim() !== '').map(tag => (
                      <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Clear Filters */}
            {(filters.difficulty || filters.tags || filters.company_tags || searchTerm) && (
              <div className="flex justify-end">
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  <Filter className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Questions Grid */}
      {console.log('AddQuestionsToModule: Rendering questions grid with questions:', questions)}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {questions.map((question) => {
          const isSelected = selectedQuestions.includes(question.question_id);
          const alreadyInModule = existingQuestions.some(q => q.question_id === question.question_id);
          
          return (
            <Card 
              key={question.question_id} 
              className={`transition-all hover:shadow-lg ${
                isSelected ? 'ring-2 ring-primary bg-primary/5 cursor-pointer' : 
                alreadyInModule ? 'ring-2 ring-green-300 bg-green-50/80 cursor-not-allowed' : 'cursor-pointer'
              }`}
              onClick={() => !alreadyInModule && handleQuestionSelect(question.question_id)}
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{question.question_title}</CardTitle>
                    <CardDescription className="mt-2">
                      {question.description}
                    </CardDescription>
                  </div>
                  <div className="ml-2 flex flex-col gap-1">
                    {alreadyInModule && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs font-medium">
                        <Check className="h-3 w-3 mr-1" />
                        In Module
                      </Badge>
                    )}
                    {isSelected && !alreadyInModule && (
                      <div className="flex items-center gap-1">
                        <Check className="h-4 w-4 text-primary" />
                        <span className="text-xs text-primary font-medium">Selected</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    {getDifficultyBadge(question.difficulty)}
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Tags:</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {question.tags && question.tags.split(',').map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                          {tag.trim()}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  {question.company_tags && (
                    <div>
                      <Label className="text-sm font-medium">Company Tags:</Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {question.company_tags.split(',').map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                            {tag.trim()}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="pt-2">
                    <Button 
                      variant={
                        alreadyInModule ? "secondary" : 
                        isSelected ? "default" : "outline"
                      }
                      size="sm"
                      className={`w-full ${
                        alreadyInModule ? 'cursor-not-allowed bg-green-100 text-green-800 hover:bg-green-100' : ''
                      }`}
                      disabled={alreadyInModule}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!alreadyInModule) {
                          handleQuestionSelect(question.question_id);
                        }
                      }}
                    >
                      {alreadyInModule ? (
                        <>
                          <Check className="h-4 w-4 mr-2" />
                          Already Added
                        </>
                      ) : isSelected ? (
                        <>
                          <Check className="h-4 w-4 mr-2" />
                          Selected
                        </>
                      ) : (
                        'Select'
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {questions.length === 0 && !loading && (
        <div className="text-center py-8 text-muted-foreground">
          <p>No questions found matching your search criteria.</p>
          <p className="text-sm mt-2">Try adjusting your filters or search terms.</p>
        </div>
      )}

      {/* Confirmation Dialog */}
      <AlertDialog open={!!questionToRemove} onOpenChange={() => setQuestionToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Question</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove "{questionToRemove?.title}" from this module? 
              This action cannot be undone and will remove any student progress for this question.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelRemoveQuestion} disabled={removing}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRemoveQuestion}
              disabled={removing}
              className="bg-red-600 hover:bg-red-700"
            >
              {removing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Removing...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remove
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AddQuestionsToModule;
