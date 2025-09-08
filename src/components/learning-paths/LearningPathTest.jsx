import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useToast } from '../../hooks/use-toast';
import learningPathService from '../../services/learningPathService';

const LearningPathTest = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [testResults, setTestResults] = useState({});
  const [loading, setLoading] = useState(false);

  const runTests = async () => {
    setLoading(true);
    const results = {};

    try {
      // Test 1: Fetch learning paths
      console.log('Testing: Fetch learning paths...');
      const pathsResponse = await learningPathService.getLearningPaths();
      results.fetchPaths = {
        success: pathsResponse.success,
        data: pathsResponse.data,
        message: pathsResponse.success ? 'Successfully fetched learning paths' : 'Failed to fetch learning paths'
      };
      console.log('Learning paths response:', pathsResponse);
    } catch (error) {
      results.fetchPaths = {
        success: false,
        error: error.message,
        message: 'Error fetching learning paths: ' + error.message
      };
      console.error('Error fetching learning paths:', error);
    }

    try {
      // Test 2: Fetch browse learning paths (for students)
      if (user?.role === 'student') {
        console.log('Testing: Browse learning paths...');
        const browseResponse = await learningPathService.browseLearningPaths();
        results.browsePaths = {
          success: browseResponse.success,
          data: browseResponse.data,
          message: browseResponse.success ? 'Successfully browsed learning paths' : 'Failed to browse learning paths'
        };
        console.log('Browse learning paths response:', browseResponse);
      }
    } catch (error) {
      results.browsePaths = {
        success: false,
        error: error.message,
        message: 'Error browsing learning paths: ' + error.message
      };
      console.error('Error browsing learning paths:', error);
    }

    try {
      // Test 3: Create a test learning path (for teachers/admins)
      if (user?.role === 'teacher' || user?.role === 'admin') {
        console.log('Testing: Create learning path...');
        const testPathData = {
          name: 'test-path-' + Date.now(),
          title: 'Test Learning Path',
          description: 'A test learning path created by the test component',
          visibility: 'draft'
        };
        
        const createResponse = await learningPathService.createLearningPath(testPathData);
        results.createPath = {
          success: createResponse.success,
          data: createResponse.data,
          message: createResponse.success ? 'Successfully created test learning path' : 'Failed to create learning path'
        };
        console.log('Create learning path response:', createResponse);
      }
    } catch (error) {
      results.createPath = {
        success: false,
        error: error.message,
        message: 'Error creating learning path: ' + error.message
      };
      console.error('Error creating learning path:', error);
    }

    setTestResults(results);
    setLoading(false);

    toast({
      title: "Tests Completed",
      description: "Check the results below for test outcomes.",
    });
  };

  const getStatusBadge = (success) => {
    return (
      <Badge variant={success ? 'default' : 'destructive'}>
        {success ? 'PASS' : 'FAIL'}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Learning Path API Test</CardTitle>
          <CardDescription>
            Test the learning path functionality for user role: <Badge variant="outline">{user?.role}</Badge>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={runTests} 
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Running Tests...' : 'Run Learning Path Tests'}
          </Button>
        </CardContent>
      </Card>

      {Object.keys(testResults).length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Test Results</h3>
          
          {Object.entries(testResults).map(([testName, result]) => (
            <Card key={testName}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base capitalize">
                    {testName.replace(/([A-Z])/g, ' $1').trim()}
                  </CardTitle>
                  {getStatusBadge(result.success)}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">
                  {result.message}
                </p>
                
                {result.error && (
                  <div className="bg-destructive/10 p-3 rounded-md">
                    <p className="text-sm text-destructive font-mono">
                      {result.error}
                    </p>
                  </div>
                )}
                
                {result.data && (
                  <div className="bg-muted/50 p-3 rounded-md">
                    <p className="text-sm font-medium mb-2">Response Data:</p>
                    <pre className="text-xs overflow-auto max-h-32">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>User Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p><strong>User ID:</strong> {user?.user_id}</p>
            <p><strong>Name:</strong> {user?.name}</p>
            <p><strong>Email:</strong> {user?.email}</p>
            <p><strong>Role:</strong> <Badge variant="outline">{user?.role}</Badge></p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LearningPathTest;
