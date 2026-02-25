'use client';

import PlotlyChart from './PlotlyChart';
import type { PodSummary } from '@/types/dashboard';
import type { PlotlyData } from '@/types/plotly';

interface PodComparisonChartProps {
  pods: PodSummary[];
}

export default function PodComparisonChart({ pods }: PodComparisonChartProps) {
  if (pods.length === 0) return null;

  const podNames = pods.map((p) => p.podName);
  const gmvValues = pods.map((p) => p.totalMtdGmv);
  const targetValues = pods.map((p) => p.totalMtdTarget);

  // Calculate sensible axis range — at least $100 if all values are 0
  const maxVal = Math.max(...gmvValues, ...targetValues, 100);

  const data: PlotlyData[] = [
    {
      type: 'bar',
      y: podNames,
      x: gmvValues,
      name: 'MTD GMV',
      orientation: 'h',
      marker: { color: '#10b981' },
      text: gmvValues.map((v) => `$${v.toLocaleString('en-US', { maximumFractionDigits: 0 })}`),
      textposition: 'outside',
    },
    {
      type: 'bar',
      y: podNames,
      x: targetValues,
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
          xaxis: {
            title: { text: 'GMV ($)' },
            tickprefix: '$',
            tickformat: ',.0f',
            range: [0, maxVal * 1.15],
          },
          legend: { orientation: 'h', y: -0.15 },
          height: Math.max(250, pods.length * 80),
        }}
      />
    </div>
  );
}
