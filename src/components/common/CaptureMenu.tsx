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
      iconColor: 'text-[#6C4FF6] dark:text-[#856DF8]',
      iconBg: 'bg-[#F1EEFF] dark:bg-[#6C4FF6]/20',
      badge: 'Audio & Speech-to-Text',
    },
    {
      type: 'text' as EntryType,
      title: 'Write',
      subtitle: 'Distraction-free personal writing',
      icon: PenLine,
      iconColor: 'text-cyan-600 dark:text-cyan-400',
      iconBg: 'bg-cyan-50 dark:bg-cyan-950/40',
      badge: 'Freeform & Markdown',
    },
    {
      type: 'video' as EntryType,
      title: 'Record',
      subtitle: 'Face-to-camera video reflection',
      icon: Video,
      iconColor: 'text-fuchsia-600 dark:text-fuchsia-400',
      iconBg: 'bg-fuchsia-50 dark:bg-fuchsia-950/40',
      badge: 'Camera & Video Note',
    },
    {
      type: 'photo' as EntryType,
      title: 'Photo',
      subtitle: 'Visual memories and moments',
      icon: Camera,
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      iconBg: 'bg-emerald-50 dark:bg-emerald-950/40',
      badge: 'Photos & Captions',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div
        className="fixed inset-0 bg-black/40 dark:bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg bg-white dark:bg-[#201F28] border border-app-border rounded-3xl p-6 sm:p-7 shadow-elevated z-10 animate-slide-up">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#6C4FF6]" />
            <h3 className="font-sans text-xl font-bold text-app-text tracking-tight">
              Capture a moment
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-app-text-muted hover:text-app-text hover:bg-app-surface-secondary transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-xs text-app-text-secondary mb-6">
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
                className="p-4 rounded-card border border-app-border bg-white dark:bg-[#26252F] hover:border-[#6C4FF6]/40 hover:bg-[#F1EEFF]/30 dark:hover:bg-[#6C4FF6]/10 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-soft flex flex-col justify-between group cursor-pointer"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-2.5 rounded-xl ${opt.iconBg} ${opt.iconColor} transition-transform group-hover:scale-105`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-semibold text-app-text-muted uppercase tracking-wider">
                      {opt.badge}
                    </span>
                  </div>
                  <h4 className="font-sans text-base font-bold text-app-text group-hover:text-[#6C4FF6] dark:group-hover:text-[#856DF8] transition-colors">
                    {opt.title}
                  </h4>
                  <p className="text-xs text-app-text-secondary mt-1 leading-relaxed">
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
