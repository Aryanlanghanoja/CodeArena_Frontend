import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useToast } from '../../hooks/use-toast';
import questionsService from '../../services/questionsService';
import { ArrowLeft, Save, Plus, Trash2, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CreateQuestionPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    question_title: '',
    description: '',
    markdown_content: '',
    difficulty: 'Easy',
    tags: '',
    constraints: '',
    testcases: []
  });
  
  const [loading, setLoading] = useState(false);
  const [showInputs, setShowInputs] = useState({});

  const addNewTestcase = () => {
    const newTestcase = {
      id: `temp_${Date.now()}`,
      stdin: '',
      expected_output: '',
      weight: 1.0,
      is_visible: true
    };
    setFormData({
      ...formData,
      testcases: [...formData.testcases, newTestcase]
    });
    setShowInputs({...showInputs, [formData.testcases.length]: true});
  };

  const updateTestcase = (index, field, value) => {
    const updatedTestcases = [...formData.testcases];
    updatedTestcases[index] = {
      ...updatedTestcases[index],
      [field]: value
    };
    setFormData({
      ...formData,
      testcases: updatedTestcases
    });
  };

  const removeTestcase = (index) => {
    if (window.confirm('Are you sure you want to remove this testcase?')) {
      const updatedTestcases = formData.testcases.filter((_, i) => i !== index);
      setFormData({
        ...formData,
        testcases: updatedTestcases
      });
      
      // Update showInputs state
      const updatedShowInputs = {};
      updatedTestcases.forEach((_, i) => {
        updatedShowInputs[i] = showInputs[i] || false;
      });
      setShowInputs(updatedShowInputs);
    }
  };

  const toggleShowInput = (index) => {
    setShowInputs({
      ...showInputs,
      [index]: !showInputs[index]
    });
  };

  const toggleTestcaseVisibility = (index) => {
    const updatedTestcases = [...formData.testcases];
    updatedTestcases[index] = {
      ...updatedTestcases[index],
      is_visible: !updatedTestcases[index].is_visible
    };
    setFormData({
      ...formData,
      testcases: updatedTestcases
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.question_title.trim()) {
      toast({
        title: "Validation Error",
        description: "Question title is required",
        variant: "destructive"
      });
      return;
    }
    
    if (!formData.description.trim()) {
      toast({
        title: "Validation Error",
        description: "Question description is required",
        variant: "destructive"
      });
      return;
    }
    
    if (formData.testcases.length === 0) {
      toast({
        title: "Validation Error",
        description: "At least one testcase is required",
        variant: "destructive"
      });
      return;
    }
    
    // Validate testcases
    for (let i = 0; i < formData.testcases.length; i++) {
      const tc = formData.testcases[i];
      if (!tc.stdin.trim() || !tc.expected_output.trim()) {
        toast({
          title: "Validation Error",
          description: `Testcase ${i + 1} is incomplete`,
          variant: "destructive"
        });
        return;
      }
    }

    try {
      setLoading(true);
      
      const questionData = {
        question_title: formData.question_title,
        description: formData.description,
        markdown_content: formData.markdown_content,
        difficulty: formData.difficulty,
        tags: formData.tags,
        constraints: formData.constraints,
        testcases: formData.testcases.map(tc => ({
          stdin: tc.stdin,
          expected_output: tc.expected_output,
          weight: parseFloat(tc.weight),
          is_visible: tc.is_visible !== undefined ? tc.is_visible : true
        }))
      };

      const result = await questionsService.createQuestion(questionData);
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Question created successfully"
        });
        navigate('/teacher/questions');
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to create question",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error creating question:', error);
      toast({
        title: "Error",
        description: "Failed to create question",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getTotalWeight = () => {
    return formData.testcases.reduce((total, tc) => total + parseFloat(tc.weight || 0), 0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/teacher/questions')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Questions
            </Button>
            <h2 className="text-3xl font-bold tracking-tight">Create New Question</h2>
          </div>
          <p className="text-muted-foreground">
            Create a new coding question with test cases
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleSubmit}
            disabled={loading}
          >
            <Save className="mr-2 h-4 w-4" />
            {loading ? 'Creating...' : 'Create Question'}
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Provide the basic details for your question
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="question_title">Question Title *</Label>
              <Input
                id="question_title"
                value={formData.question_title}
                onChange={(e) => setFormData({...formData, question_title: e.target.value})}
                placeholder="Enter question title..."
                required
              />
            </div>
            
            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Enter question description..."
                rows={3}
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="difficulty">Difficulty *</Label>
                <Select 
                  value={formData.difficulty} 
                  onValueChange={(value) => setFormData({...formData, difficulty: value})}
                >
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
              
              <div>
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => setFormData({...formData, tags: e.target.value})}
                  placeholder="e.g., arrays, sorting, algorithms"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Problem Statement */}
        <Card>
          <CardHeader>
            <CardTitle>Problem Statement</CardTitle>
            <CardDescription>
              Provide detailed problem statement using Markdown
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div>
              <Label htmlFor="markdown_content">Markdown Content</Label>
              <Textarea
                id="markdown_content"
                value={formData.markdown_content}
                onChange={(e) => setFormData({...formData, markdown_content: e.target.value})}
                placeholder="Enter detailed problem statement in Markdown format..."
                rows={8}
                className="font-mono text-sm"
              />
              <p className="text-sm text-muted-foreground mt-2">
                You can use Markdown formatting including code blocks, lists, and tables.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Constraints */}
        <Card>
          <CardHeader>
            <CardTitle>Constraints</CardTitle>
            <CardDescription>
              Specify any constraints or limitations for the problem
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div>
              <Label htmlFor="constraints">Constraints</Label>
              <Textarea
                id="constraints"
                value={formData.constraints}
                onChange={(e) => setFormData({...formData, constraints: e.target.value})}
                placeholder="Enter constraints (e.g., time limits, memory limits, input ranges)..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Test Cases */}
        <Card>
          <CardHeader>
            <CardTitle>Test Cases</CardTitle>
            <CardDescription>
              Add test cases for your question. At least one test case is required.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {formData.testcases.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-muted-foreground mb-4">
                  <p>No testcases added yet</p>
                  <p className="text-sm">Add your first testcase to get started</p>
                </div>
                <Button type="button" onClick={addNewTestcase}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add First Testcase
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {formData.testcases.map((testcase, index) => (
                  <Card key={testcase.id || index}>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-lg">
                            Testcase {index + 1}
                          </CardTitle>
                          <Badge 
                            variant={testcase.is_visible ? "default" : "secondary"}
                            className={testcase.is_visible ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                          >
                            {testcase.is_visible ? "Visible" : "Hidden"}
                          </Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => toggleShowInput(index)}
                            title="Toggle Input Preview"
                          >
                            {showInputs[index] ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => toggleTestcaseVisibility(index)}
                            title={testcase.is_visible ? "Hide from Students" : "Show to Students"}
                            className={testcase.is_visible ? "text-green-600 hover:text-green-700" : "text-red-600 hover:text-red-700"}
                          >
                            {testcase.is_visible ? (
                              <Eye className="h-4 w-4" />
                            ) : (
                              <EyeOff className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeTestcase(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Weight Input */}
                        <div>
                          <Label htmlFor={`weight-${index}`}>Weight</Label>
                          <Input
                            id={`weight-${index}`}
                            type="number"
                            step="0.01"
                            min="0.01"
                            max="100"
                            value={testcase.weight}
                            onChange={(e) => updateTestcase(index, 'weight', e.target.value)}
                            placeholder="1.00"
                          />
                        </div>

                        {/* Input/Output Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor={`stdin-${index}`}>Input (stdin) *</Label>
                            <Textarea
                              id={`stdin-${index}`}
                              value={testcase.stdin}
                              onChange={(e) => updateTestcase(index, 'stdin', e.target.value)}
                              placeholder="Enter test input..."
                              rows={4}
                              className="font-mono text-sm"
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor={`expected-${index}`}>Expected Output *</Label>
                            <Textarea
                              id={`expected-${index}`}
                              value={testcase.expected_output}
                              onChange={(e) => updateTestcase(index, 'expected_output', e.target.value)}
                              placeholder="Enter expected output..."
                              rows={4}
                              className="font-mono text-sm"
                              required
                            />
                          </div>
                        </div>

                        {/* Preview */}
                        {!showInputs[index] && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label className="text-sm font-medium text-muted-foreground">Input Preview</Label>
                              <pre className="bg-muted p-3 rounded-md text-sm overflow-x-auto">
                                {testcase.stdin || 'No input provided'}
                              </pre>
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-muted-foreground">Expected Output Preview</Label>
                              <pre className="bg-muted p-3 rounded-md text-sm overflow-x-auto">
                                {testcase.expected_output || 'No output provided'}
                              </pre>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add Testcase Button */}
        <div className="flex justify-center">
          <Button
            type="button"
            onClick={addNewTestcase}
            variant="outline"
            size="lg"
            className="px-8"
          >
            <Plus className="mr-2 h-5 w-5" />
            Add Another Testcase
          </Button>
        </div>

        {/* Summary */}
        {formData.testcases.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Question Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Title</Label>
                  <p className="font-medium">{formData.question_title || 'Untitled'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Difficulty</Label>
                  <Badge className="ml-2">{formData.difficulty}</Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Testcases</Label>
                  <p className="font-medium">{formData.testcases.length}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Total Weight</Label>
                  <p className="font-medium">{getTotalWeight().toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </form>
    </div>
  );
};

export default CreateQuestionPage;
