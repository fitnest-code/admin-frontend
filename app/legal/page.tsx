import { AdminLayout } from "@/components/layout/admin-layout";
import { LegalPage } from "@/components/legal/legal-page";

export default function LegalRoute() {
  return (
    <AdminLayout>
      <LegalPage />
    </AdminLayout>
  );
}
