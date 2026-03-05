'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  type ChartOptions,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

interface HandicapTrendChartProps {
  labels: string[];
  values: number[];
}

export function HandicapTrendChart({ labels, values }: HandicapTrendChartProps) {
  const data = {
    labels,
    datasets: [
      {
        label: 'Handicap Index',
        data: values,
        borderColor: '#2D6A4F',
        backgroundColor: 'rgba(45, 106, 79, 0.12)',
        pointBackgroundColor: '#2D6A4F',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
        borderWidth: 2.5,
        fill: true,
        tension: 0.35,
      },
    ],
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 2,
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
          label: (context) => ` HCP ${(context.parsed.y ?? 0).toFixed(1)}`,
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#64748b',
          font: { size: 12 },
          maxRotation: 45,
        },
        border: {
          display: false,
        },
      },
      y: {
        reverse: true,
        grid: {
          color: 'rgba(100, 116, 139, 0.1)',
        },
        ticks: {
          color: '#64748b',
          font: { size: 12 },
          callback: (value) => Number(value).toFixed(1),
        },
        border: {
          display: false,
        },
      },
    },
  };

  return <Line data={data} options={options} aria-label="Handicap trend chart" />;
}
