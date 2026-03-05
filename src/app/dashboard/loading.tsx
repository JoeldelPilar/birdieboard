import { IconGolf } from '@tabler/icons-react';

export default function DashboardLoading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <IconGolf
        className="h-12 w-12 animate-pulse text-golf-green"
        aria-label="Loading dashboard"
      />
    </div>
  );
}
