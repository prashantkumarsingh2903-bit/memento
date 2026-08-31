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
} from 'date-fns';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Mic,
  Video,
  PenLine,
  Camera,
  Sparkles,
} from 'lucide-react';
import type { JournalEntry, EntryType, Mood } from '../../types';
import { getMoodDetails } from '../common/MoodSelector';
import { DayConsolidatedTab, type DayGroupData } from './DayConsolidatedTab';
import { Button } from '../common/Button';

interface JournalCalendarProps {
  entries: JournalEntry[];
  onOpenEntry: (id: string) => void;
  onEditEntry: (id: string) => void;
  onDeleteEntry: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onStartCapture?: (type: EntryType, initialPrompt?: string, initialMood?: Mood) => void;
}

export const JournalCalendar: React.FC<JournalCalendarProps> = ({
  entries,
  onOpenEntry,
  onEditEntry,
  onDeleteEntry,
  onToggleFavorite,
  onStartCapture,
}) => {
  const [currentMonth, setCurrentMonth] = useState<Date>(() => new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());

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

  const selectedDateKey = format(selectedDate, 'yyyy-MM-dd');
  const selectedEntries = entriesByDate.get(selectedDateKey) || [];

  // Construct DayGroupData for the selected date
  const selectedDayGroup: DayGroupData = React.useMemo(() => {
    const today = isToday(selectedDate);
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    let label = format(selectedDate, 'EEEE');
    if (today) label = 'Today';

    const subLabel = format(selectedDate, 'MMMM d, yyyy');
    const types = Array.from(new Set(selectedEntries.map((e) => e.type)));
    const moods = Array.from(
      new Set(
        selectedEntries
          .map((e) => e.mood)
          .filter((m): m is Mood => Boolean(m))
      )
    );

    return {
      dateKey,
      date: selectedDate,
      label,
      subLabel,
      isToday: today,
      isYesterday: false,
      entries: [...selectedEntries].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
      types,
      moods,
    };
  }, [selectedDate, selectedEntries]);

  // Monthly active stats
  const activeDaysInMonthCount = React.useMemo(() => {
    let count = 0;
    entriesByDate.forEach((dayEntries, dateKey) => {
      const d = new Date(dateKey);
      if (isSameMonth(d, currentMonth) && dayEntries.length > 0) {
        count++;
      }
    });
    return count;
  }, [entriesByDate, currentMonth]);

  const handlePrevMonth = () => setCurrentMonth((prev) => subMonths(prev, 1));
  const handleNextMonth = () => setCurrentMonth((prev) => addMonths(prev, 1));
  const handleGoToToday = () => {
    const today = new Date();
    setCurrentMonth(today);
    setSelectedDate(today);
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
    <div className="space-y-8 animate-fade-in">
      {/* ========================================================================= */}
      {/* 1. INTERACTIVE MONTH CALENDAR MATRIX                                      */}
      {/* ========================================================================= */}
      <section className="bg-white dark:bg-[#201F28] border border-app-border rounded-2xl p-5 sm:p-7 shadow-subtle space-y-6">
        {/* Calendar Header Navigation */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#F1EEFF] dark:bg-[#6C4FF6]/20 text-[#6C4FF6] dark:text-[#856DF8] border border-[#6C4FF6]/20 shadow-soft">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-sans text-xl sm:text-2xl font-extrabold text-app-text tracking-tight">
                {format(currentMonth, 'MMMM yyyy')}
              </h2>
              <p className="text-xs text-app-text-secondary mt-0.5">
                {activeDaysInMonthCount}{' '}
                {activeDaysInMonthCount === 1 ? 'active journaling day' : 'active journaling days'}{' '}
                recorded this month
              </p>
            </div>
          </div>

          {/* Month Navigation Buttons */}
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleGoToToday}
              className="text-xs font-semibold"
            >
              Today
            </Button>
            <div className="flex items-center border border-app-border rounded-xl bg-app-surface-secondary dark:bg-[#26252F] p-1">
              <button
                onClick={handlePrevMonth}
                className="p-1.5 rounded-lg text-app-text-secondary hover:text-app-text hover:bg-white dark:hover:bg-[#201F28] transition-colors cursor-pointer"
                aria-label="Previous month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNextMonth}
                className="p-1.5 rounded-lg text-app-text-secondary hover:text-app-text hover:bg-white dark:hover:bg-[#201F28] transition-colors cursor-pointer"
                aria-label="Next month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="space-y-2">
          {/* Weekday Header Labels */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center text-xs font-bold uppercase tracking-wider text-app-text-muted pb-1">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* 7xN Calendar Days Grid */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {calendarDays.map((day) => {
              const dayKey = format(day, 'yyyy-MM-dd');
              const dayEntries = entriesByDate.get(dayKey) || [];
              const hasEntries = dayEntries.length > 0;
              const isSelected = isSameDay(day, selectedDate);
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isTodayDate = isToday(day);

              // Unique moods for day
              const moods = Array.from(
                new Set(
                  dayEntries
                    .map((e) => e.mood)
                    .filter((m): m is Mood => Boolean(m))
                )
              );

              // Unique modalities for day
              const types = Array.from(new Set(dayEntries.map((e) => e.type)));

              return (
                <button
                  key={dayKey}
                  type="button"
                  onClick={() => setSelectedDate(day)}
                  className={`relative min-h-[72px] sm:min-h-[88px] p-2 rounded-xl border flex flex-col justify-between text-left transition-all duration-200 cursor-pointer group ${
                    isSelected
                      ? 'bg-[#F1EEFF] dark:bg-[#6C4FF6]/25 border-[#6C4FF6] shadow-soft ring-2 ring-[#6C4FF6]/20'
                      : isTodayDate
                      ? 'bg-white dark:bg-[#201F28] border-[#6C4FF6]/50 shadow-subtle hover:border-[#6C4FF6]'
                      : isCurrentMonth
                      ? 'bg-white dark:bg-[#201F28] border-app-border/80 hover:border-app-border-strong hover:bg-app-surface-secondary/50'
                      : 'bg-app-surface-secondary/30 dark:bg-[#181721]/30 border-transparent text-app-text-muted/40 opacity-40 hover:opacity-80'
                  }`}
                >
                  {/* Top: Day Number & Today indicator */}
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={`text-xs sm:text-sm font-bold ${
                        isSelected
                          ? 'text-[#6C4FF6] dark:text-[#856DF8]'
                          : isTodayDate
                          ? 'text-[#6C4FF6] font-extrabold'
                          : isCurrentMonth
                          ? 'text-app-text'
                          : 'text-app-text-muted'
                      }`}
                    >
                      {format(day, 'd')}
                    </span>

                    {isTodayDate && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#6C4FF6] animate-pulse" />
                    )}
                  </div>

                  {/* Middle: Mood Emoji if available */}
                  <div className="flex items-center gap-1 my-0.5 min-h-[20px]">
                    {moods.length > 0 ? (
                      moods.slice(0, 2).map((m) => {
                        const info = getMoodDetails(m);
                        return (
                          <span
                            key={m}
                            className="text-xs sm:text-sm select-none"
                            title={info?.label}
                          >
                            {info?.emoji}
                          </span>
                        );
                      })
                    ) : null}
                  </div>

                  {/* Bottom: Modality colored dots & count */}
                  <div className="flex items-center justify-between w-full">
                    {hasEntries ? (
                      <div className="flex items-center gap-1">
                        {types.slice(0, 3).map((t) => (
                          <span
                            key={t}
                            className={`w-1.5 h-1.5 rounded-full ${getModalityDotColor(
                              t
                            )}`}
                            title={`${t} entry`}
                          />
                        ))}
                      </div>
                    ) : (
                      <div />
                    )}

                    {hasEntries && (
                      <span className="text-[10px] font-bold font-mono px-1.5 py-0.2 rounded-full bg-app-surface-secondary dark:bg-[#26252F] text-app-text-secondary border border-app-border/70">
                        {dayEntries.length}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between pt-3 border-t border-app-border text-[11px] text-app-text-secondary flex-wrap gap-3">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="font-semibold text-app-text">Modality Key:</span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#6C4FF6]" /> Voice Memo
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#D95CFF]" /> Video Journal
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-500" /> Note / Text
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> Photo
            </span>
          </div>

          <span className="text-app-text-muted">
            Click any date on the calendar to view its consolidated tab below
          </span>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. SELECTED DAY'S CONSOLIDATED TAB / EMPTY STATE                          */}
      {/* ========================================================================= */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#6C4FF6]" />
            <h3 className="font-sans text-base sm:text-lg font-bold text-app-text">
              Selected Day: {format(selectedDate, 'EEEE, MMMM d, yyyy')}
            </h3>
          </div>
          <span className="text-xs font-semibold text-app-text-secondary">
            {selectedEntries.length}{' '}
            {selectedEntries.length === 1 ? 'memory recorded' : 'memories recorded'}
          </span>
        </div>

        {selectedEntries.length > 0 ? (
          <DayConsolidatedTab
            group={selectedDayGroup}
            isInitiallyCollapsed={false}
            onOpenEntry={onOpenEntry}
            onEditEntry={onEditEntry}
            onDeleteEntry={onDeleteEntry}
            onToggleFavorite={onToggleFavorite}
            onStartCapture={onStartCapture}
          />
        ) : (
          <div className="bg-white dark:bg-[#201F28] border border-dashed border-app-border rounded-2xl p-8 sm:p-12 text-center space-y-4 shadow-subtle">
            <div className="w-12 h-12 rounded-2xl bg-[#F1EEFF] dark:bg-[#6C4FF6]/20 text-[#6C4FF6] dark:text-[#856DF8] flex items-center justify-center mx-auto shadow-subtle">
              <CalendarIcon className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-sans text-lg font-bold text-app-text">
                No entries recorded on {format(selectedDate, 'MMMM d, yyyy')}
              </h4>
              <p className="text-xs sm:text-sm text-app-text-secondary max-w-md mx-auto mt-1">
                Would you like to record a retroactive moment, speech memo, or written memory for this day?
              </p>
            </div>

            {onStartCapture && (
              <div className="flex items-center justify-center gap-2.5 flex-wrap pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onStartCapture('voice')}
                  leftIcon={<Mic className="w-3.5 h-3.5 text-[#6C4FF6]" />}
                >
                  Record Voice
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onStartCapture('video')}
                  leftIcon={<Video className="w-3.5 h-3.5 text-[#D95CFF]" />}
                >
                  Record Video
                </Button>
                <Button
                  size="sm"
                  onClick={() => onStartCapture('text')}
                  leftIcon={<PenLine className="w-3.5 h-3.5" />}
                >
                  Write Memory
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onStartCapture('photo')}
                  leftIcon={<Camera className="w-3.5 h-3.5 text-emerald-600" />}
                >
                  Add Photo
                </Button>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
};
