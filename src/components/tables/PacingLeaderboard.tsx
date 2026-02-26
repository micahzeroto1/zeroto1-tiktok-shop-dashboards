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
    if (c.gmvPacing >= 0.95) return '#22C55E';
    if (c.gmvPacing >= 0.80) return '#EAB308';
    return '#EF4444';
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
      textfont: { color: '#9CA3AF' },
    },
  ];

  // Calculate sensible x-axis range
  const maxPacing = Math.max(120, ...sorted.map((c) => c.gmvPacing * 100 + 15));

  return (
    <div className="bg-zt-card rounded-xl border border-zt-border p-6">
      <h3 className="text-lg font-semibold text-white mb-4">MTD GMV Pacing Leaderboard</h3>
      <PlotlyChart
        data={data}
        layout={{
          margin: { l: 120 },
          xaxis: {
            title: { text: 'GMV Pacing %' },
            range: [0, maxPacing],
            ticksuffix: '%',
          },
          showlegend: false,
          height: Math.max(250, sorted.length * 50),
          shapes: [
            {
              type: 'line',
              x0: 100,
              x1: 100,
              y0: -0.5,
              y1: sorted.length - 0.5,
              line: { color: '#EF4444', width: 2, dash: 'dash' },
            },
          ],
        }}
      />
    </div>
  );
}
