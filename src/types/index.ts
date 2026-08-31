export type EntryType = 'text' | 'voice' | 'video' | 'photo' | 'mixed';

export type Mood = 'great' | 'good' | 'okay' | 'low' | 'difficult' | 'tired';

export interface MoodOption {
  value: Mood;
  label: string;
  emoji: string;
  colorClass: string;
  bgClass: string;
}

export interface MediaItem {
  id: string;
  type: 'audio' | 'video' | 'image';
  url: string; // Object URL or Base64 / IndexedDB key
  blob?: Blob;
  name?: string;
  size?: number;
  duration?: number; // In seconds
  thumbnailUrl?: string;
  createdAt: string;
}

export interface Reflection {
  id?: string;
  summary?: string;
  themes: string[];
  observations: string[];
  questions: string[];
  suggestedAction?: string;
  createdAt: string;
  userReflectionNotes?: string;
}

export interface JournalEntry {
  id: string;
  title: string;
  text?: string;
  mood?: Mood;
  type: EntryType;
  tags: string[];
  media: MediaItem[];
  transcript?: string;
  reflection?: Reflection;
  isFavorite?: boolean;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

export interface ReflectionPrompt {
  id: string;
  prompt: string;
  category: 'mindfulness' | 'gratitude' | 'growth' | 'clarity' | 'creativity';
  subtitle?: string;
}

export interface UserProfile {
  name: string;
  bio?: string;
  avatarUrl?: string;
  joinedDate: string;
  defaultMood?: Mood;
  defaultEntryType: EntryType;
  reminderTime?: string;
  enableReminders: boolean;
  autoTranscribe: boolean;
  aiReflectionEnabled: boolean;
  theme: 'light' | 'dark' | 'system';
}

export interface JournalStats {
  totalEntries: number;
  wordCount: number;
  audioDurationSeconds: number;
  videoDurationSeconds: number;
  streakDays: number;
  topMood: Mood | null;
  topThemes: { theme: string; count: number }[];
  moodDistribution: Record<Mood, number>;
  entriesThisMonth: number;
  typeDistribution: Record<EntryType, number>;
}

export type ActiveView = 'home' | 'journal' | 'reflect' | 'insights' | 'settings' | 'entry-detail' | 'new-entry' | 'edit-entry';

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  description?: string;
}
