import { AdminLayout } from "@/components/layout/admin-layout";
import { ContactDetailsPage } from "@/components/contact-details/contact-details-page";

export default function ContactDetailsRoute() {
  return (
    <AdminLayout>
      <ContactDetailsPage />
    </AdminLayout>
  );
}
