"use client";

import { useState, useEffect } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import { Copy, Loader2, Check } from "lucide-react";
import { toast } from "sonner";
import { useGymStore } from "@/lib/store/gym-store";
import { useValidateGymStep4 } from "@/lib/query/gym-query";
import { useGetAddressByCoords } from "@/lib/query/location-query";


type Lang = "Az" | "Ru" | "En";

const labels: Record<Lang, any> = {
  Az: { title: "Ünvan məlumatları", address: "Ünvan", coords: "Koordinatlar", lat: "En", lng: "Uzunluq", save: "Yadda saxla", next: "Növbəti" },
  Ru: { title: "Адрес", address: "Адрес", coords: "Координаты", lat: "Широта", lng: "Долгота", save: "Сохранить", next: "Далее" },
  En: { title: "Address Details", address: "Address", coords: "Coordinates", lat: "Latitude", lng: "Longitude", save: "Save", next: "Next" },
};

export function StepAddress({ onNext }: { onNext?: () => void }) {
  const { step4Data, setStep4Data } = useGymStore();
  const [mounted, setMounted] = useState(false);
  const [lang, setLang] = useState<Lang>("Az");

  // Koordinatlar (Başlanğıcda boş olmalıdır)
  const [coords, setCoords] = useState<{ lat: number | "", lng: number | "" }>({ 
    lat: step4Data?.lat ?? "", 
    lng: step4Data?.lng ?? "" 
  });
  const [copied, setCopied] = useState<"lat" | "lng" | null>(null);

  // Axtarış üçün state-lər
  const [searchQuery, setSearchQuery] = useState(step4Data?.address || "");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  // 1. Koordinat dəyişdikcə ünvanı gətirən query (Yalnız koordinatlar olduqda)
  const shouldFetchAddress = mounted && typeof coords.lat === "number" && typeof coords.lng === "number";
  const { data: addressData, isFetching: isAddressFetching } = useGetAddressByCoords(
    typeof coords.lat === "number" ? coords.lat : 0,
    typeof coords.lng === "number" ? coords.lng : 0,
    shouldFetchAddress
  );

  // 2. Step 4 Validation
  const validateStep4 = useValidateGymStep4();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Backend-dən gələn ünvanı input-a sinxronizasiya et
  useEffect(() => {
    if (addressData?.addressText && !isSearching && shouldFetchAddress && !step4Data) {
      setSearchQuery(addressData.addressText);
    }
  }, [addressData, isSearching, shouldFetchAddress, step4Data]);

  // Forward Geocoding (Axtarış)
  const debouncedSearch = (query: string) => {
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
    setCoords({ lat, lng });
    setSearchQuery(s.display_name);
    setSuggestions([]);
  };

  const t = labels[lang];

  // Kopyalama funksiyası
  const copyToClipboard = (val: number | "", which: "lat" | "lng") => {
    if (val === "") return;
    navigator.clipboard.writeText(val.toString());
    setCopied(which);
    setTimeout(() => setCopied(null), 1500);
  };

  const handleNext = async () => {
    if (coords.lat === "" || coords.lng === "") {
      toast.error("Zəhmət olmasa xəritədən mütləq bir nöqtə seçin və ya koordinatları daxil edin");
      return;
    }

    try {
      const payload = {
        cityId: 1, // Default Baku for now
        address: searchQuery,
        latitude: Number(coords.lat),
        longitude: Number(coords.lng)
      };
      await validateStep4.mutateAsync(payload);
      setStep4Data({
        cityId: 1,
        address: searchQuery,
        lat: Number(coords.lat),
        lng: Number(coords.lng)
      });
      onNext?.();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error.message || "Xəta baş verdi");
    }
  };

  const isPending = validateStep4.isPending;

  if (!mounted) return null;

  // Xəritə linki: Əgər boşdursa Bakı mərkəzini göstərsin, amma datanı boş saxlasın
  const displayLat = coords.lat === "" ? 40.4093 : coords.lat;
  const displayLng = coords.lng === "" ? 49.8671 : coords.lng;
  const mapSrc = `https://maps.google.com/maps?q=${displayLat},${displayLng}&z=15&output=embed`;

  return (
    <div className="w-full flex justify-center py-6">
      <div className="bg-white rounded-2xl border border-[#ECECED] w-full max-w-[783px] p-7 flex flex-col gap-6 shadow-sm">

        {/* Dil Seçimi və Başlıq */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-[#1F2937]">{t.title}</h1>
          <Tabs.Root value={lang} onValueChange={(v) => setLang(v as Lang)}>
            <Tabs.List className="flex gap-2 bg-[#F3F4F6] rounded-lg p-1">
              {["Az", "Ru", "En"].map((l) => (
                <Tabs.Trigger
                  key={l}
                  value={l}
                  className="px-4 py-1.5 rounded-md text-sm font-bold transition-all
                    data-[state=active]:bg-white data-[state=active]:text-[#00B4D8]
                    data-[state=active]:shadow-sm outline-none"
                >
                  {l}
                </Tabs.Trigger>
              ))}
            </Tabs.List>
          </Tabs.Root>
        </div>

        {/* Ünvan (Axtarış və Seçim) */}
        <div className="flex flex-col gap-2 relative">
          <label className="text-sm font-medium text-[#6B7280]">{t.address}</label>
          <div className="relative">
            <input
              placeholder="Ünvanı daxil edin (Məs: Heydər Əliyev pr. 101)"
              value={isAddressFetching ? "Ünvan təyin edilir..." : searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                debouncedSearch(e.target.value);
              }}
              className="w-full bg-[#F9FAFB] border border-[#ECECED] rounded-xl px-4 py-4 text-sm font-semibold text-[#1F2937] outline-none focus:border-[#00B4D8] transition-all"
            />
            {(isAddressFetching || isSearching) && (
              <Loader2 className="absolute right-4 top-4 animate-spin text-[#00B4D8]" size={20} />
            )}
          </div>

          {/* Suggestions Dropdown */}
          {suggestions.length > 0 && (
            <div className="absolute top-[100%] left-0 right-0 z-50 mt-1 bg-white border border-[#ECECED] rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSelectSuggestion(s)}
                  className="w-full text-left px-4 py-3 text-sm font-medium hover:bg-slate-50 border-b border-slate-50 last:border-0 transition-colors flex flex-col gap-0.5"
                >
                  <span className="text-slate-800">{s.display_name.split(',')[0]}</span>
                  <span className="text-xs text-slate-400 truncate">{s.display_name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Koordinat Girişləri */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-[#6B7280]">{t.lat}</label>
            <div className="flex items-center bg-[#F9FAFB] border border-[#ECECED] rounded-xl px-4 py-4 gap-2 focus-within:ring-1 focus-within:ring-[#00B4D8]">
              <input
                type="number"
                step="any"
                value={coords.lat}
                onChange={(e) => setCoords(p => ({ ...p, lat: parseFloat(e.target.value) || 0 }))}
                className="flex-1 bg-transparent text-sm font-semibold text-[#1F2937] outline-none"
              />
              <button onClick={() => copyToClipboard(coords.lat, "lat")} type="button">
                {copied === "lat" ? <Check size={18} className="text-[#00B4D8]" /> : <Copy size={18} className="text-[#D1D5DB]" />}
              </button>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-[#6B7280]">{t.lng}</label>
            <div className="flex items-center bg-[#F9FAFB] border border-[#ECECED] rounded-xl px-4 py-4 gap-2 focus-within:ring-1 focus-within:ring-[#00B4D8]">
              <input
                type="number"
                step="any"
                value={coords.lng}
                onChange={(e) => setCoords(p => ({ ...p, lng: parseFloat(e.target.value) || 0 }))}
                className="flex-1 bg-transparent text-sm font-semibold text-[#1F2937] outline-none"
              />
              <button onClick={() => copyToClipboard(coords.lng, "lng")} type="button">
                {copied === "lng" ? <Check size={18} className="text-[#00B4D8]" /> : <Copy size={18} className="text-[#D1D5DB]" />}
              </button>
            </div>
          </div>
        </div>

        {/* Xəritə Sahəsi */}
        <div className="rounded-xl overflow-hidden border border-[#ECECED] h-[350px] bg-gray-50">
          <iframe
            key={`${coords.lat}-${coords.lng}`}
            src={mapSrc}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>

        <div className="flex gap-4 pt-2">
          <button
            type="button"
            disabled={isPending}
            onClick={handleNext}
            className="flex-1 py-4 rounded-xl bg-[#00B4D8] text-white text-sm font-bold hover:bg-[#0096B4] flex items-center justify-center transition shadow-lg shadow-cyan-100 disabled:opacity-70"
          >
            {isPending ? <Loader2 className="animate-spin" size={20} /> : t.next}
          </button>
        </div>

      </div>
    </div>
  );
}