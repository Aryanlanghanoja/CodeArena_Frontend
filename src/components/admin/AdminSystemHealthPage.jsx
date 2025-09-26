import React, { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { useToast } from '../../hooks/use-toast';
import judge0Service from '../../services/judge0Service';

const AdminSystemHealthPage = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [judge0Status, setJudge0Status] = useState('unknown');

  const getStatusBadge = (status) => {
    const variants = {
      operational: 'default',
      healthy: 'default',
      warning: 'secondary',
      critical: 'destructive',
      offline: 'destructive',
      unknown: 'secondary',
    };
    return (
      <Badge variant={variants[status] || 'secondary'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const statusResp = await judge0Service.getServiceStatus();
      const ok = statusResp && (statusResp.ok === true || statusResp.success === true || statusResp.status === 'ok');
      setJudge0Status(ok ? 'operational' : 'offline');
      setLastUpdated(new Date());
    } catch (e) {
      setJudge0Status('offline');
      setLastUpdated(new Date());
      toast({ title: 'Judge0 check failed', description: 'Could not reach Judge0 status endpoint.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-1">System Health</h1>
          <div className="text-sm text-muted-foreground">Checks core services status.</div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm text-muted-foreground">Last updated: {lastUpdated?.toLocaleTimeString() || '-'}</div>
          <Button variant="outline" onClick={fetchStatus} disabled={loading}>
            {loading ? 'Checking…' : 'Refresh'}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Judge0 Service</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${judge0Status === 'operational' ? 'bg-green-500' : judge0Status === 'unknown' ? 'bg-gray-400' : 'bg-red-500'}`}></div>
              <div className="text-base">Status: {getStatusBadge(judge0Status)}</div>
            </div>
            <Button size="sm" onClick={fetchStatus} disabled={loading}>
              {loading ? 'Checking…' : 'Recheck'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSystemHealthPage;
