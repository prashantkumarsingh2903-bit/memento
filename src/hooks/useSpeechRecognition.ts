import { useState, useEffect, useRef, useCallback } from 'react';

// Web Speech API interface declarations
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
  }
}

export function useSpeechRecognition() {
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const isExplicitlyStopped = useRef(false);

  useEffect(() => {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRec) {
      setIsSupported(true);
      try {
        const instance = new SpeechRec();
        instance.continuous = true;
        instance.interimResults = true;
        instance.lang = 'en-US';
        recognitionRef.current = instance;
      } catch (e) {
        console.warn('SpeechRecognition initialization error:', e);
        setIsSupported(false);
      }
    } else {
      setIsSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const startTranscribing = useCallback(() => {
    const recognition = recognitionRef.current;
    if (!recognition) {
      setError('Speech recognition is not supported on this device/browser.');
      return;
    }

    isExplicitlyStopped.current = false;
    setError(null);
    setTranscript('');
    setInterimTranscript('');

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalStr = '';
      let interimStr = '';

      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalStr += result[0].transcript + ' ';
        } else {
          interimStr += result[0].transcript;
        }
      }

      if (finalStr) {
        setTranscript((prev) => (prev ? `${prev} ${finalStr}`.trim() : finalStr.trim()));
      }
      setInterimTranscript(interimStr);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error !== 'no-speech') {
        setError(`Transcription note: ${event.error}`);
      }
    };

    recognition.onend = () => {
      // Auto restart if still recording and not explicitly stopped
      if (!isExplicitlyStopped.current && isTranscribing) {
        try {
          recognition.start();
        } catch {
          setIsTranscribing(false);
        }
      } else {
        setIsTranscribing(false);
      }
    };

    try {
      recognition.start();
      setIsTranscribing(true);
    } catch {
      setIsTranscribing(false);
    }
  }, [isTranscribing]);

  const stopTranscribing = useCallback(() => {
    isExplicitlyStopped.current = true;
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsTranscribing(false);
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
    setError(null);
  }, []);

  return {
    isTranscribing,
    transcript,
    interimTranscript,
    isSupported,
    error,
    startTranscribing,
    stopTranscribing,
    resetTranscript,
    setTranscript,
  };
}
