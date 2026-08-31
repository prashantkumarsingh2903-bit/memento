import React from 'react';
import { Compass, BookOpen, Sparkles, BarChart3, Plus } from 'lucide-react';
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
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#201F28]/95 backdrop-blur-md border-t border-app-border px-3 py-2 flex items-center justify-around select-none">
      {/* Home / Overview */}
      <button
        onClick={() => onNavigate('home')}
        className={`flex flex-col items-center gap-1 p-1.5 min-w-[50px] transition-colors cursor-pointer ${
          activeView === 'home'
            ? 'text-[#6C4FF6] dark:text-[#856DF8] font-semibold'
            : 'text-app-text-muted hover:text-app-text'
        }`}
      >
        <Compass className="w-5 h-5" />
        <span className="text-[10px]">Overview</span>
      </button>

      {/* Journal */}
      <button
        onClick={() => onNavigate('journal')}
        className={`flex flex-col items-center gap-1 p-1.5 min-w-[50px] transition-colors cursor-pointer ${
          activeView === 'journal' || activeView === 'entry-detail'
            ? 'text-[#6C4FF6] dark:text-[#856DF8] font-semibold'
            : 'text-app-text-muted hover:text-app-text'
        }`}
      >
        <BookOpen className="w-5 h-5" />
        <span className="text-[10px]">Journal</span>
      </button>

      {/* Primary Capture Action Button */}
      <button
        onClick={onQuickCapture}
        className="w-12 h-12 rounded-2xl bg-[#6C4FF6] hover:bg-[#5B3FD4] text-white flex items-center justify-center -mt-5 shadow-elevated active:scale-95 transition-all border-4 border-app-bg cursor-pointer"
        aria-label="Capture moment"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Reflect */}
      <button
        onClick={() => onNavigate('reflect')}
        className={`flex flex-col items-center gap-1 p-1.5 min-w-[50px] transition-colors cursor-pointer ${
          activeView === 'reflect'
            ? 'text-[#6C4FF6] dark:text-[#856DF8] font-semibold'
            : 'text-app-text-muted hover:text-app-text'
        }`}
      >
        <Sparkles className="w-5 h-5" />
        <span className="text-[10px]">Reflect</span>
      </button>

      {/* Insights */}
      <button
        onClick={() => onNavigate('insights')}
        className={`flex flex-col items-center gap-1 p-1.5 min-w-[50px] transition-colors cursor-pointer ${
          activeView === 'insights'
            ? 'text-[#6C4FF6] dark:text-[#856DF8] font-semibold'
            : 'text-app-text-muted hover:text-app-text'
        }`}
      >
        <BarChart3 className="w-5 h-5" />
        <span className="text-[10px]">Insights</span>
      </button>
    </nav>
  );
};
