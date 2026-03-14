"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function AdminDeleteButton({
  endpoint,
  confirmMessage,
  label,
}: {
  endpoint: string;
  confirmMessage: string;
  label: string;
}) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    if (!window.confirm(confirmMessage)) {
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch(endpoint, {
        method: "DELETE",
      });

      if (!response.ok) {
        return;
      }

      router.refresh();
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <button
      className="rounded-xl border border-red-300 bg-red-50/70 px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-400/50 dark:bg-red-500/10 dark:text-red-300 dark:hover:bg-red-500/20"
      disabled={isDeleting}
      onClick={handleDelete}
      type="button"
    >
      {isDeleting ? "Deleting..." : label}
    </button>
  );
}
