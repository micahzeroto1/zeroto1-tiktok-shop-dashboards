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

/** Inject dark theme colors into axis config */
function darkAxis(axis: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    gridcolor: '#1E1E1E',
    linecolor: '#1E1E1E',
    zerolinecolor: '#1E1E1E',
    tickfont: { color: '#9CA3AF' },
    tickcolor: '#9CA3AF',
    ...axis,
    title: axis.title
      ? { ...(typeof axis.title === 'object' ? axis.title : { text: axis.title }), font: { color: '#9CA3AF' } }
      : undefined,
  };
}

export default function PlotlyChart({ data, layout, className }: PlotlyChartProps) {
  // Merge caller layout with dark theme defaults.
  // Spread order: defaults first, then caller overrides, then dark axis overrides.
  const merged: Partial<PlotlyLayout> = {
    margin: { t: 40, r: 30, b: 50, l: 60 },
    paper_bgcolor: 'transparent',
    plot_bgcolor: 'transparent',
    font: { family: 'Inter, system-ui, sans-serif', color: '#9CA3AF' },
    ...layout,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    xaxis: darkAxis((layout?.xaxis || {}) as any) as any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    yaxis: darkAxis((layout?.yaxis || {}) as any) as any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    yaxis2: layout?.yaxis2 ? darkAxis((layout.yaxis2 || {}) as any) as any : undefined,
    legend: { font: { color: '#FFFFFF' }, ...(layout?.legend || {}) },
  };

  // Use explicit pixel height from layout (every chart passes one).
  // CSS `height: 100%` fails when the parent only has `minHeight`,
  // so we pass the pixel value directly to the Plot container.
  const chartHeight = (layout?.height as number) || 300;

  return (
    <div className={className}>
      <Plot
        data={data}
        layout={merged}
        useResizeHandler
        style={{ width: '100%', height: chartHeight }}
        config={{ displayModeBar: false, responsive: true }}
      />
    </div>
  );
}
