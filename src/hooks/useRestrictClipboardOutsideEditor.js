import { useEffect } from 'react';

// Prevent copy/cut/paste on the current page.
// scope: 'outside' → block only outside CodeMirror editors
//        'all'     → block everywhere (including inside CodeMirror)
export default function useRestrictClipboardOutsideEditor(enabled = true, scope = 'outside') {
  useEffect(() => {
    if (!enabled) return;

    const isInsideCodeMirror = (target) => {
      if (!(target instanceof HTMLElement)) return false;
      return Boolean(target.closest('.cm-editor'));
    };

    const handler = (e) => {
      if (scope === 'outside') {
        if (isInsideCodeMirror(e.target)) return; // allow inside editor
      }
      e.preventDefault();
      e.stopPropagation();
    };

    document.addEventListener('copy', handler, { capture: true });
    document.addEventListener('cut', handler, { capture: true });
    document.addEventListener('paste', handler, { capture: true });

    return () => {
      document.removeEventListener('copy', handler, { capture: true });
      document.removeEventListener('cut', handler, { capture: true });
      document.removeEventListener('paste', handler, { capture: true });
    };
  }, [enabled, scope]);
}


