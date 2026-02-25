import { RAW_COLUMNS, ROLLUP_COLUMNS } from '@/config/metrics';
import type { SkuConfig } from '@/config/pods';
import type { DailyMetrics, WeeklyRollup, MonthlyAggregate, SkuData } from '@/types/dashboard';

function num(val: string | undefined): number {
  if (!val) return 0;
  const cleaned = val.replace(/[$,%]/g, '').trim();
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
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
  return rows.slice(2).filter((row) => row[ROLLUP_COLUMNS.date]?.trim()).map((row) => ({
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

export function parseSkuData(
  rows: string[][],
  skus: SkuConfig[]
): SkuData[] {
  // Sum SKU columns across all data rows for the current month
  const currentMonth = new Date().toLocaleString('default', { month: 'long' });
  const dataRows = rows.slice(2).filter(
    (row) => row[RAW_COLUMNS.date]?.trim() && row[RAW_COLUMNS.month]?.includes(currentMonth)
  );

  return skus.map((sku) => {
    const colIdx = RAW_COLUMNS.skuStart + sku.columnOffset;
    let sampleRequests = 0;
    let samplesApproved = 0;
    for (const row of dataRows) {
      // SKU columns contain sample data; interpret as approved counts
      samplesApproved += num(row[colIdx]);
      sampleRequests += num(row[colIdx]); // same column for now
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
    const totalGmv = days.reduce((s, d) => s + d.dailyGmv, 0);
    const gmvTarget = days[0]?.gmvTargetMonth || 0;
    const totalVideosPosted = days.reduce((s, d) => s + d.videosPosted, 0);
    const videoTarget = days[0]?.monthlyVideoTarget || 0;
    const totalSamplesApproved = days.reduce((s, d) => s + d.totalSamplesApproved, 0);
    const samplesTarget = days[0]?.targetSamplesGoals || 0;
    const totalAdSpend = days.reduce((s, d) => s + d.adSpend, 0);
    const spendTarget = days[0]?.spendTarget || 0;
    const roiDays = days.filter((d) => d.roi > 0);
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
