import React, { useState, useMemo, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import {
  TrendingUp,
  PieChart,
  BarChart3,
  GitCompare,
  Zap,
  Download,
  Building2,
  Layers,
  ArrowRight
} from 'lucide-react';
import { Card } from './common/Card';
import { getChartTheme, PLN_COLORS } from '../constants/plnTheme';
import { formatNumber } from '../utils/formatters';

// Register Chart.js modules
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export function ChartsSection({
  data,
  isDark,
  ulpAnalytics,
  brandMigrationAnalytics,
  dayaTarifAnalytics
}) {
  const [granularity, setGranularity] = useState('monthly'); // 'monthly' | 'daily'
  const [activeChartView, setActiveChartView] = useState('all'); // 'all' | 'trend' | 'ulp' | 'brand' | 'tarif'
  const theme = useMemo(() => getChartTheme(isDark), [isDark]);

  const trendChartRef = useRef(null);
  const ulpChartRef = useRef(null);

  // 1. Memoized Trend Data
  const trendChartData = useMemo(() => {
    const buckets = {};
    data.forEach((d) => {
      if (!d._parsedDate) return;
      let key;
      const yr = d._parsedDate.getFullYear();
      const mo = String(d._parsedDate.getMonth() + 1).padStart(2, '0');
      if (granularity === 'monthly') {
        key = `${yr}-${mo}`;
      } else {
        const dy = String(d._parsedDate.getDate()).padStart(2, '0');
        key = `${yr}-${mo}-${dy}`;
      }
      buckets[key] = (buckets[key] || 0) + 1;
    });

    const sortedKeys = Object.keys(buckets).sort();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

    const labels = sortedKeys.map((k) => {
      if (granularity === 'monthly') {
        const [y, m] = k.split('-');
        return `${monthNames[parseInt(m, 10) - 1]} ${y}`;
      }
      const [y, m, d] = k.split('-');
      return `${d}/${m}/${y}`;
    });

    return {
      labels,
      datasets: [
        {
          label: 'Jumlah Penggantian',
          data: sortedKeys.map((k) => buckets[k]),
          borderColor: PLN_COLORS.cyan,
          backgroundColor: isDark ? 'rgba(0, 162, 185, 0.22)' : 'rgba(0, 162, 185, 0.12)',
          fill: true,
          tension: 0.35,
          pointBackgroundColor: PLN_COLORS.cyanLight,
          pointBorderColor: '#FFFFFF',
          pointHoverRadius: 6,
          pointRadius: granularity === 'daily' ? 1.5 : 3.5,
          borderWidth: 2.5
        }
      ]
    };
  }, [data, granularity, isDark]);

  // 2. Memoized Reason Data (Top 5 + Lainnya)
  const reasonChartData = useMemo(() => {
    const counts = {};
    data.forEach((d) => {
      const al = (d.ALASAN_GANTI_METER || 'Lainnya').trim();
      counts[al] = (counts[al] || 0) + 1;
    });

    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    const top = sorted.slice(0, 5);
    const other = sorted.slice(5).reduce((acc, curr) => acc + curr[1], 0);

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
      PLN_COLORS.blue,
      PLN_COLORS.slate
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

  // 3. Memoized ULP Leaderboard Bar Chart Data
  const ulpChartData = useMemo(() => {
    if (!ulpAnalytics || ulpAnalytics.length === 0) return { labels: [], datasets: [] };

    const labels = ulpAnalytics.map(u => `ULP ${u.unit}`);
    const prabayar = ulpAnalytics.map(u => u.prabayar);
    const paskabayar = ulpAnalytics.map(u => u.paskabayar);

    return {
      labels,
      datasets: [
        {
          label: 'Prabayar (LPB)',
          data: prabayar,
          backgroundColor: '#00C2CB',
          borderRadius: 4
        },
        {
          label: 'Paskabayar',
          data: paskabayar,
          backgroundColor: '#F59E0B',
          borderRadius: 4
        }
      ]
    };
  }, [ulpAnalytics]);

  // 4. Memoized Daya Distribution Chart Data
  const dayaChartData = useMemo(() => {
    if (!dayaTarifAnalytics) return { labels: [], datasets: [] };
    const { dayaBuckets } = dayaTarifAnalytics;
    return {
      labels: Object.keys(dayaBuckets),
      datasets: [
        {
          label: 'Jumlah Pelanggan',
          data: Object.values(dayaBuckets),
          backgroundColor: [
            '#00A2B9',
            '#00C2CB',
            '#3B82F6',
            '#F59E0B',
            '#10B981'
          ],
          borderRadius: 6
        }
      ]
    };
  }, [dayaTarifAnalytics]);

  // Export Chart Image PNG helper
  const downloadChartImage = (chartRef, filename = 'Chart_PLN.png') => {
    if (!chartRef || !chartRef.current) return;
    const chart = chartRef.current;
    const imageUri = chart.toBase64Image();
    const link = document.createElement('a');
    link.href = imageUri;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Base Options
  const baseChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        backgroundColor: theme.tooltipBg,
        titleColor: theme.tooltipTitle,
        titleFont: { family: 'Plus Jakarta Sans', size: 12, weight: '700' },
        bodyColor: theme.tooltipBody,
        bodyFont: { family: 'Plus Jakarta Sans', size: 11, weight: '600' },
        borderColor: theme.tooltipBorder,
        borderWidth: 1,
        padding: 10,
        callbacks: {
          label: (ctx) => ` ${ctx.dataset.label || 'Jumlah'}: ${formatNumber(ctx.raw)} Unit`
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
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Visual Analytics Header & Category Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-surface-light dark:bg-surface-dark border border-surface-light-border dark:border-surface-dark-border rounded-12px shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-8px bg-pln-cyan/15 border border-pln-cyan/30 flex items-center justify-center text-pln-cyan">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Analitik Visual & Intelijen Bisnis
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Visualisasi tren waktu, komparasi kinerja unit kerja, dan migrasi teknologi meter
            </p>
          </div>
        </div>

        {/* View Switcher Buttons */}
        <div className="flex gap-1 p-1 bg-base-light dark:bg-base-dark border border-surface-light-border dark:border-surface-dark-border rounded-8px overflow-x-auto w-full sm:w-auto">
          {[
            { id: 'all', label: 'Semua Grafik' },
            { id: 'trend', label: 'Tren Waktu' },
            { id: 'ulp', label: 'Komparasi ULP' },
            { id: 'brand', label: 'Migrasi Merk' },
            { id: 'tarif', label: 'Daya & Tarif' }
          ].map((v) => (
            <button
              key={v.id}
              onClick={() => setActiveChartView(v.id)}
              className={`px-3 py-1.5 rounded-6px text-xs font-semibold whitespace-nowrap transition-all ${
                activeChartView === v.id
                  ? 'bg-pln-cyan text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* Row 1: Tren Waktu & Distribusi Alasan */}
      {(activeChartView === 'all' || activeChartView === 'trend') && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-5">
          {/* Chart 1: Tren Penggantian (Span 2) */}
          <Card className="lg:col-span-2 flex flex-col min-h-[360px]">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-surface-light-border dark:border-surface-dark-border mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-pln-cyan" />
                  Tren Penggantian Meter per Tanggal Remaja
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Frekuensi peremajaan kwh meter berdasarkan waktu
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex p-0.5 bg-base-light dark:bg-base-dark border border-surface-light-border dark:border-surface-dark-border rounded-6px">
                  <button
                    onClick={() => setGranularity('monthly')}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-4px transition-all ${
                      granularity === 'monthly'
                        ? 'bg-pln-cyan text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Bulanan
                  </button>
                  <button
                    onClick={() => setGranularity('daily')}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-4px transition-all ${
                      granularity === 'daily'
                        ? 'bg-pln-cyan text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Harian
                  </button>
                </div>
                <button
                  onClick={() => downloadChartImage(trendChartRef, 'Tren_Penggantian_PLN.png')}
                  className="p-1.5 rounded-6px border border-surface-light-border dark:border-surface-dark-border text-slate-400 hover:text-pln-cyan hover:bg-base-light dark:hover:bg-base-dark transition-colors"
                  title="Unduh grafik sebagai gambar PNG"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <div className="relative flex-1 w-full min-h-[250px]">
              <Line
                ref={trendChartRef}
                data={trendChartData}
                options={{
                  ...baseChartOptions,
                  plugins: { ...baseChartOptions.plugins, legend: { display: false } }
                }}
              />
            </div>
          </Card>

          {/* Chart 2: Proporsi Alasan Penggantian */}
          <Card className="flex flex-col min-h-[360px]">
            <div className="pb-3 border-b border-surface-light-border dark:border-surface-dark-border mb-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <PieChart className="w-4 h-4 text-pln-cyan" />
                Distribusi Alasan Penggantian
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Breakdown alasan penggantian kWh meter
              </p>
            </div>
            <div className="relative flex-1 w-full min-h-[250px] flex items-center justify-center">
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
                        padding: 8
                      }
                    },
                    tooltip: {
                      backgroundColor: theme.tooltipBg,
                      titleColor: theme.tooltipTitle,
                      titleFont: { family: 'Plus Jakarta Sans', size: 12, weight: '700' },
                      bodyColor: theme.tooltipBody,
                      bodyFont: { family: 'Plus Jakarta Sans', size: 11, weight: '600' },
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
      )}

      {/* Row 2: ULP Leaderboard & Daya Segment */}
      {(activeChartView === 'all' || activeChartView === 'ulp' || activeChartView === 'tarif') && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-5">
          {/* Chart 3: Komparasi ULP */}
          {(activeChartView === 'all' || activeChartView === 'ulp') && (
            <Card className="flex flex-col min-h-[360px]">
              <div className="flex items-center justify-between pb-3 border-b border-surface-light-border dark:border-surface-dark-border mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-pln-cyan" />
                    Komparasi Volume Penggantian per Unit ULP
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Perbandingan peremajaan Prabayar vs Paskabayar per unit kerja
                  </p>
                </div>
                <button
                  onClick={() => downloadChartImage(ulpChartRef, 'Komparasi_ULP_PLN.png')}
                  className="p-1.5 rounded-6px border border-surface-light-border dark:border-surface-dark-border text-slate-400 hover:text-pln-cyan hover:bg-base-light dark:hover:bg-base-dark transition-colors"
                  title="Unduh grafik sebagai gambar PNG"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="relative flex-1 w-full min-h-[250px]">
                <Bar
                  ref={ulpChartRef}
                  data={ulpChartData}
                  options={{
                    ...baseChartOptions,
                    scales: {
                      x: {
                        stacked: true,
                        grid: { color: theme.gridColor },
                        ticks: { color: theme.textColor, font: { family: 'Plus Jakarta Sans', size: 10 } }
                      },
                      y: {
                        stacked: true,
                        beginAtZero: true,
                        grid: { color: theme.gridColor },
                        ticks: {
                          color: theme.textColor,
                          font: { family: 'Plus Jakarta Sans', size: 10 },
                          callback: (v) => formatNumber(v)
                        }
                      }
                    },
                    plugins: {
                      ...baseChartOptions.plugins,
                      legend: {
                        position: 'top',
                        labels: {
                          color: theme.textColor,
                          font: { family: 'Plus Jakarta Sans', size: 10, weight: '600' }
                        }
                      }
                    }
                  }}
                />
              </div>
            </Card>
          )}

          {/* Chart 4: Segmentasi Daya Pelanggan */}
          {(activeChartView === 'all' || activeChartView === 'tarif') && (
            <Card className="flex flex-col min-h-[360px]">
              <div className="pb-3 border-b border-surface-light-border dark:border-surface-dark-border mb-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-pln-cyan" />
                  Distribusi Golongan Daya Pelanggan
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Segmentasi kapasitas daya meter yang dilakukan peremajaan
                </p>
              </div>
              <div className="relative flex-1 w-full min-h-[250px]">
                <Bar
                  data={dayaChartData}
                  options={{
                    ...baseChartOptions,
                    plugins: {
                      ...baseChartOptions.plugins,
                      legend: { display: false }
                    }
                  }}
                />
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Row 3: Matriks Migrasi Merk Meter (Lama vs Baru) */}
      {(activeChartView === 'all' || activeChartView === 'brand') && brandMigrationAnalytics && (
        <Card className="flex flex-col gap-4">
          <div className="flex items-center justify-between pb-3 border-b border-surface-light-border dark:border-surface-dark-border">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <GitCompare className="w-4 h-4 text-pln-cyan" />
                Matriks & Pola Migrasi Merk Meter (Bongkar &rarr; Pasang)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pola penggantian merk meter lama ke merk meter baru
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {/* Top 5 Merk Lama */}
            <div className="p-3.5 bg-base-light dark:bg-base-dark rounded-10px border border-surface-light-border dark:border-surface-dark-border flex flex-col gap-2.5">
              <span className="font-bold text-amber-500 text-xs uppercase tracking-wider">
                Top 5 Merk Meter Lama (Dibongkar)
              </span>
              <div className="space-y-2">
                {brandMigrationAnalytics.topOld.map(([brand, count], idx) => (
                  <div key={brand} className="flex items-center justify-between">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {idx + 1}. {brand}
                    </span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      {formatNumber(count)} unit
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top 5 Merk Baru */}
            <div className="p-3.5 bg-base-light dark:bg-base-dark rounded-10px border border-surface-light-border dark:border-surface-dark-border flex flex-col gap-2.5">
              <span className="font-bold text-emerald-400 text-xs uppercase tracking-wider">
                Top 5 Merk Meter Baru (Dipasang)
              </span>
              <div className="space-y-2">
                {brandMigrationAnalytics.topNew.map(([brand, count], idx) => (
                  <div key={brand} className="flex items-center justify-between">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {idx + 1}. {brand}
                    </span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      {formatNumber(count)} unit
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Alur Migrasi */}
            <div className="p-3.5 bg-pln-cyan/10 rounded-10px border border-pln-cyan/30 flex flex-col gap-2.5">
              <span className="font-bold text-pln-cyan text-xs uppercase tracking-wider">
                Alur Migrasi Merk Terpopuler
              </span>
              <div className="space-y-2">
                {brandMigrationAnalytics.topFlows.map((flow, idx) => (
                  <div key={idx} className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5 truncate max-w-[170px]">
                      <span className="text-slate-400 truncate">{flow.from}</span>
                      <ArrowRight className="w-3 h-3 text-pln-cyan flex-shrink-0" />
                      <span className="text-pln-cyan-light font-bold truncate">{flow.to}</span>
                    </div>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      {formatNumber(flow.count)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
