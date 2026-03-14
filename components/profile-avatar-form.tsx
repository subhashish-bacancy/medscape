"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Avatar } from "@/components/avatar";

export function ProfileAvatarForm({
  name,
  email,
  profileImageUrl,
}: {
  name: string;
  email: string;
  profileImageUrl?: string | null;
}) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!file) {
      setError("Choose an image before uploading.");
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const response = await fetch("/api/profile/avatar", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        setError(payload?.error ?? "Unable to upload avatar.");
        return;
      }

      setFile(null);
      router.refresh();
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel-strong)] p-6 shadow-md">
      <h2 className="text-lg font-medium text-[var(--foreground)]">Profile Avatar</h2>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Upload an image to personalize your training profile. Files are stored
        in Supabase Storage and shown across the dashboard header.
      </p>

      <div className="mt-5 flex items-center gap-3">
        <Avatar name={name} profileImageUrl={profileImageUrl} />
        <div>
          <p className="text-sm font-medium text-[var(--foreground)]">{name}</p>
          <p className="text-xs text-[var(--muted)]">{email}</p>
        </div>
      </div>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <input
          accept="image/png,image/jpeg,image/webp,image/gif"
          className="block w-full rounded-xl border-2 border-[var(--border)] bg-[var(--panel)] px-3 py-2.5 text-sm text-[var(--foreground)] shadow-inner outline-none transition focus:border-[var(--brand)] file:mr-3 file:rounded-lg file:border file:border-[var(--border)] file:bg-[var(--panel-strong)] file:px-3 file:py-2 file:text-sm file:font-medium file:text-[var(--foreground)] hover:border-[var(--brand)]/45 hover:file:bg-[var(--background)]"
          onChange={(event) => {
            const selected = event.target.files?.[0] ?? null;
            setFile(selected);
          }}
          type="file"
        />

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <button
          className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isUploading}
          type="submit"
        >
          {isUploading ? "Uploading..." : "Upload avatar"}
        </button>
      </form>
    </div>
  );
}
