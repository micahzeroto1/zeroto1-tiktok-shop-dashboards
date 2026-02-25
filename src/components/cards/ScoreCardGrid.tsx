'use client';

import KpiCard from './KpiCard';
import type { MtdScorecard } from '@/types/dashboard';

interface ScoreCardGridProps {
  scorecard: MtdScorecard;
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
        format="number"
      />
    </div>
  );
}
