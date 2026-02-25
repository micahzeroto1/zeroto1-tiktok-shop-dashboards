import { NextRequest, NextResponse } from 'next/server';
import { validatePodToken } from '@/lib/auth';
import { fetchSheetRanges } from '@/lib/google-sheets';
import { parseRawTab, parseRollupTab } from '@/lib/data-parser';
import { buildMtdScorecardFromRollup, buildMtdScorecard } from '@/lib/pacing';
import { CACHE_REVALIDATE_SECONDS } from '@/config/constants';
import type { ClientMtdSummary, PodApiResponse, WeeklyRollup } from '@/types/dashboard';

export const revalidate = CACHE_REVALIDATE_SECONDS;

export async function GET(
  request: NextRequest,
  { params }: { params: { podSlug: string } }
) {
  const token = request.nextUrl.searchParams.get('token');
  const auth = validatePodToken(params.podSlug, token);

  if (!auth.valid || auth.level !== 'pod') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { pod } = auth;

  if (pod.clients.length === 0) {
    return NextResponse.json({
      podName: pod.displayName,
      podSlug: pod.slug,
      clients: [],
      weeklyData: [],
      lastUpdated: new Date().toISOString(),
    } satisfies PodApiResponse);
  }

  try {
    // Fetch raw + rollup tabs for each client in one batchGet
    const ranges = pod.clients.flatMap((c) => [
      `'${c.rawTabName}'!A1:AZ1000`,
      `'${c.rollupTabName}'!A1:AZ1000`,
    ]);

    const allData = await fetchSheetRanges(pod.spreadsheetId, ranges);

    const allWeeklyRows: WeeklyRollup[][] = [];

    const clients: ClientMtdSummary[] = pod.clients.map((clientConfig, i) => {
      const rawRows = allData[i * 2];
      const rollupRows = allData[i * 2 + 1];

      const daily = parseRawTab(rawRows);
      const { weeklyRows, monthlyRows } = parseRollupTab(rollupRows);

      // Collect weekly rows for pod-level aggregation
      const activeWeekly = weeklyRows.filter(
        (w) => w.dailyGmv > 0 || w.videosPosted > 0 || w.totalSamplesApproved > 0 || w.adSpend > 0
      );
      allWeeklyRows.push(activeWeekly);

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
        dailyData: daily,
      };
    });

    // Aggregate weekly data across all clients by weekLabel
    const weekMap = new Map<string, WeeklyRollup>();
    for (const clientWeeks of allWeeklyRows) {
      for (const w of clientWeeks) {
        const key = w.weekLabel;
        const existing = weekMap.get(key);
        if (existing) {
          existing.dailyGmv += w.dailyGmv;
          existing.gmvTarget += w.gmvTarget;
          existing.videosPosted += w.videosPosted;
          existing.monthlyVideoTarget += w.monthlyVideoTarget;
          existing.totalSamplesApproved += w.totalSamplesApproved;
          existing.targetSamplesGoals += w.targetSamplesGoals;
          existing.adSpend += w.adSpend;
          existing.spendTarget += w.spendTarget;
          existing.cumulativeMtdGmv += w.cumulativeMtdGmv;
          existing.projectedMonthlyGmv += w.projectedMonthlyGmv;
          // ROI: average across clients (weighted later if needed)
          existing.roi = (existing.roi + w.roi) / 2;
        } else {
          weekMap.set(key, { ...w });
        }
      }
    }
    const weeklyData = Array.from(weekMap.values()).sort((a, b) =>
      a.date.localeCompare(b.date)
    );

    const response: PodApiResponse = {
      podName: pod.displayName,
      podSlug: pod.slug,
      clients,
      weeklyData,
      lastUpdated: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Pod API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data' },
      { status: 500 }
    );
  }
}
