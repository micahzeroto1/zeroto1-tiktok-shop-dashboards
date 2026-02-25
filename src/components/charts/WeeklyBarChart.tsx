'use client';

import PlotlyChart from './PlotlyChart';
import { buildWeekLabels } from '@/lib/week-labels';
import type { WeeklyRollup } from '@/types/dashboard';
import type { PlotlyData } from '@/types/plotly';

interface WeeklyBarChartProps {
  weeklyData: WeeklyRollup[];
}

export default function WeeklyBarChart({ weeklyData }: WeeklyBarChartProps) {
  if (weeklyData.length === 0) return null;

  const labels = buildWeekLabels(weeklyData);
  const gmvValues = weeklyData.map((w) => w.dailyGmv);
  const targetValues = weeklyData.map((w) => w.gmvTarget);

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
          xaxis: { title: { text: 'Week' }, tickangle: -30 },
          yaxis: {
            title: { text: 'GMV ($)' },
            tickprefix: '$',
            tickformat: ',.0f',
          },
          legend: { orientation: 'h', y: -0.25 },
          height: 370,
        }}
      />
    </div>
  );
}
