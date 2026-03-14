import { AdminUserActions } from "@/components/admin-user-actions";
import { getAdminUsers, requireAdmin } from "@/lib/admin";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const admin = await requireAdmin();
  const { q } = await searchParams;
  const users = await getAdminUsers(q?.trim());

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-md">
        <h1 className="text-2xl font-semibold text-slate-900">Users</h1>
        <p className="mt-1 text-sm text-slate-500">
          View learners, change roles, and disable accounts.
        </p>

        <form className="mt-6" method="get">
          <input
            className="w-full max-w-md rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500"
            defaultValue={q ?? ""}
            name="q"
            placeholder="Search users by name or email"
          />
        </form>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-md">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Joined date</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td
                    className="px-4 py-10 text-center text-sm text-slate-500"
                    colSpan={6}
                  >
                    No users matched the current search.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="border-t border-slate-100">
                    <td className="px-4 py-4 font-medium text-slate-900">
                      {user.name}
                    </td>
                    <td className="px-4 py-4 text-slate-600">{user.email}</td>
                    <td className="px-4 py-4 text-slate-600">{user.role}</td>
                    <td className="px-4 py-4 text-slate-600">
                      {new Intl.DateTimeFormat("en-US", {
                        dateStyle: "medium",
                      }).format(user.createdAt)}
                    </td>
                    <td className="px-4 py-4 text-slate-600">
                      {user.isDisabled ? "Disabled" : "Active"}
                    </td>
                    <td className="px-4 py-4">
                      <AdminUserActions
                        isDisabled={user.isDisabled}
                        isSelf={user.id === admin.id}
                        role={user.role}
                        userId={user.id}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
