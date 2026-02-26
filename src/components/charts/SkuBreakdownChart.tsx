'use client';

import PlotlyChart from './PlotlyChart';
import type { SkuData } from '@/types/dashboard';
import type { PlotlyData } from '@/types/plotly';

interface SkuBreakdownChartProps {
  skuData: SkuData[];
}

export default function SkuBreakdownChart({ skuData }: SkuBreakdownChartProps) {
  // Filter out SKUs with no data
  const activeSkus = skuData.filter((s) => s.samplesApproved > 0 || s.sampleRequests > 0);
  if (activeSkus.length === 0) return null;

  const data: PlotlyData[] = [
    {
      type: 'bar',
      x: activeSkus.map((s) => s.name),
      y: activeSkus.map((s) => s.samplesApproved),
      name: 'Samples Approved',
      marker: { color: '#22C55E' },
    },
    {
      type: 'bar',
      x: activeSkus.map((s) => s.name),
      y: activeSkus.map((s) => s.sampleRequests),
      name: 'Sample Requests',
      marker: { color: '#FCEB03' },
    },
  ];

  return (
    <div className="bg-zt-card rounded-xl border border-zt-border p-6">
      <h3 className="text-lg font-semibold text-white mb-4">SKU Breakdown</h3>
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
