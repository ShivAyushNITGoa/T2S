import { useState, useEffect, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

let globalDeferredPrompt: BeforeInstallPromptEvent | null = null;
let isAppInstalled = false;
const listeners = new Set<() => void>();

function notifyListeners() {
  listeners.forEach((fn) => fn());
}

if (typeof window !== 'undefined') {
  // Check if already running in standalone PWA mode (Mobile or Desktop)
  const checkStandalone = () => {
    const standalone =
      window.matchMedia?.('(display-mode: standalone)').matches ||
      window.matchMedia?.('(display-mode: window-controls-overlay)').matches ||
      (window.navigator as any)?.standalone === true;
    if (standalone) {
      isAppInstalled = true;
    }
  };
  checkStandalone();

  window.addEventListener('beforeinstallprompt', (e: Event) => {
    e.preventDefault();
    globalDeferredPrompt = e as BeforeInstallPromptEvent;
    notifyListeners();
  });

  window.addEventListener('appinstalled', () => {
    isAppInstalled = true;
    globalDeferredPrompt = null;
    notifyListeners();
  });
}

export function usePwaInstall() {
  const [, setTick] = useState(0);
  const [showInstallGuideModal, setShowInstallGuideModal] = useState(false);

  useEffect(() => {
    const listener = () => setTick((t) => t + 1);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  const triggerInstall = useCallback(async (): Promise<'accepted' | 'dismissed' | 'manual'> => {
    if (globalDeferredPrompt) {
      try {
        await globalDeferredPrompt.prompt();
        const choice = await globalDeferredPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          globalDeferredPrompt = null;
          notifyListeners();
          return 'accepted';
        }
        return 'dismissed';
      } catch {
        setShowInstallGuideModal(true);
        return 'manual';
      }
    }
    setShowInstallGuideModal(true);
    return 'manual';
  }, []);

  const dismissPrompt = useCallback(() => {
    globalDeferredPrompt = null;
    notifyListeners();
  }, []);

  return {
    canPromptNatively: Boolean(globalDeferredPrompt),
    isInstalled: isAppInstalled,
    triggerInstall,
    dismissPrompt,
    showInstallGuideModal,
    setShowInstallGuideModal,
  };
}
