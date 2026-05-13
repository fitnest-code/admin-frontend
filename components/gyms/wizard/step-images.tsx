"use client";

import { useState, useEffect, useRef } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import { Loader2, Upload, X, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { useGymStore } from "@/lib/store/gym-store";
import { useValidateGymStep5 } from "@/lib/query/gym-query";

type Lang = "Az" | "Ru" | "En";

const labels: Record<Lang, any> = {
  Az: { title: "Zal məlumatları", cover: "Cover Şəkil", others: "Digər şəkillər", uploadCover: "Upload cover", upload: "Upload", next: "Növbəti", namePlaceholder: "Ad (məs: SPA)" },
  Ru: { title: "Данные зала", cover: "Обложка", others: "Другие фото", uploadCover: "Загрузить обложку", upload: "Загрузить", next: "Далее", namePlaceholder: "Название (напр: SPA)" },
  En: { title: "Gym Details", cover: "Cover Photo", others: "Other Photos", uploadCover: "Upload cover", upload: "Upload", next: "Next", namePlaceholder: "Name (e.g. SPA)" },
};

interface RoomPhotoState {
  id: string;
  photo: File | null;
  name: string;
  previewUrl: string | null;
}

export function StepImages({ onNext }: { onNext?: () => void }) {
  const { step5Photos, setStep5Photos } = useGymStore();
  const [mounted, setMounted] = useState(false);
  const [lang, setLang] = useState<Lang>("Az");

  const [coverPhoto, setCoverPhoto] = useState<File | null>(step5Photos?.cover || null);
  const [coverPreview, setCoverPreview] = useState<string | null>(step5Photos?.cover ? URL.createObjectURL(step5Photos.cover) : null);

  const initialRoomPhotos = step5Photos 
    ? Array.from({ length: 9 }).map((_, i) => {
        const p = step5Photos.rooms[i];
        return p ? { id: `rp-${i}`, photo: p.file, name: p.name, previewUrl: URL.createObjectURL(p.file) } : { id: `rp-${i}`, photo: null, name: "", previewUrl: null };
      })
    : Array.from({ length: 9 }).map((_, i) => ({ id: `rp-${i}`, photo: null, name: "", previewUrl: null }));

  const [roomPhotos, setRoomPhotos] = useState<RoomPhotoState[]>(initialRoomPhotos);

  const coverInputRef = useRef<HTMLInputElement>(null);
  const roomInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const validateStep5 = useValidateGymStep5();

  useEffect(() => { setMounted(true); }, []);

  const t = labels[lang];

  // Client-side image compression helper utilizing standard HTML5 Canvas
  const compressImage = (file: File, maxWidth = 1600, maxHeight = 1200, quality = 0.8): Promise<File> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        let { width, height } = img;
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(file);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: file.type || "image/jpeg",
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              resolve(file);
            }
          },
          file.type || "image/jpeg",
          quality
        );
      };
      img.onerror = () => resolve(file);
    });
  };

  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) return toast.error("Şəkil ölçüsü max 50MB ola bilər");
      // Auto compress cover images before adding to state
      const compressed = await compressImage(file, 1920, 1080, 0.85);
      setCoverPhoto(compressed);
      setCoverPreview(URL.createObjectURL(compressed));
    }
  };

  const handleRoomPhotoChange = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) return toast.error("Şəkil ölçüsü max 50MB ola bilər");
      // Auto compress room images to optimized standard resolution
      const compressed = await compressImage(file, 1200, 900, 0.8);
      setRoomPhotos(prev => {
        const newPhotos = [...prev];
        newPhotos[index] = { ...newPhotos[index], photo: compressed, previewUrl: URL.createObjectURL(compressed) };
        return newPhotos;
      });
    }
  };

  const handleRoomNameChange = (index: number, val: string) => {
    setRoomPhotos(prev => {
      const newPhotos = [...prev];
      newPhotos[index] = { ...newPhotos[index], name: val };
      return newPhotos;
    });
  };

  const handleRemoveRoomPhoto = (index: number) => {
    setRoomPhotos(prev => {
      const newPhotos = [...prev];
      if (newPhotos[index].previewUrl) URL.revokeObjectURL(newPhotos[index].previewUrl!);
      newPhotos[index] = { ...newPhotos[index], photo: null, previewUrl: null };
      return newPhotos;
    });
  };

  const activePhotosCount = roomPhotos.filter(p => p.photo).length;

  const handleNext = async () => {
    if (!coverPhoto) return toast.error("Zəhmət olmasa Cover Şəkil yükləyin");

    const validRoomPhotos = roomPhotos.filter(p => p.photo !== null);

    // Check if any uploaded photo is missing a name
    const missingNames = validRoomPhotos.some(p => !p.name.trim());
    if (missingNames) {
      return toast.error("Yüklənmiş şəkillərin adlarını qeyd edin");
    }

    try {
      const formData = new FormData();
      formData.append("coverPhoto", coverPhoto);
      validRoomPhotos.forEach(p => {
        formData.append("roomPhotos", p.photo!);
        formData.append("roomNames", p.name.trim());
      });

      await validateStep5.mutateAsync(formData);
      
      setStep5Photos({
        cover: coverPhoto,
        rooms: validRoomPhotos.map(p => ({ name: p.name.trim(), file: p.photo! }))
      });

      onNext?.();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err.message || "Xəta baş verdi");
    }
  };

  const isPending = validateStep5.isPending;

  if (!mounted) return null;

  return (
    <div className="w-full flex justify-center py-6">
      <div className="bg-white rounded-2xl border border-[#ECECED] w-full max-w-[783px] p-7 flex flex-col gap-6 shadow-sm">

        {/* Header */}
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

        {/* Cover Photo */}
        <div className="flex flex-col gap-3">
          <label className="text-sm font-bold text-[#1F2937]">{t.cover}</label>
          <div
            onClick={() => coverInputRef.current?.click()}
            className="relative w-full h-[220px] rounded-xl border-2 border-dashed border-[#D1D5DB] bg-[#F9FAFB] flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors overflow-hidden group"
          >
            <input type="file" ref={coverInputRef} className="hidden" accept="image/jpeg, image/png" onChange={handleCoverChange} />
            {coverPreview ? (
              <>
                <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-white font-semibold text-sm flex items-center gap-2"><Upload size={16} /> Dəyişdir</span>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center text-[#6B7280]">
                <Upload size={28} className="mb-2 text-[#9CA3AF]" />
                <span className="text-sm font-semibold">{t.uploadCover}</span>
              </div>
            )}
          </div>
          <span className="text-xs text-[#9CA3AF]">JPG or PNG • Max size 50MB</span>
        </div>

        {/* Room Photos */}
        <div className="flex flex-col gap-3 mt-4">
          <label className="text-sm font-bold text-[#1F2937]">{t.others} ( {activePhotosCount}/9 )</label>

          <div className="grid grid-cols-3 gap-4">
            {roomPhotos.map((room, index) => (
              <div key={room.id} className="flex flex-col gap-2">
                <div
                  onClick={() => !room.previewUrl && roomInputRefs.current[index]?.click()}
                  className={`relative w-full aspect-video rounded-xl border-2 border-dashed flex flex-col items-center justify-center transition-colors overflow-hidden ${room.previewUrl ? 'border-[#ECECED] cursor-default' : 'border-[#D1D5DB] bg-[#F9FAFB] cursor-pointer hover:bg-gray-50'
                    }`}
                >
                  <input
                    type="file"
                    ref={el => { roomInputRefs.current[index] = el }}
                    className="hidden"
                    accept="image/jpeg, image/png"
                    onChange={e => handleRoomPhotoChange(index, e)}
                  />

                  {room.previewUrl ? (
                    <>
                      <img src={room.previewUrl} alt="Room" className="w-full h-full object-cover" />
                      <div className="absolute top-2 right-2 flex gap-1">
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); roomInputRefs.current[index]?.click(); }}
                          className="p-1.5 bg-white/80 hover:bg-white rounded-lg text-[#1F2937] transition-colors"
                        >
                          <Upload size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handleRemoveRoomPhoto(index); }}
                          className="p-1.5 bg-white/80 hover:bg-white rounded-lg text-red-500 transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center text-[#9CA3AF]">
                      <Upload size={20} className="mb-2" />
                      <span className="text-xs font-semibold">{t.upload}</span>
                    </div>
                  )}
                </div>

                <input
                  type="text"
                  placeholder={t.namePlaceholder}
                  value={room.name}
                  onChange={(e) => handleRoomNameChange(index, e.target.value)}
                  className="w-full bg-[#F9FAFB] border border-[#ECECED] rounded-lg px-3 py-2 text-xs font-semibold text-[#1F2937] outline-none focus:border-[#00B4D8]"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <div className="flex gap-4 mt-6">
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
