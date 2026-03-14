"use client";

import { Upload, Video } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function AdminModuleForm({
  initialValues,
  submitLabel,
  heading,
  description,
  endpoint,
  method = "POST",
  redirectTo,
  successMessage,
}: {
  initialValues?: {
    title: string;
    description: string;
    videoUrl: string;
  };
  submitLabel: string;
  heading: string;
  description: string;
  endpoint: string;
  method?: "POST" | "PATCH";
  redirectTo?: string;
  successMessage: string;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [moduleDescription, setModuleDescription] = useState(
    initialValues?.description ?? "",
  );
  const [videoUrl, setVideoUrl] = useState(initialValues?.videoUrl ?? "");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      let resolvedVideoUrl = videoUrl.trim();

      if (videoFile) {
        const formData = new FormData();
        formData.append("video", videoFile);

        const uploadResponse = await fetch("/api/admin/upload-video", {
          method: "POST",
          body: formData,
        });
        const uploadPayload = (await uploadResponse.json().catch(() => null)) as
          | { error?: string; videoUrl?: string }
          | null;

        if (!uploadResponse.ok || !uploadPayload?.videoUrl) {
          setError(uploadPayload?.error ?? "Unable to upload training video.");
          return;
        }

        resolvedVideoUrl = uploadPayload.videoUrl;
      }

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description: moduleDescription,
          videoUrl: resolvedVideoUrl,
        }),
      });

      const payload = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;

      if (!response.ok) {
        setError(payload?.error ?? "Unable to save module.");
        return;
      }

      setSuccess(successMessage);
      setVideoFile(null);

      if (redirectTo) {
        router.push(redirectTo);
      } else {
        router.refresh();
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      className="rounded-3xl border border-slate-200 bg-white p-6 shadow-md"
      onSubmit={handleSubmit}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
          <Video className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-slate-900">{heading}</h2>
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-4">
        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-700">Title</span>
          <input
            className="rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500"
            onChange={(event) => setTitle(event.target.value)}
            required
            value={title}
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-700">Description</span>
          <textarea
            className="min-h-32 rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500"
            onChange={(event) => setModuleDescription(event.target.value)}
            required
            value={moduleDescription}
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-700">Video URL</span>
          <input
            className="rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500"
            onChange={(event) => setVideoUrl(event.target.value)}
            placeholder="https://..."
            value={videoUrl}
          />
          <span className="text-xs text-slate-500">
            Supports YouTube embed links or publicly hosted video files.
          </span>
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-700">
            Upload training video
          </span>
          <input
            accept="video/mp4,video/webm,video/quicktime"
            className="block w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-slate-700 hover:file:bg-slate-200"
            onChange={(event) => setVideoFile(event.target.files?.[0] ?? null)}
            type="file"
          />
        </label>
      </div>

      {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
      {success ? <p className="mt-4 text-sm text-emerald-700">{success}</p> : null}

      <button
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={isSubmitting}
        type="submit"
      >
        <Upload className="h-4 w-4" />
        {isSubmitting ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}
