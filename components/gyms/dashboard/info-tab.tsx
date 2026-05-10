"use client";

import { useState, useEffect } from "react";
import { Upload, Trash2, ChevronDown, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGymInfoAdmin, useUpdateGymInfo, useCategories } from "@/lib/query/gym-query";

interface InfoTabProps {
  gymId?: number | string
}

const getImageUrl = (urlOrFsId: string | undefined | null) => {
  if (!urlOrFsId) return "";
  if (urlOrFsId.startsWith("http") || urlOrFsId.startsWith("/")) return urlOrFsId;
  return `/api/v1/media/stream/${urlOrFsId}`;
};

export function InfoTab({ gymId }: InfoTabProps) {
  const [activeLang, setActiveLang] = useState<"Az" | "Ru" | "En">("Az");
  const [isEditing, setIsEditing] = useState(false);
  
  const { data: gymInfo, isLoading } = useGymInfoAdmin(gymId);
  const { mutate: updateGymInfo, isPending } = useUpdateGymInfo();
  const { data: categoriesData } = useCategories();
  
  const [formData, setFormData] = useState({
    categoryId: 0,
    name: "",
    description: "",
    phone: "",
    email: "",
    city: "",
    address: "",
    latitude: 0,
    longitude: 0,
  });

  useEffect(() => {
    if (gymInfo) {
      setFormData({
        categoryId: gymInfo.categoryId || 0,
        name: gymInfo.name || "",
        description: gymInfo.description || "",
        phone: gymInfo.phone || "",
        email: gymInfo.email || "",
        city: gymInfo.city || "",
        address: gymInfo.address || "",
        latitude: gymInfo.latitude || 0,
        longitude: gymInfo.longitude || 0,
      });
    }
  }, [gymInfo]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    if (!gymId) return;
    updateGymInfo({
      id: Number(gymId),
      payload: {
        ...formData,
        categoryId: Number(formData.categoryId),
        latitude: Number(formData.latitude),
        longitude: Number(formData.longitude)
      }
    }, {
      onSuccess: () => {
        setIsEditing(false);
      }
    });
  };

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Yüklənir...</div>;
  if (!gymInfo) return <div className="p-8 text-center text-muted-foreground">Məlumat tapılmadı</div>;

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="rounded-2xl border border-border bg-white p-8 shadow-sm flex flex-col gap-10">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-2">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-[#101828]">Zal məlumatları</h3>
            <button 
              onClick={() => setIsEditing(!isEditing)}
              className={cn("transition-colors", isEditing ? "text-[#00B4CC]" : "text-muted-foreground hover:text-foreground")}
            >
              <Pencil size={16} />
            </button>
          </div>
          <div className="flex gap-6">
            {(["Az", "Ru", "En"] as const).map((l) => (
              <button
                key={l}
                onClick={() => setActiveLang(l)}
                className={cn(
                  "text-sm font-medium transition-all pb-2",
                  activeLang === l 
                    ? "text-[#00B4CC] border-b-[3px] border-[#00B4CC]" 
                    : "text-muted-foreground hover:text-foreground border-b-[3px] border-transparent"
                )}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Form Fields */}
        <div className="flex flex-col gap-6">
          {/* Kateqoriya */}
          <div className="flex flex-col gap-2">
            <label className="text-[15px] text-[#101828]">Kateqoriya</label>
            <div className={cn("flex items-center justify-between rounded-xl border px-4 py-3.5", isEditing ? "bg-white border-[#ECECED] focus-within:border-[#00B4CC]" : "bg-[#FAFAFA] border-[#ECECED]")}>
              {isEditing ? (
                <select 
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  className="bg-transparent text-[15px] text-[#101828] outline-none w-full appearance-none"
                >
                  <option value={0} disabled>Seçin</option>
                  {categoriesData?.items?.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              ) : (
                <span className="text-[15px] text-[#101828]">{gymInfo.categoryName || "Göstərilməyib"}</span>
              )}
              {isEditing && <ChevronDown size={20} className="text-muted-foreground pointer-events-none" />}
            </div>
          </div>

          {/* Zal adı */}
          <div className="flex flex-col gap-2">
            <label className="text-[15px] text-[#101828]">Zal adı</label>
            <div className={cn("flex items-center rounded-xl border px-4 py-3.5", isEditing ? "bg-white border-[#ECECED] focus-within:border-[#00B4CC]" : "bg-[#FAFAFA] border-[#ECECED]")}>
              <input 
                type="text" 
                name="name"
                value={formData.name}
                onChange={handleChange}
                readOnly={!isEditing}
                className="bg-transparent text-[15px] text-[#101828] outline-none w-full"
              />
            </div>
          </div>

          {/* Haqqında */}
          <div className="flex flex-col gap-2">
            <label className="text-[15px] text-[#101828]">Haqqında</label>
            <div className={cn("rounded-xl border px-4 py-3.5 min-h-[120px]", isEditing ? "bg-white border-[#ECECED] focus-within:border-[#00B4CC]" : "bg-[#FAFAFA] border-[#ECECED]")}>
              <textarea 
                name="description"
                value={formData.description}
                onChange={handleChange}
                readOnly={!isEditing}
                className="bg-transparent text-[15px] text-[#101828] outline-none w-full h-full resize-none"
              />
            </div>
          </div>
        </div>

        {/* Zal Şəkilləri */}
        <div className="flex flex-col gap-6 border-t border-border pt-8">
          <h3 className="text-lg font-semibold text-[#101828]">Zal şəkilləri</h3>
          
          <div className="flex flex-col gap-8">
            {/* Cover image */}
            <div className="flex flex-col gap-3">
              <label className="text-[15px] text-[#101828]">Cover Şəkil</label>
              {gymInfo.coverImageUrl && !isEditing ? (
                 <div className="w-full max-w-[444px] h-[252px] rounded-2xl overflow-hidden border border-border">
                   <img src={getImageUrl(gymInfo.coverImageUrl)} className="w-full h-full object-cover" alt="cover" />
                 </div>
              ) : (
                <>
                  <div className="w-full max-w-[444px] h-[252px] rounded-2xl border border-dashed border-[#99A1AF] flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-slate-50 transition-colors relative overflow-hidden group">
                    {gymInfo.coverImageUrl && <img src={getImageUrl(gymInfo.coverImageUrl)} className="w-full h-full object-cover absolute inset-0 opacity-40" alt="cover" />}
                    <Upload size={32} className="text-[#4A5565] z-10" />
                    <span className="text-[15px] font-medium text-[#4A5565] z-10">Upload cover</span>
                  </div>
                  <span className="text-sm text-[#6A7282]">JPG or PNG • Max size 2MB</span>
                </>
              )}
            </div>

            {/* Digər şəkillər */}
            <div className="flex flex-col gap-4">
              <label className="text-[15px] text-[#101828]">Digər şəkillər ({gymInfo.rooms?.length || 0}/9)</label>
              <div className="flex flex-wrap gap-4">
                
                {gymInfo.rooms?.map((room, i) => (
                  <div key={i} className="flex flex-col gap-3 w-[180px]">
                    <div className="w-full h-[180px] rounded-2xl bg-secondary border border-border relative overflow-hidden group">
                      {room.imageUrl ? (
                        <img 
                          src={getImageUrl(room.imageUrl)} 
                          className="w-full h-full object-cover" 
                          alt="room" 
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">Şəkil yoxdur</div>
                      )}
                      {isEditing && (
                        <div className="absolute top-3 right-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="h-7 w-7 rounded-full bg-white flex items-center justify-center text-slate-700 shadow-sm hover:text-[#00B4CC]">
                            <Pencil size={13} />
                          </button>
                          <button className="h-7 w-7 rounded-full bg-white flex items-center justify-center text-slate-700 shadow-sm hover:text-red-500">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      )}
                    </div>
                    <input 
                      type="text" 
                      value={room.name || ""} 
                      readOnly={!isEditing}
                      className="w-full text-sm bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg px-3 py-2 outline-none text-[#101828]" 
                    />
                  </div>
                ))}

                {isEditing && [...Array(Math.max(0, 9 - (gymInfo.rooms?.length || 0)))].map((_, i) => (
                  <div key={`empty-${i}`} className="flex flex-col gap-3 w-[180px]">
                    <div className="w-full h-[180px] rounded-2xl border border-dashed border-[#D1D5DC] flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-slate-50 transition-colors">
                      <Upload size={24} className="text-[#717182]" />
                      <span className="text-sm text-[#717182]">Upload</span>
                    </div>
                    <input 
                      type="text" 
                      placeholder="Ad (məs: SPA)" 
                      className="w-full text-sm bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg px-3 py-2 outline-none text-[#717182] placeholder:text-[#717182]" 
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Əlaqə */}
        <div className="flex flex-col gap-6 border-t border-border pt-8">
          <div className="flex items-center justify-between">
             <h3 className="text-lg font-semibold text-[#101828]">Əlaqə</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-[15px] text-[#101828]">Telefon nömrəsi</label>
              <div className={cn("flex items-center rounded-xl border px-4 py-3.5", isEditing ? "bg-white border-[#ECECED] focus-within:border-[#00B4CC]" : "bg-[#FAFAFA] border-[#ECECED]")}>
                <input 
                  type="text" 
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  readOnly={!isEditing}
                  className="bg-transparent text-[15px] font-semibold text-[#101828] outline-none w-full"
                />
              </div>
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-[15px] text-[#101828]">E-Poçt</label>
              <div className={cn("flex items-center rounded-xl border px-4 py-3.5", isEditing ? "bg-white border-[#ECECED] focus-within:border-[#00B4CC]" : "bg-[#FAFAFA] border-[#ECECED]")}>
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  readOnly={!isEditing}
                  className="bg-transparent text-[15px] font-semibold text-[#101828] outline-none w-full"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-[15px] text-[#101828]">Şəhər</label>
              <div className={cn("flex items-center rounded-xl border px-4 py-3.5", isEditing ? "bg-white border-[#ECECED] focus-within:border-[#00B4CC]" : "bg-[#FAFAFA] border-[#ECECED]")}>
                <input 
                  type="text" 
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  readOnly={!isEditing}
                  className="bg-transparent text-[15px] text-[#101828] outline-none w-full"
                />
              </div>
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-[15px] text-[#101828]">Ünvan</label>
              <div className={cn("flex items-center rounded-xl border px-4 py-3.5", isEditing ? "bg-white border-[#ECECED] focus-within:border-[#00B4CC]" : "bg-[#FAFAFA] border-[#ECECED]")}>
                <input 
                  type="text" 
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  readOnly={!isEditing}
                  className="bg-transparent text-[15px] text-[#101828] outline-none w-full"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Koordinatlar */}
        <div className="flex flex-col gap-6 border-t border-border pt-8">
          <h3 className="text-lg font-semibold text-[#101828]">Koordinatlar</h3>
          
          <div className="grid grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-[15px] text-[#101828]">En (Latitude)</label>
              <div className={cn("flex items-center justify-between rounded-xl border px-4 py-3.5", isEditing ? "bg-white border-[#ECECED] focus-within:border-[#00B4CC]" : "bg-[#FAFAFA] border-[#ECECED]")}>
                <input 
                  type="number" 
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleChange}
                  readOnly={!isEditing}
                  step="any"
                  className="bg-transparent text-[15px] text-[#101828] outline-none w-full"
                />
                {!isEditing && <Pencil size={16} className="text-muted-foreground opacity-50" />}
              </div>
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-[15px] text-[#101828]">Uzunluq (Longitude)</label>
              <div className={cn("flex items-center justify-between rounded-xl border px-4 py-3.5", isEditing ? "bg-white border-[#ECECED] focus-within:border-[#00B4CC]" : "bg-[#FAFAFA] border-[#ECECED]")}>
                <input 
                  type="number" 
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleChange}
                  readOnly={!isEditing}
                  step="any"
                  className="bg-transparent text-[15px] text-[#101828] outline-none w-full"
                />
                {!isEditing && <Pencil size={16} className="text-muted-foreground opacity-50" />}
              </div>
            </div>
          </div>

          {/* Map Placeholder */}
          <div className="w-full h-[400px] sm:h-[553px] rounded-2xl overflow-hidden relative border border-border bg-slate-100 flex items-center justify-center text-muted-foreground">
            {formData.latitude && formData.longitude ? (
              <iframe 
                src={`https://www.google.com/maps?q=${formData.latitude},${formData.longitude}&z=15&output=embed`} 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                className="grayscale-[0.2]"
              />
            ) : (
              <span>Koordinatlar təyin edilməyib</span>
            )}
          </div>
        </div>

        {/* Yaradılma tarixi */}
        <div className="flex flex-col gap-2 border-t border-border pt-8">
          <label className="text-[15px] text-[#101828]">Yaradılma tarixi</label>
          <div className="flex items-center rounded-xl bg-[#FAFAFA] border border-[#ECECED] px-4 py-3.5 w-full">
            <span className="text-[15px] text-[#101828]">{gymInfo.createdAt || "---"}</span>
          </div>
        </div>

        {/* Action Button */}
        {isEditing && (
          <div className="flex justify-end pt-4 gap-4">
            <button 
              onClick={() => {
                setIsEditing(false);
                // reset state to gymInfo
                setFormData({
                  categoryId: gymInfo.categoryId || 0,
                  name: gymInfo.name || "",
                  description: gymInfo.description || "",
                  phone: gymInfo.phone || "",
                  email: gymInfo.email || "",
                  city: gymInfo.city || "",
                  address: gymInfo.address || "",
                  latitude: gymInfo.latitude || 0,
                  longitude: gymInfo.longitude || 0,
                });
              }}
              className="px-8 py-3.5 rounded-xl border border-border text-foreground font-medium hover:bg-secondary transition-colors"
            >
              Ləğv et
            </button>
            <button 
              onClick={handleSave}
              disabled={isPending}
              className="px-8 py-3.5 rounded-xl bg-[#00B4CC] text-white font-medium hover:bg-[#008799] transition-colors disabled:opacity-50 min-w-[200px]"
            >
              {isPending ? "Saxlanılır..." : "Yadda saxla"}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
