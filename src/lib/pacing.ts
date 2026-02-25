import { getPacingStatus } from '@/config/constants';
import type { DailyMetrics, MtdScorecard } from '@/types/dashboard';

export function buildMtdScorecard(daily: DailyMetrics[]): MtdScorecard {
  // Get the most recent day with data for cumulative metrics
  const latest = daily[daily.length - 1];
  if (!latest) {
    return emptyScorecard();
  }

  // Sum MTD totals from daily data for the current month
  const currentMonthDays = daily.filter((d) => d.month === latest.month);
  const mtdVideosPosted = currentMonthDays.reduce((s, d) => s + d.videosPosted, 0);
  const mtdSamplesApproved = currentMonthDays.reduce((s, d) => s + d.totalSamplesApproved, 0);
  const mtdAdSpend = currentMonthDays.reduce((s, d) => s + d.adSpend, 0);

  // Use cumulative values from the latest row
  const gmvPacing = latest.gmvTargetMonth > 0
    ? latest.cumulativeMtdGmv / latest.gmvTargetMonth
    : 0;
  const videoPacing = latest.monthlyVideoTarget > 0
    ? mtdVideosPosted / latest.monthlyVideoTarget
    : 0;
  const samplesPacing = latest.targetSamplesGoals > 0
    ? mtdSamplesApproved / latest.targetSamplesGoals
    : 0;

  // For spend/ROI, use cumulative month values
  const mtdSpendTarget = currentMonthDays.reduce((s, d) => s + d.spendTarget, 0);
  const spendPacing = mtdSpendTarget > 0 ? mtdAdSpend / mtdSpendTarget : 0;

  // ROI: average of days with non-zero ROI
  const roiDays = currentMonthDays.filter((d) => d.roi > 0);
  const avgRoi = roiDays.length > 0
    ? roiDays.reduce((s, d) => s + d.roi, 0) / roiDays.length
    : 0;
  const roiStatus = latest.roiTarget > 0
    ? getPacingStatus(avgRoi / latest.roiTarget)
    : 'green' as const;

  return {
    cumulativeMtdGmv: latest.cumulativeMtdGmv,
    gmvTargetMonth: latest.gmvTargetMonth,
    gmvPacing,
    gmvStatus: getPacingStatus(gmvPacing),
    projectedMonthlyGmv: latest.projectedMonthlyGmv,
    videosPosted: mtdVideosPosted,
    monthlyVideoTarget: latest.monthlyVideoTarget,
    videoPacing,
    videoStatus: getPacingStatus(videoPacing),
    totalSamplesApproved: mtdSamplesApproved,
    targetSamplesGoals: latest.targetSamplesGoals,
    samplesPacing,
    samplesStatus: getPacingStatus(samplesPacing),
    adSpend: mtdAdSpend,
    spendTarget: mtdSpendTarget,
    spendPacing,
    spendStatus: getPacingStatus(spendPacing),
    roi: avgRoi,
    roiTarget: latest.roiTarget,
    roiStatus,
  };
}

function emptyScorecard(): MtdScorecard {
  return {
    cumulativeMtdGmv: 0,
    gmvTargetMonth: 0,
    gmvPacing: 0,
    gmvStatus: 'red',
    projectedMonthlyGmv: 0,
    videosPosted: 0,
    monthlyVideoTarget: 0,
    videoPacing: 0,
    videoStatus: 'red',
    totalSamplesApproved: 0,
    targetSamplesGoals: 0,
    samplesPacing: 0,
    samplesStatus: 'red',
    adSpend: 0,
    spendTarget: 0,
    spendPacing: 0,
    spendStatus: 'red',
    roi: 0,
    roiTarget: 0,
    roiStatus: 'red',
  };
}
