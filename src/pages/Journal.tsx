import React, { useState } from 'react';
import {
  Search,
  SlidersHorizontal,
  X,
  Plus,
  BookOpen,
  Heart,
  Layers,
  LayoutGrid,
} from 'lucide-react';
import type { JournalEntry, Mood, EntryType } from '../types';
import type { EntryFilters } from '../hooks/useEntries';
import { JournalCard } from '../components/journal/JournalCard';
import { DayGroupedEntries } from '../components/journal/DayGroupedEntries';
import { MOOD_OPTIONS } from '../components/common/MoodSelector';
import { Button } from '../components/common/Button';

interface JournalPageProps {
  entries: JournalEntry[];
  allTags: string[];
  filters: EntryFilters;
  onFilterChange: (filters: EntryFilters) => void;
  onOpenEntry: (id: string) => void;
  onEditEntry: (id: string) => void;
  onDeleteEntry: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onStartCapture: (type: EntryType) => void;
}

export const Journal: React.FC<JournalPageProps> = ({
  entries,
  allTags,
  filters,
  onFilterChange,
  onOpenEntry,
  onEditEntry,
  onDeleteEntry,
  onToggleFavorite,
  onStartCapture,
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [timeRange, setTimeRange] = useState<'all' | 'week' | 'month' | 'year'>('all');
  const [viewMode, setViewMode] = useState<'stacked' | 'grid'>('stacked');

  const entryTypeOptions: { value: EntryType | 'all'; label: string }[] = [
    { value: 'all', label: 'All types' },
    { value: 'text', label: '✍ Text' },
    { value: 'voice', label: '🎙 Voice' },
    { value: 'video', label: '🎥 Video' },
    { value: 'photo', label: '📷 Photo' },
    { value: 'mixed', label: '🧩 Mixed' },
  ];

  // Filter entries by time range client-side
  const filteredByTime = entries.filter((entry) => {
    if (timeRange === 'all') return true;
    const date = new Date(entry.createdAt);
    const now = new Date();
    if (timeRange === 'week') {
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return date >= oneWeekAgo;
    }
    if (timeRange === 'month') {
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return date >= oneMonthAgo;
    }
    if (timeRange === 'year') {
      const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      return date >= oneYearAgo;
    }
    return true;
  });

  const hasActiveFilters =
    filters.searchQuery !== '' ||
    filters.selectedMood !== 'all' ||
    filters.selectedType !== 'all' ||
    filters.selectedTag !== 'all' ||
    filters.favoritesOnly ||
    timeRange !== 'all';

  const resetFilters = () => {
    setTimeRange('all');
    onFilterChange({
      searchQuery: '',
      selectedMood: 'all',
      selectedType: 'all',
      selectedTag: 'all',
      favoritesOnly: false,
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header & Controls */}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-sans text-2xl sm:text-3xl font-extrabold tracking-tight text-app-text">
              Journal Timeline
            </h1>
            <p className="text-xs sm:text-sm text-app-text-secondary mt-1">
              {filteredByTime.length} {filteredByTime.length === 1 ? 'entry' : 'entries'} captured
            </p>
          </div>

          <Button
            size="sm"
            onClick={() => onStartCapture('text')}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            New Entry
          </Button>
        </div>

        {/* Time Segmented Control Tabs & View Switcher */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="inline-flex p-1 rounded-xl bg-app-surface-secondary dark:bg-[#26252F] border border-app-border">
              {(['all', 'week', 'month', 'year'] as const).map((range) => {
                const labels = {
                  all: 'All Time',
                  week: 'This Week',
                  month: 'This Month',
                  year: 'This Year',
                };
                const isActive = timeRange === range;
                return (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-white dark:bg-[#201F28] text-[#6C4FF6] dark:text-[#856DF8] shadow-subtle'
                        : 'text-app-text-secondary hover:text-app-text'
                    }`}
                  >
                    {labels[range]}
                  </button>
                );
              })}
            </div>

            {/* View Mode Toggle: Stacked by Day vs Grid */}
            <div className="inline-flex p-1 rounded-xl bg-app-surface-secondary dark:bg-[#26252F] border border-app-border">
              <button
                onClick={() => setViewMode('stacked')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === 'stacked'
                    ? 'bg-white dark:bg-[#201F28] text-[#6C4FF6] dark:text-[#856DF8] shadow-subtle'
                    : 'text-app-text-secondary hover:text-app-text'
                }`}
                title="Stack entries of each day together in unified day tabs"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Stacked by Day</span>
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-[#201F28] text-[#6C4FF6] dark:text-[#856DF8] shadow-subtle'
                    : 'text-app-text-secondary hover:text-app-text'
                }`}
                title="View entries in a 2-column card grid"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Grid</span>
              </button>
            </div>
          </div>

          {/* Quick Filter toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-3 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 text-xs font-semibold cursor-pointer ${
              showFilters || hasActiveFilters
                ? 'bg-[#F1EEFF] dark:bg-[#6C4FF6]/20 text-[#6C4FF6] dark:text-[#856DF8] border-[#6C4FF6]/30'
                : 'bg-white dark:bg-[#201F28] border-app-border text-app-text-secondary hover:text-app-text'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-[#6C4FF6]" />
            )}
          </button>
        </div>

        {/* Search Input Bar */}
        <div className="relative flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-app-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={filters.searchQuery}
              onChange={(e) =>
                onFilterChange({ ...filters, searchQuery: e.target.value })
              }
              placeholder="Search memories by words, tags, transcripts, themes..."
              className="w-full bg-white dark:bg-[#201F28] border border-app-border rounded-xl pl-10 pr-10 py-2.5 text-sm text-app-text placeholder:text-app-text-muted focus:border-[#6C4FF6] focus:ring-2 focus:ring-[#6C4FF6]/15 transition-all outline-none"
            />
            {filters.searchQuery && (
              <button
                onClick={() => onFilterChange({ ...filters, searchQuery: '' })}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-app-text-muted hover:text-app-text cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Filter Drawer / Panel */}
        {showFilters && (
          <div className="bg-white dark:bg-[#201F28] border border-app-border rounded-card p-5 shadow-subtle space-y-4 animate-slide-up">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-app-text-secondary">
                Filter Criteria
              </span>
              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="text-xs text-[#6C4FF6] hover:underline font-semibold cursor-pointer"
                >
                  Reset all filters
                </button>
              )}
            </div>

            {/* Type Filter */}
            <div>
              <label className="text-xs text-app-text-secondary font-medium block mb-2">
                Entry Type
              </label>
              <div className="flex items-center gap-1.5 flex-wrap">
                {entryTypeOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() =>
                      onFilterChange({ ...filters, selectedType: opt.value })
                    }
                    className={`text-xs px-3 py-1.5 rounded-lg border font-semibold transition-all cursor-pointer ${
                      filters.selectedType === opt.value
                        ? 'bg-[#F1EEFF] dark:bg-[#6C4FF6]/20 text-[#6C4FF6] dark:text-[#856DF8] border-[#6C4FF6]/40'
                        : 'bg-app-surface-secondary dark:bg-[#26252F] text-app-text-secondary border-app-border hover:text-app-text'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Mood Filter */}
            <div>
              <label className="text-xs text-app-text-secondary font-medium block mb-2">
                Mood
              </label>
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  onClick={() =>
                    onFilterChange({ ...filters, selectedMood: 'all' })
                  }
                  className={`text-xs px-3 py-1.5 rounded-lg border font-semibold transition-all cursor-pointer ${
                    filters.selectedMood === 'all'
                      ? 'bg-[#F1EEFF] dark:bg-[#6C4FF6]/20 text-[#6C4FF6] dark:text-[#856DF8] border-[#6C4FF6]/40'
                      : 'bg-app-surface-secondary dark:bg-[#26252F] text-app-text-secondary border-app-border hover:text-app-text'
                  }`}
                >
                  All moods
                </button>
                {MOOD_OPTIONS.map((m) => (
                  <button
                    key={m.value}
                    onClick={() =>
                      onFilterChange({ ...filters, selectedMood: m.value as Mood })
                    }
                    className={`text-xs px-2.5 py-1.5 rounded-lg border font-medium transition-all flex items-center gap-1 cursor-pointer ${
                      filters.selectedMood === m.value
                        ? 'bg-[#F1EEFF] dark:bg-[#6C4FF6]/20 text-[#6C4FF6] dark:text-[#856DF8] border-[#6C4FF6]/40 font-semibold'
                        : 'bg-app-surface-secondary dark:bg-[#26252F] text-app-text-secondary border-app-border hover:text-app-text'
                    }`}
                  >
                    <span>{m.emoji}</span>
                    <span>{m.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tags Filter */}
            {allTags.length > 0 && (
              <div>
                <label className="text-xs text-app-text-secondary font-medium block mb-2">
                  Tags
                </label>
                <div className="flex items-center gap-1.5 flex-wrap max-h-24 overflow-y-auto">
                  <button
                    onClick={() =>
                      onFilterChange({ ...filters, selectedTag: 'all' })
                    }
                    className={`text-xs px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                      filters.selectedTag === 'all'
                        ? 'bg-[#F1EEFF] dark:bg-[#6C4FF6]/20 text-[#6C4FF6] dark:text-[#856DF8] border-[#6C4FF6]/40 font-semibold'
                        : 'bg-app-surface-secondary dark:bg-[#26252F] text-app-text-secondary border-app-border'
                    }`}
                  >
                    All Tags
                  </button>
                  {allTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() =>
                        onFilterChange({ ...filters, selectedTag: tag })
                      }
                      className={`text-xs px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                        filters.selectedTag === tag
                          ? 'bg-[#F1EEFF] dark:bg-[#6C4FF6]/20 text-[#6C4FF6] dark:text-[#856DF8] border-[#6C4FF6]/40 font-semibold'
                          : 'bg-app-surface-secondary dark:bg-[#26252F] text-app-text-secondary border-app-border hover:text-app-text'
                      }`}
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Favorites Only Toggle */}
            <div className="pt-2 border-t border-app-border flex items-center justify-between">
              <label
                htmlFor="fav-filter"
                className="text-xs text-app-text-secondary font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                <span>Favorites only</span>
              </label>
              <input
                id="fav-filter"
                type="checkbox"
                checked={filters.favoritesOnly}
                onChange={(e) =>
                  onFilterChange({ ...filters, favoritesOnly: e.target.checked })
                }
                className="w-4 h-4 rounded text-[#6C4FF6] focus:ring-[#6C4FF6] cursor-pointer"
              />
            </div>
          </div>
        )}
      </div>

      {/* Timeline Entries List */}
      <div className="space-y-4">
        {filteredByTime.length === 0 ? (
          <div className="bg-white dark:bg-[#201F28] border border-app-border rounded-card p-12 text-center space-y-4 shadow-subtle">
            <div className="w-12 h-12 rounded-2xl bg-app-surface-secondary dark:bg-[#26252F] text-app-text-muted flex items-center justify-center mx-auto">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-sans text-lg font-bold text-app-text">
                {hasActiveFilters ? 'No matching memories found' : 'No journal entries yet'}
              </h3>
              <p className="text-xs sm:text-sm text-app-text-secondary max-w-sm mx-auto mt-1">
                {hasActiveFilters
                  ? 'Try adjusting your search query or relaxing your filter conditions.'
                  : 'Begin by recording what is currently on your mind.'}
              </p>
            </div>
            {hasActiveFilters ? (
              <Button size="sm" variant="secondary" onClick={resetFilters}>
                Clear filters
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={() => onStartCapture('text')}
                leftIcon={<Plus className="w-4 h-4" />}
              >
                Write your first entry
              </Button>
            )}
          </div>
        ) : viewMode === 'stacked' ? (
          <DayGroupedEntries
            entries={filteredByTime}
            onOpenEntry={onOpenEntry}
            onEditEntry={onEditEntry}
            onDeleteEntry={onDeleteEntry}
            onToggleFavorite={onToggleFavorite}
            onStartCapture={onStartCapture}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredByTime.map((entry) => (
              <JournalCard
                key={entry.id}
                entry={entry}
                onOpen={onOpenEntry}
                onEdit={onEditEntry}
                onDelete={onDeleteEntry}
                onToggleFavorite={onToggleFavorite}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
