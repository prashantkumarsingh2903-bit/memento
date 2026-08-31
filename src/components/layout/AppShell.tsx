import React, { useState } from 'react';
import type { ActiveView, EntryType, ToastMessage, UserProfile } from '../../types';
import { Sidebar } from './Sidebar';
import { BottomNavigation } from './BottomNavigation';
import { Header } from './Header';
import { CaptureMenu } from '../common/CaptureMenu';
import { ToastContainer } from '../common/Toast';

interface AppShellProps {
  activeView: ActiveView;
  onNavigate: (view: ActiveView) => void;
  onStartCapture: (type: EntryType) => void;
  profile: UserProfile;
  theme: 'light' | 'dark' | 'system';
  onThemeChange: (theme: 'light' | 'dark' | 'system') => void;
  toasts: ToastMessage[];
  onDismissToast: (id: string) => void;
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({
  activeView,
  onNavigate,
  onStartCapture,
  profile,
  theme,
  onThemeChange,
  toasts,
  onDismissToast,
  children,
}) => {
  const [isCaptureMenuOpen, setIsCaptureMenuOpen] = useState(false);

  const handleQuickCapture = () => {
    setIsCaptureMenuOpen(true);
  };

  const handleSelectType = (type: EntryType) => {
    onStartCapture(type);
  };

  return (
    <div className="min-h-screen bg-warm-bg text-warm-text flex flex-col md:flex-row transition-colors duration-200">
      {/* Desktop Sidebar */}
      <Sidebar
        activeView={activeView}
        onNavigate={onNavigate}
        onQuickCapture={handleQuickCapture}
        profile={profile}
        theme={theme}
        onThemeChange={onThemeChange}
      />

      {/* Main View Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen pb-20 md:pb-8">
        <Header
          activeView={activeView}
          onNavigate={onNavigate}
          onQuickCapture={handleQuickCapture}
        />

        <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-8 py-6 sm:py-8 animate-fade-in">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNavigation
        activeView={activeView}
        onNavigate={onNavigate}
        onQuickCapture={handleQuickCapture}
      />

      {/* Global Capture Menu Modal */}
      <CaptureMenu
        isOpen={isCaptureMenuOpen}
        onClose={() => setIsCaptureMenuOpen(false)}
        onSelectType={handleSelectType}
      />

      {/* Global Toast Container */}
      <ToastContainer toasts={toasts} onDismiss={onDismissToast} />
    </div>
  );
};
