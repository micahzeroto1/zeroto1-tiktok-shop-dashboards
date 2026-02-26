'use client';

import dynamic from 'next/dynamic';
import type { PlotlyData, PlotlyLayout } from '@/types/plotly';

const Plot = dynamic(() => import('react-plotly.js'), {
  ssr: false,
  loading: () => (
    <div className="h-64 bg-zt-card animate-pulse rounded-lg" />
  ),
});

interface PlotlyChartProps {
  data: PlotlyData[];
  layout?: Partial<PlotlyLayout>;
  className?: string;
}

export default function PlotlyChart({ data, layout, className }: PlotlyChartProps) {
  return (
    <div className={className}>
      <Plot
        data={data}
        layout={{
          autosize: true,
          margin: { t: 40, r: 30, b: 50, l: 60 },
          paper_bgcolor: 'transparent',
          plot_bgcolor: 'transparent',
          font: { family: 'Inter, system-ui, sans-serif', color: '#9CA3AF' },
          xaxis: { gridcolor: '#1E1E1E', linecolor: '#1E1E1E', zerolinecolor: '#1E1E1E',
                   tickfont: { color: '#9CA3AF' }, tickcolor: '#9CA3AF' },
          yaxis: { gridcolor: '#1E1E1E', linecolor: '#1E1E1E', zerolinecolor: '#1E1E1E',
                   tickfont: { color: '#9CA3AF' }, tickcolor: '#9CA3AF' },
          legend: { font: { color: '#FFFFFF' } },
          ...layout,
        }}
        useResizeHandler
        style={{ width: '100%', height: '100%' }}
        config={{ displayModeBar: false, responsive: true }}
      />
    </div>
  );
}
