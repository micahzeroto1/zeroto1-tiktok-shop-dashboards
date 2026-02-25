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

const MONTH_NAMES = [
  'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
  'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER',
];

/**
 * Classify a rollup-tab row by its type.
 *
 *   daily:   Col A = "Week XX",  Col B = date
 *   weekly:  Col A = date,       Col B = "Week XX"
 *   monthly: Col A = date,       Col B = month name (JANUARY …)
 *   annual:  Col B = year (2026)
 */
type RollupRowType = 'daily' | 'weekly' | 'monthly' | 'annual' | 'unknown';

function classifyRollupRow(row: string[]): RollupRowType {
  const colA = (row[0] || '').trim();
  const colB = (row[1] || '').trim();

  if (/^\d{4}$/.test(colB)) return 'annual';
  if (MONTH_NAMES.includes(colB.toUpperCase())) return 'monthly';
  if (/^Week\s+\d+/i.test(colB)) return 'weekly';
  if (/^Week\s+\d+/i.test(colA)) return 'daily';

  return 'unknown';
}

/** Parse metric columns (index 2+) shared across all row types */
function parseRollupMetrics(row: string[]): Omit<WeeklyRollup, 'weekLabel' | 'date'> {
  return {
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
    l0Approved: num(row[ROLLUP_COLUMNS.l0Approved]),
    l1Approved: num(row[ROLLUP_COLUMNS.l1Approved]),
    l2Approved: num(row[ROLLUP_COLUMNS.l2Approved]),
    l3Approved: num(row[ROLLUP_COLUMNS.l3Approved]),
    l4Approved: num(row[ROLLUP_COLUMNS.l4Approved]),
    l5Approved: num(row[ROLLUP_COLUMNS.l5Approved]),
    l6Approved: num(row[ROLLUP_COLUMNS.l6Approved]),
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
  };
}

export interface RollupData {
  /** Weekly rollup rows (Col A = date, Col B = "Week XX") */
  weeklyRows: WeeklyRollup[];
  /** Monthly rollup rows (Col A = date, Col B = month name) */
  monthlyRows: WeeklyRollup[];
}

/**
 * Parse a rollup tab, classifying rows and returning only weekly and monthly
 * rollup rows.  Daily rows and annual rows are discarded.
 *
 * For weekly & monthly rows Col A / Col B are swapped compared to daily rows:
 *   Col A = date,  Col B = label ("Week XX" or "FEBRUARY").
 */
export function parseRollupTab(rows: string[][]): RollupData {
  const weeklyRows: WeeklyRollup[] = [];
  const monthlyRows: WeeklyRollup[] = [];

  // Row 0 = headers, data starts at Row 1
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length < 2) continue;

    const type = classifyRollupRow(row);

    if (type === 'weekly') {
      weeklyRows.push({
        weekLabel: (row[1] || '').trim(), // Col B → "Week XX"
        date: (row[0] || '').trim(),      // Col A → date
        ...parseRollupMetrics(row),
      });
    } else if (type === 'monthly') {
      monthlyRows.push({
        weekLabel: (row[1] || '').trim(), // Col B → month name
        date: (row[0] || '').trim(),      // Col A → date
        ...parseRollupMetrics(row),
      });
    }
  }

  return { weeklyRows, monthlyRows };
}

// ─── Raw-tab parsing (unchanged) ────────────────────────────────────────────

export function parseRawTab(rows: string[][]): DailyMetrics[] {
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

export function parseSkuData(rows: string[][], skus: SkuConfig[]): SkuData[] {
  const dataRows = rows.slice(2).filter((row) => {
    const date = row[RAW_COLUMNS.date]?.trim();
    const month = row[RAW_COLUMNS.month] || '';
    if (!date) return false;
    if (!isCurrentMonth(month)) return false;
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
    const activeDays = days.filter(
      (d) => d.dailyGmv > 0 || d.videosPosted > 0 || d.totalSamplesApproved > 0
    );
    if (activeDays.length === 0) return;

    result.push({
      month,
      totalGmv: activeDays.reduce((s, d) => s + d.dailyGmv, 0),
      gmvTarget: days[0]?.gmvTargetMonth || 0,
      totalVideosPosted: activeDays.reduce((s, d) => s + d.videosPosted, 0),
      videoTarget: days[0]?.monthlyVideoTarget || 0,
      totalSamplesApproved: activeDays.reduce((s, d) => s + d.totalSamplesApproved, 0),
      samplesTarget: days[0]?.targetSamplesGoals || 0,
      totalAdSpend: activeDays.reduce((s, d) => s + d.adSpend, 0),
      spendTarget: days[0]?.spendTarget || 0,
      avgRoi: (() => {
        const roiDays = activeDays.filter((d) => d.roi > 0);
        return roiDays.length > 0
          ? roiDays.reduce((s, d) => s + d.roi, 0) / roiDays.length
          : 0;
      })(),
      roiTarget: days[0]?.roiTarget || 0,
    });
  });

  return result;
}
