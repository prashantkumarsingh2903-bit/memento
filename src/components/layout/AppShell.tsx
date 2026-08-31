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
    <div className="min-h-screen bg-app-bg text-app-text flex flex-col md:flex-row transition-colors duration-200 antialiased selection:bg-[#6C4FF6]/20 selection:text-[#6C4FF6]">
      {/* Desktop Sidebar (Fixed / Sticky) */}
      <Sidebar
        activeView={activeView}
        onNavigate={onNavigate}
        onQuickCapture={handleQuickCapture}
        profile={profile}
        theme={theme}
        onThemeChange={onThemeChange}
      />

      {/* Main View Area with Floating White Workspace Card */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen pb-20 md:pb-4 md:py-3 md:pr-4 md:pl-1">
        {/* Header bar */}
        <Header
          activeView={activeView}
          onNavigate={onNavigate}
          onQuickCapture={handleQuickCapture}
        />

        {/* Floating White Main Workspace Container */}
        <div className="flex-1 w-full bg-white dark:bg-[#201F28] rounded-none md:rounded-[28px] shadow-none md:shadow-workspace border-0 md:border md:border-app-border overflow-hidden flex flex-col transition-all duration-200">
          <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-8 lg:px-10 py-6 sm:py-8 lg:py-10 animate-fade-in">
            {children}
          </main>
        </div>
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
