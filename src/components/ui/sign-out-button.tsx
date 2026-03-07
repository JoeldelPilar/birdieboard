'use client';

import { Button } from '@heroui/react';
import { IconLogout } from '@tabler/icons-react';
import { signOut } from 'next-auth/react';

export function SignOutButton() {
  return (
    <Button
      color="danger"
      variant="flat"
      startContent={<IconLogout className="h-4 w-4" aria-hidden="true" />}
      onPress={() => void signOut({ callbackUrl: '/auth/signin' })}
    >
      Sign Out
    </Button>
  );
}
