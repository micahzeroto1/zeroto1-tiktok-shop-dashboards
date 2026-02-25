'use client';

import PlotlyChart from './PlotlyChart';
import type { WeeklyRollup } from '@/types/dashboard';
import type { PlotlyData } from '@/types/plotly';

interface WeeklyBarChartProps {
  weeklyData: WeeklyRollup[];
}

/** Shorten week labels for the x-axis (e.g., "Week 1" → "W1") */
function shortenLabel(label: string): string {
  const weekMatch = label.match(/week\s*(\d+)/i);
  if (weekMatch) return `W${weekMatch[1]}`;
  if (label.length <= 8) return label;
  return label.substring(0, 8);
}

export default function WeeklyBarChart({ weeklyData }: WeeklyBarChartProps) {
  // Data comes from pre-aggregated weekly rollup rows
  if (weeklyData.length === 0) return null;

  const labels = weeklyData.map((w) => shortenLabel(w.weekLabel || w.date));
  const gmvValues = weeklyData.map((w) => w.dailyGmv);
  const targetValues = weeklyData.map((w) => w.gmvTarget); // weekly target = sum of daily targets

  // Last bar is current (partial) week — use lighter color
  const colors = gmvValues.map((_, i) =>
    i === gmvValues.length - 1 ? 'rgba(16, 185, 129, 0.4)' : 'rgba(16, 185, 129, 0.85)'
  );

  const data: PlotlyData[] = [
    {
      type: 'bar',
      x: labels,
      y: gmvValues,
      name: 'GMV Actual',
      marker: { color: colors },
      text: gmvValues.map((v) => `$${v.toLocaleString('en-US', { maximumFractionDigits: 0 })}`),
      textposition: 'outside',
    },
    {
      type: 'scatter',
      x: labels,
      y: targetValues,
      name: 'Weekly Target',
      mode: 'lines',
      line: { color: '#ef4444', width: 2, dash: 'dash' },
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <h3 className="text-lg font-semibold text-navy-900 mb-4">Weekly GMV Performance</h3>
      <PlotlyChart
        data={data}
        layout={{
          barmode: 'group',
          xaxis: { title: { text: 'Week' }, tickangle: 0 },
          yaxis: {
            title: { text: 'GMV ($)' },
            tickprefix: '$',
            tickformat: ',.0f',
          },
          legend: { orientation: 'h', y: -0.2 },
          height: 350,
        }}
      />
    </div>
  );
}
