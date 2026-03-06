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
  IconMenu2,
  IconX,
} from '@tabler/icons-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useState } from 'react';
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
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#050a05]">
      {/* ─── Sidebar (Desktop) ─── */}
      <aside className="hidden w-64 flex-shrink-0 md:block">
        <div className="fixed flex h-screen w-64 flex-col border-r border-white/5 bg-[#060d06]">
          {/* Logo */}
          <div className="flex items-center gap-2.5 px-6 py-5">
            <IconGolf className="h-7 w-7 text-golf-green icon-glow" />
            <span className="text-lg font-bold text-white">Birdieboard</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-2">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== '/dashboard' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                    isActive ? 'nav-active' : 'nav-item text-white/50 hover:text-white/80'
                  }`}
                >
                  <item.icon className={`h-5 w-5 ${isActive ? 'text-golf-green' : ''}`} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* User menu */}
          <div className="border-t border-white/5 p-3">
            <Dropdown placement="top-start">
              <DropdownTrigger>
                <button className="flex w-full items-center gap-3 rounded-xl p-2.5 transition-all hover:bg-white/[0.04] active:scale-[0.98]">
                  <Avatar
                    src={user.image ?? undefined}
                    name={user.name ?? 'User'}
                    size="sm"
                    className="flex-shrink-0 ring-2 ring-white/10"
                  />
                  <div className="min-w-0 text-left">
                    <p className="truncate text-sm font-medium text-white/90">{user.name}</p>
                    <p className="truncate text-xs text-white/30">{user.email}</p>
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

      {/* ─── Mobile Header ─── */}
      <div className="fixed top-0 z-50 flex w-full items-center justify-between border-b border-white/5 bg-[#060d06]/80 px-4 py-3 backdrop-blur-lg md:hidden">
        <div className="flex items-center gap-2">
          <IconGolf className="h-6 w-6 text-golf-green" />
          <span className="font-bold text-white">Birdieboard</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="rounded-lg p-2 text-white/60 transition-colors hover:bg-white/5 hover:text-white"
        >
          {mobileOpen ? <IconX className="h-5 w-5" /> : <IconMenu2 className="h-5 w-5" />}
        </button>
      </div>

      {/* ─── Mobile Sidebar Overlay ─── */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 w-64 border-r border-white/5 bg-[#060d06] p-3 md:hidden">
            <div className="mb-4 flex items-center gap-2.5 px-3 py-2">
              <IconGolf className="h-7 w-7 text-golf-green icon-glow" />
              <span className="text-lg font-bold text-white">Birdieboard</span>
            </div>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== '/dashboard' && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                      isActive ? 'nav-active' : 'nav-item text-white/50 hover:text-white/80'
                    }`}
                  >
                    <item.icon className={`h-5 w-5 ${isActive ? 'text-golf-green' : ''}`} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </>
      )}

      {/* ─── Main Content ─── */}
      <main className="flex-1 overflow-auto pt-14 md:pt-0">
        <div className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-8">{children}</div>
      </main>
    </div>
  );
}
