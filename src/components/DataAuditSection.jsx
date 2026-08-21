import React, { useState, useMemo } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  FileCheck2,
  Copy,
  Check,
  Search,
  ExternalLink,
  RefreshCw,
  Zap,
  Info,
  Download,
  Filter,
  Layers,
  FileSpreadsheet
} from 'lucide-react';
import { Card } from './common/Card';
import { Badge } from './common/Badge';
import { Button } from './common/Button';
import { formatNumber } from '../utils/formatters';
import { SPREADSHEET_CONFIG } from '../constants/appConfig';
import { exportOfficialXLSX } from '../utils/reportGenerator';

export function DataAuditSection({
  anomalyAudit,
  totalRecords,
  onOpenDetail,
  onDirectSync,
  isSyncing
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('ALL'); // 'ALL' | 'DUPLICATE' | 'SAME_METER' | 'DATE' | 'MISSING'
  const [copiedId, setCopiedId] = useState(null);

  const { anomalies, anomalyCount, integrityScore } = anomalyAudit || {
    anomalies: [],
    anomalyCount: 0,
    integrityScore: '100.0'
  };

  // Category classification
  const categorizedAnomalies = useMemo(() => {
    return anomalies.map(a => {
      let cat = 'OTHER';
      if (a.issues.some(i => i.toLowerCase().includes('terduplikasi') || i.toLowerCase().includes('duplicate'))) {
        cat = 'DUPLICATE';
      } else if (a.issues.some(i => i.toLowerCase().includes('identik'))) {
        cat = 'SAME_METER';
      } else if (a.issues.some(i => i.toLowerCase().includes('tanggal'))) {
        cat = 'DATE';
      } else if (a.issues.some(i => i.toLowerCase().includes('kosong') || i.toLowerCase().includes('tidak lengkap'))) {
        cat = 'MISSING';
      }
      return { ...a, category: cat };
    });
  }, [anomalies]);

  const filteredAnomalies = useMemo(() => {
    return categorizedAnomalies.filter(a => {
      if (activeCategory !== 'ALL' && a.category !== activeCategory) return false;

      const q = searchTerm.toLowerCase().trim();
      if (!q) return true;
      return (
        String(a.record.IDPEL || '').toLowerCase().includes(q) ||
        String(a.record.NAMA || '').toLowerCase().includes(q) ||
        String(a.record.UNITUP || '').toLowerCase().includes(q) ||
        a.issues.some(i => i.toLowerCase().includes(q))
      );
    });
  }, [categorizedAnomalies, activeCategory, searchTerm]);

  const handleCopy = (idpel, id) => {
    navigator.clipboard.writeText(String(idpel));
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportAnomalies = () => {
    const rawAnomRecords = filteredAnomalies.map(a => a.record);
    exportOfficialXLSX(rawAnomRecords, null, 'Daftar_Anomali_Data_kWh_Meter_PLN');
  };

  const catCounts = {
    ALL: anomalies.length,
    DUPLICATE: categorizedAnomalies.filter(a => a.category === 'DUPLICATE').length,
    SAME_METER: categorizedAnomalies.filter(a => a.category === 'SAME_METER').length,
    MISSING: categorizedAnomalies.filter(a => a.category === 'MISSING').length,
    DATE: categorizedAnomalies.filter(a => a.category === 'DATE').length
  };

  return (
    <div className="flex flex-col gap-5 text-xs animate-fade-in">
      {/* Integrity Score Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Score */}
        <Card className="flex items-center gap-4 border-l-4 border-l-emerald-500 shadow-sm">
          <div className="w-12 h-12 rounded-12px bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 flex-shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Skor Integritas Database
            </span>
            <div className="flex items-baseline gap-1.5 my-0.5">
              <h2 className="text-2xl font-extrabold text-emerald-400 tracking-tight">
                {integrityScore}%
              </h2>
              <span className="text-xs text-slate-400 font-semibold">Tervalidasi</span>
            </div>
            <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden my-0.5">
              <div
                className="h-full bg-emerald-400 transition-all duration-500"
                style={{ width: `${integrityScore}%` }}
              />
            </div>
            <span className="text-[11px] text-slate-400">
              {formatNumber(totalRecords - anomalyCount)} dari {formatNumber(totalRecords)} baris bersih
            </span>
          </div>
        </Card>

        {/* Card 2: Anomaly Count */}
        <Card className="flex items-center gap-4 border-l-4 border-l-amber-500 shadow-sm">
          <div className="w-12 h-12 rounded-12px bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 flex-shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Anomali Terdeteksi
            </span>
            <div className="flex items-baseline gap-1.5 my-0.5">
              <h2 className="text-2xl font-extrabold text-amber-400 tracking-tight">
                {formatNumber(anomalyCount)}
              </h2>
              <span className="text-xs text-slate-400 font-semibold">Baris Temuan</span>
            </div>
            <span className="text-[11px] text-slate-400">
              Potensi duplikasi IDPEL, meter identik, atau data belum lengkap
            </span>
          </div>
        </Card>

        {/* Card 3: Action Banner */}
        <Card className="flex flex-col justify-between gap-3 bg-pln-cyan/5 border-pln-cyan/30 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold text-pln-cyan uppercase tracking-wider flex items-center gap-1.5">
                <FileCheck2 className="w-3.5 h-3.5" /> Database Google Spreadsheet
              </span>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
                Koreksi data anomali langsung di lembar spreadsheet untuk menjaga kualitas data PLN.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <a
              href={SPREADSHEET_CONFIG.FULL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-pln-cyan text-white font-bold rounded-6px hover:bg-pln-cyan-dark transition-colors text-[11px] shadow-sm"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Buka Spreadsheet
            </a>
            <Button
              variant="secondary"
              size="sm"
              icon={RefreshCw}
              onClick={() => onDirectSync(false)}
              disabled={isSyncing}
            >
              Sync Realtime
            </Button>
          </div>
        </Card>
      </div>

      {/* Anomaly Table & Category Filters */}
      <Card className="flex flex-col gap-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 pb-3 border-b border-surface-light-border dark:border-surface-dark-border">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Daftar Baris yang Memerlukan Verifikasi & Koreksi
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Data dengan potensi duplikasi IDPEL, nomor meter sama, atau kolom esensial yang kosong
            </p>
          </div>

          <div className="flex items-center gap-2 w-full lg:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari IDPEL, Nama, Isu..."
                className="w-full pl-9 pr-3 py-1.5 bg-base-light dark:bg-base-dark border border-surface-light-border dark:border-surface-dark-border rounded-8px text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-pln-cyan"
              />
            </div>

            {filteredAnomalies.length > 0 && (
              <Button
                variant="secondary"
                size="sm"
                icon={FileSpreadsheet}
                onClick={handleExportAnomalies}
                title="Ekspor daftar data anomali ke Excel"
              >
                <span className="hidden sm:inline">Ekspor Excel</span> ({filteredAnomalies.length})
              </Button>
            )}
          </div>
        </div>

        {/* Anomaly Category Tabs */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'ALL', label: 'Semua Anomali', count: catCounts.ALL },
            { id: 'DUPLICATE', label: 'Duplikasi IDPEL', count: catCounts.DUPLICATE },
            { id: 'SAME_METER', label: 'No Meter Identik', count: catCounts.SAME_METER },
            { id: 'MISSING', label: 'Data Kosong', count: catCounts.MISSING },
            { id: 'DATE', label: 'Isu Tanggal', count: catCounts.DATE }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveCategory(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-6px text-xs font-semibold whitespace-nowrap transition-all ${
                activeCategory === tab.id
                  ? 'bg-amber-500 text-black font-extrabold shadow-sm'
                  : 'bg-base-light dark:bg-base-dark text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-surface-light-border dark:border-surface-dark-border'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                activeCategory === tab.id
                  ? 'bg-black text-amber-400'
                  : 'bg-amber-500/15 text-amber-400'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Anomaly Table */}
        <div className="w-full overflow-x-auto rounded-8px border border-surface-light-border dark:border-surface-dark-border bg-base-light/50 dark:bg-base-dark/50">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-surface-light dark:bg-surface-dark border-b border-surface-light-border dark:border-surface-dark-border">
              <tr>
                <th className="px-3.5 py-3 font-bold text-slate-600 dark:text-slate-300">#</th>
                <th className="px-3.5 py-3 font-bold text-slate-600 dark:text-slate-300">IDPEL & Nama</th>
                <th className="px-3.5 py-3 font-bold text-slate-600 dark:text-slate-300">ULP</th>
                <th className="px-3.5 py-3 font-bold text-slate-600 dark:text-slate-300">Tgl Remaja</th>
                <th className="px-3.5 py-3 font-bold text-slate-600 dark:text-slate-300">Alasan Ganti</th>
                <th className="px-3.5 py-3 font-bold text-slate-600 dark:text-slate-300">Temuan Anomali</th>
                <th className="px-3.5 py-3 font-bold text-slate-600 dark:text-slate-300 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-light-border dark:divide-surface-dark-border">
              {filteredAnomalies.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-slate-400 text-xs">
                    {anomalyCount === 0
                      ? '✨ Luar biasa! Seluruh basis data valid dan bersih dari anomali.'
                      : 'Tidak ada baris anomali yang cocok dengan kategori/pencarian ini.'}
                  </td>
                </tr>
              ) : (
                filteredAnomalies.map((item, idx) => {
                  const row = item.record;
                  return (
                    <tr key={idx} className="hover:bg-amber-500/5 transition-colors">
                      <td className="px-3.5 py-2.5 text-slate-500 dark:text-slate-400">{idx + 1}</td>
                      <td className="px-3.5 py-2.5">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1 font-mono font-bold text-pln-cyan-light">
                            <span>{row.IDPEL || '-'}</span>
                            <button
                              onClick={() => handleCopy(row.IDPEL, row._id)}
                              className="text-slate-400 hover:text-pln-cyan"
                              title="Salin IDPEL"
                            >
                              {copiedId === row._id ? (
                                <Check className="w-3 h-3 text-emerald-400" />
                              ) : (
                                <Copy className="w-3 h-3 opacity-60 hover:opacity-100" />
                              )}
                            </button>
                          </div>
                          <span className="font-semibold text-slate-900 dark:text-white truncate max-w-[170px]">
                            {row.NAMA || '-'}
                          </span>
                        </div>
                      </td>
                      <td className="px-3.5 py-2.5 font-bold text-slate-900 dark:text-white">
                        {row.UNITUP || '-'}
                      </td>
                      <td className="px-3.5 py-2.5 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                        {row.TGLREMAJA || '-'}
                      </td>
                      <td className="px-3.5 py-2.5 text-slate-600 dark:text-slate-300 max-w-[140px] truncate">
                        {row.ALASAN_GANTI_METER || '-'}
                      </td>
                      <td className="px-3.5 py-2.5">
                        <div className="flex flex-col gap-1">
                          {item.issues.map((issue, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/25 px-2 py-0.5 rounded-4px w-fit"
                            >
                              <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                              <span>{issue}</span>
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-3.5 py-2.5 text-center">
                        <button
                          onClick={() => onOpenDetail(row)}
                          className="px-2.5 py-1 text-[11px] font-bold bg-surface-light dark:bg-surface-dark border border-surface-light-border dark:border-surface-dark-border hover:border-pln-cyan hover:text-pln-cyan-light text-slate-700 dark:text-slate-300 rounded-4px transition-colors shadow-sm"
                        >
                          Inspeksi
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
