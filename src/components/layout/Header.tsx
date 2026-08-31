import React from 'react';
import { Calendar, Sparkles, Settings, Plus } from 'lucide-react';
import { format } from 'date-fns';
import type { ActiveView } from '../../types';
import { Button } from '../common/Button';
import { InstallAppPrompt } from '../common/InstallAppPrompt';

interface HeaderProps {
  activeView: ActiveView;
  onNavigate: (view: ActiveView) => void;
  onQuickCapture: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeView,
  onNavigate,
  onQuickCapture,
}) => {
  const getTitle = () => {
    switch (activeView) {
      case 'home':
        return 'Overview';
      case 'journal':
        return 'Journal Timeline';
      case 'reflect':
        return 'Reflect & Understand';
      case 'insights':
        return 'Personal Analytics';
      case 'settings':
        return 'Settings & Preferences';
      case 'entry-detail':
        return 'Memory Detail';
      default:
        return 'Memento';
    }
  };

  const todayFormatted = format(new Date(), 'EEEE, MMMM d, yyyy');

  return (
    <header className="px-4 sm:px-6 py-3 mb-2 flex items-center justify-between transition-colors">
      <div className="flex items-center gap-3">
        {/* Mobile brand indicator */}
        <div className="md:hidden flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#6C4FF6] flex items-center justify-center shadow-subtle">
            <span className="font-sans text-sm font-bold text-white">M</span>
          </div>
        </div>

        <div>
          <h2 className="font-sans text-lg sm:text-xl font-bold text-app-text tracking-tight">
            {getTitle()}
          </h2>
          <div className="flex items-center gap-1.5 text-xs text-app-text-muted">
            <Calendar className="w-3.5 h-3.5 text-app-text-muted shrink-0" />
            <span>{todayFormatted}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Install Mobile / Desktop App Trigger */}
        <InstallAppPrompt variant="header" />

        {activeView !== 'reflect' && (
          <button
            onClick={() => onNavigate('reflect')}
            className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium text-app-text-secondary hover:text-[#6C4FF6] bg-white dark:bg-[#201F28] border border-app-border hover:border-[#6C4FF6]/30 shadow-subtle transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#6C4FF6] dark:text-[#856DF8]" />
            <span>Reflect with AI</span>
          </button>
        )}

        <button
          onClick={() => onNavigate('settings')}
          className="md:hidden p-2 rounded-xl text-app-text-muted hover:text-app-text hover:bg-white dark:hover:bg-[#201F28] transition-colors cursor-pointer"
          aria-label="Open settings"
        >
          <Settings className="w-5 h-5" />
        </button>

        <Button
          onClick={onQuickCapture}
          size="sm"
          className="hidden md:inline-flex"
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Capture
        </Button>
      </div>
    </header>
  );
};
