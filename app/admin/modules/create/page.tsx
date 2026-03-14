import { AdminModuleForm } from "@/components/admin-module-form";
import { requireAdmin } from "@/lib/admin";

export default async function AdminCreateModulePage() {
  await requireAdmin();

  return (
    <AdminModuleForm
      description="Add a training module with a title, compliance description, and training video."
      endpoint="/api/admin/modules"
      heading="Create training module"
      redirectTo="/admin/modules"
      submitLabel="Create module"
      successMessage="Training module created."
    />
  );
}
