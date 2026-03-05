'use client';

import { useEffect, useState } from 'react';
import { Button, Card, CardBody, CardHeader } from '@heroui/react';
import {
  IconGolf,
  IconTrophy,
  IconChartLine,
  IconTarget,
  IconFlag,
  IconCircleDashed,
  IconArrowBadgeDown,
} from '@tabler/icons-react';
import Link from 'next/link';
import { getPlayerStats, getScoringDistribution, getRecentForm } from '@/server/actions/stats';
import { getHandicapTrend } from '@/server/actions/handicap';
import { HandicapTrendChart } from '@/components/stats/handicap-trend-chart';
import { ScoringDistributionChart } from '@/components/stats/scoring-distribution-chart';
import { ParScoringChart } from '@/components/stats/par-scoring-chart';
import { formatScoreToPar } from '@/utils/score-helpers';
import type {
  PlayerStats,
  ScoringDistributionEntry,
  RecentFormEntry,
} from '@/server/actions/stats';
import type { HandicapTrendData } from '@/server/actions/handicap';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function scoreToPar(grossScore: number, par: number): string {
  return formatScoreToPar(grossScore, par);
}

function scoreToParNum(grossScore: number, par: number): number {
  return grossScore - par;
}

function recentFormPar(_entry: RecentFormEntry): number {
  // We don't have par on RecentFormEntry — par 72 is a reasonable default
  return 72;
}

function scoreToParClass(diff: number): string {
  if (diff < 0) return 'text-golf-fairway font-semibold';
  if (diff === 0) return 'text-default-500';
  return 'text-danger';
}

// ---------------------------------------------------------------------------
// Stat card
// ---------------------------------------------------------------------------

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number | null;
  unit?: string;
  highlight?: boolean;
}

function StatCard({ icon, label, value, unit, highlight = false }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="px-5 pt-4 pb-2">
        <div className="flex items-center gap-2">
          <span
            className={`flex h-8 w-8 items-center justify-center rounded-lg ${highlight ? 'bg-golf-green/15' : 'bg-default-100'}`}
          >
            <span className={highlight ? 'text-golf-green' : 'text-default-500'}>{icon}</span>
          </span>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-default-500">
            {label}
          </h3>
        </div>
      </CardHeader>
      <CardBody className="px-5 pb-5">
        {value != null ? (
          <div className="flex items-end gap-1.5">
            <span
              className={`text-4xl font-extrabold leading-none ${highlight ? 'text-golf-green' : ''}`}
            >
              {value}
            </span>
            {unit && <span className="mb-0.5 text-sm font-medium text-default-400">{unit}</span>}
          </div>
        ) : (
          <span className="text-3xl font-bold text-default-300">--</span>
        )}
      </CardBody>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Detail stat item (for the detailed grid)
// ---------------------------------------------------------------------------

interface DetailStatProps {
  icon: React.ReactNode;
  label: string;
  value: string | null;
}

function DetailStat({ icon, label, value }: DetailStatProps) {
  return (
    <Card>
      <CardBody className="flex flex-row items-center gap-4 px-5 py-4">
        <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-golf-green/10 text-golf-green">
          {icon}
        </span>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-default-500">{label}</p>
          <p className="mt-0.5 text-xl font-bold">
            {value != null ? value : <span className="text-default-300">--</span>}
          </p>
        </div>
      </CardBody>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Recent form table row
// ---------------------------------------------------------------------------

function RecentFormRow({ entry, par }: { entry: RecentFormEntry; par: number }) {
  const diff = scoreToParNum(entry.grossScore, par);
  return (
    <tr className="border-b border-default-100 last:border-0">
      <td className="py-3 pr-4 text-sm text-default-500">{entry.roundDate}</td>
      <td className="py-3 pr-4 text-sm font-medium">
        <span className="block max-w-[160px] truncate sm:max-w-none">{entry.courseName}</span>
      </td>
      <td className="py-3 pr-4 text-right text-sm font-bold">{entry.grossScore}</td>
      <td className="py-3 pr-4 text-right text-sm text-default-500">
        {entry.scoreDifferential.toFixed(1)}
      </td>
      <td className={`py-3 text-right text-sm font-semibold ${scoreToParClass(diff)}`}>
        {scoreToPar(entry.grossScore, par)}
      </td>
    </tr>
  );
}

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------

function EmptyState() {
  return (
    <Card>
      <CardBody className="flex flex-col items-center gap-4 px-6 py-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-golf-green/10">
          <IconChartLine className="h-8 w-8 text-golf-green opacity-60" aria-hidden="true" />
        </div>
        <div>
          <p className="font-semibold">No stats yet</p>
          <p className="mt-1 text-sm text-default-500">
            Play your first round to start tracking your performance.
          </p>
        </div>
        <Button
          as={Link}
          href="/dashboard/rounds/new"
          color="success"
          variant="flat"
          startContent={<IconGolf className="h-4 w-4" aria-hidden="true" />}
        >
          Play Your First Round
        </Button>
      </CardBody>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function StatsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [distribution, setDistribution] = useState<ScoringDistributionEntry[]>([]);
  const [recentForm, setRecentForm] = useState<RecentFormEntry[]>([]);
  const [trend, setTrend] = useState<HandicapTrendData>({ labels: [], values: [] });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadAll() {
      const [statsResult, distributionResult, recentFormResult, trendResult] = await Promise.all([
        getPlayerStats(),
        getScoringDistribution(),
        getRecentForm(10),
        getHandicapTrend(12),
      ]);

      if (!statsResult.success) {
        setError(statsResult.error);
        setIsLoading(false);
        return;
      }

      setStats(statsResult.data);

      if (distributionResult.success) {
        setDistribution(distributionResult.data);
      }
      if (recentFormResult.success) {
        setRecentForm(recentFormResult.data);
      }
      if (trendResult.success) {
        setTrend(trendResult.data);
      }

      setIsLoading(false);
    }

    void loadAll();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <IconGolf className="h-8 w-8 animate-pulse text-golf-green" aria-label="Loading stats" />
      </div>
    );
  }

  if (error) {
    return (
      <div
        role="alert"
        className="rounded-xl bg-danger/10 px-4 py-3 text-sm font-medium text-danger"
      >
        {error}
      </div>
    );
  }

  if (!stats || stats.totalRounds === 0) {
    return (
      <div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold">My Stats</h1>
          <p className="mt-1 text-default-500">Track your performance over time.</p>
        </div>
        <EmptyState />
      </div>
    );
  }

  // Derive handicap display from profile (stats don&apos;t carry HCP index directly,
  // we read it from the trend or fall back to showing total rounds)
  const latestHcp = trend.values.length > 0 ? trend.values[trend.values.length - 1] : null;

  return (
    <div>
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">My Stats</h1>
        <p className="mt-1 text-default-500">
          Based on {stats.totalRounds} completed {stats.totalRounds === 1 ? 'round' : 'rounds'}.
        </p>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Top row — key metrics                                               */}
      {/* ------------------------------------------------------------------ */}
      <section aria-labelledby="key-metrics-heading" className="mb-8">
        <h2 id="key-metrics-heading" className="sr-only">
          Key metrics
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            icon={<IconGolf className="h-4 w-4" aria-hidden="true" />}
            label="Handicap Index"
            value={latestHcp != null ? latestHcp.toFixed(1) : null}
            unit="HCP"
            highlight
          />
          <StatCard
            icon={<IconFlag className="h-4 w-4" aria-hidden="true" />}
            label="Total Rounds"
            value={stats.totalRounds}
          />
          <StatCard
            icon={<IconTarget className="h-4 w-4" aria-hidden="true" />}
            label="Average Score"
            value={stats.avgGrossScore != null ? stats.avgGrossScore.toFixed(1) : null}
          />
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* HCP Trend Chart                                                     */}
      {/* ------------------------------------------------------------------ */}
      {trend.labels.length > 1 && (
        <section aria-labelledby="hcp-trend-heading" className="mb-8">
          <Card>
            <CardHeader className="px-6 pt-5 pb-2">
              <div className="flex items-center gap-2">
                <IconChartLine className="h-5 w-5 text-golf-green" aria-hidden="true" />
                <h2 id="hcp-trend-heading" className="font-semibold">
                  Handicap Trend
                </h2>
              </div>
            </CardHeader>
            <CardBody className="px-4 pb-5">
              <HandicapTrendChart labels={trend.labels} values={trend.values} />
            </CardBody>
          </Card>
        </section>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Scoring Distribution + Par Scoring (half-width on desktop)         */}
      {/* ------------------------------------------------------------------ */}
      <section aria-label="Scoring breakdowns" className="mb-8">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* Scoring Distribution */}
          <Card>
            <CardHeader className="px-6 pt-5 pb-2">
              <div className="flex items-center gap-2">
                <IconCircleDashed className="h-5 w-5 text-golf-green" aria-hidden="true" />
                <h2 className="font-semibold">Scoring Distribution</h2>
              </div>
            </CardHeader>
            <CardBody className="px-5 pb-5">
              <ScoringDistributionChart distribution={distribution} />
            </CardBody>
          </Card>

          {/* Par Scoring */}
          <Card>
            <CardHeader className="px-6 pt-5 pb-2">
              <div className="flex items-center gap-2">
                <IconArrowBadgeDown className="h-5 w-5 text-golf-green" aria-hidden="true" />
                <h2 className="font-semibold">Scoring by Par</h2>
              </div>
            </CardHeader>
            <CardBody className="px-4 pb-5">
              <ParScoringChart
                par3Avg={stats.par3Avg}
                par4Avg={stats.par4Avg}
                par5Avg={stats.par5Avg}
              />
            </CardBody>
          </Card>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Detailed stats grid                                                 */}
      {/* ------------------------------------------------------------------ */}
      <section aria-labelledby="detailed-stats-heading" className="mb-8">
        <h2 id="detailed-stats-heading" className="mb-4 text-lg font-semibold">
          Detailed Stats
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <DetailStat
            icon={<IconFlag className="h-5 w-5" aria-hidden="true" />}
            label="Fairways in Regulation"
            value={stats.fairwayHitPct != null ? `${stats.fairwayHitPct.toFixed(1)}%` : null}
          />
          <DetailStat
            icon={<IconTarget className="h-5 w-5" aria-hidden="true" />}
            label="Greens in Regulation"
            value={stats.girPct != null ? `${stats.girPct.toFixed(1)}%` : null}
          />
          <DetailStat
            icon={<IconGolf className="h-5 w-5" aria-hidden="true" />}
            label="Avg Putts per Round"
            value={stats.avgPuttsPerRound != null ? stats.avgPuttsPerRound.toFixed(1) : null}
          />
          <DetailStat
            icon={<IconTrophy className="h-5 w-5" aria-hidden="true" />}
            label="Best Score"
            value={stats.bestGrossScore != null ? String(stats.bestGrossScore) : null}
          />
          <DetailStat
            icon={<IconChartLine className="h-5 w-5" aria-hidden="true" />}
            label="Best Differential"
            value={stats.bestDifferential != null ? stats.bestDifferential.toFixed(1) : null}
          />
          <DetailStat
            icon={<IconFlag className="h-5 w-5" aria-hidden="true" />}
            label="Avg Differential"
            value={stats.avgDifferential != null ? stats.avgDifferential.toFixed(1) : null}
          />
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Recent Form Table                                                   */}
      {/* ------------------------------------------------------------------ */}
      {recentForm.length > 0 && (
        <section aria-labelledby="recent-form-heading">
          <Card>
            <CardHeader className="px-6 pt-5 pb-2">
              <h2 id="recent-form-heading" className="font-semibold">
                Recent Form
              </h2>
            </CardHeader>
            <CardBody className="overflow-x-auto px-5 pb-5">
              <table className="w-full min-w-[520px] text-left" aria-label="Last 10 rounds">
                <thead>
                  <tr className="border-b border-default-200">
                    <th className="pb-2 pr-4 text-xs font-semibold uppercase tracking-wide text-default-400">
                      Date
                    </th>
                    <th className="pb-2 pr-4 text-xs font-semibold uppercase tracking-wide text-default-400">
                      Course
                    </th>
                    <th className="pb-2 pr-4 text-right text-xs font-semibold uppercase tracking-wide text-default-400">
                      Score
                    </th>
                    <th className="pb-2 pr-4 text-right text-xs font-semibold uppercase tracking-wide text-default-400">
                      Diff
                    </th>
                    <th className="pb-2 text-right text-xs font-semibold uppercase tracking-wide text-default-400">
                      +/- Par
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentForm.map((entry) => (
                    <RecentFormRow key={entry.roundId} entry={entry} par={recentFormPar(entry)} />
                  ))}
                </tbody>
              </table>
            </CardBody>
          </Card>
        </section>
      )}
    </div>
  );
}
