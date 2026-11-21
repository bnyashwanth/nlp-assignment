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
      <div className="p-4 rounded-[18px] bg-[#61BB46]/10 border border-[#61BB46]/25 flex items-start space-x-3 text-[#30701F] soft-shadow">
        <CheckCircle2 className="w-5 h-5 text-[#61BB46] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="text-xs font-bold uppercase tracking-wider text-[#30701F]">
            100% Offline Ready • 0 MB Download Required
          </p>
          <p className="text-xs leading-relaxed text-[#202124]">
            LinguaBridge AI bundles a complete, self-contained 22RI52 Pure-NLP engine and parallel lexicon.
            All 5 language directions work immediately on web and Android APK without requiring Google ML Kit or Wi-Fi downloads.
          </p>
        </div>
      </div>

      {/* Language Inventory Cards */}
      <div className="space-y-2.5">
        <p className="text-xs font-bold uppercase tracking-wider text-[#858B98]">
          Embedded Language Engines (5/5 Ready)
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {SUPPORTED_OFFLINE_LANGUAGES.map((lang) => (
            <div
              key={lang.code}
              className="p-3.5 bg-white border border-[#E5E7EB] rounded-[16px] flex items-center justify-between soft-shadow"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-[#F0F2F6] flex items-center justify-center font-bold text-xs text-[#202124]">
                  {lang.iso.toUpperCase()}
                </div>
                <div>
                  <p className="text-xs font-bold text-[#202124] flex items-center gap-1.5">
                    {lang.name}
                    <span className="text-[10px] text-[#858B98] font-normal">({lang.native})</span>
                  </p>
                  <p className="text-[10px] text-[#858B98] font-mono">{lang.script} Script</p>
                </div>
              </div>

              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#61BB46]/15 text-[#30701F] border border-[#61BB46]/30">
                <CheckCircle2 className="w-3 h-3 text-[#61BB46]" />
                <span>Ready</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 22RI52 Algorithmic Pipeline Overview */}
      <div className="p-4 bg-white border border-[#E5E7EB] rounded-[18px] soft-shadow space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[#202124] flex items-center space-x-2">
          <Cpu className="w-4 h-4 text-[#E03A3E]" />
          <span>Pure-NLP Algorithms (22RI52 Lab Manual)</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-[#858B98]">
          <div className="p-2.5 bg-[#F7F8FA] rounded-[12px] border border-[#E5E7EB]/60">
            <p className="font-semibold text-[#202124]">Exp 1: Preprocessing & Stemming</p>
            <p className="text-[11px] mt-0.5">Unicode NFC, tokenization, and irregular verb morphological reduction.</p>
          </div>
          <div className="p-2.5 bg-[#F7F8FA] rounded-[12px] border border-[#E5E7EB]/60">
            <p className="font-semibold text-[#202124]">Exp 2: Greedy N-Gram Matching</p>
            <p className="text-[11px] mt-0.5">Hierarchical 4-gram &rarr; 3-gram &rarr; 2-gram &rarr; 1-gram longest-match lookup.</p>
          </div>
          <div className="p-2.5 bg-[#F7F8FA] rounded-[12px] border border-[#E5E7EB]/60">
            <p className="font-semibold text-[#202124]">Exp 3: Dynamic Programming MED</p>
            <p className="text-[11px] mt-0.5">Levenshtein distance matrix automatically corrects typing errors.</p>
          </div>
          <div className="p-2.5 bg-[#F7F8FA] rounded-[12px] border border-[#E5E7EB]/60">
            <p className="font-semibold text-[#202124]">Syntax: SVO &rarr; SOV Transformation</p>
            <p className="text-[11px] mt-0.5">Automatically converts English SVO grammar into natural Indic SOV order.</p>
          </div>
        </div>
      </div>

      {/* Offline Cache Telemetry */}
      <div className="p-4 bg-white border border-[#E5E7EB] rounded-[18px] soft-shadow flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-[12px] bg-[#009DDC]/10 flex items-center justify-center">
            <Database className="w-4 h-4 text-[#009DDC]" />
          </div>
          <div>
            <p className="text-xs font-bold text-[#202124]">Local Offline Cache</p>
            <p className="text-[11px] text-[#858B98]">
              {cacheCount} translation entries cached locally for instant zero-latency recall
            </p>
          </div>
        </div>

        {cacheCount > 0 && (
          <button
            type="button"
            onClick={handleClearCache}
            className="px-3 py-1.5 rounded-[10px] text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors flex items-center space-x-1"
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
      <div className="mb-6 p-5 bg-[#F7F8FA] rounded-[22px] border border-[#E5E7EB] soft-shadow">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#E5E7EB]">
          <div className="flex items-center space-x-2">
            <HardDrive className="w-4 h-4 text-[#61BB46]" />
            <h3 className="text-sm font-bold text-[#202124]">Built-In Pure-NLP Offline Engine</h3>
          </div>
          <span className="text-[11px] font-mono text-[#61BB46] font-bold bg-[#61BB46]/10 px-2 py-0.5 rounded-full">
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
      <div className="bg-[#F7F8FA] rounded-[24px] border border-[#E2E4E9] shadow-2xl max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-scaleUp">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-white border-b border-[#EBECEF] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-[10px] p-[2px] bg-white border border-[#E5E7EB] flex items-center justify-center overflow-hidden">
              <div className="w-full h-full rounded-[8px] apple-stripes-horizontal flex items-center justify-center">
                <HardDrive className="w-4 h-4 text-white" />
              </div>
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#202124]">
                Built-In Pure-NLP Offline Engine
              </h3>
              <p className="text-[10px] text-[#858B98]">22RI52 Preprocessing, N-Gram & Levenshtein MED</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-[#F0F2F6] text-[#858B98] hover:text-[#202124] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto">
          {content}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-white border-t border-[#EBECEF] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-[12px] text-xs font-semibold bg-[#202124] text-white hover:bg-black transition-colors"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
}
