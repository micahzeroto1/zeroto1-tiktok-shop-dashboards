import { RAW_COLUMNS, ROLLUP_COLUMNS } from '@/config/metrics';
import type { SkuConfig } from '@/config/pods';
import type { DailyMetrics, WeeklyRollup, MonthlyAggregate, SkuData } from '@/types/dashboard';

function num(val: string | undefined): number {
  if (!val) return 0;
  const cleaned = val.replace(/[$,%]/g, '').trim();
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

/** Check if a month string matches the current calendar month */
export function isCurrentMonth(monthStr: string): boolean {
  if (!monthStr) return false;
  const lower = monthStr.toLowerCase().trim();
  const now = new Date();
  const longMonth = now.toLocaleString('default', { month: 'long' }).toLowerCase();
  const shortMonth = now.toLocaleString('default', { month: 'short' }).toLowerCase();
  return lower.includes(longMonth) || lower.includes(shortMonth) || longMonth.includes(lower);
}

export function parseRawTab(rows: string[][]): DailyMetrics[] {
  // Row 0 = note/warning, Row 1 = headers, data starts at Row 2
  return rows.slice(2).filter((row) => row[RAW_COLUMNS.date]?.trim()).map((row) => ({
    date: row[RAW_COLUMNS.date] || '',
    month: row[RAW_COLUMNS.month] || '',
    gmvTargetMonth: num(row[RAW_COLUMNS.gmvTargetMonth]),
    monthlyVideoPostedPacing: num(row[RAW_COLUMNS.monthlyVideoPostedPacing]),
    samplingPacing: num(row[RAW_COLUMNS.samplingPacing]),
    monthlyGmvPacing: num(row[RAW_COLUMNS.monthlyGmvPacing]),
    dailyTargetGmv: num(row[RAW_COLUMNS.dailyTargetGmv]),
    cumulativeMtdGmv: num(row[RAW_COLUMNS.cumulativeMtdGmv]),
    projectedMonthlyGmv: num(row[RAW_COLUMNS.projectedMonthlyGmv]),
    projectedGmvDelta: num(row[RAW_COLUMNS.projectedGmvDelta]),
    gmvPacing: num(row[RAW_COLUMNS.gmvPacing]),
    affiliatesAdded: num(row[RAW_COLUMNS.affiliatesAdded]),
    contentPending: num(row[RAW_COLUMNS.contentPending]),
    videosPosted: num(row[RAW_COLUMNS.videosPosted]),
    monthlyVideoTarget: num(row[RAW_COLUMNS.monthlyVideoTarget]),
    videosConverted: num(row[RAW_COLUMNS.videosConverted]),
    sparkCodesAcquired: num(row[RAW_COLUMNS.sparkCodesAcquired]),
    targetInvitesSent: num(row[RAW_COLUMNS.targetInvitesSent]),
    dailySampleRequests: num(row[RAW_COLUMNS.dailySampleRequests]),
    l0Approved: num(row[RAW_COLUMNS.l0Approved]),
    l1Approved: num(row[RAW_COLUMNS.l1Approved]),
    l2Approved: num(row[RAW_COLUMNS.l2Approved]),
    l3Approved: num(row[RAW_COLUMNS.l3Approved]),
    l4Approved: num(row[RAW_COLUMNS.l4Approved]),
    l5Approved: num(row[RAW_COLUMNS.l5Approved]),
    l6Approved: num(row[RAW_COLUMNS.l6Approved]),
    totalSamplesApproved: num(row[RAW_COLUMNS.totalSamplesApproved]),
    targetSamplesGoals: num(row[RAW_COLUMNS.targetSamplesGoals]),
    samplesDecline: num(row[RAW_COLUMNS.samplesDecline]),
    samplesRemain: num(row[RAW_COLUMNS.samplesRemain]),
    dailyGmv: num(row[RAW_COLUMNS.dailyGmv]),
    gmvTarget: num(row[RAW_COLUMNS.gmvTarget]),
    adSpend: num(row[RAW_COLUMNS.adSpend]),
    spendTarget: num(row[RAW_COLUMNS.spendTarget]),
    roi: num(row[RAW_COLUMNS.roi]),
    roiTarget: num(row[RAW_COLUMNS.roiTarget]),
  }));
}

export function parseRollupTab(rows: string[][]): WeeklyRollup[] {
  // Rollup tabs: Row 0 = headers only (no note row), data starts at Row 1
  return rows.slice(1).filter((row) => row[ROLLUP_COLUMNS.date]?.trim()).map((row) => ({
    weekLabel: row[ROLLUP_COLUMNS.weekLabel] || '',
    date: row[ROLLUP_COLUMNS.date] || '',
    monthlyVideoPostedPacing: num(row[ROLLUP_COLUMNS.monthlyVideoPostedPacing]),
    samplingPacing: num(row[ROLLUP_COLUMNS.samplingPacing]),
    monthlyGmvPacing: num(row[ROLLUP_COLUMNS.monthlyGmvPacing]),
    dailyTargetGmv: num(row[ROLLUP_COLUMNS.dailyTargetGmv]),
    cumulativeMtdGmv: num(row[ROLLUP_COLUMNS.cumulativeMtdGmv]),
    projectedMonthlyGmv: num(row[ROLLUP_COLUMNS.projectedMonthlyGmv]),
    projectedGmvDelta: num(row[ROLLUP_COLUMNS.projectedGmvDelta]),
    gmvPacing: num(row[ROLLUP_COLUMNS.gmvPacing]),
    affiliatesAdded: num(row[ROLLUP_COLUMNS.affiliatesAdded]),
    contentPending: num(row[ROLLUP_COLUMNS.contentPending]),
    videosPosted: num(row[ROLLUP_COLUMNS.videosPosted]),
    monthlyVideoTarget: num(row[ROLLUP_COLUMNS.monthlyVideoTarget]),
    videosConverted: num(row[ROLLUP_COLUMNS.videosConverted]),
    sparkCodesAcquired: num(row[ROLLUP_COLUMNS.sparkCodesAcquired]),
    targetInvitesSent: num(row[ROLLUP_COLUMNS.targetInvitesSent]),
    dailySampleRequests: num(row[ROLLUP_COLUMNS.dailySampleRequests]),
    totalSamplesApproved: num(row[ROLLUP_COLUMNS.totalSamplesApproved]),
    targetSamplesGoals: num(row[ROLLUP_COLUMNS.targetSamplesGoals]),
    samplesDecline: num(row[ROLLUP_COLUMNS.samplesDecline]),
    samplesRemain: num(row[ROLLUP_COLUMNS.samplesRemain]),
    dailyGmv: num(row[ROLLUP_COLUMNS.dailyGmv]),
    gmvTarget: num(row[ROLLUP_COLUMNS.gmvTarget]),
    adSpend: num(row[ROLLUP_COLUMNS.adSpend]),
    spendTarget: num(row[ROLLUP_COLUMNS.spendTarget]),
    roi: num(row[ROLLUP_COLUMNS.roi]),
    roiTarget: num(row[ROLLUP_COLUMNS.roiTarget]),
  }));
}

/** Aggregate rollup daily rows into one summary per week, filtering empty future weeks */
export function aggregateWeekly(rollupData: WeeklyRollup[]): WeeklyRollup[] {
  const weekMap = new Map<string, WeeklyRollup[]>();

  for (const row of rollupData) {
    const key = row.weekLabel?.trim() || row.date;
    if (!key) continue;
    const existing = weekMap.get(key) || [];
    existing.push(row);
    weekMap.set(key, existing);
  }

  const result: WeeklyRollup[] = [];
  weekMap.forEach((days, weekLabel) => {
    const last = days[days.length - 1];
    const roiDays = days.filter((d) => d.roi > 0);

    result.push({
      weekLabel,
      date: last.date,
      // Summed metrics for the week
      dailyGmv: days.reduce((s, d) => s + d.dailyGmv, 0),
      gmvTarget: days.reduce((s, d) => s + d.dailyTargetGmv, 0), // weekly target = sum of daily targets
      videosPosted: days.reduce((s, d) => s + d.videosPosted, 0),
      totalSamplesApproved: days.reduce((s, d) => s + d.totalSamplesApproved, 0),
      adSpend: days.reduce((s, d) => s + d.adSpend, 0),
      spendTarget: days.reduce((s, d) => s + d.spendTarget, 0),
      roi: roiDays.length > 0 ? roiDays.reduce((s, d) => s + d.roi, 0) / roiDays.length : 0,
      roiTarget: last.roiTarget,
      // Cumulative/pacing from the last day of the week
      cumulativeMtdGmv: last.cumulativeMtdGmv,
      projectedMonthlyGmv: last.projectedMonthlyGmv,
      projectedGmvDelta: last.projectedGmvDelta,
      gmvPacing: last.gmvPacing,
      monthlyGmvPacing: last.monthlyGmvPacing,
      monthlyVideoPostedPacing: last.monthlyVideoPostedPacing,
      samplingPacing: last.samplingPacing,
      dailyTargetGmv: days.reduce((s, d) => s + d.dailyTargetGmv, 0),
      monthlyVideoTarget: last.monthlyVideoTarget,
      targetSamplesGoals: last.targetSamplesGoals,
      affiliatesAdded: days.reduce((s, d) => s + d.affiliatesAdded, 0),
      contentPending: days.reduce((s, d) => s + d.contentPending, 0),
      videosConverted: days.reduce((s, d) => s + d.videosConverted, 0),
      sparkCodesAcquired: days.reduce((s, d) => s + d.sparkCodesAcquired, 0),
      targetInvitesSent: days.reduce((s, d) => s + d.targetInvitesSent, 0),
      dailySampleRequests: days.reduce((s, d) => s + d.dailySampleRequests, 0),
      samplesDecline: days.reduce((s, d) => s + d.samplesDecline, 0),
      samplesRemain: last.samplesRemain,
    });
  });

  // Filter out weeks with no actual data (pre-populated future weeks)
  return result.filter((w) =>
    w.dailyGmv > 0 || w.videosPosted > 0 || w.totalSamplesApproved > 0 || w.adSpend > 0
  );
}

export function parseSkuData(
  rows: string[][],
  skus: SkuConfig[]
): SkuData[] {
  // Sum SKU columns across data rows for the current month with actual activity
  const dataRows = rows.slice(2).filter((row) => {
    const date = row[RAW_COLUMNS.date]?.trim();
    const month = row[RAW_COLUMNS.month] || '';
    if (!date) return false;
    if (!isCurrentMonth(month)) return false;
    // Only include rows with some activity
    return (
      num(row[RAW_COLUMNS.dailyGmv]) > 0 ||
      num(row[RAW_COLUMNS.videosPosted]) > 0 ||
      num(row[RAW_COLUMNS.totalSamplesApproved]) > 0
    );
  });

  return skus.map((sku) => {
    const colIdx = RAW_COLUMNS.skuStart + sku.columnOffset;
    let sampleRequests = 0;
    let samplesApproved = 0;
    for (const row of dataRows) {
      const val = num(row[colIdx]);
      samplesApproved += val;
      sampleRequests += val;
    }
    return { name: sku.name, sampleRequests, samplesApproved };
  });
}

export function aggregateByMonth(daily: DailyMetrics[]): MonthlyAggregate[] {
  const byMonth = new Map<string, DailyMetrics[]>();
  for (const d of daily) {
    if (!d.month) continue;
    const existing = byMonth.get(d.month) || [];
    existing.push(d);
    byMonth.set(d.month, existing);
  }

  const result: MonthlyAggregate[] = [];
  byMonth.forEach((days, month) => {
    // Only include days with actual activity
    const activeDays = days.filter(
      (d) => d.dailyGmv > 0 || d.videosPosted > 0 || d.totalSamplesApproved > 0
    );
    if (activeDays.length === 0) return; // Skip months with no data

    const totalGmv = activeDays.reduce((s, d) => s + d.dailyGmv, 0);
    const gmvTarget = days[0]?.gmvTargetMonth || 0;
    const totalVideosPosted = activeDays.reduce((s, d) => s + d.videosPosted, 0);
    const videoTarget = days[0]?.monthlyVideoTarget || 0;
    const totalSamplesApproved = activeDays.reduce((s, d) => s + d.totalSamplesApproved, 0);
    const samplesTarget = days[0]?.targetSamplesGoals || 0;
    const totalAdSpend = activeDays.reduce((s, d) => s + d.adSpend, 0);
    const spendTarget = days[0]?.spendTarget || 0;
    const roiDays = activeDays.filter((d) => d.roi > 0);
    const avgRoi = roiDays.length > 0
      ? roiDays.reduce((s, d) => s + d.roi, 0) / roiDays.length
      : 0;
    const roiTarget = days[0]?.roiTarget || 0;

    result.push({
      month,
      totalGmv,
      gmvTarget,
      totalVideosPosted,
      videoTarget,
      totalSamplesApproved,
      samplesTarget,
      totalAdSpend,
      spendTarget,
      avgRoi,
      roiTarget,
    });
  });

  return result;
}
