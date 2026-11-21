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

  // English -> Tamil
  en_to_ta: {
    'hello': 'வணக்கம்',
    'good morning': 'காலை வணக்கம்',
    'good night': 'இனிய இரவு',
    'goodbye': 'சென்று வருகிறேன்',
    'thank you': 'நன்றி',
    'thanks': 'நன்றி',
    'please': 'தயவுசெய்து',
    'sorry': 'மன்னிக்கவும்',
    'yes': 'ஆம்',
    'no': 'இல்லை',
    'how are you': 'நீங்கள் எப்படி இருக்கிறீர்கள்',
    'what is your name': 'உங்கள் பெயர் என்ன',
    'my name is': 'என் பெயர்',
    'i love you': 'நான் உன்னை காதலிக்கிறேன்',
    'i am fine': 'நான் நன்றாக இருக்கிறேன்',
    'where are you': 'நீங்கள் எங்கே இருக்கிறீர்கள்',
    'i need help': 'எனக்கு உதவி தேவை',
    'welcome': 'நல்வரவு',
    'congratulations': 'வாழ்த்துகள்',
    'please help me': 'தயவுசெய்து எனக்கு உதவுங்கள்',
    'what is this': 'இது என்ன',
    'i do not understand': 'எனக்கு புரியவில்லை',
    'can you help me': 'நீங்கள் எனக்கு உதவ முடியுமா',
    'the government announced new educational policies for rural schools': 'கிராமப்புற பள்ளிகளுக்கான புதிய கல்விக் கொள்கைகளை அரசு அறிவித்தது',
    'bengaluru is widely known as the silicon capital of india': 'பெங்களூரு இந்தியாவின் சிலிக்கான் தலைநகரம் என்று பரவலாக அறியப்படுகிறது',
    'artificial intelligence is transforming regional language translation': 'செயற்கை நுண்ணறிவு பிராந்திய மொழி மொழிபெயர்ப்பை மாற்றியமைக்கிறது',
    'healthcare centers in remote villages need reliable electric power': 'தொலைதூர கிராமங்களில் உள்ள சுகாதார மையங்களுக்கு நம்பகமான மின்சாரம் தேவைப்படுகிறது',
    'higher education institutions must promote entrepreneurship and innovation': 'உயர் கல்வி நிறுவனங்கள் தொழில் முனைவோர் மற்றும் புதுமைகளை ஊக்குவிக்க வேண்டும்',
  },

  // Tamil -> English
  ta_to_en: {
    'வணக்கம்': 'hello',
    'காலை வணக்கம்': 'good morning',
    'இனிய இரவு': 'good night',
    'சென்று வருகிறேன்': 'goodbye',
    'நன்றி': 'thank you',
    'தயவுசெய்து': 'please',
    'மன்னிக்கவும்': 'sorry',
    'ஆம்': 'yes',
    'இல்லை': 'no',
    'நீங்கள் எப்படி இருக்கிறீர்கள்': 'how are you',
    'உங்கள் பெயர் என்ன': 'what is your name',
    'என் பெயர்': 'my name is',
    'நான் நன்றாக இருக்கிறேன்': 'i am fine',
    'கிராமப்புற பள்ளிகளுக்கான புதிய கல்விக் கொள்கைகளை அரசு அறிவித்தது': 'the government announced new educational policies for rural schools',
  },

  // English -> Telugu
  en_to_te: {
    'hello': 'హలో',
    'good morning': 'శుభోదయం',
    'good night': 'శుభ రాత్రి',
    'goodbye': 'వీడ్కోలు',
    'thank you': 'ధన్యవాదాలు',
    'thanks': 'ధన్యవాదాలు',
    'please': 'దయచేసి',
    'sorry': 'క్షమించండి',
    'yes': 'అవును',
    'no': 'కాదు',
    'how are you': 'మీరు ఎలా ఉన్నారు',
    'what is your name': 'మీ పేరు ఏమిటి',
    'my name is': 'నా పేరు',
    'i love you': 'నేను నిన్ను ప్రేమిస్తున్నాను',
    'i am fine': 'నేను బాగున్నాను',
    'where are you': 'మీరు ఎక్కడ ఉన్నారు',
    'i need help': 'నాకు సహాయం కావాలి',
    'welcome': 'స్వాగతం',
    'congratulations': 'అభినందనలు',
    'please help me': 'దయచేసి నాకు సహాయం చేయండి',
    'what is this': 'ఇది ఏమిటి',
    'i do not understand': 'నాకు అర్థం కాలేదు',
    'can you help me': 'మీరు నాకు సహాయం చేయగలరా',
    'the government announced new educational policies for rural schools': 'గ్రామీణ పాఠశాలల కోసం ప్రభుత్వం కొత్త విద్యా విధానాలను ప్రకటించింది',
    'bengaluru is widely known as the silicon capital of india': 'బెంగళూరు భారతదేశ సిలికాన్ రాజధానిగా విస్తృతంగా ప్రసిద్ధి చెందింది',
    'artificial intelligence is transforming regional language translation': 'కృత్రిమ మేధస్సు ప్రాంతీయ భాషా అనువాదాన్ని మారుస్తోంది',
    'healthcare centers in remote villages need reliable electric power': 'మారుమూల గ్రామాలలోని ఆరోగ్య కేంద్రాలకు విశ్వసనీయ విద్యుత్ సరఫరా అవసరం',
    'higher education institutions must promote entrepreneurship and innovation': 'ఉన్నత విద్యా సంస్థలు వ్యవస్థాపకత మరియు ఆవిష్కరణలను ప్రోత్సహించాలి',
  },

  // Telugu -> English
  te_to_en: {
    'హలో': 'hello',
    'శుభోదయం': 'good morning',
    'శుభ రాత్రి': 'good night',
    'వీడ్కోలు': 'goodbye',
    'ధన్యవాదాలు': 'thank you',
    'దయచేసి': 'please',
    'క్షమించండి': 'sorry',
    'అవును': 'yes',
    'కాదు': 'no',
    'మీరు ఎలా ఉన్నారు': 'how are you',
    'మీ పేరు ఏమిటి': 'what is your name',
    'నా పేరు': 'my name is',
    'నేను బాగున్నాను': 'i am fine',
    'గ్రామీణ పాఠశాలల కోసం ప్రభుత్వం కొత్త విద్యా విధానాలను ప్రకటించింది': 'the government announced new educational policies for rural schools',
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
  en_to_ta: {
    the: 'அது', a: 'ஒரு', an: 'ஒரு', and: 'மற்றும்', or: 'அல்லது', with: 'உடன்',
    for: 'க்காக', from: 'இருந்து', to: 'க்கு', in: 'இல்', of: 'இன்', is: 'இருக்கிறது',
    are: 'இருக்கின்றன', this: 'இது', that: 'அது', we: 'நாம்', you: 'நீங்கள்', i: 'நான்',
    he: 'அவர்', she: 'அவள்', they: 'அவர்கள்', my: 'என்', your: 'உங்கள்', name: 'பெயர்',
    water: 'தண்ணீர்', food: 'உணவு', school: 'பள்ளி', education: 'கல்வி', government: 'அரசு',
    new: 'புதிய', rural: 'கிராமப்புற', village: 'கிராமம்', city: 'நகரம்', today: 'இன்று',
  },
  ta_to_en: {
    'வணக்கம்': 'hello', 'நன்றி': 'thank you', 'நான்': 'i', 'நீங்கள்': 'you',
    'இது': 'this', 'அது': 'that', 'பள்ளி': 'school', 'அரசு': 'government',
    'நகரம்': 'city', 'இன்று': 'today',
  },
  en_to_te: {
    the: 'అది', a: 'ఒక', an: 'ఒక', and: 'మరియు', or: 'లేదా', with: 'తో',
    for: 'కోసం', from: 'నుండి', to: 'కి', in: 'లో', of: 'యొక్క', is: 'ఉంది',
    are: 'ఉన్నాయి', this: 'ఇది', that: 'అది', we: 'మేము', you: 'మీరు', i: 'నేను',
    he: 'అతను', she: 'ఆమె', they: 'వారు', my: 'నా', your: 'మీ', name: 'పేరు',
    water: 'నీరు', food: 'ఆహారం', school: 'పాఠశాల', education: 'విద్య', government: 'ప్రభుత్వం',
    new: 'కొత్త', rural: 'గ్రామీణ', village: 'గ్రామం', city: 'నగరం', today: 'ఈ రోజు',
  },
  te_to_en: {
    'హలో': 'hello', 'ధన్యవాదాలు': 'thank you', 'నేను': 'i', 'మీరు': 'you',
    'ఇది': 'this', 'అది': 'that', 'పాఠశాల': 'school', 'ప్రభుత్వం': 'government',
    'నగరం': 'city', 'ఈ రోజు': 'today',
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
 * Resolves the translation direction key
 */
function getDirectionKey(sourceLang, targetLang) {
  const s = String(sourceLang).toLowerCase();
  const t = String(targetLang).toLowerCase();

  const isEn = s.startsWith('eng') || s === 'en';
  const isKn = s.startsWith('kan') || s === 'kn';
  const isHi = s.startsWith('hin') || s === 'hi';
  const isTa = s.startsWith('tam') || s === 'ta';
  const isTe = s.startsWith('tel') || s === 'te';

  const tIsEn = t.startsWith('eng') || t === 'en';
  const tIsKn = t.startsWith('kan') || t === 'kn';
  const tIsHi = t.startsWith('hin') || t === 'hi';
  const tIsTa = t.startsWith('tam') || t === 'ta';
  const tIsTe = t.startsWith('tel') || t === 'te';

  if (isEn && tIsKn) return 'en_to_kn';
  if (isKn && tIsEn) return 'kn_to_en';
  if (isEn && tIsHi) return 'en_to_hi';
  if (isHi && tIsEn) return 'hi_to_en';
  if (isEn && tIsTa) return 'en_to_ta';
  if (isTa && tIsEn) return 'ta_to_en';
  if (isEn && tIsTe) return 'en_to_te';
  if (isTe && tIsEn) return 'te_to_en';

  if (tIsKn) return 'en_to_kn';
  if (tIsHi) return 'en_to_hi';
  if (tIsTa) return 'en_to_ta';
  if (tIsTe) return 'en_to_te';
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
