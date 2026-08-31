import React from 'react';
import {
  Mic,
  PenLine,
  Video,
  Camera,
  ArrowRight,
  BookOpen,
  Plus,
  Sparkles,
  BarChart3,
  FileSpreadsheet,
} from 'lucide-react';
import type { EntryType, JournalEntry, Mood, UserProfile } from '../types';
import { ReflectionPromptCard } from '../components/journal/ReflectionPromptCard';
import { JournalCard } from '../components/journal/JournalCard';
import { Button } from '../components/common/Button';
import { QuoteOfTheDay, type MindfulQuote } from '../components/home/QuoteOfTheDay';
import { HomeAnalytics } from '../components/home/HomeAnalytics';

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
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const handleReflectOnQuote = (quote: MindfulQuote) => {
    const promptText = `"${quote.text}" — ${quote.author}\n\nWhat feelings or thoughts does this quote stir in you today?`;
    onStartCapture('text', promptText);
  };

  const recentEntries = entries.slice(0, 4);
  const displayName = profile.name?.trim() ? profile.name.trim().split(' ')[0] : 'Prashant';
  const initials = profile.name
    ? profile.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'ME';

  return (
    <div className="space-y-8 animate-fade-in">
      {/* 1. Header & Welcome Hero */}
      <section className="flex items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F1EEFF] dark:bg-[#6C4FF6]/18 text-[#6C4FF6] dark:text-[#856DF8] text-xs font-semibold mb-2 border border-[#6C4FF6]/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Multimodal Journal</span>
          </div>
          <h1 className="font-sans text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-app-text">
            {getGreeting()},{' '}
            <span className="text-[#6C4FF6] dark:text-[#856DF8]">{displayName}</span>
          </h1>
          <p className="text-xs sm:text-sm text-app-text-secondary mt-1 max-w-xl">
            {profile.bio || 'Your mindful sanctuary for deep thoughts, speech memos, and personal growth.'}
          </p>
        </div>

        {/* Hero Avatar */}
        <div className="shrink-0 hidden sm:block">
          {profile.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt={profile.name}
              className="w-14 h-14 rounded-2xl object-cover border-2 border-app-border shadow-soft"
            />
          ) : (
            <div className="w-14 h-14 rounded-2xl bg-[#F1EEFF] dark:bg-[#6C4FF6]/20 text-[#6C4FF6] dark:text-[#856DF8] font-bold text-lg flex items-center justify-center border border-[#6C4FF6]/20 shadow-soft">
              {initials}
            </div>
          )}
        </div>
      </section>

      {/* 2. Quote of the Day (Directly under the Good Morning / Welcome area) */}
      <section>
        <QuoteOfTheDay onReflect={handleReflectOnQuote} />
      </section>

      {/* ========================================================================= */}
      {/* CATEGORY 1: INPUT PART (Creation & Capture Studio)                         */}
      {/* ========================================================================= */}
      <section className="space-y-4">
        {/* 4 Capture Modality Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {/* Speak / Voice */}
          <button
            onClick={() => onStartCapture('voice')}
            className="p-4 sm:p-5 rounded-card bg-white dark:bg-[#201F28] border border-app-border hover:border-[#6C4FF6]/40 hover:shadow-soft hover:-translate-y-0.5 transition-all text-left flex flex-col justify-between group cursor-pointer"
          >
            <div className="p-3 rounded-xl bg-[#F1EEFF] dark:bg-[#6C4FF6]/20 text-[#6C4FF6] dark:text-[#856DF8] border border-[#6C4FF6]/20 w-fit mb-4 group-hover:scale-105 transition-transform">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <h3 className="font-sans text-sm sm:text-base font-bold text-app-text group-hover:text-[#6C4FF6] dark:group-hover:text-[#856DF8] transition-colors">
                  Speak
                </h3>
                <span className="text-[9px] font-semibold text-[#6C4FF6] uppercase">Audio</span>
              </div>
              <p className="text-[11px] text-app-text-secondary mt-0.5">Live STT transcript</p>
            </div>
          </button>

          {/* Write / Text */}
          <button
            onClick={() => onStartCapture('text')}
            className="p-4 sm:p-5 rounded-card bg-white dark:bg-[#201F28] border border-app-border hover:border-cyan-400/40 hover:shadow-soft hover:-translate-y-0.5 transition-all text-left flex flex-col justify-between group cursor-pointer"
          >
            <div className="p-3 rounded-xl bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400 border border-cyan-200/50 dark:border-cyan-800/40 w-fit mb-4 group-hover:scale-105 transition-transform">
              <PenLine className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <h3 className="font-sans text-sm sm:text-base font-bold text-app-text group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                  Write
                </h3>
                <span className="text-[9px] font-semibold text-cyan-600 uppercase">Text</span>
              </div>
              <p className="text-[11px] text-app-text-secondary mt-0.5">Markdown editor</p>
            </div>
          </button>

          {/* Record / Video */}
          <button
            onClick={() => onStartCapture('video')}
            className="p-4 sm:p-5 rounded-card bg-white dark:bg-[#201F28] border border-app-border hover:border-fuchsia-400/40 hover:shadow-soft hover:-translate-y-0.5 transition-all text-left flex flex-col justify-between group cursor-pointer"
          >
            <div className="p-3 rounded-xl bg-fuchsia-50 dark:bg-fuchsia-950/40 text-fuchsia-600 dark:text-fuchsia-400 border border-fuchsia-200/50 dark:border-fuchsia-800/40 w-fit mb-4 group-hover:scale-105 transition-transform">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <h3 className="font-sans text-sm sm:text-base font-bold text-app-text group-hover:text-fuchsia-600 dark:group-hover:text-fuchsia-400 transition-colors">
                  Record
                </h3>
                <span className="text-[9px] font-semibold text-fuchsia-600 uppercase">Video</span>
              </div>
              <p className="text-[11px] text-app-text-secondary mt-0.5">Webcam viewfinder</p>
            </div>
          </button>

          {/* Photo */}
          <button
            onClick={() => onStartCapture('photo')}
            className="p-4 sm:p-5 rounded-card bg-white dark:bg-[#201F28] border border-app-border hover:border-emerald-400/40 hover:shadow-soft hover:-translate-y-0.5 transition-all text-left flex flex-col justify-between group cursor-pointer"
          >
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/40 w-fit mb-4 group-hover:scale-105 transition-transform">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <h3 className="font-sans text-sm sm:text-base font-bold text-app-text group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  Photo
                </h3>
                <span className="text-[9px] font-semibold text-emerald-600 uppercase">Image</span>
              </div>
              <p className="text-[11px] text-app-text-secondary mt-0.5">Visual attachment</p>
            </div>
          </button>
        </div>

        {/* Guided Prompt Input Studio */}
        <div className="pt-2">
          <ReflectionPromptCard
            onStartWritingWithPrompt={(promptText) =>
              onStartCapture('text', promptText)
            }
          />
        </div>
      </section>

      {/* ========================================================================= */}
      {/* CATEGORY 2: REPORT PART (Analytics & Insights Hub)                         */}
      {/* ========================================================================= */}
      <section className="space-y-6 p-5 sm:p-6 rounded-2xl bg-app-surface-secondary/40 dark:bg-[#26252F]/40 border border-app-border">
        {/* Section Header with Category Badge */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/40">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-sans text-base sm:text-lg font-bold text-app-text">
                  Personal Analytics & Rhythm Report
                </h2>
                <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/40">
                  Report System
                </span>
              </div>
              <p className="text-xs text-app-text-secondary mt-0.5">
                Automated aggregation of journaling streaks, spoken audio minutes, and mindset trends
              </p>
            </div>
          </div>

          <button
            onClick={onNavigateToJournal}
            className="text-xs text-[#6C4FF6] dark:text-[#856DF8] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
          >
            <span>Explore full journal</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Analytics Visualizations: 4 metrics + curve + donut */}
        <div>
          <HomeAnalytics entries={entries} />
        </div>

        {/* Recent Journal Records (Report Feed) */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-sans text-sm sm:text-base font-bold text-app-text flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-app-text-muted" />
                <span>Recent Memory Logs</span>
              </h3>
              <p className="text-xs text-app-text-secondary">
                Your most recent recorded entries and transcript notes
              </p>
            </div>

            {entries.length > 4 && (
              <button
                onClick={onNavigateToJournal}
                className="flex items-center gap-1 text-xs font-semibold text-[#6C4FF6] dark:text-[#856DF8] hover:text-[#5B3FD4] transition-colors cursor-pointer"
              >
                <span>View all ({entries.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {recentEntries.length === 0 ? (
            <div className="bg-white dark:bg-[#201F28] border border-app-border rounded-card p-10 text-center space-y-4 shadow-subtle">
              <div className="w-12 h-12 rounded-2xl bg-[#F1EEFF] dark:bg-[#6C4FF6]/20 text-[#6C4FF6] dark:text-[#856DF8] flex items-center justify-center mx-auto">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-sans text-lg font-bold text-app-text">
                  No memories recorded yet
                </h3>
                <p className="text-xs sm:text-sm text-app-text-secondary max-w-sm mx-auto mt-1">
                  Capture your first voice note, written reflection, or video journal above.
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
        </div>
      </section>
    </div>
  );
};

