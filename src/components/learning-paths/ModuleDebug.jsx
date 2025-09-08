import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useToast } from '../../hooks/use-toast';
import learningPathService from '../../services/learningPathService';

const ModuleDebug = () => {
  const { pathId, moduleId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [debugInfo, setDebugInfo] = useState({});
  const [loading, setLoading] = useState(false);

  const runDebugTests = async () => {
    setLoading(true);
    const info = {
      params: { pathId, moduleId },
      user: user,
      tests: {}
    };

    try {
      // Test 1: Check if learning path exists
      console.log('Testing: Get learning path...');
      const pathResponse = await learningPathService.getLearningPath(pathId);
      info.tests.getLearningPath = {
        success: pathResponse.success,
        data: pathResponse.data,
        message: pathResponse.success ? 'Learning path found' : 'Learning path not found'
      };
    } catch (error) {
      info.tests.getLearningPath = {
        success: false,
        error: error.message,
        message: 'Error fetching learning path: ' + error.message
      };
    }

    try {
      // Test 2: Check if modules exist for this path
      console.log('Testing: Get modules for path...');
      const modulesResponse = await learningPathService.getModules(pathId);
      info.tests.getModules = {
        success: modulesResponse.success,
        data: modulesResponse.data,
        message: modulesResponse.success ? `Found ${modulesResponse.data.length} modules` : 'No modules found'
      };
    } catch (error) {
      info.tests.getModules = {
        success: false,
        error: error.message,
        message: 'Error fetching modules: ' + error.message
      };
    }

    try {
      // Test 3: Check if specific module exists
      console.log('Testing: Get specific module...');
      const moduleResponse = await learningPathService.getModule(pathId, moduleId);
      info.tests.getModule = {
        success: moduleResponse.success,
        data: moduleResponse.data,
        message: moduleResponse.success ? 'Module found' : 'Module not found'
      };
    } catch (error) {
      info.tests.getModule = {
        success: false,
        error: error.message,
        message: 'Error fetching module: ' + error.message
      };
    }

    setDebugInfo(info);
    setLoading(false);

    toast({
      title: "Debug Tests Completed",
      description: "Check the results below for debugging information.",
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
          <CardTitle>Module Debug Information</CardTitle>
          <CardDescription>
            Debug the module loading issue for pathId: {pathId}, moduleId: {moduleId}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium">Route Parameters:</h4>
              <p className="text-sm text-muted-foreground">
                pathId: {pathId} (type: {typeof pathId})
              </p>
              <p className="text-sm text-muted-foreground">
                moduleId: {moduleId} (type: {typeof moduleId})
              </p>
            </div>
            
            <div>
              <h4 className="font-medium">Current User:</h4>
              <p className="text-sm text-muted-foreground">
                {user?.name} ({user?.email}) - Role: {user?.role}
              </p>
            </div>
            
            <Button 
              onClick={runDebugTests} 
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Running Debug Tests...' : 'Run Debug Tests'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {Object.keys(debugInfo).length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Debug Results</h3>
          
          {Object.entries(debugInfo.tests || {}).map(([testName, result]) => (
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
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => navigate(`/learning-paths/${pathId}`)}
            >
              Back to Learning Path
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/learning-paths')}
            >
              All Learning Paths
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ModuleDebug;
