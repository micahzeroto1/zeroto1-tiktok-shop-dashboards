'use client';

import PlotlyChart from './PlotlyChart';
import { buildWeekLabels } from '@/lib/week-labels';
import type { WeeklyRollup } from '@/types/dashboard';
import type { PlotlyData } from '@/types/plotly';

interface WeeklyMetricsChartsProps {
  weeklyData: WeeklyRollup[];
}

function fmtNumber(val: number): string {
  return val.toLocaleString('en-US', { maximumFractionDigits: 0 });
}

function fmtCurrency(val: number): string {
  return `$${val.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
}

export default function WeeklyMetricsCharts({ weeklyData }: WeeklyMetricsChartsProps) {
  if (weeklyData.length === 0) return null;

  const labels = buildWeekLabels(weeklyData);

  // --- Videos Posted ---
  const videoActuals = weeklyData.map((w) => w.videosPosted);
  const videoTargets = weeklyData.map((w) => w.monthlyVideoTarget);
  const hasVideoData = videoActuals.some((v) => v > 0) || videoTargets.some((v) => v > 0);

  const videoData: PlotlyData[] = [
    {
      type: 'bar',
      x: labels,
      y: videoActuals,
      name: 'Videos Posted',
      marker: { color: 'rgba(59, 130, 246, 0.85)' },
      text: videoActuals.map((v) => fmtNumber(v)),
      textposition: 'outside',
    },
    {
      type: 'scatter',
      x: labels,
      y: videoTargets,
      name: 'Target',
      mode: 'lines',
      line: { color: '#ef4444', width: 2, dash: 'dash' },
    },
  ];

  // --- Samples Approved ---
  const sampleActuals = weeklyData.map((w) => w.totalSamplesApproved);
  const sampleTargets = weeklyData.map((w) => w.targetSamplesGoals);
  const hasSampleData = sampleActuals.some((v) => v > 0) || sampleTargets.some((v) => v > 0);

  const sampleData: PlotlyData[] = [
    {
      type: 'bar',
      x: labels,
      y: sampleActuals,
      name: 'Samples Approved',
      marker: { color: 'rgba(168, 85, 247, 0.85)' },
      text: sampleActuals.map((v) => fmtNumber(v)),
      textposition: 'outside',
    },
    {
      type: 'scatter',
      x: labels,
      y: sampleTargets,
      name: 'Target',
      mode: 'lines',
      line: { color: '#ef4444', width: 2, dash: 'dash' },
    },
  ];

  // --- Ad Spend ---
  const spendActuals = weeklyData.map((w) => w.adSpend);
  const spendTargets = weeklyData.map((w) => w.spendTarget);
  const hasSpendData = spendActuals.some((v) => v > 0) || spendTargets.some((v) => v > 0);

  const spendData: PlotlyData[] = [
    {
      type: 'bar',
      x: labels,
      y: spendActuals,
      name: 'Ad Spend',
      marker: { color: 'rgba(245, 158, 11, 0.85)' },
      text: spendActuals.map((v) => fmtCurrency(v)),
      textposition: 'outside',
    },
    {
      type: 'scatter',
      x: labels,
      y: spendTargets,
      name: 'Target',
      mode: 'lines',
      line: { color: '#ef4444', width: 2, dash: 'dash' },
    },
  ];

  const tickAngle = -30;

  return (
    <div className="space-y-6">
      {hasVideoData && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-navy-900 mb-4">Weekly Videos Posted</h3>
          <PlotlyChart
            data={videoData}
            layout={{
              barmode: 'group',
              xaxis: { title: { text: 'Week' }, tickangle: tickAngle },
              yaxis: { title: { text: 'Videos' }, tickformat: ',.0f' },
              legend: { orientation: 'h', y: -0.25 },
              height: 340,
            }}
          />
        </div>
      )}

      {hasSampleData && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-navy-900 mb-4">Weekly Samples Approved</h3>
          <PlotlyChart
            data={sampleData}
            layout={{
              barmode: 'group',
              xaxis: { title: { text: 'Week' }, tickangle: tickAngle },
              yaxis: { title: { text: 'Samples' }, tickformat: ',.0f' },
              legend: { orientation: 'h', y: -0.25 },
              height: 340,
            }}
          />
        </div>
      )}

      {hasSpendData && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-navy-900 mb-4">Weekly Ad Spend</h3>
          <PlotlyChart
            data={spendData}
            layout={{
              barmode: 'group',
              xaxis: { title: { text: 'Week' }, tickangle: tickAngle },
              yaxis: {
                title: { text: 'Spend ($)' },
                tickprefix: '$',
                tickformat: ',.0f',
              },
              legend: { orientation: 'h', y: -0.25 },
              height: 340,
            }}
          />
        </div>
      )}
    </div>
  );
}
