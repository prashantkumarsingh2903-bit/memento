import React, { useState } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  isToday,
  addDays,
} from 'date-fns';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Flame,
  X,
  Sparkles,
} from 'lucide-react';
import type { JournalEntry, EntryType } from '../../types';
import { getMoodDetails } from '../common/MoodSelector';
import { Button } from '../common/Button';

interface JournalCalendarPanelProps {
  entries: JournalEntry[];
  selectedDate: Date | null;
  onSelectDate: (date: Date | null) => void;
  onClose?: () => void;
}

export const JournalCalendarPanel: React.FC<JournalCalendarPanelProps> = ({
  entries,
  selectedDate,
  onSelectDate,
  onClose,
}) => {
  const [currentMonth, setCurrentMonth] = useState<Date>(
    () => selectedDate || new Date()
  );

  // Map entries by dateKey (YYYY-MM-DD)
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

  // Calendar days generation
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 }); // Sunday
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  // Count active days in selected month
  const activeDaysInMonth = React.useMemo(() => {
    let count = 0;
    entriesByDate.forEach((dayEntries, dateKey) => {
      const d = new Date(dateKey);
      if (isSameMonth(d, currentMonth) && dayEntries.length > 0) {
        count++;
      }
    });
    return count;
  }, [entriesByDate, currentMonth]);

  // Streak calculation
  const currentStreak = React.useMemo(() => {
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const checkDate = addDays(today, -i);
      const key = format(checkDate, 'yyyy-MM-dd');
      if (entriesByDate.has(key) && entriesByDate.get(key)!.length > 0) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }
    return streak;
  }, [entriesByDate]);

  const handlePrevMonth = () => setCurrentMonth((prev) => subMonths(prev, 1));
  const handleNextMonth = () => setCurrentMonth((prev) => addMonths(prev, 1));
  const handleGoToToday = () => {
    const today = new Date();
    setCurrentMonth(today);
    onSelectDate(today);
  };

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
    <div className="bg-white dark:bg-[#201F28] border border-app-border rounded-2xl p-4 sm:p-5 shadow-subtle space-y-4">
      {/* Panel Header */}
      <div className="flex items-center justify-between gap-2 border-b border-app-border pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#F1EEFF] dark:bg-[#6C4FF6]/20 text-[#6C4FF6] dark:text-[#856DF8]">
            <CalendarIcon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-sans text-sm font-bold text-app-text">
              Calendar Explorer
            </h3>
            <p className="text-[11px] text-app-text-secondary">
              Filter timeline by day
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {selectedDate && (
            <button
              onClick={() => onSelectDate(null)}
              className="text-[11px] font-semibold text-[#6C4FF6] dark:text-[#856DF8] hover:underline px-2 py-1 rounded bg-[#F1EEFF] dark:bg-[#6C4FF6]/15 cursor-pointer"
              title="Show all days in timeline"
            >
              All Dates
            </button>
          )}

          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-app-text-muted hover:text-app-text hover:bg-app-surface-secondary dark:hover:bg-[#26252F] cursor-pointer"
              aria-label="Close calendar panel"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-between">
        <span className="font-sans text-sm font-extrabold text-app-text">
          {format(currentMonth, 'MMMM yyyy')}
        </span>

        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleGoToToday}
            className="text-[11px] h-7 px-2"
          >
            Today
          </Button>
          <div className="flex items-center border border-app-border rounded-lg bg-app-surface-secondary dark:bg-[#26252F] p-0.5">
            <button
              onClick={handlePrevMonth}
              className="p-1 rounded text-app-text-secondary hover:text-app-text hover:bg-white dark:hover:bg-[#201F28] cursor-pointer"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleNextMonth}
              className="p-1 rounded text-app-text-secondary hover:text-app-text hover:bg-white dark:hover:bg-[#201F28] cursor-pointer"
              aria-label="Next month"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid Matrix */}
      <div className="space-y-1">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold uppercase tracking-wider text-app-text-muted pb-1">
          <span>Su</span>
          <span>Mo</span>
          <span>Tu</span>
          <span>We</span>
          <span>Th</span>
          <span>Fr</span>
          <span>Sa</span>
        </div>

        {/* Day buttons */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day) => {
            const dayKey = format(day, 'yyyy-MM-dd');
            const dayEntries = entriesByDate.get(dayKey) || [];
            const hasEntries = dayEntries.length > 0;
            const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isTodayDate = isToday(day);

            // Primary mood emoji
            const primaryMood = dayEntries.find((e) => Boolean(e.mood))?.mood;
            const moodInfo = primaryMood ? getMoodDetails(primaryMood) : null;

            // Unique types
            const types = Array.from(new Set(dayEntries.map((e) => e.type)));

            return (
              <button
                key={dayKey}
                type="button"
                onClick={() => {
                  if (isSelected) {
                    onSelectDate(null); // Toggle off if already selected
                  } else {
                    onSelectDate(day);
                  }
                }}
                className={`relative h-10 p-0.5 rounded-lg border flex flex-col items-center justify-between text-center transition-all duration-150 cursor-pointer ${
                  isSelected
                    ? 'bg-[#6C4FF6] text-white border-[#6C4FF6] shadow-soft'
                    : isTodayDate
                    ? 'bg-[#F1EEFF] dark:bg-[#6C4FF6]/20 border-[#6C4FF6]/50 text-[#6C4FF6] dark:text-[#856DF8] font-bold'
                    : isCurrentMonth
                    ? hasEntries
                      ? 'bg-app-surface-secondary/60 dark:bg-[#26252F]/70 border-app-border/80 text-app-text hover:border-[#6C4FF6]/60'
                      : 'bg-transparent border-transparent text-app-text hover:bg-app-surface-secondary dark:hover:bg-[#26252F]'
                    : 'bg-transparent border-transparent text-app-text-muted/30 opacity-40 hover:opacity-70'
                }`}
                title={
                  hasEntries
                    ? `${format(day, 'MMM d')}: ${dayEntries.length} ${
                        dayEntries.length === 1 ? 'memory' : 'memories'
                      }`
                    : format(day, 'MMMM d, yyyy')
                }
              >
                {/* Day number */}
                <span
                  className={`text-[11px] leading-tight ${
                    isSelected
                      ? 'text-white font-extrabold'
                      : isTodayDate
                      ? 'text-[#6C4FF6] dark:text-[#856DF8] font-extrabold'
                      : isCurrentMonth
                      ? 'font-medium'
                      : 'font-normal'
                  }`}
                >
                  {format(day, 'd')}
                </span>

                {/* Day dots or mood emoji */}
                <div className="h-3 flex items-center justify-center gap-0.5">
                  {isSelected ? (
                    <span className="w-1 h-1 rounded-full bg-white" />
                  ) : moodInfo ? (
                    <span className="text-[9px] leading-none select-none">
                      {moodInfo.emoji}
                    </span>
                  ) : hasEntries ? (
                    <div className="flex items-center gap-0.5">
                      {types.slice(0, 2).map((t) => (
                        <span
                          key={t}
                          className={`w-1 h-1 rounded-full ${getModalityDotColor(t)}`}
                        />
                      ))}
                    </div>
                  ) : null}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer Metrics & Key */}
      <div className="pt-3 border-t border-app-border space-y-2 text-[11px]">
        {/* Active Month Stats */}
        <div className="flex items-center justify-between text-app-text-secondary">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#6C4FF6]" />
            <span>Active Days:</span>
          </span>
          <span className="font-bold text-app-text">
            {activeDaysInMonth} {activeDaysInMonth === 1 ? 'day' : 'days'}
          </span>
        </div>

        <div className="flex items-center justify-between text-app-text-secondary">
          <span className="flex items-center gap-1">
            <Flame className="w-3 h-3 text-amber-500 fill-amber-500" />
            <span>Current Streak:</span>
          </span>
          <span className="font-bold text-amber-600 dark:text-amber-400">
            {currentStreak} {currentStreak === 1 ? 'day' : 'days'}
          </span>
        </div>

        {/* Selected Date Notice */}
        {selectedDate && (
          <div className="p-2 rounded-lg bg-[#F1EEFF] dark:bg-[#6C4FF6]/15 border border-[#6C4FF6]/30 flex items-center justify-between gap-2 mt-2">
            <span className="text-[11px] font-semibold text-[#6C4FF6] dark:text-[#856DF8] truncate">
              📍 {format(selectedDate, 'MMM d, yyyy')}
            </span>
            <button
              onClick={() => onSelectDate(null)}
              className="text-[10px] font-bold text-app-text-secondary hover:text-app-text underline shrink-0 cursor-pointer"
            >
              Clear
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
