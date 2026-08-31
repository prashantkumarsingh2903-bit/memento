import React from 'react';
import {
  format,
  isToday,
  isYesterday,
  isThisYear,
} from 'date-fns';
import type { JournalEntry, EntryType, Mood } from '../../types';
import { DayConsolidatedTab, type DayGroupData } from './DayConsolidatedTab';

interface DayGroupedEntriesProps {
  entries: JournalEntry[];
  onOpenEntry: (id: string) => void;
  onEditEntry: (id: string) => void;
  onDeleteEntry: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onStartCapture?: (type: EntryType) => void;
}

export const DayGroupedEntries: React.FC<DayGroupedEntriesProps> = ({
  entries,
  onOpenEntry,
  onEditEntry,
  onDeleteEntry,
  onToggleFavorite,
  onStartCapture,
}) => {
  // Group entries by date
  const groups: DayGroupData[] = React.useMemo(() => {
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

  if (groups.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Day Stacks: One Single Unified Master Tab per Day */}
      <div className="space-y-6">
        {groups.map((group, index) => (
          <DayConsolidatedTab
            key={group.dateKey}
            group={group}
            isInitiallyCollapsed={index > 1 && !group.isToday}
            onOpenEntry={onOpenEntry}
            onEditEntry={onEditEntry}
            onDeleteEntry={onDeleteEntry}
            onToggleFavorite={onToggleFavorite}
            onStartCapture={onStartCapture}
          />
        ))}
      </div>
    </div>
  );
};
