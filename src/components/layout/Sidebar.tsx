import React from 'react';
import {
  Compass,
  BookOpen,
  PlusCircle,
  Sparkles,
  BarChart3,
  Settings,
  HelpCircle,
  Moon,
  Sun,
  Laptop,
  ChevronDown,
} from 'lucide-react';
import type { ActiveView, UserProfile } from '../../types';

interface SidebarProps {
  activeView: ActiveView;
  onNavigate: (view: ActiveView) => void;
  onQuickCapture: () => void;
  profile: UserProfile;
  theme: 'light' | 'dark' | 'system';
  onThemeChange: (theme: 'light' | 'dark' | 'system') => void;
  onOpenHelp?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onNavigate,
  onQuickCapture,
  profile,
  theme,
  onThemeChange,
  onOpenHelp,
}) => {
  const primaryNavItems = [
    { id: 'home', label: 'Overview', icon: Compass },
    { id: 'journal', label: 'Journal', icon: BookOpen },
    { id: 'reflect', label: 'Reflect', icon: Sparkles },
    { id: 'insights', label: 'Insights', icon: BarChart3 },
  ] as const;

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
    <aside className="hidden md:flex flex-col w-60 lg:w-[260px] h-screen sticky top-0 py-6 px-4 shrink-0 select-none bg-transparent justify-between">
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

        {/* Primary Navigation */}
        <nav className="space-y-1">
          {primaryNavItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              activeView === item.id ||
              (item.id === 'journal' && activeView === 'entry-detail');

            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`relative w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 text-left cursor-pointer ${
                  isActive
                    ? 'bg-[#F1EEFF] dark:bg-[#6C4FF6]/18 text-[#6C4FF6] dark:text-[#856DF8] font-semibold'
                    : 'text-app-text-secondary hover:text-app-text hover:bg-white/60 dark:hover:bg-[#201F28]/60'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 transition-transform ${
                    isActive ? 'text-[#6C4FF6] dark:text-[#856DF8] scale-105' : 'text-app-text-muted'
                  }`}
                />
                <span>{item.label}</span>

                {/* Vertical indicator bar on the right */}
                {isActive && (
                  <span className="absolute right-1 top-2 bottom-2 w-1 bg-[#6C4FF6] rounded-full" />
                )}
              </button>
            );
          })}

          {/* Quick Capture Nav Item */}
          <button
            onClick={onQuickCapture}
            className="relative w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-app-text-secondary hover:text-app-text hover:bg-white/60 dark:hover:bg-[#201F28]/60 transition-all duration-150 text-left cursor-pointer group"
          >
            <PlusCircle className="w-4 h-4 shrink-0 text-app-text-muted group-hover:text-[#6C4FF6] transition-colors" />
            <span>Capture</span>
          </button>
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="space-y-4 pt-4 border-t border-app-border/70">
        {/* Secondary Links: Settings & Help */}
        <div className="space-y-1">
          <button
            onClick={() => onNavigate('settings')}
            className={`relative w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-150 text-left cursor-pointer ${
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
            <span>Settings</span>
            {activeView === 'settings' && (
              <span className="absolute right-1 top-2 bottom-2 w-1 bg-[#6C4FF6] rounded-full" />
            )}
          </button>

          <button
            onClick={onOpenHelp || (() => onNavigate('settings'))}
            className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-sm font-medium text-app-text-secondary hover:text-app-text hover:bg-white/60 dark:hover:bg-[#201F28]/60 transition-all duration-150 text-left cursor-pointer"
          >
            <HelpCircle className="w-4 h-4 shrink-0 text-app-text-muted" />
            <span>Help</span>
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
