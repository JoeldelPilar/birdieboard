'use client';

import {
  Avatar,
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '@heroui/react';
import {
  IconArrowLeft,
  IconCalendar,
  IconCheck,
  IconClock,
  IconGolf,
  IconMail,
  IconMedal,
  IconTrash,
  IconTrophy,
  IconUsers,
  IconX,
} from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
  getMatch,
  inviteToMatch,
  deleteMatch,
  getMatchLeaderboard,
} from '@/server/actions/matches';
import {
  getFormatLabel,
  getStatusChipColor,
  getStatusLabel,
  formatMatchDate,
} from '@/utils/match-helpers';
import type {
  MatchWithDetails,
  MatchParticipant,
  LeaderboardEntry,
} from '@/server/actions/matches';

const INVITE_STATUS_COLORS: Record<
  MatchParticipant['inviteStatus'],
  'success' | 'warning' | 'danger'
> = {
  accepted: 'success',
  invited: 'warning',
  declined: 'danger',
};

const INVITE_STATUS_LABELS: Record<MatchParticipant['inviteStatus'], string> = {
  accepted: 'Accepted',
  invited: 'Invited',
  declined: 'Declined',
};

function ParticipantRow({ participant }: { participant: MatchParticipant }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.15 }}
      className="flex items-center gap-3 rounded-xl border border-default-200 px-4 py-3"
    >
      <Avatar
        src={participant.avatarUrl ?? undefined}
        name={participant.displayName}
        size="sm"
        className="flex-shrink-0"
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium">{participant.displayName}</p>
          {participant.isCreator && (
            <span className="rounded-full bg-golf-green/10 px-2 py-0.5 text-xs font-medium text-golf-green">
              Host
            </span>
          )}
        </div>
        {participant.handicapIndex && (
          <p className="text-xs text-default-400">
            HCP {parseFloat(participant.handicapIndex).toFixed(1)}
          </p>
        )}
      </div>
      <Chip
        color={INVITE_STATUS_COLORS[participant.inviteStatus]}
        variant="flat"
        size="sm"
        aria-label={`Invite status: ${INVITE_STATUS_LABELS[participant.inviteStatus]}`}
      >
        {INVITE_STATUS_LABELS[participant.inviteStatus]}
      </Chip>
    </motion.div>
  );
}

function LeaderboardRow({ entry }: { entry: LeaderboardEntry }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15 }}
      className="flex items-center gap-4 rounded-xl border border-default-200 px-4 py-3"
    >
      <span
        className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold ${
          entry.position === 1
            ? 'bg-yellow-400/20 text-yellow-600'
            : entry.position === 2
              ? 'bg-default-200 text-default-600'
              : entry.position === 3
                ? 'bg-golf-sand/30 text-golf-sand'
                : 'bg-default-100 text-default-500'
        }`}
      >
        {entry.position}
      </span>
      <Avatar
        src={entry.avatarUrl ?? undefined}
        name={entry.displayName}
        size="sm"
        className="flex-shrink-0"
      />
      <p className="min-w-0 flex-1 truncate text-sm font-medium">{entry.displayName}</p>
      <div className="flex-shrink-0 text-right">
        {entry.grossScore != null && <p className="text-sm font-bold">{entry.grossScore}</p>}
        {entry.stablefordPoints != null && (
          <p className="text-xs text-default-400">{entry.stablefordPoints} pts</p>
        )}
        {entry.netScore != null && entry.grossScore == null && (
          <p className="text-sm font-bold">{entry.netScore}</p>
        )}
      </div>
    </motion.div>
  );
}

export default function MatchDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const matchId = String(params.matchId);

  const [match, setMatch] = useState<MatchWithDetails | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Invite
  const [inviteEmail, setInviteEmail] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteSuccess, setInviteSuccess] = useState(false);

  // Delete
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    void loadMatch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchId]);

  async function loadMatch() {
    setIsLoading(true);
    setError(null);

    const result = await getMatch(matchId);
    setIsLoading(false);

    if (!result.success) {
      if (!result.error.includes('Not implemented')) {
        setError(result.error);
      }
      return;
    }

    setMatch(result.data);

    if (result.data.status === 'completed') {
      const lbResult = await getMatchLeaderboard(matchId);
      if (lbResult.success) {
        setLeaderboard(lbResult.data);
      }
    }
  }

  async function handleInvite() {
    if (!inviteEmail.trim()) return;

    setIsInviting(true);
    setInviteError(null);
    setInviteSuccess(false);

    const result = await inviteToMatch(matchId, inviteEmail.trim());
    setIsInviting(false);

    if (!result.success) {
      setInviteError(result.error);
      return;
    }

    setInviteSuccess(true);
    setInviteEmail('');
    setTimeout(() => setInviteSuccess(false), 3000);
    void loadMatch();
  }

  async function handleDelete() {
    setIsDeleting(true);

    const result = await deleteMatch(matchId);
    setIsDeleting(false);

    if (!result.success) {
      setError(result.error);
      setIsDeleteModalOpen(false);
      return;
    }

    router.push('/dashboard/matches');
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <IconGolf className="h-8 w-8 animate-pulse text-golf-green" aria-label="Loading" />
      </div>
    );
  }

  if (error && !match) {
    return (
      <div className="mx-auto max-w-2xl">
        <Button
          as="a"
          href="/dashboard/matches"
          variant="light"
          size="sm"
          startContent={<IconArrowLeft className="h-4 w-4" aria-hidden="true" />}
          className="mb-6 text-default-500"
        >
          Back to matches
        </Button>
        <div
          role="alert"
          className="rounded-xl bg-danger/10 px-4 py-3 text-sm font-medium text-danger"
        >
          {error.includes('Not implemented')
            ? 'Match details are not yet available — backend coming soon.'
            : error}
        </div>
      </div>
    );
  }

  // Placeholder for when the backend isn&apos;t ready yet
  if (!match) {
    return (
      <div className="mx-auto max-w-2xl">
        <Button
          as="a"
          href="/dashboard/matches"
          variant="light"
          size="sm"
          startContent={<IconArrowLeft className="h-4 w-4" aria-hidden="true" />}
          className="mb-6 text-default-500"
        >
          Back to matches
        </Button>
        <Card>
          <CardBody className="flex flex-col items-center gap-4 px-6 py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-golf-green/10">
              <IconTrophy className="h-8 w-8 text-golf-green opacity-60" aria-hidden="true" />
            </div>
            <div>
              <p className="font-semibold">Match not found</p>
              <p className="mt-1 text-sm text-default-500">
                This match may not exist or you don&apos;t have access.
              </p>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  const isCompleted = match.status === 'completed';
  const isUpcoming = match.status === 'draft' || match.status === 'open';

  return (
    <div className="mx-auto max-w-2xl">
      {/* Back link */}
      <Button
        as="a"
        href="/dashboard/matches"
        variant="light"
        size="sm"
        startContent={<IconArrowLeft className="h-4 w-4" aria-hidden="true" />}
        className="mb-4 text-default-500"
      >
        Back to matches
      </Button>

      {error && (
        <div
          role="alert"
          className="mb-4 flex items-center gap-2 rounded-xl bg-danger/10 px-4 py-3 text-sm font-medium text-danger"
        >
          <IconX className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
          {error}
        </div>
      )}

      {/* Match header */}
      <Card className="mb-4">
        <CardBody className="px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-bold">{match.name}</h1>
              <p className="mt-0.5 text-default-500">{match.courseName}</p>
              {match.courseCity && <p className="text-xs text-default-400">{match.courseCity}</p>}
            </div>
            <Chip
              color={getStatusChipColor(match.status)}
              variant="flat"
              aria-label={`Status: ${getStatusLabel(match.status)}`}
            >
              {getStatusLabel(match.status)}
            </Chip>
          </div>

          <div className="mt-4 flex flex-wrap gap-4">
            <div className="flex items-center gap-1.5 text-sm text-default-500">
              <IconCalendar className="h-4 w-4 text-golf-green" aria-hidden="true" />
              {match.matchDate ? formatMatchDate(match.matchDate) : 'TBD'}
            </div>
            {match.teeTime && (
              <div className="flex items-center gap-1.5 text-sm text-default-500">
                <IconClock className="h-4 w-4 text-golf-green" aria-hidden="true" />
                {match.teeTime}
              </div>
            )}
            <div className="flex items-center gap-1.5 text-sm text-default-500">
              <IconTrophy className="h-4 w-4 text-golf-green" aria-hidden="true" />
              {getFormatLabel(match.format)} &middot;{' '}
              {match.scoringType === 'gross' ? 'Gross' : 'Net'}
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Participants */}
      <Card className="mb-4">
        <CardHeader className="px-6 pt-5 pb-2">
          <div className="flex items-center justify-between gap-2 w-full">
            <div className="flex items-center gap-2">
              <IconUsers className="h-4 w-4 text-golf-green" aria-hidden="true" />
              <h2 className="text-base font-semibold">
                Participants ({match.participants.length}/{match.maxPlayers})
              </h2>
            </div>
          </div>
        </CardHeader>
        <CardBody className="flex flex-col gap-2 px-6 pb-5">
          {match.participants.length === 0 ? (
            <p className="py-4 text-center text-sm text-default-400">No participants yet.</p>
          ) : (
            <AnimatePresence>
              {match.participants.map((p) => (
                <ParticipantRow key={p.playerId} participant={p} />
              ))}
            </AnimatePresence>
          )}
        </CardBody>
      </Card>

      {/* Invite section (creator only, not completed/cancelled) */}
      {!isCompleted && match.status !== 'cancelled' && (
        <Card className="mb-4">
          <CardHeader className="px-6 pt-5 pb-2">
            <div className="flex items-center gap-2">
              <IconMail className="h-4 w-4 text-golf-green" aria-hidden="true" />
              <h2 className="text-base font-semibold">Invite a Player</h2>
            </div>
          </CardHeader>
          <CardBody className="px-6 pb-5">
            {inviteError && (
              <div
                role="alert"
                className="mb-3 flex items-center gap-2 rounded-xl bg-danger/10 px-4 py-2.5 text-sm text-danger"
              >
                <IconX className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                {inviteError}
              </div>
            )}
            {inviteSuccess && (
              <div
                role="status"
                className="mb-3 flex items-center gap-2 rounded-xl bg-success/10 px-4 py-2.5 text-sm text-success"
              >
                <IconCheck className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                Invitation sent.
              </div>
            )}
            <div className="flex gap-2">
              <Input
                label="Email address"
                placeholder="friend@example.com"
                type="email"
                value={inviteEmail}
                onValueChange={(v) => {
                  setInviteEmail(v);
                  if (inviteError) setInviteError(null);
                }}
                className="flex-1"
              />
              <Button
                color="success"
                onPress={() => void handleInvite()}
                isLoading={isInviting}
                isDisabled={isInviting || !inviteEmail.trim()}
                className="self-end"
                aria-label="Send invitation"
              >
                Invite
              </Button>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Leaderboard */}
      {isCompleted && leaderboard.length > 0 && (
        <Card className="mb-4">
          <CardHeader className="px-6 pt-5 pb-2">
            <div className="flex items-center gap-2">
              <IconMedal className="h-4 w-4 text-golf-green" aria-hidden="true" />
              <h2 className="text-base font-semibold">Leaderboard</h2>
            </div>
          </CardHeader>
          <CardBody className="flex flex-col gap-2 px-6 pb-5">
            <AnimatePresence>
              {leaderboard.map((entry) => (
                <LeaderboardRow key={entry.playerId} entry={entry} />
              ))}
            </AnimatePresence>
          </CardBody>
        </Card>
      )}

      {/* Action buttons */}
      <div className="flex flex-col gap-3">
        {(match.status === 'open' || match.status === 'in_progress') && (
          <Button
            as={Link}
            href={`/dashboard/rounds/new?matchId=${match.id}`}
            color="success"
            size="lg"
            className="w-full font-semibold"
            startContent={<IconGolf className="h-5 w-5" aria-hidden="true" />}
          >
            Start Round
          </Button>
        )}

        {isUpcoming && (
          <Button
            color="danger"
            variant="flat"
            className="w-full"
            onPress={() => setIsDeleteModalOpen(true)}
            startContent={<IconTrash className="h-4 w-4" aria-hidden="true" />}
          >
            Delete Match
          </Button>
        )}
      </div>

      {/* Delete confirmation modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        placement="center"
      >
        <ModalContent>
          <ModalHeader>Delete match?</ModalHeader>
          <ModalBody>
            <p className="text-sm text-default-600">
              Are you sure you want to delete <strong>{match.name}</strong>? This action cannot be
              undone and all invitations will be cancelled.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="flat"
              onPress={() => setIsDeleteModalOpen(false)}
              isDisabled={isDeleting}
            >
              Cancel
            </Button>
            <Button color="danger" onPress={() => void handleDelete()} isLoading={isDeleting}>
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
