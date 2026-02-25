'use client';

import PlotlyChart from './PlotlyChart';
import type { SkuData } from '@/types/dashboard';
import type { PlotlyData } from '@/types/plotly';

interface SkuBreakdownChartProps {
  skuData: SkuData[];
}

export default function SkuBreakdownChart({ skuData }: SkuBreakdownChartProps) {
  if (!skuData.length) return null;

  const data: PlotlyData[] = [
    {
      type: 'bar',
      x: skuData.map((s) => s.name),
      y: skuData.map((s) => s.samplesApproved),
      name: 'Samples Approved',
      marker: { color: '#10b981' },
    },
    {
      type: 'bar',
      x: skuData.map((s) => s.name),
      y: skuData.map((s) => s.sampleRequests),
      name: 'Sample Requests',
      marker: { color: '#6366f1' },
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <h3 className="text-lg font-semibold text-navy-900 mb-4">SKU Breakdown</h3>
      <PlotlyChart
        data={data}
        layout={{
          barmode: 'group',
          xaxis: { title: { text: 'Product / SKU' } },
          yaxis: { title: { text: 'Count' } },
          legend: { orientation: 'h', y: -0.2 },
          height: 300,
        }}
      />
    </div>
  );
}
