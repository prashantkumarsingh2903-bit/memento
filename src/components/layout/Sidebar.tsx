import React from 'react';
import {
  Home,
  BookOpen,
  Sparkles,
  BarChart3,
  Settings,
  Plus,
  Moon,
  Sun,
  Laptop,
} from 'lucide-react';
import type { ActiveView, UserProfile } from '../../types';
import { Button } from '../common/Button';

interface SidebarProps {
  activeView: ActiveView;
  onNavigate: (view: ActiveView) => void;
  onQuickCapture: () => void;
  profile: UserProfile;
  theme: 'light' | 'dark' | 'system';
  onThemeChange: (theme: 'light' | 'dark' | 'system') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onNavigate,
  onQuickCapture,
  profile,
  theme,
  onThemeChange,
}) => {
  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'journal', label: 'Journal', icon: BookOpen },
    { id: 'reflect', label: 'Reflect', icon: Sparkles },
    { id: 'insights', label: 'Insights', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ] as const;

  const cycleTheme = () => {
    if (theme === 'light') onThemeChange('dark');
    else if (theme === 'dark') onThemeChange('system');
    else onThemeChange('light');
  };

  return (
    <aside className="hidden md:flex flex-col w-64 lg:w-72 bg-warm-card border-r border-warm-border h-screen sticky top-0 px-5 py-6 shrink-0 select-none">
      {/* Brand / Logo */}
      <div className="flex items-center justify-between mb-8 px-2">
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-3 text-left group"
        >
          <div className="w-9 h-9 rounded-2xl bg-warm-accent-light flex items-center justify-center border border-warm-accent/25 group-hover:scale-105 transition-transform">
            <span className="font-serif text-lg font-bold text-warm-accent">
              M
            </span>
          </div>
          <div>
            <h1 className="font-serif text-xl font-medium tracking-tight text-warm-text">
              Memento
            </h1>
            <p className="text-[10px] uppercase tracking-widest text-warm-muted font-medium">
              Mindful Journal
            </p>
          </div>
        </button>

        {/* Theme quick toggle */}
        <button
          onClick={cycleTheme}
          className="p-2 rounded-xl text-warm-muted hover:text-warm-text hover:bg-warm-card-subtle transition-colors"
          title={`Theme: ${theme}`}
        >
          {theme === 'light' && <Sun className="w-4 h-4 text-amber-600" />}
          {theme === 'dark' && <Moon className="w-4 h-4 text-indigo-400" />}
          {theme === 'system' && <Laptop className="w-4 h-4 text-warm-muted" />}
        </button>
      </div>

      {/* Primary Capture CTA */}
      <div className="mb-6">
        <Button
          onClick={onQuickCapture}
          className="w-full justify-center py-2.5 shadow-subtle hover:shadow-soft font-medium text-sm"
          leftIcon={<Plus className="w-4 h-4" />}
        >
          New Entry
        </Button>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            activeView === item.id ||
            (item.id === 'journal' && activeView === 'entry-detail');

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-2xl text-sm font-medium transition-all duration-150 text-left ${
                isActive
                  ? 'bg-warm-accent-light text-warm-accent font-semibold shadow-subtle'
                  : 'text-warm-muted hover:text-warm-text hover:bg-warm-card-subtle'
              }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 transition-transform ${
                  isActive ? 'scale-110 text-warm-accent' : 'opacity-80'
                }`}
              />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Profile snippet footer */}
      <div className="pt-4 border-t border-warm-border/70 mt-auto">
        <button
          onClick={() => onNavigate('settings')}
          className="w-full flex items-center gap-3 p-2 rounded-2xl hover:bg-warm-card-subtle transition-colors text-left group"
        >
          <img
            src={profile.avatarUrl}
            alt={profile.name}
            className="w-9 h-9 rounded-full object-cover border border-warm-border shrink-0 group-hover:scale-105 transition-transform"
          />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-warm-text truncate">
              {profile.name}
            </p>
            <p className="text-[11px] text-warm-muted truncate">
              Private & Local
            </p>
          </div>
        </button>
      </div>
    </aside>
  );
};
