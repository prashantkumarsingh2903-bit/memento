import React, { useState } from 'react';
import {
  Calendar,
  ChevronDown,
  ChevronUp,
  Clock,
  Mic,
  PenLine,
  Video,
  Camera,
  Layers,
  Heart,
  Sparkles,
  Edit3,
  Trash2,
} from 'lucide-react';
import {
  format,
  isToday,
  isYesterday,
  isThisYear,
} from 'date-fns';
import type { JournalEntry, EntryType, Mood } from '../../types';
import { getMoodDetails } from '../common/MoodSelector';
import { Badge } from '../common/Badge';

interface DayGroupedEntriesProps {
  entries: JournalEntry[];
  onOpenEntry: (id: string) => void;
  onEditEntry: (id: string) => void;
  onDeleteEntry: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}

interface DayGroup {
  dateKey: string; // YYYY-MM-DD
  date: Date;
  label: string;
  subLabel: string;
  isToday: boolean;
  isYesterday: boolean;
  entries: JournalEntry[];
  types: EntryType[];
  moods: Mood[];
}

export const DayGroupedEntries: React.FC<DayGroupedEntriesProps> = ({
  entries,
  onOpenEntry,
  onEditEntry,
  onDeleteEntry,
  onToggleFavorite,
}) => {
  // Group entries by date
  const groups: DayGroup[] = React.useMemo(() => {
    const groupMap = new Map<string, JournalEntry[]>();

    entries.forEach((entry) => {
      const date = new Date(entry.createdAt);
      const dateKey = format(date, 'yyyy-MM-dd');
      if (!groupMap.has(dateKey)) {
        groupMap.set(dateKey, []);
      }
      groupMap.get(dateKey)!.push(entry);
    });

    // Sort groups descending by date
    const sortedKeys = Array.from(groupMap.keys()).sort((a, b) =>
      b.localeCompare(a)
    );

    return sortedKeys.map((dateKey) => {
      const groupEntries = groupMap.get(dateKey)!;
      // Sort entries within day descending by time
      groupEntries.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      const firstDate = new Date(groupEntries[0].createdAt);
      const today = isToday(firstDate);
      const yesterday = isYesterday(firstDate);

      let label = format(firstDate, 'EEEE');
      if (today) label = 'Today';
      else if (yesterday) label = 'Yesterday';

      const subLabel = isThisYear(firstDate)
        ? format(firstDate, 'MMMM d')
        : format(firstDate, 'MMMM d, yyyy');

      const types = Array.from(new Set(groupEntries.map((e) => e.type)));
      const moods = Array.from(
        new Set(
          groupEntries
            .map((e) => e.mood)
            .filter((m): m is Mood => Boolean(m))
        )
      );

      return {
        dateKey,
        date: firstDate,
        label,
        subLabel,
        isToday: today,
        isYesterday: yesterday,
        entries: groupEntries,
        types,
        moods,
      };
    });
  }, [entries]);

  // Track collapsed state per day key (default: all expanded)
  const [collapsedDays, setCollapsedDays] = useState<Record<string, boolean>>({});

  const toggleDayCollapse = (dateKey: string) => {
    setCollapsedDays((prev) => ({
      ...prev,
      [dateKey]: !prev[dateKey],
    }));
  };

  const collapseAll = () => {
    const all: Record<string, boolean> = {};
    groups.forEach((g) => {
      all[g.dateKey] = true;
    });
    setCollapsedDays(all);
  };

  const expandAll = () => {
    setCollapsedDays({});
  };

  const getTypeIcon = (type: EntryType) => {
    switch (type) {
      case 'voice':
        return <Mic className="w-3.5 h-3.5 text-[#6C4FF6] dark:text-[#856DF8]" />;
      case 'video':
        return <Video className="w-3.5 h-3.5 text-[#D95CFF]" />;
      case 'photo':
        return <Camera className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />;
      case 'mixed':
        return <Layers className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />;
      default:
        return <PenLine className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />;
    }
  };

  const getTypeBadgeClass = (type: EntryType) => {
    switch (type) {
      case 'voice':
        return 'bg-[#F1EEFF] dark:bg-[#6C4FF6]/20 text-[#6C4FF6] dark:text-[#856DF8] border-[#6C4FF6]/25';
      case 'video':
        return 'bg-fuchsia-50 dark:bg-fuchsia-950/40 text-fuchsia-600 dark:text-fuchsia-400 border-fuchsia-200 dark:border-fuchsia-800/40';
      case 'photo':
        return 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/40';
      case 'mixed':
        return 'bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800/40';
      default:
        return 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/40';
    }
  };

  if (groups.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Top Stack Controller Summary */}
      <div className="flex items-center justify-between text-xs text-app-text-secondary px-1">
        <span className="font-semibold">
          {groups.length} {groups.length === 1 ? 'day recorded' : 'days recorded'} • {entries.length} total moments
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={expandAll}
            className="text-xs hover:text-[#6C4FF6] dark:hover:text-[#856DF8] transition-colors cursor-pointer"
          >
            Expand all
          </button>
          <span>·</span>
          <button
            onClick={collapseAll}
            className="text-xs hover:text-[#6C4FF6] dark:hover:text-[#856DF8] transition-colors cursor-pointer"
          >
            Collapse all
          </button>
        </div>
      </div>

      {/* Day Stacks */}
      <div className="space-y-5">
        {groups.map((group) => {
          const isCollapsed = !!collapsedDays[group.dateKey];

          return (
            <div
              key={group.dateKey}
              className="rounded-2xl border border-app-border bg-white dark:bg-[#201F28] shadow-subtle overflow-hidden transition-all duration-200 hover:border-[#6C4FF6]/30"
            >
              {/* Day Header Tab */}
              <div
                onClick={() => toggleDayCollapse(group.dateKey)}
                className={`p-4 sm:p-5 flex items-center justify-between gap-3 cursor-pointer select-none transition-colors ${
                  group.isToday
                    ? 'bg-gradient-to-r from-[#F1EEFF]/70 via-white to-white dark:from-[#6C4FF6]/15 dark:via-[#201F28] dark:to-[#201F28]'
                    : 'bg-app-surface-secondary/60 dark:bg-[#26252F]/60 hover:bg-app-surface-secondary dark:hover:bg-[#26252F]'
                }`}
              >
                <div className="flex items-center gap-3 flex-wrap">
                  {/* Calendar Pill */}
                  <div
                    className={`p-2 rounded-xl flex items-center justify-center ${
                      group.isToday
                        ? 'bg-[#6C4FF6] text-white shadow-soft'
                        : 'bg-white dark:bg-[#201F28] text-[#6C4FF6] dark:text-[#856DF8] border border-app-border'
                    }`}
                  >
                    <Calendar className="w-4 h-4" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-sans text-base sm:text-lg font-bold text-app-text">
                        {group.label}
                      </h3>
                      <span className="text-xs sm:text-sm font-medium text-app-text-secondary">
                        — {group.subLabel}
                      </span>
                      {group.isToday && (
                        <span className="text-[10px] uppercase font-bold tracking-wider bg-[#6C4FF6] text-white px-2 py-0.5 rounded-full shadow-subtle">
                          Today
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-app-text-muted mt-0.5">
                      {group.entries.length} {group.entries.length === 1 ? 'entry stacked' : 'entries stacked'} for this day
                    </p>
                  </div>
                </div>

                {/* Right badges & Collapse chevron */}
                <div className="flex items-center gap-2 sm:gap-3">
                  {/* Modality icons stack */}
                  <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white dark:bg-[#201F28] border border-app-border text-xs">
                    {group.types.map((t) => (
                      <span key={t} title={`${t} entry`}>
                        {getTypeIcon(t)}
                      </span>
                    ))}
                  </div>

                  {/* Moods recorded */}
                  {group.moods.length > 0 && (
                    <div className="flex items-center gap-0.5 text-base">
                      {group.moods.map((m) => {
                        const moodInfo = getMoodDetails(m as any);
                        return (
                          <span key={m} title={moodInfo?.label}>
                            {moodInfo?.emoji}
                          </span>
                        );
                      })}
                    </div>
                  )}

                  {/* Toggle button */}
                  <div className="p-1 rounded-lg text-app-text-muted hover:text-app-text">
                    {isCollapsed ? (
                      <ChevronDown className="w-5 h-5" />
                    ) : (
                      <ChevronUp className="w-5 h-5" />
                    )}
                  </div>
                </div>
              </div>

              {/* Day Entries Content (when expanded) */}
              {!isCollapsed && (
                <div className="p-4 sm:p-5 border-t border-app-border space-y-3.5 animate-slide-up">
                  {group.entries.map((entry) => {
                    const moodInfo = getMoodDetails(entry.mood);
                    const timeStr = format(new Date(entry.createdAt), 'h:mm a');
                    const audioItem = entry.media?.find(
                      (m) => m.type === 'audio' || m.type === 'video'
                    );

                    return (
                      <div
                        key={entry.id}
                        onClick={() => onOpenEntry(entry.id)}
                        className="group relative rounded-xl p-4 bg-app-surface-secondary/40 dark:bg-[#26252F]/40 border border-app-border hover:border-[#6C4FF6]/40 hover:bg-white dark:hover:bg-[#201F28] hover:shadow-soft transition-all duration-200 cursor-pointer"
                      >
                        <div className="flex items-start justify-between gap-3">
                          {/* Time & Modality Badges */}
                          <div className="flex items-center gap-2 flex-wrap text-xs mb-2">
                            <span className="flex items-center gap-1 font-mono text-[11px] font-bold text-app-text bg-white dark:bg-[#201F28] px-2.5 py-1 rounded-lg border border-app-border">
                              <Clock className="w-3 h-3 text-[#6C4FF6]" />
                              <span>{timeStr}</span>
                            </span>

                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold border ${getTypeBadgeClass(
                                entry.type
                              )}`}
                            >
                              {getTypeIcon(entry.type)}
                              <span className="capitalize">{entry.type}</span>
                            </span>

                            {audioItem?.duration ? (
                              <span className="text-[11px] font-mono text-app-text-secondary bg-white dark:bg-[#201F28] px-2 py-0.5 rounded-md border border-app-border">
                                {Math.floor(audioItem.duration / 60)}:
                                {String(
                                  Math.floor(audioItem.duration % 60)
                                ).padStart(2, '0')}
                              </span>
                            ) : null}

                            {entry.reflection && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#6C4FF6] dark:text-[#856DF8] bg-[#F1EEFF] dark:bg-[#6C4FF6]/20 px-2 py-0.5 rounded-full border border-[#6C4FF6]/20">
                                <Sparkles className="w-2.5 h-2.5" />
                                <span>Reflected</span>
                              </span>
                            )}
                          </div>

                          {/* Quick Actions (Favorite & Edit/Delete) */}
                          <div
                            className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={() => onToggleFavorite(entry.id)}
                              className={`p-1.5 rounded-lg hover:bg-app-surface-secondary transition-colors cursor-pointer ${
                                entry.isFavorite
                                  ? 'text-rose-500'
                                  : 'text-app-text-muted hover:text-app-text'
                              }`}
                              title={
                                entry.isFavorite
                                  ? 'Remove favorite'
                                  : 'Add to favorites'
                              }
                            >
                              <Heart
                                className={`w-4 h-4 ${
                                  entry.isFavorite ? 'fill-rose-500' : ''
                                }`}
                              />
                            </button>

                            <button
                              onClick={() => onEditEntry(entry.id)}
                              className="p-1.5 rounded-lg text-app-text-muted hover:text-app-text hover:bg-app-surface-secondary transition-colors cursor-pointer"
                              title="Edit entry"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => onDeleteEntry(entry.id)}
                              className="p-1.5 rounded-lg text-app-text-muted hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                              title="Delete entry"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Title & Mood */}
                        <div className="flex items-start justify-between gap-3 mb-1.5">
                          <h4 className="font-sans text-sm sm:text-base font-bold text-app-text group-hover:text-[#6C4FF6] dark:group-hover:text-[#856DF8] transition-colors">
                            {entry.title || 'Untitled Memory'}
                          </h4>
                          {moodInfo && (
                            <span
                              className="text-lg shrink-0"
                              title={`Mood: ${moodInfo.label}`}
                            >
                              {moodInfo.emoji}
                            </span>
                          )}
                        </div>

                        {/* Snippet */}
                        <p className="text-xs sm:text-sm text-app-text-secondary line-clamp-2 leading-relaxed mb-3">
                          {entry.text ||
                            entry.transcript ||
                            entry.reflection?.summary ||
                            'A quiet moment captured in Memento.'}
                        </p>

                        {/* Media Preview if attachments exist */}
                        {entry.media && entry.media.length > 0 && (
                          <div className="flex items-center gap-2 mb-3 overflow-hidden rounded-lg">
                            {entry.media
                              .filter(
                                (m) =>
                                  (m.type === 'image' || m.type === 'video') &&
                                  (m.url || m.thumbnailUrl)
                              )
                              .slice(0, 3)
                              .map((m) => (
                                <div
                                  key={m.id}
                                  className="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border border-app-border"
                                >
                                  <img
                                    src={m.thumbnailUrl || m.url}
                                    alt="attachment"
                                    className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                                  />
                                  {m.type === 'video' && (
                                    <span className="absolute bottom-1 right-1 px-1 py-0.2 rounded bg-black/70 text-[8px] font-semibold text-white">
                                      Video
                                    </span>
                                  )}
                                </div>
                              ))}
                          </div>
                        )}

                        {/* Footer tags */}
                        {entry.tags.length > 0 && (
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {entry.tags.slice(0, 4).map((tag) => (
                              <Badge key={tag} variant="default" size="sm">
                                #{tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
