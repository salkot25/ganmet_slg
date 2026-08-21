import React, { useRef, useEffect } from 'react';
import { SlidersHorizontal, Building2, Calendar, AlertCircle, Zap, RotateCcw, CalendarRange } from 'lucide-react';
import { Card } from './common/Card';
import { Button } from './common/Button';
import { getPresetDateRange, formatDMY } from '../utils/dateHelpers';
import flatpickr from 'flatpickr';

export function FilterSection({
  filters,
  onUpdateFilter,
  onResetFilters,
  unitupOptions,
  alasanOptions
}) {
  const dateInputRef = useRef(null);
  const fpRef = useRef(null);

  useEffect(() => {
    if (dateInputRef.current) {
      fpRef.current = flatpickr(dateInputRef.current, {
        mode: 'range',
        dateFormat: 'd/m/Y',
        onChange: (selectedDates) => {
          if (selectedDates.length === 2) {
            const start = selectedDates[0];
            const end = new Date(selectedDates[1]);
            end.setHours(23, 59, 59, 999);
            onUpdateFilter('dateStart', start);
            onUpdateFilter('dateEnd', end);
          }
        }
      });
    }

    return () => {
      if (fpRef.current) fpRef.current.destroy();
    };
  }, [onUpdateFilter]);

  // Sync flatpickr UI when dates change or reset
  useEffect(() => {
    if (fpRef.current) {
      if (!filters.dateStart && !filters.dateEnd) {
        fpRef.current.clear();
      } else if (filters.dateStart && filters.dateEnd) {
        fpRef.current.setDate([filters.dateStart, filters.dateEnd]);
      }
    }
  }, [filters.dateStart, filters.dateEnd]);

  const handlePresetClick = (preset) => {
    if (preset === 'all') {
      onUpdateFilter('dateStart', null);
      onUpdateFilter('dateEnd', null);
      if (fpRef.current) fpRef.current.clear();
    } else {
      const { start, end } = getPresetDateRange(preset);
      onUpdateFilter('dateStart', start);
      onUpdateFilter('dateEnd', end);
      if (fpRef.current && start && end) {
        fpRef.current.setDate([start, end]);
      }
    }
  };

  const getActivePreset = () => {
    if (!filters.dateStart && !filters.dateEnd) return 'all';
    const yrStart = filters.dateStart?.getFullYear();
    const yrEnd = filters.dateEnd?.getFullYear();
    if (yrStart === 2024 && yrEnd === 2024) return '2024';
    if (yrStart === 2025 && yrEnd === 2025) return '2025';
    if (yrStart === 2026 && yrEnd === 2026) return '2026';
    return 'custom';
  };

  const activePreset = getActivePreset();

  return (
    <Card className="border-l-4 border-l-pln-cyan">
      {/* Filter Header */}
      <div className="flex items-center justify-between pb-4 border-b border-surface-light-border dark:border-surface-dark-border mb-5">
        <div className="flex items-center gap-2.5">
          <SlidersHorizontal className="w-5 h-5 text-pln-cyan" />
          <h3 className="text-sm md:text-base font-bold text-slate-900 dark:text-slate-100">
            Filter Analitik
          </h3>
        </div>
        <Button variant="ghost" size="sm" icon={RotateCcw} onClick={onResetFilters}>
          Reset Filter
        </Button>
      </div>

      {/* Filter 4-Column Grid adhering to 4px spacing rules */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        {/* 1. Filter UNITUP (Kolom D) */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-pln-cyan" />
            Unit ULP
          </label>
          <select
            value={filters.unitup}
            onChange={(e) => onUpdateFilter('unitup', e.target.value)}
            className="w-full px-3 py-2 bg-base-light dark:bg-base-dark border border-surface-light-border dark:border-surface-dark-border rounded-8px text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:border-pln-cyan focus:ring-1 focus:ring-pln-cyan"
          >
            <option value="ALL">Semua UNITUP</option>
            {unitupOptions.map((unit) => (
              <option key={unit} value={unit}>
                UNITUP {unit}
              </option>
            ))}
          </select>
        </div>

        {/* 2. Filter Tanggal Remaja (Kolom AA) */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-pln-cyan" />
            Tanggal Remaja
          </label>
          <div className="relative">
            <input
              ref={dateInputRef}
              type="text"
              placeholder="Pilih Rentang Tanggal..."
              className="w-full px-3 py-2 pr-9 bg-base-light dark:bg-base-dark border border-surface-light-border dark:border-surface-dark-border rounded-8px text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:border-pln-cyan focus:ring-1 focus:ring-pln-cyan cursor-pointer"
              readOnly
            />
            <CalendarRange className="absolute right-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
          {/* Date Presets */}
          <div className="flex gap-1.5 pt-1 flex-wrap">
            {['all', '2024', '2025', '2026', 'last30'].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => handlePresetClick(preset)}
                className={`px-2 py-0.5 text-[11px] font-semibold rounded-4px border transition-all ${
                  activePreset === preset
                    ? 'bg-pln-cyan text-white border-pln-cyan shadow-sm'
                    : 'bg-base-light dark:bg-base-dark text-slate-600 dark:text-slate-400 border-surface-light-border dark:border-surface-dark-border hover:border-pln-cyan/40 hover:text-pln-cyan'
                }`}
              >
                {preset === 'all'
                  ? 'Semua'
                  : preset === 'last30'
                  ? '30 Hari'
                  : preset}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Filter Alasan Ganti Meter (Kolom AF) */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-pln-cyan" />
            Alasan Ganti Meter
          </label>
          <select
            value={filters.alasan}
            onChange={(e) => onUpdateFilter('alasan', e.target.value)}
            className="w-full px-3 py-2 bg-base-light dark:bg-base-dark border border-surface-light-border dark:border-surface-dark-border rounded-8px text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:border-pln-cyan focus:ring-1 focus:ring-pln-cyan"
          >
            <option value="ALL">Semua Alasan Penggantian</option>
            {alasanOptions.map((item) => (
              <option key={item.label} value={item.label}>
                {item.label} ({item.count})
              </option>
            ))}
          </select>
        </div>

        {/* 4. Filter KDPEMBMETER (Kolom BA) */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-pln-cyan" />
            Jenis kWh Meter
          </label>
          <div className="flex p-1 bg-base-light dark:bg-base-dark border border-surface-light-border dark:border-surface-dark-border rounded-8px gap-1">
            {[
              { id: 'ALL', label: 'Semua' },
              { id: 'PRABAYAR', label: 'Prabayar' },
              { id: 'PASKABAYAR', label: 'Paskabayar' },
              { id: 'AMR_AMI', label: 'AMR/AMI' }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => onUpdateFilter('layanan', tab.id)}
                className={`flex-1 py-1.5 px-2 text-[11px] font-semibold rounded-4px transition-all truncate ${
                  filters.layanan === tab.id
                    ? 'bg-pln-cyan text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
