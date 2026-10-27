import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, AlertCircle } from 'lucide-react';

interface VoiceRecorderProps {
  onTranscript: (text: string) => void;
  className?: string;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onTranscript, className = '' }) => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check Web Speech API support
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        }
      }
      if (finalTranscript.trim()) {
        onTranscript(finalTranscript.trim());
      }
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
    };
  }, [onTranscript]);

  const toggleListening = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isSupported) {
      alert('Speech recognition is not supported in this browser. Please type your idea directly.');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch {
        setIsListening(false);
      }
    }
  };

  return (
    <button
      type="button"
      onClick={toggleListening}
      title={isListening ? 'Stop voice recording' : 'Dictate idea via voice'}
      className={`relative p-2 rounded-full transition-all flex items-center justify-center ${
        isListening
          ? 'bg-cosmic-coral text-white shadow-glow-coral animate-pulse'
          : 'text-ivory-300 hover:text-ivory-100 hover:bg-midnight-700'
      } ${className}`}
    >
      {isListening ? (
        <>
          <Mic className="w-4 h-4" />
          <span className="absolute -top-1 -right-1 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cosmic-coral opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cosmic-coral"></span>
          </span>
        </>
      ) : (
        <Mic className="w-4 h-4" />
      )}
    </button>
  );
};
