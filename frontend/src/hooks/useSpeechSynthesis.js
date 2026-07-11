import { useCallback, useEffect, useState } from 'react';
import { loadVoices } from '../utils/voices';

const isBrowserSupported = () =>
  typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;

let activeId = null;
let activeUtterance = null;
const subscribers = new Set();

const notify = (nextId) => {
  subscribers.forEach((fn) => fn(nextId));
};

const stopActive = () => {
  if (activeUtterance) {
    activeUtterance.onend = null;
    activeUtterance.onerror = null;
    activeUtterance.onpause = null;
    activeUtterance = null;
  }
  if (isBrowserSupported()) {
    window.speechSynthesis.cancel();
  }
  activeId = null;
  notify(null);
};

export function useSpeechSynthesis() {
  const isSupported = isBrowserSupported();
  const [currentId, setCurrentId] = useState(activeId);

  useEffect(() => {
    const subscriber = (nextId) => setCurrentId(nextId);
    subscribers.add(subscriber);
    if (isSupported) {
      loadVoices();
    }
    return () => {
      subscribers.delete(subscriber);
      if (subscribers.size === 0 && activeId !== null && isSupported) {
        Promise.resolve().then(() => {
          if (subscribers.size === 0 && activeId !== null) {
            stopActive();
          }
        });
      }
    };
  }, [isSupported]);

  const speak = useCallback(
    (id, text, options = {}) => {
      if (!isSupported || !id || !text) return;

      stopActive();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = options.lang || 'en-US';
      utterance.rate = options.rate ?? 1;
      utterance.pitch = options.pitch ?? 1;

      if (options.voice) {
        utterance.voice = options.voice;
      }

      const clearActive = () => {
        if (activeId === id) {
          activeId = null;
          activeUtterance = null;
          notify(null);
        }
      };

      utterance.onend = clearActive;
      utterance.onerror = clearActive;

      activeId = id;
      activeUtterance = utterance;
      notify(id);
      window.speechSynthesis.speak(utterance);
    },
    [isSupported]
  );

  const stop = useCallback(() => {
    if (!isSupported) return;
    stopActive();
  }, [isSupported]);

  const isPlaying = useCallback((id) => currentId === id, [currentId]);

  return { isSupported, isPlaying, speak, stop, activeId: currentId };
}