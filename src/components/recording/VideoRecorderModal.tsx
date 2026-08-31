import React, { useState, useEffect } from 'react';
import {
  Video,
  Square,
  Pause,
  Play,
  RotateCcw,
  Save,
  Trash2,
  AlertCircle,
  X,
  Circle,
} from 'lucide-react';
import type { JournalEntry, Mood } from '../../types';
import { useVideoRecorder } from '../../hooks/useVideoRecorder';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import { formatDuration } from '../../services/media/mediaUtils';
import { MoodSelector } from '../common/MoodSelector';
import { Button } from '../common/Button';
import { aiService } from '../../services/ai/aiService';

interface VideoRecorderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveVideoEntry: (entryData: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>) => void;
  initialMood?: Mood;
}

export const VideoRecorderModal: React.FC<VideoRecorderModalProps> = ({
  isOpen,
  onClose,
  onSaveVideoEntry,
  initialMood,
}) => {
  const {
    recorderState,
    duration,
    videoBlob,
    videoUrl,
    thumbnailUrl,
    permissionError,
    videoPreviewRef,
    startPreview,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    cancelRecording,
  } = useVideoRecorder();

  const {
    transcript,
    isSupported: isSpeechSupported,
    startTranscribing,
    stopTranscribing,
    setTranscript,
  } = useSpeechRecognition();

  const [title, setTitle] = useState('');
  const [mood, setMood] = useState<Mood | undefined>(initialMood);
  const [tags, setTags] = useState<string[]>(['VideoJournal']);
  const [notes, setNotes] = useState('');
  const [isReflecting, setIsReflecting] = useState(false);

  // When modal opens, start camera preview
  useEffect(() => {
    if (isOpen && recorderState === 'idle') {
      startPreview();
    }
  }, [isOpen, recorderState, startPreview]);

  const handleStartRecording = () => {
    startRecording();
    if (isSpeechSupported) {
      startTranscribing();
    }
  };

  const handleStopRecording = () => {
    stopRecording();
    stopTranscribing();
  };

  const handleSave = async () => {
    const defaultTitle =
      title.trim() || `Video Journal (${formatDuration(duration)})`;

    let generatedReflection = undefined;
    const fullText = `${notes} ${transcript}`.trim();
    if (fullText) {
      try {
        setIsReflecting(true);
        generatedReflection = await aiService.generateReflection({
          title: defaultTitle,
          text: notes,
          transcript,
          mood,
          tags,
        });
      } catch {
        // Non-blocking
      } finally {
        setIsReflecting(false);
      }
    }

    const mediaList = videoUrl && videoBlob
      ? [
          {
            id: `media-video-${Date.now()}`,
            type: 'video' as const,
            url: videoUrl,
            blob: videoBlob,
            duration,
            thumbnailUrl,
            name: `video-journal-${Date.now()}.webm`,
            createdAt: new Date().toISOString(),
          },
        ]
      : [];

    onSaveVideoEntry({
      title: defaultTitle,
      type: 'video',
      text: notes.trim() || undefined,
      mood,
      tags,
      transcript: transcript.trim() || undefined,
      media: mediaList,
      reflection: generatedReflection,
    });

    handleClose();
  };

  const handleClose = () => {
    cancelRecording();
    stopTranscribing();
    setTitle('');
    setNotes('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div
        className="fixed inset-0 bg-stone-950/80 backdrop-blur-md"
        onClick={handleClose}
      />

      <div className="relative w-full max-w-2xl bg-warm-card border border-warm-border rounded-3xl p-6 sm:p-7 shadow-elevated z-10 animate-slide-up space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/40">
              <Video className="w-4 h-4" />
            </div>
            <h3 className="font-serif text-2xl font-medium text-warm-text">
              Video Journal
            </h3>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-full text-warm-muted hover:text-warm-text hover:bg-warm-card-subtle transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Permission Error Banner */}
        {permissionError && (
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/40 flex items-start gap-3 text-xs text-amber-800 dark:text-amber-300">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">{permissionError}</p>
              <p className="mt-1 text-warm-muted">
                Please verify your browser permissions for camera and microphone.
              </p>
            </div>
          </div>
        )}

        {/* State 1: Previewing & Recording */}
        {recorderState !== 'stopped' && (
          <div className="space-y-4">
            {/* Live Camera Viewfinder */}
            <div className="relative rounded-3xl overflow-hidden bg-black aspect-video flex items-center justify-center border border-warm-border shadow-soft">
              <video
                ref={videoPreviewRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover scale-x-[-1]"
              />

              {/* Active Recording Overlay */}
              {recorderState === 'recording' && (
                <div className="absolute top-4 left-4 flex items-center gap-2 bg-stone-900/80 backdrop-blur-md px-3 py-1.5 rounded-full text-white text-xs font-semibold shadow-subtle">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                  <span>REC</span>
                  <span className="font-mono ml-1">{formatDuration(duration)}</span>
                </div>
              )}

              {recorderState === 'paused' && (
                <div className="absolute top-4 left-4 flex items-center gap-2 bg-amber-600/90 backdrop-blur-md px-3 py-1.5 rounded-full text-white text-xs font-semibold shadow-subtle">
                  <span>PAUSED</span>
                  <span className="font-mono ml-1">{formatDuration(duration)}</span>
                </div>
              )}
            </div>

            {/* Viewfinder Controls */}
            <div className="flex items-center justify-center gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleClose}
                leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
              >
                Cancel
              </Button>

              {recorderState === 'previewing' && (
                <Button
                  size="md"
                  className="bg-rose-600 hover:bg-rose-700 font-semibold"
                  onClick={handleStartRecording}
                  leftIcon={<Circle className="w-4 h-4 fill-white" />}
                >
                  Start Recording
                </Button>
              )}

              {recorderState === 'recording' && (
                <>
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={pauseRecording}
                    leftIcon={<Pause className="w-4 h-4" />}
                  >
                    Pause
                  </Button>
                  <Button
                    size="md"
                    className="bg-rose-600 hover:bg-rose-700 font-semibold"
                    onClick={handleStopRecording}
                    leftIcon={<Square className="w-4 h-4 fill-white" />}
                  >
                    Stop & Review
                  </Button>
                </>
              )}

              {recorderState === 'paused' && (
                <>
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={resumeRecording}
                    leftIcon={<Play className="w-4 h-4" />}
                  >
                    Resume
                  </Button>
                  <Button
                    size="md"
                    className="bg-rose-600 hover:bg-rose-700 font-semibold"
                    onClick={handleStopRecording}
                    leftIcon={<Square className="w-4 h-4 fill-white" />}
                  >
                    Finish
                  </Button>
                </>
              )}
            </div>
          </div>
        )}

        {/* State 2: Post-Recording Review Screen */}
        {recorderState === 'stopped' && (
          <div className="space-y-5 animate-slide-up">
            {/* Video Playback Container */}
            <div className="rounded-3xl overflow-hidden bg-black aspect-video border border-warm-border shadow-soft">
              {videoUrl && (
                <video
                  src={videoUrl}
                  controls
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            {/* Title */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-warm-muted block mb-1">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Give this video memory a title..."
                className="w-full font-serif text-xl bg-warm-card border border-warm-border rounded-2xl px-4 py-2.5 text-warm-text placeholder:text-warm-faint outline-none focus:border-warm-accent"
              />
            </div>

            {/* Mood selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-warm-muted block">
                Mood
              </label>
              <MoodSelector
                value={mood}
                onChange={(m) => setMood(m)}
                size="sm"
              />
            </div>

            {/* Written Notes / Reflections alongside video */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-warm-muted block">
                Reflection Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any written thoughts or insights to accompany this video..."
                className="w-full bg-warm-card border border-warm-border rounded-2xl p-4 text-xs sm:text-sm text-warm-text placeholder:text-warm-faint outline-none focus:border-warm-accent leading-relaxed resize-none"
                rows={3}
              />
            </div>

            {/* Spoken Transcript if captured */}
            {transcript && (
              <div className="bg-warm-card-subtle border border-warm-border rounded-2xl p-4 space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-warm-muted block">
                  Detected Transcript
                </span>
                <textarea
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  className="w-full text-xs text-warm-text italic bg-transparent outline-none resize-none"
                  rows={2}
                />
              </div>
            )}

            {/* Tags */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-warm-muted block">
                Tags
              </label>
              <div className="flex items-center gap-1.5 flex-wrap">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="text-xs px-2.5 py-0.5 rounded-full bg-warm-card border border-warm-border text-warm-text font-medium"
                  >
                    #{t}
                  </span>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    const tag = prompt('Add tag:');
                    if (tag && !tags.includes(tag.trim())) {
                      setTags([...tags, tag.trim().replace(/^#/, '')]);
                    }
                  }}
                  className="text-xs text-warm-muted hover:text-warm-text px-2 py-0.5 rounded-full border border-dashed border-warm-border"
                >
                  + Tag
                </button>
              </div>
            </div>

            {/* Footer Action buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-warm-border">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                leftIcon={<Trash2 className="w-3.5 h-3.5" />}
              >
                Discard Video
              </Button>

              <Button
                size="md"
                onClick={handleSave}
                isLoading={isReflecting}
                leftIcon={<Save className="w-4 h-4" />}
              >
                Save Video Journal
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
