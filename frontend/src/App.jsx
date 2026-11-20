/**
 * LinguaBridge AI - Main Application Component
 * ============================================
 * Module: frontend/src/App.jsx
 * 
 * Assembles:
 * - Navbar (with real-time connectivity status & offline models button)
 * - LanguageSelector (language direction swapping & model architecture selection)
 * - TranslatorPanel (source text input & translation actions)
 * - TranslationOutput (target result with Online / Offline Mode Badge & latency)
 * - OfflineModelManager (English ↔ Kannada model pack download/delete management)
 * - ModelComparison (3-way comparative evaluation)
 * - HistoryPanel (persisted translation history with mode badges)
 * - MetricsModal (empirical SacreBLEU / chrF++ evaluation metrics)
 */

import React from 'react';
import Navbar from './components/Navbar';
import LanguageSelector from './components/LanguageSelector';
import TranslatorPanel from './components/TranslatorPanel';
import TranslationOutput from './components/TranslationOutput';
import ModelComparison from './components/ModelComparison';
import HistoryPanel from './components/HistoryPanel';
import MetricsModal from './components/MetricsModal';
import OfflineModelManager from './components/OfflineModelManager';
import { useTranslation } from './hooks/useTranslation';
import {
  AlertCircle,
  X,
  HardDrive,
  WifiOff,
  ChevronDown,
  ChevronUp,
  Smartphone,
  Cloud,
} from 'lucide-react';

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
    showHistoryModal,
    setShowHistoryModal,
    showOfflineModelsModal,
    setShowOfflineModelsModal,
    showInlineOfflineControls,
    setShowInlineOfflineControls,

    // Handlers
    swapLanguages,
    clearText,
    handleTranslate,
    handleCompare,
    clearHistory,
    selectHistoryItem,
  } = useTranslation();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      
      {/* Top Navigation */}
      <Navbar
        onOpenMetrics={() => setShowMetricsModal(true)}
        onOpenHistory={() => setShowHistoryModal(true)}
        onOpenOfflineModels={() => setShowOfflineModelsModal(true)}
        historyCount={history.length}
        isConnected={isConnected}
        isNative={isNative}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* Offline Connectivity Notice Banner */}
        {!isConnected && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-sm flex items-center justify-between shadow-sm animate-fadeIn">
            <div className="flex items-center space-x-2.5">
              <WifiOff className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <span className="font-bold">Offline Mode Active.</span>{' '}
                <span>
                  {isNative
                    ? 'Translations will run on-device using local ML Kit models.'
                    : 'Web browser is offline. Please reconnect to access the online FastAPI backend.'}
                </span>
              </div>
            </div>
            {isNative && (
              <button
                type="button"
                onClick={() => setShowOfflineModelsModal(true)}
                className="text-xs font-semibold px-3 py-1 bg-amber-200/80 hover:bg-amber-300 text-amber-900 rounded-lg transition-colors shrink-0 ml-3"
              >
                Manage Models
              </button>
            )}
          </div>
        )}

        {/* Error Alert Banner */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start justify-between shadow-sm animate-fadeIn">
            <div className="flex items-center space-x-2.5">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-rose-400 hover:text-rose-600 p-1"
              title="Dismiss error"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Quick Offline Model Pack Toggle Bar */}
        <div className="mb-4 flex items-center justify-between bg-white px-4 py-2.5 rounded-xl border border-slate-200/80 shadow-xs text-xs">
          <div className="flex items-center space-x-2 text-slate-600">
            <HardDrive className="w-4 h-4 text-brand-600" />
            <span className="font-semibold text-slate-800">Offline Model Packs:</span>
            <span>English ↔ Kannada (~30MB each)</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setShowInlineOfflineControls((prev) => !prev)}
              className="inline-flex items-center space-x-1 font-semibold text-brand-600 hover:text-brand-700 py-1 px-2 rounded-lg hover:bg-brand-50 transition-colors"
            >
              <span>{showInlineOfflineControls ? 'Hide Controls' : 'Show Controls'}</span>
              {showInlineOfflineControls ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setShowOfflineModelsModal(true)}
              className="text-slate-500 hover:text-slate-800 font-medium py-1 px-2 rounded-lg hover:bg-slate-100 transition-colors hidden sm:inline"
            >
              Open Dialog
            </button>
          </div>
        </div>

        {/* Inline Offline Model Manager (collapsible) */}
        {showInlineOfflineControls && (
          <OfflineModelManager isInline={true} />
        )}

        {/* Language & Architecture Controls */}
        <LanguageSelector
          sourceLang={sourceLang}
          targetLang={targetLang}
          onSwap={swapLanguages}
          modelVariant={modelVariant}
          onModelChange={setModelVariant}
        />

        {/* Dual-Pane Translator Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          
          {/* Source Input Panel */}
          <TranslatorPanel
            sourceText={sourceText}
            onChangeText={setSourceText}
            onTranslate={handleTranslate}
            onCompare={handleCompare}
            onClear={clearText}
            isLoading={isLoading}
            isComparing={isComparing}
            sourceLang={sourceLang}
          />

          {/* Target Output Panel (With Mode Badge: Online Backend vs Offline On-Device Model) */}
          <TranslationOutput
            translatedText={translatedText}
            isLoading={isLoading}
            targetLang={targetLang}
            modelVariant={modelVariant}
            latency={latency}
            translationMode={translationMode}
            translationEngine={translationEngine}
            isFallback={isFallback}
            isLocalFallback={isLocalFallback}
          />

        </div>

        {/* Side-by-Side Architectural Comparison Section */}
        {comparisonData && (
          <ModelComparison
            comparisonData={comparisonData}
            onClose={() => handleCompare(null)}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 space-y-1">
          <p className="font-medium text-slate-600">
            LinguaBridge AI &bull; English ↔ Kannada Low-Resource Neural Machine Translation
          </p>
          <p className="flex items-center justify-center space-x-2 text-slate-400">
            <span>Online Backend: NLLB-200 + LoRA PEFT (r=16, alpha=32)</span>
            <span>&bull;</span>
            <span>Offline Mobile: Google ML Kit Translation</span>
          </p>
        </div>
      </footer>

      {/* Offline Model Manager Modal Dialog */}
      <OfflineModelManager
        isOpen={showOfflineModelsModal}
        onClose={() => setShowOfflineModelsModal(false)}
        isInline={false}
      />

      {/* Translation History Modal */}
      <HistoryPanel
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        history={history}
        onSelect={selectHistoryItem}
        onClear={clearHistory}
      />

      {/* Benchmark Metrics Modal */}
      <MetricsModal
        isOpen={showMetricsModal}
        onClose={() => setShowMetricsModal(false)}
        metricsData={metricsData}
      />

    </div>
  );
}
