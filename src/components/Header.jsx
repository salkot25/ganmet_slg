import React from 'react';
import {
  Zap,
  RefreshCw,
  Sun,
  Moon,
  ExternalLink,
  Loader2,
  FileSpreadsheet,
  Search,
  Layers,
  Table,
  ShieldCheck,
  Clock,
  Radio
} from 'lucide-react';
import { Button } from './common/Button';
import { formatNumber } from '../utils/formatters';
import { SPREADSHEET_CONFIG } from '../constants/appConfig';

export function Header({
  totalCount,
  isDark,
  onToggleTheme,
  onDirectSync,
  onOpenUploadExcel,
  onOpenCommandPalette,
  isSyncing,
  dataSource,
  relativeTimeStr,
  activeTab,
  onSelectTab,
  autoSyncInterval,
  onSetAutoSyncInterval,
  anomalyCount
}) {
  const tabs = [
    { id: 'overview', label: 'Ringkasan Eksekutif', icon: Zap },
    { id: 'analytics', label: 'Analitik & Wilayah', icon: Layers },
    { id: 'grid', label: 'Data Grid & Rincian', icon: Table },
    {
      id: 'audit',
      label: 'Kualitas Data',
      icon: ShieldCheck,
      badge: anomalyCount > 0 ? anomalyCount : null
    }
  ];

  return (
    <header className="flex flex-col gap-3.5 bg-surface-light dark:bg-surface-dark border border-surface-light-border dark:border-surface-dark-border rounded-16px p-4 md:px-6 md:py-4 shadow-card-light dark:shadow-card-dark backdrop-blur-md">
      {/* Top Bar: Brand, Quick Search, and Status Controls */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        {/* Brand & Identity */}
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-12px bg-gradient-to-br from-[#0B192C] to-[#005F73] border border-pln-cyan flex items-center justify-center shadow-glow-cyan flex-shrink-0">
            <Zap className="w-6 h-6 text-pln-yellow fill-pln-yellow filter drop-shadow-[0_0_4px_#FFC107]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg md:text-xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                PLN <span className="text-pln-cyan-light font-bold">METER DASHBOARD</span>
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pln-cyan/15 text-pln-cyan border border-pln-cyan/30">
                Enterprise Edition
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Sistem Analitik & Monitoring Penggantian kWh Meter Salatiga
            </p>
          </div>
        </div>

        {/* Global Quick Search Button (Ctrl+K) */}
        <button
          type="button"
          onClick={onOpenCommandPalette}
          className="w-full lg:w-72 flex items-center justify-between px-3.5 py-2 rounded-10px bg-base-light dark:bg-base-dark border border-surface-light-border dark:border-surface-dark-border hover:border-pln-cyan text-slate-400 hover:text-slate-200 transition-all text-xs group"
          title="Buka Command Palette (Ctrl+K)"
        >
          <span className="flex items-center gap-2 font-medium">
            <Search className="w-3.5 h-3.5 text-pln-cyan" />
            <span>Cari IDPEL, Nama, Menu...</span>
          </span>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-surface-light dark:bg-surface-dark border border-surface-light-border dark:border-surface-dark-border text-[10px] font-mono text-slate-500 group-hover:text-pln-cyan">
            Ctrl K
          </kbd>
        </button>

        {/* Right Action Utilities */}
        <div className="flex items-center gap-2 w-full lg:w-auto justify-between lg:justify-end flex-wrap">
          {/* Direct Spreadsheet Link Button */}
          <a
            href={SPREADSHEET_CONFIG.FULL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-8px text-xs font-semibold text-slate-700 dark:text-slate-300 bg-base-light dark:bg-base-dark border border-surface-light-border dark:border-surface-dark-border hover:border-pln-cyan/50 hover:text-pln-cyan-light transition-colors"
            title="Buka Database Google Spreadsheet"
          >
            <ExternalLink className="w-3.5 h-3.5 text-pln-cyan" />
            <span className="hidden sm:inline">Spreadsheet DB</span>
          </a>

          {/* Upload Excel Button */}
          <Button
            variant="secondary"
            size="sm"
            icon={FileSpreadsheet}
            onClick={onOpenUploadExcel}
            title="Upload file Excel dan update database Spreadsheet"
          >
            Upload Excel
          </Button>

          {/* Direct 1-Click Sync Button */}
          <Button
            variant="primary"
            size="sm"
            onClick={() => onDirectSync(false)}
            disabled={isSyncing}
            className="relative"
            title="Klik untuk langsung sinkronisasi data dari Google Spreadsheet"
          >
            {isSyncing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span className="hidden sm:inline">Menyinkronkan...</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sync Data</span>
              </>
            )}
          </Button>

          {/* Theme Toggle */}
          <Button
            variant="secondary"
            size="icon"
            onClick={onToggleTheme}
            title={isDark ? 'Ganti ke Light Mode' : 'Ganti ke Dark Mode'}
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-pln-yellow" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
          </Button>
        </div>
      </div>

      {/* Bottom Sub-Bar: Navigation Tabs + Live Status & Auto-sync */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-surface-light-border dark:border-surface-dark-border">
        {/* Navigation Tabs */}
        <div className="flex gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onSelectTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-8px text-xs font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-pln-cyan text-white shadow-sm'
                    : 'bg-base-light dark:bg-base-dark text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-surface-light-border dark:border-surface-dark-border'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500 text-black font-extrabold">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Live Sync Status & Auto-Sync Interval */}
        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
          {/* Data Count Badge */}
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-pln-cyan/10 border border-pln-cyan/30 font-semibold text-pln-cyan-light text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34D399] animate-pulse"></span>
            <span>{formatNumber(totalCount)} Data</span>
          </div>

          {/* Relative Sync Time */}
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <Clock className="w-3 h-3 text-pln-cyan" />
            <span>Sinkron: {relativeTimeStr}</span>
          </div>

          {/* Auto Sync Interval Dropdown */}
          <div className="flex items-center gap-1 text-[11px]">
            <Radio className="w-3 h-3 text-emerald-400" />
            <select
              value={autoSyncInterval}
              onChange={(e) => onSetAutoSyncInterval(Number(e.target.value))}
              className="px-2 py-0.5 rounded bg-base-light dark:bg-base-dark border border-surface-light-border dark:border-surface-dark-border font-semibold text-[10px] text-slate-700 dark:text-slate-300 focus:outline-none focus:border-pln-cyan"
              title="Interval Auto Sync Latar Belakang"
            >
              <option value="0">Auto-Sync: Mati</option>
              <option value="300000">Auto-Sync: 5 Menit</option>
              <option value="900000">Auto-Sync: 15 Menit</option>
            </select>
          </div>
        </div>
      </div>
    </header>
  );
}
