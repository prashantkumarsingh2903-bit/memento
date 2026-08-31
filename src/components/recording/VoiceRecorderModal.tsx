import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  Square,
  Pause,
  Play,
  RotateCcw,
  Save,
  Trash2,
  Volume2,
  AlertCircle,
  X,
  FileText,
} from 'lucide-react';
import type { JournalEntry, Mood } from '../../types';
import { useAudioRecorder } from '../../hooks/useAudioRecorder';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import { formatDuration } from '../../services/media/mediaUtils';
import { MoodSelector } from '../common/MoodSelector';
import { Button } from '../common/Button';
import { aiService } from '../../services/ai/aiService';

interface VoiceRecorderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveVoiceEntry: (
    entryData: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>
  ) => void;
  initialMood?: Mood;
}

export const VoiceRecorderModal: React.FC<VoiceRecorderModalProps> = ({
  isOpen,
  onClose,
  onSaveVoiceEntry,
  initialMood,
}) => {
  const {
    recorderState,
    duration,
    audioBlob,
    audioUrl,
    audioLevel,
    permissionError,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    cancelRecording,
  } = useAudioRecorder();

  const {
    transcript,
    interimTranscript,
    isSupported: isSpeechSupported,
    startTranscribing,
    stopTranscribing,
    setTranscript,
    resetTranscript,
  } = useSpeechRecognition();

  const [title, setTitle] = useState('');
  const [mood, setMood] = useState<Mood | undefined>(initialMood);
  const [tags, setTags] = useState<string[]>(['VoiceJournal']);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [playbackCurrentTime, setPlaybackCurrentTime] = useState(0);
  const [playbackDuration, setPlaybackDuration] = useState(0);
  const [isReflecting, setIsReflecting] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Auto-start recording when modal opens
  useEffect(() => {
    if (isOpen && recorderState === 'idle') {
      startRecording();
      if (isSpeechSupported) {
        startTranscribing();
      }
    }
  }, [isOpen, recorderState, startRecording, isSpeechSupported, startTranscribing]);

  // Handle finish recording
  const handleFinishRecording = () => {
    stopRecording();
    stopTranscribing();
  };

  // Playback audio element management
  useEffect(() => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onloadedmetadata = () => {
        const d = isFinite(audio.duration) && audio.duration > 0
          ? Math.round(audio.duration)
          : duration;
        setPlaybackDuration(d || duration);
      };

      audio.ontimeupdate = () => {
        setPlaybackCurrentTime(audio.currentTime);
      };

      audio.onended = () => {
        setIsAudioPlaying(false);
        setPlaybackCurrentTime(0);
      };

      return () => {
        audio.pause();
        audio.src = '';
        audioRef.current = null;
      };
    }
  }, [audioUrl, duration]);

  const togglePlayback = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isAudioPlaying) {
      audio.pause();
      setIsAudioPlaying(false);
    } else {
      audio.play().then(() => {
        setIsAudioPlaying(true);
      }).catch((e) => {
        console.warn('Playback error:', e);
      });
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetTime = parseFloat(e.target.value);
    setPlaybackCurrentTime(targetTime);
    if (audioRef.current) {
      audioRef.current.currentTime = targetTime;
    }
  };

  const effectiveDuration = playbackDuration > 0 ? playbackDuration : (duration || 1);

  const handleSave = async () => {
    const recordedSecs = duration > 0 ? duration : (playbackDuration || 1);
    const defaultTitle =
      title.trim() || `Voice memo (${formatDuration(recordedSecs)})`;

    let generatedReflection = undefined;
    if (transcript.trim()) {
      try {
        setIsReflecting(true);
        generatedReflection = await aiService.generateReflection({
          title: defaultTitle,
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

    const mediaList =
      audioUrl && audioBlob
        ? [
            {
              id: `media-audio-${Date.now()}`,
              type: 'audio' as const,
              url: audioUrl,
              blob: audioBlob,
              duration: recordedSecs,
              name: `voice-journal-${Date.now()}.webm`,
              createdAt: new Date().toISOString(),
            },
          ]
        : [];

    onSaveVoiceEntry({
      title: defaultTitle,
      type: 'voice',
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
    resetTranscript();
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsAudioPlaying(false);
    setPlaybackCurrentTime(0);
    setTitle('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div
        className="fixed inset-0 bg-stone-950/70 backdrop-blur-md"
        onClick={handleClose}
      />

      <div className="relative w-full max-w-xl bg-warm-card border border-warm-border rounded-3xl p-6 sm:p-8 shadow-elevated z-10 animate-slide-up space-y-6 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
            <h3 className="font-serif text-2xl font-medium text-warm-text">
              Voice Journal
            </h3>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-full text-warm-muted hover:text-warm-text hover:bg-warm-card-subtle transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Permission Error Banner if any */}
        {permissionError && (
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/40 flex items-start gap-3 text-xs text-amber-800 dark:text-amber-300">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">{permissionError}</p>
              <p className="mt-1 text-warm-muted">
                You can still type your thoughts or grant microphone access in browser settings.
              </p>
            </div>
          </div>
        )}

        {/* State 1: Active Recording / Paused */}
        {(recorderState === 'recording' || recorderState === 'paused') && (
          <div className="py-6 text-center space-y-6">
            {/* Status indicator */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/40 text-rose-600 dark:text-rose-400 text-xs font-semibold">
              <Mic className="w-3.5 h-3.5 animate-pulse" />
              <span>
                {recorderState === 'recording'
                  ? 'Recording in progress'
                  : 'Recording paused'}
              </span>
            </div>

            {/* Timer display */}
            <div className="font-mono text-5xl sm:text-6xl font-medium text-warm-text tracking-tight">
              {formatDuration(duration)}
            </div>

            {/* Dynamic Waveform Visualizer */}
            <div className="flex items-center justify-center gap-1.5 h-14">
              {[...Array(20)].map((_, i) => {
                const heightMult =
                  recorderState === 'recording'
                    ? Math.max(
                        0.2,
                        audioLevel * 1.5 * Math.abs(Math.sin((i + 1) * 0.4))
                      )
                    : 0.15;
                const barHeight = Math.max(6, Math.min(48, heightMult * 48));
                return (
                  <span
                    key={i}
                    style={{ height: `${barHeight}px` }}
                    className="w-1.5 bg-rose-500 rounded-full transition-all duration-75"
                  />
                );
              })}
            </div>

            {/* Live Streaming Transcript */}
            <div className="bg-warm-card-subtle/80 border border-warm-border rounded-2xl p-4 min-h-[80px] text-left max-h-40 overflow-y-auto space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-wider text-warm-muted flex items-center gap-1.5">
                  <FileText className="w-3 h-3 text-rose-500" />
                  Live Transcript
                </span>
                {transcript && (
                  <span className="text-[10px] text-warm-muted">
                    {transcript.trim().split(/\s+/).length} words
                  </span>
                )}
              </div>
              {transcript || interimTranscript ? (
                <p className="text-xs sm:text-sm text-warm-text italic leading-relaxed">
                  {transcript}{' '}
                  <span className="text-warm-faint">{interimTranscript}</span>
                </p>
              ) : isSpeechSupported ? (
                <p className="text-xs text-warm-faint italic">
                  Speak into your microphone... your words will transcribe live.
                </p>
              ) : (
                <p className="text-xs text-warm-muted italic">
                  Speech transcription is not supported by your current browser, but your audio is recording clearly.
                </p>
              )}
            </div>

            {/* Recording Controls */}
            <div className="flex items-center justify-center gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleClose}
                leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
              >
                Cancel
              </Button>

              {recorderState === 'recording' ? (
                <Button
                  variant="secondary"
                  size="md"
                  onClick={pauseRecording}
                  leftIcon={<Pause className="w-4 h-4" />}
                >
                  Pause
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  size="md"
                  onClick={resumeRecording}
                  leftIcon={<Play className="w-4 h-4" />}
                >
                  Resume
                </Button>
              )}

              <Button
                variant="primary"
                size="md"
                className="bg-rose-600 hover:bg-rose-700"
                onClick={handleFinishRecording}
                leftIcon={<Square className="w-4 h-4 fill-white" />}
              >
                Finish Recording
              </Button>
            </div>
          </div>
        )}

        {/* State 2: Stopped / Review & Save Screen */}
        {recorderState === 'stopped' && (
          <div className="space-y-5 animate-slide-up">
            {/* Audio Playback Card with Interactive Scrubber */}
            <div className="bg-warm-card-subtle border border-warm-border rounded-2xl p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <button
                    type="button"
                    onClick={togglePlayback}
                    className="w-12 h-12 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-subtle hover:bg-rose-600 active:scale-95 transition-all cursor-pointer"
                  >
                    {isAudioPlaying ? (
                      <Pause className="w-5 h-5" />
                    ) : (
                      <Play className="w-5 h-5 ml-0.5" />
                    )}
                  </button>
                  <div>
                    <h4 className="text-sm font-semibold text-warm-text">
                      Voice Recording Ready
                    </h4>
                    <p className="text-xs text-warm-muted font-mono mt-0.5">
                      {formatDuration(playbackCurrentTime)} / {formatDuration(effectiveDuration)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-rose-500">
                  <Volume2 className="w-5 h-5" />
                  {isAudioPlaying && (
                    <div className="flex items-center gap-0.5">
                      <span className="w-1 h-3 bg-rose-500 rounded-full animate-pulse" />
                      <span className="w-1 h-5 bg-rose-500 rounded-full animate-pulse delay-75" />
                      <span className="w-1 h-2 bg-rose-500 rounded-full animate-pulse delay-150" />
                    </div>
                  )}
                </div>
              </div>

              {/* Progress Scrubber Slider */}
              <div className="pt-1">
                <input
                  type="range"
                  min={0}
                  max={effectiveDuration}
                  step={0.1}
                  value={playbackCurrentTime}
                  onChange={handleSeek}
                  className="w-full accent-rose-500 h-1.5 bg-warm-border rounded-lg cursor-pointer appearance-none"
                />
              </div>
            </div>

            {/* Title Input */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-warm-muted block mb-1">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Give this voice memory a title..."
                className="w-full font-serif text-lg bg-warm-card border border-warm-border rounded-2xl px-4 py-2.5 text-warm-text placeholder:text-warm-faint outline-none focus:border-warm-accent transition-colors"
              />
            </div>

            {/* Mood selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-warm-muted block">
                How did speaking this make you feel?
              </label>
              <MoodSelector
                value={mood}
                onChange={(m) => setMood(m)}
                size="sm"
              />
            </div>

            {/* Transcript Preview / Editor */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-warm-muted block">
                  Transcript {isSpeechSupported ? '(Editable)' : ''}
                </label>
                {transcript && (
                  <span className="text-[11px] text-warm-muted">
                    {transcript.trim().split(/\s+/).length} words
                  </span>
                )}
              </div>
              <textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder="No speech transcribed. You may write or edit your spoken thoughts here..."
                className="w-full bg-warm-card border border-warm-border rounded-2xl p-4 text-xs sm:text-sm text-warm-text placeholder:text-warm-faint outline-none focus:border-warm-accent leading-relaxed resize-none transition-colors"
                rows={4}
              />
            </div>

            {/* Tags & Context */}
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
                  className="text-xs text-warm-muted hover:text-warm-text px-2.5 py-0.5 rounded-full border border-dashed border-warm-border cursor-pointer hover:bg-warm-card-subtle"
                >
                  + Tag
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-warm-border">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                leftIcon={<Trash2 className="w-3.5 h-3.5" />}
              >
                Discard
              </Button>

              <Button
                size="md"
                onClick={handleSave}
                isLoading={isReflecting}
                leftIcon={<Save className="w-4 h-4" />}
              >
                Save Voice Journal
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
