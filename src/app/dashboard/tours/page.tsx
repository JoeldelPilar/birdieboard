import { Card, CardBody } from '@heroui/react';
import { IconTrophy } from '@tabler/icons-react';

export default function ToursPage() {
  return (
    <div>
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Tours &amp; Competitions</h1>
        <p className="mt-1 text-default-500">
          Organize tournaments, track season standings, and compete with your golf group.
        </p>
      </div>

      {/* Coming soon card */}
      <Card>
        <CardBody className="flex flex-col items-center gap-6 px-6 py-20 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-golf-green/10">
            <IconTrophy className="h-10 w-10 text-golf-green" aria-hidden="true" />
          </div>
          <div className="max-w-sm">
            <p className="text-xl font-bold">We&apos;re working on it</p>
            <p className="mt-2 text-default-500">
              Tours and season competitions are on the way. You&apos;ll soon be able to set up
              tournaments, track standings across your group, and crown a season champion.
            </p>
          </div>
          <span className="rounded-full bg-golf-green/10 px-4 py-1.5 text-sm font-semibold text-golf-green">
            Coming Soon
          </span>
        </CardBody>
      </Card>
    </div>
  );
}
