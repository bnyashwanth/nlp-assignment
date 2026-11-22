import React, { useState } from 'react';
import TranslateView from './components/TranslateView';
import HistoryView from './components/HistoryView';
import { useTranslation } from './hooks/useTranslation';
import { ArrowRight } from 'lucide-react';

const LANGUAGES = 'ENGLISH • ಕನ್ನಡ • हिंदी • தமிழ் • తెలుగు';

export default function App() {
  const translation = useTranslation();
  const [activeView, setActiveView] = useState('home');

  return (
    <div className="app-shell">
      <header className="top-nav">
        <button className="brand" type="button" onClick={() => setActiveView('home')}>
          <img className="brand-mark" src="/setu-icon.svg" alt="" aria-hidden="true" />
          <span>Setu</span>
        </button>
        <nav aria-label="Primary navigation">
          <button type="button" className={activeView === 'home' ? 'active' : ''} onClick={() => setActiveView('home')}>Home</button>
          <button type="button" className={activeView === 'history' ? 'active' : ''} onClick={() => setActiveView('history')}>History</button>
        </nav>
      </header>

      {activeView === 'home' && (
        <main className="home-view">
          <div className="home-art" aria-hidden="true">
            <div className="orbital-globe">
              <span className="orbit orbit-one" />
              <span className="orbit orbit-two" />
              <span className="orbit orbit-three" />
              <span className="globe-core" />
            </div>

            <div className="glyph glyph-a">A</div>
            <div className="glyph glyph-kn">ಅ</div>
            <div className="glyph glyph-hi">अ</div>
            <div className="glyph glyph-ta">அ</div>
            <div className="glyph glyph-te">అ</div>

            <div className="glass-sphere sphere-one" />
            <div className="glass-sphere sphere-two" />
            <div className="glass-sphere sphere-three" />
            <div className="glass-sphere sphere-four" />
            <div className="glass-sphere sphere-five" />

            <svg className="ribbon ribbon-left" viewBox="0 0 500 260" fill="none">
              <path d="M-30 215C74 205 83 92 183 116C286 140 275 238 414 125C457 90 486 65 530 42" />
            </svg>
            <svg className="ribbon ribbon-right" viewBox="0 0 620 300" fill="none">
              <path d="M-20 258C88 220 79 126 181 96C310 58 342 232 470 208C544 194 590 116 650 52" />
            </svg>
          </div>
          <section className="hero">
            <span className="language-pill">{LANGUAGES}</span>
            <h1>Find the words that carry meaning.</h1>
            <p>Setu translates between English, Kannada, Hindi, Tamil, and Telugu, with text preparation handled quietly in the background.</p>
            <button className="primary-cta" type="button" onClick={() => setActiveView('translator')}>
              Open the translator <ArrowRight size={17} />
            </button>
          </section>
          <section className="feature-grid" aria-label="Features">
            <article><span>01</span><h2>Five Languages</h2><p>English, Kannada, Hindi, Tamil, and Telugu in one focused workspace.</p></article>
            <article><span>02</span><h2>Natural Translation</h2><p>AI4Bharat IndicTrans2 neural translation is available through the web service or as an embedded Android model.</p></article>
            <article><span>03</span><h2>Built for Daily Text</h2><p>Translate messages, notes, and everyday passages without a cluttered interface.</p></article>
          </section>
        </main>
      )}

      {activeView === 'translator' && (
        <main className="view-container">
          <button className="back-link" type="button" onClick={() => setActiveView('home')}>← Back to Home</button>
          {translation.error && <div className="quiet-error">{translation.error}</div>}
          <TranslateView
            {...translation}
            onChangeText={translation.setSourceText}
            onTranslate={() => translation.handleTranslate()}
            onBack={() => setActiveView('home')}
          />
        </main>
      )}

      {activeView === 'history' && (
        <main className="view-container">
          <HistoryView history={translation.history} onSelectHistoryItem={(item) => {
            translation.selectHistoryItem(item);
            setActiveView('translator');
          }} onClearHistory={translation.clearHistory} />
        </main>
      )}
    </div>
  );
}
