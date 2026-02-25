'use client';

import PlotlyChart from '../charts/PlotlyChart';
import type { ClientMtdSummary } from '@/types/dashboard';
import type { PlotlyData } from '@/types/plotly';

interface PacingLeaderboardProps {
  clients: ClientMtdSummary[];
}

export default function PacingLeaderboard({ clients }: PacingLeaderboardProps) {
  const sorted = [...clients].sort((a, b) => b.gmvPacing - a.gmvPacing);

  const colors = sorted.map((c) => {
    if (c.gmvPacing >= 0.95) return '#10b981';
    if (c.gmvPacing >= 0.80) return '#f59e0b';
    return '#ef4444';
  });

  const data: PlotlyData[] = [
    {
      type: 'bar',
      y: sorted.map((c) => c.clientName),
      x: sorted.map((c) => c.gmvPacing * 100),
      orientation: 'h',
      marker: { color: colors },
      text: sorted.map((c) => `${(c.gmvPacing * 100).toFixed(0)}%`),
      textposition: 'outside',
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <h3 className="text-lg font-semibold text-navy-900 mb-4">MTD GMV Pacing Leaderboard</h3>
      <PlotlyChart
        data={data}
        layout={{
          xaxis: { title: { text: 'GMV Pacing %' }, range: [0, Math.max(120, ...sorted.map((c) => c.gmvPacing * 100 + 15))] },
          showlegend: false,
          height: Math.max(250, sorted.length * 50),
          shapes: [
            {
              type: 'line',
              x0: 100,
              x1: 100,
              y0: -0.5,
              y1: sorted.length - 0.5,
              line: { color: '#ef4444', width: 2, dash: 'dash' },
            },
          ],
        }}
      />
    </div>
  );
}
