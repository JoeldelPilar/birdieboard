import { auth } from '@/server/auth';
import { redirect } from 'next/navigation';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) {
    redirect('/auth/signin');
  }

  return <DashboardShell user={session.user}>{children}</DashboardShell>;
}
