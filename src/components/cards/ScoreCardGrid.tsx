'use client';

import KpiCard from './KpiCard';
import type { MtdScorecard } from '@/types/dashboard';

interface ScoreCardGridProps {
  scorecard: MtdScorecard;
}

function fmtProjected(val: number): string {
  if (val >= 1_000_000) return `Projected: $${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `Projected: $${val.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
  return `Projected: $${val.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
}

export default function ScoreCardGrid({ scorecard }: ScoreCardGridProps) {
  const avgContentPerSample = scorecard.totalSamplesApproved > 0
    ? scorecard.videosPosted / scorecard.totalSamplesApproved
    : null;
  const avgGmvPerVideo = scorecard.videosPosted > 0
    ? scorecard.cumulativeMtdGmv / scorecard.videosPosted
    : null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4 mb-8">
      <KpiCard
        label="MTD GMV"
        value={scorecard.cumulativeMtdGmv}
        target={scorecard.gmvTargetMonth}
        pacing={scorecard.gmvPacing}
        status={scorecard.gmvStatus}
        format="currency"
        subtitle={scorecard.projectedMonthlyGmv > 0 ? fmtProjected(scorecard.projectedMonthlyGmv) : undefined}
      />
      <KpiCard
        label="Videos Posted"
        value={scorecard.videosPosted}
        target={scorecard.monthlyVideoTarget}
        pacing={scorecard.videoPacing}
        status={scorecard.videoStatus}
        format="number"
      />
      <KpiCard
        label="Samples Approved"
        value={scorecard.totalSamplesApproved}
        target={scorecard.targetSamplesGoals}
        pacing={scorecard.samplesPacing}
        status={scorecard.samplesStatus}
        format="number"
      />
      <KpiCard
        label="Ad Spend"
        value={scorecard.adSpend}
        target={scorecard.spendTarget}
        pacing={scorecard.spendPacing}
        status={scorecard.spendStatus}
        format="currency"
      />
      <KpiCard
        label="ROI"
        value={scorecard.roi}
        target={scorecard.roiTarget}
        status={scorecard.roiStatus}
        format="roi"
      />
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col justify-center">
        <div className="text-xs font-medium text-slate-500 mb-1">Avg Content / Sample</div>
        <div className="text-2xl font-bold text-navy-900">
          {avgContentPerSample !== null ? avgContentPerSample.toFixed(2) : 'N/A'}
        </div>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col justify-center">
        <div className="text-xs font-medium text-slate-500 mb-1">Avg GMV / Video</div>
        <div className="text-2xl font-bold text-navy-900">
          {avgGmvPerVideo !== null
            ? `$${avgGmvPerVideo.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
            : 'N/A'}
        </div>
      </div>
    </div>
  );
}
