import type { JournalEntry, UserProfile, JournalStats, Mood, EntryType } from '../../types';
import { DEMO_ENTRIES } from '../../data/demoEntries';
import { storeMediaBlob, getMediaBlob, deleteMediaBlob, clearAllMediaBlobs } from './indexedDB';

const STORAGE_KEYS = {
  ENTRIES: 'memento_journal_entries',
  PROFILE: 'memento_user_profile',
  INITIALIZED: 'memento_has_initialized_v1',
};

const DEFAULT_PROFILE: UserProfile = {
  name: 'Elena Vance',
  bio: 'Product designer & writer. Exploring slow technology and mindful living.',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  joinedDate: '2024-01-15T00:00:00.000Z',
  defaultMood: 'good',
  defaultEntryType: 'text',
  enableReminders: true,
  reminderTime: '20:30',
  autoTranscribe: true,
  aiReflectionEnabled: true,
  theme: 'system',
};

class StorageService {
  private initialized = false;

  constructor() {
    this.ensureInitialized();
  }

  private ensureInitialized() {
    if (this.initialized || typeof window === 'undefined') return;

    try {
      const hasInit = localStorage.getItem(STORAGE_KEYS.INITIALIZED);
      if (!hasInit) {
        localStorage.setItem(STORAGE_KEYS.ENTRIES, JSON.stringify(DEMO_ENTRIES));
        localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(DEFAULT_PROFILE));
        localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
      }
      this.initialized = true;
    } catch (e) {
      console.warn('Storage initialization fallback:', e);
    }
  }

  // ── ENTRIES ──

  public getEntries(): JournalEntry[] {
    this.ensureInitialized();
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.ENTRIES);
      if (!raw) return DEMO_ENTRIES;
      const entries: JournalEntry[] = JSON.parse(raw);
      return entries.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } catch (e) {
      console.error('Error fetching entries:', e);
      return DEMO_ENTRIES;
    }
  }

  public getEntry(id: string): JournalEntry | undefined {
    const entries = this.getEntries();
    return entries.find((e) => e.id === id);
  }

  public createEntry(
    entryData: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>
  ): JournalEntry {
    const entries = this.getEntries();
    const now = new Date().toISOString();
    const newEntry: JournalEntry = {
      ...entryData,
      id: `entry-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: now,
      updatedAt: now,
    };

    const updated = [newEntry, ...entries];
    localStorage.setItem(STORAGE_KEYS.ENTRIES, JSON.stringify(updated));
    return newEntry;
  }

  public updateEntry(id: string, updates: Partial<JournalEntry>): JournalEntry | null {
    const entries = this.getEntries();
    const index = entries.findIndex((e) => e.id === id);
    if (index === -1) return null;

    const updatedEntry: JournalEntry = {
      ...entries[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    entries[index] = updatedEntry;
    localStorage.setItem(STORAGE_KEYS.ENTRIES, JSON.stringify(entries));
    return updatedEntry;
  }

  public deleteEntry(id: string): boolean {
    const entries = this.getEntries();
    const target = entries.find((e) => e.id === id);
    if (!target) return false;

    // Clean up indexedDB blobs if any
    if (target.media && target.media.length > 0) {
      target.media.forEach((item) => {
        if (item.id) deleteMediaBlob(item.id);
      });
    }

    const filtered = entries.filter((e) => e.id !== id);
    localStorage.setItem(STORAGE_KEYS.ENTRIES, JSON.stringify(filtered));
    return true;
  }

  public toggleFavorite(id: string): JournalEntry | null {
    const entry = this.getEntry(id);
    if (!entry) return null;
    return this.updateEntry(id, { isFavorite: !entry.isFavorite });
  }

  // ── MEDIA BLOB HELPERS ──

  public async saveMedia(id: string, blob: Blob): Promise<string> {
    return storeMediaBlob(id, blob);
  }

  public async getMedia(id: string): Promise<Blob | null> {
    return getMediaBlob(id);
  }

  public async deleteMedia(id: string): Promise<void> {
    return deleteMediaBlob(id);
  }

  // ── PROFILE ──

  public getProfile(): UserProfile {
    this.ensureInitialized();
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
      if (!raw) return DEFAULT_PROFILE;
      return { ...DEFAULT_PROFILE, ...JSON.parse(raw) };
    } catch {
      return DEFAULT_PROFILE;
    }
  }

  public updateProfile(updates: Partial<UserProfile>): UserProfile {
    const current = this.getProfile();
    const updated = { ...current, ...updates };
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(updated));
    return updated;
  }

  // ── STATS & INSIGHTS HELPER ──

  public getStats(): JournalStats {
    const entries = this.getEntries();
    let wordCount = 0;
    let audioDurationSeconds = 0;
    let videoDurationSeconds = 0;

    const moodCounts: Record<Mood, number> = {
      great: 0,
      good: 0,
      okay: 0,
      low: 0,
      difficult: 0,
      tired: 0,
    };

    const typeCounts: Record<EntryType, number> = {
      text: 0,
      voice: 0,
      video: 0,
      photo: 0,
      mixed: 0,
    };

    const themeMap: Record<string, number> = {};

    entries.forEach((e) => {
      // Word count
      if (e.text) {
        wordCount += e.text.trim().split(/\s+/).filter(Boolean).length;
      }
      if (e.transcript) {
        wordCount += e.transcript.trim().split(/\s+/).filter(Boolean).length;
      }

      // Mood counts
      if (e.mood && moodCounts[e.mood] !== undefined) {
        moodCounts[e.mood]++;
      }

      // Type counts
      if (e.type && typeCounts[e.type] !== undefined) {
        typeCounts[e.type]++;
      }

      // Media duration
      if (e.media) {
        e.media.forEach((m) => {
          if (m.type === 'audio' && m.duration) audioDurationSeconds += m.duration;
          if (m.type === 'video' && m.duration) videoDurationSeconds += m.duration;
        });
      }

      // Themes from reflection & tags
      if (e.reflection?.themes) {
        e.reflection.themes.forEach((t) => {
          themeMap[t] = (themeMap[t] || 0) + 1;
        });
      }
      if (e.tags) {
        e.tags.forEach((t) => {
          themeMap[t] = (themeMap[t] || 0) + 1;
        });
      }
    });

    // Top mood
    let topMood: Mood | null = null;
    let maxMoodCount = 0;
    (Object.keys(moodCounts) as Mood[]).forEach((m) => {
      if (moodCounts[m] > maxMoodCount) {
        maxMoodCount = moodCounts[m];
        topMood = m;
      }
    });

    // Top themes
    const topThemes = Object.entries(themeMap)
      .map(([theme, count]) => ({ theme, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    // This month entries
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const entriesThisMonth = entries.filter(
      (e) => new Date(e.createdAt).getTime() > thirtyDaysAgo
    ).length;

    return {
      totalEntries: entries.length,
      wordCount,
      audioDurationSeconds,
      videoDurationSeconds,
      streakDays: Math.min(entries.length > 0 ? 5 : 0, 14),
      topMood,
      topThemes,
      moodDistribution: moodCounts,
      entriesThisMonth,
      typeDistribution: typeCounts,
    };
  }

  // ── BACKUP & DATA MANAGEMENT ──

  public exportAllData(): string {
    const data = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      profile: this.getProfile(),
      entries: this.getEntries(),
    };
    return JSON.stringify(data, null, 2);
  }

  public importData(jsonData: string): boolean {
    try {
      const parsed = JSON.parse(jsonData);
      if (Array.isArray(parsed.entries)) {
        localStorage.setItem(STORAGE_KEYS.ENTRIES, JSON.stringify(parsed.entries));
      }
      if (parsed.profile) {
        localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(parsed.profile));
      }
      return true;
    } catch (e) {
      console.error('Import error:', e);
      return false;
    }
  }

  public resetToDemo(): void {
    localStorage.setItem(STORAGE_KEYS.ENTRIES, JSON.stringify(DEMO_ENTRIES));
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(DEFAULT_PROFILE));
  }

  public async clearAll(): Promise<void> {
    localStorage.removeItem(STORAGE_KEYS.ENTRIES);
    localStorage.removeItem(STORAGE_KEYS.PROFILE);
    localStorage.removeItem(STORAGE_KEYS.INITIALIZED);
    await clearAllMediaBlobs();
  }
}

export const storageService = new StorageService();
