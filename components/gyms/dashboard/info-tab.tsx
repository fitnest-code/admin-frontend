"use client";

import { useState } from "react";
import { Search, Globe, Instagram, Mail, Phone, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

export function InfoTab() {
  const [activeLang, setActiveLang] = useState<"Az" | "Ru" | "En">("Az");

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-3 gap-6">
        {/* Left Column: Details */}
        <div className="col-span-2 flex flex-col gap-6">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Zal məlumatları</h3>
              <div className="flex gap-4">
                {["Az", "Ru", "En"].map((l) => (
                  <button
                    key={l}
                    onClick={() => setActiveLang(l as any)}
                    className={cn(
                      "text-xs font-bold transition-all border-b-2 pb-1",
                      activeLang === l ? "border-[#00B4CC] text-[#00B4CC]" : "border-transparent text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1.5">Kateqoriya</p>
                  <p className="text-sm font-semibold text-foreground">Fitness / Bodybuilding</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1.5">Zal adı</p>
                  <p className="text-sm font-semibold text-foreground">FitNest Premium</p>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1.5">Qiymət</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-black text-[#00B4CC]">50</span>
                  <span className="text-xs font-bold text-muted-foreground uppercase">AZN / GÜNLÜK</span>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1.5">Haqqında</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  FitNest Premium bakıda ən böyük və ən müasir idman zallarından biridir. Bizim zalda ən müasir trenajorlar, geniş qrup dərsləri otağı və peşəkar məşqçi heyəti fəaliyyət göstərir. Müştərilərimizin rahatlığı üçün hər bir şərait yaradılmışdır.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-6">Zal şəkilləri</h3>
            <div className="space-y-6">
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase mb-3">Əsas şəkil</p>
                <div className="h-48 w-full rounded-xl overflow-hidden bg-secondary border border-border group relative">
                  <img src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button className="bg-white/90 text-black px-4 py-2 rounded-lg text-xs font-bold shadow-xl">Şəkli dəyiş</button>
                  </div>
                </div>
              </div>
              
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase mb-3">Otaq şəkilləri</p>
                <div className="grid grid-cols-4 gap-3">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="aspect-square rounded-lg overflow-hidden bg-secondary border border-border group relative">
                       <img src={`https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=2070`} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" />
                       <div className="absolute inset-0 bg-black/10 flex items-end p-2">
                         <span className="text-[9px] font-bold text-white bg-black/40 px-1.5 py-0.5 rounded backdrop-blur-sm">Otaq {i}</span>
                       </div>
                    </div>
                  ))}
                  <button className="aspect-square rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 hover:bg-secondary/50 transition-colors">
                    <span className="text-xl font-light text-muted-foreground">+</span>
                    <span className="text-[10px] font-bold text-muted-foreground">Əlavə et</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Contact & Location */}
        <div className="flex flex-col gap-6">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-6">Əlaqə məlumatları</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30 border border-transparent hover:border-border transition-all">
                <div className="h-8 w-8 rounded-lg bg-white flex items-center justify-center text-[#00B4CC] shadow-sm">
                  <Phone size={14} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] font-bold text-muted-foreground uppercase">Telefon</span>
                  <span className="text-xs font-bold text-foreground">+994 50 123 45 67</span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30 border border-transparent hover:border-border transition-all">
                <div className="h-8 w-8 rounded-lg bg-white flex items-center justify-center text-[#00B4CC] shadow-sm">
                  <Mail size={14} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] font-bold text-muted-foreground uppercase">E-poçt</span>
                  <span className="text-xs font-bold text-foreground">premium@fitnest.az</span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30 border border-transparent hover:border-border transition-all">
                <div className="h-8 w-8 rounded-lg bg-white flex items-center justify-center text-[#00B4CC] shadow-sm">
                  <Globe size={14} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] font-bold text-muted-foreground uppercase">Vebsayt</span>
                  <span className="text-xs font-bold text-foreground">www.fitnest.az</span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30 border border-transparent hover:border-border transition-all">
                <div className="h-8 w-8 rounded-lg bg-white flex items-center justify-center text-[#E4405F] shadow-sm">
                  <Instagram size={14} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] font-bold text-muted-foreground uppercase">Instagram</span>
                  <span className="text-xs font-bold text-foreground">@fitnest_premium</span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Koordinatlar</h3>
              <MapPin size={16} className="text-[#00B4CC]" />
            </div>
            <div className="h-48 w-full rounded-xl bg-secondary border border-border overflow-hidden relative mb-4">
              <div className="absolute inset-0 flex items-center justify-center opacity-20">
                <Search size={40} className="text-muted-foreground" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-white/80 px-4 py-2 rounded-full border border-border backdrop-blur-sm">Google Maps Placeholder</span>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-muted-foreground uppercase">Enlik (Lat)</span>
                <span className="text-xs font-bold text-foreground">40.4093</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-muted-foreground uppercase">Uzunluq (Long)</span>
                <span className="text-xs font-bold text-foreground">49.8671</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end pt-4">
        <button className="px-10 py-3.5 rounded-xl bg-muted text-muted-foreground font-bold transition-all hover:bg-secondary/50">Yadda saxla</button>
      </div>
    </div>
  );
}
