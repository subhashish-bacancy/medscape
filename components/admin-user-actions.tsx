"use client";

import type { UserRole } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function AdminUserActions({
  userId,
  role,
  isDisabled,
  isSelf,
}: {
  userId: number;
  role: UserRole;
  isDisabled: boolean;
  isSelf: boolean;
}) {
  const router = useRouter();
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);
  const [isUpdatingState, setIsUpdatingState] = useState(false);

  async function updateUser(payload: { role?: UserRole; isDisabled?: boolean }) {
    const response = await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      router.refresh();
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <select
        className="rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900"
        defaultValue={role}
        disabled={isSelf || isUpdatingRole}
        onChange={async (event) => {
          setIsUpdatingRole(true);
          try {
            await updateUser({ role: event.target.value as UserRole });
          } finally {
            setIsUpdatingRole(false);
          }
        }}
      >
        <option value="USER">USER</option>
        <option value="ADMIN">ADMIN</option>
      </select>

      <button
        className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={isSelf || isUpdatingState}
        onClick={async () => {
          setIsUpdatingState(true);
          try {
            await updateUser({ isDisabled: !isDisabled });
          } finally {
            setIsUpdatingState(false);
          }
        }}
        type="button"
      >
        {isUpdatingState
          ? "Saving..."
          : isDisabled
            ? "Enable user"
            : "Disable user"}
      </button>
    </div>
  );
}
