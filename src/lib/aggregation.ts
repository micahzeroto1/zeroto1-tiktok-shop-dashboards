import { getPacingStatus } from '@/config/constants';
import type { ClientMtdSummary, MonthlyAggregate, PodSummary, CeoApiResponse, WeeklyRollup } from '@/types/dashboard';
import { config } from '@/config/pods';

const MONTH_NAMES = [
  'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
  'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER',
];

/**
 * Aggregate monthly rollup rows from multiple clients into MonthlyAggregate[].
 * Groups by month name (weekLabel), sums metrics, averages ROI.
 */
export function aggregateMonthlyAcrossClients(
  allMonthlyRows: WeeklyRollup[]
): MonthlyAggregate[] {
  const byMonth = new Map<string, WeeklyRollup[]>();
  for (const row of allMonthlyRows) {
    const key = row.weekLabel.toUpperCase();
    const existing = byMonth.get(key) || [];
    existing.push(row);
    byMonth.set(key, existing);
  }

  const result: MonthlyAggregate[] = [];
  byMonth.forEach((rows, monthKey) => {
    const totalGmv = rows.reduce((s, r) => s + r.cumulativeMtdGmv, 0);
    const gmvTarget = rows.reduce((s, r) => s + r.gmvTarget, 0);
    const totalVideosPosted = rows.reduce((s, r) => s + r.videosPosted, 0);
    const videoTarget = rows.reduce((s, r) => s + r.monthlyVideoTarget, 0);
    const totalSamplesApproved = rows.reduce((s, r) => s + r.totalSamplesApproved, 0);
    const samplesTarget = rows.reduce((s, r) => s + r.targetSamplesGoals, 0);
    const totalAdSpend = rows.reduce((s, r) => s + r.adSpend, 0);
    const spendTarget = rows.reduce((s, r) => s + r.spendTarget, 0);
    const roiRows = rows.filter((r) => r.roi > 0);
    const avgRoi = roiRows.length > 0
      ? roiRows.reduce((s, r) => s + r.roi, 0) / roiRows.length
      : 0;
    const roiTarget = Math.max(...rows.map((r) => r.roiTarget), 0);

    // Title-case the month name
    const month = monthKey.charAt(0) + monthKey.slice(1).toLowerCase();

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

  // Sort chronologically
  result.sort((a, b) => {
    const ai = MONTH_NAMES.indexOf(a.month.toUpperCase());
    const bi = MONTH_NAMES.indexOf(b.month.toUpperCase());
    return ai - bi;
  });

  return result;
}

export function aggregatePod(
  podSlug: string,
  podName: string,
  clients: ClientMtdSummary[]
): PodSummary {
  const totalMtdGmv = clients.reduce((s, c) => s + c.cumulativeMtdGmv, 0);
  const totalMtdTarget = clients.reduce((s, c) => s + c.gmvTargetMonth, 0);
  const gmvPacing = totalMtdTarget > 0 ? totalMtdGmv / totalMtdTarget : 0;
  const projectedMonthlyGmv = clients.reduce((s, c) => s + c.projectedMonthlyGmv, 0);

  const totalVideosPosted = clients.reduce((s, c) => s + c.videosPosted, 0);
  const totalVideoTarget = clients.reduce((s, c) => s + c.monthlyVideoTarget, 0);
  const totalSamplesApproved = clients.reduce((s, c) => s + c.totalSamplesApproved, 0);
  const totalSamplesTarget = clients.reduce((s, c) => s + c.targetSamplesGoals, 0);
  const totalAdSpend = clients.reduce((s, c) => s + c.adSpend, 0);
  const totalSpendTarget = clients.reduce((s, c) => s + c.spendTarget, 0);

  const roiClients = clients.filter((c) => c.roi > 0);
  const avgRoi = roiClients.length > 0
    ? roiClients.reduce((s, c) => s + c.roi, 0) / roiClients.length
    : 0;

  // Pipeline totals
  const totalSamplesDecline = clients.reduce((s, c) => s + c.samplesDecline, 0);
  const totalInvitesSent = clients.reduce((s, c) => s + c.targetInvitesSent, 0);
  const totalSparkCodes = clients.reduce((s, c) => s + c.sparkCodesAcquired, 0);

  return {
    podSlug,
    podName,
    totalMtdGmv,
    totalMtdTarget,
    gmvPacing,
    gmvStatus: getPacingStatus(gmvPacing),
    projectedMonthlyGmv,
    totalVideosPosted,
    totalVideoTarget,
    totalSamplesApproved,
    totalSamplesTarget,
    totalAdSpend,
    totalSpendTarget,
    avgRoi,
    totalSamplesDecline,
    totalInvitesSent,
    totalSparkCodes,
    clients,
  };
}

export function aggregateCompany(pods: PodSummary[], ytdGmv: number): Omit<CeoApiResponse, 'lastUpdated' | 'weeklyData' | 'monthlyData' | 'monthlyPods' | 'monthlyAllClients'> {
  const companyMtdGmv = pods.reduce((s, p) => s + p.totalMtdGmv, 0);
  const companyMtdTarget = pods.reduce((s, p) => s + p.totalMtdTarget, 0);
  const companyGmvPacing = companyMtdTarget > 0
    ? companyMtdGmv / companyMtdTarget
    : 0;

  // Sum projected monthly GMV from all pods
  const projectedMonthlyGmv = pods.reduce((s, p) => s + p.projectedMonthlyGmv, 0);

  // Pro-rated annual target based on days elapsed in the year
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const dayOfYear = Math.floor((now.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const ytdTarget = (config.annualGmvTarget / 365) * dayOfYear;

  const allClients = pods.flatMap((p) => p.clients);

  return {
    companyMtdGmv,
    companyMtdTarget,
    companyGmvPacing,
    companyGmvStatus: getPacingStatus(companyGmvPacing),
    projectedMonthlyGmv,
    annualTarget: config.annualGmvTarget,
    ytdGmv,
    ytdTarget,
    pods,
    allClients,
  };
}
