import React, { useState } from 'react';
import { ArrowLeftRight, Copy, Volume2, Check } from 'lucide-react';

export const LANGUAGES = [
  { code: 'auto', iso: 'auto', label: 'Auto-detect', native: 'Auto-detect' },
  { code: 'eng_Latn', iso: 'en', label: 'English', native: 'English' },
  { code: 'kan_Knda', iso: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'hin_Deva', iso: 'hi', label: 'Hindi', native: 'हिन्दी' },
  { code: 'tam_Taml', iso: 'ta', label: 'Tamil', native: 'தமிழ்' },
  { code: 'tel_Telu', iso: 'te', label: 'Telugu', native: 'తెలుగు' },
];

const TARGET_LANGUAGES = LANGUAGES.filter((language) => language.code !== 'auto');

export default function TranslateView({
  sourceText,
  onChangeText,
  translatedText,
  sourceLang,
  targetLang,
  changeSourceLanguage,
  changeTargetLanguage,
  swapLanguages,
  clearText,
  onTranslate,
  isLoading,
}) {
  const [copied, setCopied] = useState(false);

  const copyText = async () => {
    if (!translatedText) return;
    await navigator.clipboard?.writeText(translatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  const speak = (text, langCode) => {
    if (!text || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const locale = { eng_Latn: 'en-US', kan_Knda: 'kn-IN', hin_Deva: 'hi-IN', tam_Taml: 'ta-IN', tel_Telu: 'te-IN' };
    utterance.lang = locale[langCode] || 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  const fontClass = targetLang === 'kan_Knda' ? 'font-kannada'
    : targetLang === 'hin_Deva' ? 'font-devanagari'
    : targetLang === 'tam_Taml' ? 'font-tamil'
    : targetLang === 'tel_Telu' ? 'font-telugu' : '';

  return (
    <section className="translation-card">
      <header>
        <h1>Translation</h1>
        <p>Translate between English and four Indian languages.</p>
      </header>

      <div className="language-row">
        <div className="field">
          <label htmlFor="from-language">FROM</label>
          <select id="from-language" value={sourceLang} onChange={(event) => changeSourceLanguage(event.target.value)}>
            {LANGUAGES.map((language) => <option key={language.code} value={language.code}>{language.label}</option>)}
          </select>
        </div>
        <button type="button" className="swap-button" onClick={swapLanguages} title="Swap languages" aria-label="Swap languages">
          <ArrowLeftRight size={17} />
        </button>
        <div className="field">
          <label htmlFor="to-language">TO</label>
          <select id="to-language" value={targetLang} onChange={(event) => changeTargetLanguage(event.target.value)}>
            {TARGET_LANGUAGES.map((language) => <option key={language.code} value={language.code}>{language.native}</option>)}
          </select>
        </div>
      </div>

      <div className="text-grid">
        <div className="text-panel">
          <textarea
            value={sourceText}
            onChange={(event) => onChangeText(event.target.value.slice(0, 4000))}
            placeholder="Enter text..."
            aria-label="Source text"
          />
          <div className="text-actions">
            <span>{sourceText.length} / 4000</span>
            <div className="action-group">
              <button type="button" onClick={() => speak(sourceText, sourceLang === 'auto' ? 'eng_Latn' : sourceLang)} disabled={!sourceText}>
                <Volume2 size={15} /> Speak
              </button>
              <button type="button" onClick={clearText} disabled={!sourceText}>Clear</button>
            </div>
          </div>
        </div>

        <div className="text-panel">
          <div className="output-label" style={{ padding: '18px 18px 0', margin: 0 }}>TRANSLATION</div>
          <div className={`text-output ${fontClass}`}>{translatedText || ''}</div>
          <div className="text-actions">
            <span />
            <div className="action-group">
              <button type="button" onClick={copyText} disabled={!translatedText}>
                {copied ? <Check size={15} /> : <Copy size={15} />} {copied ? 'Copied' : 'Copy'}
              </button>
              <button type="button" onClick={() => speak(translatedText, targetLang)} disabled={!translatedText}>
                <Volume2 size={15} /> Speak
              </button>
            </div>
          </div>
        </div>
      </div>

      <button className="translate-button" type="button" onClick={onTranslate} disabled={isLoading || !sourceText.trim()}>
        {isLoading ? 'Translating...' : 'Translate'}
      </button>
    </section>
  );
}
