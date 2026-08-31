import React from 'react';
import { Home, BookOpen, Sparkles, BarChart3, Plus } from 'lucide-react';
import type { ActiveView } from '../../types';

interface BottomNavigationProps {
  activeView: ActiveView;
  onNavigate: (view: ActiveView) => void;
  onQuickCapture: () => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeView,
  onNavigate,
  onQuickCapture,
}) => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-warm-card/95 backdrop-blur-md border-t border-warm-border px-3 py-2 flex items-center justify-around select-none">
      {/* Home */}
      <button
        onClick={() => onNavigate('home')}
        className={`flex flex-col items-center gap-1 p-1.5 min-w-[50px] transition-colors ${
          activeView === 'home' ? 'text-warm-accent' : 'text-warm-muted'
        }`}
      >
        <Home className="w-5 h-5" />
        <span className="text-[10px] font-medium">Home</span>
      </button>

      {/* Journal */}
      <button
        onClick={() => onNavigate('journal')}
        className={`flex flex-col items-center gap-1 p-1.5 min-w-[50px] transition-colors ${
          activeView === 'journal' || activeView === 'entry-detail'
            ? 'text-warm-accent'
            : 'text-warm-muted'
        }`}
      >
        <BookOpen className="w-5 h-5" />
        <span className="text-[10px] font-medium">Journal</span>
      </button>

      {/* Primary Capture Action Button */}
      <button
        onClick={onQuickCapture}
        className="w-12 h-12 rounded-full bg-warm-accent text-white flex items-center justify-center -mt-5 shadow-elevated hover:bg-warm-accent-hover active:scale-95 transition-all border-4 border-warm-bg"
        aria-label="Capture moment"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Reflect */}
      <button
        onClick={() => onNavigate('reflect')}
        className={`flex flex-col items-center gap-1 p-1.5 min-w-[50px] transition-colors ${
          activeView === 'reflect' ? 'text-warm-accent' : 'text-warm-muted'
        }`}
      >
        <Sparkles className="w-5 h-5" />
        <span className="text-[10px] font-medium">Reflect</span>
      </button>

      {/* Insights */}
      <button
        onClick={() => onNavigate('insights')}
        className={`flex flex-col items-center gap-1 p-1.5 min-w-[50px] transition-colors ${
          activeView === 'insights' ? 'text-warm-accent' : 'text-warm-muted'
        }`}
      >
        <BarChart3 className="w-5 h-5" />
        <span className="text-[10px] font-medium">Insights</span>
      </button>
    </nav>
  );
};
