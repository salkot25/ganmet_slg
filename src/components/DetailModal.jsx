import React from 'react';
import { FileText } from 'lucide-react';
import { Modal } from './common/Modal';
import { formatNumber, formatDaya } from '../utils/formatters';

export function DetailModal({ isOpen, onClose, record }) {
  if (!record) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Rincian Penggantian kWh Meter"
      icon={FileText}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        <div className="flex flex-col gap-1">
          <span className="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[11px]">
            ID Pelanggan (IDPEL)
          </span>
          <span className="font-mono text-sm font-bold text-pln-cyan-light">
            {record.IDPEL || '-'}
          </span>
        </div>

        <div className="flex flex-col gap-1">
          <span className="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[11px]">
            Nomor Agenda
          </span>
          <span className="font-semibold text-slate-900 dark:text-slate-100">
            {record.NOAGENDA || '-'}
          </span>
        </div>

        <div className="sm:col-span-2 flex flex-col gap-1">
          <span className="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[11px]">
            Nama Pelanggan
          </span>
          <span className="text-base font-extrabold text-slate-900 dark:text-white">
            {record.NAMA || '-'}
          </span>
        </div>

        <div className="flex flex-col gap-1">
          <span className="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[11px]">
            Kode UNITUP
          </span>
          <span className="font-bold text-slate-900 dark:text-slate-100">
            UNITUP {record.UNITUP || '-'}
          </span>
        </div>

        <div className="flex flex-col gap-1">
          <span className="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[11px]">
            Tanggal Remaja
          </span>
          <span className="font-semibold text-slate-900 dark:text-slate-100">
            {record.TGLREMAJA || '-'}
          </span>
        </div>

        <div className="flex flex-col gap-1">
          <span className="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[11px]">
            Tarif / Daya
          </span>
          <span className="font-semibold text-slate-900 dark:text-slate-100">
            {record.TARIF || '-'} / {formatDaya(record.DAYA)}
          </span>
        </div>

        <div className="flex flex-col gap-1">
          <span className="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[11px]">
            Jenis Layanan Meter
          </span>
          <span className="font-semibold text-slate-900 dark:text-slate-100">
            {record.KDPEMBMETER || '-'}
          </span>
        </div>

        <div className="sm:col-span-2 flex flex-col gap-1 p-3 bg-base-light dark:bg-base-dark rounded-8px border border-surface-light-border dark:border-surface-dark-border">
          <span className="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[11px]">
            Alasan Penggantian Meter
          </span>
          <span className="font-bold text-pln-yellow text-sm">
            {record.ALASAN_GANTI_METER || '-'}
          </span>
        </div>

        <div className="flex flex-col gap-1">
          <span className="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[11px]">
            Meter Lama (Bongkar)
          </span>
          <span className="font-semibold text-slate-400">
            {record.NO_METER_LAMA || '-'} ({record.MERK_METER_LAMA || '-'})
          </span>
        </div>

        <div className="flex flex-col gap-1">
          <span className="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[11px]">
            Meter Baru (Pasang)
          </span>
          <span className="font-bold text-pln-cyan-light">
            {record.NO_METER_BARU || '-'} ({record.MERK_METER_BARU || '-'})
          </span>
        </div>

        <div className="sm:col-span-2 flex flex-col gap-1">
          <span className="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[11px]">
            Petugas Remaja
          </span>
          <span className="font-semibold text-slate-900 dark:text-slate-100">
            {record.PETUGASREMAJA || '-'}
          </span>
        </div>
      </div>
    </Modal>
  );
}
