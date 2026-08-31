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
  Sliders,
  Sparkles,
  Gauge,
  Film,
  Camera,
} from 'lucide-react';
import type { JournalEntry, Mood, MediaItem } from '../../types';
import {
  useVideoRecorder,
  type VideoResolution,
  type VideoFrameRate,
  type VideoQualityPreset,
} from '../../hooks/useVideoRecorder';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import { formatDuration } from '../../services/media/mediaUtils';
import { MoodSelector } from '../common/MoodSelector';
import { Button } from '../common/Button';
import { aiService } from '../../services/ai/aiService';

interface VideoRecorderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveVideoEntry: (
    entryData: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>
  ) => void;
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
    resolution,
    frameRate,
    qualityPreset,
    setQualityPreset,
    changeResolution,
    changeFrameRate,
    toggleFacingMode,
    startPreview,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    cancelRecording,
  } = useVideoRecorder();

  const {
    transcript,
    interimTranscript,
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
  const [showQualityPanel, setShowQualityPanel] = useState(false);

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

    const mediaList: MediaItem[] =
      videoUrl && videoBlob
        ? [
            {
              id: `media-video-${Date.now()}`,
              type: 'video' as const,
              url: videoUrl,
              blob: videoBlob,
              duration,
              thumbnailUrl,
              resolution,
              frameRate,
              qualityPreset,
              size: videoBlob.size,
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
    setShowQualityPanel(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div
        className="fixed inset-0 bg-stone-900/60 dark:bg-black/80 backdrop-blur-md"
        onClick={handleClose}
      />

      <div className="relative w-full max-w-2xl bg-white dark:bg-[#201F28] border border-app-border rounded-modal p-5 sm:p-7 shadow-workspace z-10 animate-slide-up space-y-4 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-[#F1EEFF] dark:bg-[#6C4FF6]/20 text-[#6C4FF6] dark:text-[#856DF8] border border-[#6C4FF6]/20">
              <Video className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-sans text-lg sm:text-xl font-bold text-app-text">
                Video Reflection Studio
              </h3>
              <p className="text-[11px] text-app-text-secondary">
                High-definition recording with custom FPS & live speech transcript
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-full text-app-text-muted hover:text-app-text hover:bg-app-surface-secondary dark:hover:bg-[#26252F] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Permission Error Banner */}
        {permissionError && (
          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/40 flex items-start gap-3 text-xs text-amber-800 dark:text-amber-300">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">{permissionError}</p>
              <p className="mt-1 text-app-text-secondary">
                Please verify your browser permissions for camera and microphone.
              </p>
            </div>
          </div>
        )}

        {/* State 1: Previewing & Recording Viewfinder */}
        {recorderState !== 'stopped' && (
          <div className="space-y-3">
            {/* Live Camera Viewfinder */}
            <div className="relative rounded-2xl overflow-hidden bg-black aspect-video flex items-center justify-center border border-app-border shadow-workspace group">
              <video
                ref={videoPreviewRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover scale-x-[-1]"
              />

              {/* Top Left: Active Recording / State Pill */}
              <div className="absolute top-3 left-3 flex items-center gap-2">
                {recorderState === 'recording' && (
                  <div className="flex items-center gap-2 bg-stone-900/80 backdrop-blur-md px-3 py-1.5 rounded-full text-white text-xs font-semibold shadow-subtle border border-white/10">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                    <span>REC</span>
                    <span className="font-mono ml-1 font-bold">{formatDuration(duration)}</span>
                  </div>
                )}

                {recorderState === 'paused' && (
                  <div className="flex items-center gap-2 bg-amber-600/90 backdrop-blur-md px-3 py-1.5 rounded-full text-white text-xs font-semibold shadow-subtle">
                    <span>PAUSED</span>
                    <span className="font-mono ml-1 font-bold">{formatDuration(duration)}</span>
                  </div>
                )}

                {recorderState === 'previewing' && (
                  <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-white/90 text-[11px] font-medium border border-white/10">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>Viewfinder Active</span>
                  </div>
                )}
              </div>

              {/* Top Right: Frame Rate & Quality Badges */}
              <div className="absolute top-3 right-3 flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setShowQualityPanel(!showQualityPanel)}
                  className="flex items-center gap-1 bg-black/60 hover:bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-full text-white text-[11px] font-semibold border border-white/15 transition-all cursor-pointer"
                  title="Configure resolution and frame rate"
                >
                  <Film className="w-3 h-3 text-[#856DF8]" />
                  <span>{resolution}</span>
                  <span className="text-white/40">/</span>
                  <span>{frameRate}fps</span>
                  <Sliders className="w-3 h-3 ml-0.5 text-white/70" />
                </button>

                <button
                  type="button"
                  onClick={toggleFacingMode}
                  className="p-1.5 bg-black/60 hover:bg-black/80 backdrop-blur-md rounded-full text-white border border-white/15 transition-all cursor-pointer"
                  title="Switch camera"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Live speech-to-text subtitle overlay during recording */}
              {recorderState === 'recording' && (transcript || interimTranscript) && (
                <div className="absolute bottom-3 inset-x-3 bg-black/70 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/10 text-center animate-fade-in pointer-events-none">
                  <p className="text-xs text-white/90 italic font-medium leading-relaxed max-w-lg mx-auto line-clamp-2">
                    "{transcript ? `${transcript} ` : ''}
                    <span className="text-[#856DF8]">{interimTranscript}</span>"
                  </p>
                </div>
              )}
            </div>

            {/* Quality & Frame Rate Quick-Config Panel */}
            {showQualityPanel && recorderState === 'previewing' && (
              <div className="p-3.5 rounded-xl bg-app-surface-secondary dark:bg-[#26252F] border border-app-border space-y-3 animate-slide-up">
                <div className="flex items-center justify-between text-xs font-bold text-app-text">
                  <span className="flex items-center gap-1.5">
                    <Gauge className="w-3.5 h-3.5 text-[#6C4FF6]" />
                    <span>Camera & Quality Settings</span>
                  </span>
                  <span className="text-[10px] text-app-text-muted font-normal">
                    Adjust before starting record
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  {/* Resolution */}
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-app-text-secondary block">
                      Resolution
                    </label>
                    <div className="flex gap-1">
                      {(['1080p', '720p', '480p'] as VideoResolution[]).map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => changeResolution(r)}
                          className={`flex-1 py-1 px-2 rounded-lg font-semibold transition-all cursor-pointer ${
                            resolution === r
                              ? 'bg-[#6C4FF6] text-white shadow-subtle'
                              : 'bg-white dark:bg-[#201F28] text-app-text-secondary hover:text-app-text border border-app-border'
                          }`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Frame Rate */}
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-app-text-secondary block">
                      Frame Rate (FPS)
                    </label>
                    <div className="flex gap-1">
                      {([60, 30, 24] as VideoFrameRate[]).map((fps) => (
                        <button
                          key={fps}
                          type="button"
                          onClick={() => changeFrameRate(fps)}
                          className={`flex-1 py-1 px-2 rounded-lg font-semibold transition-all cursor-pointer ${
                            frameRate === fps
                              ? 'bg-[#6C4FF6] text-white shadow-subtle'
                              : 'bg-white dark:bg-[#201F28] text-app-text-secondary hover:text-app-text border border-app-border'
                          }`}
                        >
                          {fps} fps
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Bitrate / Quality */}
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-app-text-secondary block">
                      Bitrate Preset
                    </label>
                    <div className="flex gap-1">
                      {(['high', 'standard', 'economy'] as VideoQualityPreset[]).map((q) => (
                        <button
                          key={q}
                          type="button"
                          onClick={() => setQualityPreset(q)}
                          className={`flex-1 py-1 px-2 rounded-lg capitalize font-semibold transition-all cursor-pointer ${
                            qualityPreset === q
                              ? 'bg-[#6C4FF6] text-white shadow-subtle'
                              : 'bg-white dark:bg-[#201F28] text-app-text-secondary hover:text-app-text border border-app-border'
                          }`}
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Viewfinder Controls */}
            <div className="flex items-center justify-center gap-3 pt-1">
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
                  className="bg-[#6C4FF6] hover:bg-[#5B3FD4] font-semibold px-6"
                  onClick={handleStartRecording}
                  leftIcon={<Circle className="w-4 h-4 fill-white" />}
                >
                  Start Recording ({resolution} @ {frameRate}fps)
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
                    className="bg-rose-600 hover:bg-rose-700 font-semibold px-6"
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
                    className="bg-rose-600 hover:bg-rose-700 font-semibold px-6"
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
          <div className="space-y-4 animate-slide-up">
            {/* Video Playback Container with Media Info Bar */}
            <div className="space-y-2">
              <div className="rounded-2xl overflow-hidden bg-black aspect-video border border-app-border shadow-workspace">
                {videoUrl && (
                  <video
                    src={videoUrl}
                    controls
                    className="w-full h-full object-cover"
                  />
                )}
              </div>

              {/* Recorded Specs Strip */}
              <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-app-surface-secondary dark:bg-[#26252F] text-[11px] text-app-text-secondary border border-app-border">
                <span className="flex items-center gap-1 font-semibold text-app-text">
                  <Film className="w-3 h-3 text-[#6C4FF6]" />
                  <span>{resolution} • {frameRate} FPS • {qualityPreset} preset</span>
                </span>
                <span>
                  Length: <strong>{formatDuration(duration)}</strong>
                  {videoBlob && ` (${(videoBlob.size / (1024 * 1024)).toFixed(1)} MB)`}
                </span>
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-app-text-secondary block mb-1">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Give this video memory a title..."
                className="w-full font-sans text-sm sm:text-base bg-white dark:bg-[#201F28] border border-app-border rounded-xl px-4 py-2.5 text-app-text placeholder:text-app-text-muted outline-none focus:border-[#6C4FF6]"
              />
            </div>

            {/* Mood selector */}
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-app-text-secondary block">
                Mood
              </label>
              <MoodSelector
                value={mood}
                onChange={(m) => setMood(m)}
                size="sm"
              />
            </div>

            {/* Spoken Transcript Area */}
            <div className="bg-app-surface-secondary dark:bg-[#26252F] border border-app-border rounded-xl p-3.5 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#6C4FF6] flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>Speech-to-Text Transcript</span>
                </span>
                <span className="text-[10px] text-app-text-muted">
                  {transcript.trim() ? `${transcript.trim().split(/\s+/).length} words recorded` : 'Editable'}
                </span>
              </div>
              <textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder="Spoken words will automatically transcribe here, or you can type directly..."
                className="w-full text-xs text-app-text bg-white dark:bg-[#201F28] border border-app-border/80 rounded-lg p-2.5 outline-none focus:border-[#6C4FF6] resize-none leading-relaxed"
                rows={2}
              />
            </div>

            {/* Written Notes / Reflections alongside video */}
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-app-text-secondary block">
                Additional Reflections & Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add written thoughts, feelings, or takeaways..."
                className="w-full bg-white dark:bg-[#201F28] border border-app-border rounded-xl p-3 text-xs sm:text-sm text-app-text placeholder:text-app-text-muted outline-none focus:border-[#6C4FF6] leading-relaxed resize-none"
                rows={2}
              />
            </div>

            {/* Tags */}
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-app-text-secondary block">
                Tags
              </label>
              <div className="flex items-center gap-1.5 flex-wrap">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="text-xs px-3 py-1 rounded-full bg-[#F1EEFF] dark:bg-[#6C4FF6]/20 border border-[#6C4FF6]/20 text-[#6C4FF6] dark:text-[#856DF8] font-semibold"
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
                  className="text-xs text-app-text-secondary hover:text-app-text px-3 py-1 rounded-full border border-dashed border-app-border cursor-pointer hover:bg-app-surface-secondary"
                >
                  + Tag
                </button>
              </div>
            </div>

            {/* Footer Action buttons */}
            <div className="flex items-center justify-between pt-2 border-t border-app-border">
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
