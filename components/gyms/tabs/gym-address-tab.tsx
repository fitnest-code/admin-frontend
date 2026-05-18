"use client";

import { useState, useEffect } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import { Copy, Loader2, Check } from "lucide-react";
import { toast } from "sonner";
import { useGymStore } from "@/lib/store/gym-store";
import { useAddGymLocation, useGetAddressByCoords } from "@/lib/query/location-query";



type Lang = "Az" | "Ru" | "En";

const labels: Record<Lang, any> = {
  Az: { title: "Ünvan məlumatları", address: "Ünvan", coords: "Koordinatlar", lat: "En", lng: "Uzunluq", save: "Yadda saxla", next: "Növbəti" },
  Ru: { title: "Адрес", address: "Адрес", coords: "Координаты", lat: "Широта", lng: "Долгота", save: "Сохранить", next: "Далее" },
  En: { title: "Address Details", address: "Address", coords: "Coordinates", lat: "Latitude", lng: "Longitude", save: "Save", next: "Next" },
};

export default function AddressTab({ onNext }: { onNext?: () => void }) {
  const [mounted, setMounted] = useState(false);
  const [lang, setLang] = useState<Lang>("Az");
  const { gymId } = useGymStore();
  
  // Koordinatlar
  const [coords, setCoords] = useState({ lat: 40.4093, lng: 49.8671 });
  const [copied, setCopied] = useState<"lat" | "lng" | null>(null);

  // Local inputs state for smooth typing
  const [inputLat, setInputLat] = useState("40.4093");
  const [inputLng, setInputLng] = useState("49.8671");
  const [isUpdatingFromCoords, setIsUpdatingFromCoords] = useState(false);

  // Axtarış üçün state-lər
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  // 1. Koordinat dəyişdikcə ünvanı gətirən query
  const { data: addressData, isFetching: isAddressFetching } = useGetAddressByCoords(
    coords.lat, 
    coords.lng, 
    mounted && isUpdatingFromCoords
  );

  // 2. Step 4 Mutation
  const { mutateAsync: submitStep4, isPending } = useAddGymLocation();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync inputs when coords change (e.g., from address selection or maps click)
  useEffect(() => {
    if (!isUpdatingFromCoords) {
      setInputLat(coords.lat.toString());
      setInputLng(coords.lng.toString());
    }
  }, [coords, isUpdatingFromCoords]);

  // Debounce coordinate changes from manual typing
  useEffect(() => {
    if (!isUpdatingFromCoords) return;
    const lat = parseFloat(inputLat);
    const lng = parseFloat(inputLng);
    if (!isNaN(lat) && !isNaN(lng)) {
      const timeout = setTimeout(() => {
        setCoords({ lat, lng });
      }, 800);
      return () => clearTimeout(timeout);
    }
  }, [inputLat, inputLng, isUpdatingFromCoords]);

  // Backend-dən gələn ünvanı input-a sinxronizasiya et
  useEffect(() => {
    if (addressData?.addressText && !isSearching && isUpdatingFromCoords) {
      setSearchQuery(addressData.addressText);
      setIsUpdatingFromCoords(false); // Reset
    }
  }, [addressData, isSearching, isUpdatingFromCoords]);

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
        const res = await fetch(`/api/v1/admin/gyms/geocoding/forward?query=${encodeURIComponent(query)}`);
        const data = await res.json();
        setSuggestions(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Geocoding error:", error);
      } finally {
        setIsSearching(false);
      }
    }, 600);
    setSearchTimeout(timeout);
  };

  const handleSelectSuggestion = (s: any) => {
    const lat = typeof s.latitude === "number" ? s.latitude : parseFloat(s.lat || 0);
    const lng = typeof s.longitude === "number" ? s.longitude : parseFloat(s.lon || 0);
    
    setIsUpdatingFromCoords(false); // Disable reverse geocoding!
    setCoords({ lat, lng });
    setInputLat(lat.toString());
    setInputLng(lng.toString());

    const suggestedText = s.addressText || s.display_name || "";
    
    // Extract custom typed numbers/house indicators missing from the map result
    const matchNumber = searchQuery.match(/\b\d+(?:\/[a-zA-Z0-9]+|-[a-zA-Z0-9]+|[a-zA-Z])?\b/);
    let finalAddress = suggestedText;
    
    if (matchNumber && !suggestedText.includes(matchNumber[0])) {
      const parts = suggestedText.split(',');
      parts[0] = `${parts[0].trim()} ${matchNumber[0]}`;
      finalAddress = parts.join(', ');
    }

    setSearchQuery(finalAddress);
    setSuggestions([]);
  };

  const t = labels[lang];

  // Kopyalama funksiyası
  const copyToClipboard = (val: number, which: "lat" | "lng") => {
    navigator.clipboard.writeText(val.toString());
    setCopied(which);
    setTimeout(() => setCopied(null), 1500);
    toast.success("Kopyalandı");
  };

  // Əsas Saxlama Məntiqi (500 xətası olmaması üçün Number-ə çevrilir)
  const performSave = async () => {
    if (!gymId) {
      toast.error("Zal ID tapılmadı (Store-u yoxlayın)");
      return false;
    }

    try {
      await submitStep4({
        gymId: Number(gymId),
        latitude: Number(coords.lat), 
        longitude: Number(coords.lng)
      });
      return true;
    } catch (error: any) {
      // Sənin ApiError class-ın mesajı buraya ötürəcək
      toast.error(error.message || "Xəta baş verdi");
      return false;
    }
  };

  const handleNext = async () => {
    const success = await performSave();
    if (success) {
      toast.success("Məkan qeydə alındı, növbəti mərhələyə keçilir");
      onNext?.();
    }
  };

  if (!mounted) return null;

  // Google Maps Embed (Pulsuz və stabil variant)
  const mapSrc = `https://maps.google.com/maps?q=${coords.lat},${coords.lng}&z=15&output=embed`;

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

        {/* Koordinat Girişləri */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-[#6B7280]">{t.lat}</label>
            <div className="flex items-center bg-[#F9FAFB] border border-[#ECECED] rounded-xl px-4 py-4 gap-2 focus-within:ring-1 focus-within:ring-[#00B4D8]">
              <input
                type="number"
                step="any"
                value={inputLat}
                onChange={(e) => {
                  setInputLat(e.target.value);
                  setIsUpdatingFromCoords(true);
                }}
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
                value={inputLng}
                onChange={(e) => {
                  setInputLng(e.target.value);
                  setIsUpdatingFromCoords(true);
                }}
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