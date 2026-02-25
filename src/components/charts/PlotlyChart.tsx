'use client';

import dynamic from 'next/dynamic';
import type { PlotlyData, PlotlyLayout } from '@/types/plotly';

const Plot = dynamic(() => import('react-plotly.js'), {
  ssr: false,
  loading: () => (
    <div className="h-64 bg-slate-100 animate-pulse rounded-lg" />
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
          font: { family: 'Inter, system-ui, sans-serif', color: '#1e293b' },
          ...layout,
        }}
        useResizeHandler
        style={{ width: '100%', height: '100%' }}
        config={{ displayModeBar: false, responsive: true }}
      />
    </div>
  );
}
