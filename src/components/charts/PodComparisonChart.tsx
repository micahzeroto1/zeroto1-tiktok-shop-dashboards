'use client';

import PlotlyChart from './PlotlyChart';
import type { PodSummary } from '@/types/dashboard';
import type { PlotlyData } from '@/types/plotly';

interface PodComparisonChartProps {
  pods: PodSummary[];
}

export default function PodComparisonChart({ pods }: PodComparisonChartProps) {
  const podNames = pods.map((p) => p.podName);

  const data: PlotlyData[] = [
    {
      type: 'bar',
      y: podNames,
      x: pods.map((p) => p.totalMtdGmv),
      name: 'MTD GMV',
      orientation: 'h',
      marker: { color: '#10b981' },
    },
    {
      type: 'bar',
      y: podNames,
      x: pods.map((p) => p.totalMtdTarget),
      name: 'Target',
      orientation: 'h',
      marker: { color: 'rgba(239, 68, 68, 0.3)' },
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <h3 className="text-lg font-semibold text-navy-900 mb-4">Pod GMV Comparison</h3>
      <PlotlyChart
        data={data}
        layout={{
          barmode: 'group',
          xaxis: { title: { text: 'GMV ($)' }, tickprefix: '$' },
          legend: { orientation: 'h', y: -0.15 },
          height: Math.max(250, pods.length * 80),
        }}
      />
    </div>
  );
}
