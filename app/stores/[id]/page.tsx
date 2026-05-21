import { AdminLayout } from "@/components/layout/admin-layout";
import { AdminStoreDetailView } from "@/components/stores/admin-store-detail-view";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function StoreDetailPage({ params }: PageProps) {
  const { id } = await params;
  const numericId = Number(id);

  if (!Number.isFinite(numericId) || numericId <= 0 || !/^\d+$/.test(id.trim())) {
    notFound();
  }

  return (
    <AdminLayout>
      <AdminStoreDetailView storeId={numericId} />
    </AdminLayout>
  );
}
