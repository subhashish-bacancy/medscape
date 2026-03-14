import { notFound } from "next/navigation";
import { AdminModuleForm } from "@/components/admin-module-form";
import { getAdminModuleById, requireAdmin } from "@/lib/admin";

export default async function AdminEditModulePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const moduleId = Number(id);

  if (Number.isNaN(moduleId)) {
    notFound();
  }

  const trainingModule = await getAdminModuleById(moduleId);

  if (!trainingModule) {
    notFound();
  }

  return (
    <AdminModuleForm
      description="Update training content and replace the attached video link if needed."
      endpoint={`/api/admin/modules/${trainingModule.id}`}
      heading={`Edit ${trainingModule.title}`}
      initialValues={{
        title: trainingModule.title,
        description: trainingModule.description,
        videoUrl: trainingModule.videoUrl,
      }}
      method="PATCH"
      redirectTo="/admin/modules"
      submitLabel="Save changes"
      successMessage="Training module updated."
    />
  );
}
