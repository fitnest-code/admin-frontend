"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Loader2, Upload, X, Edit3 } from "lucide-react";
import { toast } from "sonner";
import { useGymStore } from "@/lib/store/gym-store";
import { useValidateGymStep5, useCategories } from "@/lib/query/gym-query";
import { cn } from "@/lib/utils";

interface RoomPhotoState {
  id: string;
  photo: File | null;
  name: string;
  previewUrl: string | null;
  categoryId: number;
}

export function StepImages({ onNext }: { onNext?: () => void }) {
  const { step5Photos, setStep5Photos, step1Data } = useGymStore();
  const [mounted, setMounted] = useState(false);

  const { data: categoriesData } = useCategories();

  // Filter categories to only display those selected in Step 1
  const selectedCategories = useMemo(() => {
    return categoriesData?.items?.filter((c) => 
      (step1Data?.mainCategoryDetails || []).map(d => d.categoryId).includes(c.id) || 
      (step1Data?.subCategoryDetails || []).map(d => d.categoryId).includes(c.id)
    ) || [];
  }, [categoriesData, step1Data]);

  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);

  // Category-specific cover files and preview URLs
  const [covers, setCovers] = useState<Record<number, File | null>>({});
  const [coverPreviews, setCoverPreviews] = useState<Record<number, string | null>>({});

  // Category-specific room slots
  const [roomPhotos, setRoomPhotos] = useState<Record<number, RoomPhotoState[]>>({});

  const coverInputRef = useRef<HTMLInputElement>(null);
  const roomInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const validateStep5 = useValidateGymStep5();

  // Initialize states on mount/loaded categories
  useEffect(() => {
    if (selectedCategories.length > 0 && Object.keys(roomPhotos).length === 0) {
      const initialCovers: Record<number, File | null> = {};
      const initialCoverPreviews: Record<number, string | null> = {};
      const initialRoomPhotos: Record<number, RoomPhotoState[]> = {};

      selectedCategories.forEach((cat) => {
        initialRoomPhotos[cat.id] = Array.from({ length: 9 }).map((_, i) => ({
          id: `rp-${cat.id}-${i}`,
          photo: null,
          name: "",
          previewUrl: null,
          categoryId: cat.id
        }));
      });

      if (step5Photos) {
        // Load category covers
        if (step5Photos.categoryCovers) {
          step5Photos.categoryCovers.forEach((cc) => {
            initialCovers[cc.categoryId] = cc.file;
            initialCoverPreviews[cc.categoryId] = URL.createObjectURL(cc.file);
          });
        }

        // Load rooms
        step5Photos.rooms.forEach((r) => {
          if (r.categoryId) {
            const list = initialRoomPhotos[r.categoryId];
            if (list) {
              const emptySlotIdx = list.findIndex(p => p.photo === null);
              if (emptySlotIdx !== -1) {
                list[emptySlotIdx] = {
                  id: `rp-${r.categoryId}-${emptySlotIdx}`,
                  photo: r.file,
                  name: r.name,
                  previewUrl: URL.createObjectURL(r.file),
                  categoryId: r.categoryId
                };
              }
            }
          }
        });

        // Also check if there's a global cover in store and set it on the main category if not already set
        if (step5Photos.cover && selectedCategories.length > 0) {
          const mainCatId = selectedCategories[0].id;
          if (!initialCovers[mainCatId]) {
            initialCovers[mainCatId] = step5Photos.cover;
            initialCoverPreviews[mainCatId] = URL.createObjectURL(step5Photos.cover);
          }
        }
      }

      setCovers(initialCovers);
      setCoverPreviews(initialCoverPreviews);
      setRoomPhotos(initialRoomPhotos);
      setActiveCategoryId(selectedCategories[0].id);
    }
  }, [selectedCategories, step5Photos]);

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
    if (!activeCategoryId) return;
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) return toast.error("Şəkil ölçüsü max 50MB ola bilər");
      const compressed = await compressImage(file, 1200, 800, 0.72);
      setCovers(prev => ({ ...prev, [activeCategoryId]: compressed }));
      setCoverPreviews(prev => ({ ...prev, [activeCategoryId]: URL.createObjectURL(compressed) }));
    }
  };

  const handleRoomPhotoChange = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (!activeCategoryId) return;
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) return toast.error("Şəkil ölçüsü max 50MB ola bilər");
      const compressed = await compressImage(file, 800, 600, 0.65);
      setRoomPhotos(prev => {
        const catRooms = [...(prev[activeCategoryId] || [])];
        catRooms[index] = { 
          ...catRooms[index], 
          photo: compressed, 
          previewUrl: URL.createObjectURL(compressed)
        };
        return { ...prev, [activeCategoryId]: catRooms };
      });
    }
  };

  const handleRoomNameChange = (index: number, val: string) => {
    if (!activeCategoryId) return;
    setRoomPhotos(prev => {
      const catRooms = [...(prev[activeCategoryId] || [])];
      catRooms[index] = { ...catRooms[index], name: val };
      return { ...prev, [activeCategoryId]: catRooms };
    });
  };

  const handleRemoveRoomPhoto = (index: number) => {
    if (!activeCategoryId) return;
    setRoomPhotos(prev => {
      const catRooms = [...(prev[activeCategoryId] || [])];
      if (catRooms[index].previewUrl) URL.revokeObjectURL(catRooms[index].previewUrl!);
      catRooms[index] = { 
        ...catRooms[index], 
        photo: null, 
        previewUrl: null 
      };
      return { ...prev, [activeCategoryId]: catRooms };
    });
  };

  const currentRooms = activeCategoryId ? (roomPhotos[activeCategoryId] || []) : [];
  const activePhotosCount = currentRooms.filter(p => p.photo).length;
  const currentCoverPreview = activeCategoryId ? (coverPreviews[activeCategoryId] || null) : null;

  const handleNext = async () => {
    // 1. Validation checks
    for (const cat of selectedCategories) {
      if (!covers[cat.id]) {
        return toast.error(`Zəhmət olmasa "${cat.name}" kateqoriyası üçün Cover Şəkil yükləyin.`);
      }

      const catRooms = roomPhotos[cat.id] || [];
      const validRoomPhotos = catRooms.filter(p => p.photo !== null);
      const missingNames = validRoomPhotos.some(p => !p.name.trim());
      if (missingNames) {
        return toast.error(`"${cat.name}" kateqoriyasında yüklənmiş şəkillərin adlarını daxil edin.`);
      }
    }

    try {
      const formData = new FormData();
      const allRoomPhotosToSend: Array<{ name: string; file: File; categoryId: number }> = [];
      const categoryCoversToSend: Array<{ file: File; categoryId: number }> = [];

      selectedCategories.forEach((cat) => {
        const catCover = covers[cat.id];
        if (catCover) {
          categoryCoversToSend.push({
            file: catCover,
            categoryId: cat.id
          });
        }

        // Send normal room images
        const catRooms = roomPhotos[cat.id] || [];
        catRooms.forEach((p) => {
          if (p.photo) {
            allRoomPhotosToSend.push({
              name: p.name.trim(),
              file: p.photo,
              categoryId: cat.id
            });
          }
        });
      });

      // Set first selected category's cover as global coverPhoto for the gym
      const mainCatId = selectedCategories[0]?.id;
      const globalCoverPhoto = mainCatId ? covers[mainCatId] : null;
      if (globalCoverPhoto) {
        formData.append("coverPhoto", globalCoverPhoto);
      }

      // Append category covers
      categoryCoversToSend.forEach((cc) => {
        formData.append("categoryCovers", cc.file);
        formData.append("categoryCoverCategoryIds", String(cc.categoryId));
      });

      // Append all room images to multipart payload
      allRoomPhotosToSend.forEach((r) => {
        formData.append("roomPhotos", r.file);
        formData.append("roomNames", r.name);
        formData.append("roomCategoryIds", String(r.categoryId));
      });

      await validateStep5.mutateAsync(formData);
      
      setStep5Photos({
        cover: globalCoverPhoto,
        categoryCovers: categoryCoversToSend,
        rooms: allRoomPhotosToSend
      });

      onNext?.();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err.message || "Xəta baş verdi");
    }
  };

  const isPending = validateStep5.isPending;

  if (!mounted) return null;

  return (
    <div className="w-full bg-white rounded-[12px] border border-[#ECECED] p-6 md:p-8 flex flex-col gap-9 shadow-sm animate-in fade-in duration-500 font-sans text-black">

      {/* Header */}
      <div className="flex items-center justify-between pb-1 border-b border-[#ECECED]">
        <h1 className="text-[20px] font-semibold leading-[30px]">Zal məlumatları</h1>
      </div>

      {/* Category Selection Tab List */}
      <div className="flex flex-col gap-6 w-full">
        <label className="text-[16px] font-medium leading-[24px]">Kateqoriya seçimi</label>
        <div className="flex items-center flex-wrap gap-6">
          {selectedCategories.map((c) => {
            const isActive = activeCategoryId === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setActiveCategoryId(c.id)}
                className={cn(
                  "h-12 min-w-[180px] px-7 rounded-full flex items-center justify-center font-semibold text-[16px] transition-all tracking-tight",
                  isActive 
                    ? "bg-[#00b4cc] text-white shadow-sm shadow-[#00b4cc]/15" 
                    : "border border-[#00b4cc] bg-white text-black hover:bg-[#00b4cc]/5"
                )}
              >
                {c.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Uploaders Container */}
      {activeCategoryId && (
        <div className="flex flex-col gap-8 w-full max-w-[727px] animate-in fade-in duration-200">
          
          {/* Cover Photo Slot */}
          <div className="flex flex-col gap-3 w-full">
            <div className="text-[16px] font-medium leading-[20px]">Cover Şəkil</div>
            <div className="relative w-full h-[252px] max-w-[444px] flex flex-col gap-3">
              <div
                onClick={() => coverInputRef.current?.click()}
                className="relative w-full h-[252px] rounded-2xl border border-dashed border-[#99a1af] bg-[#fafafa] flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors overflow-hidden group"
              >
                <input type="file" ref={coverInputRef} className="hidden" accept="image/jpeg, image/png, image/webp" onChange={handleCoverChange} />
                {currentCoverPreview ? (
                  <>
                    <img src={currentCoverPreview} alt="Cover" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-white font-semibold text-sm flex items-center gap-2"><Upload size={16} /> Şəkili dəyiş</span>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center text-[#4a5565] gap-7 text-center">
                    <Upload size={40} className="text-[#99a1af]" />
                    <span className="text-[14px] leading-5 font-semibold">Upload cover</span>
                  </div>
                )}
              </div>
              <span className="text-[14px] leading-5 text-[#6a7282] italic">JPG or PNG • Max size 2MB</span>
            </div>
          </div>

          {/* Room Photos Slot Grid */}
          <div className="flex flex-col gap-4 w-full">
            <div className="text-[16px] font-medium leading-[20px]">Digər şəkillər ( {activePhotosCount}/9 )</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {currentRooms.map((room, index) => (
                <div key={room.id} className="flex flex-col gap-3 w-[231px] h-[224px]">
                  
                  {/* Image slot box */}
                  <div
                    onClick={() => !room.previewUrl && roomInputRefs.current[room.id]?.click()}
                    className={cn(
                      "relative w-full h-[180px] rounded-2xl border flex flex-col items-center justify-center transition-colors overflow-hidden",
                      room.previewUrl 
                        ? "border-[#ececed] bg-cover bg-center bg-no-repeat cursor-default" 
                        : "border-dashed border-[#d1d5dc] bg-[#fafafa] cursor-pointer hover:bg-slate-50"
                    )}
                    style={room.previewUrl ? { backgroundImage: `url(${room.previewUrl})` } : undefined}
                  >
                    <input
                      type="file"
                      ref={el => { roomInputRefs.current[room.id] = el }}
                      className="hidden"
                      accept="image/jpeg, image/png, image/webp"
                      onChange={e => handleRoomPhotoChange(index, e)}
                    />

                    {room.previewUrl ? (
                      <div className="absolute top-3 right-3 flex items-center gap-2 overflow-hidden animate-in fade-in duration-200">
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); roomInputRefs.current[room.id]?.click(); }}
                          className="p-1 rounded-full bg-white text-black hover:opacity-90 transition-opacity flex items-center justify-center w-6 h-6 shadow"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handleRemoveRoomPhoto(index); }}
                          className="p-1 rounded-full bg-white text-red-500 hover:opacity-90 transition-opacity flex items-center justify-center w-6 h-6 shadow"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center text-[#4a5565] gap-4">
                        <Upload size={28} className="text-[#99a1af]" />
                        <span className="text-[14px] leading-[18px]">Upload</span>
                      </div>
                    )}
                  </div>

                  {/* Room Name input */}
                  <input
                    type="text"
                    placeholder="Ad (məs: SPA)"
                    value={room.name}
                    onChange={(e) => handleRoomNameChange(index, e.target.value)}
                    className="w-full h-8 bg-[#f9fafb] border border-[#e5e7eb] rounded-lg px-3 text-[14px] font-medium text-[#717182] outline-none focus:border-[#00b4cc] transition-colors placeholder:text-[#717182]/60"
                  />
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* Footer Buttons */}
      <div className="w-full flex justify-end items-center gap-5 border-t border-[#ececed] pt-5">
        <button
          type="button"
          onClick={() => {
            const { resetStep5Photos } = useGymStore.getState();
            resetStep5Photos();
            setCovers({});
            setCoverPreviews({});
            
            const freshRooms: Record<number, RoomPhotoState[]> = {};
            selectedCategories.forEach((cat) => {
              freshRooms[cat.id] = Array.from({ length: 9 }).map((_, i) => ({
                id: `rp-${cat.id}-${i}`,
                photo: null,
                name: "",
                previewUrl: null,
                categoryId: cat.id
              }));
            });
            setRoomPhotos(freshRooms);
          }}
          className="h-[48px] w-[280px] rounded-lg border border-[#00b4cc] bg-white text-[16px] font-semibold text-[#00b4cc] hover:bg-[#00b4cc]/5 transition-colors"
        >
          Sıfırla
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={handleNext}
          className="h-[48px] w-[280px] rounded-lg bg-[#00b4cc] text-white text-[16px] font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-md shadow-[#00b4cc]/10"
        >
          {isPending ? <Loader2 className="animate-spin animate-infinite" size={20} /> : "Növbəti"}
        </button>
      </div>

    </div>
  );
}
