"use client";

import { useState, useEffect, useRef } from "react";
import { Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { useGymStore } from "@/lib/store/gym-store";
import { useValidateGymStep5, useCategories } from "@/lib/query/gym-query";

interface RoomPhotoState {
  id: string;
  photo: File | null;
  name: string;
  previewUrl: string | null;
  categoryId: number | null;
}

export function StepImages({ onNext }: { onNext?: () => void }) {
  const { step5Photos, setStep5Photos, step1Data } = useGymStore();
  const [mounted, setMounted] = useState(false);

  const [coverPhoto, setCoverPhoto] = useState<File | null>(step5Photos?.cover || null);
  const [coverPreview, setCoverPreview] = useState<string | null>(step5Photos?.cover ? URL.createObjectURL(step5Photos.cover) : null);

  const initialRoomPhotos = step5Photos 
    ? Array.from({ length: 9 }).map((_, i) => {
        const p = step5Photos.rooms[i];
        return p ? { id: `rp-${i}`, photo: p.file, name: p.name, previewUrl: URL.createObjectURL(p.file), categoryId: p.categoryId || null } : { id: `rp-${i}`, photo: null, name: "", previewUrl: null, categoryId: null };
      })
    : Array.from({ length: 9 }).map((_, i) => ({ id: `rp-${i}`, photo: null, name: "", previewUrl: null, categoryId: null }));

  const [roomPhotos, setRoomPhotos] = useState<RoomPhotoState[]>(initialRoomPhotos);

  const coverInputRef = useRef<HTMLInputElement>(null);
  const roomInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const validateStep5 = useValidateGymStep5();
  const { data: categoriesData } = useCategories();

  // Filter categories to only display those selected in Step 1
  const selectedCategories = categoriesData?.items?.filter((c) => 
    c.id === step1Data?.mainCategoryId || c.id === step1Data?.subCategoryId
  ) || [];

  useEffect(() => { setMounted(true); }, []);

  // Client-side image compression helper utilizing standard HTML5 Canvas
  const compressImage = (file: File, maxWidth = 1024, maxHeight = 768, quality = 0.7): Promise<File> => {
    return new Promise((resolve) => {
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
        
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const newName = file.name.replace(/\.[^/.]+$/, ".jpg");
              const compressedFile = new File([blob], newName, {
                type: "image/jpeg",
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              resolve(file);
            }
          },
          "image/jpeg",
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
      const compressed = await compressImage(file, 1200, 800, 0.72);
      setCoverPhoto(compressed);
      setCoverPreview(URL.createObjectURL(compressed));
    }
  };

  const handleRoomPhotoChange = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) return toast.error("Şəkil ölçüsü max 50MB ola bilər");
      const compressed = await compressImage(file, 800, 600, 0.65);
      setRoomPhotos(prev => {
        const newPhotos = [...prev];
        newPhotos[index] = { 
          ...newPhotos[index], 
          photo: compressed, 
          previewUrl: URL.createObjectURL(compressed),
          // Auto-select the first category from step 1 categories list to make it easier for user
          categoryId: newPhotos[index].categoryId || selectedCategories[0]?.id || null 
        };
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

  const handleRoomCategoryChange = (index: number, catId: number | null) => {
    setRoomPhotos(prev => {
      const newPhotos = [...prev];
      newPhotos[index] = { ...newPhotos[index], categoryId: catId };
      return newPhotos;
    });
  };

  const handleRemoveRoomPhoto = (index: number) => {
    setRoomPhotos(prev => {
      const newPhotos = [...prev];
      if (newPhotos[index].previewUrl) URL.revokeObjectURL(newPhotos[index].previewUrl!);
      newPhotos[index] = { ...newPhotos[index], photo: null, previewUrl: null, categoryId: null };
      return newPhotos;
    });
  };

  const activePhotosCount = roomPhotos.filter(p => p.photo).length;

  const handleNext = async () => {
    if (!coverPhoto) return toast.error("Zəhmət olmasa Cover Şəkil yükləyin");

    const validRoomPhotos = roomPhotos.filter(p => p.photo !== null);

    const missingNames = validRoomPhotos.some(p => !p.name.trim());
    if (missingNames) {
      return toast.error("Yüklənmiş şəkillərin adlarını qeyd edin");
    }

    const missingCategories = validRoomPhotos.some(p => !p.categoryId);
    if (missingCategories) {
      return toast.error("Yüklənmiş şəkillərin kateqoriyalarını seçin");
    }

    try {
      const formData = new FormData();
      formData.append("coverPhoto", coverPhoto);
      validRoomPhotos.forEach(p => {
        formData.append("roomPhotos", p.photo!);
        formData.append("roomNames", p.name.trim());
        formData.append("roomCategoryIds", String(p.categoryId));
      });

      await validateStep5.mutateAsync(formData);
      
      setStep5Photos({
        cover: coverPhoto,
        rooms: validRoomPhotos.map(p => ({ name: p.name.trim(), file: p.photo!, categoryId: p.categoryId }))
      });

      onNext?.();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err.message || "Xəta baş verdi");
    }
  };

  const isPending = validateStep5.isPending;

  if (!mounted) return null;

  return (
    <div className="w-full bg-white rounded-[24px] border border-[#ECECED] p-6 flex flex-col gap-6 shadow-sm animate-in fade-in duration-500">

        {/* Header */}
        <div className="flex items-center justify-between pb-1 border-b border-[#ECECED]">
          <h1 className="text-lg font-bold text-[#1F2937]">Zal şəkilləri</h1>
        </div>

        {/* Cover Photo */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-[#1F2937]">Cover Şəkil</label>
          <div
            onClick={() => coverInputRef.current?.click()}
            className="relative w-full h-[180px] rounded-xl border-2 border-dashed border-[#D1D5DB] bg-[#F9FAFB] flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors overflow-hidden group"
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
                <span className="text-sm font-semibold">Cover şəkil yüklə</span>
              </div>
            )}
          </div>
          <span className="text-xs text-[#9CA3AF]">JPG or PNG • Max size 50MB</span>
        </div>

        {/* Room Photos */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-[#1F2937]">Digər şəkillər ( {activePhotosCount}/9 )</label>

          <div className="grid grid-cols-3 gap-4">
            {roomPhotos.map((room, index) => (
              <div key={room.id} className="flex flex-col gap-2 bg-[#FAFBFB] p-2 rounded-xl border border-[#ECECED]">
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
                      <span className="text-xs font-semibold">Yüklə</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-1.5 mt-1">
                  <input
                    type="text"
                    placeholder="Ad (məs: SPA)"
                    value={room.name}
                    onChange={(e) => handleRoomNameChange(index, e.target.value)}
                    className="w-full bg-white border border-[#ECECED] rounded-lg px-3 py-2 text-xs font-semibold text-[#1F2937] outline-none focus:border-[#00B4D8]"
                  />
                  
                  <select
                    value={room.categoryId || ""}
                    onChange={(e) => handleRoomCategoryChange(index, e.target.value ? Number(e.target.value) : null)}
                    className="w-full bg-white border border-[#ECECED] rounded-lg px-3 py-2 text-xs font-semibold text-[#1F2937] outline-none focus:border-[#00B4D8] cursor-pointer"
                  >
                    <option value="" disabled>Kateqoriya seçin</option>
                    {selectedCategories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex justify-end items-center gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={() => {
              const { resetStep5Photos } = useGymStore.getState();
              resetStep5Photos();
              setCoverPhoto(null);
              setCoverPreview(null);
              setRoomPhotos(Array.from({ length: 9 }).map((_, i) => ({ id: `rp-${i}`, photo: null, name: "", previewUrl: null, categoryId: null })));
            }}
            className="h-[40px] px-8 rounded-lg border border-[#ececed] text-[#101828] text-[14px] font-medium hover:bg-slate-50 transition-colors"
          >
            Sıfırla
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={handleNext}
            className="w-[240px] h-[40px] rounded-lg bg-[#00B4CC] text-white text-[14px] font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-md shadow-cyan-50"
          >
            {isPending ? <Loader2 className="animate-spin" size={20} /> : "Növbəti"}
          </button>
        </div>

    </div>
  );
}
