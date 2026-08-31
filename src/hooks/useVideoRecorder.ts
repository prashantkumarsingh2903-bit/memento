import { useState, useRef, useCallback, useEffect } from 'react';
import {
  getSupportedVideoMimeType,
  generateVideoThumbnail,
} from '../services/media/mediaUtils';

export type VideoRecorderState = 'idle' | 'previewing' | 'recording' | 'paused' | 'stopped';
export type VideoResolution = '1080p' | '720p' | '480p';
export type VideoFrameRate = 60 | 30 | 24;
export type VideoQualityPreset = 'high' | 'standard' | 'economy';

const RESOLUTION_SPECS: Record<VideoResolution, { width: number; height: number; label: string }> = {
  '1080p': { width: 1920, height: 1080, label: '1080p Full HD' },
  '720p': { width: 1280, height: 720, label: '720p HD' },
  '480p': { width: 854, height: 480, label: '480p SD' },
};

const BITRATE_SPECS: Record<VideoQualityPreset, { videoBitrate: number; audioBitrate: number }> = {
  high: { videoBitrate: 4500000, audioBitrate: 256000 },
  standard: { videoBitrate: 2500000, audioBitrate: 128000 },
  economy: { videoBitrate: 900000, audioBitrate: 64000 },
};

export function useVideoRecorder() {
  const [recorderState, setRecorderState] = useState<VideoRecorderState>('idle');
  const [duration, setDuration] = useState(0);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string>('');
  const [permissionError, setPermissionError] = useState<string | null>(null);

  // Quality & Frame controls
  const [resolution, setResolution] = useState<VideoResolution>('720p');
  const [frameRate, setFrameRate] = useState<VideoFrameRate>(30);
  const [qualityPreset, setQualityPreset] = useState<VideoQualityPreset>('high');
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');

  const videoPreviewRef = useRef<HTMLVideoElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const accumulatedTimeRef = useRef<number>(0);

  const startPreview = useCallback(async (
    targetRes = resolution,
    targetFps = frameRate,
    targetFacing = facingMode
  ) => {
    setPermissionError(null);

    // Stop existing stream if running
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }

    try {
      const spec = RESOLUTION_SPECS[targetRes];
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: targetFacing,
          width: { ideal: spec.width },
          height: { ideal: spec.height },
          frameRate: { ideal: targetFps },
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000,
        },
      });

      streamRef.current = stream;
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
        videoPreviewRef.current.play().catch(() => {});
      }
      setRecorderState('previewing');
    } catch (err: unknown) {
      console.warn('Camera/Mic permission denied or unavailable:', err);
      const msg =
        err instanceof Error && err.name === 'NotAllowedError'
          ? 'Camera and microphone access was not granted. Check browser permissions.'
          : 'Unable to start camera preview on this device.';
      setPermissionError(msg);
      setRecorderState('idle');
    }
  }, [resolution, frameRate, facingMode]);

  const changeResolution = useCallback((newRes: VideoResolution) => {
    setResolution(newRes);
    if (recorderState === 'previewing') {
      startPreview(newRes, frameRate, facingMode);
    }
  }, [recorderState, frameRate, facingMode, startPreview]);

  const changeFrameRate = useCallback((newFps: VideoFrameRate) => {
    setFrameRate(newFps);
    if (recorderState === 'previewing') {
      startPreview(resolution, newFps, facingMode);
    }
  }, [recorderState, resolution, facingMode, startPreview]);

  const toggleFacingMode = useCallback(() => {
    const nextFacing = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(nextFacing);
    if (recorderState === 'previewing') {
      startPreview(resolution, frameRate, nextFacing);
    }
  }, [recorderState, facingMode, resolution, frameRate, startPreview]);

  const startRecording = useCallback(() => {
    if (!streamRef.current) return;
    chunksRef.current = [];
    setDuration(0);
    accumulatedTimeRef.current = 0;

    const mimeType = getSupportedVideoMimeType();
    const bitrates = BITRATE_SPECS[qualityPreset];

    const options: MediaRecorderOptions = {
      ...(mimeType ? { mimeType } : {}),
      videoBitsPerSecond: bitrates.videoBitrate,
      audioBitsPerSecond: bitrates.audioBitrate,
    };

    let recorder: MediaRecorder;
    try {
      recorder = new MediaRecorder(streamRef.current, options);
    } catch {
      // Fallback if bitrate options aren't fully supported
      recorder = new MediaRecorder(
        streamRef.current,
        mimeType ? { mimeType } : undefined
      );
    }

    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        chunksRef.current.push(e.data);
      }
    };

    recorder.onstop = async () => {
      const finalBlob = new Blob(chunksRef.current, {
        type: mimeType || 'video/webm',
      });
      setVideoBlob(finalBlob);
      const url = URL.createObjectURL(finalBlob);
      setVideoUrl(url);

      // Generate thumbnail
      const thumb = await generateVideoThumbnail(finalBlob);
      setThumbnailUrl(thumb);

      setRecorderState('stopped');

      // Stop camera stream tracks
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };

    recorder.start(1000);
    mediaRecorderRef.current = recorder;
    setRecorderState('recording');
    startTimeRef.current = Date.now();

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => {
      const elapsed =
        accumulatedTimeRef.current + (Date.now() - startTimeRef.current);
      setDuration(Math.max(0, Math.floor(elapsed / 1000)));
    }, 250);
  }, [qualityPreset]);

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && recorderState === 'recording') {
      mediaRecorderRef.current.pause();
      setRecorderState('paused');
      if (timerRef.current) clearInterval(timerRef.current);
      accumulatedTimeRef.current += Date.now() - startTimeRef.current;
      setDuration(Math.max(0, Math.floor(accumulatedTimeRef.current / 1000)));
    }
  }, [recorderState]);

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && recorderState === 'paused') {
      mediaRecorderRef.current.resume();
      setRecorderState('recording');
      startTimeRef.current = Date.now();
      timerRef.current = window.setInterval(() => {
        const elapsed =
          accumulatedTimeRef.current + (Date.now() - startTimeRef.current);
        setDuration(Math.max(0, Math.floor(elapsed / 1000)));
      }, 250);
    }
  }, [recorderState]);

  const stopRecording = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (
      mediaRecorderRef.current &&
      (recorderState === 'recording' || recorderState === 'paused')
    ) {
      if (recorderState === 'recording') {
        accumulatedTimeRef.current += Date.now() - startTimeRef.current;
      }
      const finalSecs = Math.max(1, Math.round(accumulatedTimeRef.current / 1000));
      setDuration(finalSecs);
      mediaRecorderRef.current.stop();
    }
  }, [recorderState]);

  const cancelRecording = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (mediaRecorderRef.current && recorderState !== 'idle') {
      try {
        mediaRecorderRef.current.stop();
      } catch {
        // Ignore if already inactive
      }
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    setVideoBlob(null);
    setVideoUrl(null);
    setThumbnailUrl('');
    setDuration(0);
    accumulatedTimeRef.current = 0;
    setRecorderState('idle');
    chunksRef.current = [];
  }, [videoUrl, recorderState]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return {
    recorderState,
    duration,
    videoBlob,
    videoUrl,
    thumbnailUrl,
    permissionError,
    videoPreviewRef,
    // Quality & frame controls
    resolution,
    frameRate,
    qualityPreset,
    facingMode,
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
  };
}
