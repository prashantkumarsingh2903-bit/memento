import React, { useState } from 'react';
import {
  Mic,
  PenLine,
  Video,
  Camera,
  Layers,
  Heart,
  Sparkles,
  Calendar,
  MoreHorizontal,
  Edit3,
  Trash2,
  Clock,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import type { JournalEntry, EntryType } from '../../types';
import { getMoodDetails } from '../common/MoodSelector';
import { Badge } from '../common/Badge';

interface JournalCardProps {
  entry: JournalEntry;
  onOpen: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}

export const JournalCard: React.FC<JournalCardProps> = ({
  entry,
  onOpen,
  onEdit,
  onDelete,
  onToggleFavorite,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const moodInfo = getMoodDetails(entry.mood);

  const audioItem = entry.media?.find((m) => m.type === 'audio' || m.type === 'video');
  const audioDuration = audioItem?.duration;

  const getTypeIcon = (type: EntryType) => {
    switch (type) {
      case 'voice':
        return <Mic className="w-3.5 h-3.5 text-[#6C4FF6] dark:text-[#856DF8]" />;
      case 'video':
        return <Video className="w-3.5 h-3.5 text-[#D95CFF]" />;
      case 'photo':
        return <Camera className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />;
      case 'mixed':
        return <Layers className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />;
      default:
        return <PenLine className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />;
    }
  };

  const getTypeLabel = (type: EntryType) => {
    switch (type) {
      case 'voice':
        return 'Voice';
      case 'video':
        return 'Video';
      case 'photo':
        return 'Photo';
      case 'mixed':
        return 'Mixed';
      default:
        return 'Note';
    }
  };

  const previewText =
    entry.text ||
    entry.transcript ||
    entry.reflection?.summary ||
    'A quiet moment captured in Memento.';

  const formattedDate = format(new Date(entry.createdAt), 'MMM d, yyyy');
  const relativeTime = formatDistanceToNow(new Date(entry.createdAt), {
    addSuffix: true,
  });

  return (
    <article
      onClick={() => onOpen(entry.id)}
      className="group relative bg-white dark:bg-[#201F28] border border-app-border rounded-card p-5 sm:p-5.5 shadow-subtle hover:border-[#6C4FF6]/40 hover:shadow-soft transition-all duration-200 cursor-pointer flex flex-col justify-between"
    >
      {/* Top Meta Bar */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 flex-wrap text-xs text-app-text-muted">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-app-surface-secondary dark:bg-[#26252F] font-semibold text-[11px] text-app-text-secondary border border-app-border/70">
              {getTypeIcon(entry.type)}
              <span>{getTypeLabel(entry.type)}</span>
            </span>

            {audioDuration && audioDuration > 0 ? (
              <span className="inline-flex items-center gap-1 text-[11px] text-[#6C4FF6] font-medium bg-[#F1EEFF] dark:bg-[#6C4FF6]/20 px-2 py-0.5 rounded-full">
                <Clock className="w-2.5 h-2.5" />
                <span>
                  {Math.floor(audioDuration / 60)}:
                  {String(Math.floor(audioDuration % 60)).padStart(2, '0')}
                </span>
              </span>
            ) : null}

            <span className="flex items-center gap-1 text-[11px]">
              <Calendar className="w-3 h-3 text-app-text-muted" />
              <span>{formattedDate}</span>
              <span className="text-app-text-muted">·</span>
              <span className="text-app-text-muted">{relativeTime}</span>
            </span>
          </div>

          {/* Quick Actions */}
          <div
            className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => onToggleFavorite(entry.id)}
              className={`p-1.5 rounded-xl hover:bg-app-surface-secondary transition-colors cursor-pointer ${
                entry.isFavorite ? 'text-rose-500' : 'text-app-text-muted hover:text-app-text'
              }`}
              title={entry.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart
                className={`w-4 h-4 ${entry.isFavorite ? 'fill-rose-500' : ''}`}
              />
            </button>

            {/* Menu Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1.5 rounded-xl text-app-text-muted hover:text-app-text hover:bg-app-surface-secondary transition-colors cursor-pointer"
                aria-label="More options"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>

              {showMenu && (
                <>
                  <div
                    className="fixed inset-0 z-20"
                    onClick={() => setShowMenu(false)}
                  />
                  <div className="absolute right-0 top-8 z-30 w-36 bg-white dark:bg-[#201F28] border border-app-border rounded-xl shadow-elevated py-1.5 animate-slide-up">
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        onEdit(entry.id);
                      }}
                      className="w-full px-3.5 py-1.5 text-xs text-app-text hover:bg-app-surface-secondary flex items-center gap-2 text-left cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-app-text-muted" />
                      <span>Edit Entry</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        onDelete(entry.id);
                      }}
                      className="w-full px-3.5 py-1.5 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2 text-left cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Title & Mood */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="font-sans text-base sm:text-lg font-bold text-app-text group-hover:text-[#6C4FF6] dark:group-hover:text-[#856DF8] transition-colors leading-snug">
            {entry.title || 'Untitled Memory'}
          </h3>
          {moodInfo && (
            <span
              className="text-xl shrink-0 select-none"
              title={`Mood: ${moodInfo.label}`}
            >
              {moodInfo.emoji}
            </span>
          )}
        </div>

        {/* Content Snippet */}
        <p className="text-xs sm:text-sm text-app-text-secondary line-clamp-3 leading-relaxed mb-4">
          {previewText}
        </p>

        {/* Media Thumbnail preview if photos or videos exist */}
        {entry.media && entry.media.length > 0 && (
          <div className="flex items-center gap-2 mb-4 overflow-hidden rounded-xl">
            {entry.media
              .filter((m) => (m.type === 'image' || m.type === 'video') && (m.url || m.thumbnailUrl))
              .slice(0, 3)
              .map((mediaItem) => (
                <div key={mediaItem.id} className="relative h-20 w-28 shrink-0 overflow-hidden rounded-lg border border-app-border">
                  {mediaItem.type === 'video' ? (
                    mediaItem.thumbnailUrl ? (
                      <img
                        src={mediaItem.thumbnailUrl}
                        alt="Video thumbnail"
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="h-full w-full bg-stone-900 flex items-center justify-center text-white/70">
                        <Video className="w-5 h-5" />
                      </div>
                    )
                  ) : (
                    <img
                      src={mediaItem.url}
                      alt="Journal attachment"
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                    />
                  )}
                  {mediaItem.type === 'video' && (
                    <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/70 text-[9px] font-semibold text-white backdrop-blur-sm">
                      {mediaItem.duration ? `${Math.floor(mediaItem.duration)}s` : 'Video'}
                    </span>
                  )}
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Bottom Footer: Tags & Reflection status */}
      <div className="flex items-center justify-between gap-2 pt-3 border-t border-app-border flex-wrap">
        <div className="flex items-center gap-1.5 flex-wrap">
          {entry.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="default" size="sm">
              #{tag}
            </Badge>
          ))}
          {entry.tags.length > 3 && (
            <span className="text-[11px] text-app-text-muted">
              +{entry.tags.length - 3} more
            </span>
          )}
        </div>

        {entry.reflection && (
          <div className="flex items-center gap-1 text-[11px] text-[#6C4FF6] dark:text-[#856DF8] font-semibold bg-[#F1EEFF] dark:bg-[#6C4FF6]/18 px-2.5 py-0.5 rounded-full border border-[#6C4FF6]/20">
            <Sparkles className="w-3 h-3 shrink-0" />
            <span>Reflected</span>
          </div>
        )}
      </div>
    </article>
  );
};
