import { Avatar, Button, Card, CardBody, CardHeader } from '@heroui/react';
import { IconGolf, IconMapPin, IconUserPlus } from '@tabler/icons-react';
import { notFound } from 'next/navigation';
import { COUNTRIES } from '@/components/profile/country-select';

// Placeholder type — replace with actual DB type when available
interface PublicProfile {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  handicap: number | null;
  country: string | null;
  city: string | null;
  bio: string | null;
  isPublic: boolean;
}

// Placeholder fetch — replace with real server action or DB query
async function getPublicProfile(playerId: string): Promise<PublicProfile | null> {
  // TODO: replace with `getProfileById(playerId)` server action
  void playerId;
  return null;
}

function getCountryLabel(code: string | null): string | null {
  if (!code) return null;
  const found = COUNTRIES.find((c) => c.code === code);
  if (!found) return null;
  return `${found.flag} ${found.name}`;
}

interface PageProps {
  params: { playerId: string };
}

export default async function PublicProfilePage({ params }: PageProps) {
  const profile = await getPublicProfile(params.playerId);

  if (!profile || !profile.isPublic) {
    notFound();
  }

  const locationParts = [profile.city, getCountryLabel(profile.country)].filter(Boolean);

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex flex-col gap-6">
        {/* Header card */}
        <Card>
          <CardBody className="flex flex-col items-center gap-4 px-6 py-8 text-center sm:flex-row sm:text-left">
            <Avatar
              src={profile.avatarUrl ?? undefined}
              name={profile.displayName}
              className="h-24 w-24 flex-shrink-0 text-3xl"
              isBordered
              color="success"
            />
            <div className="flex flex-1 flex-col gap-2">
              <h1 className="text-2xl font-bold">{profile.displayName}</h1>
              {locationParts.length > 0 && (
                <p className="flex items-center justify-center gap-1 text-sm text-default-500 sm:justify-start">
                  <IconMapPin className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                  {locationParts.join(', ')}
                </p>
              )}
              {profile.bio && <p className="text-sm text-default-600">{profile.bio}</p>}
            </div>
            {/* Add Friend — placeholder action */}
            <Button
              color="success"
              variant="flat"
              startContent={<IconUserPlus className="h-4 w-4" aria-hidden="true" />}
              aria-label={`Add ${profile.displayName} as a friend`}
            >
              Add Friend
            </Button>
          </CardBody>
        </Card>

        {/* Handicap card */}
        {profile.handicap != null && (
          <Card>
            <CardHeader className="px-6 pt-5 pb-3">
              <div className="flex items-center gap-2">
                <IconGolf className="h-4 w-4 text-golf-green" aria-hidden="true" />
                <h2 className="text-base font-semibold">Handicap Index</h2>
              </div>
            </CardHeader>
            <CardBody className="px-6 pb-6">
              <div className="flex items-end gap-2">
                <span className="text-5xl font-extrabold text-golf-green">
                  {profile.handicap.toFixed(1)}
                </span>
                <span className="mb-2 text-sm font-medium text-default-400">HCP</span>
              </div>
            </CardBody>
          </Card>
        )}

        {/* Recent Rounds — placeholder */}
        <Card>
          <CardHeader className="px-6 pt-5 pb-3">
            <h2 className="text-base font-semibold">Recent Rounds</h2>
          </CardHeader>
          <CardBody className="flex flex-col items-center gap-3 px-6 py-8 text-center text-default-500">
            <IconGolf className="h-10 w-10 opacity-40" aria-hidden="true" />
            <p className="text-sm">No rounds played yet.</p>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
