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
    <div className="relative overflow-hidden bg-white dark:bg-[#201F28] border border-app-border rounded-card p-6 sm:p-7 shadow-subtle group">
      {/* Decorative subtle gradient glow */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-[#6C4FF6]/10 to-[#D95CFF]/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />

      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-[#F1EEFF] dark:bg-[#6C4FF6]/20 text-[#6C4FF6] dark:text-[#856DF8] border border-[#6C4FF6]/20">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="text-xs uppercase tracking-wider font-bold text-app-text-secondary">
            AI Reflection Prompt
          </span>
        </div>

        <button
          onClick={handleNextPrompt}
          className="flex items-center gap-1.5 text-xs text-app-text-muted hover:text-app-text p-1.5 rounded-xl hover:bg-app-surface-secondary transition-all cursor-pointer"
          title="Show another prompt"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${isRotating ? 'animate-spin text-[#6C4FF6]' : ''}`}
          />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* Prompt Body */}
      <blockquote className="my-2">
        <p className="font-serif text-xl sm:text-2xl text-app-text font-medium leading-relaxed">
          "{currentPrompt.prompt}"
        </p>
      </blockquote>

      {currentPrompt.subtitle && (
        <p className="text-xs text-app-text-secondary mt-2 mb-5 leading-relaxed">
          {currentPrompt.subtitle}
        </p>
      )}

      {/* Action */}
      <div className="pt-3 flex items-center justify-between gap-4 border-t border-app-border/60">
        <span className="text-[11px] capitalize text-app-text-muted font-medium">
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
