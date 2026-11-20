/**
 * LinguaBridge AI - Offline Language Model Manager Component
 * ==========================================================
 * Module: frontend/src/components/OfflineModelManager.jsx
 * 
 * Provides UI controls for on-device ML Kit language models (English ↔ Kannada):
 * - Checks downloaded models via Translation.getDownloadedModels()
 * - Downloads English (Language.English) and Kannada (Language.Kannada) model packs (~30MB)
 * - Deletes downloaded models via Translation.deleteDownloadedModel()
 * - Visualizes download/ready status, sizes, and operational progress
 * - Platform awareness: Distinguishes between native Android/iOS and web/browser environments
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Download,
  Trash2,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  HardDrive,
  Info,
  X,
  Loader2,
  ShieldCheck,
  Globe,
} from 'lucide-react';
import {
  Language,
  getDownloadedModels,
  downloadModel,
  deleteDownloadedModel,
  isOfflineTranslationSupported,
} from '../services/offlineTranslation';

// Target offline language packs
const MANAGED_LANGUAGES = [
  {
    code: Language.English, // 'en'
    name: 'English',
    nativeName: 'English',
    flag: '🇬🇧',
    description: 'Base English model pack for ML Kit neural translation',
    sizeEstimate: '~30 MB',
  },
  {
    code: Language.Kannada, // 'kn'
    name: 'Kannada',
    nativeName: 'ಕನ್ನಡ',
    flag: '🇮🇳',
    description: 'Kannada regional model pack for on-device inference',
    sizeEstimate: '~30 MB',
  },
];

export default function OfflineModelManager({ isOpen, onClose, isInline = false }) {
  const [downloadedLanguages, setDownloadedLanguages] = useState([]);
  const [isSupported, setIsSupported] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [activeOperations, setActiveOperations] = useState({}); // { [langCode]: 'downloading' | 'deleting' }
  const [feedback, setFeedback] = useState(null); // { type: 'success' | 'error' | 'info', message: string }

  const isNative = isOfflineTranslationSupported();

  /**
   * Refreshes the list of downloaded language models from native ML Kit storage.
   */
  const handleCheckModels = useCallback(async (quiet = false) => {
    setIsChecking(true);
    if (!quiet) setFeedback(null);

    try {
      const result = await getDownloadedModels();
      setDownloadedLanguages(result.languages || []);
      setIsSupported(result.isSupported);

      if (!quiet) {
        if (!result.isSupported) {
          setFeedback({
            type: 'info',
            message: 'Web environment detected: Offline ML Kit packs run on native Android and iOS apps.',
          });
        } else {
          setFeedback({
            type: 'success',
            message: `Found ${result.languages.length} model pack(s) stored on device.`,
          });
        }
      }
    } catch (err) {
      console.error('[OfflineManager] Failed to check models:', err);
      if (!quiet) {
        setFeedback({
          type: 'error',
          message: err.message || 'Failed to inspect downloaded models.',
        });
      }
    } finally {
      setIsChecking(false);
    }
  }, []);

  // Check models automatically when component mounts or modal opens
  useEffect(() => {
    if (isInline || isOpen) {
      handleCheckModels(true);
    }
  }, [isInline, isOpen, handleCheckModels]);

  /**
   * Handles downloading an individual language model pack.
   */
  const handleDownload = async (langCode, langName) => {
    if (!isNative) {
      setFeedback({
        type: 'info',
        message: 'Model pack downloading is enabled on native Android and iOS devices.',
      });
      return;
    }

    setActiveOperations((prev) => ({ ...prev, [langCode]: 'downloading' }));
    setFeedback({
      type: 'info',
      message: `Downloading ${langName} offline model pack (~30MB). This may take a moment...`,
    });

    try {
      await downloadModel({ language: langCode });
      setFeedback({
        type: 'success',
        message: `Successfully downloaded ${langName} offline model pack. Ready for offline use!`,
      });
      // Refresh inventory
      await handleCheckModels(true);
    } catch (err) {
      console.error(`[OfflineManager] Download failed for ${langCode}:`, err);
      setFeedback({
        type: 'error',
        message: err.message || `Failed to download ${langName} model pack.`,
      });
    } finally {
      setActiveOperations((prev) => {
        const next = { ...prev };
        delete next[langCode];
        return next;
      });
    }
  };

  /**
   * Handles deleting an individual language model pack.
   */
  const handleDelete = async (langCode, langName) => {
    if (!isNative) return;

    setActiveOperations((prev) => ({ ...prev, [langCode]: 'deleting' }));
    setFeedback({
      type: 'info',
      message: `Removing ${langName} model pack from device storage...`,
    });

    try {
      await deleteDownloadedModel({ language: langCode });
      setFeedback({
        type: 'success',
        message: `Removed ${langName} offline model pack from device.`,
      });
      // Refresh inventory
      await handleCheckModels(true);
    } catch (err) {
      console.error(`[OfflineManager] Delete failed for ${langCode}:`, err);
      setFeedback({
        type: 'error',
        message: err.message || `Failed to delete ${langName} model pack.`,
      });
    } finally {
      setActiveOperations((prev) => {
        const next = { ...prev };
        delete next[langCode];
        return next;
      });
    }
  };

  // If used as a modal and not open, render nothing
  if (!isInline && !isOpen) return null;

  const content = (
    <div className="space-y-4">
      {/* Top Description & Platform Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
        <div className="flex items-start space-x-3">
          <div className="p-2 rounded-lg bg-brand-100 text-brand-700 mt-0.5">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h4 className="text-sm font-bold text-slate-800">English ↔ Kannada Model Packs</h4>
              {isNative ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <Smartphone className="w-3 h-3 mr-1" /> Native Android / iOS
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                  <Globe className="w-3 h-3 mr-1" /> Web Browser
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {isNative
                ? 'On-device Google ML Kit models enable offline translation without internet connectivity.'
                : 'Offline ML Kit models run on Android & iOS Capacitor builds. Web connects to the FastAPI backend.'}
            </p>
          </div>
        </div>

        {/* Check Models Button */}
        <button
          type="button"
          onClick={() => handleCheckModels(false)}
          disabled={isChecking}
          className="inline-flex items-center justify-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 shadow-sm transition-all active:scale-95 disabled:opacity-50 shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin text-brand-600' : 'text-slate-500'}`} />
          <span>{isChecking ? 'Checking...' : 'Check Status'}</span>
        </button>
      </div>

      {/* Feedback / Alert Notice */}
      {feedback && (
        <div
          className={`p-3 rounded-xl text-xs flex items-start justify-between animate-fadeIn border ${
            feedback.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-indigo-50 border-indigo-200 text-indigo-800'
          }`}
        >
          <div className="flex items-center space-x-2">
            {feedback.type === 'error' ? (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            ) : feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            ) : (
              <Info className="w-4 h-4 shrink-0 text-indigo-600" />
            )}
            <span className="font-medium">{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-slate-400 hover:text-slate-600 p-0.5 ml-2"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Model Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {MANAGED_LANGUAGES.map((lang) => {
          const isDownloaded = downloadedLanguages.includes(lang.code);
          const currentOp = activeOperations[lang.code];
          const isDownloading = currentOp === 'downloading';
          const isDeleting = currentOp === 'deleting';

          return (
            <div
              key={lang.code}
              className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                isDownloaded
                  ? 'bg-emerald-50/40 border-emerald-200/90 shadow-sm'
                  : 'bg-white border-slate-200'
              }`}
            >
              <div>
                {/* Language Title & Status Badge */}
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">{lang.flag}</span>
                    <span className="font-bold text-slate-800 text-sm">{lang.name}</span>
                    <span className="text-xs text-slate-500 font-kannada font-medium">({lang.nativeName})</span>
                  </div>

                  {/* Ready / Downloaded Status Badge */}
                  {isDownloaded ? (
                    <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>Ready &bull; {lang.sizeEstimate}</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                      <span>Not Downloaded</span>
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-500 mb-4">{lang.description}</p>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-400">
                  ML Kit: <code className="text-slate-700 font-bold bg-slate-100 px-1 py-0.5 rounded">{lang.code}</code>
                </span>

                <div className="flex items-center space-x-2">
                  {isDownloaded ? (
                    <button
                      type="button"
                      onClick={() => handleDelete(lang.code, lang.name)}
                      disabled={isDeleting || isDownloading || !isNative}
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-700 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                      title="Delete model pack to free storage"
                    >
                      {isDeleting ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Deleting...</span>
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                          <span>Delete</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleDownload(lang.code, lang.name)}
                      disabled={isDownloading || isDeleting || !isNative}
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 shadow-sm transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                      title={isNative ? 'Download model pack for offline use' : 'Only available on native mobile app'}
                    >
                      {isDownloading ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Downloading...</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-3.5 h-3.5" />
                          <span>Download ({lang.sizeEstimate})</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="text-center pt-2 text-[11px] text-slate-400">
        Both English and Kannada packs must be downloaded for on-device offline translation.
      </div>
    </div>
  );

  // If inline, render inside a neat container card
  if (isInline) {
    return (
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/90 mb-6 animate-fadeIn">
        {content}
      </div>
    );
  }

  // Otherwise render as a clean modal dialog
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center space-x-2.5">
            <Smartphone className="w-5 h-5 text-brand-600" />
            <h3 className="font-bold text-slate-800 text-base">Offline Language Models</h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-semibold">
              ML Kit
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {content}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Powered by @capacitor-mlkit/translation</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
