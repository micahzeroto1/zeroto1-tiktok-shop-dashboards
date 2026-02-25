'use client';

import PlotlyChart from './PlotlyChart';
import type { MonthlyAggregate } from '@/types/dashboard';
import type { PlotlyData } from '@/types/plotly';

interface MonthlyTrendChartProps {
  monthlyData: MonthlyAggregate[];
}

export default function MonthlyTrendChart({ monthlyData }: MonthlyTrendChartProps) {
  if (monthlyData.length < 2) return null;

  const months = monthlyData.map((m) => m.month);

  const data: PlotlyData[] = [
    {
      type: 'scatter',
      x: months,
      y: monthlyData.map((m) => m.totalGmv),
      name: 'GMV Actual',
      mode: 'lines+markers',
      line: { color: '#10b981', width: 3 },
      marker: { size: 8 },
    },
    {
      type: 'scatter',
      x: months,
      y: monthlyData.map((m) => m.gmvTarget),
      name: 'GMV Target',
      mode: 'lines',
      line: { color: '#ef4444', width: 2, dash: 'dash' },
    },
    {
      type: 'scatter',
      x: months,
      y: monthlyData.map((m) => m.avgRoi),
      name: 'ROI',
      mode: 'lines+markers',
      line: { color: '#6366f1', width: 2 },
      marker: { size: 6 },
      yaxis: 'y2',
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <h3 className="text-lg font-semibold text-navy-900 mb-4">Monthly Trends</h3>
      <PlotlyChart
        data={data}
        layout={{
          xaxis: { title: { text: 'Month' } },
          yaxis: { title: { text: 'GMV ($)' }, tickprefix: '$', side: 'left' },
          yaxis2: {
            title: { text: 'ROI' },
            overlaying: 'y',
            side: 'right',
            tickformat: '.1f',
          },
          legend: { orientation: 'h', y: -0.2 },
          height: 350,
        }}
      />
    </div>
  );
}
