'use client';

import PlotlyChart from './PlotlyChart';
import { buildWeekLabels, isCurrentWeek } from '@/lib/week-labels';
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

  // Current (partial) week — lighter yellow with hatched pattern
  const lastIdx = gmvValues.length - 1;
  const lastIsCurrent = isCurrentWeek(weeklyData[lastIdx]?.date || '');

  const colors = gmvValues.map((_, i) =>
    i === lastIdx && lastIsCurrent ? 'rgba(252, 235, 3, 0.35)' : '#FCEB03'
  );

  // Update label for current week
  const displayLabels = labels.map((label, i) =>
    i === lastIdx && lastIsCurrent ? `${label} (in progress)` : label
  );

  const data: PlotlyData[] = [
    {
      type: 'bar',
      x: displayLabels,
      y: gmvValues,
      name: 'GMV Actual',
      marker: { color: colors },
      text: gmvValues.map((v) => `$${v.toLocaleString('en-US', { maximumFractionDigits: 0 })}`),
      textposition: 'outside',
      textfont: { color: '#9CA3AF' },
    },
    {
      type: 'scatter',
      x: displayLabels,
      y: targetValues,
      name: 'Weekly Target',
      mode: 'lines',
      line: { color: '#9CA3AF', width: 2, dash: 'dash' },
    },
  ];

  return (
    <div className="bg-zt-card rounded-xl border border-zt-border p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Weekly GMV Performance</h3>
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
