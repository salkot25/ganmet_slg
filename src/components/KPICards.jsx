import React from 'react';
import { Gauge, WalletCards, Activity, Flame, Radio, ArrowUpRight } from 'lucide-react';
import { Card } from './common/Card';
import { formatNumber } from '../utils/formatters';

export function KPICards({ metrics, onQuickFilterLayanan }) {
  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
      {/* KPI 1: Total Penggantian */}
      <Card className="relative overflow-hidden flex items-center gap-4 group hover:border-pln-cyan transition-all">
        <div className="w-12 h-12 rounded-12px bg-pln-cyan/15 border border-pln-cyan/30 flex items-center justify-center text-pln-cyan-light flex-shrink-0 group-hover:scale-105 group-hover:shadow-glow-cyan transition-all">
          <Gauge className="w-6 h-6" />
        </div>
        <div className="flex flex-col min-w-0 flex-1">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 tracking-wider">
            TOTAL PENGGANTIAN
          </span>
          <div className="flex items-baseline gap-1.5 my-0.5">
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {formatNumber(metrics.total)}
            </h2>
            <span className="text-xs text-slate-400 font-semibold">Unit</span>
          </div>
          <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700/60 rounded-full overflow-hidden my-1">
            <div
              className="h-full bg-pln-cyan transition-all duration-500"
              style={{ width: `${Math.min(parseFloat(metrics.totalPercent) || 0, 100)}%` }}
            />
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            {metrics.totalPercent}% dari total basis data
          </span>
        </div>
      </Card>

      {/* KPI 2: Meter Prabayar */}
      <Card
        onClick={() => onQuickFilterLayanan && onQuickFilterLayanan('PRABAYAR')}
        className="relative overflow-hidden flex items-center gap-4 group hover:border-emerald-500/60 cursor-pointer transition-all"
        title="Klik untuk memfilter hanya meter Prabayar"
      >
        <div className="w-12 h-12 rounded-12px bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 flex-shrink-0 group-hover:scale-105 transition-all">
          <WalletCards className="w-6 h-6" />
        </div>
        <div className="flex flex-col min-w-0 flex-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 tracking-wider">
              PRABAYAR (LPB)
            </span>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="flex items-baseline gap-1.5 my-0.5">
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight text-emerald-400">
              {formatNumber(metrics.prabayarCount)}
            </h2>
            <span className="text-xs text-slate-400 font-semibold">Unit</span>
          </div>
          <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700/60 rounded-full overflow-hidden my-1">
            <div
              className="h-full bg-emerald-400 transition-all duration-500"
              style={{ width: `${metrics.prabayarPercent}%` }}
            />
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            {metrics.prabayarPercent}% Proporsi Prabayar
          </span>
        </div>
      </Card>

      {/* KPI 3: Meter Paskabayar */}
      <Card
        onClick={() => onQuickFilterLayanan && onQuickFilterLayanan('PASKABAYAR')}
        className="relative overflow-hidden flex items-center gap-4 group hover:border-amber-500/60 cursor-pointer transition-all"
        title="Klik untuk memfilter hanya meter Paskabayar"
      >
        <div className="w-12 h-12 rounded-12px bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 flex-shrink-0 group-hover:scale-105 transition-all">
          <Activity className="w-6 h-6" />
        </div>
        <div className="flex flex-col min-w-0 flex-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 tracking-wider">
              METER PASKABAYAR
            </span>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="flex items-baseline gap-1.5 my-0.5">
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight text-amber-400">
              {formatNumber(metrics.paskaCount)}
            </h2>
            <span className="text-xs text-slate-400 font-semibold">Unit</span>
          </div>
          <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700/60 rounded-full overflow-hidden my-1">
            <div
              className="h-full bg-amber-400 transition-all duration-500"
              style={{ width: `${metrics.paskaPercent}%` }}
            />
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            {metrics.paskaPercent}% Proporsi Paskabayar
          </span>
        </div>
      </Card>

      {/* KPI 4: Top Alasan Penggantian */}
      <Card className="relative overflow-hidden flex items-center gap-4 group hover:border-pln-yellow/60 transition-all">
        <div className="w-12 h-12 rounded-12px bg-pln-yellow/15 border border-pln-yellow/30 flex items-center justify-center text-pln-yellow flex-shrink-0 group-hover:scale-105 group-hover:shadow-glow-yellow transition-all">
          <Flame className="w-6 h-6" />
        </div>
        <div className="flex flex-col min-w-0 flex-1">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 tracking-wider">
            ALASAN TERBANYAK
          </span>
          <div className="my-0.5">
            <h3
              className="text-sm font-bold text-slate-900 dark:text-white truncate"
              title={metrics.topReasonName}
            >
              {metrics.topReasonName}
            </h3>
          </div>
          <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700/60 rounded-full overflow-hidden my-1">
            <div
              className="h-full bg-pln-yellow transition-all duration-500"
              style={{ width: `${Math.min(parseFloat(metrics.topReasonPercent) || 0, 100)}%` }}
            />
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate">
            {formatNumber(metrics.topReasonCount)} unit ({metrics.topReasonPercent}%)
          </span>
        </div>
      </Card>
    </section>
  );
}
