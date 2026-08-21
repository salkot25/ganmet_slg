import React from 'react';
import { Zap, RefreshCw, Sun, Moon, Link2, ExternalLink, Loader2, FileSpreadsheet } from 'lucide-react';
import { Button } from './common/Button';
import { formatNumber } from '../utils/formatters';
import { SPREADSHEET_CONFIG } from '../constants/appConfig';

export function Header({
  totalCount,
  isDark,
  onToggleTheme,
  onDirectSync,
  onOpenUploadExcel,
  isSyncing,
  dataSource
}) {
  return (
    <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 md:px-6 md:py-4 bg-surface-light dark:bg-surface-dark border border-surface-light-border dark:border-surface-dark-border rounded-16px shadow-card-light dark:shadow-card-dark backdrop-blur-md">
      {/* Brand & Logo */}
      <div className="flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-12px bg-gradient-to-br from-[#0B192C] to-[#005F73] border border-pln-cyan flex items-center justify-center shadow-glow-cyan">
          <Zap className="w-6 h-6 text-pln-yellow fill-pln-yellow filter drop-shadow-[0_0_4px_#FFC107]" />
        </div>
        <div>
          <h1 className="text-lg md:text-xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            PLN <span className="text-pln-cyan-light font-bold">METER DASHBOARD</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Sistem Monitoring & Analitik Penggantian kWh Meter
          </p>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5 w-full md:w-auto justify-between md:justify-end flex-wrap">
        {/* Direct Spreadsheet Link Button */}
        <a
          href={SPREADSHEET_CONFIG.FULL_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-8px text-xs font-semibold text-slate-700 dark:text-slate-300 bg-surface-light dark:bg-surface-dark border border-surface-light-border dark:border-surface-dark-border hover:border-pln-cyan/50 hover:text-pln-cyan-light transition-colors"
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

        {/* Data Status Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-pln-cyan/10 border border-pln-cyan/30 text-xs font-semibold text-pln-cyan-light">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34D399] animate-pulse"></span>
          <span>{formatNumber(totalCount)} Data</span>
          {dataSource === 'apps_script' && (
            <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold ml-1 pl-1.5 border-l border-pln-cyan/30">
              <Link2 className="w-3 h-3" /> Live Apps Script
            </span>
          )}
        </div>

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
              <span>Menyinkronkan...</span>
            </>
          ) : (
            <>
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Sync Data</span>
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
    </header>
  );
}
