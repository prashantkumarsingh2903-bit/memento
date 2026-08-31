import React, { useState } from 'react';
import { Sparkles, RefreshCw, ArrowRight } from 'lucide-react';
import { REFLECTION_PROMPTS } from '../../data/prompts';
import { Button } from '../common/Button';

interface ReflectionPromptCardProps {
  onStartWritingWithPrompt: (promptText: string) => void;
}

export const ReflectionPromptCard: React.FC<ReflectionPromptCardProps> = ({
  onStartWritingWithPrompt,
}) => {
  const [promptIndex, setPromptIndex] = useState(0);
  const [isRotating, setIsRotating] = useState(false);

  const currentPrompt = REFLECTION_PROMPTS[promptIndex % REFLECTION_PROMPTS.length];

  const handleNextPrompt = () => {
    setIsRotating(true);
    setTimeout(() => {
      setPromptIndex((prev) => (prev + 1) % REFLECTION_PROMPTS.length);
      setIsRotating(false);
    }, 200);
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-warm-card to-warm-card-subtle/80 border border-warm-border rounded-3xl p-6 sm:p-7 shadow-subtle">
      {/* Decorative accent element */}
      <div className="absolute top-0 right-0 w-36 h-36 bg-warm-accent-light/40 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />

      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-warm-accent-light text-warm-accent border border-warm-accent/20">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="text-xs uppercase tracking-wider font-semibold text-warm-muted">
            Today's Reflection Prompt
          </span>
        </div>

        <button
          onClick={handleNextPrompt}
          className="flex items-center gap-1.5 text-xs text-warm-muted hover:text-warm-text p-1.5 rounded-xl hover:bg-warm-card-subtle transition-all cursor-pointer"
          title="Show another prompt"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${isRotating ? 'animate-spin text-warm-accent' : ''}`}
          />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* Prompt Body */}
      <blockquote className="my-2">
        <p className="font-serif text-xl sm:text-2xl text-warm-text font-medium leading-relaxed">
          "{currentPrompt.prompt}"
        </p>
      </blockquote>

      {currentPrompt.subtitle && (
        <p className="text-xs text-warm-muted mt-2 mb-5 leading-relaxed">
          {currentPrompt.subtitle}
        </p>
      )}

      {/* Action */}
      <div className="pt-2 flex items-center justify-between gap-4">
        <span className="text-[11px] capitalize text-warm-faint font-medium">
          Category · {currentPrompt.category}
        </span>
        <Button
          size="sm"
          variant="soft-accent"
          onClick={() => onStartWritingWithPrompt(currentPrompt.prompt)}
          rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
        >
          Reflect on this
        </Button>
      </div>
    </div>
  );
};
