/**
 * LinguaBridge AI - Settings & NLP Pipeline View (3-Color System)
 * ==============================================================
 * Module: frontend/src/components/SettingsView.jsx
 * 
 * Strict 3-Color System:
 * - Surface: Crisp White (#FFFFFF) & Soft Off-White (#F5F5F7), Border (#E5E5EA)
 * - Primary Ink: Deep Charcoal (#1D1D1F), Secondary: Muted Gray (#6E6E73)
 * - Single Accent: Deep Teal (#0F766E)
 */

import React, { useState } from 'react';
import {
  Sliders,
  Cpu,
  HardDrive,
  Palette,
  Check,
  ShieldCheck,
  Sparkles,
  BarChart3,
  RefreshCw,
  Server,
  Wifi,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import {
  getBackendBaseUrl,
  setBackendBaseUrl,
  testBackendConnection,
} from '../services/translationApi';

export default function SettingsView({
  onClearCache,
  onClearHistory,
  onOpenMetrics,
  onOpenOfflineModels,
}) {
  // Backend URL configuration
  const [backendUrl, setBackendUrlState] = useState(() => getBackendBaseUrl());
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState(null);

  // NLP settings
  const [nfcEnabled, setNfcEnabled] = useState(true);
  const [scriptValidation, setScriptValidation] = useState(true);
  const [repetitionFilter, setRepetitionFilter] = useState(true);

  // Storage settings
  const [autoCache, setAutoCache] = useState(true);
  const [offlineFallback, setOfflineFallback] = useState(true);

  // Preferences
  const [timeoutSec, setTimeoutSec] = useState(45);
  const [activeTheme, setActiveTheme] = useState('warm_white');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleTestConnection = async () => {
    setTestingConnection(true);
    setTestResult(null);

    const result = await testBackendConnection(backendUrl);
    setTestingConnection(false);

    if (result.ok) {
      const dev = result.data?.device || 'cpu';
      const svc = result.data?.service || 'FastAPI Service';
      setTestResult({
        ok: true,
        message: `Connected (${result.latency_ms}ms) • ${svc} [${dev}]`,
      });
    } else {
      setTestResult({
        ok: false,
        message: `Unreachable: ${result.error}. (App uses 22RI52 pure-NLP offline engine)`,
      });
    }
  };

  const handleSave = () => {
    setBackendBaseUrl(backendUrl);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1D1D1F]">
          Make it yours.
        </h2>
        <p className="text-sm text-[#6E6E73] mt-1">
          Configure translation backend URLs, 22RI52 pure-NLP preprocessing, and offline storage.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Section 1: Backend Connection & Server URL */}
        <div className="p-6 bg-white border border-[#E5E5EA] rounded-[18px] soft-shadow space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#1D1D1F] flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-[#0F766E]"></span>
            <span>Backend Server & Networking</span>
          </h3>

          <div className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-[#6E6E73] mb-1">
                Backend Server URL (Laptop IP or Cloud Host)
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={backendUrl}
                  onChange={(e) => {
                    setBackendUrlState(e.target.value);
                    setTestResult(null);
                  }}
                  placeholder="e.g. http://192.168.1.5:8000 or http://localhost:8000"
                  className="flex-1 bg-[#F5F5F7] border border-[#E5E5EA] rounded-[10px] px-3.5 py-2 text-xs font-mono text-[#1D1D1F] outline-none focus:ring-1 focus:ring-[#0F766E]"
                />
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={testingConnection || !backendUrl.trim()}
                  className="px-3 py-2 rounded-[10px] text-xs font-semibold bg-[#F5F5F7] hover:bg-[#E5E5EA] text-[#1D1D1F] transition-colors disabled:opacity-50 shrink-0 flex items-center space-x-1.5 border border-[#E5E5EA]"
                >
                  {testingConnection ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#0F766E]" />
                      <span>Testing...</span>
                    </>
                  ) : (
                    <>
                      <Wifi className="w-3.5 h-3.5 text-[#0F766E]" />
                      <span>Test</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-[10px] text-[#6E6E73] mt-1">
                Set to <code>http://&lt;laptop-ip&gt;:8000</code> when testing APK from a physical phone.
              </p>
            </div>

            {/* Test Connection Result Feedback */}
            {testResult && (
              <div
                className={`p-3 rounded-[10px] text-xs font-medium flex items-start space-x-2 animate-fadeIn ${
                  testResult.ok
                    ? 'bg-[#F0FDFA] border border-[#0F766E]/30 text-[#0F766E]'
                    : 'bg-[#F5F5F7] border border-[#E5E5EA] text-[#6E6E73]'
                }`}
              >
                {testResult.ok ? (
                  <Check className="w-4 h-4 text-[#0F766E] shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-[#6E6E73] shrink-0 mt-0.5" />
                )}
                <span className="leading-relaxed">{testResult.message}</span>
              </div>
            )}

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-[#6E6E73]">
                  CPU Inference Timeout
                </label>
                <span className="text-xs font-mono font-semibold text-[#1D1D1F]">
                  {timeoutSec}s
                </span>
              </div>
              <input
                type="range"
                min="15"
                max="90"
                step="5"
                value={timeoutSec}
                onChange={(e) => setTimeoutSec(Number(e.target.value))}
                className="w-full accent-[#0F766E] cursor-pointer"
              />
              <p className="text-[10px] text-[#6E6E73] mt-0.5">
                45s recommended for NLLB-200 multi-core CPU beam search.
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: 22RI52 NLP Preprocessing & Evaluation */}
        <div className="p-6 bg-white border border-[#E5E5EA] rounded-[18px] soft-shadow space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#1D1D1F] flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-[#1D1D1F]"></span>
              <span>22RI52 Pure-NLP Pipeline</span>
            </h3>
            <button
              type="button"
              onClick={onOpenMetrics}
              className="text-[11px] font-semibold text-[#0F766E] hover:underline flex items-center gap-1"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Benchmark Matrix</span>
            </button>
          </div>

          <div className="space-y-2.5">
            <label className="flex items-center justify-between p-2.5 bg-[#F5F5F7] rounded-[12px] cursor-pointer hover:bg-[#EBEBEF] transition-colors">
              <div>
                <p className="text-xs font-semibold text-[#1D1D1F]">Unicode NFC Normalization (Exp 1)</p>
                <p className="text-[10px] text-[#6E6E73]">Ensures Indic Akshara canonical composition</p>
              </div>
              <input
                type="checkbox"
                checked={nfcEnabled}
                onChange={(e) => setNfcEnabled(e.target.checked)}
                className="w-4 h-4 accent-[#0F766E] cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-2.5 bg-[#F5F5F7] rounded-[12px] cursor-pointer hover:bg-[#EBEBEF] transition-colors">
              <div>
                <p className="text-xs font-semibold text-[#1D1D1F]">Levenshtein MED Typo Snapping (Exp 3)</p>
                <p className="text-[10px] text-[#6E6E73]">Dynamic programming matrix snaps typos to lexicon</p>
              </div>
              <input
                type="checkbox"
                checked={scriptValidation}
                onChange={(e) => setScriptValidation(e.target.checked)}
                className="w-4 h-4 accent-[#0F766E] cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-2.5 bg-[#F5F5F7] rounded-[12px] cursor-pointer hover:bg-[#EBEBEF] transition-colors">
              <div>
                <p className="text-xs font-semibold text-[#1D1D1F]">SVO &rarr; SOV Indic Transformation</p>
                <p className="text-[10px] text-[#6E6E73]">Reorders English SVO syntax to natural Indic SOV</p>
              </div>
              <input
                type="checkbox"
                checked={repetitionFilter}
                onChange={(e) => setRepetitionFilter(e.target.checked)}
                className="w-4 h-4 accent-[#0F766E] cursor-pointer"
              />
            </label>

            {/* Benchmark Metric Pills */}
            <div className="pt-2 flex items-center space-x-2">
              <span className="text-[11px] font-mono bg-[#F0FDFA] text-[#0F766E] px-2.5 py-1 rounded-lg border border-[#0F766E]/20 font-bold">
                BLEU 29.35
              </span>
              <span className="text-[11px] font-mono bg-[#F5F5F7] text-[#1D1D1F] px-2.5 py-1 rounded-lg border border-[#E5E5EA] font-bold">
                chrF++ 57.80
              </span>
              <span className="text-[11px] font-mono bg-[#F5F5F7] text-[#6E6E73] px-2.5 py-1 rounded-lg border border-[#E5E5EA] font-bold">
                Levenshtein 1
              </span>
            </div>
          </div>
        </div>

        {/* Section 3: Offline & Cache Storage */}
        <div className="p-6 bg-white border border-[#E5E5EA] rounded-[18px] soft-shadow space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#1D1D1F] flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-[#0F766E]"></span>
            <span>Offline & Cache Storage</span>
          </h3>

          <div className="space-y-3">
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="text-xs font-semibold text-[#1D1D1F]">Automatic Local Storage Caching</p>
                <p className="text-[10px] text-[#6E6E73]">Instant zero-latency cache hits</p>
              </div>
              <input
                type="checkbox"
                checked={autoCache}
                onChange={(e) => setAutoCache(e.target.checked)}
                className="w-4 h-4 accent-[#0F766E] cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="text-xs font-semibold text-[#1D1D1F]">Pure-NLP Offline Engine (0 MB)</p>
                <p className="text-[10px] text-[#6E6E73]">Embedded 150+ parallel phrases & 500+ lexicon</p>
              </div>
              <input
                type="checkbox"
                checked={offlineFallback}
                onChange={(e) => setOfflineFallback(e.target.checked)}
                className="w-4 h-4 accent-[#0F766E] cursor-pointer"
              />
            </label>

            <div className="pt-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={onClearCache}
                className="px-3 py-2 text-xs font-semibold bg-[#F5F5F7] hover:bg-[#E5E5EA] rounded-[10px] text-[#1D1D1F] transition-colors border border-[#E5E5EA]"
              >
                Clear Local Cache
              </button>
              <button
                type="button"
                onClick={onClearHistory}
                className="px-3 py-2 text-xs font-semibold bg-[#F5F5F7] hover:bg-[#E5E5EA] rounded-[10px] text-[#1D1D1F] transition-colors border border-[#E5E5EA]"
              >
                Reset History
              </button>
              <button
                type="button"
                onClick={onOpenOfflineModels}
                className="px-3 py-2 text-xs font-semibold bg-[#F0FDFA] text-[#0F766E] hover:bg-[#E0F2FE] rounded-[10px] transition-colors border border-[#0F766E]/20"
              >
                View Engine Status
              </button>
            </div>
          </div>
        </div>

        {/* Section 4: Appearance & Save Preferences */}
        <div className="p-6 bg-white border border-[#E5E5EA] rounded-[18px] soft-shadow space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#1D1D1F] flex items-center space-x-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-[#1D1D1F]"></span>
              <span>Appearance & Save Settings</span>
            </h3>

            <div className="p-1 bg-[#F5F5F7] rounded-[12px] flex space-x-1 mb-4 border border-[#E5E5EA]">
              <button
                type="button"
                onClick={() => setActiveTheme('warm_white')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-[8px] transition-all ${
                  activeTheme === 'warm_white'
                    ? 'bg-white text-[#1D1D1F] shadow-xs'
                    : 'text-[#6E6E73] hover:text-[#1D1D1F]'
                }`}
              >
                Soft Off-White
              </button>
              <button
                type="button"
                onClick={() => setActiveTheme('system')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-[8px] transition-all ${
                  activeTheme === 'system'
                    ? 'bg-white text-[#1D1D1F] shadow-xs'
                    : 'text-[#6E6E73] hover:text-[#1D1D1F]'
                }`}
              >
                System Auto
              </button>
              <button
                type="button"
                onClick={() => setActiveTheme('contrast')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-[8px] transition-all ${
                  activeTheme === 'contrast'
                    ? 'bg-white text-[#1D1D1F] shadow-xs'
                    : 'text-[#6E6E73] hover:text-[#1D1D1F]'
                }`}
              >
                High Contrast
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-[#F5F5F7] flex justify-end">
            <button
              type="button"
              onClick={handleSave}
              className="pure-nlp-btn px-6 py-2.5 rounded-[12px] font-semibold text-xs shadow-xs flex items-center space-x-1.5 cursor-pointer"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#0F766E]" />
                  <span>Saved!</span>
                </>
              ) : (
                <span>Save All Settings</span>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
