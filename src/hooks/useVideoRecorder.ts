import { useState, useRef, useCallback, useEffect } from 'react';
import {
  getSupportedVideoMimeType,
  generateVideoThumbnail,
} from '../services/media/mediaUtils';

export type VideoRecorderState = 'idle' | 'previewing' | 'recording' | 'paused' | 'stopped';

export function useVideoRecorder() {
  const [recorderState, setRecorderState] = useState<VideoRecorderState>('idle');
  const [duration, setDuration] = useState(0);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string>('');
  const [permissionError, setPermissionError] = useState<string | null>(null);

  const videoPreviewRef = useRef<HTMLVideoElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  const startPreview = useCallback(async () => {
    setPermissionError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
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
  }, []);

  const startRecording = useCallback(() => {
    if (!streamRef.current) return;
    chunksRef.current = [];
    setDuration(0);

    const mimeType = getSupportedVideoMimeType();
    const recorder = new MediaRecorder(
      streamRef.current,
      mimeType ? { mimeType } : undefined
    );

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

    timerRef.current = window.setInterval(() => {
      setDuration((prev) => prev + 1);
    }, 1000);
  }, []);

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && recorderState === 'recording') {
      mediaRecorderRef.current.pause();
      setRecorderState('paused');
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [recorderState]);

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && recorderState === 'paused') {
      mediaRecorderRef.current.resume();
      setRecorderState('recording');
      timerRef.current = window.setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    }
  }, [recorderState]);

  const stopRecording = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (
      mediaRecorderRef.current &&
      (recorderState === 'recording' || recorderState === 'paused')
    ) {
      mediaRecorderRef.current.stop();
    }
  }, [recorderState]);

  const cancelRecording = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (mediaRecorderRef.current && recorderState !== 'idle') {
      mediaRecorderRef.current.stop();
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
    startPreview,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    cancelRecording,
  };
}
