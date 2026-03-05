'use client';

import { Chart as ChartJS, ArcElement, Tooltip, Legend, type ChartOptions } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import type { ScoringDistributionEntry } from '@/server/actions/stats';

ChartJS.register(ArcElement, Tooltip, Legend);

interface ScoringDistributionChartProps {
  distribution: ScoringDistributionEntry[];
}

export function ScoringDistributionChart({ distribution }: ScoringDistributionChartProps) {
  const total = distribution.reduce((sum, entry) => sum + entry.count, 0);

  // Only include entries with count > 0
  const visible = distribution.filter((entry) => entry.count > 0);

  const data = {
    labels: visible.map((entry) => entry.label),
    datasets: [
      {
        data: visible.map((entry) => entry.count),
        backgroundColor: visible.map((entry) => entry.color),
        borderColor: 'transparent',
        borderWidth: 0,
        hoverOffset: 6,
      },
    ],
  };

  const options: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: true,
    cutout: '65%',
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#1e293b',
        titleColor: '#94a3b8',
        bodyColor: '#f1f5f9',
        padding: 10,
        cornerRadius: 8,
        callbacks: {
          label: (context) => {
            const count = context.parsed as number;
            const pct = total > 0 ? ((count / total) * 100).toFixed(1) : '0.0';
            return ` ${count} holes (${pct}%)`;
          },
        },
      },
    },
  };

  if (total === 0) {
    return (
      <div className="flex items-center justify-center py-10 text-sm text-default-400">
        No scoring data yet.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Doughnut with centre label */}
      <div className="relative mx-auto w-full max-w-[220px]">
        <Doughnut data={data} options={options} aria-label="Scoring distribution chart" />
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold">{total}</span>
          <span className="text-xs text-default-400">holes</span>
        </div>
      </div>

      {/* Legend */}
      <ul className="grid grid-cols-2 gap-x-4 gap-y-2" aria-label="Scoring legend">
        {distribution.map((entry) => {
          const pct = total > 0 ? ((entry.count / total) * 100).toFixed(1) : '0.0';
          return (
            <li key={entry.label} className="flex items-center gap-2 text-sm">
              <span
                className="h-3 w-3 flex-shrink-0 rounded-sm"
                style={{ backgroundColor: entry.color }}
                aria-hidden="true"
              />
              <span className="min-w-0 truncate text-default-600">{entry.label}</span>
              <span className="ml-auto flex-shrink-0 font-medium">
                {entry.count}
                <span className="ml-1 text-xs text-default-400">({pct}%)</span>
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
