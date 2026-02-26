'use client';

import PlotlyChart from './PlotlyChart';
import type { ClientMtdSummary } from '@/types/dashboard';
import type { PlotlyData } from '@/types/plotly';

interface PipelineHealthChartProps {
  clients: ClientMtdSummary[];
}

export default function PipelineHealthChart({ clients }: PipelineHealthChartProps) {
  const hasData = clients.some(
    (c) =>
      c.l0Approved > 0 || c.l1Approved > 0 || c.l2Approved > 0 ||
      c.l3Approved > 0 || c.l4Approved > 0 || c.l5Approved > 0 || c.l6Approved > 0
  );

  if (!hasData) return null;

  const clientNames = clients.map((c) => c.clientName);
  const colors = ['#FCEB03', '#E5D403', '#CCC003', '#B3AA03', '#999503', '#807F03', '#666A03'];
  const levels = ['L0', 'L1', 'L2', 'L3', 'L4', 'L5', 'L6'];
  const getters: ((c: ClientMtdSummary) => number)[] = [
    (c) => c.l0Approved,
    (c) => c.l1Approved,
    (c) => c.l2Approved,
    (c) => c.l3Approved,
    (c) => c.l4Approved,
    (c) => c.l5Approved,
    (c) => c.l6Approved,
  ];

  const data: PlotlyData[] = levels.map((level, i) => ({
    type: 'bar',
    name: level,
    x: clientNames,
    y: clients.map(getters[i]),
    marker: { color: colors[i] },
  }));

  // Samples approved vs declined grouped bar
  const hasSampleData = clients.some(
    (c) => c.totalSamplesApproved > 0 || c.samplesDecline > 0
  );

  const sampleData: PlotlyData[] = hasSampleData
    ? [
        {
          type: 'bar',
          name: 'Approved',
          x: clientNames,
          y: clients.map((c) => c.totalSamplesApproved),
          marker: { color: '#22C55E' },
        },
        {
          type: 'bar',
          name: 'Declined',
          x: clientNames,
          y: clients.map((c) => c.samplesDecline),
          marker: { color: '#EF4444' },
        },
      ]
    : [];

  const chartHeight = Math.max(300, clients.length * 30 + 100);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white">Pipeline Health</h2>

      {hasSampleData && (
        <div className="bg-zt-card rounded-xl border border-zt-border p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Samples Approved vs Declined
          </h3>
          <PlotlyChart
            data={sampleData}
            layout={{
              barmode: 'group',
              legend: { orientation: 'h', y: -0.2 },
              height: chartHeight,
              xaxis: { tickangle: -30 },
            }}
          />
        </div>
      )}

      <div className="bg-zt-card rounded-xl border border-zt-border p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          Sample Approval Levels (L0–L6) by Client
        </h3>
        <PlotlyChart
          data={data}
          layout={{
            barmode: 'stack',
            legend: { orientation: 'h', y: -0.2 },
            yaxis: { title: { text: 'Samples Approved' } },
            height: chartHeight,
            xaxis: { tickangle: -30 },
          }}
        />
      </div>
    </div>
  );
}
