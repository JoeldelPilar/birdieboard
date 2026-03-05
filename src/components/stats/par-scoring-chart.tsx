'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  type ChartOptions,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface ParScoringChartProps {
  par3Avg: number | null;
  par4Avg: number | null;
  par5Avg: number | null;
}

export function ParScoringChart({ par3Avg, par4Avg, par5Avg }: ParScoringChartProps) {
  const parValues = [3, 4, 5];
  const avgValues = [par3Avg ?? 0, par4Avg ?? 0, par5Avg ?? 0];
  const hasData = par3Avg != null || par4Avg != null || par5Avg != null;

  const data = {
    labels: ['Par 3', 'Par 4', 'Par 5'],
    datasets: [
      {
        label: 'Your average',
        data: avgValues,
        backgroundColor: 'rgba(45, 106, 79, 0.75)',
        borderColor: '#2D6A4F',
        borderWidth: 1.5,
        borderRadius: 6,
        borderSkipped: false,
      },
      {
        label: 'Par',
        data: parValues,
        backgroundColor: 'rgba(100, 116, 139, 0.2)',
        borderColor: 'rgba(100, 116, 139, 0.5)',
        borderWidth: 1.5,
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  };

  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#64748b',
          font: { size: 12 },
          usePointStyle: true,
          pointStyleWidth: 10,
        },
      },
      tooltip: {
        backgroundColor: '#1e293b',
        titleColor: '#94a3b8',
        bodyColor: '#f1f5f9',
        padding: 10,
        cornerRadius: 8,
        callbacks: {
          label: (context) => ` ${context.dataset.label}: ${(context.parsed.y ?? 0).toFixed(2)}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#64748b', font: { size: 12 } },
        border: { display: false },
      },
      y: {
        grid: { color: 'rgba(100, 116, 139, 0.1)' },
        ticks: {
          color: '#64748b',
          font: { size: 12 },
          callback: (value) => Number(value).toFixed(1),
        },
        border: { display: false },
        suggestedMin: 2,
        suggestedMax: 7,
      },
    },
  };

  if (!hasData) {
    return (
      <div className="flex items-center justify-center py-10 text-sm text-default-400">
        No par scoring data yet.
      </div>
    );
  }

  return <Bar data={data} options={options} aria-label="Average score by par chart" />;
}
