/**
 * LinguaBridge AI - Translation State Management Hook
 * ====================================================
 * Module: frontend/src/hooks/useTranslation.js
 * 
 * Manages:
 * - Source and target language selection
 * - Text inputs, char counts, and language swapping
 * - Model variant selection (Baseline, LoRA, LoRA+BT)
 * - Real-time network and platform detection via useNetwork hook
 * - Hybrid Translation Execution (Online NLLB FastAPI backend vs. Offline ML Kit on-device)
 * - Translation result Mode Badge state ('Online Backend' vs 'Offline On-Device')
 * - LocalStorage history persistence with mode flags
 * - Side-by-side 3-way comparative evaluation
 * - Modal states (History, Metrics, Offline Models)
 */

import { useState, useEffect, useCallback } from 'react';
import { translateText, compareModels, getMetrics } from '../services/translationApi';
import { useNetwork } from './useNetwork';

const STORAGE_KEY = 'linguabridge_translation_history';
const MAX_HISTORY_ITEMS = 30;

export function useTranslation() {
  // Network & Platform Connectivity State
  const { isConnected, connectionType, isNative, platform } = useNetwork();

  // Input & Translation State
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLang, setSourceLang] = useState('eng_Latn');
  const [targetLang, setTargetLang] = useState('kan_Knda');
  const [modelVariant, setModelVariant] = useState('lora_bt'); // default to best model

  // Engine Mode & Performance Indicators
  const [translationMode, setTranslationMode] = useState('online'); // 'online' | 'offline'
  const [translationEngine, setTranslationEngine] = useState('Online Backend (NLLB/LoRA)');
  const [isFallback, setIsFallback] = useState(false);
  const [isLocalFallback, setIsLocalFallback] = useState(false);
  const [latency, setLatency] = useState(null);

  // UI Loading & Error States
  const [isLoading, setIsLoading] = useState(false);
  const [isComparing, setIsComparing] = useState(false);
  const [error, setError] = useState(null);

  // Modals & Panels Visibility
  const [comparisonData, setComparisonData] = useState(null);
  const [metricsData, setMetricsData] = useState(null);
  const [showMetricsModal, setShowMetricsModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showOfflineModelsModal, setShowOfflineModelsModal] = useState(false);
  const [showInlineOfflineControls, setShowInlineOfflineControls] = useState(false);

  // Translation History (persisted in localStorage)
  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.warn('Failed to parse translation history from localStorage', e);
      return [];
    }
  });

  // Sync history state to browser localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (e) {
      console.warn('Failed to persist history to localStorage', e);
    }
  }, [history]);

  // Load benchmark metrics once on component mount
  useEffect(() => {
    getMetrics()
      .then(setMetricsData)
      .catch((err) => console.warn('Could not preload metrics', err));
  }, []);

  /**
   * Swaps source and target languages, exchanging existing input and output text.
   */
  const swapLanguages = useCallback(() => {
    setSourceLang((prevSrc) => {
      const newSrc = targetLang;
      setTargetLang(prevSrc);
      return newSrc;
    });

    // Also swap the active contents
    const currentInput = sourceText;
    setSourceText(translatedText);
    setTranslatedText(currentInput);
    setLatency(null);
  }, [sourceText, translatedText, targetLang]);

  /**
   * Clears the current input, output, errors, and comparison data.
   */
  const clearText = useCallback(() => {
    setSourceText('');
    setTranslatedText('');
    setLatency(null);
    setError(null);
    setComparisonData(null);
    setIsFallback(false);
    setIsLocalFallback(false);
  }, []);

  /**
   * Executes hybrid translation:
   * - When online: routes to FastAPI backend; if unreachable on native platform, falls back to on-device ML Kit.
   * - When offline: routes directly to on-device ML Kit translation (native) or informs web user cleanly.
   */
  const handleTranslate = useCallback(async (customText = null) => {
    const textToTranslate = (customText !== null ? customText : sourceText).trim();
    if (!textToTranslate) return;

    setIsLoading(true);
    setError(null);
    setIsFallback(false);

    try {
      const response = await translateText({
        text: textToTranslate,
        source_lang: sourceLang,
        target_lang: targetLang,
        model_variant: modelVariant,
        isOnline: isConnected,
      });

      setTranslatedText(response.translated_text);
      setLatency(response.latency_ms);
      setTranslationMode(response.mode || (isConnected ? 'online' : 'offline'));
      setTranslationEngine(response.engine || (isConnected ? 'Online Backend (NLLB/LoRA)' : 'Offline On-Device Model'));
      setIsFallback(Boolean(response.isFallback));
      setIsLocalFallback(Boolean(response.isLocalFallback));

      // Append to history with mode metadata
      const newHistoryItem = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        sourceText: textToTranslate,
        translatedText: response.translated_text,
        sourceLang,
        targetLang,
        modelVariant,
        latencyMs: response.latency_ms,
        translationMode: response.mode || (isConnected ? 'online' : 'offline'),
        translationEngine: response.engine || (isConnected ? 'Online Backend (NLLB/LoRA)' : 'Offline On-Device Model'),
        isLocalFallback: Boolean(response.isLocalFallback),
      };

      setHistory((prev) => [newHistoryItem, ...prev.slice(0, MAX_HISTORY_ITEMS - 1)]);
    } catch (err) {
      console.error('Translation failed:', err);
      setError(err.message || 'An unexpected error occurred during translation.');
    } finally {
      setIsLoading(false);
    }
  }, [sourceText, sourceLang, targetLang, modelVariant, isConnected]);

  /**
   * Executes 3-way comparative translation (requires online FastAPI backend).
   */
  const handleCompare = useCallback(async () => {
    const textToCompare = sourceText.trim();
    if (!textToCompare) return;

    if (!isConnected) {
      setError('Side-by-side architecture comparison requires an active connection to the FastAPI backend.');
      return;
    }

    setIsComparing(true);
    setError(null);

    try {
      const compResponse = await compareModels({
        text: textToCompare,
        source_lang: sourceLang,
        target_lang: targetLang,
      });
      setComparisonData(compResponse);
    } catch (err) {
      console.error('Model comparison failed:', err);
      setError(err.message || 'Failed to generate model comparisons.');
    } finally {
      setIsComparing(false);
    }
  }, [sourceText, sourceLang, targetLang, isConnected]);

  /**
   * Clears all saved local translation history.
   */
  const clearHistory = useCallback(() => {
    setHistory([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn(e);
    }
  }, []);

  /**
   * Loads a past translation item from history into the active editor.
   */
  const selectHistoryItem = useCallback((item) => {
    setSourceText(item.sourceText);
    setTranslatedText(item.translatedText);
    setSourceLang(item.sourceLang);
    setTargetLang(item.targetLang);
    setModelVariant(item.modelVariant);
    setLatency(item.latencyMs);
    setTranslationMode(item.translationMode || 'online');
    setTranslationEngine(item.translationEngine || 'Online Backend (NLLB/LoRA)');
    setIsLocalFallback(Boolean(item.isLocalFallback));
    setShowHistoryModal(false);
  }, []);

  return {
    // Network & Platform
    isConnected,
    connectionType,
    isNative,
    platform,

    // Text & Languages
    sourceText,
    setSourceText,
    translatedText,
    sourceLang,
    targetLang,
    modelVariant,
    setModelVariant,

    // Mode & Engine Info
    translationMode,
    translationEngine,
    isFallback,
    isLocalFallback,
    latency,

    // Processing & Errors
    isLoading,
    isComparing,
    error,
    setError,

    // Comparison & Metrics
    comparisonData,
    metricsData,

    // Modals
    showMetricsModal,
    setShowMetricsModal,
    showHistoryModal,
    setShowHistoryModal,
    showOfflineModelsModal,
    setShowOfflineModelsModal,
    showInlineOfflineControls,
    setShowInlineOfflineControls,

    // History
    history,

    // Operations
    swapLanguages,
    clearText,
    handleTranslate,
    handleCompare,
    clearHistory,
    selectHistoryItem,
  };
}
