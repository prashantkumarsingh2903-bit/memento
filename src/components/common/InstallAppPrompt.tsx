import React, { useState, useEffect } from 'react';
import {
  Download,
  Smartphone,
  Share,
  PlusSquare,
  CheckCircle2,
  X,
  Sparkles,
  Zap,
} from 'lucide-react';
import { Button } from './Button';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const InstallAppPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Check if running as installed standalone PWA
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // Check if iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const iosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(iosDevice);

    // Listen for Chrome/Android install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for successful install
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      setShowModal(true);
    }
  };

  if (isInstalled) {
    return null; // Already installed, no need to display
  }

  return (
    <>
      {/* Install Button Trigger (used in sidebar or mobile header) */}
      <button
        type="button"
        onClick={handleInstallClick}
        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl bg-gradient-to-r from-[#6C4FF6]/10 to-[#D95CFF]/10 hover:from-[#6C4FF6]/20 hover:to-[#D95CFF]/20 border border-[#6C4FF6]/25 text-[#6C4FF6] dark:text-[#856DF8] font-sans text-xs font-bold transition-all shadow-subtle group cursor-pointer"
      >
        <div className="p-1.5 rounded-lg bg-[#6C4FF6] text-white shadow-soft group-hover:scale-105 transition-transform">
          <Download className="w-3.5 h-3.5" />
        </div>
        <div className="text-left flex-1">
          <span className="block text-app-text font-bold">Install Mobile App</span>
          <span className="block text-[10px] text-app-text-secondary font-normal">
            Download to Home Screen
          </span>
        </div>
        <Smartphone className="w-4 h-4 text-[#6C4FF6] opacity-70 group-hover:opacity-100 transition-opacity" />
      </button>

      {/* Guide Modal for iOS & All Devices */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-[#201F28] border border-app-border rounded-3xl max-w-md w-full p-6 shadow-elevated space-y-5 animate-slide-up relative">
            {/* Close Button */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-2 rounded-xl text-app-text-secondary hover:text-app-text hover:bg-app-surface-secondary dark:hover:bg-[#26252F] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#6C4FF6] text-white flex items-center justify-center shadow-soft">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-sans text-lg font-extrabold text-app-text">
                  Install Memento App
                </h3>
                <p className="text-xs text-app-text-secondary">
                  Works offline with native camera & mic
                </p>
              </div>
            </div>

            {/* Benefits Pills */}
            <div className="grid grid-cols-2 gap-2 text-[11px] text-app-text">
              <div className="flex items-center gap-1.5 p-2 rounded-xl bg-app-surface-secondary dark:bg-[#26252F] border border-app-border">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>100% Offline Access</span>
              </div>
              <div className="flex items-center gap-1.5 p-2 rounded-xl bg-app-surface-secondary dark:bg-[#26252F] border border-app-border">
                <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>Zero Latency Voice/Video</span>
              </div>
            </div>

            {/* Instructions based on platform */}
            {isIOS ? (
              <div className="space-y-3 bg-app-surface-secondary dark:bg-[#181721] p-4 rounded-2xl border border-app-border">
                <span className="text-xs font-bold uppercase tracking-wider text-[#6C4FF6] flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>iOS Safari Install Steps</span>
                </span>

                <ol className="space-y-3 text-xs text-app-text">
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#6C4FF6]/20 text-[#6C4FF6] font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      1
                    </span>
                    <div>
                      Tap the <strong className="text-app-text font-bold">Share</strong> button{' '}
                      <Share className="w-3.5 h-3.5 inline text-[#6C4FF6] mx-0.5" /> in Safari's bottom toolbar.
                    </div>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#6C4FF6]/20 text-[#6C4FF6] font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      2
                    </span>
                    <div>
                      Scroll down and select{' '}
                      <strong className="text-app-text font-bold">
                        Add to Home Screen
                      </strong>{' '}
                      <PlusSquare className="w-3.5 h-3.5 inline text-[#6C4FF6] mx-0.5" />.
                    </div>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#6C4FF6]/20 text-[#6C4FF6] font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      3
                    </span>
                    <div>
                      Tap <strong className="text-app-text font-bold">Add</strong> in the top right corner. Memento will now launch with full standalone experience!
                    </div>
                  </li>
                </ol>
              </div>
            ) : (
              <div className="space-y-3 bg-app-surface-secondary dark:bg-[#181721] p-4 rounded-2xl border border-app-border">
                <span className="text-xs font-bold uppercase tracking-wider text-[#6C4FF6] flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>Android & Desktop Install</span>
                </span>

                <p className="text-xs text-app-text leading-relaxed">
                  Tap the browser menu <strong className="font-bold">⋮</strong> (top right in Chrome) and select{' '}
                  <strong className="text-[#6C4FF6] font-bold">"Install App"</strong> or{' '}
                  <strong className="text-[#6C4FF6] font-bold">"Add to Home screen"</strong>.
                </p>
              </div>
            )}

            {/* Action Footer */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button onClick={() => setShowModal(false)}>
                Got it
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
