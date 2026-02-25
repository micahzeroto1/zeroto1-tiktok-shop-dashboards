import { NextRequest, NextResponse } from 'next/server';
import { validateCeoToken } from '@/lib/auth';
import { fetchSheetRanges } from '@/lib/google-sheets';
import { parseRawTab, parseRollupTab } from '@/lib/data-parser';
import { buildMtdScorecardFromRollup, buildMtdScorecard } from '@/lib/pacing';
import { aggregatePod, aggregateCompany } from '@/lib/aggregation';
import { config } from '@/config/pods';
import { CACHE_REVALIDATE_SECONDS } from '@/config/constants';
import type { ClientMtdSummary } from '@/types/dashboard';

export const revalidate = CACHE_REVALIDATE_SECONDS;

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');
  const auth = validateCeoToken(token);

  if (!auth.valid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Fetch all pods in parallel (one batchGet per spreadsheet)
    const podDataPromises = config.pods
      .filter((pod) => pod.clients.length > 0)
      .map(async (pod) => {
        // Fetch raw + rollup tabs for each client in one batchGet
        const ranges = pod.clients.flatMap((c) => [
          `'${c.rawTabName}'!A1:AZ1000`,
          `'${c.rollupTabName}'!A1:AZ1000`,
        ]);

        const allData = await fetchSheetRanges(pod.spreadsheetId, ranges);

        const clients: ClientMtdSummary[] = pod.clients.map((clientConfig, i) => {
          const rawRows = allData[i * 2];
          const rollupRows = allData[i * 2 + 1];

          const daily = parseRawTab(rawRows);
          const { monthlyRows } = parseRollupTab(rollupRows);

          const scorecard =
            buildMtdScorecardFromRollup(monthlyRows) ?? buildMtdScorecard(daily);

          return {
            clientSlug: clientConfig.slug,
            clientName: clientConfig.displayName,
            cumulativeMtdGmv: scorecard.cumulativeMtdGmv,
            gmvTargetMonth: scorecard.gmvTargetMonth,
            gmvPacing: scorecard.gmvPacing,
            gmvStatus: scorecard.gmvStatus,
            projectedMonthlyGmv: scorecard.projectedMonthlyGmv,
            videosPosted: scorecard.videosPosted,
            monthlyVideoTarget: scorecard.monthlyVideoTarget,
            totalSamplesApproved: scorecard.totalSamplesApproved,
            targetSamplesGoals: scorecard.targetSamplesGoals,
            adSpend: scorecard.adSpend,
            spendTarget: scorecard.spendTarget,
            roi: scorecard.roi,
            roiTarget: scorecard.roiTarget,
            sparkCodesAcquired: scorecard.sparkCodesAcquired,
            targetInvitesSent: scorecard.targetInvitesSent,
            samplesDecline: scorecard.samplesDecline,
            l0Approved: scorecard.l0Approved,
            l1Approved: scorecard.l1Approved,
            l2Approved: scorecard.l2Approved,
            l3Approved: scorecard.l3Approved,
            l4Approved: scorecard.l4Approved,
            l5Approved: scorecard.l5Approved,
            l6Approved: scorecard.l6Approved,
            dailyData: daily,
          };
        });

        return aggregatePod(pod.slug, pod.displayName, clients);
      });

    const podSummaries = await Promise.all(podDataPromises);
    const response = aggregateCompany(podSummaries);

    return NextResponse.json({
      ...response,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('CEO API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data' },
      { status: 500 }
    );
  }
}
