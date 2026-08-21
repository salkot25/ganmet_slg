import React, { useState } from 'react';
import {
  X,
  User,
  Zap,
  RotateCcw,
  Calendar,
  Layers,
  Copy,
  Check,
  Building2,
  FileText,
  Activity,
  Sparkles,
  MapPin,
  Cpu
} from 'lucide-react';
import { Badge } from './common/Badge';
import { formatDaya } from '../utils/formatters';

export function CustomerDrawer({ isOpen, onClose, record }) {
  const [activeTab, setActiveTab] = useState('pelanggan'); // 'pelanggan' | 'meter_lama' | 'meter_baru' | 'petugas' | 'teknis'
  const [copiedField, setCopiedField] = useState(null);

  if (!isOpen || !record) return null;

  const handleCopy = (val, fieldKey) => {
    if (!val) return;
    navigator.clipboard.writeText(String(val));
    setCopiedField(fieldKey);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const getServiceBadge = (kd) => {
    const code = (kd || '').toUpperCase();
    if (code.startsWith('P')) return <Badge variant="cyan">Prabayar (LPB)</Badge>;
    if (code.startsWith('M')) return <Badge variant="orange">Paskabayar (Mekanik)</Badge>;
    if (code.startsWith('E')) return <Badge variant="orange">Paskabayar (Elektrik)</Badge>;
    if (code.startsWith('A') || code.startsWith('R')) return <Badge variant="blue">AMR / AMI</Badge>;
    return <Badge variant="slate">Lainnya</Badge>;
  };

  const renderField = (label, value, copyable = false, fieldKey = '', isHighlight = false) => (
    <div className="flex flex-col gap-1 p-2.5 rounded-8px bg-base-light/60 dark:bg-base-dark/60 border border-surface-light-border dark:border-surface-dark-border">
      <div className="flex items-center justify-between text-[11px]">
        <span className="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          {label}
        </span>
        {copyable && value && (
          <button
            type="button"
            onClick={() => handleCopy(value, fieldKey)}
            className="flex items-center gap-1 text-[10px] text-pln-cyan hover:underline transition-colors"
            title="Salin ke clipboard"
          >
            {copiedField === fieldKey ? (
              <span className="flex items-center gap-0.5 text-emerald-400 font-bold">
                <Check className="w-3 h-3" /> Tersalin
              </span>
            ) : (
              <span className="flex items-center gap-0.5 opacity-80 hover:opacity-100">
                <Copy className="w-3 h-3" /> Salin
              </span>
            )}
          </button>
        )}
      </div>
      <span
        className={`font-semibold break-words text-xs ${
          isHighlight
            ? 'text-pln-cyan-light font-bold font-mono text-sm'
            : 'text-slate-900 dark:text-slate-100'
        }`}
      >
        {value || '-'}
      </span>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Slide-over Drawer Container */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-2xl bg-surface-light dark:bg-surface-dark border-l border-surface-light-border dark:border-surface-dark-border shadow-2xl flex flex-col animate-slide-left">
          {/* Drawer Header */}
          <div className="p-4 md:px-6 md:py-5 border-b border-surface-light-border dark:border-surface-dark-border bg-base-light/80 dark:bg-base-dark/80 backdrop-blur-md">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-12px bg-gradient-to-br from-[#0B192C] to-[#005F73] border border-pln-cyan flex items-center justify-center shadow-glow-cyan text-pln-yellow">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-base md:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
                      {record.NAMA || 'Data Pelanggan'}
                    </h2>
                    {getServiceBadge(record.KDPEMBMETER)}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    <span className="font-mono text-pln-cyan font-bold">IDPEL: {record.IDPEL}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Building2 className="w-3 h-3 text-pln-cyan" /> ULP {record.UNITUP || '-'}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-8px text-slate-400 hover:text-slate-200 hover:bg-base-light dark:hover:bg-base-dark transition-colors"
                title="Tutup Detail"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Alasan Banner */}
            <div className="mt-3.5 p-2.5 bg-pln-cyan/10 border border-pln-cyan/30 rounded-8px flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs">
                <Sparkles className="w-4 h-4 text-pln-yellow flex-shrink-0" />
                <span className="font-medium text-slate-700 dark:text-slate-300">Alasan Ganti:</span>
                <span className="font-bold text-pln-yellow">{record.ALASAN_GANTI_METER || '-'}</span>
              </div>
              <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                {record.TGLREMAJA}
              </span>
            </div>

            {/* Drawer Tabs */}
            <div className="flex gap-1.5 mt-4 overflow-x-auto pb-1 scrollbar-none">
              {[
                { id: 'pelanggan', label: 'Pelanggan & Lokasi', icon: User },
                { id: 'meter_lama', label: 'Meter Lama', icon: RotateCcw },
                { id: 'meter_baru', label: 'Meter Baru', icon: Zap },
                { id: 'petugas', label: 'Alur & Petugas', icon: Calendar },
                { id: 'teknis', label: 'Spesifikasi CT/PT', icon: Cpu }
              ].map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setActiveTab(t.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-6px text-xs font-semibold whitespace-nowrap transition-all ${
                      activeTab === t.id
                        ? 'bg-pln-cyan text-white shadow-sm'
                        : 'bg-base-light dark:bg-base-dark text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-surface-light-border dark:border-surface-dark-border'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Drawer Body with Tabbed Content */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 text-xs">
            {/* Tab 1: Pelanggan & Lokasi */}
            {activeTab === 'pelanggan' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-fade-in">
                {renderField('ID Pelanggan (IDPEL)', record.IDPEL, true, 'idpel', true)}
                {renderField('Nomor Agenda', record.NOAGENDA, true, 'noagenda')}
                {renderField('Nomor PDL', record.NOMORPDL, true, 'nomorpdl')}
                {renderField('Nama Pelanggan', record.NAMA)}
                <div className="sm:col-span-2">
                  {renderField('Alamat Pelanggan', record.ALAMAT)}
                </div>
                {renderField('Kode Kedudukan (KDDK)', record.KDDK)}
                {renderField('Unit UPI / AP / UP', `${record.UNITUPI || '-'} / ${record.UNITAP || '-'} / ${record.UNITUP || '-'}`)}
                {renderField('Tarif & Daya', `${record.TARIF || '-'} / ${formatDaya(record.DAYA)}`)}
                {renderField('Jenis Pembayaran Meter', record.KDPEMBMETER)}
                {renderField('Provinsi', record.NAMA_PROV)}
                {renderField('Kabupaten / Kota', record.NAMA_KAB)}
                {renderField('Kecamatan', record.NAMA_KEC)}
                {renderField('Kelurahan / Desa', record.NAMA_KEL)}
              </div>
            )}

            {/* Tab 2: Meter Lama (Bongkar) */}
            {activeTab === 'meter_lama' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-fade-in">
                <div className="sm:col-span-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded-8px text-amber-300 font-semibold flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-amber-400" />
                  <span>Rincian Spesifikasi kWh Meter yang Dibongkar:</span>
                </div>
                {renderField('Nomor Meter Lama', record.NO_METER_LAMA, true, 'nometerlama', true)}
                {renderField('Merk Meter Lama', record.MERK_METER_LAMA)}
                {renderField('Tipe / Fasa Meter Lama', record.TYPE_METER_LAMA)}
                {renderField('Tahun Tera Meter Lama', record.THTERA_METER_LAMA)}
                {renderField('Tahun Buat Meter Lama', record.THBUAT_METER_LAMA)}
                {renderField('Kode Pembayaran', record.KDPEMBMETER)}
              </div>
            )}

            {/* Tab 3: Meter Baru (Pasang) */}
            {activeTab === 'meter_baru' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-fade-in">
                <div className="sm:col-span-2 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-8px text-emerald-300 font-semibold flex items-center gap-2">
                  <Zap className="w-4 h-4 text-emerald-400" />
                  <span>Rincian Spesifikasi kWh Meter Baru yang Dipasang:</span>
                </div>
                {renderField('Nomor Meter Baru', record.NO_METER_BARU, true, 'nometerbaru', true)}
                {renderField('Merk Meter Baru', record.MERK_METER_BARU)}
                {renderField('Tipe / Fasa Meter Baru', record.TYPE_METER_BARU)}
                {renderField('Tahun Tera Meter Baru', record.THTERA_METER_BARU)}
                {renderField('Tahun Buat Meter Baru', record.THBUAT_METER_BARU)}
                {renderField('ID Ganti Meter', record.ID_GANTI_METER)}
                <div className="sm:col-span-2">
                  {renderField('Alasan Penggantian', record.ALASAN_GANTI_METER)}
                </div>
                {record.ALASAN_PENANGGUHAN && (
                  <div className="sm:col-span-2">
                    {renderField('Alasan Penangguhan', `${record.ALASAN_PENANGGUHAN} - ${record.KETERANGAN_ALASAN_PENANGGUHAN || ''}`)}
                  </div>
                )}
              </div>
            )}

            {/* Tab 4: Alur & Petugas */}
            {activeTab === 'petugas' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-fade-in">
                {renderField('Tanggal Pengaduan', record.TGLPENGADUAN)}
                {renderField('Petugas Pengaduan', record.PETUGASPENGADUAN)}
                {renderField('Tanggal Tindakan', record.TGLTINDAKANPENGADUAN)}
                {renderField('Petugas Tindakan', record.PETUGASTINDAKANPENGADUAN)}
                {renderField('Tanggal Bayar', record.TGLBAYAR)}
                {renderField('Tanggal Aktivasi', record.TGLAKTIVASI)}
                {renderField('Petugas Aktivasi', record.PETUGASAKTIVASI)}
                {renderField('Tanggal Remaja', record.TGLREMAJA, false, '', true)}
                {renderField('Petugas Remaja', record.PETUGASREMAJA)}
                {renderField('Tanggal Nyala', record.TGLNYALA)}
                {renderField('Tanggal Rekap', record.TGLREKAP)}
                {renderField('Status Permohonan', record.STATUS_PERMOHONAN)}
              </div>
            )}

            {/* Tab 5: Spesifikasi CT/PT */}
            {activeTab === 'teknis' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-fade-in">
                {renderField('CT Primer kWh', record.CT_PRIMER_KWH)}
                {renderField('CT Sekunder kWh', record.CT_SEKUNDER_KWH)}
                {renderField('PT Primer kWh', record.PT_PRIMER_KWH)}
                {renderField('PT Sekunder kWh', record.PT_SEKUNDER_KWH)}
                {renderField('Konstanta kWh', record.KONSTANTA_KWH)}
                {renderField('Faktor Kali (FAKMKWH)', record.FAKMKWH)}
                {renderField('Tipe CT kWh', record.TYPE_CT_KWH)}
                {renderField('CT Primer kVARh', record.CT_PRIMER_KVARH)}
                {renderField('CT Sekunder kVARh', record.CT_SEKUNDER_KVARH)}
                {renderField('PT Primer kVARh', record.PT_PRIMER_KVARH)}
                {renderField('PT Sekunder kVARh', record.PT_SEKUNDER_KVARH)}
                {renderField('Konstanta kVARh', record.KONSTANTA_KVARH)}
                {renderField('Faktor Kali (FAKMKVARH)', record.FAKMKVARH)}
                {renderField('Tipe CT kVARh', record.TYPE_CT_KVARH)}
              </div>
            )}
          </div>

          {/* Drawer Footer */}
          <div className="p-4 border-t border-surface-light-border dark:border-surface-dark-border bg-base-light/80 dark:bg-base-dark/80 flex items-center justify-between">
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              67 Parameter Resmi Database PLN
            </span>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-pln-cyan text-white text-xs font-bold rounded-8px hover:bg-pln-cyan-dark transition-colors shadow-sm"
            >
              Tutup Rincian
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
