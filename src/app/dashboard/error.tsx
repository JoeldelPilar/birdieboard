'use client';

import { Button, Card, CardBody } from '@heroui/react';
import { IconAlertTriangle, IconRefresh } from '@tabler/icons-react';

interface DashboardErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function DashboardError({ error, reset }: DashboardErrorProps) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center p-4">
      <Card className="w-full max-w-md border border-danger/20">
        <CardBody className="flex flex-col items-center gap-4 px-8 py-10 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-danger/10">
            <IconAlertTriangle className="h-8 w-8 text-danger" aria-hidden="true" />
          </div>

          <div>
            <h1 className="text-xl font-bold">Something went wrong</h1>
            <p className="mt-1 text-sm text-default-500">
              We had trouble loading your dashboard. Give it another shot.
            </p>
            {process.env.NODE_ENV === 'development' && error.message && (
              <p className="mt-3 rounded-md bg-default-100 px-3 py-2 font-mono text-xs text-default-600">
                {error.message}
              </p>
            )}
          </div>

          <Button
            color="success"
            variant="flat"
            startContent={<IconRefresh className="h-4 w-4" aria-hidden="true" />}
            onPress={reset}
            className="text-golf-green"
          >
            Try again
          </Button>
        </CardBody>
      </Card>
    </div>
  );
}
