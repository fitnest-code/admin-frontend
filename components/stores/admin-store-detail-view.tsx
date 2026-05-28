"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Search, 
  User, 
  LogOut, 
  Edit3, 
  LayoutDashboard, 
  Users, 
  Tags, 
  Building2, 
  CreditCard, 
  Zap, 
  FileText, 
  Utensils, 
  Dumbbell, 
  Globe, 
  Settings,
  ChevronLeft,
  Clock,
  Upload,
  RefreshCw,
  Trash2,
  ChevronDown
} from "lucide-react";
import { useAdminStoreDetailQuery } from "@/modules/stores";
import { useSubscriptionPackages } from "@/lib/query/use-subscription-packages";
import styles from "./index.module.css";
import { cn } from "@/lib/utils";
import LocationPickerMap from "@/components/ui/location-picker-map";


export function AdminStoreDetailView({ storeId }: { storeId: number }) {
  const router = useRouter();
  const { data, isLoading, isError, error } = useAdminStoreDetailQuery(storeId);
  const { data: packages } = useSubscriptionPackages();

  function packageLabel(packageId: number): string {
    const pkg = packages?.find(p => p.id === packageId);
    return pkg?.name ?? `Paket #${packageId}`;
  }



  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="animate-spin text-[#00B4CC]" size={32} />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-red-500 font-medium">{error instanceof Error ? error.message : "Məlumat tapılmadı"}</p>
        <button onClick={() => router.push("/stores")} className="text-[#00B4CC] hover:underline">Geri qayıt</button>
      </div>
    );
  }

  return (
    <div className={styles.superAdminYeniMaaza}>
      <main className={styles.mainContent}>
        {/* Back Button */}
        <div className={styles.backButton} onClick={() => router.push("/stores")}>
          <ChevronLeft size={18} />
          <span>Geri qayıt</span>
        </div>

        {/* Page Title & Edit */}
        <div className={styles.pageHeader}>
          <h1 className={styles.storeTitle}>{data.name}</h1>
          <button className={styles.editButton} onClick={() => router.push(`/stores/${storeId}/edit`)}>
            <Edit3 size={20} />
          </button>
        </div>

        {/* Main Card */}
        <div className={styles.detailCard}>
          {/* Mağaza Məlumatları */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Mağaza məlumatları</h2>
            </div>
            <div className={styles.infoGroup}>
              <span className={styles.label}>Mağaza adı</span>
              <div className={styles.valueBox}>{data.name}</div>
            </div>
            <div className={styles.infoGroup}>
              <span className={styles.label}>Mağaza şəkilləri</span>
              <div className={styles.imageSection}>
                <img 
                  src={data.coverImageUrl || "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2670&auto=format&fit=crop"} 
                  className={styles.storeImage} 
                  alt={data.name} 
                />
                <div className={styles.imageActions}>
                  <div className={styles.imageAction}>
                    <Upload size={20} />
                    <span>Şəkil yüklə</span>
                  </div>
                  <div className={styles.imageAction}>
                    <RefreshCw size={20} />
                    <span>Şəkli dəyiş</span>
                  </div>
                  <div className={`${styles.imageAction} ${styles.imageActionDelete}`}>
                    <Trash2 size={20} />
                    <span>Şəkli sil</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Əlaqə */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Əlaqə</h2>
            </div>
            <div className={styles.infoGroup}>
              <span className={styles.label}>Ünvan</span>
              <div className={styles.valueBox}>{typeof data.address === 'object' ? JSON.stringify(data.address) : data.address}</div>
            </div>

            {/* Map moved here */}
            <div className="w-full rounded-xl overflow-hidden border border-[#ececed] mt-4">
              <LocationPickerMap
                lat={data.latitude}
                lng={data.longitude}
                height="240px"
                disabled={true}
              />
            </div>

            <div className={styles.grid2}>
              <div className={styles.infoGroup}>
                <span className={styles.label}>Telefon nömrəsi</span>
                <div className={styles.valueBox}>{data.phone}</div>
              </div>
              <div className={styles.infoGroup}>
                <span className={styles.label}>E-Poçt</span>
                <div className={styles.valueBox}>{data.email}</div>
              </div>
            </div>

            <div className={styles.infoGroup}>
              <span className={styles.label}>Keçid üçün link (URL)</span>
              <div className={styles.valueBox}>{data.socialUrl || "—"}</div>
            </div>
          </section>

          {/* İş saatları */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>İş saatları</h2>
            </div>
            <div className={styles.grid2}>
              <div className={styles.infoGroup}>
                <span className={styles.label}>Başlama saatı</span>
                <div className={styles.valueBox}>
                  {data.workHours.from}
                  <Clock size={20} className="absolute right-4 text-[#00B4CC]" />
                </div>
              </div>
              <div className={styles.infoGroup}>
                <span className={styles.label}>Bitmə saatı</span>
                <div className={styles.valueBox}>
                  {data.workHours.to}
                  <Clock size={20} className="absolute right-4 text-[#00B4CC]" />
                </div>
              </div>
            </div>
          </section>

          {/* Paketlər */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Paketlər və endirimlər</h2>
            </div>
            <div className={styles.packagesSection}>
              <div className={styles.tableHeader}>
                <span>Paket adı</span>
                <span>Endirim (%)</span>
              </div>
              {data.discounts.length > 0 ? data.discounts.map((discount, idx) => (
                <div key={idx} className={styles.tableRow}>
                  <div className={styles.packageSelect}>
                    <span>{packageLabel(discount.packageId)}</span>
                    <ChevronDown size={20} className="text-gray-400" />
                  </div>
                  <div className={styles.packageSelect}>
                    <span>{discount.discountPercent}%</span>
                  </div>
                </div>
              )) : (
                <div className="p-8 text-center text-gray-400 italic">Endirim təyin edilməyib</div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
