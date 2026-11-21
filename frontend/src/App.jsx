/**
 * LinguaBridge AI - Main Application Component (Apple-Inspired UI)
 * ================================================================
 * Module: frontend/src/App.jsx
 * 
 * Features:
 * - Desktop 1440px wide Apple layout with 270px Sidebar and rounded-[28px] canvas
 * - Responsive mobile & Capacitor support with seamless touch navigation
 * - Multi-tab view routing: Translate, History, Languages, Saved, Settings
 * - Full 22RI52 Indic multilingual support (English, Kannada, Hindi, Tamil, Telugu)
 * - Hybrid routing: Online NLLB-200/LoRA FastAPI backend + On-device ML Kit / Local Fallback
 * - Empirical SacreBLEU & chrF++ benchmark modals and offline model pack management
 */

import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import TranslateView from './components/TranslateView';
import HistoryView from './components/HistoryView';
import LanguagesView from './components/LanguagesView';
import SavedView from './components/SavedView';
import SettingsView from './components/SettingsView';
import ModelComparison from './components/ModelComparison';
import MetricsModal from './components/MetricsModal';
import OfflineModelManager from './components/OfflineModelManager';
import { useTranslation } from './hooks/useTranslation';
import { clearTranslationCache } from './services/translationCache';
import { WifiOff, AlertCircle, X, Check } from 'lucide-react';

const SAVED_STORAGE_KEY = 'linguabridge_saved_translations';

export default function App() {
  const {
    // Network & Platform
    isConnected,
    isNative,

    // Text & Languages
    sourceText,
    setSourceText,
    translatedText,
    sourceLang,
    targetLang,
    modelVariant,
    setModelVariant,

    // Mode & Engine
    translationMode,
    translationEngine,
    isFallback,
    isLocalFallback,
    latency,
    nlpDiagnostics,

    // Loading & Errors
    isLoading,
    isComparing,
    error,
    setError,

    // Data & Modals
    comparisonData,
    metricsData,
    history,
    showMetricsModal,
    setShowMetricsModal,
    showOfflineModelsModal,
    setShowOfflineModelsModal,

    // Handlers
    swapLanguages,
    changeSourceLanguage,
    changeTargetLanguage,
    clearText,
    handleTranslate,
    handleCompare,
    clearHistory,
    selectHistoryItem,
  } = useTranslation();

  // Active navigation tab: 'translate' | 'history' | 'languages' | 'saved' | 'settings'
  const [activeTab, setActiveTab] = useState('translate');

  // Saved translations count for sidebar badge
  const [savedCount, setSavedCount] = useState(() => {
    try {
      const stored = localStorage.getItem(SAVED_STORAGE_KEY);
      return stored ? JSON.parse(stored).length : 4;
    } catch {
      return 4;
    }
  });

  // Track if current translation is saved
  const [isCurrentSaved, setIsCurrentSaved] = useState(false);
  const [saveToast, setSaveToast] = useState(false);

  // Bookmark current translation into Saved translations
  const handleSaveCurrent = () => {
    if (!translatedText || !sourceText) return;

    try {
      const stored = localStorage.getItem(SAVED_STORAGE_KEY);
      const items = stored ? JSON.parse(stored) : [];

      const srcCode = sourceLang.split('_')[0].toUpperCase();
      const tgtCode = targetLang.split('_')[0].toUpperCase();

      const newItem = {
        id: `saved-${Date.now()}`,
        sourceText,
        translatedText,
        sourceLang,
        targetLang,
        category: targetLang === 'kan_Knda' ? 'Kannada' : targetLang === 'hin_Deva' ? 'Hindi' : 'Tamil & Telugu',
        engine: translationMode === 'offline' ? 'Offline Pure-NLP Engine' : 'Online Python NLLB-200',
        pairBadge: `${srcCode} → ${tgtCode}`,
        badgeBg: targetLang === 'kan_Knda' ? 'bg-[#FDB827]/15' : targetLang === 'hin_Deva' ? 'bg-[#E03A3E]/10' : targetLang === 'tam_Taml' ? 'bg-[#963D97]/10' : 'bg-[#009DDC]/10',
        badgeText: targetLang === 'kan_Knda' ? 'text-[#9E6E00]' : targetLang === 'hin_Deva' ? 'text-[#E03A3E]' : targetLang === 'tam_Taml' ? 'text-[#963D97]' : 'text-[#009DDC]',
        badgeBorder: targetLang === 'kan_Knda' ? 'border-[#FDB827]/30' : targetLang === 'hin_Deva' ? 'border-[#E03A3E]/20' : targetLang === 'tam_Taml' ? 'border-[#963D97]/20' : 'border-[#009DDC]/20',
        fontClass: targetLang === 'kan_Knda' ? 'font-kannada' : targetLang === 'hin_Deva' ? 'font-devanagari' : targetLang === 'tam_Taml' ? 'font-tamil' : targetLang === 'tel_Telu' ? 'font-telugu' : 'font-sans',
      };

      const updated = [newItem, ...items];
      localStorage.setItem(SAVED_STORAGE_KEY, JSON.stringify(updated));
      setSavedCount(updated.length);
      setIsCurrentSaved(true);
      setSaveToast(true);
      setTimeout(() => setSaveToast(false), 2000);
    } catch (e) {
      console.warn('Failed to save translation:', e);
    }
  };

  // Reset saved status when text changes
  useEffect(() => {
    setIsCurrentSaved(false);
  }, [sourceText, translatedText]);

  // Handle selecting a language from Languages view
  const handleSelectLanguageFromDirectory = (langCode, role = 'target') => {
    if (role === 'target') {
      changeTargetLanguage(langCode);
    } else {
      changeSourceLanguage(langCode);
    }
    setActiveTab('translate');
  };

  // Handle applying a sample from Languages directory
  const handleApplySampleFromDirectory = (sampleText, srcCode, tgtCode) => {
    changeSourceLanguage(srcCode);
    changeTargetLanguage(tgtCode);
    setSourceText(sampleText);
    setActiveTab('translate');
  };

  // Handle selecting an item from History or Saved to translate
  const handleSelectToTranslate = (item) => {
    setSourceText(item.sourceText);
    if (item.sourceLang) changeSourceLanguage(item.sourceLang);
    if (item.targetLang) changeTargetLanguage(item.targetLang);
    setActiveTab('translate');
  };

  const handleClearCache = () => {
    clearTranslationCache();
    alert('Local translation cache successfully cleared.');
  };

  return (
    <div className="min-h-screen bg-[#EBECEF] p-2 sm:p-5 lg:p-7 flex justify-center items-center font-sans antialiased">
      
      {/* Apple Desktop App Canvas (1440px wide max, rounded-[28px], soft shadow) */}
      <div className="w-full max-w-[1440px] min-h-[920px] bg-[#F7F8FA] rounded-[22px] sm:rounded-[28px] border border-[#E2E4E9] shadow-2xl flex flex-col lg:flex-row overflow-hidden relative">
        
        {/* Left Sidebar (Desktop & Mobile Header) */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          isConnected={isConnected}
          isNative={isNative}
          historyCount={history.length}
          savedCount={savedCount}
          onOpenMetrics={() => setShowMetricsModal(true)}
          onOpenOfflineModels={() => setShowOfflineModelsModal(true)}
        />

        {/* Main Workspace Area */}
        <main className="flex-1 overflow-y-auto p-5 sm:p-8 lg:p-10 flex flex-col justify-between">
          
          <div className="space-y-4">
            
            {/* Offline Connectivity Notice Banner */}
            {!isConnected && (
              <div className="p-3.5 rounded-[16px] bg-[#61BB46]/10 border border-[#61BB46]/30 text-[#30701F] text-xs font-medium flex items-center justify-between soft-shadow animate-fadeIn">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-[#61BB46] animate-pulse shrink-0"></span>
                  <span>
                    <strong>Pure-NLP Offline Mode:</strong> Using built-in 22RI52 tokenization, Levenshtein typo snapping & parallel corpus (0 MB download required).
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowOfflineModelsModal(true)}
                  className="text-[11px] font-semibold px-2.5 py-1 bg-[#61BB46]/20 hover:bg-[#61BB46]/30 text-[#30701F] rounded-[8px] transition-colors ml-2 shrink-0"
                >
                  Engine Status
                </button>
              </div>
            )}

            {/* Error Notification Banner */}
            {error && (
              <div className="p-3.5 rounded-[16px] bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between soft-shadow animate-fadeIn">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{error}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setError(null)}
                  className="text-rose-400 hover:text-rose-600 p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Bookmark Toast Alert */}
            {saveToast && (
              <div className="p-3 rounded-[14px] bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center space-x-2 soft-shadow animate-fadeIn">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Saved translation bookmarked to Saved tab!</span>
              </div>
            )}

            {/* Active Tab View Rendering */}
            {activeTab === 'translate' && (
              <TranslateView
                sourceText={sourceText}
                onChangeText={setSourceText}
                translatedText={translatedText}
                sourceLang={sourceLang}
                targetLang={targetLang}
                onChangeSource={changeSourceLanguage}
                onChangeTarget={changeTargetLanguage}
                onSwap={swapLanguages}
                modelVariant={modelVariant}
                onModelChange={setModelVariant}
                onTranslate={handleTranslate}
                onCompare={handleCompare}
                onClear={clearText}
                isLoading={isLoading}
                isComparing={isComparing}
                latency={latency}
                translationMode={translationMode}
                translationEngine={translationEngine}
                nlpDiagnostics={nlpDiagnostics}
                isFallback={isFallback}
                isLocalFallback={isLocalFallback}
                isConnected={isConnected}
                isNative={isNative}
                onSwitchTab={setActiveTab}
                onSaveTranslation={handleSaveCurrent}
                isSaved={isCurrentSaved}
              />
            )}

            {activeTab === 'history' && (
              <HistoryView
                history={history}
                onSelectHistoryItem={(item) => {
                  selectHistoryItem(item);
                  setActiveTab('translate');
                }}
                onClearHistory={clearHistory}
              />
            )}

            {activeTab === 'languages' && (
              <LanguagesView
                onSelectLanguage={handleSelectLanguageFromDirectory}
                onApplySample={handleApplySampleFromDirectory}
                currentSource={sourceLang}
                currentTarget={targetLang}
              />
            )}

            {activeTab === 'saved' && (
              <SavedView onSelectToTranslate={handleSelectToTranslate} />
            )}

            {activeTab === 'settings' && (
              <SettingsView
                onClearCache={handleClearCache}
                onClearHistory={clearHistory}
                onOpenMetrics={() => setShowMetricsModal(true)}
                onOpenOfflineModels={() => setShowOfflineModelsModal(true)}
              />
            )}

          </div>

          {/* Side-by-Side Model Comparison Section (if active) */}
          {comparisonData && (
            <div className="mt-6">
              <ModelComparison
                comparisonData={comparisonData}
                onClose={() => handleCompare(null)}
              />
            </div>
          )}

        </main>
      </div>

      {/* Offline Model Manager Modal Dialog */}
      <OfflineModelManager
        isOpen={showOfflineModelsModal}
        onClose={() => setShowOfflineModelsModal(false)}
        isInline={false}
      />

      {/* Empirical SacreBLEU & chrF++ Metrics Modal */}
      <MetricsModal
        isOpen={showMetricsModal}
        onClose={() => setShowMetricsModal(false)}
        metricsData={metricsData}
      />

    </div>
  );
}
