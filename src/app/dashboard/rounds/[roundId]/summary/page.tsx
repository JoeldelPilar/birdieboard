'use client';

import { Button, Card, CardBody, CardHeader } from '@heroui/react';
import { IconArrowLeft, IconCalendar, IconGolf, IconHome, IconTrophy } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getRound } from '@/server/actions/rounds';
import { getCourseDetails } from '@/server/actions/courses';
import { getScoreBgColor, formatScoreToPar } from '@/utils/score-helpers';
import type { RoundWithScores } from '@/server/actions/rounds';
import type { CourseWithDetails } from '@/server/actions/courses';

interface PageProps {
  params: Promise<{ roundId: string }>;
}

interface ScoreBreakdown {
  albatrossOrBetter: number;
  eagles: number;
  birdies: number;
  pars: number;
  bogeys: number;
  doubles: number;
  others: number;
}

type HoleScore = RoundWithScores['holeScores'][number];
type TeeHole = CourseWithDetails['tees'][number]['holes'][number];

function getBreakdown(scores: HoleScore[], holes: TeeHole[]): ScoreBreakdown {
  const breakdown: ScoreBreakdown = {
    albatrossOrBetter: 0,
    eagles: 0,
    birdies: 0,
    pars: 0,
    bogeys: 0,
    doubles: 0,
    others: 0,
  };

  for (const score of scores) {
    const hole = holes.find((h) => h.holeNumber === score.holeNumber);
    if (!hole) continue;
    const diff = score.strokes - hole.par;
    if (diff <= -3) breakdown.albatrossOrBetter++;
    else if (diff === -2) breakdown.eagles++;
    else if (diff === -1) breakdown.birdies++;
    else if (diff === 0) breakdown.pars++;
    else if (diff === 1) breakdown.bogeys++;
    else if (diff === 2) breakdown.doubles++;
    else breakdown.others++;
  }

  return breakdown;
}

function BreakdownBar({
  label,
  count,
  total,
  colorClass,
}: {
  label: string;
  count: number;
  total: number;
  colorClass: string;
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  if (count === 0) return null;
  return (
    <div className="flex items-center gap-3">
      <span className="w-28 text-right text-sm text-default-500">{label}</span>
      <div className="flex flex-1 items-center gap-2">
        <div className="h-5 flex-1 overflow-hidden rounded-full bg-default-100">
          <div
            className={`h-full rounded-full ${colorClass} transition-all`}
            style={{ width: `${pct}%` }}
            aria-hidden="true"
          />
        </div>
        <span className="w-6 text-right text-sm font-semibold">{count}</span>
      </div>
    </div>
  );
}

export default function RoundSummaryPage({ params }: PageProps) {
  const [round, setRound] = useState<RoundWithScores | null>(null);
  const [teeHoles, setTeeHoles] = useState<TeeHole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    params.then(({ roundId }) => {
      void loadRound(roundId);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadRound(roundId: string) {
    setIsLoading(true);
    const result = await getRound(roundId);

    if (!result.success) {
      setIsLoading(false);
      setError(result.error);
      return;
    }

    const data = result.data;

    // Fetch course details to get hole info (par, strokeIndex, distance)
    const courseResult = await getCourseDetails(data.courseId);
    setIsLoading(false);

    if (!courseResult.success) {
      setError(courseResult.error);
      setRound(data);
      return;
    }

    const matchingTee = courseResult.data.tees.find((t) => t.id === data.teeId);
    setTeeHoles(matchingTee?.holes ?? []);
    setRound(data);
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <IconGolf className="h-8 w-8 animate-pulse text-golf-green" aria-label="Loading" />
      </div>
    );
  }

  if (error || !round) {
    return (
      <div className="flex flex-col items-center gap-4 py-24 text-center">
        <p className="font-semibold">{error ?? 'Round not found.'}</p>
        <Button as={Link} href="/dashboard/rounds" color="success" variant="flat">
          Back to Rounds
        </Button>
      </div>
    );
  }

  const front9 = teeHoles.filter((h) => h.holeNumber <= 9);
  const back9 = teeHoles.filter((h) => h.holeNumber >= 10);
  const front9Par = front9.reduce((sum, h) => sum + h.par, 0);
  const back9Par = back9.reduce((sum, h) => sum + h.par, 0);
  const totalPar = front9Par + back9Par;

  function getScore(holeNumber: number): HoleScore | undefined {
    return round!.holeScores.find((s) => s.holeNumber === holeNumber);
  }

  const front9Score = front9.reduce((sum, h) => {
    const s = getScore(h.holeNumber);
    return sum + (s?.strokes ?? 0);
  }, 0);

  const back9Score = back9.reduce((sum, h) => {
    const s = getScore(h.holeNumber);
    return sum + (s?.strokes ?? 0);
  }, 0);

  const totalScore = front9Score + back9Score;

  const breakdown = getBreakdown(round.holeScores, teeHoles);
  const totalScored = round.holeScores.length;

  const scoreDiff = round.scoreDifferential ? parseFloat(round.scoreDifferential) : null;

  return (
    <div className="mx-auto max-w-2xl">
      {/* Header */}
      <div className="mb-6">
        <Button
          as={Link}
          href="/dashboard/rounds"
          variant="light"
          size="sm"
          startContent={<IconArrowLeft className="h-4 w-4" aria-hidden="true" />}
          className="mb-4 text-default-500"
        >
          All Rounds
        </Button>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-golf-green/10">
            <IconTrophy className="h-6 w-6 text-golf-green" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Round Complete</h1>
            <div className="mt-0.5 flex items-center gap-1.5 text-sm text-default-400">
              <IconCalendar className="h-3.5 w-3.5" aria-hidden="true" />
              {round.roundDate}
            </div>
          </div>
        </div>
      </div>

      {/* Course info + score hero */}
      <Card className="mb-4">
        <CardBody className="px-6 py-5">
          <p className="font-semibold">{round.course.name}</p>
          {round.course.clubName && round.course.clubName !== round.course.name && (
            <p className="text-sm text-default-400">{round.course.clubName}</p>
          )}
          <p className="mt-0.5 text-sm text-default-400">
            {round.tee.teeName} tee &middot; Par {round.tee.par}
          </p>

          <div className="mt-5 flex items-end gap-6">
            <div>
              <p className="text-xs uppercase tracking-widest text-default-400">Gross Score</p>
              <p
                className={`text-6xl font-extrabold leading-none ${
                  totalScore - totalPar < 0
                    ? 'text-golf-fairway'
                    : totalScore - totalPar === 0
                      ? 'text-default-700'
                      : 'text-danger'
                }`}
              >
                {totalScore}
              </p>
            </div>
            <div className="mb-1.5">
              <p className="text-xs uppercase tracking-widest text-default-400">To Par</p>
              <p
                className={`text-2xl font-bold ${
                  totalScore - totalPar < 0
                    ? 'text-golf-fairway'
                    : totalScore - totalPar === 0
                      ? 'text-default-700'
                      : 'text-danger'
                }`}
              >
                {formatScoreToPar(totalScore, totalPar)}
              </p>
            </div>
            {scoreDiff !== null && (
              <div className="mb-1.5">
                <p className="text-xs uppercase tracking-widest text-default-400">Differential</p>
                <p className="text-2xl font-bold text-default-600">
                  {scoreDiff > 0 ? '+' : ''}
                  {scoreDiff.toFixed(1)}
                </p>
              </div>
            )}
            {round.stablefordPoints != null && (
              <div className="mb-1.5">
                <p className="text-xs uppercase tracking-widest text-default-400">Stableford</p>
                <p className="text-2xl font-bold text-golf-sky">{round.stablefordPoints}</p>
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Score breakdown bars */}
      {totalScored > 0 && (
        <Card className="mb-4">
          <CardHeader className="px-6 pt-5 pb-3">
            <h2 className="text-base font-semibold">Score Breakdown</h2>
          </CardHeader>
          <CardBody className="flex flex-col gap-2.5 px-6 pb-5">
            <BreakdownBar
              label="Albatross+"
              count={breakdown.albatrossOrBetter}
              total={totalScored}
              colorClass="bg-yellow-400"
            />
            <BreakdownBar
              label="Eagle"
              count={breakdown.eagles}
              total={totalScored}
              colorClass="bg-yellow-400/70"
            />
            <BreakdownBar
              label="Birdie"
              count={breakdown.birdies}
              total={totalScored}
              colorClass="bg-golf-fairway"
            />
            <BreakdownBar
              label="Par"
              count={breakdown.pars}
              total={totalScored}
              colorClass="bg-default-400"
            />
            <BreakdownBar
              label="Bogey"
              count={breakdown.bogeys}
              total={totalScored}
              colorClass="bg-danger/60"
            />
            <BreakdownBar
              label="Double Bogey"
              count={breakdown.doubles}
              total={totalScored}
              colorClass="bg-danger/80"
            />
            <BreakdownBar
              label="Triple+"
              count={breakdown.others}
              total={totalScored}
              colorClass="bg-danger"
            />
          </CardBody>
        </Card>
      )}

      {/* Full scorecard */}
      <Card className="mb-6">
        <CardHeader className="px-6 pt-5 pb-3">
          <h2 className="text-base font-semibold">Scorecard</h2>
        </CardHeader>
        <CardBody className="overflow-x-auto px-6 pb-5">
          <table className="w-full text-sm" aria-label="Full scorecard">
            <thead>
              <tr className="border-b border-default-200 text-xs font-semibold uppercase text-default-400">
                <th className="pb-2 text-left">H</th>
                <th className="pb-2 text-center">Par</th>
                <th className="pb-2 text-center">SI</th>
                <th className="pb-2 text-center">Score</th>
                <th className="pb-2 text-center">+/-</th>
              </tr>
            </thead>
            <tbody>
              {/* Front 9 */}
              {front9.map((hole) => {
                const score = getScore(hole.holeNumber);
                return <ScorecardRow key={hole.holeNumber} hole={hole} score={score} />;
              })}
              {/* Front 9 subtotal */}
              {front9.length > 0 && (
                <tr className="border-b-2 border-default-300 bg-golf-green/5 font-semibold">
                  <td className="py-2 text-golf-green">Out</td>
                  <td className="py-2 text-center">{front9Par}</td>
                  <td className="py-2 text-center text-default-400">—</td>
                  <td className="py-2 text-center font-bold">{front9Score || '—'}</td>
                  <td className="py-2 text-center">
                    {front9Score > 0 && <ScoreDiffBadge strokes={front9Score} par={front9Par} />}
                  </td>
                </tr>
              )}
              {/* Back 9 */}
              {back9.map((hole) => {
                const score = getScore(hole.holeNumber);
                return <ScorecardRow key={hole.holeNumber} hole={hole} score={score} />;
              })}
              {/* Back 9 subtotal */}
              {back9.length > 0 && (
                <tr className="border-b-2 border-default-300 bg-golf-green/5 font-semibold">
                  <td className="py-2 text-golf-green">In</td>
                  <td className="py-2 text-center">{back9Par}</td>
                  <td className="py-2 text-center text-default-400">—</td>
                  <td className="py-2 text-center font-bold">{back9Score || '—'}</td>
                  <td className="py-2 text-center">
                    {back9Score > 0 && <ScoreDiffBadge strokes={back9Score} par={back9Par} />}
                  </td>
                </tr>
              )}
              {/* Total */}
              <tr className="bg-golf-green/10 font-bold">
                <td className="py-2.5 text-golf-green">Total</td>
                <td className="py-2.5 text-center">{totalPar}</td>
                <td className="py-2.5 text-center text-default-400">—</td>
                <td className="py-2.5 text-center text-lg">{totalScore || '—'}</td>
                <td className="py-2.5 text-center">
                  {totalScore > 0 && <ScoreDiffBadge strokes={totalScore} par={totalPar} />}
                </td>
              </tr>
            </tbody>
          </table>
        </CardBody>
      </Card>

      {/* Actions */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          as={Link}
          href="/dashboard"
          color="success"
          size="lg"
          className="flex-1 font-semibold"
          startContent={<IconHome className="h-5 w-5" aria-hidden="true" />}
        >
          Back to Dashboard
        </Button>
        <Button
          as={Link}
          href="/dashboard/rounds/new"
          variant="flat"
          size="lg"
          className="flex-1"
          startContent={<IconGolf className="h-5 w-5" aria-hidden="true" />}
        >
          New Round
        </Button>
      </div>
    </div>
  );
}

function ScorecardRow({ hole, score }: { hole: TeeHole; score: HoleScore | undefined }) {
  const diff = score ? score.strokes - hole.par : null;
  return (
    <tr className="border-b border-default-100 hover:bg-default-50">
      <td className="py-2 font-medium">{hole.holeNumber}</td>
      <td className="py-2 text-center text-default-500">{hole.par}</td>
      <td className="py-2 text-center text-default-400 text-xs">{hole.strokeIndex}</td>
      <td className="py-2 text-center">
        {score ? (
          <span
            className={`font-bold ${
              diff! < 0 ? 'text-golf-fairway' : diff! > 0 ? 'text-danger' : ''
            }`}
          >
            {score.strokes}
          </span>
        ) : (
          <span className="text-default-300">—</span>
        )}
      </td>
      <td className="py-2 text-center">
        {score ? <ScoreDiffBadge strokes={score.strokes} par={hole.par} /> : null}
      </td>
    </tr>
  );
}

function ScoreDiffBadge({ strokes, par }: { strokes: number; par: number }) {
  const diff = strokes - par;
  const label = diff === 0 ? 'E' : diff > 0 ? `+${diff}` : String(diff);
  return (
    <span
      className={`inline-block rounded px-1.5 py-0.5 text-xs font-bold ${getScoreBgColor(strokes, par)}`}
    >
      {label}
    </span>
  );
}
