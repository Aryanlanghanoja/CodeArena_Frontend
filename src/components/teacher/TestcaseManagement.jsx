import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { useToast } from '../../hooks/use-toast';
import questionsService from '../../services/questionsService';
import { Plus, Trash2, Save, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';

const TestcaseManagement = () => {
  const { questionId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [question, setQuestion] = useState(null);
  const [testcases, setTestcases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showInputs, setShowInputs] = useState({});

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
        setTestcases(result.data.testcases || []);
        // Initialize showInputs state for each testcase
        const initialShowInputs = {};
        (result.data.testcases || []).forEach((tc, index) => {
          initialShowInputs[index] = false;
        });
        setShowInputs(initialShowInputs);
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

  const addNewTestcase = () => {
    const newTestcase = {
      id: `temp_${Date.now()}`,
      stdin: '',
      expected_output: '',
      weight: 1.0,
      is_visible: true,
      isNew: true
    };
    setTestcases([...testcases, newTestcase]);
    setShowInputs({...showInputs, [testcases.length]: true});
  };

  const updateTestcase = (index, field, value) => {
    const updatedTestcases = [...testcases];
    updatedTestcases[index] = {
      ...updatedTestcases[index],
      [field]: value
    };
    setTestcases(updatedTestcases);
  };

  const removeTestcase = (index) => {
    if (window.confirm('Are you sure you want to remove this testcase?')) {
      const updatedTestcases = testcases.filter((_, i) => i !== index);
      setTestcases(updatedTestcases);
      
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
    const updatedTestcases = [...testcases];
    updatedTestcases[index] = {
      ...updatedTestcases[index],
      is_visible: !updatedTestcases[index].is_visible
    };
    setTestcases(updatedTestcases);
  };

  const saveTestcases = async () => {
    try {
      setSaving(true);
      
      // For now, we'll save each new testcase individually
      // In a real implementation, you might want to batch save or update the entire question
      const newTestcases = testcases.filter(tc => tc.isNew);
      
      for (const testcase of newTestcases) {
        const result = await questionsService.addTestcase(questionId, {
          stdin: testcase.stdin,
          expected_output: testcase.expected_output,
          weight: parseFloat(testcase.weight),
          is_visible: testcase.is_visible !== undefined ? testcase.is_visible : true
        });
        
        if (!result.success) {
          throw new Error(result.message || 'Failed to save testcase');
        }
      }
      
      toast({
        title: "Success",
        description: "Testcases saved successfully"
      });
      
      // Refresh the question data
      await fetchQuestion();
      
    } catch (error) {
      console.error('Error saving testcases:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save testcases",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const getTotalWeight = () => {
    return testcases.reduce((total, tc) => total + parseFloat(tc.weight || 0), 0);
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
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <h2 className="text-3xl font-bold tracking-tight">Manage Testcases</h2>
          </div>
          <p className="text-muted-foreground">
            {question.question_title}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={addNewTestcase}
            variant="outline"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Testcase
          </Button>
          <Button
            onClick={saveTestcases}
            disabled={saving}
          >
            <Save className="mr-2 h-4 w-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Question Info */}
      <Card>
        <CardHeader>
          <CardTitle>Question Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Title</Label>
              <p className="font-medium">{question.question_title}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Difficulty</Label>
              <Badge className="ml-2">{question.difficulty}</Badge>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Total Weight</Label>
              <p className="font-medium">{getTotalWeight().toFixed(2)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Testcases List */}
      <div className="space-y-4">
        {testcases.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <div className="text-muted-foreground mb-4">
                <p>No testcases added yet</p>
                <p className="text-sm">Add your first testcase to get started</p>
              </div>
              <Button onClick={addNewTestcase}>
                <Plus className="mr-2 h-4 w-4" />
                Add First Testcase
              </Button>
            </CardContent>
          </Card>
        ) : (
          testcases.map((testcase, index) => (
            <Card key={testcase.id || index}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">
                    Testcase {index + 1}
                    {testcase.isNew && (
                      <Badge variant="secondary" className="ml-2">New</Badge>
                    )}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleShowInput(index)}
                    >
                      {showInputs[index] ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
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
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  </div>

                  {/* Input/Output Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`stdin-${index}`}>Input (stdin)</Label>
                      <Textarea
                        id={`stdin-${index}`}
                        value={testcase.stdin}
                        onChange={(e) => updateTestcase(index, 'stdin', e.target.value)}
                        placeholder="Enter test input..."
                        rows={4}
                        className="font-mono text-sm"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`expected-${index}`}>Expected Output</Label>
                      <Textarea
                        id={`expected-${index}`}
                        value={testcase.expected_output}
                        onChange={(e) => updateTestcase(index, 'expected_output', e.target.value)}
                        placeholder="Enter expected output..."
                        rows={4}
                        className="font-mono text-sm"
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
          ))
        )}
      </div>

      {/* Summary */}
      {testcases.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Testcase Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Total Testcases</Label>
                <p className="text-2xl font-bold">{testcases.length}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Total Weight</Label>
                <p className="text-2xl font-bold">{getTotalWeight().toFixed(2)}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Average Weight</Label>
                <p className="text-2xl font-bold">
                  {testcases.length > 0 ? (getTotalWeight() / testcases.length).toFixed(2) : '0.00'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TestcaseManagement;
