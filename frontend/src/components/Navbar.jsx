/**
 * LinguaBridge AI - Navbar Component
 * ===================================
 * Module: frontend/src/components/Navbar.jsx
 * 
 * Header navigation featuring:
 * - Real-time network connectivity indicator (Online / Offline status pill)
 * - Offline Models modal launcher
 * - Translation History drawer trigger with badge count
 * - SacreBLEU / chrF Benchmark Metrics modal trigger
 */

import React from 'react';
import {
  BarChart3,
  History,
  HardDrive,
  Wifi,
  WifiOff,
  Smartphone,
} from 'lucide-react';

export default function Navbar({
  onOpenMetrics,
  onOpenHistory,
  onOpenOfflineModels,
  historyCount = 0,
  isConnected = true,
  isNative = false,
}) {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo & Description */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white text-xl shadow-md shadow-brand-500/20">
            🌉
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">LinguaBridge AI</h1>
              
              {/* Network Status Badge */}
              {isConnected ? (
                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200" title="Connected to network">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="hidden sm:inline">Online</span>
                </span>
              ) : (
                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300" title="Device is offline">
                  <WifiOff className="w-3 h-3 text-amber-600" />
                  <span>Offline</span>
                </span>
              )}

              {/* Native Platform Tag */}
              {isNative && (
                <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-100 text-indigo-800">
                  <Smartphone className="w-3 h-3 mr-1" /> Mobile
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              English ↔ Kannada Neural Machine Translation (NLLB + LoRA / ML Kit)
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          
          {/* Offline Models Manager Trigger */}
          <button
            type="button"
            onClick={onOpenOfflineModels}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500/40"
            title="Manage offline ML Kit language models"
          >
            <HardDrive className="w-4 h-4 text-slate-600" />
            <span className="hidden sm:inline">Offline Models</span>
          </button>

          {/* History Button */}
          <button
            type="button"
            onClick={onOpenHistory}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500/40"
            title="View translation history"
          >
            <History className="w-4 h-4 text-slate-500" />
            <span className="hidden sm:inline">History</span>
            {historyCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-slate-300 text-slate-800">
                {historyCount}
              </span>
            )}
          </button>

          {/* Benchmark Metrics Button */}
          <button
            type="button"
            onClick={onOpenMetrics}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500/40"
            title="View SacreBLEU and chrF benchmark metrics"
          >
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">Metrics</span>
          </button>
        </div>

      </div>
    </header>
  );
}
