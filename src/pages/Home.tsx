import React from 'react';
import {
  Mic,
  PenLine,
  Video,
  Camera,
  ArrowRight,
  BookOpen,
  Plus,
} from 'lucide-react';
import type { EntryType, JournalEntry, Mood, UserProfile } from '../types';
import { MoodSelector } from '../components/common/MoodSelector';
import { ReflectionPromptCard } from '../components/journal/ReflectionPromptCard';
import { JournalCard } from '../components/journal/JournalCard';
import { Button } from '../components/common/Button';

interface HomePageProps {
  entries: JournalEntry[];
  profile: UserProfile;
  onStartCapture: (type: EntryType, initialPrompt?: string, initialMood?: Mood) => void;
  onOpenEntry: (id: string) => void;
  onEditEntry: (id: string) => void;
  onDeleteEntry: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onNavigateToJournal: () => void;
}

export const Home: React.FC<HomePageProps> = ({
  entries,
  profile,
  onStartCapture,
  onOpenEntry,
  onEditEntry,
  onDeleteEntry,
  onToggleFavorite,
  onNavigateToJournal,
}) => {
  const [selectedMood, setSelectedMood] = React.useState<Mood | undefined>();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const handleMoodSelect = (mood: Mood) => {
    setSelectedMood(mood);
    // Suggest quick capture with chosen mood
    onStartCapture('text', undefined, mood);
  };

  const recentEntries = entries.slice(0, 4);

  return (
    <div className="space-y-10 max-w-4xl mx-auto">
      {/* 1. Welcoming Hero */}
      <section className="space-y-6">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-warm-text">
            {getGreeting()},{' '}
            <span className="italic font-normal">{profile.name.split(' ')[0]}</span>.
          </h1>
          <p className="text-sm sm:text-base text-warm-muted mt-2">
            How are you feeling right now?
          </p>
        </div>

        {/* Mood Selector */}
        <div className="pt-1">
          <MoodSelector
            value={selectedMood}
            onChange={handleMoodSelect}
            size="md"
          />
        </div>
      </section>

      {/* 2. Primary CTA: Capture a moment */}
      <section className="space-y-3.5">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl sm:text-2xl font-medium text-warm-text">
            Capture a moment
          </h2>
          <span className="text-xs text-warm-muted">Choose your medium</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {/* Speak */}
          <button
            onClick={() => onStartCapture('voice', undefined, selectedMood)}
            className="p-4 sm:p-5 rounded-3xl bg-warm-card border border-warm-border hover:border-warm-border-strong hover:shadow-soft hover:-translate-y-0.5 transition-all text-left flex flex-col justify-between group cursor-pointer"
          >
            <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200/50 dark:border-rose-800/40 w-fit mb-4 group-hover:scale-105 transition-transform">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-medium text-warm-text group-hover:text-warm-accent transition-colors">
                Speak
              </h3>
              <p className="text-xs text-warm-muted mt-0.5">Voice journal</p>
            </div>
          </button>

          {/* Write */}
          <button
            onClick={() => onStartCapture('text', undefined, selectedMood)}
            className="p-4 sm:p-5 rounded-3xl bg-warm-card border border-warm-border hover:border-warm-border-strong hover:shadow-soft hover:-translate-y-0.5 transition-all text-left flex flex-col justify-between group cursor-pointer"
          >
            <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200/50 dark:border-amber-800/40 w-fit mb-4 group-hover:scale-105 transition-transform">
              <PenLine className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-medium text-warm-text group-hover:text-warm-accent transition-colors">
                Write
              </h3>
              <p className="text-xs text-warm-muted mt-0.5">Text journal</p>
            </div>
          </button>

          {/* Record */}
          <button
            onClick={() => onStartCapture('video', undefined, selectedMood)}
            className="p-4 sm:p-5 rounded-3xl bg-warm-card border border-warm-border hover:border-warm-border-strong hover:shadow-soft hover:-translate-y-0.5 transition-all text-left flex flex-col justify-between group cursor-pointer"
          >
            <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800/40 w-fit mb-4 group-hover:scale-105 transition-transform">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-medium text-warm-text group-hover:text-warm-accent transition-colors">
                Record
              </h3>
              <p className="text-xs text-warm-muted mt-0.5">Video journal</p>
            </div>
          </button>

          {/* Photo */}
          <button
            onClick={() => onStartCapture('photo', undefined, selectedMood)}
            className="p-4 sm:p-5 rounded-3xl bg-warm-card border border-warm-border hover:border-warm-border-strong hover:shadow-soft hover:-translate-y-0.5 transition-all text-left flex flex-col justify-between group cursor-pointer"
          >
            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/40 w-fit mb-4 group-hover:scale-105 transition-transform">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-medium text-warm-text group-hover:text-warm-accent transition-colors">
                Photo
              </h3>
              <p className="text-xs text-warm-muted mt-0.5">Add photo</p>
            </div>
          </button>
        </div>
      </section>

      {/* 3. Today's Reflection Prompt */}
      <section>
        <ReflectionPromptCard
          onStartWritingWithPrompt={(promptText) =>
            onStartCapture('text', promptText, selectedMood)
          }
        />
      </section>

      {/* 4. Recent Memories */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-xl sm:text-2xl font-medium text-warm-text">
              Recent memories
            </h2>
            <p className="text-xs text-warm-muted">Your latest reflections</p>
          </div>

          {entries.length > 4 && (
            <button
              onClick={onNavigateToJournal}
              className="flex items-center gap-1 text-xs font-medium text-warm-accent hover:text-warm-accent-hover transition-colors"
            >
              <span>View all ({entries.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {recentEntries.length === 0 ? (
          <div className="bg-warm-card border border-warm-border rounded-3xl p-10 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-warm-accent-light text-warm-accent flex items-center justify-center mx-auto">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-serif text-xl font-medium text-warm-text">
                Your story starts here
              </h3>
              <p className="text-xs sm:text-sm text-warm-muted max-w-sm mx-auto mt-1">
                Capture your first thought, voice memo, or video memory today.
              </p>
            </div>
            <Button
              onClick={() => onStartCapture('text')}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Start journaling
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentEntries.map((entry) => (
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
      </section>
    </div>
  );
};
