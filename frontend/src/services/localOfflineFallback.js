/**
 * Curated, bundled English-Kannada offline fallback.
 * It makes no network requests and is used only when native ML Kit cannot translate.
 */

const PHRASES = {
  en_to_kn: {
    'hello': 'ನಮಸ್ಕಾರ',
    'good morning': 'ಶುಭೋದಯ',
    'good night': 'ಶುಭ ರಾತ್ರಿ',
    'goodbye': 'ವಿದಾಯ',
    'thank you': 'ಧನ್ಯವಾದ',
    'thanks': 'ಧನ್ಯವಾದ',
    'please': 'ದಯವಿಟ್ಟು',
    'sorry': 'ಕ್ಷಮಿಸಿ',
    'yes': 'ಹೌದು',
    'no': 'ಇಲ್ಲ',
    'how are you': 'ನೀವು ಹೇಗಿದ್ದೀರಿ',
    'what is your name': 'ನಿಮ್ಮ ಹೆಸರೇನು',
    'my name is': 'ನನ್ನ ಹೆಸರು',
    'i love you': 'ನಾನು ನಿನ್ನನ್ನು ಪ್ರೀತಿಸುತ್ತೇನೆ',
    'i am fine': 'ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ',
    'where are you': 'ನೀವು ಎಲ್ಲಿ ಇದ್ದೀರಿ',
    'i need help': 'ನನಗೆ ಸಹಾಯ ಬೇಕು',
    'welcome': 'ಸುಸ್ವಾಗತ',
    'congratulations': 'ಅಭಿನಂದನೆಗಳು',
    'please help me': 'ದಯವಿಟ್ಟು ನನಗೆ ಸಹಾಯ ಮಾಡಿ',
    'what is this': 'ಇದು ಏನು',
    'i do not understand': 'ನನಗೆ ಅರ್ಥವಾಗಲಿಲ್ಲ',
    'can you help me': 'ನೀವು ನನಗೆ ಸಹಾಯ ಮಾಡಬಹುದೇ',
    'bengaluru is widely known as the silicon capital of india': 'ಬೆಂಗಳೂರನ್ನು ಭಾರತದಲ್ಲಿ ಸಿಲಿಕಾನ್ ರಾಜಧಾನಿ ಎಂದು ವ್ಯಾಪಕವಾಗಿ ಕರೆಯಲಾಗುತ್ತದೆ',
    'artificial intelligence is transforming regional language translation': 'ಕೃತಕ ಬುದ್ಧಿಮತ್ತೆ ಪ್ರಾದೇಶಿಕ ಭಾಷಾ ಅನುವಾದವನ್ನು ಪರಿವರ್ತಿಸುತ್ತಿದೆ',
  },
  kn_to_en: {
    'ನಮಸ್ಕಾರ': 'hello',
    'ಶುಭೋದಯ': 'good morning',
    'ಶುಭ ರಾತ್ರಿ': 'good night',
    'ವಿದಾಯ': 'goodbye',
    'ಧನ್ಯವಾದ': 'thank you',
    'ದಯವಿಟ್ಟು': 'please',
    'ಕ್ಷಮಿಸಿ': 'sorry',
    'ಹೌದು': 'yes',
    'ಇಲ್ಲ': 'no',
    'ನೀವು ಹೇಗಿದ್ದೀರಿ': 'how are you',
    'ನಿಮ್ಮ ಹೆಸರೇನು': 'what is your name',
    'ನನ್ನ ಹೆಸರು': 'my name is',
    'ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ': 'i am fine',
    'ನಾನು ನಿನ್ನನ್ನು ಪ್ರೀತಿಸುತ್ತೇನೆ': 'i love you',
  },
};

const WORDS = {
  en_to_kn: {
    the: 'ಅದು', a: 'ಒಂದು', an: 'ಒಂದು', and: 'ಮತ್ತು', or: 'ಅಥವಾ', with: 'ಜೊತೆಗೆ',
    for: 'ಗಾಗಿ', from: 'ಇಂದ', to: 'ಗೆ', in: 'ನಲ್ಲಿ', of: 'ನ', is: 'ಇದೆ', are: 'ಇವೆ',
    was: 'ಇತ್ತು', be: 'ಆಗು', have: 'ಹಿಡಿ', this: 'ಇದು', that: 'ಅದು', we: 'ನಾವು',
    you: 'ನೀವು', i: 'ನಾನು', he: 'ಅವರು', she: 'ಅವರು', they: 'ಅವರು', my: 'ನನ್ನ',
    your: 'ನಿಮ್ಮ', name: 'ಹೆಸರು', water: 'ನೀರು', food: 'ಆಹಾರ', home: 'ಮನೆ',
    house: 'ಮನೆ', school: 'ಶಾಲೆ', education: 'ಶಿಕ್ಷಣ', government: 'ಸರ್ಕಾರ',
    new: 'ಹೊಸ', rural: 'ಗ್ರಾಮೀಣ', village: 'ಹಳ್ಳಿ', healthcare: 'ಆರೋಗ್ಯಸೇವೆ',
    center: 'ಕೇಂದ್ರ', centers: 'ಕೇಂದ್ರಗಳು', remote: 'ದೂರಸ್ಥ', need: 'ಅಗತ್ಯ',
    reliable: 'ವಿಶ್ವಾಸಾರ್ಹ', electric: 'ವಿದ್ಯುತ್', power: 'ವಿದ್ಯುತ್',
    higher: 'ಉನ್ನತ', institutions: 'संಸ್ಥೆಗಳು', must: 'ಅವಶ್ಯ',
    promote: 'ಪ್ರೋತ್ಸಾಹಿಸು', entrepreneurship: 'ಉದ್ಯಮೋತ್ಸಾಹ', innovation: 'ನವೀನತೆ',
    artificial: 'ಕೃತಕ', intelligence: 'ಬುದ್ಧಿಮತ್ತೆ', transforming: 'ಪರಿವರ್ತಿಸುತ್ತಿದೆ',
    regional: 'ಪ್ರಾದೇಶಿಕ', language: 'ಭಾಷೆ', translation: 'ಅನುವಾದ',
    bengaluru: 'ಬೆಂಗಳೂರು', india: 'ಭಾರತ', silicon: 'ಸಿಲಿಕಾನ್', capital: 'ರಾಜಧಾನಿ',
    known: 'ಕರೆಯಲಾಗುತ್ತದೆ', police: 'ಪೊಲೀಸ್', hospital: 'ಆಸ್ಪತ್ರೆ', doctor: 'ವೈದ್ಯ',
    bus: 'ಬಸ್', train: 'ರೈಲು', car: 'ಕಾರು', road: 'ರಸ್ತೆ', city: 'ನಗರ',
    good: 'ಒಳ್ಳೆಯ', today: 'ಇಂದು', tomorrow: 'ನಾಳೆ', yesterday: 'ನಿನ್ನೆ',
    time: 'ಸಮಯ', day: 'ದಿನ', week: 'ವಾರ', month: 'ತಿಂಗಳು', year: 'ವರ್ಷ',
  },
  kn_to_en: {
    'ನಮಸ್ಕಾರ': 'hello', 'ಧನ್ಯವಾದ': 'thank you', 'ನಾನು': 'i', 'ನೀವು': 'you',
    'ನಾವು': 'we', 'ಇದು': 'this', 'ಅದು': 'that', 'ಮನೆ': 'home',
    'ನೀರು': 'water', 'ಆಹಾರ': 'food', 'ಶಾಲೆ': 'school', 'ಸರ್ಕಾರ': 'government',
    'ನಗರ': 'city', 'ರಸ್ತೆ': 'road', 'ದಿನ': 'day', 'ಇಂದು': 'today',
  },
};

function normalize(text) {
  return String(text || '')
    .trim()
    .replace(/[^\p{L}\p{N}\s]/gu, '')
    .replace(/\s+/g, ' ')
    .toLowerCase();
}

/** Tokenizes locally and replaces known phrases and words. Never contacts a server. */
export function translateLocally(text, sourceLang) {
  const direction = String(sourceLang).startsWith('eng') || String(sourceLang) === 'en'
    ? 'en_to_kn'
    : 'kn_to_en';
  const normalized = normalize(text);
  const phrases = PHRASES[direction];
  const words = WORDS[direction];

  if (phrases[normalized]) {
    return {
      translatedText: phrases[normalized],
      matchedWords: 1,
      isExactMatch: true,
    };
  }

  const tokens = String(text).trim().split(/(\s+|[,.!?;:])/u);
  let matchedWords = 0;
  const translated = tokens.map((token) => {
    if (/^\s+$/.test(token) || /^[,.!?;:]$/.test(token)) return token;
    const key = normalize(token);
    if (words[key]) {
      matchedWords += 1;
      return words[key];
    }
    return token;
  }).join('');

  return {
    translatedText: matchedWords === 0
      ? `${translated.trim()} [local fallback: unmapped text]`
      : translated,
    matchedWords,
    isExactMatch: false,
  };
}
