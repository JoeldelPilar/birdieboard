import { auth } from '@/server/auth';
import { getProfile } from '@/server/actions/profile';
import { Button, Card, CardBody, CardHeader } from '@heroui/react';
import { IconBackpack, IconGolf, IconSwords } from '@tabler/icons-react';
import Link from 'next/link';

export default async function DashboardPage() {
  const session = await auth();
  const profileResult = await getProfile();

  const profile = profileResult.success ? profileResult.data : null;
  const displayName = profile?.displayName ?? session?.user?.name ?? 'Golfer';
  const handicap = profile?.handicapIndex ? parseFloat(profile.handicapIndex) : null;

  return (
    <div>
      {/* Welcome header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          Welcome back, <span className="text-golf-green">{displayName}</span>
        </h1>
        <p className="mt-1 text-default-500">Ready to improve your game?</p>
      </div>

      {/* Stats row */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Handicap card */}
        <Card className="col-span-1 sm:col-span-2 lg:col-span-1">
          <CardHeader className="px-6 pt-5 pb-2">
            <div className="flex items-center gap-2">
              <IconGolf className="h-5 w-5 text-golf-green" aria-hidden="true" />
              <h2 className="text-sm font-semibold text-default-500 uppercase tracking-wide">
                Handicap Index
              </h2>
            </div>
          </CardHeader>
          <CardBody className="px-6 pb-6">
            {handicap != null ? (
              <div className="flex items-end gap-2">
                <span className="text-6xl font-extrabold text-golf-green leading-none">
                  {handicap.toFixed(1)}
                </span>
                <span className="mb-1 text-sm font-medium text-default-400">HCP</span>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <span className="text-3xl font-bold text-default-300">--</span>
                <Link
                  href="/dashboard/profile"
                  className="text-sm text-golf-green underline underline-offset-2 hover:text-golf-fairway"
                >
                  Add your handicap
                </Link>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Placeholder stat: Rounds played */}
        <Card>
          <CardHeader className="px-6 pt-5 pb-2">
            <h2 className="text-sm font-semibold text-default-500 uppercase tracking-wide">
              Rounds Played
            </h2>
          </CardHeader>
          <CardBody className="px-6 pb-6">
            <span className="text-6xl font-extrabold leading-none">0</span>
          </CardBody>
        </Card>

        {/* Placeholder stat: Active Matches */}
        <Card>
          <CardHeader className="px-6 pt-5 pb-2">
            <h2 className="text-sm font-semibold text-default-500 uppercase tracking-wide">
              Active Matches
            </h2>
          </CardHeader>
          <CardBody className="px-6 pb-6">
            <span className="text-6xl font-extrabold leading-none">0</span>
          </CardBody>
        </Card>
      </div>

      {/* Quick actions */}
      <section aria-labelledby="quick-actions-heading" className="mb-8">
        <h2 id="quick-actions-heading" className="mb-4 text-lg font-semibold">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card
            isPressable
            as={Link}
            href="/dashboard/rounds/new"
            className="group border border-default-200 transition-all hover:border-golf-green/50 hover:shadow-md"
          >
            <CardBody className="flex flex-col items-center gap-3 px-6 py-8 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-golf-green/10 transition-colors group-hover:bg-golf-green/20">
                <IconGolf className="h-7 w-7 text-golf-green" aria-hidden="true" />
              </div>
              <div>
                <p className="font-semibold">Start Round</p>
                <p className="mt-0.5 text-xs text-default-500">Log a new round of golf</p>
              </div>
            </CardBody>
          </Card>

          <Card
            isPressable
            as={Link}
            href="/dashboard/matches/new"
            className="group border border-default-200 transition-all hover:border-golf-green/50 hover:shadow-md"
          >
            <CardBody className="flex flex-col items-center gap-3 px-6 py-8 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-golf-sand/20 transition-colors group-hover:bg-golf-sand/30">
                <IconSwords className="h-7 w-7 text-golf-sand" aria-hidden="true" />
              </div>
              <div>
                <p className="font-semibold">Create Match</p>
                <p className="mt-0.5 text-xs text-default-500">Challenge your friends</p>
              </div>
            </CardBody>
          </Card>

          <Card
            isPressable
            as={Link}
            href="/dashboard/bag"
            className="group border border-default-200 transition-all hover:border-golf-green/50 hover:shadow-md"
          >
            <CardBody className="flex flex-col items-center gap-3 px-6 py-8 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-golf-sky/20 transition-colors group-hover:bg-golf-sky/30">
                <IconBackpack className="h-7 w-7 text-golf-sky" aria-hidden="true" />
              </div>
              <div>
                <p className="font-semibold">Edit Bag</p>
                <p className="mt-0.5 text-xs text-default-500">Manage your clubs</p>
              </div>
            </CardBody>
          </Card>
        </div>
      </section>

      {/* Recent Rounds */}
      <section aria-labelledby="recent-rounds-heading">
        <h2 id="recent-rounds-heading" className="mb-4 text-lg font-semibold">
          Recent Rounds
        </h2>
        <Card>
          <CardBody className="flex flex-col items-center gap-4 px-6 py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-golf-green/10">
              <IconGolf className="h-8 w-8 text-golf-green opacity-60" aria-hidden="true" />
            </div>
            <div>
              <p className="font-semibold">No rounds yet</p>
              <p className="mt-1 text-sm text-default-500">
                Start your first round to see your history here.
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
      </section>
    </div>
  );
}
