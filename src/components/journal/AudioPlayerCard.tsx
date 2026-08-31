import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2 } from 'lucide-react';
import type { MediaItem } from '../../types';
import { formatDuration } from '../../services/media/mediaUtils';

interface AudioPlayerCardProps {
  media: MediaItem;
}

export const AudioPlayerCard: React.FC<AudioPlayerCardProps> = ({ media }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(media.duration || 0);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (media.url) {
      const audio = new Audio(media.url);
      audioRef.current = audio;

      audio.onloadedmetadata = () => {
        if (isFinite(audio.duration) && audio.duration > 0) {
          setDuration(Math.round(audio.duration));
        }
      };

      audio.ontimeupdate = () => {
        setCurrentTime(audio.currentTime);
      };

      audio.onended = () => {
        setIsPlaying(false);
        setCurrentTime(0);
      };

      return () => {
        audio.pause();
        audio.src = '';
        audioRef.current = null;
      };
    }
  }, [media.url, media.duration]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => {
        setIsPlaying(true);
      }).catch((e) => {
        console.warn('Audio playback failed:', e);
      });
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const target = parseFloat(e.target.value);
    setCurrentTime(target);
    if (audioRef.current) {
      audioRef.current.currentTime = target;
    }
  };

  const effectiveDuration = duration > 0 ? duration : (media.duration || 1);

  return (
    <div className="bg-warm-card border border-warm-border rounded-2xl p-4 sm:p-5 shadow-subtle space-y-3">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <button
            type="button"
            onClick={togglePlay}
            className="w-11 h-11 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-subtle hover:bg-rose-600 active:scale-95 transition-all cursor-pointer shrink-0"
            aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5 ml-0.5" />
            )}
          </button>
          <div>
            <p className="text-sm font-semibold text-warm-text">
              {media.name || 'Voice Note'}
            </p>
            <p className="text-xs text-warm-muted font-mono mt-0.5">
              {formatDuration(currentTime)} / {formatDuration(effectiveDuration)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-rose-500 shrink-0">
          <Volume2 className="w-4 h-4" />
          {isPlaying && (
            <div className="flex items-center gap-0.5">
              <span className="w-1 h-3 bg-rose-500 rounded-full animate-pulse" />
              <span className="w-1 h-5 bg-rose-500 rounded-full animate-pulse delay-75" />
              <span className="w-1 h-2 bg-rose-500 rounded-full animate-pulse delay-150" />
            </div>
          )}
        </div>
      </div>

      {/* Progress scrubber */}
      <div className="pt-1">
        <input
          type="range"
          min={0}
          max={effectiveDuration}
          step={0.1}
          value={currentTime}
          onChange={handleSeek}
          className="w-full accent-rose-500 h-1.5 bg-warm-border rounded-lg cursor-pointer appearance-none"
        />
      </div>
    </div>
  );
};
