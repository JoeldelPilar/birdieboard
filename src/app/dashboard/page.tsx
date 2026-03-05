import { IconGolf } from '@tabler/icons-react';

export default function DashboardPage() {
  return (
    <div>
      <h1 className="mb-8 text-3xl font-bold">Dashboard</h1>
      <div className="rounded-2xl border border-default-200 bg-content1 p-12 text-center">
        <IconGolf className="mx-auto mb-4 h-16 w-16 text-golf-green" />
        <h2 className="mb-2 text-xl font-semibold">Welcome to Birdieboard!</h2>
        <p className="text-default-500">
          Your golf tracking journey starts here. Start by setting up your profile and adding clubs
          to your bag.
        </p>
      </div>
    </div>
  );
}
