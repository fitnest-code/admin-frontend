"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { Upload, Trash2, Pencil, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useGymDetailsAdmin,
  useUpdateGymCover,
  useAddGymRoomImages,
  useDeleteGymRoom,
  useUpdateGymRoomName,
} from "@/lib/query/gym-query";
import { toast } from "sonner";
import { useGymStore } from "@/lib/store/gym-store";
import styles from "./info-tab.module.css";

const getImageUrl = (urlOrFsId: string | undefined | null) => {
  if (!urlOrFsId) return "";
  if (urlOrFsId.startsWith("http") || urlOrFsId.startsWith("/")) return urlOrFsId;
  return `/api/v1/media/stream/${urlOrFsId}`;
};

export function ImagesTab() {
  const gymId = useGymStore((s) => s.gymId);
  const { data: gymInfo } = useGymDetailsAdmin(gymId ? Number(gymId) : null);

  const { mutate: updateGymCover, isPending: isCoverUpdating } = useUpdateGymCover();
  const { mutate: addRoomImages, isPending: isRoomAdding } = useAddGymRoomImages();
  const { mutate: deleteGymRoom, isPending: isRoomDeleting } = useDeleteGymRoom();
  const updateRoomNameMutate = useUpdateGymRoomName();

  // All categories
  const allCategories = useMemo(() => {
    if (!gymInfo) return [];
    const main = gymInfo.mainCategories || [];
    const sub = gymInfo.subCategories || [];
    if (main.length === 0 && sub.length === 0) return gymInfo.categories || [];
    return [...main, ...sub];
  }, [gymInfo]);

  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);

  useEffect(() => {
    if (allCategories.length > 0 && activeCategoryId === null) {
      setActiveCategoryId(allCategories[0].id);
    }
  }, [allCategories, activeCategoryId]);

  // Cover image
  const coverInputRef = useRef<HTMLInputElement | null>(null);
  const handleCoverClick = () => coverInputRef.current?.click();
  const handleCoverFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && gymId) {
      updateGymCover({ id: Number(gymId), file }, {
        onSuccess: () => toast.success("Cover şəkli uğurla yeniləndi!"),
        onError: (err: any) => toast.error(err?.message || "Cover yükləmə xətası"),
      });
    }
  };

  // Room images
  const editRoomInputRef = useRef<HTMLInputElement | null>(null);
  const roomInputRefs = useRef<Record<number, HTMLInputElement | null>>({});
  const [roomNames, setRoomNames] = useState<Record<number, string>>({});
  const [emptyRoomNames, setEmptyRoomNames] = useState<Record<number, string>>({});
  const [editingRoom, setEditingRoom] = useState<{ id: number; name: string } | null>(null);
  const [actionRoomId, setActionRoomId] = useState<number | null>(null);
  const [uploadingSlotIndex, setUploadingSlotIndex] = useState<number | null>(null);

  useEffect(() => {
    if (gymInfo?.rooms) {
      const names: Record<number, string> = {};
      gymInfo.rooms.forEach((r: any) => { names[r.id] = r.name || ""; });
      setRoomNames(names);
    }
  }, [gymInfo]);

  const handleEditRoomClick = (room: any) => {
    setEditingRoom(room);
    editRoomInputRef.current?.click();
  };

  const handleEditRoomFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editingRoom && gymId) {
      setActionRoomId(editingRoom.id);
      deleteGymRoom({ id: Number(gymId), roomId: editingRoom.id }, {
        onSuccess: () => {
          addRoomImages({ id: Number(gymId), roomNames: [editingRoom.name], files: [file] }, {
            onSuccess: () => { toast.success("Otaq şəkli yeniləndi!"); setActionRoomId(null); setEditingRoom(null); },
            onError: () => { toast.error("Xəta baş verdi"); setActionRoomId(null); },
          });
        },
        onError: () => { toast.error("Xəta baş verdi"); setActionRoomId(null); },
      });
    }
  };

  const handleDeleteRoomClick = (roomId: number) => {
    if (!gymId) return;
    setActionRoomId(roomId);
    deleteGymRoom({ id: Number(gymId), roomId }, {
      onSuccess: () => { toast.success("Otaq silindi!"); setActionRoomId(null); },
      onError: () => { toast.error("Xəta baş verdi"); setActionRoomId(null); },
    });
  };

  const handleEmptySlotClick = (index: number) => {
    const name = emptyRoomNames[index]?.trim();
    if (!name) { toast.error("Zəhmət olmasa otaq adını daxil edin"); return; }
    roomInputRefs.current[index]?.click();
  };

  const handleEmptySlotFileChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    const name = emptyRoomNames[index]?.trim();
    if (file && name && gymId) {
      setUploadingSlotIndex(index);
      addRoomImages({ id: Number(gymId), roomNames: [name], files: [file] }, {
        onSuccess: () => { toast.success("Otaq əlavə edildi!"); setUploadingSlotIndex(null); setEmptyRoomNames(prev => ({ ...prev, [index]: "" })); },
        onError: () => { toast.error("Xəta baş verdi"); setUploadingSlotIndex(null); },
      });
    }
  };

  const handleSaveRoomNames = () => {
    if (!gymInfo?.rooms || !gymId) return;
    gymInfo.rooms.forEach((room: any) => {
      const newName = roomNames[room.id];
      if (newName !== undefined && newName !== room.name) {
        updateRoomNameMutate.mutate({ id: Number(gymId), roomId: room.id, name: newName });
      }
    });
    toast.success("Otaq adları yeniləndi!");
  };

  if (!gymInfo) {
    return (
      <div className="flex items-center justify-center py-24 text-sm text-muted-foreground">
        Yüklənir...
      </div>
    );
  }

  // Get category cover from descriptions
  const activeCoverUrl = gymInfo.descriptions?.find((d: any) => d.categoryId === activeCategoryId)?.coverImageUrl;

  return (
    <div className="w-full flex flex-col items-start gap-[40px] text-base text-[#000] font-sans">

      {/* Category Selection Pills */}
      {allCategories.length > 0 && (
        <div className={styles.kateqoriyaSeimiParent}>
          <div className={styles.kateqoriyaSeimi}>Kateqoriya seçimi</div>
          <div className={styles.component42Parent}>
            {allCategories.map(cat => {
              const isActive = activeCategoryId === cat.id;
              return (
                <div
                  key={cat.id}
                  onClick={() => setActiveCategoryId(cat.id)}
                  className={isActive ? styles.component42 : styles.component422}
                >
                  {cat.name}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Cover Image Section */}
      <div className="self-stretch flex flex-col items-start gap-[28px]">
        <div className="self-stretch border-b border-[#ececed] flex items-center justify-between pb-1">
          <div className="relative leading-[30px] font-semibold text-lg sm:text-xl">Cover Şəkil</div>
        </div>

        <div className="w-full sm:w-[444px] h-[252px] relative text-sm text-[#6a7282]">
          <div className="absolute top-[264px] left-0 w-full h-5">
            <div className="relative tracking-[-0.15px] leading-[20px]">JPG or PNG • Max size 2MB</div>
          </div>
          {gymInfo.coverImageUrl ? (
            <div
              onClick={handleCoverClick}
              className="absolute top-0 left-0 w-full h-full rounded-2xl overflow-hidden border border-[#ececed] cursor-pointer group"
            >
              <img src={getImageUrl(gymInfo.coverImageUrl)} className="w-full h-full object-cover" alt="cover" />
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Pencil size={32} className="text-white" />
              </div>
              {isCoverUpdating && (
                <div className="absolute inset-0 bg-white/60 flex items-center justify-center rounded-2xl z-20">
                  <Loader2 className="animate-spin text-[#00B4CC]" size={36} />
                </div>
              )}
            </div>
          ) : (
            <div
              onClick={handleCoverClick}
              className="absolute top-0 left-0 w-full h-full rounded-2xl border border-dashed border-[#99a1af] text-center text-[#4a5565] flex flex-col items-center justify-center gap-[30px] cursor-pointer hover:bg-slate-50 transition-colors overflow-hidden"
            >
              <Upload size={40} className="relative z-10" />
              <div className="relative tracking-[-0.15px] leading-[20px] font-medium z-10">Upload cover</div>
              {isCoverUpdating && (
                <div className="absolute inset-0 bg-white/60 flex items-center justify-center rounded-2xl z-20">
                  <Loader2 className="animate-spin text-[#00B4CC]" size={36} />
                </div>
              )}
            </div>
          )}
          <input type="file" ref={coverInputRef} onChange={handleCoverFileChange} accept="image/*" className="hidden" />
        </div>
      </div>

      {/* Category Cover (from descriptions) */}
      {activeCategoryId !== null && activeCoverUrl && (
        <div className="self-stretch flex flex-col items-start gap-3 animate-in fade-in duration-300">
          <div className="self-stretch border-b border-[#ececed] pb-1">
            <div className="relative leading-[30px] font-semibold text-lg sm:text-xl">
              {allCategories.find(c => c.id === activeCategoryId)?.name} — Kateqoriya cover
            </div>
          </div>
          <div className="w-full sm:w-[444px] h-[252px] rounded-2xl overflow-hidden border border-[#ececed]">
            <img src={getImageUrl(activeCoverUrl)} className="w-full h-full object-cover" alt="category cover" />
          </div>
        </div>
      )}

      {/* Room Images */}
      <div className="self-stretch flex flex-col items-start gap-[28px]">
        <div className="self-stretch border-b border-[#ececed] flex items-center justify-between pb-1">
          <div className="relative leading-[30px] font-semibold text-lg sm:text-xl">
            Digər şəkillər ({gymInfo.rooms?.length || 0}/9)
          </div>
          {Object.keys(roomNames).length > 0 && (
            <button
              onClick={handleSaveRoomNames}
              className="text-sm text-[#00B4CC] font-semibold hover:underline"
            >
              Adları yadda saxla
            </button>
          )}
        </div>

        <input type="file" ref={editRoomInputRef} onChange={handleEditRoomFileChange} accept="image/*" className="hidden" />

        <div className="w-full flex items-start flex-wrap content-start gap-4 text-center text-sm text-[#4a5565]">
          {gymInfo.rooms?.map((room: any, i: number) => (
            <div key={i} className="h-[224px] w-[180px] relative text-left text-[#717182]">
              <div className="absolute inset-0 flex flex-col items-start gap-3">
                <div className="self-stretch h-[180px] rounded-2xl flex items-start justify-end p-3 box-border bg-cover bg-no-repeat bg-top relative overflow-hidden group border border-[#ececed]">
                  {room.imageUrl ? (
                    <img src={getImageUrl(room.imageUrl)} className="absolute inset-0 w-full h-full object-cover" alt="room" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-xs">Şəkil yoxdur</div>
                  )}
                  <div className="relative z-10 overflow-hidden flex items-center gap-[9px] opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEditRoomClick(room)} className="rounded-full bg-white flex items-center p-1 hover:text-[#00B4CC]">
                      <Pencil size={16} />
                    </button>
                    <button onClick={() => handleDeleteRoomClick(room.id)} className="rounded-full bg-white flex items-center p-1 hover:text-red-500">
                      <Trash2 size={16} />
                    </button>
                  </div>
                  {actionRoomId === room.id && (
                    <div className="absolute inset-0 bg-white/60 flex items-center justify-center rounded-2xl z-20">
                      <Loader2 className="animate-spin text-[#00B4CC]" size={28} />
                    </div>
                  )}
                </div>
                <div className="self-stretch h-8 rounded-lg bg-[#f9fafb] border border-[#e5e7eb] flex items-center p-[4px_12px]">
                  <input
                    type="text"
                    value={roomNames[room.id] !== undefined ? roomNames[room.id] : (room.name || "")}
                    onChange={(e) => setRoomNames(prev => ({ ...prev, [room.id]: e.target.value }))}
                    className="bg-transparent outline-none w-full tracking-[-0.15px] text-[#000]"
                  />
                </div>
              </div>
            </div>
          ))}

          {/* Empty upload slots */}
          {[...Array(Math.max(0, 9 - (gymInfo.rooms?.length || 0)))].map((_, i) => (
            <div key={`empty-${i}`} className="h-[224px] w-[180px] relative text-left text-[#717182]">
              <div className="absolute inset-0 flex flex-col items-start gap-3">
                <div
                  onClick={() => handleEmptySlotClick(i)}
                  className="self-stretch h-[180px] rounded-2xl border border-dashed border-[#d1d5dc] flex items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors relative overflow-hidden"
                >
                  <div className="flex flex-col items-center gap-4">
                    <Upload size={28} />
                    <div className="relative leading-[18px]">Upload</div>
                  </div>
                  {uploadingSlotIndex === i && isRoomAdding && (
                    <div className="absolute inset-0 bg-white/60 flex items-center justify-center rounded-2xl z-20">
                      <Loader2 className="animate-spin text-[#00B4CC]" size={28} />
                    </div>
                  )}
                </div>
                <div className="self-stretch h-8 rounded-lg bg-[#f9fafb] border border-[#e5e7eb] flex items-center p-[4px_12px]">
                  <input
                    type="text"
                    placeholder="Ad (məs: SPA)"
                    value={emptyRoomNames[i] || ""}
                    onChange={(e) => setEmptyRoomNames(prev => ({ ...prev, [i]: e.target.value }))}
                    className="bg-transparent outline-none w-full tracking-[-0.15px] placeholder:text-[#717182]"
                  />
                </div>
                <input
                  type="file"
                  ref={el => { roomInputRefs.current[i] = el; }}
                  onChange={(e) => handleEmptySlotFileChange(e, i)}
                  accept="image/*"
                  className="hidden"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
