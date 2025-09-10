import React, { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { useToast } from '../../hooks/use-toast';
import assignmentRunsService from '../../services/assignmentRunsService';
import { Skeleton } from '../ui/skeleton';
import { X, CheckCircle, XCircle, Clock, AlertTriangle, Eye, EyeOff } from 'lucide-react';

const AssignmentSubmissionTestcasesModal = ({ submissionId, isOpen, onClose }) => {
  const { toast } = useToast();
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && submissionId) {
      fetchDetails();
    }
  }, [isOpen, submissionId]);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const result = await assignmentRunsService.getSubmissionDetails(submissionId);
      if (result.success) {
        setDetails(result.data);
      } else {
        toast({ title: 'Error', description: result.message || 'Failed to load submission details', variant: 'destructive' });
      }
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to load submission details', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
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
        ) : !details ? (
          <div className="text-center py-8 text-muted-foreground">
            <AlertTriangle className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Failed to load submission details.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Submission Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Submission Summary</CardTitle>
                <CardDescription>Status: {details.status}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="text-center">
                    <div className="font-medium text-green-600">{details.public_passed ?? '--'}/{details.public_testcases ?? '--'}</div>
                    <div className="text-xs text-muted-foreground">Public Test Cases</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-blue-600">{details.passed_testcases ?? '--'}/{details.total_testcases ?? '--'}</div>
                    <div className="text-xs text-muted-foreground">Total Test Cases</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-purple-600">{safeFormatNumber(details.score, 1)}%</div>
                    <div className="text-xs text-muted-foreground">Score</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-gray-600">{details.created_at ? new Date(details.created_at).toLocaleString() : '--'}</div>
                    <div className="text-xs text-muted-foreground">Submitted</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Testcase Results */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Public Testcase Results</h3>
              {Array.isArray(details.results) && details.results.filter(r => r.is_visible).length > 0 ? (
                details.results.filter(r => r.is_visible).map((r, i) => (
                  <Card key={i} className={`border-l-4 ${r.status === 'Accepted' ? 'border-l-green-500' : 'border-l-red-500'}`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-base">Test Case {r.testcase_number}</CardTitle>
                          <CardDescription>Runtime: {safeFormatNumber(r.runtime ?? r.time, 2)}ms • Memory: {safeFormatNumber(r.memory, 0)}KB</CardDescription>
                        </div>
                        <Badge variant="outline">{r.status}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Input</div>
                        <pre className="bg-muted p-2 rounded whitespace-pre-wrap">{r.stdin}</pre>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Expected</div>
                        <pre className="bg-muted p-2 rounded whitespace-pre-wrap">{r.expected_output}</pre>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Actual</div>
                        <pre className="bg-muted p-2 rounded whitespace-pre-wrap">{r.stdout || 'No output'}</pre>
                      </div>
                      {r.stderr && (
                        <div>
                          <div className="text-xs text-red-600 mb-1">Error Details</div>
                          <pre className="bg-red-50 border border-red-200 p-2 rounded whitespace-pre-wrap text-red-800">{r.stderr}</pre>
                        </div>
                      )}
                      {r.explanation && (
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">Explanation</div>
                          <div className="bg-yellow-50 p-2 rounded text-sm">{r.explanation}</div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <EyeOff className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No public testcase results available.</p>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={onClose}>
            <X className="h-4 w-4 mr-2" /> Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AssignmentSubmissionTestcasesModal;
