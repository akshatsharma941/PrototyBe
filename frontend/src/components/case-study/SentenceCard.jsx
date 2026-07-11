import React, { useEffect, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { useSpeechSynthesis } from '../../hooks/useSpeechSynthesis';
import { loadVoices, pickFemaleVoice } from '../../utils/voices';

const SentenceCard = ({ sentence }) => {
  const { isSupported, isPlaying, speak, stop } = useSpeechSynthesis();
  const playing = isSupported && isPlaying(sentence.id);
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

  const handleToggle = () => {
    if (!isSupported) return;
    if (playing) {
      stop();
    } else {
      speak(sentence.id, sentence.text, { lang: 'en-US', voice });
    }
  };

  return (
    <div className={`sentence-card glass-panel ${playing ? 'is-playing' : ''}`}>
      <div className="sentence-card-body">
        {sentence.context && (
          <span className="sentence-card-tag">{sentence.context}</span>
        )}
        <p className="sentence-card-text">{sentence.text}</p>
      </div>

      <button
        type="button"
        className={`speaker-btn ${playing ? 'is-active' : ''} ${!isSupported ? 'is-disabled' : ''}`}
        onClick={handleToggle}
        aria-label={playing ? `Stop reading sentence: ${sentence.text}` : `Read sentence aloud: ${sentence.text}`}
        aria-pressed={playing}
        disabled={!isSupported}
        title={
          !isSupported
            ? 'Text-to-speech is not supported in this browser'
            : playing
              ? 'Stop'
              : 'Play'
        }
      >
        <span className="speaker-icon-wrap">
          {isSupported ? (
            <Volume2 size={20} aria-hidden="true" />
          ) : (
            <VolumeX size={20} aria-hidden="true" />
          )}
        </span>
      </button>
    </div>
  );
};

export default SentenceCard;