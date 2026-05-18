"use client";

import { useState, useEffect } from "react";
import { IStoreStep2Payload } from "@/lib/types/stores";
import * as Label from "@radix-ui/react-label";
import { Copy, Loader2, Check } from "lucide-react";
import { useGetAddressByCoords } from "@/lib/query/location-query";

interface Step2Props {
  data: IStoreStep2Payload;
  onChange: (data: IStoreStep2Payload) => void;
}

const inputCls =
  "w-full h-[44px] rounded-lg border border-[#ececed] px-4 text-[14px] text-gray-800 outline-none focus:border-[#00B4CC] focus:ring-2 focus:ring-[#00B4CC]/15 transition placeholder:text-gray-400 bg-[#fafafa] font-medium";

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label.Root htmlFor={htmlFor} className="text-[13px] font-semibold text-black/60">
        {label}
      </Label.Root>
      {children}
    </div>
  );
}

export default function ContactInfoTab({ data, onChange }: Step2Props) {
  const [copied, setCopied] = useState<"lat" | "lng" | null>(null);

  // Axtarış üçün state-lər
  const [searchQuery, setSearchQuery] = useState(data.address || "");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  // Local inputs state for coordinates
  const [inputLat, setInputLat] = useState((data.latitude || 40.4093).toString());
  const [inputLng, setInputLng] = useState((data.longitude || 49.8671).toString());
  const [isUpdatingFromCoords, setIsUpdatingFromCoords] = useState(false);

  // 1. Reverse Geocoding when coordinates are typed manually
  const { data: addressData } = useGetAddressByCoords(
    data.latitude || 0,
    data.longitude || 0,
    isUpdatingFromCoords
  );

  // Sync inputs when data.latitude/longitude changes (e.g. from suggestion select)
  useEffect(() => {
    if (!isUpdatingFromCoords) {
      setInputLat((data.latitude || 40.4093).toString());
      setInputLng((data.longitude || 49.8671).toString());
    }
  }, [data.latitude, data.longitude, isUpdatingFromCoords]);

  // Debounce coordinate changes from manual typing
  useEffect(() => {
    if (!isUpdatingFromCoords) return;
    const lat = parseFloat(inputLat);
    const lng = parseFloat(inputLng);
    if (!isNaN(lat) && !isNaN(lng)) {
      const timeout = setTimeout(() => {
        onChange({ ...data, latitude: lat, longitude: lng });
      }, 800);
      return () => clearTimeout(timeout);
    }
  }, [inputLat, inputLng, isUpdatingFromCoords]);

  // Sync reverse geocoding result to address field
  useEffect(() => {
    if (isUpdatingFromCoords && addressData?.addressText) {
      setSearchQuery(addressData.addressText);
      onChange({
        ...data,
        address: addressData.addressText
      });
      setIsUpdatingFromCoords(false); // Reset
    }
  }, [addressData, isUpdatingFromCoords]);

  // Ümumi string dəyərlər üçün (phone, email, socialUrl, address)
  const handleChange = (key: keyof IStoreStep2Payload, value: any) => {
    onChange({ ...data, [key]: value });
  };

  // İş saatları obyektini yeniləmək üçün xüsusi funksiya
  const handleWorkHours = (key: "from" | "to", value: string) => {
    onChange({
      ...data,
      workHours: {
        ...data.workHours,
        [key]: value,
      },
    });
  };

  // Forward Geocoding via dedicated backend proxy
  const debouncedSearch = (query: string) => {
    if (searchTimeout) clearTimeout(searchTimeout);
    if (!query || query.length < 3) {
      setSuggestions([]);
      return;
    }

    const timeout = setTimeout(async () => {
      setIsSearching(true);
      try {
        // Query the administrative backend forward geocoding proxy
        const res = await fetch(`/api/v1/admin/gyms/geocoding/forward?query=${encodeURIComponent(query)}`);
        const resultData = await res.json();
        setSuggestions(Array.isArray(resultData) ? resultData : []);
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

    const suggestedText = s.addressText || s.display_name || "";
    
    // Extract custom typed numbers/house indicators missing from the map result
    const matchNumber = searchQuery.match(/\b\d+(?:\/[a-zA-Z0-9]+|-[a-zA-Z0-9]+|[a-zA-Z])?\b/);
    
    let finalAddressText = suggestedText;
    if (matchNumber && !suggestedText.includes(matchNumber[0])) {
      // Smartly insert the house number right after the street name
      const parts = suggestedText.split(',');
      parts[0] = `${parts[0].trim()} ${matchNumber[0]}`;
      finalAddressText = parts.join(', ');
    }
    
    setIsUpdatingFromCoords(false);
    setSearchQuery(finalAddressText);
    onChange({
      ...data,
      latitude: lat,
      longitude: lng,
      address: finalAddressText
    });
    setInputLat(lat.toString());
    setInputLng(lng.toString());
    setSuggestions([]);
  };

  // Kopyalama funksiyası
  const copyToClipboard = (val: number, which: "lat" | "lng") => {
    if (!val) return;
    navigator.clipboard.writeText(val.toString());
    setCopied(which);
    setTimeout(() => setCopied(null), 1500);
  };

  const displayLat = data.latitude || 40.4093;
  const displayLng = data.longitude || 49.8671;
  const mapSrc = `https://maps.google.com/maps?q=${displayLat},${displayLng}&z=15&output=embed`;

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <h2 className="text-[18px] font-semibold text-gray-800 border-b border-[#ececed] pb-2">
        Məkan və Ünvan məlumatları
      </h2>

      {/* Ünvan (Axtarış və Seçim) */}
      <div className="flex flex-col gap-1.5 relative">
        <label className="text-[13px] font-semibold text-black/60">Ünvan axtarışı (Xəritə üçün)</label>
        <div className="relative">
          <input
            placeholder="Ünvanı daxil edin (Məs: Heydər Əliyev pr. 101)"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              handleChange("address", e.target.value);
              debouncedSearch(e.target.value);
            }}
            className="w-full h-[44px] bg-[#fafafa] border border-[#ECECED] rounded-lg px-4 text-[14px] font-semibold text-[#1F2937] outline-none focus:border-[#00B4CC] transition-all"
          />
          {isSearching && (
            <Loader2 className="absolute right-4 top-3.5 animate-spin text-[#00B4CC]" size={20} />
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
                  <span className="text-slate-800 font-semibold">{shortText}</span>
                  <span className="text-xs text-slate-400 truncate">{text}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Koordinat Girişləri */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-semibold text-black/60">En (Latitude)</label>
          <div className="flex items-center bg-[#fafafa] border border-[#ECECED] rounded-lg px-4 h-[44px] gap-2 focus-within:ring-1 focus-within:ring-[#00B4CC]">
            <input
              type="number"
              step="any"
              value={inputLat}
              onChange={(e) => {
                setInputLat(e.target.value);
                setIsUpdatingFromCoords(true);
              }}
              className="flex-1 bg-transparent text-sm font-semibold text-[#1F2937] outline-none"
              placeholder="40.4093"
            />
            <button onClick={() => copyToClipboard(data.latitude, "lat")} type="button">
              {copied === "lat" ? <Check size={18} className="text-[#00B4CC]" /> : <Copy size={18} className="text-[#D1D5DB]" />}
            </button>
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-semibold text-black/60">Uzunluq (Longitude)</label>
          <div className="flex items-center bg-[#fafafa] border border-[#ECECED] rounded-lg px-4 h-[44px] gap-2 focus-within:ring-1 focus-within:ring-[#00B4CC]">
            <input
              type="number"
              step="any"
              value={inputLng}
              onChange={(e) => {
                setInputLng(e.target.value);
                setIsUpdatingFromCoords(true);
              }}
              className="flex-1 bg-transparent text-sm font-semibold text-[#1F2937] outline-none"
              placeholder="49.8671"
            />
            <button onClick={() => copyToClipboard(data.longitude, "lng")} type="button">
              {copied === "lng" ? <Check size={18} className="text-[#00B4CC]" /> : <Copy size={18} className="text-[#D1D5DB]" />}
            </button>
          </div>
        </div>
      </div>

      {/* Xəritə Sahəsi */}
      <div className="rounded-2xl overflow-hidden border border-[#ECECED] h-[350px] bg-gray-50">
        <iframe
          key={`${data.latitude}-${data.longitude}`}
          src={mapSrc}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>

      <h2 className="text-[18px] font-semibold text-gray-800 border-b border-[#ececed] pb-2 mt-2">
        Əlaqə və İş Saatları
      </h2>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Telefon nömrəsi" htmlFor="phone">
          <input
            id="phone"
            type="tel"
            placeholder="+994501234567"
            value={data.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
            className={inputCls}
          />
        </Field>
        <Field label="E-Poçt" htmlFor="email">
          <input
            id="email"
            type="email"
            placeholder="market@example.com"
            value={data.email}
            onChange={(e) => handleChange("email", e.target.value)}
            className={inputCls}
          />
        </Field>
      </div>

      <Field label="Sosial Media və ya Sayt (URL)" htmlFor="socialUrl">
        <input
          id="socialUrl"
          type="url"
          placeholder="https://instagram.com/mağaza"
          value={data.socialUrl}
          onChange={(e) => handleChange("socialUrl", e.target.value)}
          className={inputCls}
        />
      </Field>

      {/* İş saatları */}
      <div>
        <span className="text-[13px] font-semibold text-black/60 block mb-1.5">İş saatları</span>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Başlama" htmlFor="openTime">
            <input
              id="openTime"
              type="time"
              value={data.workHours.from}
              onChange={(e) => handleWorkHours("from", e.target.value)}
              className={inputCls}
            />
          </Field>
          <Field label="Bitmə" htmlFor="closeTime">
            <input
              id="closeTime"
              type="time"
              value={data.workHours.to}
              onChange={(e) => handleWorkHours("to", e.target.value)}
              className={inputCls}
            />
          </Field>
        </div>
      </div>
    </div>
  );
}