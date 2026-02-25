import { getPacingStatus } from '@/config/constants';
import { isCurrentMonth } from '@/lib/data-parser';
import type { DailyMetrics, WeeklyRollup, MtdScorecard } from '@/types/dashboard';

/**
 * Build the MTD scorecard by reading directly from the monthly rollup row
 * for the current month.  Returns null when no matching row is found so the
 * caller can fall back to raw-data computation.
 */
export function buildMtdScorecardFromRollup(
  monthlyRows: WeeklyRollup[]
): MtdScorecard | null {
  // weekLabel on monthly rows holds the month name (e.g. "FEBRUARY")
  const row = monthlyRows.find((r) => isCurrentMonth(r.weekLabel));

  // Fall back to the most recent monthly row that has data
  const fallbackRow = !row
    ? [...monthlyRows]
        .reverse()
        .find((r) => r.cumulativeMtdGmv > 0 || r.videosPosted > 0)
    : null;

  const src = row ?? fallbackRow;
  if (!src) return null;

  // Compute pacing ratios from actual / target
  const gmvPacing =
    src.gmvTarget > 0 ? src.cumulativeMtdGmv / src.gmvTarget : 0;
  const videoPacing =
    src.monthlyVideoTarget > 0 ? src.videosPosted / src.monthlyVideoTarget : 0;
  const samplesPacing =
    src.targetSamplesGoals > 0
      ? src.totalSamplesApproved / src.targetSamplesGoals
      : 0;
  const spendPacing =
    src.spendTarget > 0 ? src.adSpend / src.spendTarget : 0;
  const roiStatus =
    src.roiTarget > 0
      ? getPacingStatus(src.roi / src.roiTarget)
      : ('green' as const);

  return {
    cumulativeMtdGmv: src.cumulativeMtdGmv,
    gmvTargetMonth: src.gmvTarget,
    gmvPacing,
    gmvStatus: getPacingStatus(gmvPacing),
    projectedMonthlyGmv: src.projectedMonthlyGmv,
    videosPosted: src.videosPosted,
    monthlyVideoTarget: src.monthlyVideoTarget,
    videoPacing,
    videoStatus: getPacingStatus(videoPacing),
    totalSamplesApproved: src.totalSamplesApproved,
    targetSamplesGoals: src.targetSamplesGoals,
    samplesPacing,
    samplesStatus: getPacingStatus(samplesPacing),
    adSpend: src.adSpend,
    spendTarget: src.spendTarget,
    spendPacing,
    spendStatus: getPacingStatus(spendPacing),
    roi: src.roi,
    roiTarget: src.roiTarget,
    roiStatus,
  };
}

/**
 * Fallback: build scorecard from raw daily data when rollup is unavailable.
 */
export function buildMtdScorecard(daily: DailyMetrics[]): MtdScorecard {
  if (daily.length === 0) return emptyScorecard();

  const currentMonthDays = daily.filter((d) => isCurrentMonth(d.month));
  const targetDays =
    currentMonthDays.length > 0 ? currentMonthDays : getLatestMonthDays(daily);
  if (targetDays.length === 0) return emptyScorecard();

  const activeRows = targetDays.filter(
    (d) => d.cumulativeMtdGmv > 0 || d.dailyGmv > 0 || d.videosPosted > 0 || d.totalSamplesApproved > 0
  );
  const latest = activeRows.length > 0 ? activeRows[activeRows.length - 1] : targetDays[0];
  const daysWithActivity = targetDays.filter(
    (d) => d.dailyGmv > 0 || d.videosPosted > 0 || d.totalSamplesApproved > 0 || d.adSpend > 0
  );

  const mtdVideosPosted = daysWithActivity.reduce((s, d) => s + d.videosPosted, 0);
  const mtdSamplesApproved = daysWithActivity.reduce((s, d) => s + d.totalSamplesApproved, 0);
  const mtdAdSpend = daysWithActivity.reduce((s, d) => s + d.adSpend, 0);

  const gmvPacing = latest.gmvTargetMonth > 0 ? latest.cumulativeMtdGmv / latest.gmvTargetMonth : 0;
  const videoPacing = latest.monthlyVideoTarget > 0 ? mtdVideosPosted / latest.monthlyVideoTarget : 0;
  const samplesPacing = latest.targetSamplesGoals > 0 ? mtdSamplesApproved / latest.targetSamplesGoals : 0;
  const mtdSpendTarget = daysWithActivity.reduce((s, d) => s + d.spendTarget, 0);
  const spendPacing = mtdSpendTarget > 0 ? mtdAdSpend / mtdSpendTarget : 0;

  const roiDays = daysWithActivity.filter((d) => d.roi > 0);
  const avgRoi = roiDays.length > 0 ? roiDays.reduce((s, d) => s + d.roi, 0) / roiDays.length : 0;
  const roiStatus = latest.roiTarget > 0 ? getPacingStatus(avgRoi / latest.roiTarget) : ('green' as const);

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
    cumulativeMtdGmv: 0, gmvTargetMonth: 0, gmvPacing: 0, gmvStatus: 'red',
    projectedMonthlyGmv: 0, videosPosted: 0, monthlyVideoTarget: 0,
    videoPacing: 0, videoStatus: 'red', totalSamplesApproved: 0,
    targetSamplesGoals: 0, samplesPacing: 0, samplesStatus: 'red',
    adSpend: 0, spendTarget: 0, spendPacing: 0, spendStatus: 'red',
    roi: 0, roiTarget: 0, roiStatus: 'red',
  };
}
