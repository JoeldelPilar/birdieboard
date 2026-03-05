'use client';

import { Avatar, Button } from '@heroui/react';
import { IconCamera, IconLoader2 } from '@tabler/icons-react';
import { useRef, useState } from 'react';
import { uploadAvatar } from '@/server/actions/profile';

interface AvatarUploadProps {
  currentAvatar?: string | null;
  name: string;
  onUpload: (_url: string) => void;
}

export function AvatarUpload({ currentAvatar, name, onUpload }: AvatarUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);

    if (file.size > MAX_FILE_SIZE) {
      setError('Image must be under 5 MB.');
      return;
    }

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    void handleUpload(file);
  }

  async function handleUpload(file: File) {
    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const result = await uploadAvatar(formData);

      if (!result.success) {
        setError(result.error);
        setPreview(null);
        return;
      }

      onUpload(result.data.avatarUrl);
    } catch {
      setError('Upload failed. Please try again.');
      setPreview(null);
    } finally {
      setIsUploading(false);
    }
  }

  const displaySrc = preview ?? currentAvatar ?? undefined;

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        aria-label="Upload avatar photo"
        onClick={() => fileInputRef.current?.click()}
        className="relative cursor-pointer"
        disabled={isUploading}
      >
        <Avatar
          src={displaySrc}
          name={name}
          className="h-24 w-24 text-2xl"
          isBordered
          color="success"
        />
        <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity hover:opacity-100">
          {isUploading ? (
            <IconLoader2 className="h-6 w-6 animate-spin text-white" aria-hidden="true" />
          ) : (
            <IconCamera className="h-6 w-6 text-white" aria-hidden="true" />
          )}
        </span>
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        aria-hidden="true"
        tabIndex={-1}
        onChange={handleFileChange}
      />

      <Button
        size="sm"
        variant="flat"
        onPress={() => fileInputRef.current?.click()}
        isLoading={isUploading}
        isDisabled={isUploading}
        className="text-xs"
      >
        {isUploading ? 'Uploading...' : 'Change photo'}
      </Button>

      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
