import React, { useState } from 'react';
import { Search } from 'lucide-react';

export default function HistoryView({ history = [], onSelectHistoryItem, onClearHistory }) {
  const [query, setQuery] = useState('');
  const filtered = history.filter((item) => {
    const haystack = `${item.sourceText} ${item.translatedText} ${item.sourceLang} ${item.targetLang}`.toLowerCase();
    return haystack.includes(query.toLowerCase());
  });

  return (
    <section>
      <div className="history-header">
        <h1>History</h1>
        {history.length > 0 && <button type="button" className="clear-history" onClick={onClearHistory}>Clear</button>}
      </div>
      <div className="history-tools">
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search translations" aria-label="Search history" />
        <button type="button" aria-label="Search"><Search size={16} /></button>
      </div>
      <div className="history-list">
        {filtered.length === 0 ? (
          <div className="empty-history">No past translations found.</div>
        ) : filtered.map((item) => (
          <button type="button" className="history-item" key={item.id} onClick={() => onSelectHistoryItem(item)}>
            <div className="pair">{item.sourceLang?.split('_')[0].toUpperCase()} → {item.targetLang?.split('_')[0].toUpperCase()}</div>
            <div className="source">{item.sourceText}</div>
            <div className="translation">{item.translatedText}</div>
          </button>
        ))}
      </div>
    </section>
  );
}
