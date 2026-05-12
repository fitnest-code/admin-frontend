import { AdminLayout } from "@/components/layout/admin-layout";
import { AdminStoreEditView } from "@/components/stores/admin-store-edit-view";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function StoreEditPage({ params }: PageProps) {
  const { id } = await params;
  const numericId = Number(id);

  if (!Number.isFinite(numericId) || numericId <= 0 || !/^\d+$/.test(id.trim())) {
    notFound();
  }

  return (
    <AdminLayout>
      <AdminStoreEditView storeId={numericId} />
    </AdminLayout>
  );
}
