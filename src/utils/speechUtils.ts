import { useState, useEffect, useRef, useCallback } from 'react';

export function pickHindiOrIndianVoice(): SpeechSynthesisVoice | undefined {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return undefined;
  const voices = window.speechSynthesis.getVoices();
  return (
    voices.find((v) => v.lang.includes('hi-IN') || v.lang.includes('hi')) ||
    voices.find((v) => v.lang.includes('en-IN'))
  );
}

export function speakOneShot(text: string, rate = 0.95): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  const voice = pickHindiOrIndianVoice();
  if (voice) utterance.voice = voice;
  utterance.lang = 'hi-IN';
  utterance.rate = rate;
  utterance.pitch = 0.95;
  window.speechSynthesis.speak(utterance);
}

export function useSpeechSynthesis(initialRate = 0.95) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [activeId, setActiveId] = useState<string | number | null>(null);
  const [rate, setRate] = useState(initialRate);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const stop = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setIsPaused(false);
    setActiveId(null);
  }, []);

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const speak = useCallback(
    (text: string, id: string | number = 'default', customRate?: number) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

      // Toggle pause/resume if same item is already active
      if (activeId === id && isSpeaking) {
        if (isPaused) {
          window.speechSynthesis.resume();
          setIsPaused(false);
        } else {
          window.speechSynthesis.pause();
          setIsPaused(true);
        }
        return;
      }

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const voice = pickHindiOrIndianVoice();
      if (voice) utterance.voice = voice;
      utterance.lang = 'hi-IN';
      utterance.rate = customRate ?? rate;
      utterance.pitch = 0.95;

      utterance.onstart = () => {
        setIsSpeaking(true);
        setIsPaused(false);
        setActiveId(id);
      };
      utterance.onend = () => {
        setIsSpeaking(false);
        setIsPaused(false);
        setActiveId(null);
      };
      utterance.onerror = () => {
        setIsSpeaking(false);
        setIsPaused(false);
        setActiveId(null);
      };

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    },
    [activeId, isSpeaking, isPaused, rate]
  );

  return {
    isSpeaking,
    isPaused,
    activeId,
    rate,
    setRate,
    speak,
    stop,
  };
}
