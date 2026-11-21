/**
 * LinguaBridge AI - Sidebar Component (3-Color Professional Palette)
 * ===================================================================
 * Module: frontend/src/components/Sidebar.jsx
 * 
 * Strict 3-Color System:
 * - Surface: White (#FFFFFF) & Soft Off-White (#F5F5F7)
 * - Primary Ink: Deep Charcoal (#1D1D1F), Secondary: Muted Gray (#6E6E73)
 * - Single Accent: Deep Teal (#0F766E)
 */

import React from 'react';
import {
  Languages as TranslateIcon,
  Clock,
  Globe2,
  Bookmark,
  Settings,
  HardDrive,
  BarChart3,
} from 'lucide-react';

export default function Sidebar({
  activeTab,
  onSelectTab,
  isConnected,
  isNative,
  historyCount = 0,
  savedCount = 0,
  onOpenMetrics,
  onOpenOfflineModels,
}) {
  const navItems = [
    {
      id: 'translate',
      label: 'Translate',
      icon: TranslateIcon,
      badge: null,
    },
    {
      id: 'history',
      label: 'History',
      icon: Clock,
      badge: historyCount > 0 ? historyCount : null,
    },
    {
      id: 'languages',
      label: 'Languages',
      icon: Globe2,
      badge: '5',
    },
    {
      id: 'saved',
      label: 'Saved',
      icon: Bookmark,
      badge: savedCount > 0 ? savedCount : null,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      badge: null,
    },
  ];

  return (
    <>
      {/* 1. DESKTOP SIDEBAR */}
      <aside className="hidden lg:flex w-[260px] bg-white border-r border-[#E5E5EA] flex-col justify-between p-6 shrink-0 select-none">
        <div>
          {/* Brand Header with Monochrome Icon */}
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-9 h-9 rounded-[10px] bg-[#1D1D1F] flex items-center justify-center text-white shadow-xs shrink-0">
              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z" />
              </svg>
            </div>
            <div className="min-w-0">
              <h1 className="text-sm font-bold tracking-tight text-[#1D1D1F] truncate">
                LinguaBridge AI
              </h1>
              <p className="text-[11px] font-medium text-[#6E6E73] truncate">
                22RI52 Pure-NLP
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-[12px] text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-[#F5F5F7] text-[#1D1D1F] shadow-xs'
                      : 'text-[#6E6E73] hover:text-[#1D1D1F] hover:bg-[#FAFAFC]'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon
                      className={`w-4 h-4 transition-colors ${
                        isActive ? 'text-[#0F766E]' : 'text-[#6E6E73]'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                        isActive
                          ? 'bg-white text-[#1D1D1F] border border-[#E5E5EA]'
                          : 'bg-[#F5F5F7] text-[#6E6E73]'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Quick Utility Actions */}
          <div className="mt-8 pt-5 border-t border-[#E5E5EA] space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#6E6E73] px-3.5 mb-2">
              Tools & Benchmarks
            </p>

            <button
              type="button"
              onClick={onOpenMetrics}
              className="w-full flex items-center justify-between px-3.5 py-2 rounded-[10px] text-xs font-semibold text-[#6E6E73] hover:text-[#1D1D1F] hover:bg-[#F5F5F7] transition-colors"
            >
              <div className="flex items-center space-x-2.5">
                <BarChart3 className="w-4 h-4 text-[#0F766E]" />
                <span>SacreBLEU</span>
              </div>
              <span className="text-[10px] font-mono text-[#0F766E] font-bold bg-[#F0FDFA] px-1.5 py-0.5 rounded border border-[#0F766E]/20">
                29.35
              </span>
            </button>

            <button
              type="button"
              onClick={onOpenOfflineModels}
              className="w-full flex items-center justify-between px-3.5 py-2 rounded-[10px] text-xs font-semibold text-[#6E6E73] hover:text-[#1D1D1F] hover:bg-[#F5F5F7] transition-colors"
            >
              <div className="flex items-center space-x-2.5">
                <HardDrive className="w-4 h-4 text-[#1D1D1F]" />
                <span>Offline Engine</span>
              </div>
              <span className="text-[10px] text-[#6E6E73] font-medium bg-[#F5F5F7] px-1.5 py-0.5 rounded">
                0 MB
              </span>
            </button>
          </div>
        </div>

        {/* User Profile Footer */}
        <div className="pt-4 mt-6 border-t border-[#E5E5EA] flex items-center justify-between">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-8 h-8 rounded-full bg-[#1D1D1F] text-white flex items-center justify-center font-bold text-xs shrink-0">
              BY
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-[#1D1D1F] truncate">B N Yashwanth</p>
              <p className="text-[10px] text-[#6E6E73] truncate">22RI52 • Pure-NLP</p>
            </div>
          </div>

          <div
            className={`w-2 h-2 rounded-full shrink-0 ${
              isConnected ? 'bg-[#0F766E]' : 'bg-[#6E6E73]'
            }`}
            title={isConnected ? 'Backend Active' : 'Offline Pure-NLP Active'}
          />
        </div>
      </aside>

      {/* 2. MOBILE HEADER & HORIZONTAL TABS */}
      <header className="flex lg:hidden flex-col bg-white border-b border-[#E5E5EA] p-4 select-none shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-[10px] bg-[#1D1D1F] flex items-center justify-center text-white">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z" />
              </svg>
            </div>
            <div>
              <h1 className="text-sm font-bold text-[#1D1D1F]">LinguaBridge AI</h1>
              <p className="text-[10px] text-[#6E6E73]">22RI52 Pure-NLP</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onOpenMetrics}
              className="text-xs font-semibold px-2.5 py-1 bg-[#F5F5F7] text-[#1D1D1F] rounded-lg"
            >
              Metrics
            </button>
            <div
              className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-[#0F766E]' : 'bg-[#6E6E73]'
              }`}
            />
          </div>
        </div>

        {/* Scrollable Mobile Nav Tabs */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-[10px] text-xs font-semibold shrink-0 transition-all ${
                  isActive
                    ? 'bg-[#1D1D1F] text-white shadow-xs'
                    : 'bg-[#F5F5F7] text-[#6E6E73] hover:text-[#1D1D1F]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
                {item.badge && (
                  <span className={`text-[9px] px-1.5 py-0.2 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-white text-[#6E6E73]'}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </header>
    </>
  );
}
