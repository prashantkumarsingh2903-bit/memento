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
    <div className="space-y-10 max-w-4xl mx-auto animate-fade-in">
      {/* Header */}
      <section className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-warm-accent-light text-warm-accent text-xs font-semibold border border-warm-accent/20">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Mindful Reflection Space</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-warm-text">
          Reflect
        </h1>
        <p className="text-sm sm:text-base text-warm-muted max-w-xl leading-relaxed">
          Take a quiet moment to understand what you've been experiencing and gently observe patterns in your story.
        </p>
      </section>

      {/* 1. Daily Contemplative Prompt */}
      <section className="bg-gradient-to-br from-warm-card to-warm-card-subtle/80 border border-warm-border rounded-3xl p-6 sm:p-8 shadow-subtle relative overflow-hidden">
        <div className="flex items-center justify-between gap-3 mb-4">
          <span className="text-xs uppercase font-semibold tracking-wider text-warm-muted flex items-center gap-2">
            <Compass className="w-4 h-4 text-warm-accent" />
            Prompt for Contemplation
          </span>
          <button
            onClick={() => setActivePromptIndex((prev) => prev + 1)}
            className="flex items-center gap-1.5 text-xs text-warm-muted hover:text-warm-text p-1.5 rounded-xl hover:bg-warm-card-subtle transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Another prompt</span>
          </button>
        </div>

        <blockquote className="my-3">
          <p className="font-serif text-2xl sm:text-3xl text-warm-text font-medium leading-snug">
            "{prompt.prompt}"
          </p>
        </blockquote>

        {prompt.subtitle && (
          <p className="text-xs sm:text-sm text-warm-muted mt-2 mb-6 leading-relaxed">
            {prompt.subtitle}
          </p>
        )}

        <div className="pt-2 flex items-center justify-between gap-4 border-t border-warm-border/60">
          <span className="text-xs capitalize text-warm-faint font-medium">
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

      {/* 2. Unreflected Entries (Needs AI observation) */}
      {unreflectedEntries.length > 0 && (
        <section className="space-y-4">
          <div>
            <h2 className="font-serif text-xl sm:text-2xl font-medium text-warm-text">
              Unprocessed moments
            </h2>
            <p className="text-xs text-warm-muted">
              Moments waiting for quiet observation
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {unreflectedEntries.map((entry) => (
              <div
                key={entry.id}
                className="bg-warm-card border border-warm-border rounded-3xl p-5 shadow-subtle flex flex-col justify-between"
              >
                <div>
                  <span className="text-[10px] text-warm-muted capitalize block mb-1">
                    {entry.type} Journal
                  </span>
                  <h3 className="font-serif text-base font-medium text-warm-text line-clamp-1 mb-2">
                    {entry.title || 'Untitled'}
                  </h3>
                  <p className="text-xs text-warm-muted line-clamp-2 leading-relaxed mb-4">
                    {entry.text || entry.transcript || 'No text written.'}
                  </p>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleReflectForEntry(entry)}
                  isLoading={reflectingEntryId === entry.id}
                  leftIcon={<Sparkles className="w-3.5 h-3.5 text-warm-accent" />}
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
            <h2 className="font-serif text-xl font-medium text-warm-text">
              Emerging Themes in Your Journal
            </h2>
          </div>
          <p className="text-xs text-warm-muted">
            Patterns and concepts recurring through your reflections
          </p>

          <div className="flex items-center gap-2 flex-wrap pt-1">
            {topThemes.map(([theme, count]) => (
              <div
                key={theme}
                className="px-3.5 py-1.5 rounded-2xl bg-warm-card border border-warm-border text-xs font-medium text-warm-text shadow-subtle flex items-center gap-2"
              >
                <span>{theme}</span>
                <span className="w-4 h-4 rounded-full bg-warm-card-subtle text-[10px] text-warm-muted flex items-center justify-center font-mono">
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
          <h2 className="font-serif text-xl sm:text-2xl font-medium text-warm-text">
            Saved reflections & insights
          </h2>
          <p className="text-xs text-warm-muted">
            Empathetic summaries and questions from your past entries
          </p>
        </div>

        {entriesWithReflections.length === 0 ? (
          <div className="bg-warm-card border border-warm-border rounded-3xl p-10 text-center space-y-3">
            <BookOpen className="w-8 h-8 text-warm-muted mx-auto" />
            <h3 className="font-serif text-lg font-medium text-warm-text">
              No reflections saved yet
            </h3>
            <p className="text-xs text-warm-muted max-w-sm mx-auto">
              Whenever you write or record an entry, click "Reflect with AI" to generate thoughtful observations.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {entriesWithReflections.map((entry) => (
              <div
                key={entry.id}
                onClick={() => onOpenEntry(entry.id)}
                className="bg-warm-card border border-warm-border rounded-3xl p-6 sm:p-7 shadow-subtle hover:border-warm-border-strong hover:shadow-soft transition-all duration-200 cursor-pointer space-y-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[11px] text-warm-muted">
                      Reflection for
                    </span>
                    <h3 className="font-serif text-xl font-medium text-warm-text hover:text-warm-accent transition-colors">
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
                  <p className="text-sm text-warm-text leading-relaxed">
                    {entry.reflection.summary}
                  </p>
                )}

                {entry.reflection?.questions && entry.reflection.questions.length > 0 && (
                  <div className="pt-2 border-t border-warm-border/60">
                    <p className="text-xs text-warm-muted italic">
                      Explore: "{entry.reflection.questions[0]}"
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-warm-faint pt-1">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(entry.createdAt).toLocaleDateString()}</span>
                  </span>
                  <span className="text-warm-accent font-medium flex items-center gap-1">
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
