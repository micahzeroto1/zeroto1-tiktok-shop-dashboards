import { getPacingStatus } from '@/config/constants';
import { isCurrentMonth } from '@/lib/data-parser';
import type { DailyMetrics, MtdScorecard } from '@/types/dashboard';

export function buildMtdScorecard(daily: DailyMetrics[]): MtdScorecard {
  if (daily.length === 0) {
    return emptyScorecard();
  }

  // Filter to the current calendar month
  const currentMonthDays = daily.filter((d) => isCurrentMonth(d.month));

  // If no data for current month, try the most recent month with data
  const targetDays = currentMonthDays.length > 0
    ? currentMonthDays
    : getLatestMonthDays(daily);

  if (targetDays.length === 0) {
    return emptyScorecard();
  }

  // Find the latest row with actual activity (non-zero cumulative GMV or any metric)
  const activeRows = targetDays.filter(
    (d) => d.cumulativeMtdGmv > 0 || d.dailyGmv > 0 || d.videosPosted > 0 || d.totalSamplesApproved > 0
  );

  // Use latest active row for cumulative metrics; fall back to first row for targets
  const latest = activeRows.length > 0
    ? activeRows[activeRows.length - 1]
    : targetDays[0];

  // Only sum days that have actual activity
  const daysWithActivity = targetDays.filter(
    (d) => d.dailyGmv > 0 || d.videosPosted > 0 || d.totalSamplesApproved > 0 || d.adSpend > 0
  );

  const mtdVideosPosted = daysWithActivity.reduce((s, d) => s + d.videosPosted, 0);
  const mtdSamplesApproved = daysWithActivity.reduce((s, d) => s + d.totalSamplesApproved, 0);
  const mtdAdSpend = daysWithActivity.reduce((s, d) => s + d.adSpend, 0);

  // Use cumulative values from the latest active row
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
  const mtdSpendTarget = daysWithActivity.reduce((s, d) => s + d.spendTarget, 0);
  const spendPacing = mtdSpendTarget > 0 ? mtdAdSpend / mtdSpendTarget : 0;

  // ROI: average of days with non-zero ROI
  const roiDays = daysWithActivity.filter((d) => d.roi > 0);
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

/** Get daily data for the most recent month that has any activity */
function getLatestMonthDays(daily: DailyMetrics[]): DailyMetrics[] {
  for (let i = daily.length - 1; i >= 0; i--) {
    if (daily[i].dailyGmv > 0 || daily[i].videosPosted > 0 || daily[i].totalSamplesApproved > 0) {
      const targetMonth = daily[i].month;
      return daily.filter((d) => d.month === targetMonth);
    }
  }
  return [];
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
