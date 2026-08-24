import React, { useState } from 'react';
import { Columns3, Check, RotateCcw, Search, Layers, Cpu, Calendar, CheckSquare } from 'lucide-react';
import { Modal } from './common/Modal';
import { Button } from './common/Button';
import { OFFICIAL_PLN_COLUMNS } from '../constants/plnColumns';

export const COLUMN_PRESETS = {
  standard: [
    'UNITUP',
    'TGLREMAJA',
    'IDPEL',
    'NAMA',
    'TARIF',
    'ALASAN_GANTI_METER',
    'KDPEMBMETER',
    'MERK_METER_LAMA',
    'MERK_METER_BARU'
  ],
  technical: [
    'UNITUP',
    'IDPEL',
    'NAMA',
    'TARIF',
    'DAYA',
    'NO_METER_LAMA',
    'MERK_METER_LAMA',
    'TYPE_METER_LAMA',
    'NO_METER_BARU',
    'MERK_METER_BARU',
    'TYPE_METER_BARU',
    'CT_PRIMER_KWH',
    'CT_SEKUNDER_KWH',
    'PT_PRIMER_KWH',
    'PT_SEKUNDER_KWH',
    'KONSTANTA_KWH',
    'FAKMKWH',
    'ALASAN_GANTI_METER'
  ],
  officer: [
    'UNITUP',
    'IDPEL',
    'NAMA',
    'TGLPENGADUAN',
    'PETUGASPENGADUAN',
    'TGLTINDAKANPENGADUAN',
    'PETUGASTINDAKANPENGADUAN',
    'TGLREMAJA',
    'PETUGASREMAJA',
    'TGLNYALA',
    'STATUS_PERMOHONAN',
    'ALASAN_GANTI_METER'
  ],
  full: OFFICIAL_PLN_COLUMNS.map(c => c.key)
};

export function ColumnSelectorModal({
  isOpen,
  onClose,
  visibleColumns,
  onUpdateVisibleColumns,
  defaultColumns
}) {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const filteredColumns = OFFICIAL_PLN_COLUMNS.filter(col =>
    col.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
    col.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleColumn = (key) => {
    if (visibleColumns.includes(key)) {
      if (visibleColumns.length <= 1) {
        alert('Minimal 1 kolom harus tetap aktif.');
        return;
      }
      onUpdateVisibleColumns(visibleColumns.filter(k => k !== key));
    } else {
      onUpdateVisibleColumns([...visibleColumns, key]);
    }
  };

  const applyPreset = (presetKey) => {
    if (COLUMN_PRESETS[presetKey]) {
      onUpdateVisibleColumns(COLUMN_PRESETS[presetKey]);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Pengaturan & Preset Kolom Tabel (67 Kolom PLN)"
      icon={Columns3}
      maxWidth="max-w-3xl"
    >
      <div className="flex flex-col gap-4 text-xs">
        {/* Preset Selector Buttons */}
        <div className="p-3 bg-base-light dark:bg-base-dark border border-surface-light-border dark:border-surface-dark-border rounded-10px flex flex-col gap-2">
          <span className="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px]">
            Pilih Preset Tampilan Kolom:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => applyPreset('standard')}
              className="flex items-center gap-1.5 p-2 rounded-6px border border-surface-light-border dark:border-surface-dark-border hover:border-pln-cyan bg-surface-light dark:bg-surface-dark font-bold text-[11px] text-slate-800 dark:text-slate-200 transition-colors"
            >
              <Layers className="w-3.5 h-3.5 text-pln-cyan" />
              <span>Standar (9)</span>
            </button>

            <button
              type="button"
              onClick={() => applyPreset('technical')}
              className="flex items-center gap-1.5 p-2 rounded-6px border border-surface-light-border dark:border-surface-dark-border hover:border-pln-cyan bg-surface-light dark:bg-surface-dark font-bold text-[11px] text-slate-800 dark:text-slate-200 transition-colors"
            >
              <Cpu className="w-3.5 h-3.5 text-amber-400" />
              <span>Teknis & CT/PT (18)</span>
            </button>

            <button
              type="button"
              onClick={() => applyPreset('officer')}
              className="flex items-center gap-1.5 p-2 rounded-6px border border-surface-light-border dark:border-surface-dark-border hover:border-pln-cyan bg-surface-light dark:bg-surface-dark font-bold text-[11px] text-slate-800 dark:text-slate-200 transition-colors"
            >
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              <span>Petugas & Alur (12)</span>
            </button>

            <button
              type="button"
              onClick={() => applyPreset('full')}
              className="flex items-center gap-1.5 p-2 rounded-6px border border-surface-light-border dark:border-surface-dark-border hover:border-pln-cyan bg-surface-light dark:bg-surface-dark font-bold text-[11px] text-slate-800 dark:text-slate-200 transition-colors"
            >
              <CheckSquare className="w-3.5 h-3.5 text-blue-400" />
              <span>Semua Kolom (67)</span>
            </button>
          </div>
        </div>

        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari kolom spesifik (misal: IDPEL, CT, NOMORPDL, TGLBAYAR...)..."
            className="w-full pl-9 pr-3 py-2 bg-base-light dark:bg-base-dark border border-surface-light-border dark:border-surface-dark-border rounded-8px text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-pln-cyan"
          />
        </div>

        {/* Column Checkbox Grid */}
        <div className="max-h-[45vh] overflow-y-auto p-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
          {filteredColumns.map((col) => {
            const isChecked = visibleColumns.includes(col.key);
            return (
              <label
                key={col.key}
                onClick={() => toggleColumn(col.key)}
                className={`flex items-center gap-2.5 p-2 rounded-6px border cursor-pointer select-none transition-all ${
                  isChecked
                    ? 'bg-pln-cyan/10 border-pln-cyan/40 text-slate-900 dark:text-white'
                    : 'bg-base-light/50 dark:bg-base-dark/50 border-surface-light-border dark:border-surface-dark-border text-slate-500 dark:text-slate-400 opacity-60 hover:opacity-100'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${
                    isChecked
                      ? 'bg-pln-cyan border-pln-cyan text-white'
                      : 'border-slate-400 dark:border-slate-600'
                  }`}
                >
                  {isChecked && <Check className="w-3 h-3" />}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-mono text-[11px] font-bold truncate">{col.key}</span>
                  <span className="text-[9px] text-slate-400">Kolom {col.col}</span>
                </div>
              </label>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-surface-light-border dark:border-surface-dark-border">
          <span className="text-[11px] text-slate-400">
            {visibleColumns.length} dari {OFFICIAL_PLN_COLUMNS.length} kolom aktif
          </span>
          <Button variant="primary" size="sm" onClick={onClose}>
            Simpan Tampilan Tabel
          </Button>
        </div>
      </div>
    </Modal>
  );
}
