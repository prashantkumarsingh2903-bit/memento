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
} from 'lucide-react';
import { format } from 'date-fns';
import type { JournalEntry } from '../types';
import { getMoodDetails } from '../components/common/MoodSelector';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { aiService } from '../services/ai/aiService';
import { AudioPlayerCard } from '../components/journal/AudioPlayerCard';

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
        return <Mic className="w-4 h-4 text-[#6C4FF6]" />;
      case 'video':
        return <Video className="w-4 h-4 text-[#D95CFF]" />;
      case 'photo':
        return <Camera className="w-4 h-4 text-emerald-500" />;
      case 'mixed':
        return <Layers className="w-4 h-4 text-[#48D7E8]" />;
      default:
        return <PenLine className="w-4 h-4 text-[#6C4FF6]" />;
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between gap-3 border-b border-app-border pb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-app-text-secondary hover:text-app-text transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Journal Timeline</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onToggleFavorite(entry.id)}
            className={`p-2 rounded-xl border transition-colors cursor-pointer ${
              entry.isFavorite
                ? 'text-rose-500 bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/40'
                : 'text-app-text-muted border-app-border hover:text-app-text hover:bg-app-surface-secondary'
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
          <div className="flex items-center gap-3 text-xs text-app-text-secondary">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-app-surface-secondary dark:bg-[#26252F] border border-app-border font-semibold text-app-text">
              {getTypeIcon()}
              <span className="capitalize">{entry.type} Journal</span>
            </span>

            <span className="flex items-center gap-1 font-medium">
              <Calendar className="w-3.5 h-3.5 text-app-text-muted" />
              <span>{formattedDate}</span>
            </span>

            <span className="flex items-center gap-1 font-medium">
              <Clock className="w-3.5 h-3.5 text-app-text-muted" />
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
        <h1 className="font-sans text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-app-text leading-tight">
          {entry.title || 'Untitled Memory'}
        </h1>

        {/* Tags */}
        {entry.tags && entry.tags.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            {entry.tags.map((tag) => (
              <Badge key={tag} variant="accent" size="sm">
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
                <div key={video.id} className="space-y-1.5">
                  <div className="rounded-2xl overflow-hidden border border-app-border bg-black aspect-video relative shadow-workspace">
                    <video
                      src={video.url}
                      controls
                      poster={video.thumbnailUrl}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {(video.resolution || video.frameRate || video.qualityPreset) && (
                    <div className="flex items-center gap-2 text-[11px] text-app-text-secondary px-1">
                      <span className="px-2.5 py-0.5 rounded-full bg-app-surface-secondary dark:bg-[#26252F] border border-app-border font-medium">
                        {video.resolution || 'HD'} {video.frameRate ? `• ${video.frameRate} FPS` : ''}
                      </span>
                      {video.qualityPreset && (
                        <span className="capitalize px-2.5 py-0.5 rounded-full bg-app-surface-secondary dark:bg-[#26252F] border border-app-border">
                          {video.qualityPreset} preset
                        </span>
                      )}
                    </div>
                  )}
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
                  className="rounded-2xl overflow-hidden border border-app-border bg-white dark:bg-[#201F28] shadow-subtle"
                >
                  <img
                    src={img.url}
                    alt={img.name || 'Journal photo'}
                    className="w-full h-64 object-cover"
                  />
                  {img.name && (
                    <p className="p-2.5 text-[11px] text-app-text-secondary truncate border-t border-app-border">
                      {img.name}
                    </p>
                  )}
                </div>
              ))}
          </div>
        )}

        {/* Attached Audio Memo */}
        {entry.media && entry.media.filter((m) => m.type === 'audio').length > 0 && (
          <div className="space-y-3">
            {entry.media
              .filter((m) => m.type === 'audio')
              .map((audio) => (
                <AudioPlayerCard key={audio.id} media={audio} />
              ))}
          </div>
        )}

        {/* Text Content */}
        {entry.text && (
          <div className="font-sans text-base sm:text-lg text-app-text leading-relaxed whitespace-pre-wrap pt-2">
            {entry.text}
          </div>
        )}

        {/* Spoken Transcript */}
        {entry.transcript && (
          <div className="bg-app-surface-secondary dark:bg-[#26252F] border border-app-border rounded-2xl p-5 space-y-2">
            <div className="flex items-center gap-2">
              <Mic className="w-4 h-4 text-[#6C4FF6]" />
              <h4 className="text-xs uppercase tracking-wider font-bold text-app-text-secondary">
                Voice Transcript
              </h4>
            </div>
            <p className="text-xs sm:text-sm text-app-text italic leading-relaxed">
              "{entry.transcript}"
            </p>
          </div>
        )}

        {/* AI Reflection Section */}
        <div className="pt-6 border-t border-app-border">
          {entry.reflection ? (
            <div className="bg-white dark:bg-[#201F28] border border-[#6C4FF6]/30 rounded-card p-6 sm:p-7 shadow-subtle space-y-6">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-[#F1EEFF] dark:bg-[#6C4FF6]/20 text-[#6C4FF6] dark:text-[#856DF8] border border-[#6C4FF6]/20">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-sans text-lg font-bold text-app-text">
                      AI Reflection & Understandings
                    </h3>
                    <p className="text-[11px] text-app-text-secondary">
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
                  <h4 className="text-xs font-bold uppercase tracking-wider text-app-text-secondary">
                    What I noticed
                  </h4>
                  <p className="text-xs sm:text-sm text-app-text leading-relaxed">
                    {entry.reflection.summary}
                  </p>
                </div>
              )}

              {/* Observations */}
              {entry.reflection.observations && entry.reflection.observations.length > 0 && (
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-app-text-secondary">
                    Observations
                  </h4>
                  <ul className="space-y-2">
                    {entry.reflection.observations.map((obs, i) => (
                      <li key={i} className="text-xs sm:text-sm text-app-text flex items-start gap-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#6C4FF6] mt-2 shrink-0" />
                        <span>{obs}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Themes */}
              {entry.reflection.themes && entry.reflection.themes.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-app-text-secondary">
                    Possible Themes
                  </h4>
                  <div className="flex items-center gap-2 flex-wrap">
                    {entry.reflection.themes.map((theme) => (
                      <span
                        key={theme}
                        className="text-xs px-3 py-1 rounded-full bg-[#F1EEFF] dark:bg-[#6C4FF6]/20 border border-[#6C4FF6]/20 font-semibold text-[#6C4FF6] dark:text-[#856DF8]"
                      >
                        {theme}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Exploratory Questions */}
              {entry.reflection.questions && entry.reflection.questions.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-app-text-secondary">
                    Explore this
                  </h4>
                  <div className="space-y-2">
                    {entry.reflection.questions.map((q, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-app-surface-secondary dark:bg-[#26252F] border border-app-border text-xs sm:text-sm text-app-text italic leading-relaxed"
                      >
                        "{q}"
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggested Action */}
              {entry.reflection.suggestedAction && (
                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 text-xs sm:text-sm text-app-text">
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 block mb-1">
                    Gentle suggestion:
                  </span>
                  {entry.reflection.suggestedAction}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white dark:bg-[#201F28] border border-dashed border-app-border rounded-card p-8 text-center space-y-3">
              <Sparkles className="w-6 h-6 text-[#6C4FF6] mx-auto" />
              <h4 className="font-sans text-base font-bold text-app-text">
                Reflect on this memory with AI
              </h4>
              <p className="text-xs text-app-text-secondary max-w-sm mx-auto">
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
          <p className="text-xs text-app-text-secondary leading-relaxed">
            Are you sure you want to remove <strong className="text-app-text">"{entry.title || 'Untitled'}"</strong> from your journal?
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
