"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Clock, 
  Copy, 
  Loader2, 
  Plus, 
  Trash2, 
  Upload, 
  RefreshCw,
  ChevronDown,
  PenLine,
  ChevronLeft
} from "lucide-react";
import * as Label from "@radix-ui/react-label";
import { toast } from "sonner";
import { ApiError } from "@/lib/api/client";
import { IStoreStep2Payload } from "@/lib/types/stores";
import {
  type AdminStorePatchData,
  useAdminStoreDetailQuery,
  useUpdateAdminStoreMutation,
} from "@/modules/stores";
import { useSubscriptionPackages } from "@/lib/query/use-subscription-packages";
import { useGetAddressByCoords } from "@/lib/query/location-query";
import LocationPickerMap from "@/components/ui/location-picker-map";
import styles from "./index.module.css";
import { cn } from "@/lib/utils";

const defaultContact: IStoreStep2Payload = {
  latitude: 0,
  longitude: 0,
  phone: "",
  email: "",
  socialUrl: "",
  workHours: { from: "09:00", to: "18:00" },
};

export function AdminStoreEditView({ storeId }: { storeId: number }) {
  const router = useRouter();
  const { data, isLoading, isError, error } = useAdminStoreDetailQuery(storeId);
  const { mutateAsync: saveStore, isPending } = useUpdateAdminStoreMutation();
  const { data: allPackages } = useSubscriptionPackages();

  const seededForId = useRef<number | null>(null);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [contact, setContact] = useState<IStoreStep2Payload>(defaultContact);
  const [discounts, setDiscounts] = useState<{ id: string; packageId: string; discount: string }[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [isUpdatingFromCoords, setIsUpdatingFromCoords] = useState(false);

  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  // Clean up searchTimeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) clearTimeout(searchTimeout);
    };
  }, [searchTimeout]);

  // Forward Geocoding via dedicated backend proxy
  const debouncedSearch = (query: string) => {
    if (searchTimeout) clearTimeout(searchTimeout);
    if (!query || query.length < 3) {
      setSuggestions([]);
      return;
    }

    // Check if query is lat/lng coordinates (e.g. "40.4093, 49.8671" or "40.4093 49.8671")
    const matchCoords = query.match(/^\s*(-?\d+(?:\.\d+)?)\s*[\s,]\s*(-?\d+(?:\.\d+)?)\s*$/);
    if (matchCoords) {
      const lat = parseFloat(matchCoords[1]);
      const lng = parseFloat(matchCoords[2]);
      if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        setContact(prev => ({ ...prev, latitude: lat, longitude: lng }));
        setIsUpdatingFromCoords(true);
        setSuggestions([]);
        return;
      }
    }

    const timeout = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/v1/admin/gyms/geocoding/forward?query=${encodeURIComponent(query)}`);
        const data = await res.json();
        setSuggestions(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Geocoding proxy error:", error);
      } finally {
        setIsSearching(false);
      }
    }, 600);
    setSearchTimeout(timeout);
  };

  const handleSelectSuggestion = (s: any) => {
    const lat = typeof s.latitude === "number" ? s.latitude : parseFloat(s.lat || 0);
    const lng = typeof s.longitude === "number" ? s.longitude : parseFloat(s.lon || 0);
    setContact(prev => ({ ...prev, latitude: lat, longitude: lng }));

    const suggestedText = s.addressText || s.display_name || "";
    
    // Extract custom typed numbers/house indicators missing from the map result
    const matchNumber = address.match(/\b\d+(?:\/[a-zA-Z0-9]+|-[a-zA-Z0-9]+|[a-zA-Z])?\b/);
    
    if (matchNumber && !suggestedText.includes(matchNumber[0])) {
      const parts = suggestedText.split(',');
      parts[0] = `${parts[0].trim()} ${matchNumber[0]}`;
      setAddress(parts.join(', '));
    } else {
      setAddress(suggestedText);
    }
    
    setSuggestions([]);
  };

  // 1. Reverse Geocoding when coordinates are typed manually
  const hasCoordinates = contact.latitude !== 0 && contact.longitude !== 0 && contact.latitude != null && contact.longitude != null;
  const { data: addressData, isFetching: isAddressFetching } = useGetAddressByCoords(
    contact.latitude || 0,
    contact.longitude || 0,
    isUpdatingFromCoords && hasCoordinates
  );


  // Sync reverse geocoding result to address field
  useEffect(() => {
    if (isUpdatingFromCoords && !isAddressFetching && (addressData?.addressText || addressData?.city)) {
      const latDiff = Math.abs((addressData.latitude || 0) - (contact.latitude || 0));
      const lngDiff = Math.abs((addressData.longitude || 0) - (contact.longitude || 0));
      if (latDiff < 0.0001 && lngDiff < 0.0001) {
        setAddress([addressData.addressText, addressData.city].filter(Boolean).join(", "));
        setIsUpdatingFromCoords(false); // Reset
      }
    }
  }, [addressData, isAddressFetching, isUpdatingFromCoords, contact.latitude, contact.longitude]);

  useEffect(() => {
    if (!data) return;
    if (seededForId.current === data.id) return;
    seededForId.current = data.id;
    
    setName(data.name);
    setAddress(data.address);
    setImagePreview(data.coverImageUrl);
    setContact({
      latitude: data.latitude,
      longitude: data.longitude,
      phone: data.phone,
      email: data.email,
      socialUrl: data.socialUrl,
      workHours: { ...data.workHours },
    });
    setIsUpdatingFromCoords(false);
    setDiscounts(
      data.discounts.length > 0
        ? data.discounts.map((d) => ({
            id: Math.random().toString(36).substr(2, 9),
            packageId: String(d.packageId),
            discount: String(d.discountPercent),
          }))
        : [{ id: Math.random().toString(36).substr(2, 9), packageId: "", discount: "10" }]
    );
  }, [data]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  async function handleSave() {
    if (!name.trim()) return toast.error("Mağaza adı mütləqdir");
    if (!address.trim()) return toast.error("Ünvan mütləqdir");

    const patchData: AdminStorePatchData = {
      name: name.trim(),
      latitude: Number(contact.latitude),
      longitude: Number(contact.longitude),
      phone: contact.phone.trim(),
      email: contact.email.trim(),
      socialUrl: contact.socialUrl.trim(),
      socialUrlProvided: true,
      workHours: { ...contact.workHours },
      workHoursProvided: true,
      discounts: discounts
        .filter(d => d.packageId)
        .map(d => ({ packageId: Number(d.packageId), discountPercent: Number(d.discount) })),
      address: address.trim(),
    };

    try {
      await saveStore({ id: storeId, data: patchData, photo: imageFile });
      toast.success("Mağaza yeniləndi");
      router.push(`/stores/${storeId}`);
    } catch (e: unknown) {
      toast.error(e instanceof ApiError ? e.message : "Yeniləmə alınmadı");
    }
  }

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="animate-spin text-[#00B4CC]" size={32} />
    </div>
  );

  return (
    <div className={styles.superAdminYeniMaaza}>
      <main className={styles.mainContent}>
        <div className={styles.backButton} onClick={() => router.push(`/stores/${storeId}`)}>
          <ChevronLeft size={18} />
          <span>Geri qayıt</span>
        </div>

        <div className={styles.pageHeader}>
          <h1 className={styles.storeTitle}>{name || ""}</h1>
        </div>

        <div className={styles.detailCard}>
          {/* Mağaza Məlumatları */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Mağaza məlumatları</h2>
            </div>

            <div className={styles.infoGroup}>
              <label className={styles.label}>Mağaza adı</label>
              <input 
                className={styles.input} 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                placeholder="Vitamin club"
              />
            </div>

            <div className={styles.infoGroup}>
              <label className={styles.label}>Mağaza şəkilləri</label>
              <div className={styles.imageSection}>
                <img 
                  src={imagePreview || "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2670&auto=format&fit=crop"} 
                  className={styles.storeImage} 
                  alt="Preview" 
                />
                <div className={styles.imageActions}>
                  <label className={styles.imageAction}>
                    <Upload size={20} />
                    <span>Şəkil yüklə</span>
                    <input type="file" hidden onChange={handleImageChange} accept="image/*" />
                  </label>
                  <label className={styles.imageAction}>
                    <RefreshCw size={20} />
                    <span>Şəkli dəyiş</span>
                    <input type="file" hidden onChange={handleImageChange} accept="image/*" />
                  </label>
                  <div className={cn(styles.imageAction, styles.imageActionDelete)} onClick={() => { setImageFile(null); setImagePreview(null); }}>
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
            
            <div className={cn(styles.infoGroup, "relative")}>
              <label className={styles.label}>Ünvan</label>
              <div className="relative">
                <input 
                  className={styles.input} 
                  value={isAddressFetching ? "Ünvan təyin edilir..." : address} 
                  onChange={(e) => {
                    setAddress(e.target.value);
                    debouncedSearch(e.target.value);
                  }}
                  placeholder="Bakı, Nərimanov rayonu"
                />
                {(isAddressFetching || isSearching) && (
                  <Loader2 className="absolute right-4 top-3 animate-spin text-[#00B4D8]" size={20} />
                )}
              </div>

              {/* Suggestions Dropdown */}
              {suggestions.length > 0 && (
                <div className="absolute top-[100%] left-0 right-0 z-[1000] mt-1 bg-white border border-[#ECECED] rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2">
                  {suggestions.map((s, i) => {
                    const text = s.addressText || s.display_name || "";
                    const shortText = text.split(',')[0] || text;
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleSelectSuggestion(s)}
                        className="w-full text-left px-4 py-3 text-sm font-medium hover:bg-slate-50 border-b border-slate-50 last:border-0 transition-colors flex flex-col gap-0.5"
                      >
                        <span className="text-slate-800">{shortText}</span>
                        <span className="text-xs text-slate-400 truncate">{text}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>


            {/* Map */}
            <div className="w-full rounded-xl overflow-hidden border border-[#ececed] mt-4">
              <LocationPickerMap
                lat={contact.latitude || 40.4093}
                lng={contact.longitude || 49.8671}
                height="240px"
                onLocationSelect={(lat, lng) => {
                  setContact(prev => ({ ...prev, latitude: lat, longitude: lng }));
                  setIsUpdatingFromCoords(true);
                  setAddress("");
                }}
              />
            </div>

            <div className={styles.grid2}>
              <div className={styles.infoGroup}>
                <label className={styles.label}>Telefon nömrəsi</label>
                <input 
                  className={styles.input} 
                  value={contact.phone} 
                  onChange={(e) => setContact({...contact, phone: e.target.value})}
                />
              </div>
              <div className={styles.infoGroup}>
                <label className={styles.label}>E-Poçt</label>
                <input 
                  className={styles.input} 
                  value={contact.email} 
                  onChange={(e) => setContact({...contact, email: e.target.value})}
                />
              </div>
            </div>

            <div className={styles.infoGroup}>
              <label className={styles.label}>Keçid üçün link (URL)</label>
              <input 
                className={styles.input} 
                value={contact.socialUrl} 
                onChange={(e) => setContact({...contact, socialUrl: e.target.value})}
              />
            </div>
          </section>

          {/* İş saatları */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>İş saatları</h2>
            </div>
            <div className={styles.grid2}>
              <div className={styles.infoGroup}>
                <label className={styles.label}>Başlama saatı</label>
                <div className="relative">
                  <input 
                    type="time"
                    className={cn(styles.input, styles.inputWithIcon)} 
                    value={contact.workHours.from} 
                    onChange={(e) => setContact({...contact, workHours: {...contact.workHours, from: e.target.value}})}
                  />
                  <Clock size={20} className={styles.inputIcon} />
                </div>
              </div>
              <div className={styles.infoGroup}>
                <label className={styles.label}>Bitmə saatı</label>
                <div className="relative">
                  <input 
                    type="time"
                    className={cn(styles.input, styles.inputWithIcon)} 
                    value={contact.workHours.to} 
                    onChange={(e) => setContact({...contact, workHours: {...contact.workHours, to: e.target.value}})}
                  />
                  <Clock size={20} className={styles.inputIcon} />
                </div>
              </div>
            </div>
          </section>

          {/* Paketlər */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Paketlər və endirimlər</h2>
              <button className={styles.addButton} onClick={() => setDiscounts([...discounts, { id: Math.random().toString(36).substr(2, 9), packageId: "", discount: "10" }])}>
                <Plus size={18} />
                <span>Əlavə et</span>
              </button>
            </div>
            
            <div className={styles.packagesSection}>
              <div className={styles.tableHeader}>
                <span>Paket adı</span>
                <span>Endirim (%)</span>
              </div>
              <div className="flex flex-col gap-4 p-4">
                {discounts.map((d, idx) => (
                  <div key={d.id} className={styles.packageRow}>
                    <select 
                      className={styles.input}
                      value={d.packageId}
                      onChange={(e) => {
                        const newDiscounts = [...discounts];
                        newDiscounts[idx].packageId = e.target.value;
                        setDiscounts(newDiscounts);
                      }}
                    >
                      <option value="">Paket seçin</option>
                      {allPackages
                        ?.filter(p => !discounts.some((dOther, oIdx) => oIdx !== idx && String(dOther.packageId) === String(p.id)))
                        .map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                    <div className="relative">
                      <input 
                        type="number"
                        className={styles.input}
                        value={d.discount}
                        onChange={(e) => {
                          const newDiscounts = [...discounts];
                          newDiscounts[idx].discount = e.target.value;
                          setDiscounts(newDiscounts);
                        }}
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">%</span>
                    </div>
                    <button className={styles.trashBtn} onClick={() => setDiscounts(discounts.filter(item => item.id !== d.id))}>
                      <Trash2 size={20} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <div className={styles.formActions}>
            <button className={styles.buttonSecondary} onClick={() => router.push(`/stores/${storeId}`)}>Ləğv et</button>
            <button className={styles.buttonPrimary} onClick={handleSave} disabled={isPending}>
              {isPending && <Loader2 className="animate-spin" size={18} />}
              Yadda saxla
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
