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
  const [language, setLanguage] = useState('en-US');

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const isExplicitlyStopped = useRef(false);
  const baseTranscriptRef = useRef('');
  const currentSessionFinalRef = useRef('');

  useEffect(() => {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRec) {
      setIsSupported(true);
      try {
        const instance = new SpeechRec();
        instance.continuous = true;
        instance.interimResults = true;
        instance.lang = language;
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
  }, [language]);

  const startTranscribing = useCallback((initialText = '') => {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) {
      setError('Live speech-to-text is not supported in this browser. You can still type notes.');
      return;
    }

    let recognition = recognitionRef.current;
    if (!recognition) {
      try {
        recognition = new SpeechRec();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = language;
        recognitionRef.current = recognition;
      } catch {
        setError('Could not initialize speech recognition.');
        return;
      }
    }

    isExplicitlyStopped.current = false;
    setError(null);
    baseTranscriptRef.current = initialText;
    currentSessionFinalRef.current = '';
    setTranscript(initialText);
    setInterimTranscript('');

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let sessionFinal = '';
      let interimStr = '';

      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          sessionFinal += result[0].transcript + ' ';
        } else {
          interimStr += result[0].transcript;
        }
      }

      currentSessionFinalRef.current = sessionFinal;
      const combined = [baseTranscriptRef.current, sessionFinal].filter(Boolean).join(' ').trim();
      setTranscript(combined);
      setInterimTranscript(interimStr);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error !== 'no-speech') {
        console.warn('Speech recognition warning/error:', event.error);
        if (event.error === 'not-allowed') {
          setError('Microphone permission required for speech transcription.');
        }
      }
    };

    recognition.onend = () => {
      // If recognition ended automatically due to pause but user has not explicitly stopped
      if (!isExplicitlyStopped.current) {
        // Roll current session text into base transcript
        if (currentSessionFinalRef.current) {
          baseTranscriptRef.current = [baseTranscriptRef.current, currentSessionFinalRef.current]
            .filter(Boolean)
            .join(' ')
            .trim();
          currentSessionFinalRef.current = '';
        }
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
      // Already running or failed
      setIsTranscribing(false);
    }
  }, [language]);

  const stopTranscribing = useCallback(() => {
    isExplicitlyStopped.current = true;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Ignore
      }
    }
    setIsTranscribing(false);
    setInterimTranscript('');
  }, []);

  const resetTranscript = useCallback(() => {
    baseTranscriptRef.current = '';
    currentSessionFinalRef.current = '';
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
    language,
    setLanguage,
    startTranscribing,
    stopTranscribing,
    resetTranscript,
    setTranscript,
  };
}
