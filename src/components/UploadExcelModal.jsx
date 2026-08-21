import React, { useState, useRef } from 'react';
import {
  FileSpreadsheet,
  Upload,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Table,
  PlusCircle,
  RefreshCw,
  X,
  DownloadCloud,
  FileCheck,
  Zap,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Modal } from './common/Modal';
import { Button } from './common/Button';
import { parseExcelFile } from '../utils/excelParser';
import { formatNumber } from '../utils/formatters';
import { SPREADSHEET_CONFIG } from '../constants/appConfig';
import { downloadOfficialExcelTemplate, validateUploadedColumns, OFFICIAL_PLN_COLUMNS } from '../constants/plnColumns';

export function UploadExcelModal({ isOpen, onClose, onUploadSpreadsheet, isUploading }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [parsedRows, setParsedRows] = useState([]);
  const [columnValidation, setColumnValidation] = useState(null);
  const [parseLoading, setParseLoading] = useState(false);
  const [uploadMode, setUploadMode] = useState('append'); // 'append' | 'overwrite'
  const [errorMsg, setErrorMsg] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStage, setUploadStage] = useState(''); // 'validating' | 'preparing' | 'sending' | 'success'
  const [isSuccess, setIsSuccess] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setErrorMsg('');
    setIsSuccess(false);
    setParseLoading(true);
    setSelectedFile(file);

    try {
      const records = await parseExcelFile(file);
      const valResult = validateUploadedColumns(records);
      setParsedRows(records);
      setColumnValidation(valResult);
      setParseLoading(false);
    } catch (err) {
      setErrorMsg(err.message);
      setParsedRows([]);
      setSelectedFile(null);
      setColumnValidation(null);
      setParseLoading(false);
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    setParsedRows([]);
    setColumnValidation(null);
    setErrorMsg('');
    setUploadProgress(0);
    setUploadStage('');
    setIsSuccess(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async () => {
    if (!parsedRows || parsedRows.length === 0) {
      setErrorMsg('Pilih file Excel yang berisi baris data terlebih dahulu.');
      return;
    }

    if (columnValidation && !columnValidation.isValid) {
      setErrorMsg(`Kolom wajib belum lengkap: ${columnValidation.missingRequired.join(', ')}`);
      return;
    }

    setErrorMsg('');
    setIsSuccess(false);

    // Interactive Animation Stages
    setUploadStage('validating');
    setUploadProgress(25);

    setTimeout(async () => {
      setUploadStage('preparing');
      setUploadProgress(50);

      setTimeout(async () => {
        setUploadStage('sending');
        setUploadProgress(85);

        try {
          await onUploadSpreadsheet(uploadMode, parsedRows);
          setUploadProgress(100);
          setUploadStage('success');
          setIsSuccess(true);

          setTimeout(() => {
            handleClear();
            onClose();
          }, 2200);
        } catch (err) {
          setErrorMsg(err.message || 'Gagal mengirim data ke Google Spreadsheet.');
          setUploadStage('');
          setUploadProgress(0);
        }
      }, 500);
    }, 400);
  };

  // Preview first 6 headers
  const previewHeaders = parsedRows.length > 0 ? Object.keys(parsedRows[0]).slice(0, 6) : [];

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (!isUploading) {
          handleClear();
          onClose();
        }
      }}
      title="Upload Excel & Update Spreadsheet"
      icon={FileSpreadsheet}
      maxWidth="max-w-3xl"
    >
      <div className="flex flex-col gap-5 text-xs">
        {/* Source & Template Download Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 bg-pln-cyan/10 border border-pln-cyan/30 rounded-12px text-slate-800 dark:text-slate-200">
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-pln-cyan uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" /> Susunan 67 Kolom Resmi PLN (Col A - BO)
            </span>
            <span className="font-mono text-[11px] text-slate-600 dark:text-slate-400">
              Format 100% identik dengan Google Spreadsheet database
            </span>
          </div>
          <button
            type="button"
            onClick={downloadOfficialExcelTemplate}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-8px font-bold text-xs bg-pln-cyan text-white hover:bg-pln-cyan-dark shadow-sm transition-all active:scale-95"
            title="Unduh file format Excel resmi dengan seluruh 67 header kolom"
          >
            <DownloadCloud className="w-4 h-4" /> Download Template (.xlsx)
          </button>
        </div>

        {/* Upload Animation Overlay if active */}
        {uploadStage && (
          <div className="p-6 bg-base-light dark:bg-base-dark rounded-16px border border-pln-cyan/40 flex flex-col items-center justify-center gap-4 text-center animate-fade-in shadow-glow-cyan">
            {uploadStage === 'success' ? (
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center animate-bounce">
                <Sparkles className="w-7 h-7 text-emerald-400" />
              </div>
            ) : (
              <div className="relative w-14 h-14 rounded-full bg-pln-cyan/15 text-pln-cyan border border-pln-cyan/30 flex items-center justify-center">
                <Loader2 className="w-7 h-7 animate-spin" />
                <span className="absolute text-[10px] font-bold text-pln-cyan-light">{uploadProgress}%</span>
              </div>
            )}

            <div className="flex flex-col gap-1">
              <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                {uploadStage === 'validating' && 'Memvalidasi 67 Kolom Spreadsheet...'}
                {uploadStage === 'preparing' && 'Menyiapkan & Mengemas Payload Data...'}
                {uploadStage === 'sending' && 'Mengirim & Mengupdate Google Spreadsheet...'}
                {uploadStage === 'success' && '✨ Berhasil! Google Spreadsheet Telah Terupdate'}
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {uploadStage === 'success'
                  ? `${formatNumber(parsedRows.length)} data berhasil disimpan. Menutup otomatis...`
                  : 'Mohon tunggu, proses sinkronisasi sedang berlangsung...'}
              </p>
            </div>

            {/* Interactive Progress Bar */}
            <div className="w-full max-w-md h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-pln-cyan via-pln-cyan-light to-emerald-400 transition-all duration-300 rounded-full"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* File Dropzone (shown when not uploading) */}
        {!uploadStage && !selectedFile && (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-surface-light-border dark:border-surface-dark-border hover:border-pln-cyan rounded-16px p-7 flex flex-col items-center justify-center gap-3 bg-base-light/50 dark:bg-base-dark/50 cursor-pointer transition-all hover:bg-pln-cyan/5 group"
          >
            <div className="w-13 h-13 p-3 rounded-16px bg-pln-cyan/15 text-pln-cyan flex items-center justify-center group-hover:scale-110 group-hover:shadow-glow-cyan transition-all">
              <Upload className="w-7 h-7" />
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Pilih atau Drag & Drop File Excel (.xlsx, .xls) / CSV
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Format kolom otomatis disesuaikan dengan 67 header database PLN
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        )}

        {/* File Selected Card */}
        {!uploadStage && selectedFile && (
          <div className="flex items-center justify-between p-4 bg-surface-light dark:bg-surface-dark border border-pln-cyan/40 rounded-12px shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-10px bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <p className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                  {selectedFile.name}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    {formatNumber(parsedRows.length)} baris data terdeteksi
                  </span>
                  {columnValidation && (
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        columnValidation.isValid
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      <FileCheck className="w-3 h-3" />
                      {columnValidation.matchCount}/{columnValidation.totalCount} Kolom Cocok ({columnValidation.percentage}%)
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={handleClear}
              className="p-1.5 rounded-6px text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
              title="Hapus file dan pilih ulang"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {parseLoading && (
          <div className="flex items-center justify-center gap-2 py-4 text-pln-cyan">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Membaca dan memvalidasi struktur kolom Excel...</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-3 rounded-8px bg-rose-500/15 text-rose-400 border border-rose-500/30 flex items-start gap-2 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Mode & Table Preview if rows exist and not uploading */}
        {!uploadStage && parsedRows.length > 0 && (
          <>
            {/* Update Mode Options */}
            <div className="flex flex-col gap-2 p-4 bg-base-light dark:bg-base-dark rounded-12px border border-surface-light-border dark:border-surface-dark-border">
              <span className="font-bold text-slate-700 dark:text-slate-300 text-xs uppercase tracking-wider">
                Pilih Mode Pembaruan Spreadsheet:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
                {/* Option 1: Append */}
                <label
                  className={`flex items-start gap-3 p-3 rounded-8px border cursor-pointer transition-all ${
                    uploadMode === 'append'
                      ? 'bg-pln-cyan/10 border-pln-cyan text-slate-900 dark:text-white shadow-sm'
                      : 'border-surface-light-border dark:border-surface-dark-border hover:bg-surface-light-hover dark:hover:bg-surface-dark-hover text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <input
                    type="radio"
                    name="uploadMode"
                    value="append"
                    checked={uploadMode === 'append'}
                    onChange={() => setUploadMode('append')}
                    className="mt-0.5 text-pln-cyan focus:ring-pln-cyan"
                  />
                  <div className="flex flex-col">
                    <span className="font-bold text-xs flex items-center gap-1.5 text-slate-900 dark:text-white">
                      <PlusCircle className="w-3.5 h-3.5 text-pln-cyan" /> Tambah Data Baru (Append)
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Menambahkan {formatNumber(parsedRows.length)} baris baru di bawah data yang sudah ada di spreadsheet.
                    </span>
                  </div>
                </label>

                {/* Option 2: Overwrite */}
                <label
                  className={`flex items-start gap-3 p-3 rounded-8px border cursor-pointer transition-all ${
                    uploadMode === 'overwrite'
                      ? 'bg-amber-500/10 border-amber-500 text-slate-900 dark:text-white shadow-sm'
                      : 'border-surface-light-border dark:border-surface-dark-border hover:bg-surface-light-hover dark:hover:bg-surface-dark-hover text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <input
                    type="radio"
                    name="uploadMode"
                    value="overwrite"
                    checked={uploadMode === 'overwrite'}
                    onChange={() => setUploadMode('overwrite')}
                    className="mt-0.5 text-amber-500 focus:ring-amber-500"
                  />
                  <div className="flex flex-col">
                    <span className="font-bold text-xs flex items-center gap-1.5 text-amber-400">
                      <RefreshCw className="w-3.5 h-3.5" /> Timpa / Ganti Seluruh Data
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Mengosongkan data lama mulai baris 2 dan menulis data Excel baru ini.
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {/* Table Preview */}
            <div className="flex flex-col gap-2">
              <span className="font-bold text-slate-700 dark:text-slate-300 text-xs flex items-center gap-1.5">
                <Table className="w-3.5 h-3.5 text-pln-cyan" />
                Pratinjau Data (5 Baris Pertama):
              </span>
              <div className="w-full overflow-x-auto rounded-8px border border-surface-light-border dark:border-surface-dark-border bg-base-light dark:bg-base-dark">
                <table className="w-full text-[11px] text-left border-collapse">
                  <thead className="bg-surface-light dark:bg-surface-dark border-b border-surface-light-border dark:border-surface-dark-border">
                    <tr>
                      <th className="px-3 py-2 text-slate-600 dark:text-slate-300 font-bold">#</th>
                      {previewHeaders.map((h) => (
                        <th key={h} className="px-3 py-2 text-slate-600 dark:text-slate-300 font-bold whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-light-border dark:divide-surface-dark-border">
                    {parsedRows.slice(0, 5).map((row, idx) => (
                      <tr key={idx}>
                        <td className="px-3 py-1.5 text-slate-400">{idx + 1}</td>
                        {previewHeaders.map((h) => (
                          <td key={h} className="px-3 py-1.5 text-slate-900 dark:text-slate-200 whitespace-nowrap max-w-[140px] truncate">
                            {String(row[h] || '-')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Action Buttons */}
        {!uploadStage && (
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-surface-light-border dark:border-surface-dark-border">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                handleClear();
                onClose();
              }}
            >
              Batal
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={Upload}
              onClick={handleSubmit}
              disabled={parsedRows.length === 0 || isUploading}
            >
              {`Kirim & Update ke Spreadsheet (${formatNumber(parsedRows.length)} Data)`}
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
}
