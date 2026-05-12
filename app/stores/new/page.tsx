import StoreCreateWizard from "@/components/stores";
import { AdminLayout } from "@/components/layout/admin-layout";

export default function NewStorePage() {
  return (
    <AdminLayout>
      <StoreCreateWizard />
    </AdminLayout>
  );
}
