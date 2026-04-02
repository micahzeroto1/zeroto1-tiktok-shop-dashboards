'use client';

import PlotlyChart from './PlotlyChart';
import { useIsMobile } from '@/hooks/useIsMobile';
import type { MonthlyAggregate } from '@/types/dashboard';
import type { PlotlyData } from '@/types/plotly';

const MONTH_ORDER = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

interface MonthlyBarChartProps {
  monthlyData: MonthlyAggregate[];
}

export default function MonthlyBarChart({ monthlyData }: MonthlyBarChartProps) {
  const isMobile = useIsMobile();

  if (monthlyData.length === 0) return null;

  // Sort chronologically
  const sorted = [...monthlyData].sort(
    (a, b) => MONTH_ORDER.indexOf(a.month) - MONTH_ORDER.indexOf(b.month)
  );

  const labels = sorted.map((m) => m.month);
  const gmvValues = sorted.map((m) => m.totalGmv);
  const targetValues = sorted.map((m) => m.gmvTarget);

  // Current month highlighted in yellow
  const now = new Date();
  const currentMonth = MONTH_ORDER[now.getMonth()];
  const colors = labels.map((label) =>
    label === currentMonth ? '#FCEB03' : '#4A90D9'
  );

  const displayLabels = labels.map((label) => {
    if (label === currentMonth && !isMobile) return `${label} (in progress)`;
    return isMobile ? label.slice(0, 3) : label;
  });

  const data: PlotlyData[] = [
    {
      type: 'bar',
      x: displayLabels,
      y: gmvValues,
      name: 'GMV Actual',
      marker: { color: colors },
      text: gmvValues.map((v) => `$${v.toLocaleString('en-US', { maximumFractionDigits: 0 })}`),
      textposition: 'outside',
      textfont: { color: '#F5F5F5', weight: 600, size: isMobile ? 10 : 12 },
    },
    {
      type: 'scatter',
      x: displayLabels,
      y: targetValues,
      name: 'Monthly Target',
      mode: 'lines',
      line: { color: '#9CA3AF', width: 2, dash: 'dash' },
    },
  ];

  return (
    <div className="bg-zt-card rounded-xl border border-zt-border p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Monthly GMV Performance</h3>
      <PlotlyChart
        data={data}
        layout={{
          barmode: 'group',
          xaxis: { title: { text: 'Month' }, tickangle: isMobile ? -45 : 0 },
          yaxis: {
            title: { text: 'GMV ($)' },
            tickprefix: '$',
            tickformat: ',.0f',
          },
          legend: { orientation: 'h', y: -0.25 },
          height: isMobile ? 280 : 370,
        }}
      />
    </div>
  );
}
