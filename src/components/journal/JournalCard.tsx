import React from 'react';
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
  const [showMenu, setShowMenu] = React.useState(false);
  const moodInfo = getMoodDetails(entry.mood);

  const getTypeIcon = (type: EntryType) => {
    switch (type) {
      case 'voice':
        return <Mic className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />;
      case 'video':
        return <Video className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />;
      case 'photo':
        return <Camera className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />;
      case 'mixed':
        return <Layers className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />;
      default:
        return <PenLine className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />;
    }
  };

  const getTypeLabel = (type: EntryType) => {
    switch (type) {
      case 'voice':
        return 'Voice Journal';
      case 'video':
        return 'Video Journal';
      case 'photo':
        return 'Photo Memory';
      case 'mixed':
        return 'Mixed Entry';
      default:
        return 'Written Entry';
    }
  };

  const previewText =
    entry.text ||
    entry.transcript ||
    entry.reflection?.summary ||
    'A quiet moment captured in Memento.';

  const formattedDate = format(new Date(entry.createdAt), 'MMMM d, yyyy');
  const relativeTime = formatDistanceToNow(new Date(entry.createdAt), {
    addSuffix: true,
  });

  return (
    <article
      onClick={() => onOpen(entry.id)}
      className="group relative bg-warm-card border border-warm-border rounded-3xl p-5 sm:p-6 shadow-subtle hover:border-warm-border-strong hover:shadow-soft transition-all duration-200 cursor-pointer flex flex-col justify-between"
    >
      {/* Top Meta Bar */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 flex-wrap text-xs text-warm-muted">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-warm-card-subtle font-medium text-[11px] text-warm-text">
              {getTypeIcon(entry.type)}
              <span>{getTypeLabel(entry.type)}</span>
            </span>

            <span className="flex items-center gap-1 text-[11px]">
              <Calendar className="w-3 h-3 text-warm-faint" />
              <span>{formattedDate}</span>
              <span className="text-warm-faint">·</span>
              <span className="text-warm-faint">{relativeTime}</span>
            </span>
          </div>

          {/* Quick Actions */}
          <div
            className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => onToggleFavorite(entry.id)}
              className={`p-1.5 rounded-xl hover:bg-warm-card-subtle transition-colors ${
                entry.isFavorite ? 'text-rose-500' : 'text-warm-faint hover:text-warm-muted'
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
                className="p-1.5 rounded-xl text-warm-faint hover:text-warm-text hover:bg-warm-card-subtle transition-colors"
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
                  <div className="absolute right-0 top-8 z-30 w-36 bg-warm-card border border-warm-border rounded-2xl shadow-elevated py-1.5 animate-slide-up">
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        onEdit(entry.id);
                      }}
                      className="w-full px-3.5 py-1.5 text-xs text-warm-text hover:bg-warm-card-subtle flex items-center gap-2 text-left"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-warm-muted" />
                      <span>Edit Entry</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        onDelete(entry.id);
                      }}
                      className="w-full px-3.5 py-1.5 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2 text-left"
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
          <h3 className="font-serif text-xl sm:text-2xl font-medium text-warm-text group-hover:text-warm-accent transition-colors leading-snug">
            {entry.title || 'Untitled Memory'}
          </h3>
          {moodInfo && (
            <span
              className="text-xl sm:text-2xl shrink-0 select-none"
              title={`Mood: ${moodInfo.label}`}
            >
              {moodInfo.emoji}
            </span>
          )}
        </div>

        {/* Content Snippet */}
        <p className="text-sm text-warm-muted line-clamp-3 leading-relaxed mb-4">
          {previewText}
        </p>

        {/* Media Thumbnail preview if photos exist */}
        {entry.media && entry.media.length > 0 && (
          <div className="flex items-center gap-2 mb-4 overflow-hidden rounded-2xl">
            {entry.media
              .filter((m) => m.type === 'image' && m.url)
              .slice(0, 3)
              .map((img) => (
                <img
                  key={img.id}
                  src={img.url}
                  alt="Journal attachment"
                  className="h-20 w-28 object-cover rounded-xl border border-warm-border/60 group-hover:scale-105 transition-transform"
                />
              ))}
          </div>
        )}
      </div>

      {/* Bottom Footer: Tags & Reflection status */}
      <div className="flex items-center justify-between gap-2 pt-3 border-t border-warm-border/60 flex-wrap">
        <div className="flex items-center gap-1.5 flex-wrap">
          {entry.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="default" size="sm">
              #{tag}
            </Badge>
          ))}
          {entry.tags.length > 3 && (
            <span className="text-[11px] text-warm-faint">
              +{entry.tags.length - 3} more
            </span>
          )}
        </div>

        {entry.reflection && (
          <div className="flex items-center gap-1 text-[11px] text-warm-accent font-medium bg-warm-accent-light px-2.5 py-0.5 rounded-full border border-warm-accent/20">
            <Sparkles className="w-3 h-3 shrink-0" />
            <span>Reflected</span>
          </div>
        )}
      </div>
    </article>
  );
};
