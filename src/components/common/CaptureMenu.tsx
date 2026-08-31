import React from 'react';
import { Mic, PenLine, Video, Camera, X } from 'lucide-react';
import type { EntryType } from '../../types';

interface CaptureMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectType: (type: EntryType) => void;
}

export const CaptureMenu: React.FC<CaptureMenuProps> = ({
  isOpen,
  onClose,
  onSelectType,
}) => {
  if (!isOpen) return null;

  const captureOptions = [
    {
      type: 'voice' as EntryType,
      title: 'Speak',
      subtitle: 'Voice journal with live transcription',
      icon: Mic,
      color: 'text-rose-600 dark:text-rose-400',
      bg: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200/60 dark:border-rose-800/40 hover:border-rose-300',
      badge: 'Audio & Speech-to-Text',
    },
    {
      type: 'text' as EntryType,
      title: 'Write',
      subtitle: 'Distraction-free personal writing',
      icon: PenLine,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200/60 dark:border-amber-800/40 hover:border-amber-300',
      badge: 'Freeform & Markdown',
    },
    {
      type: 'video' as EntryType,
      title: 'Record',
      subtitle: 'Face-to-camera video reflection',
      icon: Video,
      color: 'text-indigo-600 dark:text-indigo-400',
      bg: 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200/60 dark:border-indigo-800/40 hover:border-indigo-300',
      badge: 'Camera & Voice Note',
    },
    {
      type: 'photo' as EntryType,
      title: 'Photo',
      subtitle: 'Visual memories and moments',
      icon: Camera,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200/60 dark:border-emerald-800/40 hover:border-emerald-300',
      badge: 'Photos & Captions',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div
        className="fixed inset-0 bg-stone-900/40 dark:bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg bg-warm-card border border-warm-border rounded-3xl p-6 sm:p-7 shadow-elevated z-10 animate-slide-up">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-warm-accent" />
            <h3 className="font-serif text-2xl font-medium text-warm-text">
              Capture a moment
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-warm-muted hover:text-warm-text hover:bg-warm-card-subtle transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-xs text-warm-muted mb-6">
          Choose how you would like to express yourself today. You can always combine text, audio, and video later.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {captureOptions.map((opt) => {
            const Icon = opt.icon;
            return (
              <button
                key={opt.type}
                onClick={() => {
                  onSelectType(opt.type);
                  onClose();
                }}
                className={`p-4 rounded-2xl border text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-soft flex flex-col justify-between group ${opt.bg}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-2.5 rounded-xl bg-warm-card border border-warm-border/60 shadow-subtle ${opt.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] uppercase font-semibold tracking-wider text-warm-muted">
                      {opt.badge}
                    </span>
                  </div>
                  <h4 className="font-serif text-lg font-medium text-warm-text group-hover:text-warm-accent transition-colors">
                    {opt.title}
                  </h4>
                  <p className="text-xs text-warm-muted mt-1 leading-relaxed">
                    {opt.subtitle}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
