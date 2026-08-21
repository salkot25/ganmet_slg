import React, { useState, useMemo } from 'react';
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
import { TrendingUp, PieChart } from 'lucide-react';
import { Card } from './common/Card';
import { getChartTheme, PLN_COLORS } from '../constants/plnTheme';
import { formatNumber } from '../utils/formatters';

// Register Chart.js modules
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

export function ChartsSection({ data, isDark }) {
  const [granularity, setGranularity] = useState('monthly'); // 'monthly' | 'daily'
  const theme = useMemo(() => getChartTheme(isDark), [isDark]);

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

  // Chart Options
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
          label: (ctx) => `Penggantian: ${formatNumber(ctx.raw)} Unit`
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
    <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-5">
      {/* Chart 1: Tren Penggantian (Span 2) */}
      <Card className="lg:col-span-2 flex flex-col min-h-[340px]">
        <div className="flex items-center justify-between pb-3 border-b border-surface-light-border dark:border-surface-dark-border mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-pln-cyan" />
              Tren Penggantian Meter per Tanggal Remaja
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Frekuensi peremajaan kwh meter berdasarkan waktu
            </p>
          </div>
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
        </div>
        <div className="relative flex-1 w-full min-h-[240px]">
          <Line
            data={trendChartData}
            options={{
              ...baseChartOptions,
              plugins: { ...baseChartOptions.plugins, legend: { display: false } }
            }}
          />
        </div>
      </Card>

      {/* Chart 2: Proporsi Alasan Penggantian */}
      <Card className="flex flex-col min-h-[340px]">
        <div className="pb-3 border-b border-surface-light-border dark:border-surface-dark-border mb-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-pln-cyan" />
            Distribusi Alasan Penggantian
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Breakdown alasan penggantian kWh meter
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
                  boxPadding: 4,
                  callbacks: {
                    title: (items) => {
                      return items[0]?.label || '';
                    },
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
    </section>
  );
}
