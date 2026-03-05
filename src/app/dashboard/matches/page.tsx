'use client';

import { Button, Card, CardBody, Chip, Tab, Tabs } from '@heroui/react';
import {
  IconCalendar,
  IconChevronRight,
  IconGolf,
  IconPlus,
  IconTrophy,
  IconUsers,
} from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { getMyMatches } from '@/server/actions/matches';
import {
  getFormatLabel,
  getStatusChipColor,
  getStatusLabel,
  formatMatchDate,
} from '@/utils/match-helpers';
import type { MatchSummary } from '@/server/actions/matches';

type TabKey = 'upcoming' | 'in_progress' | 'completed';

const TAB_STATUS_MAP: Record<TabKey, string[]> = {
  upcoming: ['draft', 'open'],
  in_progress: ['in_progress'],
  completed: ['completed', 'cancelled'],
};

function MatchCard({ match }: { match: MatchSummary }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.18 }}
    >
      <Card
        isPressable
        as={Link}
        href={`/dashboard/matches/${match.id}`}
        className="border border-default-200 transition-all hover:border-golf-green/50 hover:shadow-md"
      >
        <CardBody className="px-5 py-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{match.name}</p>
              <p className="mt-0.5 truncate text-sm text-default-500">{match.courseName}</p>

              <div className="mt-2 flex flex-wrap items-center gap-2">
                {match.matchDate && (
                  <div className="flex items-center gap-1 text-xs text-default-400">
                    <IconCalendar className="h-3.5 w-3.5" aria-hidden="true" />
                    {formatMatchDate(match.matchDate)}
                    {match.teeTime && <span className="ml-0.5">&middot; {match.teeTime}</span>}
                  </div>
                )}
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-golf-green/10 px-2.5 py-0.5 text-xs font-medium text-golf-green">
                  {getFormatLabel(match.format)}
                </span>
                <Chip
                  color={getStatusChipColor(match.status)}
                  variant="flat"
                  size="sm"
                  aria-label={`Match status: ${getStatusLabel(match.status)}`}
                >
                  {getStatusLabel(match.status)}
                </Chip>
              </div>
            </div>

            <div className="flex flex-shrink-0 items-center gap-3">
              <div className="flex items-center gap-1 text-xs text-default-400">
                <IconUsers className="h-3.5 w-3.5" aria-hidden="true" />
                {match.participantCount}/{match.maxPlayers}
              </div>
              <IconChevronRight className="h-5 w-5 text-default-300" aria-hidden="true" />
            </div>
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
}

function EmptyState({ tab }: { tab: TabKey }) {
  const messages: Record<TabKey, { heading: string; body: string }> = {
    upcoming: {
      heading: 'No upcoming matches',
      body: 'Create a match and invite your friends to play.',
    },
    in_progress: {
      heading: 'No matches in progress',
      body: 'Start a match when you arrive at the course.',
    },
    completed: {
      heading: 'No completed matches yet',
      body: 'Your match history will appear here once rounds are finished.',
    },
  };

  const { heading, body } = messages[tab];

  return (
    <Card>
      <CardBody className="flex flex-col items-center gap-4 px-6 py-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-golf-green/10">
          <IconTrophy className="h-8 w-8 text-golf-green opacity-60" aria-hidden="true" />
        </div>
        <div>
          <p className="font-semibold">{heading}</p>
          <p className="mt-1 text-sm text-default-500">{body}</p>
        </div>
        {tab === 'upcoming' && (
          <Button
            as={Link}
            href="/dashboard/matches/new"
            color="success"
            variant="flat"
            startContent={<IconPlus className="h-4 w-4" aria-hidden="true" />}
          >
            Create Match
          </Button>
        )}
      </CardBody>
    </Card>
  );
}

export default function MatchesPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('upcoming');
  const [matchesByTab, setMatchesByTab] = useState<Record<TabKey, MatchSummary[]>>({
    upcoming: [],
    in_progress: [],
    completed: [],
  });
  const [loadedTabs, setLoadedTabs] = useState<Set<TabKey>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void loadTab('upcoming');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadTab(tab: TabKey) {
    if (loadedTabs.has(tab)) return;

    setIsLoading(true);
    setError(null);

    const statuses = TAB_STATUS_MAP[tab];
    const results = await Promise.all(
      statuses.map((s) => getMyMatches(s as Parameters<typeof getMyMatches>[0])),
    );

    setIsLoading(false);

    const combined: MatchSummary[] = [];
    for (const result of results) {
      if (!result.success) {
        setError(result.error);
        continue;
      }
      combined.push(...result.data);
    }

    combined.sort((a, b) => {
      const dateA = a.matchDate ?? '';
      const dateB = b.matchDate ?? '';
      return dateA.localeCompare(dateB);
    });

    setMatchesByTab((prev) => ({ ...prev, [tab]: combined }));
    setLoadedTabs((prev) => new Set([...Array.from(prev), tab]));
  }

  function handleTabChange(key: string) {
    const tab = key as TabKey;
    setActiveTab(tab);
    void loadTab(tab);
  }

  const matches = matchesByTab[activeTab];

  return (
    <div className="mx-auto max-w-3xl">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Matches</h1>
          <p className="mt-1 text-default-500">Compete with friends on the course.</p>
        </div>
        <Button
          as={Link}
          href="/dashboard/matches/new"
          color="success"
          startContent={<IconPlus className="h-4 w-4" aria-hidden="true" />}
          aria-label="Create a new match"
        >
          Create Match
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

      {/* Tabs */}
      <Tabs
        aria-label="Match status filter"
        selectedKey={activeTab}
        onSelectionChange={(key) => handleTabChange(String(key))}
        color="success"
        variant="underlined"
        classNames={{ tabList: 'mb-4' }}
      >
        <Tab key="upcoming" title="Upcoming" />
        <Tab key="in_progress" title="In Progress" />
        <Tab key="completed" title="Completed" />
      </Tabs>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <IconGolf className="h-8 w-8 animate-pulse text-golf-green" aria-label="Loading" />
        </div>
      ) : matches.length === 0 ? (
        <EmptyState tab={activeTab} />
      ) : (
        <section aria-label={`${activeTab} matches`}>
          <AnimatePresence mode="wait">
            <div className="flex flex-col gap-2">
              {matches.map((match) => (
                <MatchCard key={match.id} match={match} />
              ))}
            </div>
          </AnimatePresence>
        </section>
      )}
    </div>
  );
}
