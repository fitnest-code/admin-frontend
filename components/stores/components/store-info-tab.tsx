"use client";

import { useRef } from "react";
import * as Label from "@radix-ui/react-label";

export interface StoreInfo {
  name: string;
  image: File | null;
  imagePreview: string | null;
}

interface Step1Props {
  data: StoreInfo;
  onChange: (data: StoreInfo) => void;
}

const inputCls =
  "w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-[#00B4CC] focus:ring-2 focus:ring-[#00B4CC]/15 transition placeholder:text-gray-400 bg-white";

export default function StoreInfoTab({ data, onChange }: Step1Props) {
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File | null) {
    if (!file) return;
    const url = URL.createObjectURL(file);
    onChange({ ...data, image: file, imagePreview: url });
  }

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-base font-semibold text-gray-800">Mağaza məlumatları</h2>

      {/* Store name */}
      <div className="flex flex-col gap-1.5">
        <Label.Root htmlFor="store-name" className="text-sm font-medium text-gray-600">
          Mağaza adı
        </Label.Root>
        <input
          id="store-name"
          type="text"
          placeholder="Mağazanızın adını daxil edin"
          value={data.name}
          onChange={(e) => onChange({ ...data, name: e.target.value })}
          className={inputCls}
        />
      </div>

      {/* Image upload */}
      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-gray-600">Mağaza şəkilləri</span>

        {data.imagePreview ? (
          <div className="flex gap-6 items-start">
            <img
              src={data.imagePreview}
              alt="Mağaza şəkli"
              className="w-44 h-36 rounded-xl object-cover border border-gray-200"
            />
            <div className="flex flex-col gap-3 mt-2">
              <button
                onClick={() => fileRef.current?.click()}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#00B4CC] transition"
              >
                <UploadIcon />
                Şəkil yüklə
              </button>
              <button
                onClick={() => fileRef.current?.click()}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#00B4CC] transition"
              >
                <EditIcon />
                Şəkli dəyiş
              </button>
              <button
                onClick={() => onChange({ ...data, image: null, imagePreview: null })}
                className="flex items-center gap-2 text-sm text-red-500 hover:text-red-700 transition"
              >
                <TrashIcon />
                Şəkli sil
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => fileRef.current?.click()}
            className="flex flex-col items-center justify-center gap-2 w-44 h-36 rounded-xl border-2 border-dashed border-gray-200 text-gray-400 hover:border-[#00B4CC] hover:text-[#00B4CC] transition bg-gray-50"
          >
            <UploadIcon size={24} />
            <span className="text-xs">Şəkil yüklə</span>
          </button>
        )}

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
        />
      </div>
    </div>
  );
}

function UploadIcon({ size = 16 }: { size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
    </svg>
  );
}