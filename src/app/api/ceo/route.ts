import { NextRequest, NextResponse } from 'next/server';
import { validateCeoToken } from '@/lib/auth';
import { fetchClientRangesSafe } from '@/lib/google-sheets';
import { parseRawTab, parseRollupTab } from '@/lib/data-parser';
import { buildMtdScorecardFromRollup, buildMtdScorecard } from '@/lib/pacing';
import { aggregatePod, aggregateCompany } from '@/lib/aggregation';
import { config } from '@/config/pods';
import { CACHE_REVALIDATE_SECONDS } from '@/config/constants';
import type { ClientMtdSummary, WeeklyRollup } from '@/types/dashboard';

export const revalidate = CACHE_REVALIDATE_SECONDS;

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');
  const auth = validateCeoToken(token);

  if (!auth.valid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Fetch all pods in parallel, each client fetched individually for resilience
    const podDataPromises = config.pods
      .filter((pod) => pod.clients.length > 0)
      .map(async (pod) => {
        const allMonthlyRows: WeeklyRollup[] = [];

        // Fetch each client individually so one missing tab doesn't break the whole pod
        const clientResults = await Promise.all(
          pod.clients.map((clientConfig) =>
            fetchClientRangesSafe(pod.spreadsheetId, clientConfig.rawTabName, clientConfig.rollupTabName)
              .then((data) => ({ clientConfig, data }))
          )
        );

        const clients: ClientMtdSummary[] = clientResults
          .filter((r) => r.data !== null)
          .map(({ clientConfig, data }) => {
            const daily = parseRawTab(data!.rawRows);
            const { monthlyRows } = parseRollupTab(data!.rollupRows);

            // Collect monthly rows for YTD calculation
            allMonthlyRows.push(...monthlyRows);

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

        return { pod: aggregatePod(pod.slug, pod.displayName, clients), monthlyRows: allMonthlyRows };
      });

    const podResults = await Promise.all(podDataPromises);
    const podSummaries = podResults.map((r) => r.pod);

    // Compute YTD GMV: sum cumulativeMtdGmv from all monthly rows for current year
    const MONTH_NAMES = [
      'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
      'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER',
    ];
    const currentMonthIdx = new Date().getMonth(); // 0-based
    const validMonths = new Set(MONTH_NAMES.slice(0, currentMonthIdx + 1));
    const allMonthlyRows = podResults.flatMap((r) => r.monthlyRows);
    const ytdGmv = allMonthlyRows
      .filter((row) => validMonths.has(row.weekLabel.toUpperCase()))
      .reduce((sum, row) => sum + row.cumulativeMtdGmv, 0);

    const response = aggregateCompany(podSummaries, ytdGmv);

    return NextResponse.json({
      ...response,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error('CEO API error:', err.message, err.stack, (err as NodeJS.ErrnoException).code);
    return NextResponse.json(
      { error: 'Failed to fetch data' },
      { status: 500 }
    );
  }
}
