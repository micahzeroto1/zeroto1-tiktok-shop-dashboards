'use client';

import PlotlyChart from './PlotlyChart';
import { useIsMobile } from '@/hooks/useIsMobile';
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
  isMobile: boolean,
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
      textfont: { color: '#F5F5F5', weight: 600, size: isMobile ? 10 : 12 },
    },
    {
      type: 'bar',
      y: podNames,
      x: targets,
      name: targetLabel,
      orientation: 'h',
      marker: { color: '#374151' },
    },
  ];

  return { data, maxVal };
}

export default function PodComparisonChart({ pods }: PodComparisonChartProps) {
  const isMobile = useIsMobile();

  if (pods.length === 0) return null;

  const podNames = pods.map((p) => isMobile ? p.podName.replace(/'s Pod$/i, '') : p.podName);
  const chartHeight = Math.max(300, pods.length * 80 + 100);
  const chartMargin = isMobile
    ? { l: 80, r: 20, t: 40, b: 40 }
    : { l: 120 };

  // GMV
  const gmv = buildHorizontalBarChart(
    podNames,
    pods.map((p) => p.totalMtdGmv),
    pods.map((p) => p.totalMtdTarget),
    'MTD GMV',
    'Target',
    '#4A90D9',
    true,
    isMobile,
  );

  // Videos
  const videos = buildHorizontalBarChart(
    podNames,
    pods.map((p) => p.totalVideosPosted),
    pods.map((p) => p.totalVideoTarget),
    'Videos Posted',
    'Target',
    '#4A90D9',
    false,
    isMobile,
  );

  // Samples
  const samples = buildHorizontalBarChart(
    podNames,
    pods.map((p) => p.totalSamplesApproved),
    pods.map((p) => p.totalSamplesTarget),
    'Samples Approved',
    'Target',
    '#4A90D9',
    false,
    isMobile,
  );

  // Ad Spend
  const spend = buildHorizontalBarChart(
    podNames,
    pods.map((p) => p.totalAdSpend),
    pods.map((p) => p.totalSpendTarget),
    'Ad Spend',
    'Target',
    '#4A90D9',
    true,
    isMobile,
  );

  const axisStyle = { gridcolor: '#222222', linecolor: '#1E1E1E', zerolinecolor: '#1E1E1E' };
  const legendStyle = { orientation: 'h' as const, y: 1.15, x: 0, font: { size: 11 } };
  const cardClass = `bg-zt-card rounded-xl border border-zt-border ${isMobile ? 'p-2' : 'p-6'}`;

  return (
    <div className="space-y-6">
      <div className={cardClass}>
        <h3 className="text-lg font-semibold text-white mb-4">Pod GMV Comparison</h3>
        <PlotlyChart
          data={gmv.data}
          layout={{
            barmode: 'group',
            bargap: 0.3,
            margin: chartMargin,
            xaxis: {
              ...axisStyle,
              tickprefix: '$',
              tickformat: ',.0f',
              range: [0, gmv.maxVal * 1.15],
            },
            legend: legendStyle,
            height: chartHeight,
          }}
        />
      </div>

      <div className={cardClass}>
        <h3 className="text-lg font-semibold text-white mb-4">Pod Videos Comparison</h3>
        <PlotlyChart
          data={videos.data}
          layout={{
            barmode: 'group',
            bargap: 0.3,
            margin: chartMargin,
            xaxis: {
              ...axisStyle,
              tickformat: ',.0f',
              range: [0, videos.maxVal * 1.15],
            },
            legend: legendStyle,
            height: chartHeight,
          }}
        />
      </div>

      <div className={cardClass}>
        <h3 className="text-lg font-semibold text-white mb-4">Pod Samples Comparison</h3>
        <PlotlyChart
          data={samples.data}
          layout={{
            barmode: 'group',
            bargap: 0.3,
            margin: chartMargin,
            xaxis: {
              ...axisStyle,
              tickformat: ',.0f',
              range: [0, samples.maxVal * 1.15],
            },
            legend: legendStyle,
            height: chartHeight,
          }}
        />
      </div>

      <div className={cardClass}>
        <h3 className="text-lg font-semibold text-white mb-4">Pod Ad Spend Comparison</h3>
        <PlotlyChart
          data={spend.data}
          layout={{
            barmode: 'group',
            bargap: 0.3,
            margin: chartMargin,
            xaxis: {
              ...axisStyle,
              tickprefix: '$',
              tickformat: ',.0f',
              range: [0, spend.maxVal * 1.15],
            },
            legend: legendStyle,
            height: chartHeight,
          }}
        />
      </div>

      {/* Pipeline Comparison */}
      {pods.some((p) => p.totalSamplesApproved > 0 || p.totalSamplesDecline > 0) && (
        <div className={cardClass}>
          <h3 className="text-lg font-semibold text-white mb-4">Pod Pipeline Comparison</h3>
          <PlotlyChart
            data={[
              {
                type: 'bar',
                y: podNames,
                x: pods.map((p) => p.totalSamplesApproved),
                name: 'Approved',
                orientation: 'h',
                marker: { color: '#4ADE80' },
              },
              {
                type: 'bar',
                y: podNames,
                x: pods.map((p) => p.totalSamplesDecline),
                name: 'Declined',
                orientation: 'h',
                marker: { color: '#F87171' },
              },
            ] as PlotlyData[]}
            layout={{
              barmode: 'group',
              bargap: 0.3,
              margin: chartMargin,
              xaxis: {
                ...axisStyle,
                tickformat: ',.0f',
              },
              legend: legendStyle,
              height: chartHeight,
            }}
          />
        </div>
      )}
    </div>
  );
}
