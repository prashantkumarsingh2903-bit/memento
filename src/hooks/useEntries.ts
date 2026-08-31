import { useState, useEffect, useCallback, useMemo } from 'react';
import type { JournalEntry, Mood, EntryType } from '../types';
import { storageService } from '../services/storage/storageService';

export interface EntryFilters {
  searchQuery: string;
  selectedMood: Mood | 'all';
  selectedType: EntryType | 'all';
  selectedTag: string | 'all';
  favoritesOnly: boolean;
}

export function useEntries() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [filters, setFilters] = useState<EntryFilters>({
    searchQuery: '',
    selectedMood: 'all',
    selectedType: 'all',
    selectedTag: 'all',
    favoritesOnly: false,
  });

  const reloadEntries = useCallback(() => {
    try {
      const data = storageService.getEntries();
      setEntries(data);
    } catch (e) {
      console.error('Failed to load entries:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    reloadEntries();
  }, [reloadEntries]);

  // CRUD
  const createEntry = useCallback(
    (data: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>) => {
      const newEntry = storageService.createEntry(data);
      reloadEntries();
      return newEntry;
    },
    [reloadEntries]
  );

  const updateEntry = useCallback(
    (id: string, updates: Partial<JournalEntry>) => {
      const updated = storageService.updateEntry(id, updates);
      reloadEntries();
      return updated;
    },
    [reloadEntries]
  );

  const deleteEntry = useCallback(
    (id: string) => {
      const success = storageService.deleteEntry(id);
      reloadEntries();
      return success;
    },
    [reloadEntries]
  );

  const toggleFavorite = useCallback(
    (id: string) => {
      const updated = storageService.toggleFavorite(id);
      reloadEntries();
      return updated;
    },
    [reloadEntries]
  );

  const getEntryById = useCallback(
    (id: string) => {
      return entries.find((e) => e.id === id);
    },
    [entries]
  );

  // Available unique tags
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    entries.forEach((e) => {
      e.tags.forEach((t) => tagSet.add(t));
    });
    return Array.from(tagSet);
  }, [entries]);

  // Filtered & Searched entries
  const filteredEntries = useMemo(() => {
    const q = filters.searchQuery.toLowerCase().trim();

    return entries.filter((entry) => {
      // Mood filter
      if (filters.selectedMood !== 'all' && entry.mood !== filters.selectedMood) {
        return false;
      }

      // Type filter
      if (filters.selectedType !== 'all' && entry.type !== filters.selectedType) {
        return false;
      }

      // Tag filter
      if (filters.selectedTag !== 'all' && !entry.tags.includes(filters.selectedTag)) {
        return false;
      }

      // Favorite filter
      if (filters.favoritesOnly && !entry.isFavorite) {
        return false;
      }

      // Search Query across title, text, transcript, tags, reflection themes
      if (q) {
        const titleMatch = entry.title?.toLowerCase().includes(q);
        const textMatch = entry.text?.toLowerCase().includes(q);
        const transcriptMatch = entry.transcript?.toLowerCase().includes(q);
        const tagsMatch = entry.tags.some((t) => t.toLowerCase().includes(q));
        const themesMatch = entry.reflection?.themes.some((t) =>
          t.toLowerCase().includes(q)
        );
        const summaryMatch = entry.reflection?.summary?.toLowerCase().includes(q);

        if (
          !titleMatch &&
          !textMatch &&
          !transcriptMatch &&
          !tagsMatch &&
          !themesMatch &&
          !summaryMatch
        ) {
          return false;
        }
      }

      return true;
    });
  }, [entries, filters]);

  return {
    entries,
    filteredEntries,
    allTags,
    isLoading,
    filters,
    setFilters,
    createEntry,
    updateEntry,
    deleteEntry,
    toggleFavorite,
    getEntryById,
    reloadEntries,
  };
}
