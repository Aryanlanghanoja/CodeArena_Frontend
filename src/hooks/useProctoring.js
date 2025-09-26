import { useEffect, useRef, useState } from 'react';

/**
 * Simple proctoring hook: monitors fullscreen exits, tab visibility, copy/paste.
 * Calls onViolation(type) for each event and triggers onThreshold() when count >= threshold.
 */
export default function useProctoring({ enabled = true, threshold = 2, onViolation, onThreshold } = {}) {
  const [violationCount, setViolationCount] = useState(0);
  const thresholdHitRef = useRef(false);

  useEffect(() => {
    if (!enabled) return;

    const report = (type) => {
      if (onViolation) onViolation(type);
      setViolationCount((c) => {
        const next = c + 1;
        if (!thresholdHitRef.current && next >= threshold) {
          thresholdHitRef.current = true;
          if (onThreshold) onThreshold(next);
        }
        return next;
      });
    };

    // Fullscreen change
    const handleFsChange = () => {
      const inFs = document.fullscreenElement != null;
      if (!inFs) report('fullscreen_exit');
    };

    // Visibility change (tab switch/minimize)
    const handleVisibility = () => {
      if (document.hidden) report('visibility_hidden');
    };

    // Copy/paste
    const handleCopy = () => report('copy');
    const handlePaste = () => report('paste');

    document.addEventListener('fullscreenchange', handleFsChange);
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('copy', handleCopy);
    window.addEventListener('paste', handlePaste);

    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('copy', handleCopy);
      window.removeEventListener('paste', handlePaste);
    };
  }, [enabled, threshold, onViolation, onThreshold]);

  return { violationCount };
}


