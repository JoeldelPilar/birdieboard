'use client';

import { Button, Card, CardBody, Chip } from '@heroui/react';
import {
  IconCalendar,
  IconChevronRight,
  IconGolf,
  IconPlus,
  IconRefresh,
} from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getMyRounds } from '@/server/actions/rounds';
import { formatScoreToPar } from '@/utils/score-helpers';
import type { RoundSummary } from '@/server/actions/rounds';

const PAGE_SIZE = 20;

function StatusChip({ status }: { status: string }) {
  if (status === 'in_progress') {
    return (
      <Chip color="warning" variant="flat" size="sm" aria-label="Round in progress">
        In Progress
      </Chip>
    );
  }
  if (status === 'completed') {
    return (
      <Chip color="success" variant="flat" size="sm" aria-label="Round completed">
        Completed
      </Chip>
    );
  }
  return (
    <Chip color="default" variant="flat" size="sm" aria-label={`Round ${status}`}>
      {status}
    </Chip>
  );
}

function TeeColorDot({ color }: { color: string | null }) {
  let cls = 'bg-default-400';
  if (color) {
    const lower = color.toLowerCase();
    if (lower.includes('white')) cls = 'bg-white border border-default-300';
    else if (lower.includes('yellow') || lower.includes('gold')) cls = 'bg-yellow-400';
    else if (lower.includes('blue')) cls = 'bg-blue-500';
    else if (lower.includes('red')) cls = 'bg-red-500';
    else if (lower.includes('black')) cls = 'bg-black';
    else if (lower.includes('green')) cls = 'bg-golf-green';
    else if (lower.includes('orange')) cls = 'bg-orange-400';
    else if (lower.includes('silver')) cls = 'bg-gray-300';
  }
  return <span className={`inline-block h-2.5 w-2.5 rounded-full ${cls}`} aria-hidden="true" />;
}

export default function RoundsPage() {
  const [rounds, setRounds] = useState<RoundSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void loadRounds(0, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadRounds(newOffset: number, replace: boolean) {
    if (replace) setIsLoading(true);
    else setIsLoadingMore(true);

    setError(null);
    const result = await getMyRounds(PAGE_SIZE, newOffset);

    if (replace) setIsLoading(false);
    else setIsLoadingMore(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    if (replace) {
      setRounds(result.data.rounds);
    } else {
      setRounds((prev) => [...prev, ...result.data.rounds]);
    }

    setTotal(result.data.total);
    setOffset(newOffset + result.data.rounds.length);
  }

  function handleLoadMore() {
    void loadRounds(offset, false);
  }

  const hasMore = offset < total;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <IconGolf className="h-8 w-8 animate-pulse text-golf-green" aria-label="Loading" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">My Rounds</h1>
          {total > 0 && (
            <p className="mt-1 text-default-500">
              {total} {total === 1 ? 'round' : 'rounds'} played
            </p>
          )}
        </div>
        <Button
          as={Link}
          href="/dashboard/rounds/new"
          color="success"
          startContent={<IconPlus className="h-4 w-4" aria-hidden="true" />}
          aria-label="Start a new round"
        >
          New Round
        </Button>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-4 rounded-xl bg-danger/10 px-4 py-3 text-sm font-medium text-danger"
        >
          {error}
        </div>
      )}

      {rounds.length === 0 ? (
        <Card>
          <CardBody className="flex flex-col items-center gap-4 px-6 py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-golf-green/10">
              <IconGolf className="h-8 w-8 text-golf-green opacity-60" aria-hidden="true" />
            </div>
            <div>
              <p className="font-semibold">No rounds yet &mdash; play your first round!</p>
              <p className="mt-1 text-sm text-default-500">
                Find a course and start tracking your game.
              </p>
            </div>
            <Button
              as={Link}
              href="/dashboard/rounds/new"
              color="success"
              variant="flat"
              startContent={<IconGolf className="h-4 w-4" aria-hidden="true" />}
            >
              Start Your First Round
            </Button>
          </CardBody>
        </Card>
      ) : (
        <>
          <section aria-label="Round history">
            <div className="flex flex-col gap-2">
              {rounds.map((round) => (
                <RoundCard key={round.id} round={round} />
              ))}
            </div>
          </section>

          {hasMore && (
            <div className="mt-6 flex justify-center">
              <Button
                variant="flat"
                onPress={handleLoadMore}
                isLoading={isLoadingMore}
                startContent={
                  !isLoadingMore ? (
                    <IconRefresh className="h-4 w-4" aria-hidden="true" />
                  ) : undefined
                }
              >
                {isLoadingMore ? 'Loading...' : 'Load More'}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function RoundCard({ round }: { round: RoundSummary }) {
  const isInProgress = round.status === 'in_progress';
  const scoreDiff =
    round.grossScore != null && round.par != null
      ? formatScoreToPar(round.grossScore, round.par)
      : null;
  const diffNum =
    round.grossScore != null && round.par != null ? round.grossScore - round.par : null;

  return (
    <Card
      isPressable
      as={Link}
      href={
        isInProgress ? `/dashboard/rounds/${round.id}` : `/dashboard/rounds/${round.id}/summary`
      }
      className="border border-default-200 transition-all hover:border-golf-green/50 hover:shadow-md"
    >
      <CardBody className="px-5 py-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            {/* Course name */}
            <div className="flex items-center gap-2">
              {round.teeColor && <TeeColorDot color={round.teeColor} />}
              <p className="truncate font-semibold">{round.courseName}</p>
            </div>

            {/* Date and status */}
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 text-xs text-default-400">
                <IconCalendar className="h-3.5 w-3.5" aria-hidden="true" />
                {round.roundDate}
              </div>
              <StatusChip status={round.status} />
            </div>
          </div>

          <div className="flex flex-shrink-0 items-center gap-3">
            {/* Score */}
            <div className="text-right">
              {round.grossScore != null ? (
                <>
                  <p className="text-xl font-bold">{round.grossScore}</p>
                  {scoreDiff && (
                    <p
                      className={`text-sm font-semibold ${
                        diffNum! < 0
                          ? 'text-golf-fairway'
                          : diffNum! > 0
                            ? 'text-danger'
                            : 'text-default-500'
                      }`}
                    >
                      {scoreDiff}
                    </p>
                  )}
                  {round.scoreDifferential && (
                    <p className="text-xs text-default-400">
                      Diff {parseFloat(round.scoreDifferential).toFixed(1)}
                    </p>
                  )}
                </>
              ) : isInProgress ? (
                <p className="text-sm font-medium text-warning">Playing...</p>
              ) : null}
            </div>

            {/* Continue button for in-progress */}
            {isInProgress ? (
              <Button
                as={Link}
                href={`/dashboard/rounds/${round.id}`}
                color="warning"
                variant="flat"
                size="sm"
                endContent={<IconChevronRight className="h-4 w-4" aria-hidden="true" />}
                onPress={(e) => e.continuePropagation()}
              >
                Continue
              </Button>
            ) : (
              <IconChevronRight className="h-5 w-5 text-default-300" aria-hidden="true" />
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
