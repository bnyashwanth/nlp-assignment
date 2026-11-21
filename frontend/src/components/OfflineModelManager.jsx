/**
 * LinguaBridge AI - Pure-NLP Offline Engine & Offline Storage Status
 * =================================================================
 * Module: frontend/src/components/OfflineModelManager.jsx
 * 
 * Built-In Pure-NLP Offline Engine (Ready — 0 MB Download Required):
 * - Replaces Google ML Kit with 100% self-contained 22RI52 NLP algorithms
 * - Displays all supported languages (en, kn, hi, ta, te) ready out-of-the-box
 * - Shows cached translation count and embedded corpus statistics
 * - Zero network downloads or external native dependencies required
 */

import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  HardDrive,
  Info,
  X,
  Zap,
  Globe2,
  Cpu,
  Layers,
  Sparkles,
  Database,
  Trash2,
} from 'lucide-react';
import { SUPPORTED_OFFLINE_LANGUAGES } from '../services/offlineTranslation';
import { clearTranslationCache } from '../services/translationCache';

export default function OfflineModelManager({ isOpen, onClose, isInline = false }) {
  const [cacheCount, setCacheCount] = useState(0);

  const refreshCacheCount = () => {
    try {
      const raw = localStorage.getItem('linguabridge_translation_cache');
      if (raw) {
        const parsed = JSON.parse(raw);
        setCacheCount(Object.keys(parsed).length);
      } else {
        setCacheCount(0);
      }
    } catch {
      setCacheCount(0);
    }
  };

  useEffect(() => {
    refreshCacheCount();
  }, [isOpen]);

  const handleClearCache = () => {
    clearTranslationCache();
    setCacheCount(0);
  };

  if (!isInline && !isOpen) return null;

  const content = (
    <div className="space-y-5">
      
      {/* Banner: 0 MB Download Required Reassurance */}
      <div className="p-4 rounded-[18px] bg-[#F0FDFA] border border-[#0F766E]/20 flex items-start space-x-3 text-[#0F766E] soft-shadow">
        <CheckCircle2 className="w-5 h-5 text-[#0F766E] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="text-xs font-bold uppercase tracking-wider text-[#0F766E]">
            100% Offline Ready • 0 MB Download Required
          </p>
          <p className="text-xs leading-relaxed text-[#1D1D1F]">
            LinguaBridge AI bundles a complete, self-contained 22RI52 Pure-NLP engine and parallel lexicon.
            All 5 language directions work immediately on web and Android APK without requiring Google ML Kit or Wi-Fi downloads.
          </p>
        </div>
      </div>

      {/* Language Inventory Cards */}
      <div className="space-y-2.5">
        <p className="text-xs font-bold uppercase tracking-wider text-[#6E6E73]">
          Embedded Language Engines (5/5 Ready)
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {SUPPORTED_OFFLINE_LANGUAGES.map((lang) => (
            <div
              key={lang.code}
              className="p-3.5 bg-white border border-[#E5E5EA] rounded-[16px] flex items-center justify-between soft-shadow"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-[#F5F5F7] flex items-center justify-center font-bold text-xs text-[#1D1D1F]">
                  {lang.iso.toUpperCase()}
                </div>
                <div>
                  <p className="text-xs font-bold text-[#1D1D1F] flex items-center gap-1.5">
                    {lang.name}
                    <span className="text-[10px] text-[#6E6E73] font-normal">({lang.native})</span>
                  </p>
                  <p className="text-[10px] text-[#6E6E73] font-mono">{lang.script} Script</p>
                </div>
              </div>

              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#F0FDFA] text-[#0F766E] border border-[#0F766E]/20">
                <CheckCircle2 className="w-3 h-3 text-[#0F766E]" />
                <span>Ready</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 22RI52 Algorithmic Pipeline Overview */}
      <div className="p-4 bg-white border border-[#E5E5EA] rounded-[18px] soft-shadow space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[#1D1D1F] flex items-center space-x-2">
          <Cpu className="w-4 h-4 text-[#0F766E]" />
          <span>Pure-NLP Algorithms (22RI52 Lab Manual)</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-[#6E6E73]">
          <div className="p-2.5 bg-[#F5F5F7] rounded-[12px] border border-[#E5E5EA]">
            <p className="font-semibold text-[#1D1D1F]">Exp 1: Preprocessing & Stemming</p>
            <p className="text-[11px] mt-0.5">Unicode NFC, tokenization, and irregular verb morphological reduction.</p>
          </div>
          <div className="p-2.5 bg-[#F5F5F7] rounded-[12px] border border-[#E5E5EA]">
            <p className="font-semibold text-[#1D1D1F]">Exp 2: Greedy N-Gram Matching</p>
            <p className="text-[11px] mt-0.5">Hierarchical 4-gram &rarr; 3-gram &rarr; 2-gram &rarr; 1-gram longest-match lookup.</p>
          </div>
          <div className="p-2.5 bg-[#F5F5F7] rounded-[12px] border border-[#E5E5EA]">
            <p className="font-semibold text-[#1D1D1F]">Exp 3: Dynamic Programming MED</p>
            <p className="text-[11px] mt-0.5">Levenshtein distance matrix automatically corrects typing errors.</p>
          </div>
          <div className="p-2.5 bg-[#F5F5F7] rounded-[12px] border border-[#E5E5EA]">
            <p className="font-semibold text-[#1D1D1F]">Syntax: SVO &rarr; SOV Transformation</p>
            <p className="text-[11px] mt-0.5">Automatically converts English SVO grammar into natural Indic SOV order.</p>
          </div>
        </div>
      </div>

      {/* Offline Cache Telemetry */}
      <div className="p-4 bg-white border border-[#E5E5EA] rounded-[18px] soft-shadow flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-[12px] bg-[#F5F5F7] flex items-center justify-center">
            <Database className="w-4 h-4 text-[#1D1D1F]" />
          </div>
          <div>
            <p className="text-xs font-bold text-[#1D1D1F]">Local Offline Cache</p>
            <p className="text-[11px] text-[#6E6E73]">
              {cacheCount} translation entries cached locally for instant zero-latency recall
            </p>
          </div>
        </div>

        {cacheCount > 0 && (
          <button
            type="button"
            onClick={handleClearCache}
            className="px-3 py-1.5 rounded-[10px] text-xs font-semibold text-[#1D1D1F] hover:bg-[#F5F5F7] border border-[#E5E5EA] transition-colors flex items-center space-x-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        )}
      </div>

    </div>
  );

  // If inline rendering:
  if (isInline) {
    return (
      <div className="mb-6 p-5 bg-[#F5F5F7] rounded-[22px] border border-[#E5E5EA] soft-shadow">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#E5E5EA]">
          <div className="flex items-center space-x-2">
            <HardDrive className="w-4 h-4 text-[#0F766E]" />
            <h3 className="text-sm font-bold text-[#1D1D1F]">Built-In Pure-NLP Offline Engine</h3>
          </div>
          <span className="text-[11px] font-mono text-[#0F766E] font-bold bg-[#F0FDFA] border border-[#0F766E]/20 px-2 py-0.5 rounded-full">
            0 MB Download
          </span>
        </div>
        {content}
      </div>
    );
  }

  // Modal Dialog Rendering:
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="bg-[#F5F5F7] rounded-[24px] border border-[#E5E5EA] shadow-2xl max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-scaleUp">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-white border-b border-[#E5E5EA] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-[10px] bg-[#1D1D1F] flex items-center justify-center">
              <HardDrive className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#1D1D1F]">
                Built-In Pure-NLP Offline Engine
              </h3>
              <p className="text-[10px] text-[#6E6E73]">22RI52 Preprocessing, N-Gram & Levenshtein MED</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-[#F5F5F7] text-[#6E6E73] hover:text-[#1D1D1F] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto">
          {content}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-white border-t border-[#E5E5EA] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-[12px] text-xs font-semibold bg-[#1D1D1F] text-white hover:bg-black transition-colors"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
}
