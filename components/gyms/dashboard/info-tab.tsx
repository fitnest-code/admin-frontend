"use client";

import { useState, useEffect } from "react";
import { Upload, Trash2, ChevronDown, Pencil, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGymDetailsAdmin, useUpdateGymDetails, useCategories } from "@/lib/query/gym-query";

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
  
  const { data: gymInfo, isLoading } = useGymDetailsAdmin(gymId);
  const { mutate: updateGymInfo, isPending } = useUpdateGymDetails();
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

  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  const [activeSearchField, setActiveSearchField] = useState<"city" | "address" | null>(null);

  const debouncedSearch = (query: string, field: "city" | "address") => {
    setActiveSearchField(field);
    if (searchTimeout) clearTimeout(searchTimeout);
    if (!query || query.length < 3) {
      setSuggestions([]);
      return;
    }
    const timeout = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&addressdetails=1&countrycodes=az`);
        const data = await res.json();
        setSuggestions(data);
      } catch (error) {
        console.error("Geocoding error:", error);
      } finally {
        setIsSearching(false);
      }
    }, 600);
    setSearchTimeout(timeout);
  };

  const handleSelectSuggestion = (s: any) => {
    const lat = parseFloat(s.lat);
    const lng = parseFloat(s.lon);
    let city = formData.city;
    if (s.address) {
        city = s.address.city || s.address.town || s.address.village || city;
    }
    setFormData(prev => ({
        ...prev,
        latitude: lat,
        longitude: lng,
        address: s.display_name,
        city: city
    }));
    setSuggestions([]);
  };

  const initialDataStr = gymInfo ? JSON.stringify({
    categoryId: gymInfo.categoryId || 0,
    name: gymInfo.name || "",
    description: gymInfo.description || "",
    phone: gymInfo.phone || "",
    email: gymInfo.email || "",
    city: gymInfo.city || "",
    address: gymInfo.address || "",
    latitude: gymInfo.latitude || 0,
    longitude: gymInfo.longitude || 0,
  }) : "";

  const hasChanges = isEditing && JSON.stringify(formData) !== initialDataStr;

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
    <div className="w-full rounded-[12px] bg-white border border-[#ececed] flex flex-col items-start p-5 sm:p-[20px_28px] gap-20 text-left text-base text-foreground font-sans">
      
      {/* Zal məlumatları Group */}
      <div className="self-stretch flex flex-col items-start gap-[28px]">
        
      {/* Header & Languages */}
      <div className="self-stretch border-b border-[#ececed] flex items-center justify-between pb-4">
        <div className="flex items-center gap-3">
          <div className="text-[24px] font-bold text-[#101828] font-sans tracking-tight">Zal məlumatları</div>
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
          >
            <Pencil size={20} className={isEditing ? "text-[#00B4CC]" : "text-[#6a7282]"} />
          </button>
        </div>
        
        <div className="flex items-center gap-[34px] text-center">
          {(["Az", "Ru", "En"] as const).map((l) => (
            <button
              key={l}
              onClick={() => setActiveLang(l)}
              className={cn(
                "relative pb-2 text-[16px] font-medium transition-all",
                activeLang === l ? "text-[#00B4CC] after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[3px] after:bg-[#00B4CC]" : "text-[#94979c] hover:text-[#101828]"
              )}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

        {/* Inputs */}
        <div className="self-stretch flex flex-col items-start gap-5">
          
          {/* Kateqoriya */}
          <div className="self-stretch flex flex-col items-start gap-3">
            <div className="self-stretch relative leading-[24px]">Kateqoriya</div>
            <div className={cn(
              "self-stretch h-[60px] rounded-xl border flex items-center justify-between p-[0px_12px] text-lg transition-colors",
              isEditing ? "bg-white border-[#ececed] focus-within:border-[#00B4CC]" : "bg-[#fafafa] border-[#ececed]"
            )}>
              {isEditing ? (
                <select 
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  className="bg-transparent text-foreground outline-none w-full appearance-none h-full"
                >
                  <option value={0} disabled>Seçin</option>
                  {categoriesData?.items?.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              ) : (
                <span className="text-foreground">{gymInfo.categoryName || "Göstərilməyib"}</span>
              )}
              {isEditing && <ChevronDown size={24} className="text-foreground pointer-events-none" />}
            </div>
          </div>

          {/* Zal adı */}
          <div className="flex flex-col items-start gap-3 w-full">
            <div className="self-stretch relative leading-[24px]">Zal adı</div>
            <div className={cn(
              "self-stretch h-[60px] rounded-xl border flex items-center p-[0px_12px] text-lg transition-colors",
              isEditing ? "bg-white border-[#ececed] focus-within:border-[#00B4CC]" : "bg-[#fafafa] border-[#ececed]"
            )}>
              <input 
                type="text" 
                name="name"
                value={formData.name}
                onChange={handleChange}
                readOnly={!isEditing}
                className="bg-transparent text-foreground outline-none w-full h-full"
              />
            </div>
          </div>

          {/* Haqqında */}
          <div className="self-stretch flex flex-col items-start gap-3">
            <div className="self-stretch relative leading-[24px]">Haqqında</div>
            <div className={cn(
              "self-stretch min-h-[100px] rounded-xl border flex flex-col items-start p-[8px_12px] text-lg transition-colors",
              isEditing ? "bg-white border-[#ececed] focus-within:border-[#00B4CC]" : "bg-[#fafafa] border-[#ececed]"
            )}>
              <textarea 
                name="description"
                value={formData.description}
                onChange={handleChange}
                readOnly={!isEditing}
                className="bg-transparent text-foreground outline-none w-full h-full min-h-[84px] resize-none"
              />
            </div>
          </div>

          {/* Zal Şəkilləri Header */}
          <div className="self-stretch border-b border-[#ececed] flex items-center justify-between pb-1 mt-4">
            <div className="relative leading-[30px] font-semibold text-lg sm:text-xl">Zal şəkilləri</div>
          </div>

          {/* Images Section */}
          <div className="w-full flex flex-col items-start gap-6">
            
            {/* Cover Image */}
            <div className="self-stretch flex flex-col items-start gap-3">
              <div className="h-5 flex items-center">
                <div className="relative leading-[24px] text-sm text-[#000]">Cover Şəkil</div>
              </div>
              <div className="w-full sm:w-[444px] h-[252px] relative text-sm text-[#6a7282]">
                <div className="absolute top-[264px] left-0 w-full h-5">
                  <div className="relative tracking-[-0.15px] leading-[20px]">JPG or PNG • Max size 2MB</div>
                </div>
                {gymInfo.coverImageUrl && !isEditing ? (
                  <div className="absolute top-0 left-0 w-full h-full rounded-2xl overflow-hidden border border-[#ececed]">
                    <img src={getImageUrl(gymInfo.coverImageUrl)} className="w-full h-full object-cover" alt="cover" />
                  </div>
                ) : (
                  <div className="absolute top-0 left-0 w-full h-full rounded-2xl border border-dashed border-[#99a1af] text-center text-[#4a5565] flex flex-col items-center justify-center gap-[30px] cursor-pointer hover:bg-slate-50 transition-colors">
                    {gymInfo.coverImageUrl && <img src={getImageUrl(gymInfo.coverImageUrl)} className="w-full h-full object-cover absolute inset-0 opacity-40 rounded-2xl" alt="cover" />}
                    <Upload size={40} className="relative z-10" />
                    <div className="relative tracking-[-0.15px] leading-[20px] font-medium z-10">Upload cover</div>
                  </div>
                )}
              </div>
            </div>

            {/* Digər Şəkillər */}
            <div className="w-full h-5 relative mt-6">
              <div className="absolute top-0 left-0 leading-[24px] text-sm">Digər şəkillər ( {gymInfo.rooms?.length || 0}/9)</div>
            </div>

            <div className="w-full flex items-start flex-wrap content-start gap-4 text-center text-sm text-[#4a5565]">
              {gymInfo.rooms?.map((room, i) => (
                <div key={i} className="h-[224px] w-[180px] relative text-left text-[#717182]">
                  <div className="absolute inset-0 flex flex-col items-start gap-3">
                    <div className="self-stretch h-[180px] rounded-2xl flex items-start justify-end p-3 box-border bg-cover bg-no-repeat bg-top relative overflow-hidden group border border-[#ececed]">
                      {room.imageUrl ? (
                        <img 
                          src={getImageUrl(room.imageUrl)} 
                          className="absolute inset-0 w-full h-full object-cover" 
                          alt="room" 
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-xs">Şəkil yoxdur</div>
                      )}
                      
                      {isEditing && (
                        <div className="relative z-10 overflow-hidden flex items-center gap-[9px] opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="rounded-full bg-white flex items-center p-1 hover:text-[#00B4CC]">
                            <Pencil size={16} />
                          </button>
                          <button className="rounded-full bg-white flex items-center p-1 hover:text-red-500">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="self-stretch h-8 rounded-lg bg-[#f9fafb] border border-[#e5e7eb] flex items-center p-[4px_12px]">
                      <input 
                        type="text" 
                        value={room.name || ""} 
                        readOnly={!isEditing}
                        className="bg-transparent outline-none w-full tracking-[-0.15px] text-[#000]" 
                      />
                    </div>
                  </div>
                </div>
              ))}

              {isEditing && [...Array(Math.max(0, 9 - (gymInfo.rooms?.length || 0)))].map((_, i) => (
                <div key={`empty-${i}`} className="h-[224px] w-[180px] relative text-left text-[#717182]">
                  <div className="absolute inset-0 flex flex-col items-start gap-3">
                    <div className="self-stretch h-[180px] rounded-2xl border border-dashed border-[#d1d5dc] flex items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors">
                      <div className="flex flex-col items-center gap-4">
                        <Upload size={28} />
                        <div className="relative leading-[18px]">Upload</div>
                      </div>
                    </div>
                    <div className="self-stretch h-8 rounded-lg bg-[#f9fafb] border border-[#e5e7eb] flex items-center p-[4px_12px]">
                      <input 
                        type="text" 
                        placeholder="Ad (məs: SPA)" 
                        className="bg-transparent outline-none w-full tracking-[-0.15px] placeholder:text-[#717182]" 
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
          </div>
        </div>
      </div>

      {/* Əlaqə Group */}
      <div className="self-stretch flex flex-col items-start gap-[28px]">
        <div className="self-stretch border-b border-[#ececed] flex items-center justify-between pb-1">
          <div className="relative leading-[30px] font-semibold text-lg sm:text-xl">Əlaqə</div>
        </div>

        <div className="self-stretch flex flex-col items-start gap-5">
          <div className="self-stretch flex flex-col sm:flex-row items-center justify-between gap-5">
            {/* Telefon */}
            <div className="flex-1 w-full flex flex-col items-start gap-3">
              <div className="self-stretch relative leading-[24px]">Telefon nömrəsi</div>
              <div className={cn(
                "self-stretch h-[60px] rounded-xl border flex items-center p-[0px_12px] text-lg transition-colors",
                isEditing ? "bg-white border-[#ececed] focus-within:border-[#00B4CC]" : "bg-[#fafafa] border-[#ececed]"
              )}>
                <input 
                  type="text" 
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  readOnly={!isEditing}
                  className="bg-transparent font-semibold text-foreground outline-none w-full h-full"
                />
              </div>
            </div>
            {/* E-poçt */}
            <div className="flex-1 w-full flex flex-col items-start gap-3">
              <div className="self-stretch relative leading-[24px]">E-Poçt</div>
              <div className={cn(
                "self-stretch h-[60px] rounded-xl border flex items-center p-[0px_12px] text-lg transition-colors",
                isEditing ? "bg-white border-[#ececed] focus-within:border-[#00B4CC]" : "bg-[#fafafa] border-[#ececed]"
              )}>
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  readOnly={!isEditing}
                  className="bg-transparent font-semibold text-foreground outline-none w-full h-full"
                />
              </div>
            </div>
          </div>

          <div className="self-stretch flex flex-col sm:flex-row items-center justify-between gap-5">
            {/* Şəhər (Not explicitly in Figma but exists in your form data) */}
            <div className="flex-1 w-full flex flex-col items-start gap-3 relative">
              <div className="self-stretch relative leading-[24px]">Şəhər</div>
              <div className={cn(
                "self-stretch h-[60px] rounded-xl border flex items-center p-[0px_12px] text-lg transition-colors relative",
                isEditing ? "bg-white border-[#ececed] focus-within:border-[#00B4CC]" : "bg-[#fafafa] border-[#ececed]"
              )}>
                <input 
                  type="text" 
                  name="city"
                  value={formData.city}
                  onChange={(e) => {
                    handleChange(e);
                    if (isEditing) debouncedSearch(e.target.value, "city");
                  }}
                  readOnly={!isEditing}
                  className="bg-transparent text-foreground outline-none w-full h-full"
                  autoComplete="off"
                />
                {isSearching && activeSearchField === "city" && <Loader2 size={20} className="absolute right-4 animate-spin text-[#00B4CC]" />}
              </div>

              {/* Suggestions Dropdown for City */}
              {isEditing && suggestions.length > 0 && activeSearchField === "city" && (
                <div className="absolute top-[90px] left-0 right-0 z-50 bg-white border border-[#ECECED] rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2">
                  {suggestions.map((s, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleSelectSuggestion(s)}
                      className="w-full text-left px-4 py-3 text-sm font-medium hover:bg-slate-50 border-b border-slate-100 last:border-0 transition-colors flex flex-col gap-0.5"
                    >
                      <span className="text-slate-800">{s.display_name.split(',')[0]}</span>
                      <span className="text-xs text-slate-400 truncate">{s.display_name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Ünvan */}
            <div className="flex-1 w-full flex flex-col items-start gap-3 relative">
              <div className="self-stretch relative leading-[24px]">Ünvan</div>
              <div className={cn(
                "self-stretch h-[60px] rounded-xl border flex items-center p-[0px_12px] text-lg transition-colors relative",
                isEditing ? "bg-white border-[#ececed] focus-within:border-[#00B4CC]" : "bg-[#fafafa] border-[#ececed]"
              )}>
                <input 
                  type="text" 
                  name="address"
                  value={formData.address}
                  onChange={(e) => {
                    handleChange(e);
                    if (isEditing) debouncedSearch(e.target.value, "address");
                  }}
                  readOnly={!isEditing}
                  className="bg-transparent text-foreground outline-none w-full h-full"
                  autoComplete="off"
                />
                {isSearching && activeSearchField === "address" && <Loader2 size={20} className="absolute right-4 animate-spin text-[#00B4CC]" />}
              </div>

              {/* Suggestions Dropdown for Address */}
              {isEditing && suggestions.length > 0 && activeSearchField === "address" && (
                <div className="absolute top-[90px] left-0 right-0 z-50 bg-white border border-[#ECECED] rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2">
                  {suggestions.map((s, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleSelectSuggestion(s)}
                      className="w-full text-left px-4 py-3 text-sm font-medium hover:bg-slate-50 border-b border-slate-100 last:border-0 transition-colors flex flex-col gap-0.5"
                    >
                      <span className="text-slate-800">{s.display_name.split(',')[0]}</span>
                      <span className="text-xs text-slate-400 truncate">{s.display_name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Koordinatlar */}
          <div className="self-stretch flex flex-col items-start gap-5 mt-4">
            <div className="self-stretch border-b border-[#ececed] flex items-center justify-between pb-1">
              <div className="relative leading-[30px] font-semibold text-lg sm:text-xl">Koordinatlar</div>
            </div>
            
            <div className="self-stretch flex flex-col sm:flex-row items-center gap-[18px]">
              <div className="flex-1 w-full flex flex-col items-start gap-3">
                <div className="self-stretch relative leading-[24px]">En</div>
                <div className={cn(
                  "self-stretch h-[60px] rounded-xl border flex items-center justify-between p-[0px_12px] text-lg transition-colors",
                  isEditing ? "bg-white border-[#ececed] focus-within:border-[#00B4CC]" : "bg-[#fafafa] border-[#ececed]"
                )}>
                  <input 
                    type="number" 
                    name="latitude"
                    value={formData.latitude}
                    onChange={handleChange}
                    readOnly={!isEditing}
                    step="any"
                    className="bg-transparent text-foreground outline-none w-full h-full"
                  />
                  {!isEditing && <ChevronDown size={16} className="text-foreground opacity-50 pointer-events-none" />}
                </div>
              </div>

              <div className="flex-1 w-full flex flex-col items-start gap-3">
                <div className="self-stretch relative leading-[24px]">Uzunluq</div>
                <div className={cn(
                  "self-stretch h-[60px] rounded-xl border flex items-center justify-between p-[0px_12px] text-lg transition-colors",
                  isEditing ? "bg-white border-[#ececed] focus-within:border-[#00B4CC]" : "bg-[#fafafa] border-[#ececed]"
                )}>
                  <input 
                    type="number" 
                    name="longitude"
                    value={formData.longitude}
                    onChange={handleChange}
                    readOnly={!isEditing}
                    step="any"
                    className="bg-transparent text-foreground outline-none w-full h-full"
                  />
                  {!isEditing && <ChevronDown size={16} className="text-foreground opacity-50 pointer-events-none" />}
                </div>
              </div>
            </div>
          </div>

          {/* Map Placeholder */}
          <div className="self-stretch h-[400px] sm:h-[553px] rounded-2xl overflow-hidden relative border border-[#ececed] bg-slate-100 flex items-center justify-center text-muted-foreground w-full mt-4">
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
      </div>

      {/* Yaradılma tarixi */}
      <div className="self-stretch flex items-start text-base">
        <div className="flex-1 flex flex-col items-start gap-3">
          <div className="self-stretch relative leading-[24px]">Yaradılma tarixi</div>
          <div className="self-stretch h-[60px] rounded-xl bg-[#fafafa] border border-[#ececed] flex items-center p-[0px_12px] text-lg">
            <div className="relative leading-[28px] font-semibold">{gymInfo.createdAt || "---"}</div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {isEditing && (
        <div className="self-stretch flex items-center justify-end mt-10 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => {
                setIsEditing(false);
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
              }}
              className="h-12 px-10 rounded-[10px] border border-[#ececed] bg-white text-[16px] font-medium text-[#101828] hover:bg-slate-50 transition-colors"
            >
              Ləğv et
            </button>
            <button 
              onClick={handleSave}
              disabled={isPending || !hasChanges}
              className={cn(
                "h-12 w-[280px] rounded-[10px] flex items-center justify-center text-[16px] font-semibold text-white transition-all shadow-sm",
                hasChanges ? "bg-[#00B4CC] hover:bg-[#009DB3]" : "bg-[#c1c1cc]"
              )}
            >
              {isPending ? <Loader2 size={20} className="animate-spin" /> : "Yadda saxla"}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
