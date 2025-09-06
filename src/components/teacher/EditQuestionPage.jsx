import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { useToast } from '../../hooks/use-toast';
import questionsService from '../../services/questionsService';
import { Save, ArrowLeft, Plus, Trash2, Eye, EyeOff } from 'lucide-react';

const EditQuestionPage = () => {
  const { questionId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    question_title: '',
    description: '',
    difficulty: 'Easy',
    is_visible: true,
    tags: '',
    constraints: '',
    testcases: []
  });

  useEffect(() => {
    fetchQuestion();
  }, [questionId]);

  const fetchQuestion = async () => {
    try {
      setLoading(true);
      const result = await questionsService.getQuestion(questionId);
      
      if (result.success) {
        const questionData = result.data;
        setQuestion(questionData);
        setFormData({
          question_title: questionData.question_title || '',
          description: questionData.description || '',
          difficulty: questionData.difficulty || 'Easy',
          is_visible: questionData.is_visible ?? true,
          tags: questionData.tags || '',
          constraints: questionData.constraints || '',
          testcases: questionData.testcases || []
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to load question details",
          variant: "destructive"
        });
        navigate('/teacher/questions');
      }
    } catch (error) {
      console.error('Error fetching question:', error);
      toast({
        title: "Error",
        description: "Failed to load question details",
        variant: "destructive"
      });
      navigate('/teacher/questions');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addNewTestcase = () => {
    setFormData(prev => ({
      ...prev,
      testcases: [
        ...prev.testcases,
        {
          stdin: '',
          expected_output: '',
          explanation: '',
          weight: 1.0,
          is_visible: true
        }
      ]
    }));
  };

  const updateTestcase = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      testcases: prev.testcases.map((tc, i) => 
        i === index ? { ...tc, [field]: value } : tc
      )
    }));
  };

  const removeTestcase = (index) => {
    setFormData(prev => ({
      ...prev,
      testcases: prev.testcases.filter((_, i) => i !== index)
    }));
  };

  const toggleTestcaseVisibility = (index) => {
    setFormData(prev => ({
      ...prev,
      testcases: prev.testcases.map((tc, i) => 
        i === index ? { ...tc, is_visible: !tc.is_visible } : tc
      )
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.testcases.length === 0) {
      toast({
        title: "Validation Error",
        description: "At least one test case is required",
        variant: "destructive"
      });
      return;
    }

    try {
      setSaving(true);
      const result = await questionsService.updateQuestion(questionId, formData);
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Question updated successfully",
        });
        navigate('/teacher/questions');
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to update question",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error updating question:', error);
      toast({
        title: "Error",
        description: "Failed to update question",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Question not found</h3>
          <p className="text-muted-foreground mb-4">The question you're trying to edit doesn't exist.</p>
          <Button onClick={() => navigate('/teacher/questions')}>
            Back to Questions
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => navigate('/teacher/questions')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Questions
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Question</h1>
            <p className="text-muted-foreground">
              Update question details and test cases
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Question Information</CardTitle>
            <CardDescription>
              Update the basic information for your question
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="question_title">Question Title</Label>
                <Input
                  id="question_title"
                  value={formData.question_title}
                  onChange={(e) => handleInputChange('question_title', e.target.value)}
                  placeholder="Enter question title"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="difficulty">Difficulty</Label>
                <Select value={formData.difficulty} onValueChange={(value) => handleInputChange('difficulty', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Easy">Easy</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Enter question description"
                rows={4}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => handleInputChange('tags', e.target.value)}
                  placeholder="Enter tags (comma-separated)"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="constraints">Constraints</Label>
                <Input
                  id="constraints"
                  value={formData.constraints}
                  onChange={(e) => handleInputChange('constraints', e.target.value)}
                  placeholder="Enter constraints"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_visible"
                checked={formData.is_visible}
                onCheckedChange={(checked) => handleInputChange('is_visible', checked)}
              />
              <Label htmlFor="is_visible">Make question visible to students</Label>
            </div>
          </CardContent>
        </Card>

        {/* Test Cases */}
        <Card>
          <CardHeader>
            <CardTitle>Test Cases</CardTitle>
            <CardDescription>
              Update test cases for your question
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.testcases.map((testcase, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">Test Case {index + 1}</h4>
                  <div className="flex items-center space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => toggleTestcaseVisibility(index)}
                      className={testcase.is_visible ? "text-green-600" : "text-red-600"}
                    >
                      {testcase.is_visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </Button>
                    <Badge variant={testcase.is_visible ? "default" : "secondary"}>
                      {testcase.is_visible ? "Visible" : "Hidden"}
                    </Badge>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeTestcase(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Input</Label>
                    <Textarea
                      value={testcase.stdin}
                      onChange={(e) => updateTestcase(index, 'stdin', e.target.value)}
                      placeholder="Enter test input"
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Expected Output</Label>
                    <Textarea
                      value={testcase.expected_output}
                      onChange={(e) => updateTestcase(index, 'expected_output', e.target.value)}
                      placeholder="Enter expected output"
                      rows={3}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Explanation (Optional)</Label>
                  <Textarea
                    value={testcase.explanation || ''}
                    onChange={(e) => updateTestcase(index, 'explanation', e.target.value)}
                    placeholder="Enter explanation for this test case (optional)"
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Weight</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0.01"
                    max="100"
                    value={testcase.weight}
                    onChange={(e) => updateTestcase(index, 'weight', parseFloat(e.target.value))}
                    placeholder="Enter weight"
                  />
                </div>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              onClick={addNewTestcase}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Test Case
            </Button>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/teacher/questions')}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditQuestionPage;
