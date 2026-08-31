import React from 'react';
import {
  Sparkles,
  Heart,
  TrendingUp,
  Compass,
  ArrowRight,
  BookMarked,
  Quote,
} from 'lucide-react';
import type { JournalEntry } from '../types';
import { storageService } from '../services/storage/storageService';
import { formatDuration } from '../services/media/mediaUtils';
import { getMoodDetails } from '../components/common/MoodSelector';

interface InsightsPageProps {
  entries: JournalEntry[];
  onOpenEntry: (id: string) => void;
}

export const Insights: React.FC<InsightsPageProps> = ({
  entries,
  onOpenEntry,
}) => {
  const stats = storageService.getStats();

  const favoriteEntries = entries.filter((e) => e.isFavorite);
  const topMoodInfo = getMoodDetails(stats.topMood || undefined);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <section className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F1EEFF] dark:bg-[#6C4FF6]/18 text-[#6C4FF6] dark:text-[#856DF8] text-xs font-semibold border border-[#6C4FF6]/20">
          <Compass className="w-3.5 h-3.5" />
          <span>Long-Term Analytics</span>
        </div>
        <h1 className="font-sans text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-app-text">
          Personal Analytics & Journey
        </h1>
        <p className="text-xs sm:text-sm text-app-text-secondary max-w-xl leading-relaxed">
          Quiet observations, recurring patterns, and moments of pride gathered across your memories.
        </p>
      </section>

      {/* 1. Journey Summary Metrics */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white dark:bg-[#201F28] border border-app-border rounded-card p-5 shadow-subtle">
          <span className="text-xs font-semibold text-app-text-secondary uppercase tracking-wider block mb-1">
            Total Memories
          </span>
          <p className="font-sans text-2xl sm:text-3xl font-bold text-app-text tracking-tight">
            {stats.totalEntries}
          </p>
          <span className="text-[11px] text-app-text-muted mt-1 block">
            {stats.entriesThisMonth} this month
          </span>
        </div>

        <div className="bg-white dark:bg-[#201F28] border border-app-border rounded-card p-5 shadow-subtle">
          <span className="text-xs font-semibold text-app-text-secondary uppercase tracking-wider block mb-1">
            Words Written
          </span>
          <p className="font-sans text-2xl sm:text-3xl font-bold text-app-text tracking-tight">
            {stats.wordCount.toLocaleString()}
          </p>
          <span className="text-[11px] text-app-text-muted mt-1 block">
            Deep reflections
          </span>
        </div>

        <div className="bg-white dark:bg-[#201F28] border border-app-border rounded-card p-5 shadow-subtle">
          <span className="text-xs font-semibold text-app-text-secondary uppercase tracking-wider block mb-1">
            Spoken Time
          </span>
          <p className="font-sans text-2xl sm:text-3xl font-bold text-app-text tracking-tight">
            {formatDuration(stats.audioDurationSeconds + stats.videoDurationSeconds)}
          </p>
          <span className="text-[11px] text-app-text-muted mt-1 block">
            Audio & video logs
          </span>
        </div>

        <div className="bg-white dark:bg-[#201F28] border border-app-border rounded-card p-5 shadow-subtle">
          <span className="text-xs font-semibold text-app-text-secondary uppercase tracking-wider block mb-1">
            Primary State
          </span>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-2xl select-none">{topMoodInfo?.emoji || '🌱'}</span>
            <span className="font-sans text-lg sm:text-xl font-bold text-app-text capitalize">
              {topMoodInfo?.label || 'Calm'}
            </span>
          </div>
          <span className="text-[11px] text-app-text-muted mt-1 block">
            Most frequent
          </span>
        </div>
      </section>

      {/* 2. Detected Emotional & Behavioral Patterns */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-sans text-base sm:text-lg font-bold text-app-text flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#6C4FF6]" />
              <span>Observed Behavioral Patterns</span>
            </h2>
            <p className="text-xs text-app-text-secondary mt-0.5">
              Synthesized by analyzing recurring topics and emotional shifts in your entries
            </p>
          </div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#6C4FF6] bg-[#F1EEFF] dark:bg-[#6C4FF6]/20 px-2.5 py-1 rounded-full border border-[#6C4FF6]/20">
            AI Synthesis
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-[#201F28] border border-app-border rounded-card p-5 sm:p-6 shadow-subtle space-y-3">
            <div className="flex items-center gap-2 text-[#6C4FF6] dark:text-[#856DF8] text-xs font-bold uppercase tracking-wider">
              <TrendingUp className="w-4 h-4" />
              <span>Career & Performance Cycle</span>
            </div>
            <p className="text-xs sm:text-sm text-app-text leading-relaxed">
              "You've mentioned high-stakes presentations and deadlines several times. You often describe acute physical nervousness beforehand, which consistently dissolves into relief and competence once you engage."
            </p>
            <div className="pt-2 border-t border-app-border/60 text-xs text-app-text-secondary">
              Suggested insight: Trust your preparation instincts; early anxiety has not predicted performance.
            </div>
          </div>

          <div className="bg-white dark:bg-[#201F28] border border-app-border rounded-card p-5 sm:p-6 shadow-subtle space-y-3">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <TrendingUp className="w-4 h-4" />
              <span>Restoration & Sensory Grounding</span>
            </div>
            <p className="text-xs sm:text-sm text-app-text leading-relaxed">
              "When creative fatigue arrives, physical sensory rituals—cooking sourdough pasta, walking without headphones, shooting 35mm film—consistently restore your mental clarity."
            </p>
            <div className="pt-2 border-t border-app-border/60 text-xs text-app-text-secondary">
              Suggested insight: Tactile hobbies serve as your most effective defense against cognitive overstimulation.
            </div>
          </div>
        </div>
      </section>

      {/* 3. Recurring Themes */}
      <section className="bg-white dark:bg-[#201F28] border border-app-border rounded-card p-6 sm:p-7 shadow-subtle space-y-5">
        <div>
          <h2 className="font-sans text-base sm:text-lg font-bold text-app-text">
            What You've Been Reflecting On
          </h2>
          <p className="text-xs text-app-text-secondary mt-1">
            Top themes recurring in your entries and AI reflections
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {stats.topThemes.map(({ theme, count }) => (
            <div
              key={theme}
              className="p-4 rounded-xl bg-app-surface-secondary dark:bg-[#26252F] border border-app-border flex flex-col justify-between"
            >
              <span className="text-xs font-bold text-app-text leading-snug">
                {theme}
              </span>
              <div className="flex items-center justify-between mt-3 text-[11px] text-app-text-secondary">
                <span>{count} mentions</span>
                <span className="font-mono text-[#6C4FF6] font-bold">
                  {Math.round((count / Math.max(1, stats.totalEntries)) * 100)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Cherished Memories */}
      <section className="space-y-4">
        <div>
          <h2 className="font-sans text-base sm:text-lg font-bold text-app-text flex items-center gap-2">
            <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
            <span>Memories You Cherish</span>
          </h2>
          <p className="text-xs text-app-text-secondary mt-0.5">
            Starred reflections and milestones worth revisiting
          </p>
        </div>

        {favoriteEntries.length === 0 ? (
          <div className="bg-white dark:bg-[#201F28] border border-app-border rounded-card p-8 text-center space-y-2 shadow-subtle">
            <BookMarked className="w-6 h-6 text-app-text-muted mx-auto" />
            <h3 className="text-sm font-bold text-app-text">
              No favorited memories yet
            </h3>
            <p className="text-xs text-app-text-secondary max-w-sm mx-auto">
              Click the heart icon on any journal entry to pin your most meaningful memories here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {favoriteEntries.map((entry) => (
              <div
                key={entry.id}
                onClick={() => onOpenEntry(entry.id)}
                className="bg-white dark:bg-[#201F28] border border-app-border rounded-card p-5 sm:p-6 shadow-subtle hover:border-[#6C4FF6]/40 hover:shadow-soft transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-app-text-muted mb-2">
                    <span className="capitalize font-semibold">{entry.type} Entry</span>
                    <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                  </div>
                  <h3 className="font-sans text-base sm:text-lg font-bold text-app-text mb-2">
                    {entry.title}
                  </h3>
                  <p className="text-xs text-app-text-secondary line-clamp-3 leading-relaxed">
                    {entry.text || entry.transcript || 'Reflected memory.'}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 mt-4 border-t border-app-border text-xs text-app-text-muted">
                  <span>{new Date(entry.createdAt).toLocaleDateString()}</span>
                  <span className="text-[#6C4FF6] dark:text-[#856DF8] font-semibold flex items-center gap-1">
                    Revisit <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 5. A Note on Privacy & AI Synthesis */}
      <section className="p-5 rounded-card bg-app-surface-secondary dark:bg-[#26252F] border border-app-border text-xs text-app-text-secondary space-y-1.5">
        <div className="flex items-center gap-2 font-bold text-app-text">
          <Quote className="w-4 h-4 text-[#6C4FF6]" />
          <span>Factual Journal Data vs. Generated Insights</span>
        </div>
        <p className="leading-relaxed">
          Your journal text, transcripts, and media files are stored locally on your device. The insights above are generated observations meant to support personal contemplation, never factual judgments or clinical diagnoses.
        </p>
      </section>
    </div>
  );
};
