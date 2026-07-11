let voicesCache = null;
let loadingPromise = null;

const isSpeechAvailable = () =>
  typeof window !== 'undefined' &&
  'speechSynthesis' in window &&
  'SpeechSynthesisUtterance' in window;

export function loadVoices() {
  if (!isSpeechAvailable()) {
    return Promise.resolve([]);
  }

  const synth = window.speechSynthesis;
  const initial = synth.getVoices();
  if (initial && initial.length > 0) {
    voicesCache = initial;
    return Promise.resolve(initial);
  }

  if (loadingPromise) return loadingPromise;

  loadingPromise = new Promise((resolve) => {
    const handler = () => {
      const voices = synth.getVoices();
      if (voices && voices.length > 0) {
        voicesCache = voices;
        synth.removeEventListener('voiceschanged', handler);
        loadingPromise = null;
        resolve(voices);
      }
    };
    synth.addEventListener('voiceschanged', handler);
    setTimeout(() => {
      if (!loadingPromise) return;
      synth.removeEventListener('voiceschanged', handler);
      loadingPromise = null;
      resolve(synth.getVoices() || []);
    }, 2000);
  });

  return loadingPromise;
}

const FEMALE_NAME_HINTS = [
  'female',
  'samantha', 'zira', 'karen', 'moira', 'tessa', 'victoria',
  'aria', 'jenny', 'fiona', 'susan', 'allison', 'nicky',
  'libby', 'kate', 'maria', 'eva', 'olivia', 'emma',
  'yuki', 'kyoko', 'mei', 'ava', 'serena', 'milena', 'paulina',
  'helena', 'celine', 'audrey', 'nora', 'renee', 'linda',
  'sofia', 'google us english', 'google uk english female'
];

function buildVoicePool(voices, lang) {
  const langCode = (lang || 'en-US').toLowerCase();
  const langPrefix = langCode.split('-')[0];

  const exact = voices.filter((v) => v.lang && v.lang.toLowerCase() === langCode);
  if (exact.length > 0) return exact;

  const prefix = voices.filter((v) => v.lang && v.lang.toLowerCase().startsWith(langPrefix + '-'));
  if (prefix.length > 0) return prefix;

  return voices;
}

export function pickFemaleVoice(lang = 'en-US') {
  if (!voicesCache || voicesCache.length === 0) return null;

  const pool = buildVoicePool(voicesCache, lang);

  const female = pool.find((v) => {
    const name = (v.name || '').toLowerCase();
    if (!name) return false;
    return name.includes('female') || FEMALE_NAME_HINTS.some((hint) => name.includes(hint));
  });

  return female || pool[0] || null;
}

export function getVoicesSnapshot() {
  return voicesCache ? [...voicesCache] : [];
}