import React, { useEffect, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { useSpeechSynthesis } from '../../hooks/useSpeechSynthesis';
import { loadVoices, pickFemaleVoice } from '../../utils/voices';

const MessageSpeaker = ({ id, text, className = '' }) => {
  const { isSupported, isPlaying, speak, stop } = useSpeechSynthesis();
  const playing = isSupported && Boolean(id) && isPlaying(id);
  const [voice, setVoice] = useState(null);

  useEffect(() => {
    if (!isSupported) return undefined;
    let mounted = true;
    loadVoices().then(() => {
      if (!mounted) return;
      setVoice(pickFemaleVoice('en-US'));
    });
    return () => {
      mounted = false;
    };
  }, [isSupported]);

  const handleClick = () => {
    if (!isSupported || !id || !text) return;
    if (playing) {
      stop();
    } else {
      speak(id, text, { lang: 'en-US', voice });
    }
  };

  return (
    <button
      type="button"
      className={`speaker-btn speaker-btn--inline ${playing ? 'is-active' : ''} ${!isSupported ? 'is-disabled' : ''} ${className}`.trim()}
      onClick={handleClick}
      aria-label={playing ? 'Stop reading message aloud' : 'Read message aloud'}
      aria-pressed={playing}
      disabled={!isSupported}
      title={
        !isSupported
          ? 'Text-to-speech is not supported in this browser'
          : playing
            ? 'Stop'
            : 'Play message'
      }
    >
      <span className="speaker-icon-wrap" aria-hidden="true">
        {isSupported ? <Volume2 size={16} /> : <VolumeX size={16} />}
      </span>
    </button>
  );
};

export default MessageSpeaker;