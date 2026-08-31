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
    colorClass: 'text-stone-600 dark:text-stone-300',
    bgClass: 'bg-stone-50 dark:bg-stone-900 border-stone-200 dark:border-stone-800',
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
    colorClass: 'text-purple-600 dark:text-purple-400',
    bgClass: 'bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800/40',
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
    sm: 'text-lg p-1.5 min-w-[52px]',
    md: 'text-xl p-2.5 min-w-[68px]',
    lg: 'text-2xl p-3 min-w-[80px]',
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
            className={`flex flex-col items-center justify-center rounded-2xl border transition-all duration-200 cursor-pointer ${
              sizeClasses[size]
            } ${
              isSelected
                ? `${item.bgClass} border-warm-accent ring-2 ring-warm-accent/20 scale-[1.03] shadow-sm`
                : 'bg-warm-card border-warm-border/80 hover:border-warm-border-strong hover:bg-warm-card-subtle opacity-80 hover:opacity-100'
            }`}
            title={item.label}
          >
            <span className="transition-transform duration-150 active:scale-125">
              {item.emoji}
            </span>
            {showLabels && (
              <span
                className={`text-[11px] mt-1 font-medium ${
                  isSelected ? 'text-warm-text font-semibold' : 'text-warm-muted'
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
