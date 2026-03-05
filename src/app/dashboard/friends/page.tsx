'use client';

import { Avatar, Button, Card, CardBody, CardHeader, Chip } from '@heroui/react';
import {
  IconCheck,
  IconGolf,
  IconSearch,
  IconUserMinus,
  IconUserPlus,
  IconUsers,
  IconX,
} from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  getFriends,
  getPendingRequests,
  respondToFriendRequest,
  removeFriend,
} from '@/server/actions/friends';
import type { FriendInfo, FriendRequestInfo } from '@/server/actions/friends';

interface Toast {
  type: 'success' | 'error';
  message: string;
}

function timeAgo(dateString: string): string {
  const diff = Date.now() - new Date(dateString).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function FriendCard({
  friend,
  onRemove,
  isRemoving,
}: {
  friend: FriendInfo;
  onRemove: (_friendshipId: string, _displayName: string) => void;
  isRemoving: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.15 }}
    >
      <Card className="border border-default-200 transition-colors hover:border-default-300">
        <CardBody className="flex flex-row items-center gap-4 px-4 py-4">
          <Avatar
            src={friend.avatarUrl ?? undefined}
            name={friend.displayName}
            size="md"
            className="flex-shrink-0"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold">{friend.displayName}</p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              {friend.handicapIndex && (
                <span className="text-xs text-default-400">
                  HCP {parseFloat(friend.handicapIndex).toFixed(1)}
                </span>
              )}
              {friend.country && (
                <span className="text-xs text-default-400">{friend.country.toUpperCase()}</span>
              )}
            </div>
          </div>
          <Button
            size="sm"
            variant="light"
            color="danger"
            isLoading={isRemoving}
            onPress={() => onRemove(friend.friendshipId, friend.displayName)}
            startContent={
              !isRemoving ? <IconUserMinus className="h-4 w-4" aria-hidden="true" /> : undefined
            }
            aria-label={`Remove ${friend.displayName} as a friend`}
          >
            Remove
          </Button>
        </CardBody>
      </Card>
    </motion.div>
  );
}

function IncomingRequestCard({
  request,
  onRespond,
  isResponding,
}: {
  request: FriendRequestInfo;
  onRespond: (_requestId: string, _accept: boolean) => void;
  isResponding: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -8 }}
      transition={{ duration: 0.15 }}
      className="flex items-center gap-3 rounded-xl border border-default-200 px-4 py-3"
    >
      <Avatar
        src={request.avatarUrl ?? undefined}
        name={request.displayName}
        size="sm"
        className="flex-shrink-0"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{request.displayName}</p>
        <p className="text-xs text-default-400">{timeAgo(request.requestedAt)}</p>
      </div>
      <div className="flex gap-1.5">
        <Button
          size="sm"
          color="success"
          variant="flat"
          isLoading={isResponding}
          onPress={() => onRespond(request.friendshipId, true)}
          startContent={
            !isResponding ? <IconCheck className="h-4 w-4" aria-hidden="true" /> : undefined
          }
          aria-label={`Accept friend request from ${request.displayName}`}
        >
          Accept
        </Button>
        <Button
          size="sm"
          color="danger"
          variant="flat"
          isDisabled={isResponding}
          onPress={() => onRespond(request.friendshipId, false)}
          startContent={<IconX className="h-4 w-4" aria-hidden="true" />}
          aria-label={`Decline friend request from ${request.displayName}`}
        >
          Decline
        </Button>
      </div>
    </motion.div>
  );
}

function OutgoingRequestCard({ request }: { request: FriendRequestInfo }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-default-200 px-4 py-3">
      <Avatar
        src={request.avatarUrl ?? undefined}
        name={request.displayName}
        size="sm"
        className="flex-shrink-0"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{request.displayName}</p>
        <p className="text-xs text-default-400">{timeAgo(request.requestedAt)}</p>
      </div>
      <Chip color="default" variant="flat" size="sm">
        Pending
      </Chip>
    </div>
  );
}

export default function FriendsPage() {
  const [friends, setFriends] = useState<FriendInfo[]>([]);
  const [incoming, setIncoming] = useState<FriendRequestInfo[]>([]);
  const [outgoing, setOutgoing] = useState<FriendRequestInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);

  const [removingId, setRemovingId] = useState<string | null>(null);
  const [respondingId, setRespondingId] = useState<string | null>(null);

  useEffect(() => {
    void loadData();
  }, []);

  async function loadData() {
    setIsLoading(true);
    setError(null);

    const [friendsResult, pendingResult] = await Promise.all([getFriends(), getPendingRequests()]);

    setIsLoading(false);

    if (friendsResult.success) {
      setFriends(friendsResult.data);
    } else {
      setError(friendsResult.error);
    }

    if (pendingResult.success) {
      setIncoming(pendingResult.data.incoming);
      setOutgoing(pendingResult.data.outgoing);
    }
  }

  function showToast(type: Toast['type'], message: string) {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  }

  async function handleRespond(requestId: string, accept: boolean) {
    setRespondingId(requestId);

    const result = await respondToFriendRequest(requestId, accept);
    setRespondingId(null);

    if (!result.success) {
      showToast('error', result.error);
      return;
    }

    showToast('success', accept ? 'Friend request accepted.' : 'Friend request declined.');
    void loadData();
  }

  async function handleRemove(friendshipId: string, displayName: string) {
    setRemovingId(friendshipId);

    const result = await removeFriend(friendshipId);
    setRemovingId(null);

    if (!result.success) {
      showToast('error', result.error);
      return;
    }

    setFriends((prev) => prev.filter((f) => f.friendshipId !== friendshipId));
    showToast('success', `${displayName} removed from friends.`);
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <IconGolf className="h-8 w-8 animate-pulse text-golf-green" aria-label="Loading" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Friends</h1>
        <p className="mt-1 text-default-500">
          {friends.length > 0
            ? `${friends.length} ${friends.length === 1 ? 'friend' : 'friends'}`
            : 'Connect with other players.'}
        </p>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            key="toast"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            role="status"
            aria-live="polite"
            className={`mb-6 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium ${
              toast.type === 'success' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
            }`}
          >
            {toast.type === 'success' ? (
              <IconCheck className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
            ) : (
              <IconX className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
            )}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <div
          role="alert"
          className="mb-4 rounded-xl bg-danger/10 px-4 py-3 text-sm font-medium text-danger"
        >
          {error}
        </div>
      )}

      {/* Pending requests — incoming */}
      {incoming.length > 0 && (
        <Card className="mb-6">
          <CardHeader className="px-6 pt-5 pb-2">
            <div className="flex items-center gap-2">
              <IconUserPlus className="h-4 w-4 text-golf-green" aria-hidden="true" />
              <h2 className="text-base font-semibold">Pending Requests</h2>
              <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-danger text-xs font-bold text-white">
                {incoming.length}
              </span>
            </div>
          </CardHeader>
          <CardBody className="flex flex-col gap-2 px-6 pb-5">
            <AnimatePresence>
              {incoming.map((request) => (
                <IncomingRequestCard
                  key={request.friendshipId}
                  request={request}
                  onRespond={handleRespond}
                  isResponding={respondingId === request.friendshipId}
                />
              ))}
            </AnimatePresence>
          </CardBody>
        </Card>
      )}

      {/* Outgoing requests */}
      {outgoing.length > 0 && (
        <Card className="mb-6">
          <CardHeader className="px-6 pt-5 pb-2">
            <div className="flex items-center gap-2">
              <IconUsers className="h-4 w-4 text-golf-green" aria-hidden="true" />
              <h2 className="text-base font-semibold">Sent Requests</h2>
            </div>
          </CardHeader>
          <CardBody className="flex flex-col gap-2 px-6 pb-5">
            {outgoing.map((request) => (
              <OutgoingRequestCard key={request.friendshipId} request={request} />
            ))}
          </CardBody>
        </Card>
      )}

      {/* Search / add — coming soon */}
      <Card className="mb-6">
        <CardHeader className="px-6 pt-5 pb-2">
          <div className="flex items-center gap-2">
            <IconSearch className="h-4 w-4 text-golf-green" aria-hidden="true" />
            <h2 className="text-base font-semibold">Find Players</h2>
          </div>
        </CardHeader>
        <CardBody className="px-6 pb-5">
          <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-default-300 py-8 text-center">
            <IconSearch className="h-8 w-8 text-default-300" aria-hidden="true" />
            <div>
              <p className="text-sm font-medium text-default-500">Coming soon</p>
              <p className="mt-0.5 text-xs text-default-400">
                Search for players by name to add them as friends.
              </p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Friends list */}
      <section aria-label="Friends list">
        <h2 className="mb-3 text-base font-semibold">{friends.length > 0 ? 'My Friends' : ''}</h2>

        {friends.length === 0 ? (
          <Card>
            <CardBody className="flex flex-col items-center gap-4 px-6 py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-golf-green/10">
                <IconUsers className="h-8 w-8 text-golf-green opacity-60" aria-hidden="true" />
              </div>
              <div>
                <p className="font-semibold">No friends yet</p>
                <p className="mt-1 text-sm text-default-500">
                  Invite friends to matches to connect with them!
                </p>
              </div>
            </CardBody>
          </Card>
        ) : (
          <AnimatePresence>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {friends.map((friend) => (
                <FriendCard
                  key={friend.friendshipId}
                  friend={friend}
                  onRemove={handleRemove}
                  isRemoving={removingId === friend.friendshipId}
                />
              ))}
            </div>
          </AnimatePresence>
        )}
      </section>
    </div>
  );
}
