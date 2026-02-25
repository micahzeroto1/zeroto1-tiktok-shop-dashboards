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
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
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
    </div>
  );
}
