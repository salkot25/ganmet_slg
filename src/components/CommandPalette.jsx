import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search,
  Zap,
  Building2,
  Calendar,
  Layers,
  RotateCcw,
  RefreshCw,
  FileSpreadsheet,
  Download,
  Moon,
  Sun,
  X,
  ArrowRight,
  ShieldCheck,
  User,
  Hash
} from 'lucide-react';

export function CommandPalette({
  isOpen,
  onClose,
  rawData,
  onSelectRecord,
  activeTab,
  onSelectTab,
  onUpdateFilter,
  onDirectSync,
  onOpenUploadExcel,
  isDark,
  onToggleTheme,
  unitupOptions
}) {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Global Keyboard shortcut listener (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Open handled by parent or state
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Fast search across records
  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q || q.length < 2) return [];

    const matches = [];
    for (let i = 0; i < rawData.length && matches.length < 8; i++) {
      const row = rawData[i];
      if (
        String(row.IDPEL || '').toLowerCase().includes(q) ||
        String(row.NAMA || '').toLowerCase().includes(q) ||
        String(row.NO_METER_BARU || '').toLowerCase().includes(q) ||
        String(row.NO_METER_LAMA || '').toLowerCase().includes(q)
      ) {
        matches.push(row);
      }
    }
    return matches;
  }, [query, rawData]);

  // Quick Navigation & Actions list
  const quickActions = [
    {
      id: 'tab_overview',
      label: 'Ke Tab: Ringkasan Eksekutif & KPI',
      category: 'Navigasi',
      icon: Zap,
      action: () => {
        onSelectTab('overview');
        onClose();
      }
    },
    {
      id: 'tab_analytics',
      label: 'Ke Tab: Analitik Visual & Wilayah',
      category: 'Navigasi',
      icon: Layers,
      action: () => {
        onSelectTab('analytics');
        onClose();
      }
    },
    {
      id: 'tab_grid',
      label: 'Ke Tab: Data Grid & Rincian Tabel',
      category: 'Navigasi',
      icon: FileSpreadsheet,
      action: () => {
        onSelectTab('grid');
        onClose();
      }
    },
    {
      id: 'tab_audit',
      label: 'Ke Tab: Kualitas Data & Integritas Audit',
      category: 'Navigasi',
      icon: ShieldCheck,
      action: () => {
        onSelectTab('audit');
        onClose();
      }
    },
    {
      id: 'action_sync',
      label: 'Sinkronisasi Realtime Spreadsheet Sekarang',
      category: 'Aksi Cepat',
      icon: RefreshCw,
      action: () => {
        onDirectSync(false);
        onClose();
      }
    },
    {
      id: 'action_upload',
      label: 'Buka Menu Upload & Update Excel',
      category: 'Aksi Cepat',
      icon: FileSpreadsheet,
      action: () => {
        onOpenUploadExcel();
        onClose();
      }
    },
    {
      id: 'action_theme',
      label: isDark ? 'Ganti Tema ke Mode Terang (Light Mode)' : 'Ganti Tema ke Mode Gelap (Dark Mode)',
      category: 'Pengaturan',
      icon: isDark ? Sun : Moon,
      action: () => {
        onToggleTheme();
        onClose();
      }
    }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 md:p-20 flex justify-center items-start animate-fade-in">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Palette Container */}
      <div className="relative w-full max-w-2xl bg-surface-light dark:bg-surface-dark border border-pln-cyan/40 rounded-16px shadow-2xl overflow-hidden animate-scale-up">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-surface-light-border dark:border-surface-dark-border bg-base-light dark:bg-base-dark">
          <Search className="w-5 h-5 text-pln-cyan flex-shrink-0 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ketik IDPEL, Nama, Nomor Meter, atau perintah cepat..."
            className="w-full bg-transparent text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded text-slate-400 hover:text-white mr-2"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700">
            ESC
          </span>
        </div>

        {/* Palette Results Body */}
        <div className="max-h-[60vh] overflow-y-auto p-2 divide-y divide-surface-light-border dark:divide-surface-dark-border/40 text-xs">
          {/* 1. Customer Search Matches */}
          {searchResults.length > 0 && (
            <div className="p-2 space-y-1">
              <div className="px-2 py-1 text-[10px] font-bold text-pln-cyan uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" /> Pelanggan Ditemukan ({searchResults.length})
              </div>
              {searchResults.map((row) => (
                <div
                  key={row._id}
                  onClick={() => {
                    onSelectRecord(row);
                    onClose();
                  }}
                  className="flex items-center justify-between p-2.5 rounded-8px hover:bg-pln-cyan/10 hover:border-pln-cyan/30 cursor-pointer border border-transparent transition-all group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-6px bg-pln-cyan/15 text-pln-cyan flex items-center justify-center font-mono font-bold text-[11px] flex-shrink-0">
                      ID
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white truncate">
                          {row.NAMA}
                        </span>
                        <span className="font-mono text-[11px] text-pln-cyan-light font-bold">
                          {row.IDPEL}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        ULP {row.UNITUP} • {row.ALASAN_GANTI_METER} • {row.TGLREMAJA}
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-pln-cyan group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                </div>
              ))}
            </div>
          )}

          {/* 2. Quick Actions / Navigation */}
          {(!query || query.length < 2) && (
            <div className="p-2 space-y-1">
              <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Navigasi & Aksi Cepat
              </div>
              {quickActions.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.id}
                    onClick={item.action}
                    className="flex items-center justify-between p-2 rounded-8px hover:bg-surface-light-hover dark:hover:bg-surface-dark-hover cursor-pointer transition-colors group"
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4 text-pln-cyan" />
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {item.label}
                      </span>
                    </div>
                    <span className="text-[10px] font-medium text-slate-400 bg-base-light dark:bg-base-dark px-2 py-0.5 rounded border border-surface-light-border dark:border-surface-dark-border">
                      {item.category}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* 3. Filter ULP Shortcuts */}
          {(!query || query.length < 2) && unitupOptions.length > 0 && (
            <div className="p-2 space-y-1">
              <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" /> Filter Cepat Unit ULP
              </div>
              <div className="grid grid-cols-2 gap-1.5 px-1">
                {unitupOptions.slice(0, 6).map((unit) => (
                  <div
                    key={unit}
                    onClick={() => {
                      onUpdateFilter('unitup', unit);
                      onSelectTab('grid');
                      onClose();
                    }}
                    className="flex items-center justify-between p-2 rounded-6px bg-base-light dark:bg-base-dark hover:border-pln-cyan border border-surface-light-border dark:border-surface-dark-border cursor-pointer transition-colors"
                  >
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      UNITUP {unit}
                    </span>
                    <span className="text-[10px] text-pln-cyan font-bold">&rarr;</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Hint */}
        <div className="p-3 bg-base-light dark:bg-base-dark border-t border-surface-light-border dark:border-surface-dark-border flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span>Gunakan</span>
            <span className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-mono text-[10px] border border-slate-300 dark:border-slate-700">
              Ctrl + K
            </span>
            <span>kapan saja untuk membuka pencarian kilat</span>
          </div>
          <span className="font-semibold text-pln-cyan">Ganti Meter Salatiga</span>
        </div>
      </div>
    </div>
  );
}
