'use client';

import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';

type PhotoUploadProps = {
  endpoint: string;
  extraFields?: Record<string, string>;
  currentUrl?: string | null;
  label?: string;
  onSuccess?: (url: string) => void;
};

export function PhotoUpload({
  endpoint,
  extraFields,
  currentUrl,
  label = 'Upload photo',
  onSuccess,
}: PhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(currentUrl ?? null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setError(null);
    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      if (extraFields) {
        Object.entries(extraFields).forEach(([k, v]) => form.append(k, v));
      }
      const res = await fetch(endpoint, { method: 'POST', body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Upload failed');
      const url = data.photoUrl ?? data.url;
      setPreview(url);
      onSuccess?.(url);
    } catch (err) {
      setError(String(err));
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-3">
      {preview && (
        <img
          src={preview}
          alt="Preview"
          className="w-32 h-32 rounded-full object-cover border border-[--color-border]"
        />
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
      <Button
        type="button"
        variant="secondary"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
      >
        {uploading ? 'Uploading…' : label}
      </Button>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
