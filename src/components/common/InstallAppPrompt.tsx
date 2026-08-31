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
  Laptop,
  MoreVertical,
  Layers,
} from 'lucide-react';
import { Button } from './Button';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface InstallAppPromptProps {
  variant?: 'button' | 'sidebar' | 'header' | 'inline';
  className?: string;
}

export const InstallAppPrompt: React.FC<InstallAppPromptProps> = ({
  variant = 'sidebar',
  className = '',
}) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [activeTab, setActiveTab] = useState<'ios' | 'android' | 'desktop'>('android');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Check if running as installed standalone PWA
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
      document.referrer.includes('android-app://');

    if (isStandalone) {
      setIsInstalled(true);
    }

    // Detect device platform
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    const isAndroidDevice = /android/.test(userAgent);

    if (isIOSDevice) {
      setActiveTab('ios');
    } else if (isAndroidDevice) {
      setActiveTab('android');
    } else {
      setActiveTab('desktop');
    }

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

  const handleInstallClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          setDeferredPrompt(null);
          setIsInstalled(true);
        }
      } catch (err) {
        console.error('Install prompt error:', err);
        setShowModal(true);
      }
    } else {
      // Open step-by-step visual install modal for iOS, Android, and Desktop
      setShowModal(true);
    }
  };

  return (
    <>
      {/* 1. Header Variant (Compact for Mobile & Desktop Header) */}
      {variant === 'header' ? (
        <button
          type="button"
          onClick={handleInstallClick}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F1EEFF] dark:bg-[#6C4FF6]/18 hover:bg-[#6C4FF6]/25 text-[#6C4FF6] dark:text-[#856DF8] border border-[#6C4FF6]/30 text-xs font-bold transition-all shadow-subtle cursor-pointer ${className}`}
          title="Install Memento on your phone or desktop"
        >
          <Download className="w-3.5 h-3.5 text-[#6C4FF6] dark:text-[#856DF8]" />
          <span>Install App</span>
        </button>
      ) : variant === 'inline' ? (
        /* 2. Inline Action Button */
        <Button
          onClick={handleInstallClick}
          className={className}
          leftIcon={<Download className="w-4 h-4" />}
        >
          {deferredPrompt ? 'Install App' : 'Download / Install App'}
        </Button>
      ) : (
        /* 3. Sidebar / Standard Card Variant */
        <button
          type="button"
          onClick={handleInstallClick}
          className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-[#6C4FF6]/10 to-[#D95CFF]/10 hover:from-[#6C4FF6]/20 hover:to-[#D95CFF]/20 border border-[#6C4FF6]/25 text-[#6C4FF6] dark:text-[#856DF8] font-sans text-xs font-bold transition-all shadow-subtle group cursor-pointer ${className}`}
        >
          <div className="p-1.5 rounded-lg bg-[#6C4FF6] text-white shadow-soft group-hover:scale-105 transition-transform">
            <Download className="w-3.5 h-3.5" />
          </div>
          <div className="text-left flex-1 min-w-0">
            <span className="block text-app-text font-bold truncate">
              {isInstalled ? 'App Installed' : 'Install Mobile App'}
            </span>
            <span className="block text-[10px] text-app-text-secondary font-normal truncate">
              {isInstalled ? 'Offline Ready' : 'Download to Home Screen'}
            </span>
          </div>
          <Smartphone className="w-4 h-4 text-[#6C4FF6] opacity-70 group-hover:opacity-100 transition-opacity shrink-0" />
        </button>
      )}

      {/* ========================================================================= */}
      {/* Visual Step-by-Step Installation Modal                                   */}
      {/* ========================================================================= */}
      {showModal && (
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white dark:bg-[#201F28] border border-app-border rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-elevated space-y-5 animate-slide-up relative text-left"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-2 rounded-xl text-app-text-muted hover:text-app-text hover:bg-app-surface-secondary dark:hover:bg-[#26252F] cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#6C4FF6] text-white flex items-center justify-center shadow-soft shrink-0">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-sans text-lg sm:text-xl font-extrabold text-app-text">
                  Install Memento App
                </h3>
                <p className="text-xs text-app-text-secondary">
                  Native full-screen app • 100% Offline with IndexedDB
                </p>
              </div>
            </div>

            {/* Platform Selector Tabs */}
            <div className="flex items-center p-1 rounded-xl bg-app-surface-secondary dark:bg-[#181721] border border-app-border">
              <button
                type="button"
                onClick={() => setActiveTab('android')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'android'
                    ? 'bg-white dark:bg-[#201F28] text-[#6C4FF6] dark:text-[#856DF8] shadow-subtle'
                    : 'text-app-text-secondary hover:text-app-text'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Android</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('ios')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'ios'
                    ? 'bg-white dark:bg-[#201F28] text-[#6C4FF6] dark:text-[#856DF8] shadow-subtle'
                    : 'text-app-text-secondary hover:text-app-text'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>iPhone / iPad</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('desktop')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'desktop'
                    ? 'bg-white dark:bg-[#201F28] text-[#6C4FF6] dark:text-[#856DF8] shadow-subtle'
                    : 'text-app-text-secondary hover:text-app-text'
                }`}
              >
                <Laptop className="w-3.5 h-3.5" />
                <span>Mac / PC</span>
              </button>
            </div>

            {/* Tab 1: Android Instructions */}
            {activeTab === 'android' && (
              <div className="space-y-3 bg-app-surface-secondary dark:bg-[#181721] p-4 sm:p-5 rounded-2xl border border-app-border">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#6C4FF6] flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Android Chrome / Brave / Edge</span>
                  </span>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                    Recommended
                  </span>
                </div>

                <ol className="space-y-3 text-xs text-app-text">
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#6C4FF6] text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      1
                    </span>
                    <div>
                      Tap the <strong className="text-app-text font-bold">Three Dots menu</strong>{' '}
                      <MoreVertical className="w-3.5 h-3.5 inline text-[#6C4FF6] mx-0.5" /> in Chrome's top right corner.
                    </div>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#6C4FF6] text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      2
                    </span>
                    <div>
                      Select{' '}
                      <strong className="text-[#6C4FF6] dark:text-[#856DF8] font-bold">
                        "Install App"
                      </strong>{' '}
                      or{' '}
                      <strong className="text-app-text font-bold">
                        "Add to Home screen"
                      </strong>.
                    </div>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#6C4FF6] text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      3
                    </span>
                    <div>
                      Tap <strong className="text-app-text font-bold">Install</strong>. Memento will appear in your app drawer with native camera and microphone support!
                    </div>
                  </li>
                </ol>

                {deferredPrompt && (
                  <div className="pt-2">
                    <Button
                      onClick={handleInstallClick}
                      className="w-full"
                      leftIcon={<Download className="w-4 h-4" />}
                    >
                      Trigger Direct Install Prompt
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: iOS Safari Instructions */}
            {activeTab === 'ios' && (
              <div className="space-y-3 bg-app-surface-secondary dark:bg-[#181721] p-4 sm:p-5 rounded-2xl border border-app-border">
                <span className="text-xs font-bold uppercase tracking-wider text-[#6C4FF6] flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>iOS Safari Install Steps</span>
                </span>

                <ol className="space-y-3 text-xs text-app-text">
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#6C4FF6] text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      1
                    </span>
                    <div>
                      Open in <strong className="text-app-text font-bold">Safari</strong> and tap the{' '}
                      <strong className="text-[#6C4FF6] font-bold">Share</strong> button{' '}
                      <Share className="w-3.5 h-3.5 inline text-[#6C4FF6] mx-0.5" /> in the bottom toolbar.
                    </div>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#6C4FF6] text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      2
                    </span>
                    <div>
                      Scroll down and tap{' '}
                      <strong className="text-[#6C4FF6] dark:text-[#856DF8] font-bold">
                        "Add to Home Screen"
                      </strong>{' '}
                      <PlusSquare className="w-3.5 h-3.5 inline text-[#6C4FF6] mx-0.5" />.
                    </div>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#6C4FF6] text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      3
                    </span>
                    <div>
                      Tap <strong className="text-app-text font-bold">Add</strong> in the top right. The app will launch in pure full-screen mode!
                    </div>
                  </li>
                </ol>
              </div>
            )}

            {/* Tab 3: Desktop Instructions */}
            {activeTab === 'desktop' && (
              <div className="space-y-3 bg-app-surface-secondary dark:bg-[#181721] p-4 sm:p-5 rounded-2xl border border-app-border">
                <span className="text-xs font-bold uppercase tracking-wider text-[#6C4FF6] flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Desktop Chrome, Edge & Brave</span>
                </span>

                <ol className="space-y-3 text-xs text-app-text">
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#6C4FF6] text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      1
                    </span>
                    <div>
                      Look at the right side of the browser's address bar (URL bar).
                    </div>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#6C4FF6] text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      2
                    </span>
                    <div>
                      Click the <strong className="text-[#6C4FF6] font-bold">Install</strong> icon{' '}
                      <Download className="w-3.5 h-3.5 inline text-[#6C4FF6] mx-0.5" /> or select{' '}
                      <strong className="text-app-text font-bold">Menu → Install Memento</strong>.
                    </div>
                  </li>
                </ol>

                {deferredPrompt && (
                  <div className="pt-2">
                    <Button
                      onClick={handleInstallClick}
                      className="w-full"
                      leftIcon={<Download className="w-4 h-4" />}
                    >
                      Install Memento on this PC
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Benefits */}
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="flex items-center gap-1.5 p-2 rounded-xl bg-app-surface-secondary dark:bg-[#181721] border border-app-border text-app-text">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>100% Offline Storage</span>
              </div>
              <div className="flex items-center gap-1.5 p-2 rounded-xl bg-app-surface-secondary dark:bg-[#181721] border border-app-border text-app-text">
                <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>Zero Latency Voice/Video</span>
              </div>
            </div>

            {/* Action Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-app-border">
              <span className="text-[11px] text-app-text-secondary flex items-center gap-1">
                <Layers className="w-3 h-3 text-[#6C4FF6]" />
                <span>Runs securely on your device</span>
              </span>
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
