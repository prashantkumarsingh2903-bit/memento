import React from 'react';
import {
  format,
  startOfWeek,
  addDays,
  isSameDay,
  isToday,
} from 'date-fns';
import {
  Calendar as CalendarIcon,
  Flame,
  ChevronRight,
} from 'lucide-react';
import type { JournalEntry, EntryType } from '../../types';
import { getMoodDetails } from '../common/MoodSelector';

interface WeeklyCalendarStripProps {
  entries: JournalEntry[];
  onSelectDate?: (date: Date) => void;
  onNavigateToCalendar?: () => void;
}

export const WeeklyCalendarStrip: React.FC<WeeklyCalendarStripProps> = ({
  entries,
  onSelectDate,
  onNavigateToCalendar,
}) => {
  const [selectedDate, setSelectedDate] = React.useState<Date>(() => new Date());

  // Generate 7 days of current week starting Sunday or Monday
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 }); // Monday start
  const daysInWeek = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Map entries by dateKey (yyyy-MM-dd)
  const entriesByDate = React.useMemo(() => {
    const map = new Map<string, JournalEntry[]>();
    entries.forEach((entry) => {
      const key = format(new Date(entry.createdAt), 'yyyy-MM-dd');
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)!.push(entry);
    });
    return map;
  }, [entries]);

  // Count streak
  const currentStreak = React.useMemo(() => {
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const checkDate = addDays(today, -i);
      const key = format(checkDate, 'yyyy-MM-dd');
      if (entriesByDate.has(key) && entriesByDate.get(key)!.length > 0) {
        streak++;
      } else if (i > 0) {
        // Break in streak
        break;
      }
    }
    return streak;
  }, [entriesByDate]);

  const getModalityDotColor = (type: EntryType) => {
    switch (type) {
      case 'voice':
        return 'bg-[#6C4FF6]';
      case 'video':
        return 'bg-[#D95CFF]';
      case 'photo':
        return 'bg-emerald-500';
      case 'mixed':
        return 'bg-cyan-500';
      default:
        return 'bg-amber-500';
    }
  };

  return (
    <div className="bg-white dark:bg-[#201F28] border border-app-border rounded-2xl p-4 sm:p-5 shadow-subtle space-y-3">
      {/* Top Strip Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#F1EEFF] dark:bg-[#6C4FF6]/20 text-[#6C4FF6] dark:text-[#856DF8]">
            <CalendarIcon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-sans text-xs sm:text-sm font-bold text-app-text">
              This Week's Mindful Rhythm
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Current streak badge */}
          <div className="flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-200/60 dark:border-amber-800/40">
            <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            <span>{currentStreak} Day {currentStreak === 1 ? 'Streak' : 'Streak'}</span>
          </div>

          {onNavigateToCalendar && (
            <button
              onClick={onNavigateToCalendar}
              className="text-[11px] font-semibold text-[#6C4FF6] dark:text-[#856DF8] hover:underline flex items-center gap-0.5 cursor-pointer"
            >
              <span>Full Calendar</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 7-Day Interactive Day Pills */}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2 pt-1">
        {daysInWeek.map((day) => {
          const dayKey = format(day, 'yyyy-MM-dd');
          const dayEntries = entriesByDate.get(dayKey) || [];
          const hasEntries = dayEntries.length > 0;
          const isSelected = isSameDay(day, selectedDate);
          const isTodayDate = isToday(day);

          // Get primary mood
          const primaryMood = dayEntries.find((e) => Boolean(e.mood))?.mood;
          const moodInfo = primaryMood ? getMoodDetails(primaryMood) : null;

          // Unique types
          const types = Array.from(new Set(dayEntries.map((e) => e.type)));

          return (
            <button
              key={dayKey}
              type="button"
              onClick={() => {
                setSelectedDate(day);
                if (onSelectDate) onSelectDate(day);
              }}
              className={`p-2 rounded-xl border flex flex-col items-center justify-between text-center transition-all duration-200 cursor-pointer min-h-[68px] sm:min-h-[76px] ${
                isSelected
                  ? 'bg-[#F1EEFF] dark:bg-[#6C4FF6]/25 border-[#6C4FF6] shadow-soft ring-2 ring-[#6C4FF6]/20'
                  : isTodayDate
                  ? 'bg-white dark:bg-[#201F28] border-[#6C4FF6]/40 shadow-subtle hover:border-[#6C4FF6]'
                  : 'bg-app-surface-secondary/40 dark:bg-[#1C1B24]/40 border-app-border/70 hover:border-app-border-strong hover:bg-white dark:hover:bg-[#201F28]'
              }`}
            >
              <span
                className={`text-[10px] font-bold uppercase tracking-wider ${
                  isSelected
                    ? 'text-[#6C4FF6] dark:text-[#856DF8]'
                    : isTodayDate
                    ? 'text-[#6C4FF6]'
                    : 'text-app-text-muted'
                }`}
              >
                {format(day, 'EEE')}
              </span>

              <span
                className={`text-xs sm:text-sm font-extrabold my-0.5 ${
                  isSelected
                    ? 'text-[#6C4FF6] dark:text-[#856DF8]'
                    : isTodayDate
                    ? 'text-[#6C4FF6]'
                    : 'text-app-text'
                }`}
              >
                {format(day, 'd')}
              </span>

              {/* Mood Emoji or Modality Dots */}
              <div className="h-4 flex items-center justify-center gap-0.5">
                {moodInfo ? (
                  <span className="text-xs leading-none select-none" title={moodInfo.label}>
                    {moodInfo.emoji}
                  </span>
                ) : hasEntries ? (
                  <div className="flex items-center gap-0.5">
                    {types.slice(0, 2).map((t) => (
                      <span
                        key={t}
                        className={`w-1.5 h-1.5 rounded-full ${getModalityDotColor(t)}`}
                      />
                    ))}
                  </div>
                ) : (
                  <span className="w-1 h-1 rounded-full bg-app-border" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
