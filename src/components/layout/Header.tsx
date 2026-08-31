import React from 'react';
import {
  Calendar,
  Sparkles,
  Settings,
  Plus,
} from 'lucide-react';
import { format } from 'date-fns';
import type { ActiveView } from '../../types';
import { Button } from '../common/Button';

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
        return 'Today';
      case 'journal':
        return 'Journal Timeline';
      case 'reflect':
        return 'Reflect & Understand';
      case 'insights':
        return 'Personal Journey';
      case 'settings':
        return 'Settings & Privacy';
      case 'entry-detail':
        return 'Memory';
      default:
        return 'Memento';
    }
  };

  const todayFormatted = format(new Date(), 'EEEE, MMMM d');

  return (
    <header className="sticky top-0 z-30 bg-warm-bg/90 backdrop-blur-md border-b border-warm-border/70 px-4 sm:px-8 py-3.5 flex items-center justify-between transition-colors">
      <div className="flex items-center gap-3">
        {/* Mobile brand indicator */}
        <div className="md:hidden flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-warm-accent-light flex items-center justify-center border border-warm-accent/25">
            <span className="font-serif text-sm font-bold text-warm-accent">
              M
            </span>
          </div>
        </div>

        <div>
          <h2 className="font-serif text-lg sm:text-xl font-medium text-warm-text tracking-tight">
            {getTitle()}
          </h2>
          <div className="flex items-center gap-1.5 text-xs text-warm-muted">
            <Calendar className="w-3.5 h-3.5 text-warm-faint shrink-0" />
            <span>{todayFormatted}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {activeView !== 'reflect' && (
          <button
            onClick={() => onNavigate('reflect')}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-warm-muted hover:text-warm-text bg-warm-card border border-warm-border hover:bg-warm-card-subtle transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-warm-accent" />
            <span>Reflect with AI</span>
          </button>
        )}

        <button
          onClick={() => onNavigate('settings')}
          className="md:hidden p-2 rounded-xl text-warm-muted hover:text-warm-text hover:bg-warm-card-subtle transition-colors"
          aria-label="Open settings"
        >
          <Settings className="w-5 h-5" />
        </button>

        <Button
          onClick={onQuickCapture}
          size="sm"
          className="hidden md:inline-flex"
          leftIcon={<Plus className="w-3.5 h-3.5" />}
        >
          Capture
        </Button>
      </div>
    </header>
  );
};
