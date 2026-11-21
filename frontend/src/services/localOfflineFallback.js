/**
 * LinguaBridge AI - Local Offline Phrase & Dictionary Fallback
 * =============================================================
 * Module: frontend/src/services/localOfflineFallback.js
 * 
 * Provides bundled, deterministic English <-> Kannada and English <-> Hindi
 * offline translations. Requires zero network calls and runs instantly on device.
 */

const PHRASES = {
  // English -> Kannada
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
    'the government announced new educational policies for rural schools': 'ಗ್ರಾಮೀಣ ಶಾಲೆಗಳಿಗಾಗಿ ಸರ್ಕಾರವು ಹೊಸ ಶೈಕ್ಷಣಿಕ ನೀತಿಗಳನ್ನು ಪ್ರಕಟಿಸಿತು',
    'bengaluru is widely known as the silicon capital of india': 'ಬೆಂಗಳೂರನ್ನು ಭಾರತದಲ್ಲಿ ಸಿಲಿಕಾನ್ ರಾಜಧಾನಿ ಎಂದು ವ್ಯಾಪಕವಾಗಿ ಕರೆಯಲಾಗುತ್ತದೆ',
    'artificial intelligence is transforming regional language translation': 'ಕೃತಕ ಬುದ್ಧಿಮತ್ತೆ ಪ್ರಾದೇಶಿಕ ಭಾಷಾ ಅನುವಾದವನ್ನು ಪರಿವರ್ತಿಸುತ್ತಿದೆ',
    'healthcare centers in remote villages need reliable electric power': 'ದೂರದ ಹಳ್ಳಿಗಳಲ್ಲಿನ ಆರೋಗ್ಯ ಕೇಂದ್ರಗಳಿಗೆ ವಿಶ್ವಾಸಾರ್ಹ ವಿದ್ಯುತ್ ಸರಬರಾಜು ಅಗತ್ಯವಿದೆ',
    'higher education institutions must promote entrepreneurship and innovation': 'ಉನ್ನತ ಶಿಕ್ಷಣ ಸಂಸ್ಥೆಗಳು ಉದ್ಯಮಶೀಲತೆ ಮತ್ತು ನಾವೀನ್ಯತೆಯನ್ನು ಉತ್ತೇಜಿಸಬೇಕು',
  },

  // Kannada -> English
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
    'ಗ್ರಾಮೀಣ ಶಾಲೆಗಳಿಗಾಗಿ ಸರ್ಕಾರವು ಹೊಸ ಶೈಕ್ಷಣಿಕ ನೀತಿಗಳನ್ನು ಪ್ರಕಟಿಸಿತು': 'the government announced new educational policies for rural schools',
  },

  // English -> Hindi
  en_to_hi: {
    'hello': 'नमस्ते',
    'good morning': 'शुभ प्रभात',
    'good night': 'शुभ रात्रि',
    'goodbye': 'अलविदा',
    'thank you': 'धन्यवाद',
    'thanks': 'धन्यवाद',
    'please': 'कृपया',
    'sorry': 'क्षमा करें',
    'yes': 'हाँ',
    'no': 'नहीं',
    'how are you': 'आप कैसे हैं',
    'what is your name': 'आपका नाम क्या है',
    'my name is': 'मेरा नाम है',
    'i love you': 'मैं आपसे प्यार करता हूँ',
    'i am fine': 'मैं ठीक हूँ',
    'where are you': 'आप कहाँ हैं',
    'i need help': 'मुझे मदद चाहिए',
    'welcome': 'स्वागत है',
    'congratulations': 'बधाई हो',
    'please help me': 'कृपया मेरी मदद करें',
    'what is this': 'यह क्या है',
    'i do not understand': 'मुझे समझ नहीं आया',
    'can you help me': 'क्या आप मेरी मदद कर सकते हैं',
    'the government announced new educational policies for rural schools': 'सरकार ने ग्रामीण स्कूलों के लिए नई शैक्षिक नीतियों की घोषणा की',
    'bengaluru is widely known as the silicon capital of india': 'बेंगलुरु को भारत की सिलिकॉन राजधानी के रूप में व्यापक रूप से जाना जाता है',
    'artificial intelligence is transforming regional language translation': 'कृत्रिम बुद्धिमत्ता क्षेत्रीय भाषा अनुवाद को रूपांतरित कर रही है',
    'healthcare centers in remote villages need reliable electric power': 'दूरदराज के गांवों में स्वास्थ्य केंद्रों को विश्वसनीय बिजली की आवश्यकता है',
    'higher education institutions must promote entrepreneurship and innovation': 'उच्च शिक्षण संस्थानों को उद्यमिता और नवाचार को बढ़ावा देना चाहिए',
  },

  // Hindi -> English
  hi_to_en: {
    'नमस्ते': 'hello',
    'शुभ प्रभात': 'good morning',
    'शुभ रात्रि': 'good night',
    'अलविदा': 'goodbye',
    'धन्यवाद': 'thank you',
    'कृपया': 'please',
    'क्षमा करें': 'sorry',
    'हाँ': 'yes',
    'नहीं': 'no',
    'आप कैसे हैं': 'how are you',
    'आपका नाम क्या है': 'what is your name',
    'मेरा नाम है': 'my name is',
    'मैं ठीक हूँ': 'i am fine',
    'सरकार ने ग्रामीण स्कूलों के लिए नई शैक्षिक नीतियों की घोषणा की': 'the government announced new educational policies for rural schools',
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
    center: 'ಕೇಂದ್ರ', centers: 'ಕೇಂದ್ರಗಳು', need: 'ಅಗತ್ಯ', reliable: 'ವಿಶ್ವಾಸಾರ್ಹ',
    power: 'ವಿದ್ಯುತ್', artificial: 'ಕೃತಕ', intelligence: 'ಬುದ್ಧಿಮತ್ತೆ', language: 'ಭಾಷೆ',
    translation: 'ಅನುವಾದ', city: 'ನಗರ', road: 'ರಸ್ತೆ', today: 'ಇಂದು', tomorrow: 'ನಾಳೆ',
  },
  kn_to_en: {
    'ನಮಸ್ಕಾರ': 'hello', 'ಧನ್ಯವಾದ': 'thank you', 'ನಾನು': 'i', 'ನೀವು': 'you',
    'ನಾವು': 'we', 'ಇದು': 'this', 'ಅದು': 'that', 'ಮನೆ': 'home',
    'ನೀರು': 'water', 'ಆಹಾರ': 'food', 'ಶಾಲೆ': 'school', 'ಸರ್ಕಾರ': 'government',
    'ನಗರ': 'city', 'ರಸ್ತೆ': 'road', 'ದಿನ': 'day', 'ಇಂದು': 'today',
  },
  en_to_hi: {
    the: 'यह', a: 'एक', an: 'एक', and: 'और', or: 'या', with: 'साथ',
    for: 'के लिए', from: 'से', to: 'को', in: 'में', of: 'का', is: 'है', are: 'हैं',
    was: 'था', this: 'यह', that: 'वह', we: 'हम', you: 'आप', i: 'मैं', he: 'वह',
    she: 'वह', they: 'वे', my: 'मेरा', your: 'आपका', name: 'नाम', water: 'पानी',
    food: 'भोजन', home: 'घर', house: 'घर', school: 'स्कूल', education: 'शिक्षा',
    government: 'सरकार', new: 'नई', rural: 'ग्रामीण', village: 'गाँव',
    need: 'आवश्यकता', artificial: 'कृत्रिम', intelligence: 'बुद्धिमत्ता',
    language: 'भाषा', translation: 'अनुवाद', city: 'शहर', today: 'आज',
  },
  hi_to_en: {
    'नमस्ते': 'hello', 'धन्यवाद': 'thank you', 'मैं': 'i', 'आप': 'you',
    'हम': 'we', 'यह': 'this', 'वह': 'that', 'घर': 'home',
    'पानी': 'water', 'भोजन': 'food', 'स्कूल': 'school', 'सरकार': 'government',
    'शहर': 'city', 'आज': 'today',
  },
};

function normalize(text) {
  return String(text || '')
    .trim()
    .replace(/[^\p{L}\p{N}\s]/gu, '')
    .replace(/\s+/g, ' ')
    .toLowerCase();
}

/**
 * Resolves the translation direction key ('en_to_kn', 'kn_to_en', 'en_to_hi', 'hi_to_en')
 */
function getDirectionKey(sourceLang, targetLang) {
  const s = String(sourceLang).toLowerCase();
  const t = String(targetLang).toLowerCase();

  const isEn = s.startsWith('eng') || s === 'en';
  const isKn = s.startsWith('kan') || s === 'kn';
  const isHi = s.startsWith('hin') || s === 'hi';

  const tIsEn = t.startsWith('eng') || t === 'en';
  const tIsKn = t.startsWith('kan') || t === 'kn';
  const tIsHi = t.startsWith('hin') || t === 'hi';

  if (isEn && tIsKn) return 'en_to_kn';
  if (isKn && tIsEn) return 'kn_to_en';
  if (isEn && tIsHi) return 'en_to_hi';
  if (isHi && tIsEn) return 'hi_to_en';

  if (tIsKn) return 'en_to_kn';
  if (tIsHi) return 'en_to_hi';
  return 'en_to_kn';
}

/**
 * Executes local phrase and word replacement for offline fallback without network.
 */
export function translateLocally(text, sourceLang, targetLang = 'kan_Knda') {
  const direction = getDirectionKey(sourceLang, targetLang);
  const normalized = normalize(text);
  const phrases = PHRASES[direction] || {};
  const words = WORDS[direction] || {};

  // Exact phrase match
  if (phrases[normalized]) {
    return {
      translatedText: phrases[normalized],
      matchedType: 'phrase',
    };
  }

  // Token replacement
  const rawTokens = String(text || '').trim().split(/(\s+)/);
  let matchedCount = 0;
  const translatedTokens = rawTokens.map((token) => {
    if (/^\s+$/.test(token)) return token;
    const cleanToken = normalize(token);
    if (words[cleanToken]) {
      matchedCount += 1;
      return words[cleanToken];
    }
    return token;
  });

  const translatedText = translatedTokens.join('');
  return {
    translatedText,
    matchedType: matchedCount > 0 ? 'token_replacement' : 'verbatim',
  };
}
