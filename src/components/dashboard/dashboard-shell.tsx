'use client';

import { Avatar, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from '@heroui/react';
import {
  IconChartBar,
  IconGolf,
  IconHome,
  IconLogout,
  IconSettings,
  IconShoe,
  IconTargetArrow,
  IconTournament,
  IconTrophy,
  IconUsers,
} from '@tabler/icons-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import type { User } from 'next-auth';

const navItems = [
  { href: '/dashboard', label: 'Home', icon: IconHome },
  { href: '/dashboard/rounds', label: 'Rounds', icon: IconGolf },
  { href: '/dashboard/bag', label: 'My Bag', icon: IconShoe },
  { href: '/dashboard/courses', label: 'Courses', icon: IconTargetArrow },
  { href: '/dashboard/matches', label: 'Matches', icon: IconTrophy },
  { href: '/dashboard/tours', label: 'Tours', icon: IconTournament },
  { href: '/dashboard/stats', label: 'Stats', icon: IconChartBar },
  { href: '/dashboard/friends', label: 'Friends', icon: IconUsers },
];

interface DashboardShellProps {
  user: User;
  children: React.ReactNode;
}

export function DashboardShell({ user, children }: DashboardShellProps) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="hidden w-64 border-r border-default-200 bg-content1 md:block">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex items-center gap-2 border-b border-default-200 px-6 py-4">
            <IconGolf className="h-7 w-7 text-golf-green" />
            <span className="text-xl font-bold">Birdieboard</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== '/dashboard' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-golf-green/10 text-golf-green'
                      : 'text-default-500 hover:bg-default-100 hover:text-foreground'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* User menu */}
          <div className="border-t border-default-200 p-4">
            <Dropdown placement="top-start">
              <DropdownTrigger>
                <button className="flex w-full items-center gap-3 rounded-lg p-2 hover:bg-default-100">
                  <Avatar
                    src={user.image ?? undefined}
                    name={user.name ?? 'User'}
                    size="sm"
                    className="flex-shrink-0"
                  />
                  <div className="min-w-0 text-left">
                    <p className="truncate text-sm font-medium">{user.name}</p>
                    <p className="truncate text-xs text-default-400">{user.email}</p>
                  </div>
                </button>
              </DropdownTrigger>
              <DropdownMenu aria-label="User menu">
                <DropdownItem
                  key="profile"
                  href="/dashboard/profile"
                  startContent={<IconUsers className="h-4 w-4" />}
                >
                  Profile
                </DropdownItem>
                <DropdownItem
                  key="settings"
                  href="/dashboard/settings"
                  startContent={<IconSettings className="h-4 w-4" />}
                >
                  Settings
                </DropdownItem>
                <DropdownItem
                  key="signout"
                  className="text-danger"
                  color="danger"
                  startContent={<IconLogout className="h-4 w-4" />}
                  onPress={() => signOut({ callbackUrl: '/' })}
                >
                  Sign Out
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto max-w-7xl px-6 py-8">{children}</div>
      </main>
    </div>
  );
}
