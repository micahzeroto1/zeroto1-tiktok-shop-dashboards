'use client';

import PlotlyChart from './PlotlyChart';
import type { PodSummary } from '@/types/dashboard';
import type { PlotlyData } from '@/types/plotly';

interface PodComparisonChartProps {
  pods: PodSummary[];
}

function buildHorizontalBarChart(
  podNames: string[],
  actuals: number[],
  targets: number[],
  actualLabel: string,
  targetLabel: string,
  actualColor: string,
  isCurrency: boolean,
) {
  const maxVal = Math.max(...actuals, ...targets, isCurrency ? 100 : 1);

  const data: PlotlyData[] = [
    {
      type: 'bar',
      y: podNames,
      x: actuals,
      name: actualLabel,
      orientation: 'h',
      marker: { color: actualColor },
      text: actuals.map((v) =>
        isCurrency
          ? `$${v.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
          : v.toLocaleString('en-US', { maximumFractionDigits: 0 })
      ),
      textposition: 'outside',
    },
    {
      type: 'bar',
      y: podNames,
      x: targets,
      name: targetLabel,
      orientation: 'h',
      marker: { color: 'rgba(239, 68, 68, 0.3)' },
    },
  ];

  return { data, maxVal };
}

export default function PodComparisonChart({ pods }: PodComparisonChartProps) {
  if (pods.length === 0) return null;

  const podNames = pods.map((p) => p.podName);
  const chartHeight = Math.max(250, pods.length * 80);

  // GMV
  const gmv = buildHorizontalBarChart(
    podNames,
    pods.map((p) => p.totalMtdGmv),
    pods.map((p) => p.totalMtdTarget),
    'MTD GMV',
    'Target',
    '#10b981',
    true,
  );

  // Videos
  const videos = buildHorizontalBarChart(
    podNames,
    pods.map((p) => p.totalVideosPosted),
    pods.map((p) => p.totalVideoTarget),
    'Videos Posted',
    'Target',
    'rgba(59, 130, 246, 0.85)',
    false,
  );

  // Samples
  const samples = buildHorizontalBarChart(
    podNames,
    pods.map((p) => p.totalSamplesApproved),
    pods.map((p) => p.totalSamplesTarget),
    'Samples Approved',
    'Target',
    'rgba(168, 85, 247, 0.85)',
    false,
  );

  // Ad Spend
  const spend = buildHorizontalBarChart(
    podNames,
    pods.map((p) => p.totalAdSpend),
    pods.map((p) => p.totalSpendTarget),
    'Ad Spend',
    'Target',
    'rgba(245, 158, 11, 0.85)',
    true,
  );

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-navy-900 mb-4">Pod GMV Comparison</h3>
        <PlotlyChart
          data={gmv.data}
          layout={{
            barmode: 'group',
            xaxis: {
              title: { text: 'GMV ($)' },
              tickprefix: '$',
              tickformat: ',.0f',
              range: [0, gmv.maxVal * 1.15],
            },
            legend: { orientation: 'h', y: -0.15 },
            height: chartHeight,
          }}
        />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-navy-900 mb-4">Pod Videos Comparison</h3>
        <PlotlyChart
          data={videos.data}
          layout={{
            barmode: 'group',
            xaxis: {
              title: { text: 'Videos Posted' },
              tickformat: ',.0f',
              range: [0, videos.maxVal * 1.15],
            },
            legend: { orientation: 'h', y: -0.15 },
            height: chartHeight,
          }}
        />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-navy-900 mb-4">Pod Samples Comparison</h3>
        <PlotlyChart
          data={samples.data}
          layout={{
            barmode: 'group',
            xaxis: {
              title: { text: 'Samples Approved' },
              tickformat: ',.0f',
              range: [0, samples.maxVal * 1.15],
            },
            legend: { orientation: 'h', y: -0.15 },
            height: chartHeight,
          }}
        />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-navy-900 mb-4">Pod Ad Spend Comparison</h3>
        <PlotlyChart
          data={spend.data}
          layout={{
            barmode: 'group',
            xaxis: {
              title: { text: 'Ad Spend ($)' },
              tickprefix: '$',
              tickformat: ',.0f',
              range: [0, spend.maxVal * 1.15],
            },
            legend: { orientation: 'h', y: -0.15 },
            height: chartHeight,
          }}
        />
      </div>

      {/* Pipeline Comparison */}
      {pods.some((p) => p.totalSampleRequests > 0 || p.totalSamplesApproved > 0) && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-navy-900 mb-4">Pod Pipeline Comparison</h3>
          <PlotlyChart
            data={[
              {
                type: 'bar',
                y: podNames,
                x: pods.map((p) => p.totalSampleRequests),
                name: 'Sample Requests',
                orientation: 'h',
                marker: { color: '#3b82f6' },
              },
              {
                type: 'bar',
                y: podNames,
                x: pods.map((p) => p.totalSamplesApproved),
                name: 'Approved',
                orientation: 'h',
                marker: { color: '#10b981' },
              },
              {
                type: 'bar',
                y: podNames,
                x: pods.map((p) => p.totalSamplesDecline),
                name: 'Declined',
                orientation: 'h',
                marker: { color: '#ef4444' },
              },
            ] as PlotlyData[]}
            layout={{
              barmode: 'group',
              xaxis: {
                title: { text: 'Count' },
                tickformat: ',.0f',
              },
              legend: { orientation: 'h', y: -0.15 },
              height: chartHeight,
            }}
          />
        </div>
      )}
    </div>
  );
}
