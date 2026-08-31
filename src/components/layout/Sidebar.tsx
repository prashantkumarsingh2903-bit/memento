import React from 'react';
import {
  Compass,
  BookOpen,
  Sparkles,
  BarChart3,
  Settings,
  HelpCircle,
  Moon,
  Sun,
  Laptop,
  ChevronDown,
  PenLine,
  Mic,
  Video,
  Camera,
} from 'lucide-react';
import type { ActiveView, EntryType, UserProfile } from '../../types';
import { InstallAppPrompt } from '../common/InstallAppPrompt';

interface SidebarProps {
  activeView: ActiveView;
  onNavigate: (view: ActiveView) => void;
  onQuickCapture: () => void;
  onStartCapture?: (type: EntryType) => void;
  profile: UserProfile;
  theme: 'light' | 'dark' | 'system';
  onThemeChange: (theme: 'light' | 'dark' | 'system') => void;
  onOpenHelp?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onNavigate,
  onQuickCapture,
  onStartCapture,
  profile,
  theme,
  onThemeChange,
  onOpenHelp,
}) => {
  const cycleTheme = () => {
    if (theme === 'light') onThemeChange('dark');
    else if (theme === 'dark') onThemeChange('system');
    else onThemeChange('light');
  };

  const displayName = profile.name?.trim() ? profile.name.trim().split(' ')[0] : 'Prashant';
  const initials = profile.name
    ? profile.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'ME';

  return (
    <aside className="hidden md:flex flex-col w-64 lg:w-[268px] h-screen sticky top-0 py-6 px-4 shrink-0 select-none bg-transparent justify-between overflow-y-auto">
      {/* Top Section */}
      <div className="space-y-6">
        {/* Brand / Logo */}
        <div className="flex items-center justify-between px-2">
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2.5 text-left group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-[#6C4FF6] flex items-center justify-center shadow-subtle group-hover:scale-105 transition-transform">
              <span className="font-sans font-bold text-white text-sm tracking-tight">
                M
              </span>
            </div>
            <div>
              <h1 className="font-sans text-base font-bold tracking-tight text-app-text">
                MEMENTO
              </h1>
            </div>
          </button>

          {/* Theme quick toggle */}
          <button
            onClick={cycleTheme}
            className="p-1.5 rounded-xl text-app-text-muted hover:text-app-text hover:bg-white/80 dark:hover:bg-[#201F28] transition-colors cursor-pointer"
            title={`Theme: ${theme}`}
          >
            {theme === 'light' && <Sun className="w-4 h-4 text-amber-500" />}
            {theme === 'dark' && <Moon className="w-4 h-4 text-[#856DF8]" />}
            {theme === 'system' && <Laptop className="w-4 h-4 text-app-text-muted" />}
          </button>
        </div>

        {/* Navigation Sections */}
        <div className="space-y-5">
          {/* CATEGORY 1: INPUT & CAPTURE */}
          <div className="space-y-1">
            <div className="px-3.5 pb-1 flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-app-text-muted">
                Input & Capture
              </span>
              <span className="text-[9px] font-semibold text-[#6C4FF6] bg-[#F1EEFF] dark:bg-[#6C4FF6]/20 px-1.5 py-0.5 rounded">
                Inputs
              </span>
            </div>

            {/* Overview / Home */}
            <button
              onClick={() => onNavigate('home')}
              className={`relative w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-150 text-left cursor-pointer ${
                activeView === 'home'
                  ? 'bg-[#F1EEFF] dark:bg-[#6C4FF6]/18 text-[#6C4FF6] dark:text-[#856DF8] font-semibold'
                  : 'text-app-text-secondary hover:text-app-text hover:bg-white/60 dark:hover:bg-[#201F28]/60'
              }`}
            >
              <Compass
                className={`w-4 h-4 shrink-0 transition-transform ${
                  activeView === 'home' ? 'text-[#6C4FF6] dark:text-[#856DF8] scale-105' : 'text-app-text-muted'
                }`}
              />
              <span>Overview Hub</span>
              {activeView === 'home' && (
                <span className="absolute right-1 top-2 bottom-2 w-1 bg-[#6C4FF6] rounded-full" />
              )}
            </button>

            {/* Write Note */}
            <button
              onClick={() => (onStartCapture ? onStartCapture('text') : onQuickCapture())}
              className={`relative w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-150 text-left cursor-pointer group ${
                activeView === 'new-entry'
                  ? 'bg-[#F1EEFF] dark:bg-[#6C4FF6]/18 text-[#6C4FF6] dark:text-[#856DF8] font-semibold'
                  : 'text-app-text-secondary hover:text-app-text hover:bg-white/60 dark:hover:bg-[#201F28]/60'
              }`}
            >
              <PenLine className="w-4 h-4 shrink-0 text-cyan-600 dark:text-cyan-400 group-hover:scale-110 transition-transform" />
              <span>Write Note</span>
            </button>

            {/* Voice Journal */}
            <button
              onClick={() => (onStartCapture ? onStartCapture('voice') : onQuickCapture())}
              className="relative w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium text-app-text-secondary hover:text-app-text hover:bg-white/60 dark:hover:bg-[#201F28]/60 transition-all duration-150 text-left cursor-pointer group"
            >
              <Mic className="w-4 h-4 shrink-0 text-[#6C4FF6] dark:text-[#856DF8] group-hover:scale-110 transition-transform" />
              <span>Voice Journal</span>
              <span className="ml-auto text-[10px] text-app-text-muted font-mono bg-app-surface-secondary dark:bg-[#26252F] px-1.5 py-0.5 rounded">
                Live STT
              </span>
            </button>

            {/* Video Journal */}
            <button
              onClick={() => (onStartCapture ? onStartCapture('video') : onQuickCapture())}
              className="relative w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium text-app-text-secondary hover:text-app-text hover:bg-white/60 dark:hover:bg-[#201F28]/60 transition-all duration-150 text-left cursor-pointer group"
            >
              <Video className="w-4 h-4 shrink-0 text-fuchsia-500 group-hover:scale-110 transition-transform" />
              <span>Video Journal</span>
            </button>

            {/* Photo Memory */}
            <button
              onClick={() => (onStartCapture ? onStartCapture('photo') : onQuickCapture())}
              className="relative w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium text-app-text-secondary hover:text-app-text hover:bg-white/60 dark:hover:bg-[#201F28]/60 transition-all duration-150 text-left cursor-pointer group"
            >
              <Camera className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
              <span>Photo Story</span>
            </button>
          </div>

          {/* CATEGORY 2: REPORTS & INTELLIGENCE */}
          <div className="space-y-1">
            <div className="px-3.5 pb-1 flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-app-text-muted">
                Reports & Analytics
              </span>
              <span className="text-[9px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded">
                Reports
              </span>
            </div>

            {/* Journal Archive & Timeline */}
            <button
              onClick={() => onNavigate('journal')}
              className={`relative w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-150 text-left cursor-pointer ${
                activeView === 'journal' || activeView === 'entry-detail'
                  ? 'bg-[#F1EEFF] dark:bg-[#6C4FF6]/18 text-[#6C4FF6] dark:text-[#856DF8] font-semibold'
                  : 'text-app-text-secondary hover:text-app-text hover:bg-white/60 dark:hover:bg-[#201F28]/60'
              }`}
            >
              <BookOpen
                className={`w-4 h-4 shrink-0 transition-transform ${
                  activeView === 'journal' || activeView === 'entry-detail'
                    ? 'text-[#6C4FF6] dark:text-[#856DF8] scale-105'
                    : 'text-app-text-muted'
                }`}
              />
              <span>Journal Timeline</span>
              {(activeView === 'journal' || activeView === 'entry-detail') && (
                <span className="absolute right-1 top-2 bottom-2 w-1 bg-[#6C4FF6] rounded-full" />
              )}
            </button>

            {/* Personal Analytics */}
            <button
              onClick={() => onNavigate('insights')}
              className={`relative w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-150 text-left cursor-pointer ${
                activeView === 'insights'
                  ? 'bg-[#F1EEFF] dark:bg-[#6C4FF6]/18 text-[#6C4FF6] dark:text-[#856DF8] font-semibold'
                  : 'text-app-text-secondary hover:text-app-text hover:bg-white/60 dark:hover:bg-[#201F28]/60'
              }`}
            >
              <BarChart3
                className={`w-4 h-4 shrink-0 transition-transform ${
                  activeView === 'insights' ? 'text-[#6C4FF6] dark:text-[#856DF8] scale-105' : 'text-app-text-muted'
                }`}
              />
              <span>Analytics & Trends</span>
              {activeView === 'insights' && (
                <span className="absolute right-1 top-2 bottom-2 w-1 bg-[#6C4FF6] rounded-full" />
              )}
            </button>

            {/* AI Reflection Summaries */}
            <button
              onClick={() => onNavigate('reflect')}
              className={`relative w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-150 text-left cursor-pointer ${
                activeView === 'reflect'
                  ? 'bg-[#F1EEFF] dark:bg-[#6C4FF6]/18 text-[#6C4FF6] dark:text-[#856DF8] font-semibold'
                  : 'text-app-text-secondary hover:text-app-text hover:bg-white/60 dark:hover:bg-[#201F28]/60'
              }`}
            >
              <Sparkles
                className={`w-4 h-4 shrink-0 transition-transform ${
                  activeView === 'reflect' ? 'text-[#6C4FF6] dark:text-[#856DF8] scale-105' : 'text-app-text-muted'
                }`}
              />
              <span>AI Reflections</span>
              {activeView === 'reflect' && (
                <span className="absolute right-1 top-2 bottom-2 w-1 bg-[#6C4FF6] rounded-full" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Section: Preferences & Profile */}
      <div className="space-y-3 pt-4 border-t border-app-border/70">
        {/* Install Mobile App Trigger */}
        <div>
          <InstallAppPrompt />
        </div>

        {/* Settings & Help */}
        <div className="space-y-0.5">
          <button
            onClick={() => onNavigate('settings')}
            className={`relative w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-150 text-left cursor-pointer ${
              activeView === 'settings'
                ? 'bg-[#F1EEFF] dark:bg-[#6C4FF6]/18 text-[#6C4FF6] dark:text-[#856DF8] font-semibold'
                : 'text-app-text-secondary hover:text-app-text hover:bg-white/60 dark:hover:bg-[#201F28]/60'
            }`}
          >
            <Settings
              className={`w-4 h-4 shrink-0 ${
                activeView === 'settings' ? 'text-[#6C4FF6] dark:text-[#856DF8]' : 'text-app-text-muted'
              }`}
            />
            <span>Settings & Backup</span>
            {activeView === 'settings' && (
              <span className="absolute right-1 top-2 bottom-2 w-1 bg-[#6C4FF6] rounded-full" />
            )}
          </button>

          <button
            onClick={onOpenHelp || (() => onNavigate('settings'))}
            className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium text-app-text-secondary hover:text-app-text hover:bg-white/60 dark:hover:bg-[#201F28]/60 transition-all duration-150 text-left cursor-pointer"
          >
            <HelpCircle className="w-4 h-4 shrink-0 text-app-text-muted" />
            <span>Help & Privacy</span>
          </button>
        </div>

        {/* User Profile Card */}
        <button
          onClick={() => onNavigate('settings')}
          className="w-full flex items-center gap-2.5 p-2 rounded-2xl bg-white/80 dark:bg-[#201F28]/80 hover:bg-white dark:hover:bg-[#201F28] border border-app-border/80 transition-all text-left shadow-subtle group cursor-pointer"
        >
          {profile.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt={profile.name}
              className="w-8 h-8 rounded-full object-cover border border-app-border shrink-0 group-hover:scale-105 transition-transform"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-[#F1EEFF] dark:bg-[#6C4FF6]/20 text-[#6C4FF6] font-semibold text-xs flex items-center justify-center border border-[#6C4FF6]/20 shrink-0">
              {initials}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-app-text truncate">
              {displayName}
            </p>
            <p className="text-[10px] text-app-text-secondary truncate">
              Personal Journal
            </p>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-app-text-muted shrink-0 group-hover:text-app-text transition-colors" />
        </button>
      </div>
    </aside>
  );
};

