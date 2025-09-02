import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../ui/table';
import { useToast } from '../../hooks/use-toast';

const AdminSystemHealthPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [systemHealth, setSystemHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Mock data - replace with actual API calls
  useEffect(() => {
    const fetchSystemHealth = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockSystemHealth = {
          overallStatus: 'healthy',
          lastCheck: new Date().toISOString(),
          
          // Judge0 Status
          judge0: {
            status: 'operational',
            workers: {
              total: 8,
              active: 7,
              idle: 1,
              failed: 0
            },
            queue: {
              pending: 12,
              processing: 3,
              completed: 1247,
              failed: 8
            },
            performance: {
              averageResponseTime: 2.3,
              requestsPerMinute: 45,
              uptime: 99.8
            }
          },
          
          // Database Status
          database: {
            status: 'operational',
            connections: {
              active: 24,
              max: 100,
              idle: 12
            },
            performance: {
              queryTime: 45,
              activeQueries: 8,
              slowQueries: 2
            },
            storage: {
              used: 2.4,
              total: 10.0,
              free: 7.6
            }
          },
          
          // Platform Status
          platform: {
            status: 'operational',
            users: {
              online: 156,
              total: 1247,
              activeToday: 89
            },
            performance: {
              responseTime: 180,
              errorRate: 0.2,
              uptime: 99.9
            },
            resources: {
              cpu: 45.2,
              memory: 67.8,
              disk: 23.4
            }
          },
          
          // Recent Alerts
          alerts: [
            {
              id: 1,
              level: 'warning',
              message: 'High memory usage detected',
              timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
              resolved: false
            },
            {
              id: 2,
              level: 'info',
              message: 'Scheduled maintenance completed',
              timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
              resolved: true
            }
          ],
          
          // System Metrics
          metrics: {
            requestsPerSecond: 12.5,
            averageResponseTime: 180,
            errorRate: 0.2,
            activeUsers: 156
          }
        };
        
        setSystemHealth(mockSystemHealth);
        setLastUpdated(new Date());
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch system health data",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSystemHealth();
    
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(fetchSystemHealth, 30000);
    
    return () => clearInterval(interval);
  }, [toast]);

  const getStatusBadge = (status) => {
    const variants = {
      operational: 'default',
      healthy: 'default',
      warning: 'secondary',
      critical: 'destructive',
      offline: 'destructive'
    };
    
    return (
      <Badge variant={variants[status] || 'secondary'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getAlertLevelBadge = (level) => {
    const variants = {
      info: 'default',
      warning: 'secondary',
      critical: 'destructive'
    };
    
    return (
      <Badge variant={variants[level] || 'secondary'}>
        {level.charAt(0).toUpperCase() + level.slice(1)}
      </Badge>
    );
  };

  const formatUptime = (uptime) => {
    return `${uptime.toFixed(1)}%`;
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!systemHealth) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Failed to load system health data.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold mb-2">System Health</h1>
          <p className="text-muted-foreground">
            Monitor platform performance, Judge0 workers, and system resources.
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm text-muted-foreground">
            Last updated: {lastUpdated?.toLocaleTimeString()}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <div className={`w-3 h-3 rounded-full ${
              systemHealth.overallStatus === 'healthy' ? 'bg-green-500' : 
              systemHealth.overallStatus === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
            }`}></div>
            <span className="text-sm font-medium">
              Overall Status: {systemHealth.overallStatus.charAt(0).toUpperCase() + systemHealth.overallStatus.slice(1)}
            </span>
          </div>
        </div>
      </div>

      {/* Overall Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Judge0 Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{getStatusBadge(systemHealth.judge0.status)}</div>
              <div className="text-right text-sm text-muted-foreground">
                {systemHealth.judge0.performance.uptime}% uptime
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Database Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{getStatusBadge(systemHealth.database.status)}</div>
              <div className="text-right text-sm text-muted-foreground">
                {systemHealth.database.connections.active}/{systemHealth.database.connections.max} connections
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Platform Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{getStatusBadge(systemHealth.platform.status)}</div>
              <div className="text-right text-sm text-muted-foreground">
                {systemHealth.platform.users.online} online users
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Response Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemHealth.metrics.averageResponseTime}ms</div>
            <div className="text-sm text-muted-foreground">
              {systemHealth.metrics.requestsPerSecond} req/s
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Judge0 Workers Status */}
      <Card>
        <CardHeader>
          <CardTitle>Judge0 Workers</CardTitle>
          <CardDescription>Code execution worker status and performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{systemHealth.judge0.workers.active}</div>
              <div className="text-sm text-muted-foreground">Active Workers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{systemHealth.judge0.workers.idle}</div>
              <div className="text-sm text-muted-foreground">Idle Workers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">{systemHealth.judge0.workers.failed}</div>
              <div className="text-sm text-muted-foreground">Failed Workers</div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Worker Utilization</span>
                <span>{((systemHealth.judge0.workers.active / systemHealth.judge0.workers.total) * 100).toFixed(1)}%</span>
              </div>
              <Progress value={(systemHealth.judge0.workers.active / systemHealth.judge0.workers.total) * 100} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Queue Status</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Pending:</span>
                    <span className="font-medium">{systemHealth.judge0.queue.pending}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Processing:</span>
                    <span className="font-medium">{systemHealth.judge0.queue.processing}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Completed:</span>
                    <span className="font-medium">{systemHealth.judge0.queue.completed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Failed:</span>
                    <span className="font-medium text-red-600">{systemHealth.judge0.queue.failed}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Performance</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Avg Response:</span>
                    <span className="font-medium">{systemHealth.judge0.performance.averageResponseTime}s</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Requests/min:</span>
                    <span className="font-medium">{systemHealth.judge0.performance.requestsPerMinute}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Uptime:</span>
                    <span className="font-medium">{formatUptime(systemHealth.judge0.performance.uptime)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Database Status */}
      <Card>
        <CardHeader>
          <CardTitle>Database Status</CardTitle>
          <CardDescription>Connection pool and performance metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{systemHealth.database.connections.active}</div>
              <div className="text-sm text-muted-foreground">Active Connections</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{systemHealth.database.connections.idle}</div>
              <div className="text-sm text-muted-foreground">Idle Connections</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600">{systemHealth.database.performance.slowQueries}</div>
              <div className="text-sm text-muted-foreground">Slow Queries</div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Connection Pool Usage</span>
                <span>{((systemHealth.database.connections.active / systemHealth.database.connections.max) * 100).toFixed(1)}%</span>
              </div>
              <Progress value={(systemHealth.database.connections.active / systemHealth.database.connections.max) * 100} />
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Storage Usage</span>
                <span>{((systemHealth.database.storage.used / systemHealth.database.storage.total) * 100).toFixed(1)}%</span>
              </div>
              <Progress value={(systemHealth.database.storage.used / systemHealth.database.storage.total) * 100} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Performance</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Avg Query Time:</span>
                    <span className="font-medium">{systemHealth.database.performance.queryTime}ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Active Queries:</span>
                    <span className="font-medium">{systemHealth.database.performance.activeQueries}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Storage</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Used:</span>
                    <span className="font-medium">{systemHealth.database.storage.used}GB</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Free:</span>
                    <span className="font-medium">{systemHealth.database.storage.free}GB</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total:</span>
                    <span className="font-medium">{systemHealth.database.storage.total}GB</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Platform Resources */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Resources</CardTitle>
          <CardDescription>System resource utilization and user activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{systemHealth.platform.users.online}</div>
              <div className="text-sm text-muted-foreground">Online Users</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{systemHealth.platform.users.activeToday}</div>
              <div className="text-sm text-muted-foreground">Active Today</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">{systemHealth.metrics.requestsPerSecond}</div>
              <div className="text-sm text-muted-foreground">Requests/sec</div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>CPU Usage</span>
                <span>{systemHealth.platform.resources.cpu}%</span>
              </div>
              <Progress value={systemHealth.platform.resources.cpu} />
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Memory Usage</span>
                <span>{systemHealth.platform.resources.memory}%</span>
              </div>
              <Progress value={systemHealth.platform.resources.memory} />
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Disk Usage</span>
                <span>{systemHealth.platform.resources.disk}%</span>
              </div>
              <Progress value={systemHealth.platform.resources.disk} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Performance</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Response Time:</span>
                    <span className="font-medium">{systemHealth.platform.performance.responseTime}ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Error Rate:</span>
                    <span className="font-medium">{systemHealth.platform.performance.errorRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Uptime:</span>
                    <span className="font-medium">{formatUptime(systemHealth.platform.performance.uptime)}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">User Activity</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Online:</span>
                    <span className="font-medium">{systemHealth.platform.users.online}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Users:</span>
                    <span className="font-medium">{systemHealth.platform.users.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Active Today:</span>
                    <span className="font-medium">{systemHealth.platform.users.activeToday}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Alerts */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Alerts</CardTitle>
          <CardDescription>System alerts and notifications</CardDescription>
        </CardHeader>
        <CardContent>
          {systemHealth.alerts.length > 0 ? (
            <div className="space-y-3">
              {systemHealth.alerts.map((alert) => (
                <div key={alert.id} className={`p-3 rounded-lg border ${
                  alert.level === 'critical' ? 'bg-red-50 border-red-200' :
                  alert.level === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                  'bg-blue-50 border-blue-200'
                }`}>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      {getAlertLevelBadge(alert.level)}
                      <span className="font-medium">{alert.message}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">
                        {new Date(alert.timestamp).toLocaleString()}
                      </div>
                      <Badge variant={alert.resolved ? 'default' : 'secondary'} className="mt-1">
                        {alert.resolved ? 'Resolved' : 'Active'}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              No active alerts. All systems are operating normally.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSystemHealthPage;
