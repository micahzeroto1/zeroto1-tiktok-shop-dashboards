import { getPacingStatus } from '@/config/constants';
import type { ClientMtdSummary, PodSummary, CeoApiResponse } from '@/types/dashboard';
import { config } from '@/config/pods';

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
  const totalSampleRequests = clients.reduce((s, c) => s + c.dailySampleRequests, 0);
  const totalSamplesDecline = clients.reduce((s, c) => s + c.samplesDecline, 0);
  const totalAffiliatesAdded = clients.reduce((s, c) => s + c.affiliatesAdded, 0);
  const totalContentPending = clients.reduce((s, c) => s + c.contentPending, 0);
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
    totalSampleRequests,
    totalSamplesDecline,
    totalAffiliatesAdded,
    totalContentPending,
    totalInvitesSent,
    totalSparkCodes,
    clients,
  };
}

export function aggregateCompany(pods: PodSummary[]): Omit<CeoApiResponse, 'lastUpdated'> {
  const companyMtdGmv = pods.reduce((s, p) => s + p.totalMtdGmv, 0);
  const companyMtdTarget = pods.reduce((s, p) => s + p.totalMtdTarget, 0);
  const companyGmvPacing = companyMtdTarget > 0
    ? companyMtdGmv / companyMtdTarget
    : 0;

  // Sum projected monthly GMV from all pods
  const projectedMonthlyGmv = pods.reduce((s, p) => s + p.projectedMonthlyGmv, 0);

  // Project annual GMV from current month pace
  const now = new Date();
  const dayOfMonth = now.getDate();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const monthlyProjection = dayOfMonth > 0
    ? (companyMtdGmv / dayOfMonth) * daysInMonth
    : 0;
  const projectedAnnualGmv = monthlyProjection * 12;

  const allClients = pods.flatMap((p) => p.clients);

  return {
    companyMtdGmv,
    companyMtdTarget,
    companyGmvPacing,
    companyGmvStatus: getPacingStatus(companyGmvPacing),
    projectedMonthlyGmv,
    annualTarget: config.annualGmvTarget,
    projectedAnnualGmv,
    pods,
    allClients,
  };
}
