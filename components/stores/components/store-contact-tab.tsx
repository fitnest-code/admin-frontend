"use client";

import { IStoreStep2Payload } from "@/lib/types/stores";
import * as Label from "@radix-ui/react-label";

interface Step2Props {
  data: IStoreStep2Payload;
  onChange: (data: IStoreStep2Payload) => void;
}

const inputCls =
  "w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-[#00B4CC] focus:ring-2 focus:ring-[#00B4CC]/15 transition placeholder:text-gray-400 bg-white";

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label.Root htmlFor={htmlFor} className="text-sm font-medium text-gray-600">
        {label}
      </Label.Root>
      {children}
    </div>
  );
}

export default function ContactInfoTab({ data, onChange }: Step2Props) {
  
  // Ümumi string dəyərlər üçün (phone, email, socialUrl)
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

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-base font-semibold text-gray-800">Əlaqə və Məkan məlumatları</h2>

      {/* Koordinatlar */}
      <div>
        <span className="text-sm font-medium text-gray-600 block mb-2">Koordinatlar (Xəritə üçün)</span>
        <div className="grid grid-cols-2 gap-3">
          <Field label="En (Latitude)" htmlFor="lat">
            <input
              id="lat"
              type="number" // Number tipinə uyğun
              step="any"
              placeholder="40.4093"
              value={data.latitude}
              onChange={(e) => handleChange("latitude", e.target.valueAsNumber || 0)}
              className={inputCls}
            />
          </Field>
          <Field label="Uzunluq (Longitude)" htmlFor="lng">
            <input
              id="lng"
              type="number"
              step="any"
              placeholder="49.8671"
              value={data.longitude}
              onChange={(e) => handleChange("longitude", e.target.valueAsNumber || 0)}
              className={inputCls}
            />
          </Field>
        </div>
      </div>

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
        <span className="text-sm font-medium text-gray-600 block mb-2">İş saatları</span>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Başlama" htmlFor="openTime">
            <input
              id="openTime"
              type="time"
              value={data.workHours.from} // Interfeysə uyğun .from
              onChange={(e) => handleWorkHours("from", e.target.value)}
              className={inputCls}
            />
          </Field>
          <Field label="Bitmə" htmlFor="closeTime">
            <input
              id="closeTime"
              type="time"
              value={data.workHours.to} // Interfeysə uyğun .to
              onChange={(e) => handleWorkHours("to", e.target.value)}
              className={inputCls}
            />
          </Field>
        </div>
      </div>
    </div>
  );
}