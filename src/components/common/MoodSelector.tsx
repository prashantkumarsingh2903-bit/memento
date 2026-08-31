import React from 'react';
import type { Mood, MoodOption } from '../../types';

export const MOOD_OPTIONS: MoodOption[] = [
  {
    value: 'great',
    label: 'Great',
    emoji: '😊',
    colorClass: 'text-amber-600 dark:text-amber-400',
    bgClass: 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/40',
  },
  {
    value: 'good',
    label: 'Good',
    emoji: '🙂',
    colorClass: 'text-emerald-600 dark:text-emerald-400',
    bgClass: 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/40',
  },
  {
    value: 'okay',
    label: 'Okay',
    emoji: '😐',
    colorClass: 'text-slate-600 dark:text-slate-300',
    bgClass: 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800',
  },
  {
    value: 'low',
    label: 'Low',
    emoji: '😔',
    colorClass: 'text-indigo-600 dark:text-indigo-400',
    bgClass: 'bg-indigo-50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800/40',
  },
  {
    value: 'difficult',
    label: 'Difficult',
    emoji: '😣',
    colorClass: 'text-rose-600 dark:text-rose-400',
    bgClass: 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/40',
  },
  {
    value: 'tired',
    label: 'Tired',
    emoji: '😴',
    colorClass: 'text-[#6C4FF6] dark:text-[#856DF8]',
    bgClass: 'bg-[#F1EEFF] dark:bg-[#6C4FF6]/20 border-[#6C4FF6]/30',
  },
];

export function getMoodDetails(mood?: Mood): MoodOption | undefined {
  if (!mood) return undefined;
  return MOOD_OPTIONS.find((m) => m.value === mood);
}

interface MoodSelectorProps {
  value?: Mood;
  onChange: (mood: Mood) => void;
  size?: 'sm' | 'md' | 'lg';
  showLabels?: boolean;
  className?: string;
}

export const MoodSelector: React.FC<MoodSelectorProps> = ({
  value,
  onChange,
  size = 'md',
  showLabels = true,
  className = '',
}) => {
  const sizeClasses = {
    sm: 'text-lg p-1.5 min-w-[50px] rounded-xl',
    md: 'text-xl p-2.5 min-w-[64px] rounded-xl',
    lg: 'text-2xl p-3 min-w-[76px] rounded-2xl',
  };

  return (
    <div className={`flex items-center gap-2 flex-wrap ${className}`}>
      {MOOD_OPTIONS.map((item) => {
        const isSelected = value === item.value;
        return (
          <button
            key={item.value}
            type="button"
            onClick={() => onChange(item.value)}
            className={`flex flex-col items-center justify-center border transition-all duration-150 cursor-pointer ${
              sizeClasses[size]
            } ${
              isSelected
                ? 'bg-[#F1EEFF] dark:bg-[#6C4FF6]/20 border-[#6C4FF6] text-[#6C4FF6] dark:text-[#856DF8] ring-2 ring-[#6C4FF6]/25 scale-[1.03] shadow-subtle font-bold'
                : 'bg-white dark:bg-[#201F28] border-app-border text-app-text-secondary hover:text-app-text hover:border-app-border-strong hover:bg-app-surface-secondary dark:hover:bg-[#26252F]'
            }`}
            title={item.label}
          >
            <span className="transition-transform duration-150 active:scale-125 select-none">
              {item.emoji}
            </span>
            {showLabels && (
              <span
                className={`text-[11px] mt-1 font-semibold ${
                  isSelected ? 'text-[#6C4FF6] dark:text-[#856DF8]' : 'text-app-text-secondary'
                }`}
              >
                {item.label}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
