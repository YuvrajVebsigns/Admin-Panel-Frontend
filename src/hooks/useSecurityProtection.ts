'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/auth.store';
import { authService } from '@/services/auth.service';

interface SecurityState {
  isDevToolsOpen: boolean;
  isBlurred: boolean;
  screenshotWarning: boolean;
  dismissBlurOverlay: () => void;
}

/**
 * Checks whether the current page is a creation/add page.
 */
const isCreationPage = (): boolean => {
  if (typeof window === 'undefined') return false;
  const pathname = window.location.pathname.toLowerCase();

  const creationKeywords = ['/create', '/new', '/add'];
  if (creationKeywords.some((keyword) => pathname.includes(keyword))) {
    return true;
  }

  if (typeof document !== 'undefined') {
    const hasCreateForm = !!document.querySelector(
      '[data-create-page], .create-page, .creation-form, form[data-type="create"]',
    );
    if (hasCreateForm) return true;
  }

  return false;
};

/**
 * Checks whether the current active page contains a data table or is a view/details page.
 * Returns false for creation pages so that the overlay is never displayed on creation routes.
 */
const checkIsDataTableOrViewPage = (): boolean => {
  if (typeof window === 'undefined' || typeof document === 'undefined') return false;

  // STRICT RULE: Never trigger security overlay on creation/add pages
  if (isCreationPage()) return false;

  // 1. Check URL pathname for view sub-routes
  const pathname = window.location.pathname.toLowerCase();

  const viewKeywords = ['/view', '/details', '/preview'];
  if (viewKeywords.some((keyword) => pathname.includes(keyword))) return true;

  // 2. Check DOM for tables, datatable wrappers, or view container elements
  const hasTableElement = !!document.querySelector(
    'table, [role="table"], .data-table, [data-datatable], .table-container, .table-responsive',
  );
  if (hasTableElement) return true;

  const hasViewElement = !!document.querySelector(
    '[data-view-page], [class*="View"], [class*="view"], [class*="Details"], [class*="details"], [class*="Preview"], [class*="preview"]',
  );
  if (hasViewElement) return true;

  // 3. Check exact module list page routes & main dashboard home routes
  const datatableRoutes = [
    '/',
    '/dashboard',
    '/events',
    '/blogs',
    '/contacts',
    '/sponsors',
    '/nominators',
    '/nominees',
    '/registrations',
    '/media',
    '/attendance',
    '/reports',
    '/roles-permission',
    '/sidebar-menu',
    '/system-user',
    '/websites',
    '/deployments',
    '/communications',
  ];

  if (datatableRoutes.some((route) => pathname === route || pathname === `${route}/`)) return true;

  return false;
};

export function useSecurityProtection(): SecurityState {
  const [isDevToolsOpen, setIsDevToolsOpen] = useState<boolean>(false);
  const [isBlurred, setIsBlurred] = useState<boolean>(false);
  const [screenshotWarning, setScreenshotWarning] = useState<boolean>(false);
  const warningTimerRef = useRef<NodeJS.Timeout | null>(null);

  const dismissBlurOverlay = useCallback(() => {
    setIsBlurred(false);
  }, []);

  // Helper to clear system clipboard
  const clearClipboard = useCallback(() => {
    if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(
          'Security Policy: Screenshot and clipboard exports are restricted on Admin Panel.',
        )
        .catch(() => {
          // Ignore permission denial silently
        });
    }
  }, []);

  // Trigger screenshot warning banner, obscure screen & automatically logout user
  const triggerScreenshotWarning = useCallback(() => {
    setScreenshotWarning(true);
    setIsBlurred(true);
    clearClipboard();

    toast.error(
      'SECURITY VIOLATION: Screenshot detected! Your account has been disabled and administrator notified.',
      {
        id: 'screenshot-logout-toast',
        duration: 5000,
      },
    );

    // Call backend API to disable account and fire notification email to admin
    authService.reportScreenshotViolation().catch(() => {
      // Continue client logout silently even if network request fails
    });

    // Instantly clear authentication store & cookies
    useAuthStore.getState().clearAuth();

    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current);
    }

    // Redirect user to login page after brief display of security overlay
    warningTimerRef.current = setTimeout(() => {
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }, 600);
  }, [clearClipboard]);

  // 1. Right-click context menu prevention (Always active)
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      clearClipboard();
      toast.error('Right-click context menu is disabled for security reasons.', {
        id: 'context-menu-disabled-toast',
        duration: 3000,
      });
    };

    document.addEventListener('contextmenu', handleContextMenu, true);
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu, true);
    };
  }, [clearClipboard]);

  // 2. Keyboard shortcut prevention (PrintScreen, Snipping tool, Save, Print, DevTools)
  useEffect(() => {
    const isPrintScreenKey = (e: KeyboardEvent) => {
      const key = e.key ? e.key.toLowerCase() : '';
      const code = e.code ? e.code.toLowerCase() : '';
      const keyCode = e.keyCode || e.which;

      return (
        keyCode === 44 ||
        key === 'printscreen' ||
        key === 'prtsc' ||
        key === 'prtscn' ||
        key === 'snapshot' ||
        code === 'printscreen' ||
        key === 'sysrq'
      );
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key ? e.key.toLowerCase() : '';
      const code = e.code ? e.code.toLowerCase() : '';

      // Check PrintScreen keydown
      if (isPrintScreenKey(e)) {
        e.preventDefault();
        e.stopPropagation();
        triggerScreenshotWarning();
        return;
      }

      // Windows Snipping Tool (Win + Shift + S) or Cmd + Shift + S
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && (key === 's' || code === 'keys')) {
        e.preventDefault();
        e.stopPropagation();
        triggerScreenshotWarning();
        return;
      }

      // macOS screenshot shortcuts (Cmd + Shift + 3, Cmd + Shift + 4, Cmd + Shift + 5)
      if (
        e.metaKey &&
        e.shiftKey &&
        ['3', '4', '5', 'digit3', 'digit4', 'digit5'].includes(key || code)
      ) {
        e.preventDefault();
        e.stopPropagation();
        triggerScreenshotWarning();
        return;
      }

      // Print shortcut (Ctrl+P / Cmd+P)
      if ((e.ctrlKey || e.metaKey) && key === 'p') {
        e.preventDefault();
        e.stopPropagation();
        clearClipboard();
        toast.error('Printing dashboard pages is prohibited.', {
          id: 'print-prohibited-toast',
        });
        return;
      }

      // Save webpage (Ctrl+S / Cmd+S)
      if ((e.ctrlKey || e.metaKey) && key === 's') {
        e.preventDefault();
        e.stopPropagation();
        clearClipboard();
        toast.error('Saving admin panel pages is disabled.', {
          id: 'save-prohibited-toast',
        });
        return;
      }

      // View Source (Ctrl+U / Cmd+U)
      if ((e.ctrlKey || e.metaKey) && key === 'u') {
        e.preventDefault();
        e.stopPropagation();
        toast.error('Source view is restricted.', {
          id: 'source-prohibited-toast',
        });
        return;
      }

      // DevTools shortcuts (F12, Ctrl+Shift+I/J/C, Cmd+Option+I/J/C)
      if (
        key === 'f12' ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && ['i', 'j', 'c'].includes(key)) ||
        (e.metaKey && e.altKey && ['i', 'j', 'c'].includes(key))
      ) {
        e.preventDefault();
        e.stopPropagation();
        toast.error('Developer Tools shortcuts are disabled.', {
          id: 'devtools-shortcut-toast',
        });
        return;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (isPrintScreenKey(e)) {
        e.preventDefault();
        e.stopPropagation();
        triggerScreenshotWarning();
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('keyup', handleKeyUp, true);

    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('keyup', handleKeyUp, true);
    };
  }, [triggerScreenshotWarning, clearClipboard]);

  // 3. Window blur / focus / visibility change detection (Targeted ONLY to DataTables and View pages)
  useEffect(() => {
    const handleBlur = () => {
      if (checkIsDataTableOrViewPage()) {
        setIsBlurred(true);
        clearClipboard();
      }
    };

    const handleFocus = () => {
      setIsBlurred(false);
    };

    const handleVisibilityChange = () => {
      if (document.hidden || document.visibilityState === 'hidden') {
        if (checkIsDataTableOrViewPage()) {
          setIsBlurred(true);
          clearClipboard();
        }
      } else {
        setIsBlurred(false);
      }
    };

    window.addEventListener('blur', handleBlur, true);
    window.addEventListener('focus', handleFocus, true);
    document.addEventListener('visibilitychange', handleVisibilityChange, true);

    return () => {
      window.removeEventListener('blur', handleBlur, true);
      window.removeEventListener('focus', handleFocus, true);
      document.removeEventListener('visibilitychange', handleVisibilityChange, true);
    };
  }, [clearClipboard]);

  // 4. Hide blur overlay on mouse click anywhere on the page or overlay
  useEffect(() => {
    if (!isBlurred) return;

    const handleMouseClick = () => {
      setIsBlurred(false);
    };

    window.addEventListener('click', handleMouseClick, true);
    window.addEventListener('mousedown', handleMouseClick, true);

    return () => {
      window.removeEventListener('click', handleMouseClick, true);
      window.removeEventListener('mousedown', handleMouseClick, true);
    };
  }, [isBlurred]);

  // 5. Mouse leave (cursor exits window) and mouse enter (cursor returns into window) detection
  useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      if (
        !e.relatedTarget ||
        e.clientY <= 0 ||
        e.clientX <= 0 ||
        e.clientX >= window.innerWidth ||
        e.clientY >= window.innerHeight
      ) {
        if (checkIsDataTableOrViewPage()) {
          setIsBlurred(true);
          clearClipboard();
        }
      }
    };

    const handleMouseEnter = () => {
      setIsBlurred(false);
    };

    const handleMouseMove = () => {
      setIsBlurred((prev) => {
        if (prev) return false;
        return prev;
      });
    };

    document.addEventListener('mouseleave', handleMouseLeave, true);
    document.addEventListener('mouseenter', handleMouseEnter, true);
    window.addEventListener('mouseout', handleMouseLeave, true);
    window.addEventListener('mouseover', handleMouseEnter, true);
    window.addEventListener('mousemove', handleMouseMove, true);

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave, true);
      document.removeEventListener('mouseenter', handleMouseEnter, true);
      window.removeEventListener('mouseout', handleMouseLeave, true);
      window.removeEventListener('mouseover', handleMouseEnter, true);
      window.removeEventListener('mousemove', handleMouseMove, true);
    };
  }, [clearClipboard]);

  // 5. DevTools detection logic
  useEffect(() => {
    const threshold = 160;

    const checkDevTools = () => {
      // Test 1: Window Dimension Delta Check (handles docked DevTools)
      const widthThreshold = window.outerWidth - window.innerWidth > threshold;
      const heightThreshold = window.outerHeight - window.innerHeight > threshold;

      let detected = widthThreshold || heightThreshold;

      // Test 2: Timing / Debugger check
      if (!detected) {
        const start = performance.now();
        const fn = new Function('debugger');
        fn();
        const end = performance.now();
        if (end - start > 100) {
          detected = true;
        }
      }

      setIsDevToolsOpen(detected);
    };

    const intervalId = setInterval(checkDevTools, 1000);
    window.addEventListener('resize', checkDevTools);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('resize', checkDevTools);
    };
  }, []);

  // 6. Continuous Debugger Trap loop when DevTools is open
  useEffect(() => {
    if (!isDevToolsOpen) return;

    const trapInterval = setInterval(() => {
      try {
        const fn = new Function('debugger');
        fn();
      } catch (err) {
        // Silently ignore execution error
      }
    }, 300);

    return () => {
      clearInterval(trapInterval);
    };
  }, [isDevToolsOpen]);

  return {
    isDevToolsOpen,
    isBlurred,
    screenshotWarning,
    dismissBlurOverlay,
  };
}
