import { useEffect, useRef, useState } from 'react';
import proctorService from '../services/proctorService';

/**
 * Simple proctoring hook: monitors fullscreen exits, tab visibility, copy/paste.
 * Calls onViolation(type) for each event and triggers onThreshold() when count >= threshold.
 */
export default function useProctoring({ enabled = true, threshold = 2, onViolation, onThreshold } = {}) {
  const [violationCount, setViolationCount] = useState(0);
  const thresholdHitRef = useRef(false);
  const lastSentRef = useRef({}); // type -> timestamp ms
  const extensionFlaggedRef = useRef(false);
  const moRef = useRef(null);
  const merlinFlaggedRef = useRef(false);

  useEffect(() => {
    if (!enabled) return;

    const shouldSend = (type) => {
      const now = Date.now();
      const last = lastSentRef.current[type] || 0;
      // de-dupe identical events within 1500ms
      if (now - last < 1500) return false;
      lastSentRef.current[type] = now;
      return true;
    };

    const report = (type, details) => {
      if (!shouldSend(type)) return;
      // Fire user callback first for UI feedback
      if (onViolation) onViolation(type);
      setViolationCount((c) => {
        const next = c + 1;
        if (!thresholdHitRef.current && next >= threshold) {
          thresholdHitRef.current = true;
          if (onThreshold) onThreshold(next);
        }
        return next;
      });
      // Send to backend (non-blocking, errors swallowed in service)
      try { proctorService.logEvent({ type, page: window?.location?.pathname, details }); } catch {}
    };

    // Fullscreen change
    const handleFsChange = () => {
      const inFs = document.fullscreenElement != null;
      if (!inFs) report('fullscreen_exit');
    };

    // Visibility change (tab switch/minimize)
    const handleVisibility = () => {
      if (document.hidden) report('visibility_hidden');
      else report('visibility_visible');
    };

    // Copy/paste
    const handleCopy = () => report('copy');
    const handlePaste = () => report('paste');

    // Window focus/blur (covers cases where visibility doesn't flip, e.g., OS-level overlays)
    const handleBlur = () => report('window_blur');
    const handleFocus = () => report('window_focus');

    // Page lifecycle (Safari/iOS reliability)
    const handlePageHide = (e) => report('page_hide', { persisted: e?.persisted });
    const handlePageShow = (e) => report('page_show', { persisted: e?.persisted });

    // Heuristic: detect likely active extensions (best-effort, not definitive)
    const knownSelectorHints = [
      // Popular AI/composer overlays (keep conservative to avoid noise)
      '[data-gpt-overlay]',
      '.aiprm-root',
      '#perplexity-extension-root',
      '.merlin-extension-root',
      '.composeai-root',
      '.wordtune-floating-widget',
      '.cursor-extension-root',
      '[data-grammarly-part]', // note: Grammarly is common; treat as low confidence
      // Merlin broad selectors
      '[data-merlin]',
      '[id*="merlin"]',
      '[class*="merlin"]'
    ];

    const extSchemes = ['chrome-extension://', 'moz-extension://', 'safari-extension://'];

    const nodeHasExtensionUrl = (node) => {
      try {
        if (!node || !(node instanceof Element)) return false;
        // Check common URL-bearing attributes
        const attrs = ['src', 'href', 'data-src'];
        for (const attr of attrs) {
          const val = node.getAttribute?.(attr) || '';
          if (val && extSchemes.some(scheme => val.startsWith(scheme))) return true;
        }
        return false;
      } catch { return false; }
    };

    const deepScan = (root) => {
      try {
        if (!root) return { via_script: false, via_link: false, via_selector: false, via_iframe: false };
        const scripts = Array.from(root.querySelectorAll?.('script[src]') || []);
        const links = Array.from(root.querySelectorAll?.('link[href]') || []);
        const iframes = Array.from(root.querySelectorAll?.('iframe[src], webview[src]') || []);
        const via_script = scripts.some(s => nodeHasExtensionUrl(s));
        const via_link = links.some(l => nodeHasExtensionUrl(l));
        const via_iframe = iframes.some(f => nodeHasExtensionUrl(f));
        const via_selector = knownSelectorHints.some(sel => {
          try { return root.querySelector?.(sel) != null; } catch { return false; }
        });
        return { via_script, via_link, via_selector, via_iframe };
      } catch { return { via_script: false, via_link: false, via_selector: false, via_iframe: false }; }
    };

    const scanForExtensions = () => {
      if (extensionFlaggedRef.current && merlinFlaggedRef.current) return;
      try {
        const { via_script, via_link, via_selector, via_iframe } = deepScan(document);
        if (!extensionFlaggedRef.current && (via_script || via_link || via_selector || via_iframe)) {
          extensionFlaggedRef.current = true;
          report('extension_suspected', {
            via_script,
            via_link,
            via_selector,
            via_iframe
          });
        }
        // Merlin-specific detection: selectors/globals
        if (!merlinFlaggedRef.current) {
          const merlinSelectorHit = !!document.querySelector('[data-merlin], [id*="merlin"], [class*="merlin"]');
          let merlinGlobalHit = false;
          try {
            const keys = Object.getOwnPropertyNames(window);
            merlinGlobalHit = keys.some(k => /merlin/i.test(k));
          } catch {}
          if (merlinSelectorHit || merlinGlobalHit) {
            merlinFlaggedRef.current = true;
            report('extension_merlin_suspected', { via_selector: merlinSelectorHit || undefined, via_global: merlinGlobalHit || undefined });
          }
        }
      } catch {}
    };

    // Heuristic: sniff window messages that look like AI assistant orchestration
    const handleMessage = (event) => {
      if (extensionFlaggedRef.current && merlinFlaggedRef.current) return;
      try {
        const data = event?.data;
        if (!data) return;
        const str = typeof data === 'string' ? data : JSON.stringify(data);
        if (!str) return;
        const lower = str.toLowerCase();
        const markers = ['ai_assistant', 'prompt_injection', 'summarize_page', 'transcribe_content', 'extract_questions'];
        const merlinMarkers = ['merlin', 'merlin_extension', 'usemerlin'];
        const originStr = (event.origin || '').toLowerCase();
        const originLooksExtension = originStr.startsWith('chrome-extension://') || originStr.startsWith('moz-extension://') || originStr.startsWith('safari-extension://');

        if (!extensionFlaggedRef.current && (markers.some(m => lower.includes(m)) || originLooksExtension)) {
          extensionFlaggedRef.current = true;
          report('extension_suspected', { via_message: true, origin: event.origin || undefined });
        }
        if (!merlinFlaggedRef.current && (merlinMarkers.some(m => lower.includes(m)) || lower.includes('merlin'))) {
          merlinFlaggedRef.current = true;
          report('extension_merlin_suspected', { via_message: true, origin: event.origin || undefined });
        }
      } catch {}
    };

    // Observe DOM mutations to catch late-injected nodes from extensions
    try {
      moRef.current = new MutationObserver((mutations) => {
        if (extensionFlaggedRef.current && merlinFlaggedRef.current) return;
        for (const m of mutations) {
          if (extensionFlaggedRef.current && merlinFlaggedRef.current) break;
          if (m.type === 'childList') {
            for (const node of m.addedNodes) {
              if (!(node instanceof Element)) continue;
              const details = deepScan(node);
              if (nodeHasExtensionUrl(node) || details.via_script || details.via_link || details.via_iframe || details.via_selector) {
                extensionFlaggedRef.current = true;
                report('extension_suspected', {
                  via_direct_node: nodeHasExtensionUrl(node) || undefined,
                  ...details,
                  via_mutation: true
                });
                // continue checking for Merlin hints in same batch
              }
              // Scan shadow roots if present
              try {
                if (node.shadowRoot) {
                  const srDetails = deepScan(node.shadowRoot);
                  if (srDetails.via_script || srDetails.via_link || srDetails.via_iframe || srDetails.via_selector) {
                    extensionFlaggedRef.current = true;
                    report('extension_suspected', { ...srDetails, via_shadow_root: true, via_mutation: true });
                    // continue checking for Merlin hints
                  }
                }
              } catch {}
              // Merlin-specific: element names/attributes
              if (!merlinFlaggedRef.current) {
                try {
                  const isMerlinNode = node.matches?.('[data-merlin], [id*="merlin"], [class*="merlin"]');
                  if (isMerlinNode) {
                    merlinFlaggedRef.current = true;
                    report('extension_merlin_suspected', { via_selector: true, via_mutation: true });
                  }
                } catch {}
              }
            }
          }
        }
      });
      moRef.current.observe(document.documentElement || document, { childList: true, subtree: true });
    } catch {}

    document.addEventListener('fullscreenchange', handleFsChange);
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('copy', handleCopy);
    window.addEventListener('paste', handlePaste);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('pagehide', handlePageHide);
    window.addEventListener('pageshow', handlePageShow);
    window.addEventListener('message', handleMessage, true);

    // Periodic scan with a short backoff; stop once flagged
    const intervalId = window.setInterval(() => {
      if (extensionFlaggedRef.current && merlinFlaggedRef.current) { window.clearInterval(intervalId); return; }
      scanForExtensions();
    }, 1500);
    // Initial scan
    scanForExtensions();

    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('copy', handleCopy);
      window.removeEventListener('paste', handlePaste);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('pagehide', handlePageHide);
      window.removeEventListener('pageshow', handlePageShow);
      window.removeEventListener('message', handleMessage, true);
      try { window.clearInterval(intervalId); } catch {}
      try { moRef.current?.disconnect(); } catch {}
    };
  }, [enabled, threshold, onViolation, onThreshold]);

  return { violationCount };
}



