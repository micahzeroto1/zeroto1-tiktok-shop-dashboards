import { NextRequest, NextResponse } from 'next/server';
import { validatePodToken } from '@/lib/auth';
import { fetchClientRangesSafe } from '@/lib/google-sheets';
import { parseRawTab, parseRollupTab } from '@/lib/data-parser';
import { buildMtdScorecardFromRollup, buildMtdScorecard, buildAllMonthScorecards, buildScorecardFromRow } from '@/lib/pacing';
import { sortWeeklyByDate } from '@/lib/week-labels';
import { aggregateMonthlyAcrossClients } from '@/lib/aggregation';
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
      monthlyClients: {},
      weeklyData: [],
      monthlyData: [],
      lastUpdated: new Date().toISOString(),
    } satisfies PodApiResponse);
  }

  try {
    // Fetch each client individually so one missing tab doesn't break the whole pod
    const clientResults = await Promise.all(
      pod.clients.map((clientConfig) =>
        fetchClientRangesSafe(pod.spreadsheetId, clientConfig.rawTabName, clientConfig.rollupTabName)
          .then((data) => ({ clientConfig, data }))
      )
    );

    const allWeeklyRows: WeeklyRollup[][] = [];
    const allMonthlyRows: WeeklyRollup[] = [];
    const monthlyClientsMap = new Map<string, ClientMtdSummary[]>();

    const scorecardToClientSummary = (
      scorecard: ReturnType<typeof buildScorecardFromRow>,
      slug: string,
      name: string,
      dailyData: ReturnType<typeof parseRawTab> = []
    ): ClientMtdSummary => ({
        clientSlug: slug,
        clientName: name,
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
        dailyData,
    });

    const clients: ClientMtdSummary[] = clientResults
      .filter((r) => r.data !== null)
      .map(({ clientConfig, data }) => {
      const rawRows = data!.rawRows;
      const rollupRows = data!.rollupRows;

      const daily = parseRawTab(rawRows);
      const { weeklyRows, monthlyRows } = parseRollupTab(rollupRows);

      // Collect monthly rows for pod-level aggregation
      allMonthlyRows.push(...monthlyRows);

      // Build per-month client summaries
      const perMonth = buildAllMonthScorecards(monthlyRows);
      for (const [mk, sc] of Object.entries(perMonth)) {
        const list = monthlyClientsMap.get(mk) || [];
        list.push(scorecardToClientSummary(sc, clientConfig.slug, clientConfig.displayName));
        monthlyClientsMap.set(mk, list);
      }

      // Collect weekly rows for pod-level aggregation
      const activeWeekly = weeklyRows.filter(
        (w) => w.dailyGmv > 0 || w.videosPosted > 0 || w.totalSamplesApproved > 0 || w.adSpend > 0
      );
      allWeeklyRows.push(activeWeekly);

      const scorecard =
        buildMtdScorecardFromRollup(monthlyRows) ?? buildMtdScorecard(daily);

      return scorecardToClientSummary(scorecard, clientConfig.slug, clientConfig.displayName, daily);
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
          existing.sparkCodesAcquired += w.sparkCodesAcquired;
          existing.targetInvitesSent += w.targetInvitesSent;
          existing.samplesDecline += w.samplesDecline;
          existing.l0Approved += w.l0Approved;
          existing.l1Approved += w.l1Approved;
          existing.l2Approved += w.l2Approved;
          existing.l3Approved += w.l3Approved;
          existing.l4Approved += w.l4Approved;
          existing.l5Approved += w.l5Approved;
          existing.l6Approved += w.l6Approved;
          // ROI: average across clients (weighted later if needed)
          existing.roi = (existing.roi + w.roi) / 2;
        } else {
          weekMap.set(key, { ...w });
        }
      }
    }
    const weeklyData = sortWeeklyByDate(Array.from(weekMap.values()));

    const monthlyData = aggregateMonthlyAcrossClients(allMonthlyRows);

    // Convert monthlyClientsMap to Record
    const monthlyClients: Record<string, ClientMtdSummary[]> = {};
    monthlyClientsMap.forEach((v, k) => { monthlyClients[k] = v; });

    const response: PodApiResponse = {
      podName: pod.displayName,
      podSlug: pod.slug,
      clients,
      monthlyClients,
      weeklyData,
      monthlyData,
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
