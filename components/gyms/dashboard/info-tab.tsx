"use client";

import { useState } from "react";
import { Upload, Trash2, ChevronDown, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";

export function InfoTab() {
  const [activeLang, setActiveLang] = useState<"Az" | "Ru" | "En">("Az");
  
  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="rounded-2xl border border-border bg-white p-8 shadow-sm flex flex-col gap-10">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-2">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-[#101828]">Zal məlumatları</h3>
            <button className="text-muted-foreground hover:text-foreground">
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
            <div className="flex items-center justify-between rounded-xl bg-[#FAFAFA] border border-[#ECECED] px-4 py-3.5 cursor-pointer">
              <span className="text-[15px] text-[#101828]">Kateqoriya</span>
              <ChevronDown size={20} className="text-muted-foreground" />
            </div>
          </div>

          {/* Zal adı */}
          <div className="flex flex-col gap-2">
            <label className="text-[15px] text-[#101828]">Zal adı</label>
            <div className="flex items-center rounded-xl bg-[#FAFAFA] border border-[#ECECED] px-4 py-3.5">
              <input 
                type="text" 
                defaultValue="Zal adı"
                className="bg-transparent text-[15px] text-[#101828] outline-none w-full"
              />
            </div>
          </div>

          {/* Haqqında */}
          <div className="flex flex-col gap-2">
            <label className="text-[15px] text-[#101828]">Haqqında</label>
            <div className="rounded-xl bg-[#FAFAFA] border border-[#ECECED] px-4 py-3.5 min-h-[120px]">
              <textarea 
                defaultValue="Haqqında"
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
              <div className="w-full max-w-[444px] h-[252px] rounded-2xl border border-dashed border-[#99A1AF] flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-slate-50 transition-colors">
                <Upload size={32} className="text-[#4A5565]" />
                <span className="text-[15px] font-medium text-[#4A5565]">Upload cover</span>
              </div>
              <span className="text-sm text-[#6A7282]">JPG or PNG • Max size 2MB</span>
            </div>

            {/* Digər şəkillər */}
            <div className="flex flex-col gap-4">
              <label className="text-[15px] text-[#101828]">Digər şəkillər ( 0/9)</label>
              <div className="flex flex-wrap gap-4">
                
                {/* Image item example */}
                <div className="flex flex-col gap-3 w-[180px]">
                  <div className="w-full h-[180px] rounded-2xl bg-secondary border border-border relative overflow-hidden group">
                    <img 
                      src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=400" 
                      className="w-full h-full object-cover" 
                      alt="gym" 
                    />
                    <div className="absolute top-3 right-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="h-7 w-7 rounded-full bg-white flex items-center justify-center text-slate-700 shadow-sm hover:text-[#00B4CC]">
                        <Pencil size={13} />
                      </button>
                      <button className="h-7 w-7 rounded-full bg-white flex items-center justify-center text-slate-700 shadow-sm hover:text-red-500">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                  <input 
                    type="text" 
                    defaultValue="Ad (məs: SPA)" 
                    className="w-full text-sm bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg px-3 py-2 outline-none text-[#101828]" 
                  />
                </div>

                {/* Empty slots */}
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="flex flex-col gap-3 w-[180px]">
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
              <div className="flex items-center rounded-xl bg-[#FAFAFA] border border-[#ECECED] px-4 py-3.5">
                <input 
                  type="text" 
                  defaultValue="+994 00 000 00 00"
                  className="bg-transparent text-[15px] font-semibold text-[#101828] outline-none w-full"
                />
              </div>
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-[15px] text-[#101828]">E-Poçt</label>
              <div className="flex items-center rounded-xl bg-[#FAFAFA] border border-[#ECECED] px-4 py-3.5">
                <input 
                  type="email" 
                  defaultValue="asss@gmail.com"
                  className="bg-transparent text-[15px] font-semibold text-[#101828] outline-none w-full"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[15px] text-[#101828]">Ünvan</label>
            <div className="flex items-center rounded-xl bg-[#FAFAFA] border border-[#ECECED] px-4 py-3.5">
              <input 
                type="text" 
                defaultValue="Bakı, Nərimanov rayonu"
                className="bg-transparent text-[15px] text-[#101828] outline-none w-full"
              />
            </div>
          </div>
        </div>

        {/* Koordinatlar */}
        <div className="flex flex-col gap-6 border-t border-border pt-8">
          <h3 className="text-lg font-semibold text-[#101828]">Koordinatlar</h3>
          
          <div className="grid grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-[15px] text-[#101828]">En</label>
              <div className="flex items-center justify-between rounded-xl bg-[#FAFAFA] border border-[#ECECED] px-4 py-3.5">
                <input 
                  type="text" 
                  defaultValue="40.9999"
                  className="bg-transparent text-[15px] text-[#101828] outline-none w-full"
                />
                <Pencil size={16} className="text-muted-foreground cursor-pointer" />
              </div>
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-[15px] text-[#101828]">Uzunluq</label>
              <div className="flex items-center justify-between rounded-xl bg-[#FAFAFA] border border-[#ECECED] px-4 py-3.5">
                <input 
                  type="text" 
                  defaultValue="49.8671"
                  className="bg-transparent text-[15px] text-[#101828] outline-none w-full"
                />
                <Pencil size={16} className="text-muted-foreground cursor-pointer" />
              </div>
            </div>
          </div>

          {/* Map Placeholder */}
          <div className="w-full h-[400px] sm:h-[553px] rounded-2xl overflow-hidden relative border border-border">
            <iframe 
               src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d194472.76853036997!2d49.71487405105952!3d40.39473651167735!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x40307d6bd6211cf9%3A0x343f6b5e7ae56c6b!2sBaku%2C%20Azerbaijan!5e0!3m2!1sen!2s!4v1715340120155!5m2!1sen!2s" 
               width="100%" 
               height="100%" 
               style={{ border: 0 }} 
               allowFullScreen 
               loading="lazy" 
               referrerPolicy="no-referrer-when-downgrade"
               className="grayscale-[0.2]"
            />
          </div>
        </div>

        {/* Yaradılma tarixi */}
        <div className="flex flex-col gap-2 border-t border-border pt-8">
          <label className="text-[15px] text-[#101828]">Yaradılma tarixi</label>
          <div className="flex items-center rounded-xl bg-[#FAFAFA] border border-[#ECECED] px-4 py-3.5 w-full">
            <span className="text-[15px] text-[#101828]">24.07.2025</span>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end pt-4">
          <button className="px-8 py-3.5 rounded-xl bg-[#C1C1CC] text-white font-medium hover:bg-[#a5a5b0] transition-colors w-[280px]">
            Yadda saxla
          </button>
        </div>

      </div>
    </div>
  );
}
