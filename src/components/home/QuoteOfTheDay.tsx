import React, { useState } from 'react';
import { Quote, Sparkles, RefreshCw, Copy, Check, PenLine } from 'lucide-react';

export interface MindfulQuote {
  text: string;
  author: string;
  work?: string;
  category: 'Presence' | 'Resilience' | 'Mindfulness' | 'Gratitude' | 'Wisdom' | 'Self-Discovery';
}

const QUOTES: MindfulQuote[] = [
  {
    text: 'You have power over your mind — not outside events. Realize this, and you will find strength.',
    author: 'Marcus Aurelius',
    work: 'Meditations',
    category: 'Resilience',
  },
  {
    text: 'Let everything happen to you: beauty and terror. Just keep going. No feeling is final.',
    author: 'Rainer Maria Rilke',
    work: 'Book of Hours',
    category: 'Presence',
  },
  {
    text: 'Tell me, what is it you plan to do with your one wild and precious life?',
    author: 'Mary Oliver',
    work: 'The Summer Day',
    category: 'Self-Discovery',
  },
  {
    text: 'Smile, breathe and go slowly. There is no need to hurry when we are already here.',
    author: 'Thich Nhat Hanh',
    work: 'Peace Is Every Step',
    category: 'Mindfulness',
  },
  {
    text: 'Nature does not hurry, yet everything is accomplished.',
    author: 'Lao Tzu',
    work: 'Tao Te Ching',
    category: 'Wisdom',
  },
  {
    text: 'We suffer more often in imagination than in reality.',
    author: 'Seneca',
    work: 'Letters from a Stoic',
    category: 'Wisdom',
  },
  {
    text: 'Between stimulus and response there is a space. In that space is our power to choose our response.',
    author: 'Viktor Frankl',
    work: "Man's Search for Meaning",
    category: 'Presence',
  },
  {
    text: 'The only way to make sense out of change is to plunge into it, move with it, and join the dance.',
    author: 'Alan Watts',
    work: 'The Wisdom of Insecurity',
    category: 'Mindfulness',
  },
  {
    text: 'The wound is the place where the Light enters you.',
    author: 'Rumi',
    category: 'Resilience',
  },
  {
    text: 'Write it on your heart that every day is the best day in the year.',
    author: 'Ralph Waldo Emerson',
    category: 'Gratitude',
  },
  {
    text: 'Who looks outside, dreams; who looks inside, awakes.',
    author: 'Carl Jung',
    category: 'Self-Discovery',
  },
  {
    text: "It is not what you look at that matters, it's what you see.",
    author: 'Henry David Thoreau',
    category: 'Mindfulness',
  },
  {
    text: 'You may not control all the events that happen to you, but you can decide not to be reduced by them.',
    author: 'Maya Angelou',
    category: 'Resilience',
  },
  {
    text: 'Do not spoil what you have by desiring what you have not; remember that what you now have was once among the things you only hoped for.',
    author: 'Epicurus',
    category: 'Gratitude',
  },
];

interface QuoteOfTheDayProps {
  onReflect?: (quote: MindfulQuote) => void;
}

export const QuoteOfTheDay: React.FC<QuoteOfTheDayProps> = ({ onReflect }) => {
  // Deterministic daily index based on day of year
  const getDayOfYear = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
  };

  const initialIndex = getDayOfYear() % QUOTES.length;
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [copied, setCopied] = useState(false);
  const [isRotating, setIsRotating] = useState(false);

  const currentQuote = QUOTES[currentIndex];

  const handleNextQuote = () => {
    setIsRotating(true);
    setCurrentIndex((prev) => (prev + 1) % QUOTES.length);
    setTimeout(() => setIsRotating(false), 250);
  };

  const handleCopy = () => {
    const textToCopy = `"${currentQuote.text}" — ${currentQuote.author}${
      currentQuote.work ? ` (${currentQuote.work})` : ''
    }`;
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const categoryColors: Record<MindfulQuote['category'], string> = {
    Presence: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800/40',
    Resilience: 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800/40',
    Mindfulness: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/40',
    Gratitude: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/40',
    Wisdom: 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800/40',
    'Self-Discovery': 'bg-warm-accent-light text-warm-accent border-warm-accent/25',
  };

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-warm-card via-warm-card to-warm-card-subtle border border-warm-border p-6 sm:p-7 shadow-subtle group">
      {/* Subtle quote watermark in background */}
      <Quote className="absolute -bottom-4 -right-4 w-28 h-28 text-warm-border/30 pointer-events-none select-none" />

      <div className="relative z-10 space-y-4">
        {/* Top bar: Category badge & Actions */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider bg-warm-accent-light text-warm-accent border border-warm-accent/20">
              <Sparkles className="w-3 h-3" />
              Quote of the Day
            </span>

            <span
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${
                categoryColors[currentQuote.category]
              }`}
            >
              {currentQuote.category}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-xl text-warm-muted hover:text-warm-text hover:bg-warm-card-subtle transition-colors cursor-pointer"
              title="Copy quote"
            >
              {copied ? (
                <Check className="w-4 h-4 text-emerald-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={handleNextQuote}
              className="p-1.5 rounded-xl text-warm-muted hover:text-warm-text hover:bg-warm-card-subtle transition-colors cursor-pointer"
              title="New contemplative quote"
            >
              <RefreshCw
                className={`w-4 h-4 transition-transform ${
                  isRotating ? 'rotate-180' : ''
                }`}
              />
            </button>
          </div>
        </div>

        {/* Quote Body */}
        <div className="space-y-3 pt-1">
          <blockquote className="font-serif text-lg sm:text-xl md:text-2xl text-warm-text font-normal leading-relaxed italic">
            "{currentQuote.text}"
          </blockquote>

          <div className="flex items-center justify-between flex-wrap gap-3 pt-1">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-warm-accent-light text-warm-accent font-serif text-xs font-semibold flex items-center justify-center border border-warm-border">
                {currentQuote.author[0]}
              </div>
              <div>
                <cite className="not-italic text-sm font-semibold text-warm-text block">
                  {currentQuote.author}
                </cite>
                {currentQuote.work && (
                  <span className="text-[11px] text-warm-muted block">
                    {currentQuote.work}
                  </span>
                )}
              </div>
            </div>

            {onReflect && (
              <button
                type="button"
                onClick={() => onReflect(currentQuote)}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-warm-accent hover:text-warm-accent-hover bg-warm-card border border-warm-border hover:border-warm-accent/40 px-3 py-1.5 rounded-xl shadow-subtle transition-all cursor-pointer"
              >
                <PenLine className="w-3.5 h-3.5" />
                <span>Write reflection</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
