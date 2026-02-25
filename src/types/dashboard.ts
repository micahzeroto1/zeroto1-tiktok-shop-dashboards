export interface DailyMetrics {
  date: string;
  month: string;
  gmvTargetMonth: number;
  monthlyVideoPostedPacing: number;
  samplingPacing: number;
  monthlyGmvPacing: number;
  dailyTargetGmv: number;
  cumulativeMtdGmv: number;
  projectedMonthlyGmv: number;
  projectedGmvDelta: number;
  gmvPacing: number;
  affiliatesAdded: number;
  contentPending: number;
  videosPosted: number;
  monthlyVideoTarget: number;
  videosConverted: number;
  sparkCodesAcquired: number;
  targetInvitesSent: number;
  dailySampleRequests: number;
  l0Approved: number;
  l1Approved: number;
  l2Approved: number;
  l3Approved: number;
  l4Approved: number;
  l5Approved: number;
  l6Approved: number;
  totalSamplesApproved: number;
  targetSamplesGoals: number;
  samplesDecline: number;
  samplesRemain: number;
  dailyGmv: number;
  gmvTarget: number;
  adSpend: number;
  spendTarget: number;
  roi: number;
  roiTarget: number;
}

export interface WeeklyRollup {
  weekLabel: string;
  date: string;
  monthlyVideoPostedPacing: number;
  samplingPacing: number;
  monthlyGmvPacing: number;
  dailyTargetGmv: number;
  cumulativeMtdGmv: number;
  projectedMonthlyGmv: number;
  projectedGmvDelta: number;
  gmvPacing: number;
  affiliatesAdded: number;
  contentPending: number;
  videosPosted: number;
  monthlyVideoTarget: number;
  videosConverted: number;
  sparkCodesAcquired: number;
  targetInvitesSent: number;
  dailySampleRequests: number;
  totalSamplesApproved: number;
  targetSamplesGoals: number;
  samplesDecline: number;
  samplesRemain: number;
  dailyGmv: number;
  gmvTarget: number;
  adSpend: number;
  spendTarget: number;
  roi: number;
  roiTarget: number;
}

export interface MtdScorecard {
  cumulativeMtdGmv: number;
  gmvTargetMonth: number;
  gmvPacing: number;
  gmvStatus: 'green' | 'yellow' | 'red';
  projectedMonthlyGmv: number;
  videosPosted: number;
  monthlyVideoTarget: number;
  videoPacing: number;
  videoStatus: 'green' | 'yellow' | 'red';
  totalSamplesApproved: number;
  targetSamplesGoals: number;
  samplesPacing: number;
  samplesStatus: 'green' | 'yellow' | 'red';
  adSpend: number;
  spendTarget: number;
  spendPacing: number;
  spendStatus: 'green' | 'yellow' | 'red';
  roi: number;
  roiTarget: number;
  roiStatus: 'green' | 'yellow' | 'red';
}

export interface SkuData {
  name: string;
  sampleRequests: number;
  samplesApproved: number;
}

export interface ClientApiResponse {
  clientName: string;
  mtdScorecard: MtdScorecard;
  weeklyData: WeeklyRollup[];
  monthlyData: MonthlyAggregate[];
  skuBreakdown?: SkuData[];
  lastUpdated: string;
}

export interface MonthlyAggregate {
  month: string;
  totalGmv: number;
  gmvTarget: number;
  totalVideosPosted: number;
  videoTarget: number;
  totalSamplesApproved: number;
  samplesTarget: number;
  totalAdSpend: number;
  spendTarget: number;
  avgRoi: number;
  roiTarget: number;
}

export interface ClientMtdSummary {
  clientSlug: string;
  clientName: string;
  cumulativeMtdGmv: number;
  gmvTargetMonth: number;
  gmvPacing: number;
  gmvStatus: 'green' | 'yellow' | 'red';
  projectedMonthlyGmv: number;
  videosPosted: number;
  monthlyVideoTarget: number;
  totalSamplesApproved: number;
  targetSamplesGoals: number;
  adSpend: number;
  spendTarget: number;
  roi: number;
  roiTarget: number;
  dailyData: DailyMetrics[];
}

export interface PodApiResponse {
  podName: string;
  podSlug: string;
  clients: ClientMtdSummary[];
  weeklyData: WeeklyRollup[];
  lastUpdated: string;
}

export interface PodSummary {
  podSlug: string;
  podName: string;
  totalMtdGmv: number;
  totalMtdTarget: number;
  gmvPacing: number;
  gmvStatus: 'green' | 'yellow' | 'red';
  totalVideosPosted: number;
  totalVideoTarget: number;
  totalSamplesApproved: number;
  totalSamplesTarget: number;
  totalAdSpend: number;
  totalSpendTarget: number;
  avgRoi: number;
  clients: ClientMtdSummary[];
}

export interface CeoApiResponse {
  companyMtdGmv: number;
  companyMtdTarget: number;
  companyGmvPacing: number;
  companyGmvStatus: 'green' | 'yellow' | 'red';
  annualTarget: number;
  projectedAnnualGmv: number;
  pods: PodSummary[];
  allClients: ClientMtdSummary[];
  lastUpdated: string;
}
