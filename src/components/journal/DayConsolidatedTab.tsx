import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Mic,
  PenLine,
  Video,
  Camera,
  Heart,
  Sparkles,
  Edit3,
  Trash2,
  ChevronDown,
  ChevronUp,
  Play,
  Film,
  Image as ImageIcon,
  BookOpen,
} from 'lucide-react';
import { format } from 'date-fns';
import type { JournalEntry, EntryType, Mood } from '../../types';
import { getMoodDetails } from '../common/MoodSelector';
import { AudioPlayerCard } from './AudioPlayerCard';
import { Badge } from '../common/Badge';

export interface DayGroupData {
  dateKey: string; // YYYY-MM-DD
  date: Date;
  label: string;
  subLabel: string;
  isToday: boolean;
  isYesterday: boolean;
  entries: JournalEntry[];
  types: EntryType[];
  moods: Mood[];
}

interface DayConsolidatedTabProps {
  group: DayGroupData;
  isInitiallyCollapsed?: boolean;
  onOpenEntry: (id: string) => void;
  onEditEntry: (id: string) => void;
  onDeleteEntry: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onStartCapture?: (type: EntryType) => void;
}

export const DayConsolidatedTab: React.FC<DayConsolidatedTabProps> = ({
  group,
  isInitiallyCollapsed = false,
  onOpenEntry,
  onEditEntry,
  onDeleteEntry,
  onToggleFavorite,
  onStartCapture,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(isInitiallyCollapsed);
  const [filterModal, setFilterModal] = useState<EntryType | 'all'>('all');

  // Segregate entries and media of this day
  const textEntries = group.entries.filter((e) => e.type === 'text' || e.text);
  const voiceEntries = group.entries.filter(
    (e) => e.type === 'voice' || e.media?.some((m) => m.type === 'audio')
  );
  const videoEntries = group.entries.filter(
    (e) => e.type === 'video' || e.media?.some((m) => m.type === 'video')
  );
  const photoEntries = group.entries.filter(
    (e) => e.type === 'photo' || e.media?.some((m) => m.type === 'image')
  );

  // Extract all media items of this day
  const allAudioItems = group.entries.flatMap(
    (e) => e.media?.filter((m) => m.type === 'audio') || []
  );
  const allVideoItems = group.entries.flatMap(
    (e) => e.media?.filter((m) => m.type === 'video') || []
  );
  const allImageItems = group.entries.flatMap(
    (e) => e.media?.filter((m) => m.type === 'image') || []
  );

  // Calculate day totals
  const totalWords = group.entries.reduce((acc, e) => {
    const textWords = e.text ? e.text.trim().split(/\s+/).length : 0;
    const transWords = e.transcript ? e.transcript.trim().split(/\s+/).length : 0;
    return acc + textWords + transWords;
  }, 0);

  const totalAudioDuration = group.entries.reduce((acc, e) => {
    const item = e.media?.find((m) => m.type === 'audio' || m.type === 'video');
    return acc + (item?.duration || 0);
  }, 0);

  const reflections = group.entries
    .map((e) => e.reflection)
    .filter(Boolean);

  const filteredEntries =
    filterModal === 'all'
      ? group.entries
      : group.entries.filter((e) => e.type === filterModal);

  return (
    <article className="rounded-2xl border border-app-border bg-white dark:bg-[#201F28] shadow-subtle hover:border-[#6C4FF6]/40 transition-all duration-200 overflow-hidden">
      {/* ========================================================================= */}
      {/* 1. MASTER DAY TAB BANNER / HEADER                                         */}
      {/* ========================================================================= */}
      <div
        className={`p-4 sm:p-6 border-b border-app-border transition-colors ${
          group.isToday
            ? 'bg-gradient-to-r from-[#F1EEFF] via-white to-white dark:from-[#6C4FF6]/15 dark:via-[#201F28] dark:to-[#201F28]'
            : 'bg-app-surface-secondary/60 dark:bg-[#26252F]/60'
        }`}
      >
        <div className="flex items-center justify-between gap-3 flex-wrap">
          {/* Left: Date & Subtitle */}
          <div className="flex items-center gap-3">
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-soft ${
                group.isToday
                  ? 'bg-[#6C4FF6] text-white'
                  : 'bg-white dark:bg-[#201F28] text-[#6C4FF6] dark:text-[#856DF8] border border-app-border'
              }`}
            >
              <Calendar className="w-5 h-5" />
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-sans text-lg sm:text-xl font-extrabold text-app-text tracking-tight">
                  {group.label}
                </h2>
                <span className="text-sm font-semibold text-app-text-secondary">
                  — {group.subLabel}
                </span>
                {group.isToday && (
                  <span className="text-[10px] uppercase font-extrabold tracking-wider bg-[#6C4FF6] text-white px-2.5 py-0.5 rounded-full shadow-subtle">
                    Today
                  </span>
                )}
              </div>
              <p className="text-xs text-app-text-secondary mt-0.5">
                Unified Day Digest • {group.entries.length}{' '}
                {group.entries.length === 1 ? 'entry' : 'entries'} captured
              </p>
            </div>
          </div>

          {/* Right: Day Totals & Collapse Toggle */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Aggregated Badges */}
            <div className="hidden md:flex items-center gap-2 text-xs font-semibold">
              {totalAudioDuration > 0 && (
                <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#201F28] border border-app-border text-[#6C4FF6] dark:text-[#856DF8] flex items-center gap-1 font-mono">
                  <Play className="w-3 h-3 fill-current" />
                  <span>
                    {Math.floor(totalAudioDuration / 60)}m{' '}
                    {Math.floor(totalAudioDuration % 60)}s
                  </span>
                </span>
              )}
              {totalWords > 0 && (
                <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#201F28] border border-app-border text-app-text-secondary">
                  {totalWords} words
                </span>
              )}
            </div>

            {/* Mood Emojis */}
            {group.moods.length > 0 && (
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white dark:bg-[#201F28] border border-app-border text-base">
                {group.moods.map((m) => {
                  const info = getMoodDetails(m);
                  return (
                    <span key={m} title={`Mood: ${info?.label}`}>
                      {info?.emoji}
                    </span>
                  );
                })}
              </div>
            )}

            {/* Expand / Collapse Button */}
            <button
              type="button"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 rounded-xl text-app-text-muted hover:text-app-text hover:bg-white dark:hover:bg-[#201F28] border border-transparent hover:border-app-border transition-all cursor-pointer"
              aria-label={isCollapsed ? 'Expand day tab' : 'Collapse day tab'}
            >
              {isCollapsed ? (
                <ChevronDown className="w-5 h-5" />
              ) : (
                <ChevronUp className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* 4 Modality Filter Pills + Quick Add Buttons inside Day Tab */}
        {!isCollapsed && (
          <div className="flex items-center justify-between gap-3 pt-4 mt-4 border-t border-app-border/70 flex-wrap">
            {/* Filter Modality Tabs */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={() => setFilterModal('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  filterModal === 'all'
                    ? 'bg-[#6C4FF6] text-white shadow-subtle'
                    : 'bg-white dark:bg-[#201F28] text-app-text-secondary hover:text-app-text border border-app-border'
                }`}
              >
                All Moments ({group.entries.length})
              </button>

              {voiceEntries.length > 0 && (
                <button
                  onClick={() => setFilterModal('voice')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    filterModal === 'voice'
                      ? 'bg-[#6C4FF6] text-white shadow-subtle'
                      : 'bg-white dark:bg-[#201F28] text-app-text-secondary hover:text-app-text border border-app-border'
                  }`}
                >
                  <Mic className="w-3.5 h-3.5 text-[#6C4FF6]" />
                  <span>Audio ({voiceEntries.length})</span>
                </button>
              )}

              {videoEntries.length > 0 && (
                <button
                  onClick={() => setFilterModal('video')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    filterModal === 'video'
                      ? 'bg-[#D95CFF] text-white shadow-subtle'
                      : 'bg-white dark:bg-[#201F28] text-app-text-secondary hover:text-app-text border border-app-border'
                  }`}
                >
                  <Video className="w-3.5 h-3.5 text-[#D95CFF]" />
                  <span>Video ({videoEntries.length})</span>
                </button>
              )}

              {textEntries.length > 0 && (
                <button
                  onClick={() => setFilterModal('text')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    filterModal === 'text'
                      ? 'bg-cyan-600 text-white shadow-subtle'
                      : 'bg-white dark:bg-[#201F28] text-app-text-secondary hover:text-app-text border border-app-border'
                  }`}
                >
                  <PenLine className="w-3.5 h-3.5 text-cyan-600" />
                  <span>Text ({textEntries.length})</span>
                </button>
              )}

              {photoEntries.length > 0 && (
                <button
                  onClick={() => setFilterModal('photo')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    filterModal === 'photo'
                      ? 'bg-emerald-600 text-white shadow-subtle'
                      : 'bg-white dark:bg-[#201F28] text-app-text-secondary hover:text-app-text border border-app-border'
                  }`}
                >
                  <Camera className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Photos ({photoEntries.length})</span>
                </button>
              )}
            </div>

            {/* Quick Add buttons for this specific day */}
            {onStartCapture && (
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-semibold text-app-text-muted mr-1 hidden sm:inline">
                  Add to this day:
                </span>
                <button
                  onClick={() => onStartCapture('voice')}
                  className="p-1.5 rounded-lg bg-white dark:bg-[#201F28] hover:bg-[#F1EEFF] dark:hover:bg-[#6C4FF6]/20 text-[#6C4FF6] dark:text-[#856DF8] border border-app-border cursor-pointer transition-all"
                  title="Record voice note for this day"
                >
                  <Mic className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onStartCapture('video')}
                  className="p-1.5 rounded-lg bg-white dark:bg-[#201F28] hover:bg-fuchsia-50 dark:hover:bg-fuchsia-950/30 text-[#D95CFF] border border-app-border cursor-pointer transition-all"
                  title="Record video journal for this day"
                >
                  <Video className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onStartCapture('text')}
                  className="p-1.5 rounded-lg bg-white dark:bg-[#201F28] hover:bg-cyan-50 dark:hover:bg-cyan-950/30 text-cyan-600 border border-app-border cursor-pointer transition-all"
                  title="Write text note for this day"
                >
                  <PenLine className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onStartCapture('photo')}
                  className="p-1.5 rounded-lg bg-white dark:bg-[#201F28] hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-emerald-600 border border-app-border cursor-pointer transition-all"
                  title="Add photo for this day"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 2. TAB BODY: EMBEDDED MULTIMODAL DAY TIMELINE                            */}
      {/* ========================================================================= */}
      {!isCollapsed && (
        <div className="p-4 sm:p-6 space-y-6 animate-slide-up">
          {/* SECTION 1: Embedded Videos of the Day */}
          {allVideoItems.length > 0 && filterModal === 'all' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-app-text uppercase tracking-wider">
                <Film className="w-4 h-4 text-[#D95CFF]" />
                <span>Video Journals ({allVideoItems.length})</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {allVideoItems.map((video) => (
                  <div
                    key={video.id}
                    className="rounded-xl overflow-hidden border border-app-border bg-black aspect-video relative shadow-workspace"
                  >
                    <video
                      src={video.url}
                      controls
                      poster={video.thumbnailUrl}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-2 left-2 flex items-center gap-1.5 text-[10px] text-white bg-black/70 backdrop-blur-md px-2 py-0.5 rounded-md pointer-events-none">
                      <span>{video.resolution || '1080p'}</span>
                      {video.frameRate && <span>• {video.frameRate} FPS</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 2: Embedded Audio Player for Voice Memos */}
          {allAudioItems.length > 0 && filterModal === 'all' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-app-text uppercase tracking-wider">
                <Mic className="w-4 h-4 text-[#6C4FF6]" />
                <span>Spoken Audio Memos ({allAudioItems.length})</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {allAudioItems.map((audio) => (
                  <AudioPlayerCard key={audio.id} media={audio} />
                ))}
              </div>
            </div>
          )}

          {/* SECTION 3: Attached Photos of the Day */}
          {allImageItems.length > 0 && filterModal === 'all' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-app-text uppercase tracking-wider">
                <ImageIcon className="w-4 h-4 text-emerald-600" />
                <span>Photo Memories ({allImageItems.length})</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {allImageItems.map((img) => (
                  <div
                    key={img.id}
                    className="relative aspect-square rounded-xl overflow-hidden border border-app-border bg-app-surface-secondary group shadow-subtle"
                  >
                    <img
                      src={img.url}
                      alt={img.name || 'Photo memory'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 4: Stacked Timeline Stream of Moments */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-app-text-secondary flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-[#6C4FF6]" />
                <span>Daily Log & Timeline Entries</span>
              </span>
              <span className="text-[11px] text-app-text-muted">
                {filteredEntries.length} items
              </span>
            </div>

            <div className="space-y-3">
              {filteredEntries.map((entry) => {
                const moodInfo = getMoodDetails(entry.mood);
                const timeStr = format(new Date(entry.createdAt), 'h:mm a');

                return (
                  <div
                    key={entry.id}
                    onClick={() => onOpenEntry(entry.id)}
                    className="group relative rounded-xl p-4 sm:p-5 bg-app-surface-secondary/40 dark:bg-[#26252F]/40 border border-app-border hover:border-[#6C4FF6]/40 hover:bg-white dark:hover:bg-[#201F28] hover:shadow-soft transition-all duration-200 cursor-pointer"
                  >
                    {/* Top Row: Time, Type, Mood & Actions */}
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <div className="flex items-center gap-2 flex-wrap text-xs">
                        <span className="flex items-center gap-1 font-mono text-[11px] font-bold text-app-text bg-white dark:bg-[#201F28] px-2.5 py-1 rounded-lg border border-app-border">
                          <Clock className="w-3 h-3 text-[#6C4FF6]" />
                          <span>{timeStr}</span>
                        </span>

                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-[#F1EEFF] dark:bg-[#6C4FF6]/20 text-[#6C4FF6] dark:text-[#856DF8] border border-[#6C4FF6]/20 capitalize">
                          {entry.type === 'voice' && <Mic className="w-3 h-3" />}
                          {entry.type === 'video' && <Video className="w-3 h-3 text-[#D95CFF]" />}
                          {entry.type === 'text' && <PenLine className="w-3 h-3 text-cyan-600" />}
                          {entry.type === 'photo' && <Camera className="w-3 h-3 text-emerald-600" />}
                          <span>{entry.type}</span>
                        </span>

                        {moodInfo && (
                          <span
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white dark:bg-[#201F28] border border-app-border"
                            title={moodInfo.label}
                          >
                            <span>{moodInfo.emoji}</span>
                            <span className="text-app-text text-[11px] font-medium hidden sm:inline">
                              {moodInfo.label}
                            </span>
                          </span>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div
                        className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => onToggleFavorite(entry.id)}
                          className={`p-1.5 rounded-lg hover:bg-app-surface-secondary transition-colors cursor-pointer ${
                            entry.isFavorite
                              ? 'text-rose-500'
                              : 'text-app-text-muted hover:text-app-text'
                          }`}
                          title={entry.isFavorite ? 'Remove favorite' : 'Favorite'}
                        >
                          <Heart
                            className={`w-4 h-4 ${
                              entry.isFavorite ? 'fill-rose-500' : ''
                            }`}
                          />
                        </button>
                        <button
                          onClick={() => onEditEntry(entry.id)}
                          className="p-1.5 rounded-lg text-app-text-muted hover:text-app-text hover:bg-app-surface-secondary transition-colors cursor-pointer"
                          title="Edit entry"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteEntry(entry.id)}
                          className="p-1.5 rounded-lg text-app-text-muted hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                          title="Delete entry"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Entry Title */}
                    <h3 className="font-sans text-base font-bold text-app-text group-hover:text-[#6C4FF6] dark:group-hover:text-[#856DF8] transition-colors mb-1.5">
                      {entry.title || 'Untitled Moment'}
                    </h3>

                    {/* Text Body */}
                    {entry.text && (
                      <p className="text-xs sm:text-sm text-app-text-secondary line-clamp-3 leading-relaxed mb-3">
                        {entry.text}
                      </p>
                    )}

                    {/* Spoken Transcript preview */}
                    {entry.transcript && (
                      <div className="p-2.5 rounded-lg bg-white/80 dark:bg-[#201F28]/80 border border-app-border/80 text-xs italic text-app-text-secondary mb-3">
                        <span className="font-semibold text-[#6C4FF6] not-italic mr-1">
                          Transcript:
                        </span>
                        "{entry.transcript}"
                      </div>
                    )}

                    {/* Tags */}
                    {entry.tags && entry.tags.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {entry.tags.map((t) => (
                          <Badge key={t} variant="default" size="sm">
                            #{t}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* SECTION 5: AI Daily Reflection Synthesis */}
          {reflections.length > 0 && (
            <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-r from-[#F1EEFF]/60 via-white to-white dark:from-[#6C4FF6]/10 dark:via-[#26252F] dark:to-[#26252F] border border-[#6C4FF6]/25 space-y-2.5 shadow-subtle">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#6C4FF6] dark:text-[#856DF8]" />
                <h4 className="font-sans text-xs sm:text-sm font-bold text-app-text">
                  AI Day Synthesis & Patterns
                </h4>
              </div>
              <p className="text-xs sm:text-sm text-app-text-secondary leading-relaxed">
                {reflections[0]?.summary ||
                  'Your moments captured today reveal clear intentionality, presence, and expressive reflection across voice, video, and writing.'}
              </p>
            </div>
          )}
        </div>
      )}
    </article>
  );
};
