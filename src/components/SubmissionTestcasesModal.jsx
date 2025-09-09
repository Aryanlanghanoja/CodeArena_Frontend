import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { useToast } from '../hooks/use-toast';
import questionsService from '../services/questionsService';
import { Skeleton } from './ui/skeleton';
import { X, CheckCircle, XCircle, Clock, AlertTriangle, Eye, EyeOff } from 'lucide-react';

const SubmissionTestcasesModal = ({ submissionId, isOpen, onClose }) => {
  const { toast } = useToast();
  const [submissionDetails, setSubmissionDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && submissionId) {
      fetchSubmissionDetails();
    }
  }, [isOpen, submissionId]);

  const fetchSubmissionDetails = async () => {
    try {
      setLoading(true);
      const result = await questionsService.getSubmissionDetails(submissionId);
      
      if (result.success) {
        setSubmissionDetails(result.data);
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to load submission details",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching submission details:', error);
      toast({
        title: "Error",
        description: "Failed to load submission details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (statusId) => {
    switch (statusId) {
      case 3: // Accepted
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 4: // Wrong Answer
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 5: // Time Limit Exceeded
        return <Clock className="h-5 w-5 text-orange-600" />;
      case 6: // Compilation Error
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case 7: // Runtime Error
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case 8: // Memory Limit Exceeded
        return <AlertTriangle className="h-5 w-5 text-orange-600" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusBadge = (statusId, status) => {
    const variants = {
      3: { variant: 'default', className: 'bg-green-100 text-green-800' },
      4: { variant: 'destructive', className: 'bg-red-100 text-red-800' },
      5: { variant: 'secondary', className: 'bg-orange-100 text-orange-800' },
      6: { variant: 'destructive', className: 'bg-red-100 text-red-800' },
      7: { variant: 'destructive', className: 'bg-red-100 text-red-800' },
      8: { variant: 'secondary', className: 'bg-orange-100 text-orange-800' },
    };

    const config = variants[statusId] || { variant: 'secondary', className: 'bg-gray-100 text-gray-800' };

    return (
      <Badge variant={config.variant} className={config.className}>
        {status}
      </Badge>
    );
  };

  const formatOutput = (output) => {
    if (!output) return 'No output';
    return output.length > 200 ? output.substring(0, 200) + '...' : output;
  };

  const safeFormatNumber = (num, decimals = 1) => {
    if (num === null || num === undefined || isNaN(num)) return '0';
    return Number(num).toFixed(decimals);
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Submission Testcase Details
          </DialogTitle>
          <DialogDescription>
            View the results of each public testcase for this submission
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : submissionDetails ? (
          <div className="space-y-6">
            {/* Submission Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Submission Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="text-center">
                    <div className="font-medium text-green-600">
                      {submissionDetails.public_passed}/{submissionDetails.public_testcases}
                    </div>
                    <div className="text-xs text-muted-foreground">Public Test Cases</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-blue-600">
                      {submissionDetails.passed_testcases}/{submissionDetails.total_testcases}
                    </div>
                    <div className="text-xs text-muted-foreground">Total Test Cases</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-purple-600">
                      {safeFormatNumber(submissionDetails.score, 1)}%
                    </div>
                    <div className="text-xs text-muted-foreground">Score</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-gray-600">
                      {new Date(submissionDetails.created_at).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-muted-foreground">Submitted</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Testcase Results */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Public Testcase Results</h3>
              {submissionDetails.testcases && submissionDetails.testcases.length > 0 ? (
                submissionDetails.testcases.map((testcase, index) => (
                  <Card key={testcase.testcase_id} className="border-l-4 border-l-blue-500">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(testcase.status_id)}
                          <div>
                            <CardTitle className="text-base">
                              Test Case #{testcase.testcase_number}
                            </CardTitle>
                            <CardDescription>
                              Weight: {safeFormatNumber(testcase.weight, 1)} points
                            </CardDescription>
                          </div>
                        </div>
                        {getStatusBadge(testcase.status_id, testcase.status)}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Input */}
                      <div>
                        <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                          <span className="w-2 h-2 bg-gray-500 rounded-full"></span>
                          Input:
                        </h4>
                        <div className="bg-gray-50 border border-gray-200 p-3 rounded-md font-mono text-sm">
                          <pre className="whitespace-pre-wrap text-gray-800">{testcase.stdin || 'No input'}</pre>
                        </div>
                      </div>

                      {/* Expected Output */}
                      <div>
                        <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                          Expected Output:
                        </h4>
                        <div className="bg-green-50 border border-green-200 p-3 rounded-md font-mono text-sm">
                          <pre className="whitespace-pre-wrap text-green-800">{testcase.expected_output || 'No expected output'}</pre>
                        </div>
                      </div>

                      {/* Actual Output */}
                      <div>
                        <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                          Your Output:
                          {testcase.status_id === 3 ? (
                            <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">✓ Correct</span>
                          ) : (
                            <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">✗ Incorrect</span>
                          )}
                        </h4>
                        <div className={`border p-3 rounded-md font-mono text-sm ${
                          testcase.status_id === 3 
                            ? 'bg-green-50 border-green-200 text-green-800' 
                            : 'bg-red-50 border-red-200 text-red-800'
                        }`}>
                          <pre className="whitespace-pre-wrap">{formatOutput(testcase.stdout)}</pre>
                        </div>
                      </div>

                      {/* Output Comparison */}
                      {testcase.status_id !== 3 && (
                        <div>
                          <h4 className="font-medium text-sm mb-2 flex items-center gap-2 text-orange-600">
                            <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                            Output Comparison:
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <div className="text-xs text-gray-600 mb-1">Expected:</div>
                              <div className="bg-green-50 border border-green-200 p-2 rounded font-mono text-sm text-green-800">
                                <pre className="whitespace-pre-wrap">{testcase.expected_output}</pre>
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-600 mb-1">Your Output:</div>
                              <div className="bg-red-50 border border-red-200 p-2 rounded font-mono text-sm text-red-800">
                                <pre className="whitespace-pre-wrap">{formatOutput(testcase.stdout)}</pre>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Error Output (if any) */}
                      {testcase.stderr && (
                        <div>
                          <h4 className="font-medium text-sm mb-2 flex items-center gap-2 text-red-600">
                            <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                            Error Output:
                          </h4>
                          <div className="bg-red-50 border border-red-200 p-3 rounded-md font-mono text-sm text-red-800">
                            <pre className="whitespace-pre-wrap">{formatOutput(testcase.stderr)}</pre>
                          </div>
                        </div>
                      )}

                      {/* Performance Info */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Execution Time:</span>
                          <span className="ml-2">{safeFormatNumber(testcase.time, 3)}s</span>
                        </div>
                        <div>
                          <span className="font-medium">Memory Used:</span>
                          <span className="ml-2">{safeFormatNumber(testcase.memory, 0)} KB</span>
                        </div>
                      </div>

                      {/* Explanation (if available) */}
                      {testcase.explanation && (
                        <div>
                          <h4 className="font-medium text-sm mb-2">Explanation:</h4>
                          <div className="bg-yellow-50 p-3 rounded-md text-sm">
                            {testcase.explanation}
                          </div>
                        </div>
                      )}

                      {/* Suggestion (if available) */}
                      {testcase.suggestion && (
                        <div>
                          <h4 className="font-medium text-sm mb-2 text-blue-600">Suggestion:</h4>
                          <div className="bg-blue-50 p-3 rounded-md text-sm text-blue-800">
                            {testcase.suggestion}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <EyeOff className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No public testcase results available for this submission.</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <AlertTriangle className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Failed to load submission details.</p>
          </div>
        )}

        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={onClose}>
            <X className="h-4 w-4 mr-2" />
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SubmissionTestcasesModal;
