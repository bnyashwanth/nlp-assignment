/**
 * LinguaBridge AI - Responsive Sidebar & Navigation Component
 * ============================================================
 * Module: frontend/src/components/Sidebar.jsx
 * 
 * Features:
 * - Desktop: Sleek 270px vertical sidebar with Apple 6-band logo and profile footer
 * - Mobile / Capacitor: Compact responsive top header with horizontal tab navigation
 * - Real-time backend connectivity status indicator
 * - Tools & Telemetry quick triggers (MetricsModal, OfflineModelManager)
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
  Wifi,
  WifiOff,
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
      color: '#E03A3E',
      badge: null,
    },
    {
      id: 'history',
      label: 'History',
      icon: Clock,
      color: '#F5821F',
      badge: historyCount > 0 ? historyCount : null,
    },
    {
      id: 'languages',
      label: 'Languages',
      icon: Globe2,
      color: '#009DDC',
      badge: '5',
    },
    {
      id: 'saved',
      label: 'Saved',
      icon: Bookmark,
      color: '#FDB827',
      badge: savedCount > 0 ? savedCount : null,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      color: '#963D97',
      badge: null,
    },
  ];

  return (
    <>
      {/* =================================================================== */}
      {/* 1. DESKTOP SIDEBAR (Visible on lg and larger screens)                */}
      {/* =================================================================== */}
      <aside className="hidden lg:flex w-[270px] bg-white border-r border-[#EBECEF] flex-col justify-between p-6 shrink-0 select-none">
        <div>
          {/* Brand Header with 6-Band Apple Palette Mark */}
          <div className="flex items-center space-x-3.5 mb-8">
            <div className="w-10 h-10 rounded-[12px] p-[2px] shadow-xs bg-white border border-[#E5E7EB] flex items-center justify-center overflow-hidden shrink-0">
              <div className="w-full h-full rounded-[10px] apple-stripes-horizontal flex items-center justify-center">
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z" />
                </svg>
              </div>
            </div>
            <div className="min-w-0">
              <h1 className="text-base font-bold tracking-tight text-[#202124] flex items-center gap-1.5 truncate">
                LinguaBridge AI
              </h1>
              <p className="text-[11px] font-medium text-[#858B98] truncate">
                22RI52 NLLB + LoRA
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
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-[14px] text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-[#F0F2F6] text-[#202124] shadow-xs'
                      : 'text-[#858B98] hover:text-[#202124] hover:bg-[#F7F8FA]'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon
                      className="w-4 h-4 transition-colors"
                      style={{ color: isActive ? item.color : '#858B98' }}
                    />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                        isActive
                          ? 'bg-white text-[#202124] border border-[#E5E7EB]'
                          : 'bg-[#F0F2F6] text-[#858B98]'
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
          <div className="mt-8 pt-5 border-t border-[#F0F2F6] space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#858B98] px-3.5 mb-2">
              Tools & Benchmarks
            </p>

            <button
              type="button"
              onClick={onOpenMetrics}
              className="w-full flex items-center justify-between px-3.5 py-2 rounded-[12px] text-xs font-semibold text-[#858B98] hover:text-[#202124] hover:bg-[#F7F8FA] transition-colors"
            >
              <div className="flex items-center space-x-2.5">
                <BarChart3 className="w-4 h-4 text-[#009DDC]" />
                <span>SacreBLEU Metrics</span>
              </div>
              <span className="text-[10px] font-mono text-[#61BB46] font-bold bg-[#61BB46]/10 px-1.5 py-0.5 rounded">
                29.35
              </span>
            </button>

            <button
              type="button"
              onClick={onOpenOfflineModels}
              className="w-full flex items-center justify-between px-3.5 py-2 rounded-[12px] text-xs font-semibold text-[#858B98] hover:text-[#202124] hover:bg-[#F7F8FA] transition-colors"
            >
              <div className="flex items-center space-x-2.5">
                <HardDrive className="w-4 h-4 text-[#61BB46]" />
                <span>Offline Engine</span>
              </div>
              <span className="text-[10px] text-[#30701F] font-semibold bg-[#61BB46]/15 px-1.5 py-0.5 rounded">
                0 MB
              </span>
            </button>
          </div>
        </div>

        {/* User Profile Footer */}
        <div className="pt-4 mt-6 border-t border-[#EBECEF] flex items-center justify-between">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#963D97] to-[#E03A3E] text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
              BY
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-[#202124] truncate">B N Yashwanth</p>
              <p className="text-[11px] text-[#858B98] truncate">22RI52 • CPU Local</p>
            </div>
          </div>

          <div
            className={`w-2.5 h-2.5 rounded-full shrink-0 ${
              isConnected ? 'bg-[#61BB46]' : 'bg-[#FDB827]'
            }`}
            title={
              isConnected
                ? 'FastAPI Backend Online'
                : isNative
                ? 'Offline (ML Kit Active)'
                : 'Offline (Local Fallback)'
            }
          />
        </div>
      </aside>

      {/* =================================================================== */}
      {/* 2. MOBILE HEADER & HORIZONTAL TABS (Visible below lg)               */}
      {/* =================================================================== */}
      <header className="flex lg:hidden flex-col bg-white border-b border-[#EBECEF] p-4 select-none shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-[10px] p-[2px] shadow-xs bg-white border border-[#E5E7EB] flex items-center justify-center overflow-hidden">
              <div className="w-full h-full rounded-[8px] apple-stripes-horizontal flex items-center justify-center">
                <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z" />
                </svg>
              </div>
            </div>
            <div>
              <h1 className="text-sm font-bold text-[#202124]">LinguaBridge AI</h1>
              <p className="text-[10px] text-[#858B98]">22RI52 NLLB + LoRA</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onOpenMetrics}
              className="text-xs font-semibold px-2.5 py-1 bg-[#F0F2F6] hover:bg-[#E5E7EB] text-[#202124] rounded-lg transition-colors"
            >
              Metrics
            </button>
            <div
              className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-[#61BB46]' : 'bg-[#FDB827]'
              }`}
              title={isConnected ? 'Online' : 'Offline'}
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
                    ? 'bg-[#202124] text-white shadow-xs'
                    : 'bg-[#F0F2F6] text-[#858B98] hover:text-[#202124]'
                }`}
              >
                <Icon
                  className="w-3.5 h-3.5"
                  style={{ color: isActive ? '#FFFFFF' : item.color }}
                />
                <span>{item.label}</span>
                {item.badge && (
                  <span className={`text-[9px] px-1.5 py-0.2 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-white text-[#858B98]'}`}>
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
