"use client";

import dynamic from "next/dynamic";

interface LocationPickerMapProps {
  lat: number;
  lng: number;
  onLocationSelect?: (lat: number, lng: number) => void;
  height?: string;
  disabled?: boolean;
}

/**
 * Exported component — dynamically imported with SSR disabled.
 * This is the component you import in your forms.
 */
const LocationPickerMap = dynamic(
  () => import("./location-picker-map-inner"),
  {
    ssr: false,
    loading: () => (
      <div
        className="flex items-center justify-center bg-gray-50 rounded-xl border border-[#ececed] animate-pulse"
        style={{ height: "350px", width: "100%" }}
      >
        <span className="text-sm text-gray-400">Xəritə yüklənir...</span>
      </div>
    ),
  }
);

export default LocationPickerMap;
export { LocationPickerMap };
