import React, { useState } from 'react';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Edit3,
  Trash2,
  Heart,
  Sparkles,
  Mic,
  Video,
  Layers,
  PenLine,
  Camera,
  Play,
  Pause,
  Volume2,
} from 'lucide-react';
import { format } from 'date-fns';
import type { JournalEntry } from '../types';
import { getMoodDetails } from '../components/common/MoodSelector';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { aiService } from '../services/ai/aiService';
import { formatDuration } from '../services/media/mediaUtils';

interface EntryDetailProps {
  entry: JournalEntry;
  onBack: () => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onUpdateEntry: (id: string, updates: Partial<JournalEntry>) => void;
}

export const EntryDetail: React.FC<EntryDetailProps> = ({
  entry,
  onBack,
  onEdit,
  onDelete,
  onToggleFavorite,
  onUpdateEntry,
}) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isReflecting, setIsReflecting] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState<string | null>(null);

  const moodInfo = getMoodDetails(entry.mood);
  const formattedDate = format(new Date(entry.createdAt), 'EEEE, MMMM d, yyyy');
  const formattedTime = format(new Date(entry.createdAt), 'h:mm a');

  const handleTriggerReflection = async () => {
    setIsReflecting(true);
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
      console.error('Reflection error:', e);
    } finally {
      setIsReflecting(false);
    }
  };

  const getTypeIcon = () => {
    switch (entry.type) {
      case 'voice':
        return <Mic className="w-4 h-4 text-rose-500" />;
      case 'video':
        return <Video className="w-4 h-4 text-indigo-500" />;
      case 'photo':
        return <Camera className="w-4 h-4 text-emerald-500" />;
      case 'mixed':
        return <Layers className="w-4 h-4 text-purple-500" />;
      default:
        return <PenLine className="w-4 h-4 text-amber-500" />;
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between gap-3 border-b border-warm-border/80 pb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-warm-muted hover:text-warm-text transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Journal Timeline</span>
        </button>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onToggleFavorite(entry.id)}
            className={`p-2 rounded-xl border border-warm-border hover:bg-warm-card-subtle transition-colors ${
              entry.isFavorite ? 'text-rose-500 bg-rose-50 dark:bg-rose-950/30' : 'text-warm-muted'
            }`}
            title={entry.isFavorite ? 'Favorited' : 'Favorite'}
          >
            <Heart
              className={`w-4 h-4 ${entry.isFavorite ? 'fill-rose-500' : ''}`}
            />
          </button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => onEdit(entry.id)}
            leftIcon={<Edit3 className="w-3.5 h-3.5" />}
          >
            Edit
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowDeleteModal(true)}
            className="text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Main Entry Body */}
      <article className="space-y-6">
        {/* Date & Mood Metadata */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3 text-xs text-warm-muted">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-warm-card border border-warm-border font-medium text-warm-text">
              {getTypeIcon()}
              <span className="capitalize">{entry.type} Journal</span>
            </span>

            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-warm-faint" />
              <span>{formattedDate}</span>
            </span>

            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-warm-faint" />
              <span>{formattedTime}</span>
            </span>
          </div>

          {moodInfo && (
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold ${moodInfo.bgClass}`}>
              <span>{moodInfo.emoji}</span>
              <span className={moodInfo.colorClass}>{moodInfo.label}</span>
            </div>
          )}
        </div>

        {/* Title */}
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-warm-text leading-tight">
          {entry.title || 'Untitled Memory'}
        </h1>

        {/* Tags */}
        {entry.tags && entry.tags.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            {entry.tags.map((tag) => (
              <Badge key={tag} variant="default" size="md">
                #{tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Attached Videos */}
        {entry.media && entry.media.filter((m) => m.type === 'video').length > 0 && (
          <div className="space-y-3">
            {entry.media
              .filter((m) => m.type === 'video')
              .map((video) => (
                <div
                  key={video.id}
                  className="rounded-3xl overflow-hidden border border-warm-border bg-black aspect-video relative shadow-elevated"
                >
                  <video
                    src={video.url}
                    controls
                    poster={video.thumbnailUrl}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
          </div>
        )}

        {/* Attached Photos */}
        {entry.media && entry.media.filter((m) => m.type === 'image').length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {entry.media
              .filter((m) => m.type === 'image')
              .map((img) => (
                <div
                  key={img.id}
                  className="rounded-2xl overflow-hidden border border-warm-border bg-warm-card shadow-subtle"
                >
                  <img
                    src={img.url}
                    alt={img.name || 'Journal photo'}
                    className="w-full h-64 object-cover"
                  />
                  {img.name && (
                    <p className="p-2.5 text-[11px] text-warm-muted truncate">
                      {img.name}
                    </p>
                  )}
                </div>
              ))}
          </div>
        )}

        {/* Attached Audio Memo */}
        {entry.media && entry.media.filter((m) => m.type === 'audio').length > 0 && (
          <div className="space-y-2">
            {entry.media
              .filter((m) => m.type === 'audio')
              .map((audio) => {
                const isPlaying = isPlayingAudio === audio.id;
                return (
                  <div
                    key={audio.id}
                    className="bg-warm-card border border-warm-border rounded-2xl p-4 flex items-center justify-between gap-4 shadow-subtle"
                  >
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() =>
                          setIsPlayingAudio(isPlaying ? null : audio.id)
                        }
                        className="w-10 h-10 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-subtle hover:bg-rose-600 transition-colors"
                      >
                        {isPlaying ? (
                          <Pause className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4 ml-0.5" />
                        )}
                      </button>
                      <div>
                        <p className="text-xs font-semibold text-warm-text">
                          {audio.name || 'Voice Recording'}
                        </p>
                        <p className="text-[11px] text-warm-muted">
                          {audio.duration ? formatDuration(audio.duration) : 'Audio Note'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-rose-500/80">
                      <Volume2 className="w-4 h-4" />
                      <div className="flex items-center gap-0.5">
                        <span className="w-1 h-3 bg-rose-400 rounded-full animate-pulse" />
                        <span className="w-1 h-5 bg-rose-500 rounded-full animate-pulse" />
                        <span className="w-1 h-2 bg-rose-400 rounded-full animate-pulse" />
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        )}

        {/* Text Content */}
        {entry.text && (
          <div className="font-serif text-lg sm:text-xl text-warm-text leading-relaxed whitespace-pre-wrap pt-2">
            {entry.text}
          </div>
        )}

        {/* Spoken Transcript */}
        {entry.transcript && (
          <div className="bg-warm-card-subtle/80 border border-warm-border rounded-3xl p-6 space-y-2.5">
            <div className="flex items-center gap-2">
              <Mic className="w-4 h-4 text-rose-500" />
              <h4 className="text-xs uppercase tracking-wider font-semibold text-warm-muted">
                Voice Transcript
              </h4>
            </div>
            <p className="text-sm sm:text-base text-warm-text italic leading-relaxed">
              "{entry.transcript}"
            </p>
          </div>
        )}

        {/* AI Reflection Section */}
        <div className="pt-6 border-t border-warm-border/80">
          {entry.reflection ? (
            <div className="bg-gradient-to-br from-warm-card to-warm-accent-light/40 border border-warm-accent/30 rounded-3xl p-6 sm:p-7 shadow-subtle space-y-6">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-warm-accent-light text-warm-accent border border-warm-accent/25">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-serif text-xl font-medium text-warm-text">
                      AI Reflection & Understandings
                    </h3>
                    <p className="text-[11px] text-warm-muted">
                      Supportive, non-prescriptive synthesis
                    </p>
                  </div>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleTriggerReflection}
                  isLoading={isReflecting}
                >
                  Regenerate
                </Button>
              </div>

              {/* What I noticed */}
              {entry.reflection.summary && (
                <div className="space-y-1.5">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-warm-muted">
                    What I noticed
                  </h4>
                  <p className="text-sm sm:text-base text-warm-text leading-relaxed">
                    {entry.reflection.summary}
                  </p>
                </div>
              )}

              {/* Observations */}
              {entry.reflection.observations && entry.reflection.observations.length > 0 && (
                <div className="space-y-1.5">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-warm-muted">
                    Observations
                  </h4>
                  <ul className="space-y-2">
                    {entry.reflection.observations.map((obs, i) => (
                      <li key={i} className="text-sm text-warm-text flex items-start gap-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-warm-accent mt-2 shrink-0" />
                        <span>{obs}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Themes */}
              {entry.reflection.themes && entry.reflection.themes.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-warm-muted">
                    Possible Themes
                  </h4>
                  <div className="flex items-center gap-2 flex-wrap">
                    {entry.reflection.themes.map((theme) => (
                      <Badge key={theme} variant="accent" size="md">
                        {theme}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Exploratory Questions */}
              {entry.reflection.questions && entry.reflection.questions.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-warm-muted">
                    Explore this
                  </h4>
                  <div className="space-y-2">
                    {entry.reflection.questions.map((q, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-2xl bg-warm-card border border-warm-border/60 text-xs sm:text-sm text-warm-text italic leading-relaxed"
                      >
                        "{q}"
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggested Action */}
              {entry.reflection.suggestedAction && (
                <div className="p-4 rounded-2xl bg-warm-sage-light/60 dark:bg-emerald-950/30 border border-warm-sage/30 text-xs sm:text-sm text-warm-text">
                  <span className="font-semibold text-warm-sage block mb-1">
                    Gentle suggestion:
                  </span>
                  {entry.reflection.suggestedAction}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-warm-card border border-dashed border-warm-border rounded-3xl p-8 text-center space-y-3">
              <Sparkles className="w-6 h-6 text-warm-accent mx-auto" />
              <h4 className="font-serif text-lg font-medium text-warm-text">
                Reflect on this memory with AI
              </h4>
              <p className="text-xs sm:text-sm text-warm-muted max-w-sm mx-auto">
                Generate supportive observations, thematic tags, and gentle questions without any diagnostic claims.
              </p>
              <Button
                variant="soft-accent"
                onClick={handleTriggerReflection}
                isLoading={isReflecting}
                leftIcon={<Sparkles className="w-4 h-4" />}
              >
                Generate Reflection
              </Button>
            </div>
          )}
        </div>
      </article>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete this memory?"
        subtitle="This action is permanent and will remove all associated media."
        maxWidth="sm"
      >
        <div className="space-y-4 pt-2">
          <p className="text-xs text-warm-muted leading-relaxed">
            Are you sure you want to remove <strong className="text-warm-text">"{entry.title || 'Untitled'}"</strong> from your journal?
          </p>
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDeleteModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                setShowDeleteModal(false);
                onDelete(entry.id);
              }}
            >
              Delete Memory
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
