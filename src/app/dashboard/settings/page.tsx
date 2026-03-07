import { auth } from '@/server/auth';
import { Card, CardBody, CardHeader, Divider } from '@heroui/react';
import { IconMail, IconSettings, IconUser } from '@tabler/icons-react';
import { SignOutButton } from '@/components/ui/sign-out-button';
import Link from 'next/link';

export default async function SettingsPage() {
  const session = await auth();
  const name = session?.user?.name ?? 'Golfer';
  const email = session?.user?.email ?? '';

  return (
    <div className="mx-auto max-w-2xl">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="mt-1 text-default-500">Manage your account and preferences.</p>
      </div>

      <div className="flex flex-col gap-6">
        {/* Account information */}
        <Card>
          <CardHeader className="px-6 pt-5 pb-3">
            <div className="flex items-center gap-2">
              <IconSettings className="h-4 w-4 text-golf-green" aria-hidden="true" />
              <h2 className="text-base font-semibold">Account Information</h2>
            </div>
          </CardHeader>
          <CardBody className="flex flex-col gap-5 px-6 pb-6">
            {/* Name */}
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-golf-green/10">
                <IconUser className="h-4 w-4 text-golf-green" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-default-400">
                  Name
                </p>
                <p className="mt-0.5 font-medium">{name}</p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-golf-green/10">
                <IconMail className="h-4 w-4 text-golf-green" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-default-400">
                  Email
                </p>
                <p className="mt-0.5 font-medium">{email}</p>
              </div>
            </div>

            <Divider />

            <p className="text-sm text-default-500">
              To update your display name, handicap, or profile photo, visit your{' '}
              <Link
                href="/dashboard/profile"
                className="text-golf-green underline underline-offset-2 hover:text-golf-fairway"
              >
                profile settings
              </Link>
              .
            </p>
          </CardBody>
        </Card>

        {/* Sign out */}
        <Card>
          <CardBody className="flex flex-row items-center justify-between gap-4 px-6 py-5">
            <div>
              <p className="font-medium">Sign Out</p>
              <p className="text-sm text-default-500">
                You will be redirected to the sign-in page.
              </p>
            </div>
            <SignOutButton />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
