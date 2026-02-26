'use client';

import PlotlyChart from './PlotlyChart';
import { buildWeekLabels, isCurrentWeek } from '@/lib/week-labels';
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

/** Build bar colors: blue for completed weeks, yellow accent for in-progress */
function weekColors(weeklyData: WeeklyRollup[], solidColor: string, dimColor: string): string[] {
  const lastIdx = weeklyData.length - 1;
  const lastIsCurrent = lastIdx >= 0 && isCurrentWeek(weeklyData[lastIdx]?.date || '');
  return weeklyData.map((_, i) => (i === lastIdx && lastIsCurrent ? dimColor : solidColor));
}

export default function WeeklyMetricsCharts({ weeklyData }: WeeklyMetricsChartsProps) {
  if (weeklyData.length === 0) return null;

  const labels = buildWeekLabels(weeklyData);
  const lastIdx = weeklyData.length - 1;
  const lastIsCurrent = lastIdx >= 0 && isCurrentWeek(weeklyData[lastIdx]?.date || '');
  const displayLabels = labels.map((label, i) =>
    i === lastIdx && lastIsCurrent ? `${label} (in progress)` : label
  );

  // --- Videos Posted ---
  const videoActuals = weeklyData.map((w) => w.videosPosted);
  const videoTargets = weeklyData.map((w) => w.monthlyVideoTarget);
  const hasVideoData = videoActuals.some((v) => v > 0) || videoTargets.some((v) => v > 0);

  const videoData: PlotlyData[] = [
    {
      type: 'bar',
      x: displayLabels,
      y: videoActuals,
      name: 'Videos Posted',
      marker: { color: weekColors(weeklyData, '#4A90D9', '#FCEB03') },
      text: videoActuals.map((v) => fmtNumber(v)),
      textposition: 'outside',
      textfont: { color: '#F5F5F5', weight: 600 },
    },
    {
      type: 'scatter',
      x: displayLabels,
      y: videoTargets,
      name: 'Target',
      mode: 'lines',
      line: { color: '#9CA3AF', width: 2, dash: 'dash' },
    },
  ];

  // --- Samples Approved ---
  const sampleActuals = weeklyData.map((w) => w.totalSamplesApproved);
  const sampleTargets = weeklyData.map((w) => w.targetSamplesGoals);
  const hasSampleData = sampleActuals.some((v) => v > 0) || sampleTargets.some((v) => v > 0);

  const sampleData: PlotlyData[] = [
    {
      type: 'bar',
      x: displayLabels,
      y: sampleActuals,
      name: 'Samples Approved',
      marker: { color: weekColors(weeklyData, '#4A90D9', '#FCEB03') },
      text: sampleActuals.map((v) => fmtNumber(v)),
      textposition: 'outside',
      textfont: { color: '#F5F5F5', weight: 600 },
    },
    {
      type: 'scatter',
      x: displayLabels,
      y: sampleTargets,
      name: 'Target',
      mode: 'lines',
      line: { color: '#9CA3AF', width: 2, dash: 'dash' },
    },
  ];

  // --- Ad Spend ---
  const spendActuals = weeklyData.map((w) => w.adSpend);
  const spendTargets = weeklyData.map((w) => w.spendTarget);
  const hasSpendData = spendActuals.some((v) => v > 0) || spendTargets.some((v) => v > 0);

  const spendData: PlotlyData[] = [
    {
      type: 'bar',
      x: displayLabels,
      y: spendActuals,
      name: 'Ad Spend',
      marker: { color: weekColors(weeklyData, '#4A90D9', '#FCEB03') },
      text: spendActuals.map((v) => fmtCurrency(v)),
      textposition: 'outside',
      textfont: { color: '#F5F5F5', weight: 600 },
    },
    {
      type: 'scatter',
      x: displayLabels,
      y: spendTargets,
      name: 'Target',
      mode: 'lines',
      line: { color: '#9CA3AF', width: 2, dash: 'dash' },
    },
  ];

  const tickAngle = -30;

  return (
    <div className="space-y-6">
      {hasVideoData && (
        <div className="bg-zt-card rounded-xl border border-zt-border p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Weekly Videos Posted</h3>
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
        <div className="bg-zt-card rounded-xl border border-zt-border p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Weekly Samples Approved</h3>
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
        <div className="bg-zt-card rounded-xl border border-zt-border p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Weekly Ad Spend</h3>
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
