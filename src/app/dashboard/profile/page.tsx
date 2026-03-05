'use client';

import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Input,
  Switch,
  Textarea,
} from '@heroui/react';
import {
  IconCheck,
  IconGolf,
  IconLock,
  IconMapPin,
  IconUser,
  IconWorld,
} from '@tabler/icons-react';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { AvatarUpload } from '@/components/profile/avatar-upload';
import { CountrySelect } from '@/components/profile/country-select';
import { getProfile, updateProfile } from '@/server/actions/profile';

interface ProfileFormData {
  displayName: string;
  handicap: string;
  country: string;
  city: string;
  bio: string;
  isPublic: boolean;
  avatarUrl: string | null;
}

interface Toast {
  type: 'success' | 'error';
  message: string;
}

export default function ProfileEditPage() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof ProfileFormData, string>>>({});

  const [formData, setFormData] = useState<ProfileFormData>({
    displayName: '',
    handicap: '',
    country: '',
    city: '',
    bio: '',
    isPublic: true,
    avatarUrl: null,
  });

  useEffect(() => {
    async function loadProfile() {
      const result = await getProfile();
      if (result.success) {
        const profile = result.data;
        setFormData({
          displayName: profile.displayName ?? '',
          handicap: profile.handicapIndex != null ? profile.handicapIndex : '',
          country: profile.country ?? '',
          city: profile.city ?? '',
          bio: profile.bio ?? '',
          isPublic: profile.isPublic ?? true,
          avatarUrl: profile.avatarUrl ?? null,
        });
      }
      setIsLoading(false);
    }
    void loadProfile();
  }, []);

  function showToast(type: Toast['type'], message: string) {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  }

  function updateField<K extends keyof ProfileFormData>(key: K, value: ProfileFormData[K]) {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function validate(): boolean {
    const newErrors: Partial<Record<keyof ProfileFormData, string>> = {};

    const name = formData.displayName.trim();
    if (name.length < 2) {
      newErrors.displayName = 'Display name must be at least 2 characters.';
    }

    const rawHandicap = formData.handicap.trim();
    if (rawHandicap !== '') {
      const value = parseFloat(rawHandicap);
      if (isNaN(value) || value < 0 || value > 54) {
        newErrors.handicap = 'Handicap must be a number between 0 and 54.';
      }
    }

    if (formData.bio.length > 500) {
      newErrors.bio = 'Bio must be 500 characters or less.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;

    setIsSaving(true);

    const result = await updateProfile({
      displayName: formData.displayName.trim(),
      handicapIndex: formData.handicap.trim() !== '' ? parseFloat(formData.handicap) : undefined,
      country: formData.country || undefined,
      city: formData.city.trim() || undefined,
      bio: formData.bio.trim() || undefined,
      isPublic: formData.isPublic,
    });

    setIsSaving(false);

    if (!result.success) {
      showToast('error', result.error);
      return;
    }

    showToast('success', 'Profile saved successfully.');
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <IconGolf className="h-8 w-8 animate-pulse text-golf-green" aria-label="Loading" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-8 text-3xl font-bold">Edit Profile</h1>

      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={`mb-6 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium ${
            toast.type === 'success' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
          }`}
        >
          {toast.type === 'success' ? (
            <IconCheck className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
          ) : null}
          {toast.message}
        </div>
      )}

      <div className="flex flex-col gap-6">
        {/* Avatar section */}
        <Card>
          <CardHeader className="px-6 pt-5 pb-3">
            <h2 className="text-base font-semibold">Photo</h2>
          </CardHeader>
          <CardBody className="flex items-center justify-center px-6 pb-6">
            <AvatarUpload
              currentAvatar={formData.avatarUrl}
              name={formData.displayName || session?.user?.name || 'Golfer'}
              onUpload={(url) => updateField('avatarUrl', url)}
            />
          </CardBody>
        </Card>

        {/* Basic info */}
        <Card>
          <CardHeader className="px-6 pt-5 pb-3">
            <div className="flex items-center gap-2">
              <IconUser className="h-4 w-4 text-golf-green" aria-hidden="true" />
              <h2 className="text-base font-semibold">Basic Info</h2>
            </div>
          </CardHeader>
          <CardBody className="flex flex-col gap-4 px-6 pb-6">
            <Input
              label="Email"
              value={session?.user?.email ?? ''}
              isReadOnly
              description="Email cannot be changed."
              startContent={<IconLock className="h-4 w-4 text-default-400" aria-hidden="true" />}
            />
            <Input
              label="Display Name"
              placeholder="How other golfers know you"
              value={formData.displayName}
              onValueChange={(v) => updateField('displayName', v)}
              isRequired
              isInvalid={!!errors.displayName}
              errorMessage={errors.displayName}
            />
            <Textarea
              label="Bio"
              placeholder="Tell other golfers a bit about yourself..."
              value={formData.bio}
              onValueChange={(v) => updateField('bio', v)}
              isInvalid={!!errors.bio}
              errorMessage={errors.bio}
              maxRows={4}
              description={`${formData.bio.length}/500 characters`}
            />
          </CardBody>
        </Card>

        {/* Golf info */}
        <Card>
          <CardHeader className="px-6 pt-5 pb-3">
            <div className="flex items-center gap-2">
              <IconGolf className="h-4 w-4 text-golf-green" aria-hidden="true" />
              <h2 className="text-base font-semibold">Golf Info</h2>
            </div>
          </CardHeader>
          <CardBody className="flex flex-col gap-4 px-6 pb-6">
            <Input
              label="Handicap Index"
              placeholder="e.g. 12.3"
              type="number"
              min={0}
              max={54}
              step={0.1}
              value={formData.handicap}
              onValueChange={(v) => updateField('handicap', v)}
              isInvalid={!!errors.handicap}
              errorMessage={errors.handicap}
              description="Leave blank if unknown. Range: 0–54."
              endContent={<span className="text-sm text-default-400">HCP</span>}
            />
          </CardBody>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader className="px-6 pt-5 pb-3">
            <div className="flex items-center gap-2">
              <IconMapPin className="h-4 w-4 text-golf-green" aria-hidden="true" />
              <h2 className="text-base font-semibold">Location</h2>
            </div>
          </CardHeader>
          <CardBody className="flex flex-col gap-4 px-6 pb-6">
            <CountrySelect value={formData.country} onChange={(v) => updateField('country', v)} />
            <Input
              label="City"
              placeholder="e.g. Stockholm"
              value={formData.city}
              onValueChange={(v) => updateField('city', v)}
            />
          </CardBody>
        </Card>

        {/* Privacy */}
        <Card>
          <CardBody className="flex flex-row items-center justify-between gap-4 px-6 py-5">
            <div className="flex items-center gap-3">
              <IconWorld className="h-5 w-5 text-golf-green" aria-hidden="true" />
              <div>
                <p className="font-medium">Public Profile</p>
                <p className="text-sm text-default-500">
                  Other golfers can view your profile and stats.
                </p>
              </div>
            </div>
            <Switch
              isSelected={formData.isPublic}
              onValueChange={(v) => updateField('isPublic', v)}
              color="success"
              aria-label="Toggle public profile"
            />
          </CardBody>
        </Card>

        <Divider />

        <Button
          color="success"
          size="lg"
          className="w-full font-semibold"
          onPress={handleSave}
          isLoading={isSaving}
          isDisabled={isSaving}
          startContent={
            !isSaving ? <IconCheck className="h-4 w-4" aria-hidden="true" /> : undefined
          }
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
}
