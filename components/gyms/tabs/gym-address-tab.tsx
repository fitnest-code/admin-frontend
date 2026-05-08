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

  // 1. Koordinat dəyişdikcə ünvanı gətirən query
  const { data: addressData, isFetching: isAddressFetching } = useGetAddressByCoords(
    coords.lat, 
    coords.lng, 
    mounted
  );

  // 2. Step 4 Mutation
  const { mutateAsync: submitStep4, isPending } = useAddGymLocation();

  useEffect(() => {
    setMounted(true);
  }, []);

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

  const handleSaveOnly = async () => {
    const success = await performSave();
    if (success) toast.success("Məkan məlumatları uğurla yadda saxlanıldı");
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

        {/* Ünvan (Backend-dən gələn data) */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-[#6B7280]">{t.address}</label>
          <div className="relative">
            <input
              readOnly
              value={isAddressFetching ? "Ünvan axtarılır..." : addressData?.address || "Koordinat daxil edin və ya xəritəni yeniləyin"}
              className="w-full bg-[#F9FAFB] border border-[#ECECED] rounded-xl px-4 py-4 text-sm font-semibold text-[#1F2937] outline-none"
            />
            {isAddressFetching && <Loader2 className="absolute right-4 top-4 animate-spin text-[#00B4D8]" size={20} />}
          </div>
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

        {/* Action Buttons */}
        <div className="flex gap-4 pt-2">
          <button 
            type="button"
            disabled={isPending}
            onClick={handleSaveOnly}
            className="flex-1 py-4 rounded-xl border-2 border-[#ECECED] text-sm font-bold text-[#4B5563] hover:bg-gray-50 transition disabled:opacity-50"
          >
            {isPending ? <Loader2 className="animate-spin mx-auto" size={20} /> : t.save}
          </button>
          
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