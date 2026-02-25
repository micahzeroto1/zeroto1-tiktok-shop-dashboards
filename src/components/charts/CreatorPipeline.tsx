'use client';

import PlotlyChart from './PlotlyChart';
import type { MtdScorecard } from '@/types/dashboard';
import type { PlotlyData } from '@/types/plotly';

interface CreatorPipelineProps {
  scorecard: MtdScorecard;
}

function fmtNumber(val: number): string {
  return val.toLocaleString('en-US', { maximumFractionDigits: 0 });
}

export default function CreatorPipeline({ scorecard }: CreatorPipelineProps) {
  const {
    totalSamplesApproved,
    samplesDecline,
    sparkCodesAcquired,
    targetInvitesSent,
    l0Approved,
    l1Approved,
    l2Approved,
    l3Approved,
    l4Approved,
    l5Approved,
    l6Approved,
  } = scorecard;

  // Samples approved vs declined bar chart
  const sampleBarData: PlotlyData[] = [
    {
      type: 'bar',
      x: ['Approved', 'Declined'],
      y: [totalSamplesApproved, samplesDecline],
      marker: {
        color: ['#10b981', '#ef4444'],
      },
      text: [
        fmtNumber(totalSamplesApproved),
        fmtNumber(samplesDecline),
      ],
      textposition: 'outside',
    },
  ];

  // L0-L6 horizontal bar chart (funnel-style)
  const funnelLevels = ['L6', 'L5', 'L4', 'L3', 'L2', 'L1', 'L0'];
  const funnelValues = [l6Approved, l5Approved, l4Approved, l3Approved, l2Approved, l1Approved, l0Approved];
  const hasLevelData = [l0Approved, l1Approved, l2Approved, l3Approved, l4Approved, l5Approved, l6Approved].some((v) => v > 0);

  const funnelData: PlotlyData[] = [
    {
      type: 'bar',
      y: funnelLevels,
      x: funnelValues,
      orientation: 'h',
      marker: {
        color: ['#e9d5ff', '#d8b4fe', '#c084fc', '#a855f7', '#8b5cf6', '#6366f1', '#3b82f6'],
      },
      text: funnelValues.map((v) => fmtNumber(v)),
      textposition: 'outside',
    },
  ];

  // Pipeline KPI cards (only reliable metrics)
  const pipelineKpis = [
    { label: 'Invites Sent', value: targetInvitesSent },
    { label: 'Spark Codes', value: sparkCodesAcquired },
  ];

  const hasAnyData = totalSamplesApproved > 0 || samplesDecline > 0 ||
    targetInvitesSent > 0 || sparkCodesAcquired > 0 || hasLevelData;

  if (!hasAnyData) return null;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-navy-900">Creator Pipeline</h2>

      {/* Pipeline KPI row */}
      <div className="grid grid-cols-2 gap-3">
        {pipelineKpis.map((kpi) => (
          <div
            key={kpi.label}
            className="bg-white rounded-lg border border-slate-200 p-3 text-center"
          >
            <div className="text-xs font-medium text-slate-500 mb-1">{kpi.label}</div>
            <div className="text-xl font-bold text-navy-900">{fmtNumber(kpi.value)}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Samples Approved vs Declined */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-navy-900 mb-4">Samples Approved vs Declined</h3>
          <PlotlyChart
            data={sampleBarData}
            layout={{
              showlegend: false,
              yaxis: { title: { text: 'Count' } },
              height: 300,
            }}
          />
        </div>

        {/* L0-L6 Funnel */}
        {hasLevelData && (
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-navy-900 mb-4">Sample Approval Funnel (L0–L6)</h3>
            <PlotlyChart
              data={funnelData}
              layout={{
                showlegend: false,
                height: 300,
                xaxis: { title: { text: 'Samples Approved' } },
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
