import React, { useMemo } from 'react';
import {
  TrendingUp,
  PieChart,
  Building2,
  ArrowRight,
  Clock,
  Zap,
  Activity,
  WalletCards,
  Flame,
  Award,
  ChevronRight
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import { Card } from './common/Card';
import { Badge } from './common/Badge';
import { formatNumber, formatDaya } from '../utils/formatters';
import { getChartTheme, PLN_COLORS } from '../constants/plnTheme';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export function ExecutiveOverview({
  data,
  kpiMetrics,
  ulpAnalytics,
  isDark,
  onOpenDetail,
  onNavigateToTab,
  onFilterULP
}) {
  const theme = useMemo(() => getChartTheme(isDark), [isDark]);

  // 1. Line Trend Chart Data (Monthly)
  const trendChartData = useMemo(() => {
    const buckets = {};
    data.forEach((d) => {
      if (!d._parsedDate) return;
      const yr = d._parsedDate.getFullYear();
      const mo = String(d._parsedDate.getMonth() + 1).padStart(2, '0');
      const key = `${yr}-${mo}`;
      buckets[key] = (buckets[key] || 0) + 1;
    });

    const sortedKeys = Object.keys(buckets).sort();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

    const labels = sortedKeys.map((k) => {
      const [y, m] = k.split('-');
      return `${monthNames[parseInt(m, 10) - 1]} ${y}`;
    });

    return {
      labels,
      datasets: [
        {
          label: 'Penggantian Bulanan',
          data: sortedKeys.map((k) => buckets[k]),
          borderColor: PLN_COLORS.cyan,
          backgroundColor: isDark ? 'rgba(0, 162, 185, 0.22)' : 'rgba(0, 162, 185, 0.12)',
          fill: true,
          tension: 0.35,
          pointBackgroundColor: PLN_COLORS.cyanLight,
          pointBorderColor: '#FFFFFF',
          pointRadius: 3.5,
          borderWidth: 2.5
        }
      ]
    };
  }, [data, isDark]);

  // 2. Reason Doughnut Chart Data
  const reasonChartData = useMemo(() => {
    const counts = {};
    data.forEach((d) => {
      const al = (d.ALASAN_GANTI_METER || 'Lainnya').trim();
      counts[al] = (counts[al] || 0) + 1;
    });

    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    const top = sorted.slice(0, 4);
    const other = sorted.slice(4).reduce((acc, curr) => acc + curr[1], 0);

    const labels = top.map((r) => r[0]);
    const values = top.map((r) => r[1]);
    if (other > 0) {
      labels.push('Lainnya');
      values.push(other);
    }

    const palette = [
      PLN_COLORS.cyan,
      PLN_COLORS.cyanLight,
      PLN_COLORS.yellow,
      PLN_COLORS.orange,
      PLN_COLORS.blue
    ];

    return {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: palette.slice(0, labels.length),
          borderWidth: 2,
          borderColor: theme.borderColor
        }
      ]
    };
  }, [data, theme.borderColor]);

  // Top ULP
  const topUlp = ulpAnalytics && ulpAnalytics.length > 0 ? ulpAnalytics[0] : null;

  // Recent 5 Transactions
  const recentRecords = useMemo(() => {
    return [...data].slice(0, 5);
  }, [data]);

  const getServiceBadge = (kd) => {
    const code = (kd || '').toUpperCase();
    if (code.startsWith('P')) return <Badge variant="cyan">Prabayar</Badge>;
    if (code.startsWith('M')) return <Badge variant="orange">Paskabayar</Badge>;
    if (code.startsWith('E')) return <Badge variant="orange">Paskabayar</Badge>;
    return <Badge variant="slate">Lainnya</Badge>;
  };

  return (
    <div className="flex flex-col gap-5 md:gap-6 animate-fade-in">
      {/* 1. Executive Strategic KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        {/* KPI 1: Total Penggantian */}
        <Card className="flex items-center gap-4 relative overflow-hidden group hover:border-pln-cyan transition-all">
          <div className="w-12 h-12 rounded-12px bg-pln-cyan/15 border border-pln-cyan/30 flex items-center justify-center text-pln-cyan flex-shrink-0 group-hover:scale-105 transition-all shadow-glow-cyan">
            <Zap className="w-6 h-6 text-pln-yellow fill-pln-yellow" />
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 tracking-wider">
              TOTAL PENGGANTIAN
            </span>
            <div className="flex items-baseline gap-1.5 my-0.5">
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {formatNumber(kpiMetrics.total)}
              </h2>
              <span className="text-xs text-slate-400 font-semibold">Unit</span>
            </div>
            <span className="text-[11px] text-slate-400">
              {kpiMetrics.totalPercent}% dari total basis data
            </span>
          </div>
        </Card>

        {/* KPI 2: Meter Prabayar (LPB) */}
        <Card className="flex items-center gap-4 relative overflow-hidden group hover:border-emerald-500/50 transition-all">
          <div className="w-12 h-12 rounded-12px bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 flex-shrink-0 group-hover:scale-105 transition-all">
            <WalletCards className="w-6 h-6" />
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 tracking-wider">
              METER PRABAYAR (LPB)
            </span>
            <div className="flex items-baseline gap-1.5 my-0.5">
              <h2 className="text-2xl font-extrabold text-emerald-400 tracking-tight">
                {formatNumber(kpiMetrics.prabayarCount)}
              </h2>
              <span className="text-xs text-slate-400 font-semibold">Unit</span>
            </div>
            <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700/60 rounded-full overflow-hidden my-0.5">
              <div
                className="h-full bg-emerald-400 transition-all duration-500"
                style={{ width: `${kpiMetrics.prabayarPercent}%` }}
              />
            </div>
            <span className="text-[11px] text-slate-400">
              {kpiMetrics.prabayarPercent}% dari total penggantian
            </span>
          </div>
        </Card>

        {/* KPI 3: Meter Paskabayar */}
        <Card className="flex items-center gap-4 relative overflow-hidden group hover:border-amber-500/50 transition-all">
          <div className="w-12 h-12 rounded-12px bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 flex-shrink-0 group-hover:scale-105 transition-all">
            <Activity className="w-6 h-6" />
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 tracking-wider">
              METER PASKABAYAR
            </span>
            <div className="flex items-baseline gap-1.5 my-0.5">
              <h2 className="text-2xl font-extrabold text-amber-400 tracking-tight">
                {formatNumber(kpiMetrics.paskaCount)}
              </h2>
              <span className="text-xs text-slate-400 font-semibold">Unit</span>
            </div>
            <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700/60 rounded-full overflow-hidden my-0.5">
              <div
                className="h-full bg-amber-400 transition-all duration-500"
                style={{ width: `${kpiMetrics.paskaPercent}%` }}
              />
            </div>
            <span className="text-[11px] text-slate-400">
              {kpiMetrics.paskaPercent}% dari total penggantian
            </span>
          </div>
        </Card>

        {/* KPI 4: Unit ULP Paling Aktif */}
        <Card className="flex items-center gap-4 relative overflow-hidden group hover:border-pln-yellow/50 transition-all">
          <div className="w-12 h-12 rounded-12px bg-pln-yellow/15 border border-pln-yellow/30 flex items-center justify-center text-pln-yellow flex-shrink-0 group-hover:scale-105 transition-all shadow-glow-yellow">
            <Award className="w-6 h-6" />
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 tracking-wider">
              ULP TERTINGGI
            </span>
            <div className="my-0.5">
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight truncate">
                UNITUP {topUlp ? topUlp.unit : '-'}
              </h2>
            </div>
            <span className="text-[11px] text-slate-400 truncate">
              {topUlp ? formatNumber(topUlp.total) : 0} Unit ({topUlp && kpiMetrics.total > 0 ? ((topUlp.total / kpiMetrics.total) * 100).toFixed(1) : 0}%)
            </span>
          </div>
        </Card>
      </div>

      {/* 2. Executive Visual Highlights (Line Trend + Alasan Donut) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-5">
        {/* Left: Tren Waktu (Span 2) */}
        <Card className="lg:col-span-2 flex flex-col min-h-[340px]">
          <div className="flex items-center justify-between pb-3 border-b border-surface-light-border dark:border-surface-dark-border mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-pln-cyan" />
                Tren Peremajaan Meter Bulanan
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Aktivitas peremajaan kWh meter seiring berjalannya waktu
              </p>
            </div>
            <button
              onClick={() => onNavigateToTab('analytics')}
              className="text-xs font-bold text-pln-cyan hover:underline flex items-center gap-1"
            >
              Analisis Lengkap &rarr;
            </button>
          </div>
          <div className="relative flex-1 w-full min-h-[240px]">
            <Line
              data={trendChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false },
                  tooltip: {
                    backgroundColor: theme.tooltipBg,
                    titleColor: theme.tooltipTitle,
                    bodyColor: theme.tooltipBody,
                    borderColor: theme.tooltipBorder,
                    borderWidth: 1,
                    padding: 10,
                    callbacks: {
                      label: (ctx) => ` Penggantian: ${formatNumber(ctx.raw)} Unit`
                    }
                  }
                },
                scales: {
                  x: {
                    grid: { color: theme.gridColor },
                    ticks: { color: theme.textColor, font: { family: 'Plus Jakarta Sans', size: 10 } }
                  },
                  y: {
                    beginAtZero: true,
                    grid: { color: theme.gridColor },
                    ticks: {
                      color: theme.textColor,
                      font: { family: 'Plus Jakarta Sans', size: 10 },
                      callback: (v) => formatNumber(v)
                    }
                  }
                }
              }}
            />
          </div>
        </Card>

        {/* Right: Proporsi Alasan */}
        <Card className="flex flex-col min-h-[340px]">
          <div className="pb-3 border-b border-surface-light-border dark:border-surface-dark-border mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-pln-cyan" />
              Alasan Penggantian Terbanyak
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Faktor penyebab penggantian meter
            </p>
          </div>
          <div className="relative flex-1 w-full min-h-[240px] flex items-center justify-center">
            <Doughnut
              data={reasonChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                cutout: '68%',
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: {
                      color: theme.textColor,
                      font: { family: 'Plus Jakarta Sans', size: 10, weight: '500' },
                      boxWidth: 10,
                      padding: 6
                    }
                  },
                  tooltip: {
                    backgroundColor: theme.tooltipBg,
                    titleColor: theme.tooltipTitle,
                    bodyColor: theme.tooltipBody,
                    borderColor: theme.tooltipBorder,
                    borderWidth: 1,
                    padding: 10,
                    callbacks: {
                      title: (items) => items[0]?.label || '',
                      label: (ctx) => {
                        const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                        const val = ctx.raw;
                        const pct = total > 0 ? ((val / total) * 100).toFixed(1) : 0;
                        return ` ${formatNumber(val)} unit (${pct}%)`;
                      }
                    }
                  }
                }
              }}
            />
          </div>
        </Card>
      </div>

      {/* 3. Executive Two-Column Section: Leaderboard ULP + Recent Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-5">
        {/* Left: Ringkasan Kinerja per Unit ULP */}
        <Card className="flex flex-col gap-3">
          <div className="flex items-center justify-between pb-3 border-b border-surface-light-border dark:border-surface-dark-border">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-pln-cyan" />
                Matriks Kinerja per Unit Kerja (ULP)
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Peringkat volume peremajaan dan proporsi prabayar per ULP
              </p>
            </div>
            <button
              onClick={() => onNavigateToTab('analytics')}
              className="text-xs font-bold text-pln-cyan hover:underline flex items-center gap-1"
            >
              Lihat Semua &rarr;
            </button>
          </div>

          <div className="divide-y divide-surface-light-border dark:divide-surface-dark-border/40 text-xs">
            {ulpAnalytics.slice(0, 5).map((u, idx) => {
              const prabayarPct = u.total > 0 ? ((u.prabayar / u.total) * 100).toFixed(0) : 0;
              const shareOfTotal = kpiMetrics.total > 0 ? ((u.total / kpiMetrics.total) * 100).toFixed(1) : 0;

              return (
                <div key={u.unit} className="py-2.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span className="w-5 font-mono text-slate-400 font-bold text-center">
                      #{idx + 1}
                    </span>
                    <div className="flex flex-col min-w-0 flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-slate-900 dark:text-white truncate">
                          UNITUP {u.unit}
                        </span>
                        <span className="font-mono font-bold text-slate-900 dark:text-white">
                          {formatNumber(u.total)} unit ({shareOfTotal}%)
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden flex">
                        <div
                          className="h-full bg-pln-cyan"
                          style={{ width: `${prabayarPct}%` }}
                          title={`Prabayar: ${prabayarPct}%`}
                        />
                        <div
                          className="h-full bg-amber-400"
                          style={{ width: `${100 - prabayarPct}%` }}
                          title={`Paskabayar: ${100 - prabayarPct}%`}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                        <span>LPB: {formatNumber(u.prabayar)} ({prabayarPct}%)</span>
                        <span>Paska: {formatNumber(u.paskabayar)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Right: Rekaman Penggantian Terkini */}
        <Card className="flex flex-col gap-3">
          <div className="flex items-center justify-between pb-3 border-b border-surface-light-border dark:border-surface-dark-border">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Clock className="w-4 h-4 text-pln-cyan" />
                Catatan Penggantian Terkini
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Sampel transaksi peremajaan meter terakhir yang tercatat
              </p>
            </div>
            <button
              onClick={() => onNavigateToTab('grid')}
              className="text-xs font-bold text-pln-cyan hover:underline flex items-center gap-1"
            >
              Buka Data Grid &rarr;
            </button>
          </div>

          <div className="divide-y divide-surface-light-border dark:divide-surface-dark-border/40 text-xs">
            {recentRecords.map((item) => (
              <div
                key={item._id}
                onClick={() => onOpenDetail(item)}
                className="py-2 flex items-center justify-between gap-3 hover:bg-pln-cyan/5 dark:hover:bg-pln-cyan/10 p-1.5 rounded-6px cursor-pointer transition-colors group"
              >
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] font-bold text-pln-cyan-light">
                      {item.IDPEL}
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white truncate max-w-[150px]">
                      {item.NAMA}
                    </span>
                    {getServiceBadge(item.KDPEMBMETER)}
                  </div>
                  <span className="text-[10px] text-slate-400 truncate mt-0.5">
                    ULP {item.UNITUP} • {item.ALASAN_GANTI_METER} • {item.TGLREMAJA}
                  </span>
                </div>

                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-pln-cyan group-hover:translate-x-0.5 transition-all flex-shrink-0" />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
