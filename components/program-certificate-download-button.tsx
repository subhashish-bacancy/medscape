"use client";

import { useState } from "react";

export function ProgramCertificateDownloadButton({
  certificateId,
}: {
  certificateId: number;
}) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDownload() {
    setIsDownloading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/program-certificate/${certificateId}/download`,
        {
          method: "GET",
        },
      );

      if (!response.ok) {
        throw new Error("Failed to generate program certificate PDF.");
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = response.headers
        .get("Content-Disposition")
        ?.split("filename=")[1]
        ?.replaceAll("\"", "") ?? "certificate-program.pdf";

      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(objectUrl);
    } catch {
      setError("Unable to download program certificate right now.");
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
        disabled={isDownloading}
        onClick={handleDownload}
        type="button"
      >
        {isDownloading
          ? "Generating certificate..."
          : "Download Program Certificate (PDF)"}
      </button>

      {error ? <p className="text-sm text-[var(--danger)]">{error}</p> : null}
    </div>
  );
}
