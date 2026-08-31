import React, { useState } from 'react';
import {
  Sparkles,
  RefreshCw,
  BookOpen,
  ArrowRight,
  Clock,
  Compass,
  Lightbulb,
} from 'lucide-react';
import type { JournalEntry } from '../types';
import { REFLECTION_PROMPTS } from '../data/prompts';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { aiService } from '../services/ai/aiService';

interface ReflectPageProps {
  entries: JournalEntry[];
  onOpenEntry: (id: string) => void;
  onStartWritingWithPrompt: (promptText: string) => void;
  onUpdateEntry: (id: string, updates: Partial<JournalEntry>) => void;
}

export const Reflect: React.FC<ReflectPageProps> = ({
  entries,
  onOpenEntry,
  onStartWritingWithPrompt,
  onUpdateEntry,
}) => {
  const [activePromptIndex, setActivePromptIndex] = useState(0);
  const [reflectingEntryId, setReflectingEntryId] = useState<string | null>(null);

  const prompt = REFLECTION_PROMPTS[activePromptIndex % REFLECTION_PROMPTS.length];

  // Entries with reflections
  const entriesWithReflections = entries.filter((e) => !!e.reflection);
  // Entries needing reflection
  const unreflectedEntries = entries.filter((e) => !e.reflection).slice(0, 3);

  // All extracted themes from reflections
  const themeFrequency: Record<string, number> = {};
  entries.forEach((e) => {
    if (e.reflection?.themes) {
      e.reflection.themes.forEach((t) => {
        themeFrequency[t] = (themeFrequency[t] || 0) + 1;
      });
    }
  });
  const topThemes = Object.entries(themeFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  const handleReflectForEntry = async (entry: JournalEntry) => {
    setReflectingEntryId(entry.id);
    try {
      const ref = await aiService.generateReflection({
        title: entry.title,
        text: entry.text,
        transcript: entry.transcript,
        mood: entry.mood,
        tags: entry.tags,
      });
      onUpdateEntry(entry.id, { reflection: ref });
    } catch (e) {
      console.error(e);
    } finally {
      setReflectingEntryId(null);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <section className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F1EEFF] dark:bg-[#6C4FF6]/18 text-[#6C4FF6] dark:text-[#856DF8] text-xs font-semibold border border-[#6C4FF6]/20">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Mindful AI Reflection</span>
        </div>
        <h1 className="font-sans text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-app-text">
          Reflect & Understand
        </h1>
        <p className="text-xs sm:text-sm text-app-text-secondary max-w-xl leading-relaxed">
          Take a quiet moment to understand what you've been experiencing and gently observe patterns in your story.
        </p>
      </section>

      {/* 1. Daily Contemplative Prompt */}
      <section className="bg-white dark:bg-[#201F28] border border-app-border rounded-card p-6 sm:p-8 shadow-subtle relative overflow-hidden">
        <div className="flex items-center justify-between gap-3 mb-4">
          <span className="text-xs uppercase font-bold tracking-wider text-app-text-secondary flex items-center gap-2">
            <Compass className="w-4 h-4 text-[#6C4FF6]" />
            Prompt for Contemplation
          </span>
          <button
            onClick={() => setActivePromptIndex((prev) => prev + 1)}
            className="flex items-center gap-1.5 text-xs text-app-text-muted hover:text-app-text p-1.5 rounded-xl hover:bg-app-surface-secondary transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Another prompt</span>
          </button>
        </div>

        <blockquote className="my-3">
          <p className="font-serif text-xl sm:text-2xl text-app-text font-medium leading-snug">
            "{prompt.prompt}"
          </p>
        </blockquote>

        {prompt.subtitle && (
          <p className="text-xs sm:text-sm text-app-text-secondary mt-2 mb-6 leading-relaxed">
            {prompt.subtitle}
          </p>
        )}

        <div className="pt-3 flex items-center justify-between gap-4 border-t border-app-border/60">
          <span className="text-xs capitalize text-app-text-muted font-medium">
            Category · {prompt.category}
          </span>
          <Button
            size="sm"
            variant="soft-accent"
            onClick={() => onStartWritingWithPrompt(prompt.prompt)}
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
          >
            Write Reflection
          </Button>
        </div>
      </section>

      {/* 2. Unreflected Entries */}
      {unreflectedEntries.length > 0 && (
        <section className="space-y-4">
          <div>
            <h2 className="font-sans text-base sm:text-lg font-bold text-app-text">
              Unprocessed Moments
            </h2>
            <p className="text-xs text-app-text-secondary">
              Moments waiting for quiet observation and AI distillation
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {unreflectedEntries.map((entry) => (
              <div
                key={entry.id}
                className="bg-white dark:bg-[#201F28] border border-app-border rounded-card p-5 shadow-subtle flex flex-col justify-between"
              >
                <div>
                  <span className="text-[10px] text-app-text-muted font-semibold uppercase tracking-wider block mb-1">
                    {entry.type} Journal
                  </span>
                  <h3 className="font-sans text-base font-bold text-app-text line-clamp-1 mb-2">
                    {entry.title || 'Untitled'}
                  </h3>
                  <p className="text-xs text-app-text-secondary line-clamp-2 leading-relaxed mb-4">
                    {entry.text || entry.transcript || 'No text written.'}
                  </p>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleReflectForEntry(entry)}
                  isLoading={reflectingEntryId === entry.id}
                  leftIcon={<Sparkles className="w-3.5 h-3.5 text-[#6C4FF6]" />}
                  className="w-full text-xs"
                >
                  Reflect with AI
                </Button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 3. Recent Themes */}
      {topThemes.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            <h2 className="font-sans text-base sm:text-lg font-bold text-app-text">
              Emerging Themes in Your Journal
            </h2>
          </div>
          <p className="text-xs text-app-text-secondary">
            Patterns and concepts recurring through your reflections
          </p>

          <div className="flex items-center gap-2 flex-wrap pt-1">
            {topThemes.map(([theme, count]) => (
              <div
                key={theme}
                className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-[#26252F] border border-app-border text-xs font-semibold text-app-text shadow-subtle flex items-center gap-2"
              >
                <span>{theme}</span>
                <span className="w-4 h-4 rounded-full bg-[#F1EEFF] dark:bg-[#6C4FF6]/20 text-[10px] text-[#6C4FF6] dark:text-[#856DF8] flex items-center justify-center font-mono font-bold">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 4. Saved Reflections & Understandings */}
      <section className="space-y-4">
        <div>
          <h2 className="font-sans text-base sm:text-lg font-bold text-app-text">
            Saved Reflections & Insights
          </h2>
          <p className="text-xs text-app-text-secondary">
            Empathetic summaries and deep questions from your past entries
          </p>
        </div>

        {entriesWithReflections.length === 0 ? (
          <div className="bg-white dark:bg-[#201F28] border border-app-border rounded-card p-10 text-center space-y-3 shadow-subtle">
            <BookOpen className="w-8 h-8 text-app-text-muted mx-auto" />
            <h3 className="font-sans text-base font-bold text-app-text">
              No reflections saved yet
            </h3>
            <p className="text-xs text-app-text-secondary max-w-sm mx-auto">
              Whenever you write or record an entry, click "Reflect with AI" to generate thoughtful observations.
            </p>
          </div>
        ) : (
          <div className="space-y-3.5">
            {entriesWithReflections.map((entry) => (
              <div
                key={entry.id}
                onClick={() => onOpenEntry(entry.id)}
                className="bg-white dark:bg-[#201F28] border border-app-border rounded-card p-5 sm:p-6 shadow-subtle hover:border-[#6C4FF6]/40 hover:shadow-soft transition-all duration-200 cursor-pointer space-y-3.5"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[11px] text-app-text-muted font-medium">
                      Reflection for
                    </span>
                    <h3 className="font-sans text-lg font-bold text-app-text hover:text-[#6C4FF6] transition-colors">
                      {entry.title}
                    </h3>
                  </div>

                  {entry.reflection?.themes && (
                    <div className="flex items-center gap-1.5">
                      {entry.reflection.themes.slice(0, 2).map((t) => (
                        <Badge key={t} variant="accent" size="sm">
                          {t}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {entry.reflection?.summary && (
                  <p className="text-xs sm:text-sm text-app-text-secondary leading-relaxed">
                    {entry.reflection.summary}
                  </p>
                )}

                {entry.reflection?.questions && entry.reflection.questions.length > 0 && (
                  <div className="pt-2 border-t border-app-border/60">
                    <p className="text-xs text-app-text-secondary italic">
                      Explore: "{entry.reflection.questions[0]}"
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-app-text-muted pt-1">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(entry.createdAt).toLocaleDateString()}</span>
                  </span>
                  <span className="text-[#6C4FF6] dark:text-[#856DF8] font-semibold flex items-center gap-1">
                    View memory <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
