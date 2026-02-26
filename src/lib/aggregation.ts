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

export function aggregateCompany(pods: PodSummary[], ytdGmv: number): Omit<CeoApiResponse, 'lastUpdated'> {
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
