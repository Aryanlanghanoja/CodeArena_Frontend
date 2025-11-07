import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import proctorService from '../services/proctorService';

const GlobalDevtoolsOverlay = () => {
  const [devtoolsOpen, setDevtoolsOpen] = useState(false);

  const isDevtoolsOpen = () => {
    try {
      const widthThreshold = window.outerWidth - window.innerWidth > 160;
      const heightThreshold = window.outerHeight - window.innerHeight > 160;
      return widthThreshold || heightThreshold;
    } catch { return false; }
  };

  useEffect(() => {
    let lastState = false;
    const poll = () => {
      const open = isDevtoolsOpen();
      if (open !== lastState) {
        lastState = open;
        setDevtoolsOpen(open);
        proctorService.logEvent({ type: open ? 'devtools_open_global' : 'devtools_close_global', page: window.location.pathname });
      }
    };
    const id = setInterval(poll, 1200);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const preventKeys = (e) => {
      const isMac = navigator.platform.toUpperCase().includes('MAC');
      const ctrl = isMac ? e.metaKey : e.ctrlKey;
      if (
        e.key === 'F12' ||
        (ctrl && e.shiftKey && (e.key.toLowerCase() === 'i' || e.key.toLowerCase() === 'j' || e.key.toLowerCase() === 'c'))
      ) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    const preventContext = (e) => { e.preventDefault(); };
    window.addEventListener('keydown', preventKeys, true);
    document.addEventListener('contextmenu', preventContext, { capture: true });
    return () => {
      window.removeEventListener('keydown', preventKeys, true);
      document.removeEventListener('contextmenu', preventContext, { capture: true });
    };
  }, []);

  if (!devtoolsOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-background/95 backdrop-blur-sm flex items-center justify-center p-4" style={{ pointerEvents: 'auto' }}>
      <Card className="max-w-lg w-full">
        <CardHeader>
          <CardTitle>Developer Tools Detected</CardTitle>
          <CardDescription>
            For exam integrity, please close developer tools to continue using the site.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            Once devtools is closed, this screen will dismiss automatically.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GlobalDevtoolsOverlay;


