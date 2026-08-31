import React from 'react';
import {
  Search,
  SlidersHorizontal,
  X,
  Plus,
  BookOpen,
  Heart,
} from 'lucide-react';
import type { JournalEntry, Mood, EntryType } from '../types';
import type { EntryFilters } from '../hooks/useEntries';
import { JournalCard } from '../components/journal/JournalCard';
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
  const [showFilters, setShowFilters] = React.useState(false);

  const entryTypeOptions: { value: EntryType | 'all'; label: string }[] = [
    { value: 'all', label: 'All types' },
    { value: 'text', label: '✍ Text' },
    { value: 'voice', label: '🎙 Voice' },
    { value: 'video', label: '🎥 Video' },
    { value: 'photo', label: '📷 Photo' },
    { value: 'mixed', label: '🧩 Mixed' },
  ];

  const hasActiveFilters =
    filters.searchQuery !== '' ||
    filters.selectedMood !== 'all' ||
    filters.selectedType !== 'all' ||
    filters.selectedTag !== 'all' ||
    filters.favoritesOnly;

  const resetFilters = () => {
    onFilterChange({
      searchQuery: '',
      selectedMood: 'all',
      selectedType: 'all',
      selectedTag: 'all',
      favoritesOnly: false,
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header & Search Bar */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl font-medium tracking-tight text-warm-text">
              Journal Timeline
            </h1>
            <p className="text-xs sm:text-sm text-warm-muted mt-1">
              {entries.length} {entries.length === 1 ? 'memory' : 'memories'} in total
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

        {/* Search Input */}
        <div className="relative flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-warm-faint absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={filters.searchQuery}
              onChange={(e) =>
                onFilterChange({ ...filters, searchQuery: e.target.value })
              }
              placeholder="Search by title, thoughts, tags, transcripts, themes..."
              className="w-full bg-warm-card border border-warm-border rounded-2xl pl-10 pr-10 py-2.5 text-sm text-warm-text placeholder:text-warm-faint focus:border-warm-accent focus:ring-2 focus:ring-warm-accent/15 transition-all outline-none"
            />
            {filters.searchQuery && (
              <button
                onClick={() => onFilterChange({ ...filters, searchQuery: '' })}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-warm-faint hover:text-warm-text"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2.5 rounded-2xl border transition-all flex items-center gap-1.5 text-xs font-medium ${
              showFilters || hasActiveFilters
                ? 'bg-warm-accent-light text-warm-accent border-warm-accent/30'
                : 'bg-warm-card border-warm-border text-warm-muted hover:text-warm-text'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">Filters</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-warm-accent" />
            )}
          </button>
        </div>

        {/* Filter Drawer / Panel */}
        {showFilters && (
          <div className="bg-warm-card border border-warm-border rounded-3xl p-5 shadow-subtle space-y-4 animate-slide-up">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-warm-muted">
                Filter Journal
              </span>
              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="text-xs text-warm-accent hover:underline"
                >
                  Reset all filters
                </button>
              )}
            </div>

            {/* Type Filter */}
            <div>
              <label className="text-xs text-warm-muted font-medium block mb-2">
                Entry Type
              </label>
              <div className="flex items-center gap-1.5 flex-wrap">
                {entryTypeOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() =>
                      onFilterChange({ ...filters, selectedType: opt.value })
                    }
                    className={`text-xs px-3 py-1.5 rounded-xl border font-medium transition-all ${
                      filters.selectedType === opt.value
                        ? 'bg-warm-accent-light text-warm-accent border-warm-accent/40 font-semibold'
                        : 'bg-warm-card-subtle text-warm-muted border-warm-border hover:text-warm-text'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Mood Filter */}
            <div>
              <label className="text-xs text-warm-muted font-medium block mb-2">
                Mood
              </label>
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  onClick={() =>
                    onFilterChange({ ...filters, selectedMood: 'all' })
                  }
                  className={`text-xs px-3 py-1.5 rounded-xl border font-medium transition-all ${
                    filters.selectedMood === 'all'
                      ? 'bg-warm-accent-light text-warm-accent border-warm-accent/40 font-semibold'
                      : 'bg-warm-card-subtle text-warm-muted border-warm-border hover:text-warm-text'
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
                    className={`text-xs px-2.5 py-1.5 rounded-xl border font-medium transition-all flex items-center gap-1 ${
                      filters.selectedMood === m.value
                        ? 'bg-warm-accent-light text-warm-accent border-warm-accent/40 font-semibold'
                        : 'bg-warm-card-subtle text-warm-muted border-warm-border hover:text-warm-text'
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
                <label className="text-xs text-warm-muted font-medium block mb-2">
                  Tags
                </label>
                <div className="flex items-center gap-1.5 flex-wrap max-h-24 overflow-y-auto">
                  <button
                    onClick={() =>
                      onFilterChange({ ...filters, selectedTag: 'all' })
                    }
                    className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                      filters.selectedTag === 'all'
                        ? 'bg-warm-accent-light text-warm-accent border-warm-accent/40 font-semibold'
                        : 'bg-warm-card-subtle text-warm-muted border-warm-border'
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
                      className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                        filters.selectedTag === tag
                          ? 'bg-warm-accent-light text-warm-accent border-warm-accent/40 font-semibold'
                          : 'bg-warm-card-subtle text-warm-muted border-warm-border hover:text-warm-text'
                      }`}
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Favorites Only Toggle */}
            <div className="pt-2 border-t border-warm-border/60 flex items-center justify-between">
              <label
                htmlFor="fav-filter"
                className="text-xs text-warm-muted font-medium flex items-center gap-1.5 cursor-pointer"
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
                className="rounded text-warm-accent focus:ring-warm-accent"
              />
            </div>
          </div>
        )}
      </div>

      {/* Timeline Entries List */}
      <div className="space-y-4">
        {entries.length === 0 ? (
          <div className="bg-warm-card border border-warm-border rounded-3xl p-12 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-warm-card-subtle text-warm-muted flex items-center justify-center mx-auto">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-serif text-xl font-medium text-warm-text">
                {hasActiveFilters ? 'No matching memories found' : 'No journal entries yet'}
              </h3>
              <p className="text-xs sm:text-sm text-warm-muted max-w-sm mx-auto mt-1">
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
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {entries.map((entry) => (
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
