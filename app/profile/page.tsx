import { AppShell } from "@/components/app-shell";
import { ProfileAvatarForm } from "@/components/profile-avatar-form";
import { requireUser } from "@/lib/auth";

export default async function ProfilePage() {
  const user = await requireUser();

  return (
    <AppShell
      currentSection="dashboard"
      description="Manage your personal profile details used across compliance training records."
      title="Profile"
      user={user}
    >
      <div className="grid gap-6">
        <ProfileAvatarForm
          email={user.email}
          name={user.name}
          profileImageUrl={user.profileImageUrl}
        />
      </div>
    </AppShell>
  );
}
