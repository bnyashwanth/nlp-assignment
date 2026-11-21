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
          <span className="brand-mark" aria-hidden="true">S</span>
          <span>Setu</span>
        </button>
        <nav aria-label="Primary navigation">
          <button type="button" className={activeView === 'home' ? 'active' : ''} onClick={() => setActiveView('home')}>Home</button>
          <button type="button" className={activeView === 'history' ? 'active' : ''} onClick={() => setActiveView('history')}>History</button>
        </nav>
      </header>

      {activeView === 'home' && (
        <main className="home-view">
          <div className="script-glyphs" aria-hidden="true">
            <span>ಕ</span><span>ह</span><span>த</span><span>తె</span>
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
            <article><span>02</span><h2>Natural Translation</h2><p>NLLB neural translation is available through the web service or as an embedded Android model.</p></article>
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
