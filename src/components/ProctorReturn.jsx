import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { useToast } from '../hooks/use-toast';

const ProctorReturn = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isFullscreen, setIsFullscreen] = useState(!!document.fullscreenElement);
  const [devtoolsOpen, setDevtoolsOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // If we landed here without a stored return URL, try to use query param or fallback
    const params = new URLSearchParams(location.search);
    const qp = params.get('return');
    if (qp) sessionStorage.setItem('proctorReturnUrl', qp);
  }, [location.search]);

  const isDevtoolsOpen = () => {
    try {
      const widthThreshold = window.outerWidth - window.innerWidth > 160;
      const heightThreshold = window.outerHeight - window.innerHeight > 160;
      return widthThreshold || heightThreshold;
    } catch { return false; }
  };

  const requestFullscreen = async () => {
    if (isDevtoolsOpen()) {
      setDevtoolsOpen(true);
      toast({ title: 'Disable developer tools', description: 'Close devtools to continue.', variant: 'destructive' });
      return;
    }
    try { await document.documentElement.requestFullscreen(); } catch {}
  };

  useEffect(() => {
    // poll for devtools state
    const intervalId = setInterval(() => setDevtoolsOpen(isDevtoolsOpen()), 1200);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const onFsChange = () => {
      const fs = !!document.fullscreenElement;
      setIsFullscreen(fs);
      if (fs) {
        if (isDevtoolsOpen()) {
          try { document.exitFullscreen(); } catch {}
          setDevtoolsOpen(true);
          toast({ title: 'Disable developer tools', description: 'Close devtools to continue.', variant: 'destructive' });
          return;
        }
        const back = sessionStorage.getItem('proctorReturnUrl') || '/dashboard';
        // Clear once used
        sessionStorage.removeItem('proctorReturnUrl');
        navigate(back, { replace: true });
      }
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, [navigate]);

  return (
    <div className="min-h-[100dvh] flex items-center justify-center p-4">
      <Card className="max-w-lg w-full">
        <CardHeader>
          <CardTitle>Resume Solving</CardTitle>
          <CardDescription>
            To continue, please re-enter fullscreen. We'll take you back to your question automatically.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {devtoolsOpen ? 'Close developer tools to proceed.' : 'Click the button to re-enter fullscreen.'}
              </div>
            <Button onClick={requestFullscreen}>Enter Fullscreen</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProctorReturn;


