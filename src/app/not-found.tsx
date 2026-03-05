import { Button, Card, CardBody } from '@heroui/react';
import { IconGolf, IconHome } from '@tabler/icons-react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardBody className="flex flex-col items-center gap-4 px-8 py-10 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-golf-green/10">
            <IconGolf className="h-8 w-8 text-golf-green opacity-60" aria-hidden="true" />
          </div>

          <div>
            <p className="text-5xl font-extrabold text-golf-green">404</p>
            <h1 className="mt-2 text-xl font-bold">Lost on the course?</h1>
            <p className="mt-1 text-sm text-default-500">
              This hole does not exist. Let&apos;s get you back to the clubhouse.
            </p>
          </div>

          <Button
            as={Link}
            href="/dashboard"
            color="success"
            variant="flat"
            startContent={<IconHome className="h-4 w-4" aria-hidden="true" />}
            className="text-golf-green"
          >
            Back to dashboard
          </Button>
        </CardBody>
      </Card>
    </div>
  );
}
