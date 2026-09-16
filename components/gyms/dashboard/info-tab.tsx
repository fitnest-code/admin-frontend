"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Upload, Trash2, ChevronDown, Pencil, Loader2, Copy } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { 
  useGymDetailsAdmin, 
  useUpdateGymDetails, 
  useCategories,
  useUpdateGymCover,
  useAddGymRoomImages,
  useDeleteGymRoom,
  useUpdateGymRoomName
} from "@/lib/query/gym-query";
import { useGetAddressByCoords } from "@/lib/query/location-query";
import LocationPickerMap from "@/components/ui/location-picker-map";
import { SuccessAnimationModal } from "@/components/ui/success-animation-modal";
import { useI18nStore } from "@/lib/i18n";
import { toast } from "sonner";
import { apiGet, apiPost } from "@/lib/api/client";
import { emptyLanguageRecord, useLanguages } from "@/lib/query/use-languages";
import styles from "./info-tab.module.css";

interface InfoTabProps {
  gymId?: number | string
}

const getImageUrl = (urlOrFsId: string | undefined | null) => {
  if (!urlOrFsId) return "";
  if (urlOrFsId.startsWith("http") || urlOrFsId.startsWith("/")) return urlOrFsId;
  return `/api/v1/media/stream/${urlOrFsId}`;
};

const LOCAL_TRANSLATIONS: Record<string, Record<string, string>> = {
  AZ: {
    loading: "Yüklənir...",
    dataNotFound: "Məlumat tapılmadı",
    gymInfo: "Zal məlumatları",
    category: "Kateqoriya",
    select: "Seçin",
    notSpecified: "Göstərilməyib",
    gymName: "Zal adı",
    about: "Haqqında",
    gymPhotos: "Zal şəkilləri",
    coverPhoto: "Cover Şəkil",
    uploadCover: "Upload cover",
    otherPhotos: "Digər şəkillər",
    noImage: "Şəkil yoxdur",
    namePlaceholder: "Ad (məs: SPA)",
    contact: "Əlaqə",
    phoneNumber: "Telefon nömrəsi",
    email: "E-Poçt",
    city: "Şəhər",
    address: "Ünvan",
    creationDate: "Yaradılma tarixi",
    cancel: "Ləğv et",
    save: "Yadda saxla",
    successMessage: "Zal məlumatları uğurla yeniləndi!",
    pleaseEnterRoomName: "Zəhmət olmasa otaq adını daxil edin",
    coverUpdated: "Üz qabığı şəkli uğurla yeniləndi!",
    roomAdded: "Otaq şəkli uğurla əlavə edildi!",
    roomDeleted: "Otaq uğurla silindi!",
  },
  EN: {
    loading: "Loading...",
    dataNotFound: "Data not found",
    gymInfo: "Gym Information",
    category: "Category",
    select: "Select",
    notSpecified: "Not specified",
    gymName: "Gym Name",
    about: "About",
    gymPhotos: "Gym Photos",
    coverPhoto: "Cover Photo",
    uploadCover: "Upload cover",
    otherPhotos: "Other photos",
    noImage: "No image",
    namePlaceholder: "Name (e.g. SPA)",
    contact: "Contact",
    phoneNumber: "Phone number",
    email: "Email",
    city: "City",
    address: "Address",
    creationDate: "Creation date",
    cancel: "Cancel",
    save: "Save",
    successMessage: "Gym information updated successfully!",
    pleaseEnterRoomName: "Please enter a room name",
    coverUpdated: "Cover photo updated successfully!",
    roomAdded: "Room photo added successfully!",
    roomDeleted: "Room deleted successfully!",
  },
  RU: {
    loading: "Загрузка...",
    dataNotFound: "Данные не найдены",
    gymInfo: "Информация о зале",
    category: "Категория",
    select: "Выберите",
    notSpecified: "Не указано",
    gymName: "Название зала",
    about: "О зале",
    gymPhotos: "Фотографии зала",
    coverPhoto: "Обложка",
    uploadCover: "Загрузить обложку",
    otherPhotos: "Другие фотографии",
    noImage: "Нет изображения",
    namePlaceholder: "Название (напр. SPA)",
    contact: "Контакты",
    phoneNumber: "Номер телефона",
    email: "Email",
    city: "Город",
    address: "Адрес",
    creationDate: "Дата создания",
    cancel: "Отмена",
    save: "Сохранить",
    successMessage: "Информация о зале успешно обновлена!",
    pleaseEnterRoomName: "Пожалуйста, введите название комнаты",
    coverUpdated: "Фото обложки успешно обновлено!",
    roomAdded: "Фото комнаты успешно добавлено!",
    roomDeleted: "Комната успешно удалена!",
  },
};

export function InfoTab({ gymId }: InfoTabProps) {
  const { languages } = useLanguages();
  const primaryLang = languages.includes("AZ") ? "AZ" : languages[0] ?? "AZ";
  const [isEditing, setIsEditing] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  const { data: gymInfo, isLoading } = useGymDetailsAdmin(gymId);
  const { mutate: updateGymInfo, isPending } = useUpdateGymDetails();
  const { data: categoriesData } = useCategories();

  const { mutate: updateGymCover, isPending: isCoverUpdating } = useUpdateGymCover();
  const { mutate: addRoomImages, isPending: isRoomAdding } = useAddGymRoomImages();
  const { mutate: deleteGymRoom, isPending: isRoomDeleting } = useDeleteGymRoom();
  const updateRoomNameMutate = useUpdateGymRoomName();

  const [roomNames, setRoomNames] = useState<Record<number, string>>({});

  const coverInputRef = useRef<HTMLInputElement | null>(null);
  const editRoomInputRef = useRef<HTMLInputElement | null>(null);
  const roomInputRefs = useRef<Record<number, HTMLInputElement | null>>({});

  const [emptyRoomNames, setEmptyRoomNames] = useState<Record<number, string>>({});
  const [editingRoom, setEditingRoom] = useState<{ id: number; name: string } | null>(null);
  const [actionRoomId, setActionRoomId] = useState<number | null>(null);
  const [uploadingSlotIndex, setUploadingSlotIndex] = useState<number | null>(null);
  
  const locale = useI18nStore((s) => s.locale);
  const lt = LOCAL_TRANSLATIONS[locale] || LOCAL_TRANSLATIONS.AZ;

  // --- Translation state (AZ/EN/RU) ---
  const [infoLangTab, setInfoLangTab] = useState<string>(primaryLang);
  const [gymNames, setGymNames] = useState<Record<string, string>>(() => emptyLanguageRecord(languages));
  const [gymCatDescs, setGymCatDescs] = useState<Record<string, Record<number, string>>>(() =>
    Object.fromEntries(languages.map((lang) => [lang, {}]))
  );
  const [initialGymNames, setInitialGymNames] = useState<Record<string, string>>(() => emptyLanguageRecord(languages));
  const [initialGymCatDescs, setInitialGymCatDescs] = useState<Record<string, Record<number, string>>>(() =>
    Object.fromEntries(languages.map((lang) => [lang, {}]))
  );
  const [translationsLoaded, setTranslationsLoaded] = useState(false);

  const [isMainDropdownOpen, setIsMainDropdownOpen] = useState(false);
  const [isSubDropdownOpen, setIsSubDropdownOpen] = useState(false);
  const mainDropdownRef = useRef<HTMLDivElement>(null);
  const subDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (mainDropdownRef.current && !mainDropdownRef.current.contains(event.target as Node)) {
        setIsMainDropdownOpen(false);
      }
      if (subDropdownRef.current && !subDropdownRef.current.contains(event.target as Node)) {
        setIsSubDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const [formData, setFormData] = useState({
    mainCategoryIds: [] as number[],
    subCategoryIds: [] as number[],
    name: "",
    description: "",
    phone: "",
    email: "",
    city: "",
    address: "",
    latitude: 0,
    longitude: 0,
  });

  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);
  const [catDescriptions, setCatDescriptions] = useState<Record<number, string>>({});

  const allCategories = useMemo(() => {
    if (!categoriesData?.items) return [];
    const selectedMain = categoriesData.items.filter(c => formData.mainCategoryIds.includes(c.id));
    const selectedSub = categoriesData.items.filter(c => formData.subCategoryIds.includes(c.id));
    return [...selectedMain, ...selectedSub];
  }, [categoriesData, formData.mainCategoryIds, formData.subCategoryIds]);

  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  const [activeSearchField, setActiveSearchField] = useState<"city" | "address" | null>(null);

  // Local inputs state for coordinates
  const [isUpdatingFromCoords, setIsUpdatingFromCoords] = useState(false);

  // 1. Koordinat dəyişdikcə ünvanı gətirən query
  const { data: revAddressData, isFetching: isAddressFetching } = useGetAddressByCoords(
    formData.latitude,
    formData.longitude,
    isEditing && isUpdatingFromCoords
  );

  const debouncedSearch = (query: string, field: "city" | "address") => {
    setActiveSearchField(field);
    if (searchTimeout) clearTimeout(searchTimeout);
    if (!query || query.length < 3) {
      setSuggestions([]);
      return;
    }
    const timeout = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/v1/admin/gyms/geocoding/forward?query=${encodeURIComponent(query)}`);
        const data = await res.json();
        setSuggestions(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Geocoding error:", error);
      } finally {
        setIsSearching(false);
      }
    }, 600);
    setSearchTimeout(timeout);
  };

  const handleSelectSuggestion = (s: any) => {
    const lat = typeof s.latitude === "number" ? s.latitude : parseFloat(s.lat || 0);
    const lng = typeof s.longitude === "number" ? s.longitude : parseFloat(s.lon || 0);
    let city = s.city || formData.city;
    if (!city && s.address) {
      city = s.address.city || s.address.town || s.address.village;
    }
    const suggestedText = s.addressText || s.display_name || "";
    
    // Extract custom typed numbers/house indicators missing from the map result
    const matchNumber = formData.address.match(/\b\d+(?:\/[a-zA-Z0-9]+|-[a-zA-Z0-9]+|[a-zA-Z])?\b/);
    let finalAddress = suggestedText;
    
    if (matchNumber && !suggestedText.includes(matchNumber[0])) {
      const parts = suggestedText.split(',');
      parts[0] = `${parts[0].trim()} ${matchNumber[0]}`;
      finalAddress = parts.join(', ');
    }

    setIsUpdatingFromCoords(false);
    setFormData(prev => ({
      ...prev,
      latitude: lat,
      longitude: lng,
      address: finalAddress,
      city: city || ""
    }));
    setSuggestions([]);
  };

  const initialDataStr = gymInfo ? JSON.stringify({
    mainCategoryIds: gymInfo.mainCategories?.map((c: any) => c.id) || (gymInfo.category ? [gymInfo.category.id] : []),
    subCategoryIds: gymInfo.subCategories?.map((c: any) => c.id) || (gymInfo.subCategory ? [gymInfo.subCategory.id] : []),
    name: gymInfo.name || "",
    description: gymInfo.description || "",
    phone: gymInfo.phone || "",
    email: gymInfo.email || "",
    city: gymInfo.city || "",
    address: gymInfo.address || "",
    latitude: gymInfo.latitude || 0,
    longitude: gymInfo.longitude || 0,
  }) : "";

  const initialDescsStr = gymInfo ? JSON.stringify(
    (() => {
      const descs: Record<number, string> = {};
      const allCats = [
        ...(gymInfo.mainCategories || []),
        ...(gymInfo.subCategories || []),
        ...(gymInfo.categories || [])
      ];
      if (gymInfo.descriptions && gymInfo.descriptions.length > 0) {
        gymInfo.descriptions.forEach((d: any) => {
          descs[d.categoryId] = d.description || "";
        });
      } else {
        allCats.forEach((c: any) => {
          descs[c.id] = gymInfo.description || "";
        });
      }
      return descs;
    })()
  ) : "";

  const hasRoomNameChanges = isEditing && gymInfo?.rooms?.some(
    room => roomNames[room.id] !== undefined && roomNames[room.id] !== room.name
  );

  const hasChanges = isEditing && (
    JSON.stringify(formData) !== initialDataStr || 
    hasRoomNameChanges || 
    JSON.stringify(catDescriptions) !== initialDescsStr ||
    JSON.stringify(gymNames) !== JSON.stringify(initialGymNames) ||
    JSON.stringify(gymCatDescs) !== JSON.stringify(initialGymCatDescs)
  );

  useEffect(() => {
    if (gymInfo) {
      setFormData({
        mainCategoryIds: gymInfo.mainCategories?.map((c: any) => c.id) || (gymInfo.category ? [gymInfo.category.id] : []),
        subCategoryIds: gymInfo.subCategories?.map((c: any) => c.id) || (gymInfo.subCategory ? [gymInfo.subCategory.id] : []),
        name: gymInfo.name || "",
        description: gymInfo.description || "",
        phone: gymInfo.phone || "",
        email: gymInfo.email || "",
        city: gymInfo.city || "",
        address: gymInfo.address || "",
        latitude: gymInfo.latitude || 0,
        longitude: gymInfo.longitude || 0,
      });
      setIsUpdatingFromCoords(false);

      // Sync category-specific descriptions
      const descs: Record<number, string> = {};
      const allCats = [
        ...(gymInfo.mainCategories || []),
        ...(gymInfo.subCategories || []),
        ...(gymInfo.categories || [])
      ];
      if (gymInfo.descriptions && gymInfo.descriptions.length > 0) {
        gymInfo.descriptions.forEach((d: any) => {
          descs[d.categoryId] = d.description || "";
        });
      } else {
        allCats.forEach((c: any) => {
          descs[c.id] = gymInfo.description || "";
        });
      }
      setCatDescriptions(descs);

      if (allCats.length > 0 && activeCategoryId === null) {
        setActiveCategoryId(allCats[0].id);
      }

      if (gymInfo.rooms) {
        const names: Record<number, string> = {};
        gymInfo.rooms.forEach(r => {
          names[r.id] = r.name || "";
        });
        setRoomNames(names);
      }

      // Sync AZ translations
      setGymNames((prev) => ({ ...emptyLanguageRecord(languages), ...prev, [primaryLang]: gymInfo.name || "" }));
      const azDescs: Record<number, string> = {};
      const syncCats = [
        ...(gymInfo.mainCategories || []),
        ...(gymInfo.subCategories || []),
        ...(gymInfo.categories || [])
      ];
      if (gymInfo.descriptions && gymInfo.descriptions.length > 0) {
        gymInfo.descriptions.forEach((d: any) => { azDescs[d.categoryId] = d.description || ""; });
      } else {
        syncCats.forEach((c: any) => { azDescs[c.id] = gymInfo.description || ""; });
      }
      setGymCatDescs((prev) => ({ ...Object.fromEntries(languages.map((lang) => [lang, {}])), ...prev, [primaryLang]: azDescs }));
    }
  }, [gymInfo, languages, primaryLang]);

  // Fetch translations when entering edit mode
  useEffect(() => {
    if (isEditing && gymId && !translationsLoaded) {
      const fetchTranslations = async () => {
        try {
          // Fetch gym name translations
          const nameRes = await apiGet<any[]>('/admin/translations', {
            params: { entityType: 'GYM', entityId: String(gymId), fieldName: 'name' }
          });
          const nameList = Array.isArray(nameRes) ? nameRes : (nameRes as any)?.data || [];
          const newNames: Record<string, string> = { ...gymNames };
          nameList.forEach((item: any) => {
            if (item.languageCode && item.fieldName === 'name') {
              const lang = String(item.languageCode).toUpperCase();
              if (languages.includes(lang)) {
                newNames[lang] = item.fieldValue || '';
              }
            }
          });
          setGymNames(newNames);
          setInitialGymNames(newNames);

          // Fetch gym description translations
          const descRes = await apiGet<any[]>('/admin/translations', {
            params: { entityType: 'GYM', entityId: String(gymId) }
          });
          const descList = Array.isArray(descRes) ? descRes : (descRes as any)?.data || [];
          const newDescs: Record<string, Record<number, string>> = { ...gymCatDescs };
          descList.forEach((item: any) => {
            if (item.languageCode && item.fieldName) {
              const lang = item.languageCode.toUpperCase();
              if (lang === primaryLang) return;
              if (!languages.includes(lang)) return;
              if (!newDescs[lang]) newDescs[lang] = {};
              if (item.fieldName === 'description') {
                // General description (used as fallback)
              } else if (item.fieldName.startsWith('description_')) {
                const catId = parseInt(item.fieldName.replace('description_', ''), 10);
                if (!isNaN(catId)) {
                  newDescs[lang][catId] = item.fieldValue || '';
                }
              }
            }
          });
          setGymCatDescs(newDescs);
          setInitialGymCatDescs(JSON.parse(JSON.stringify(newDescs)));
          setTranslationsLoaded(true);
        } catch (e) {
          console.error('Failed to fetch gym translations:', e);
        }
      };
      fetchTranslations();
    }
    if (!isEditing) {
      setTranslationsLoaded(false);
      setInfoLangTab(primaryLang);
      setInitialGymNames(emptyLanguageRecord(languages));
      setInitialGymCatDescs(Object.fromEntries(languages.map((lang) => [lang, {}])));
    }
  }, [isEditing, gymId, translationsLoaded, languages, primaryLang]);

  useEffect(() => {
    if (allCategories.length > 0) {
      if (activeCategoryId === null || !allCategories.some(c => c.id === activeCategoryId)) {
        setActiveCategoryId(allCategories[0].id);
      }
    } else {
      setActiveCategoryId(null);
    }
  }, [allCategories, activeCategoryId]);

  // Sync reverse geocoding result to address field
  useEffect(() => {
    if (isEditing && isUpdatingFromCoords && !isAddressFetching && (revAddressData?.addressText || revAddressData?.city)) {
      const latDiff = Math.abs((revAddressData.latitude || 0) - formData.latitude);
      const lngDiff = Math.abs((revAddressData.longitude || 0) - formData.longitude);
      if (latDiff < 0.0001 && lngDiff < 0.0001) {
        const fullAddr = [revAddressData.addressText, revAddressData.city].filter(Boolean).join(", ");
        setFormData(prev => ({
          ...prev,
          address: fullAddr,
          city: revAddressData.city || prev.city || ""
        }));
        setIsUpdatingFromCoords(false);
      }
    }
  }, [revAddressData, isAddressFetching, isEditing, isUpdatingFromCoords, formData.latitude, formData.longitude]);

  const handleCoverClick = () => {
    if (isEditing && coverInputRef.current) {
      coverInputRef.current.click();
    }
  };

  const handleCoverFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && gymId) {
      updateGymCover({ id: Number(gymId), file }, {
        onSuccess: () => {
          toast.success(lt.coverUpdated);
        },
        onError: (err: any) => {
          toast.error(err?.message || "Error uploading cover photo");
        }
      });
    }
  };

  const handleEmptySlotClick = (index: number) => {
    const name = emptyRoomNames[index]?.trim();
    if (!name) {
      toast.error(lt.pleaseEnterRoomName);
      return;
    }
    if (roomInputRefs.current[index]) {
      roomInputRefs.current[index]?.click();
    }
  };

  const handleEmptySlotFileChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    const name = emptyRoomNames[index]?.trim();
    if (file && name && gymId) {
      setUploadingSlotIndex(index);
      addRoomImages({ id: Number(gymId), roomNames: [name], files: [file] }, {
        onSuccess: () => {
          toast.success(lt.roomAdded);
          setEmptyRoomNames(prev => ({ ...prev, [index]: "" }));
          setUploadingSlotIndex(null);
        },
        onError: (err: any) => {
          toast.error(err?.message || "Error uploading room photo");
          setUploadingSlotIndex(null);
        }
      });
    }
  };

  const handleEditRoomClick = (room: any) => {
    setEditingRoom({ id: room.id, name: room.name });
    if (editRoomInputRef.current) {
      editRoomInputRef.current.click();
    }
  };

  const handleEditRoomFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editingRoom && gymId) {
      const roomToReplace = { ...editingRoom };
      setActionRoomId(roomToReplace.id);
      deleteGymRoom({ id: Number(gymId), roomId: roomToReplace.id }, {
        onSuccess: () => {
          addRoomImages({ id: Number(gymId), roomNames: [roomToReplace.name], files: [file] }, {
            onSuccess: () => {
              toast.success(lt.roomAdded);
              setActionRoomId(null);
              setEditingRoom(null);
            },
            onError: (err: any) => {
              toast.error(err?.message || "Error uploading new photo");
              setActionRoomId(null);
              setEditingRoom(null);
            }
          });
        },
        onError: (err: any) => {
          toast.error(err?.message || "Error removing old photo");
          setActionRoomId(null);
          setEditingRoom(null);
        }
      });
    }
  };

  const handleDeleteRoomClick = (roomId: number) => {
    if (gymId) {
      setActionRoomId(roomId);
      deleteGymRoom({ id: Number(gymId), roomId }, {
        onSuccess: () => {
          toast.success(lt.roomDeleted);
          setActionRoomId(null);
        },
        onError: (err: any) => {
          toast.error(err?.message || "Error deleting room");
          setActionRoomId(null);
        }
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const selectMainCategory = (id: number) => {
    setFormData(prev => {
      const exists = prev.mainCategoryIds.includes(id);
      const newMain = exists
        ? prev.mainCategoryIds.filter(x => x !== id)
        : [...prev.mainCategoryIds, id];
      const newSub = prev.subCategoryIds.filter(x => !newMain.includes(x));
      return {
        ...prev,
        mainCategoryIds: newMain,
        subCategoryIds: newSub
      };
    });
  };

  const selectSubCategory = (id: number) => {
    setFormData(prev => {
      const exists = prev.subCategoryIds.includes(id);
      const newSub = exists
        ? prev.subCategoryIds.filter(x => x !== id)
        : [...prev.subCategoryIds, id];
      const newMain = prev.mainCategoryIds.filter(x => !newSub.includes(x));
      return {
        ...prev,
        mainCategoryIds: newMain,
        subCategoryIds: newSub
      };
    });
  };

  const saveGymTranslations = async () => {
    if (!gymId) return;
    const payload: any[] = [];
    // Gym name translations (EN, RU)
    for (const lang of languages.filter((l) => l !== primaryLang)) {
      const val = gymNames[lang];
      if (val && val.trim()) {
        payload.push({
          entityType: "GYM",
          entityId: String(gymId),
          fieldName: "name",
          languageCode: lang,
          fieldValue: val.trim(),
        });
      }
    }
    for (const lang of languages.filter((l) => l !== primaryLang)) {
      const descs = gymCatDescs[lang] || {};
      for (const [catId, val] of Object.entries(descs)) {
        if (val && (val as string).trim()) {
          payload.push({
            entityType: "GYM",
            entityId: String(gymId),
            fieldName: `description_${catId}`,
            languageCode: lang,
            fieldValue: (val as string).trim(),
          });
        }
      }
    }
    if (payload.length > 0) {
      try {
        await apiPost("/admin/translations/bulk", payload);
      } catch (e) {
        console.error("Failed to save gym translations:", e);
      }
    }
  };

  const handleSave = async () => {
    if (!gymId || !gymInfo) return;
    const info = gymInfo;

    try {
      if (info.rooms) {
        const renamePromises = info.rooms
          .filter(room => roomNames[room.id] !== undefined && roomNames[room.id] !== room.name)
          .map(room => {
            return updateRoomNameMutate.mutateAsync({
              id: Number(gymId),
              roomId: room.id,
              name: roomNames[room.id].trim()
            });
          });
        
        if (renamePromises.length > 0) {
          await Promise.all(renamePromises);
        }
      }

      const infoHasChanges = JSON.stringify(formData) !== initialDataStr || JSON.stringify(catDescriptions) !== initialDescsStr;
      if (infoHasChanges) {
        updateGymInfo({
          id: Number(gymId),
          payload: {
            mainCategoryDetails: formData.mainCategoryIds.map((id: number) => {
              const existingDesc = info.descriptions?.find((d: any) => d.categoryId === id);
              return {
                categoryId: id,
                phone: existingDesc?.phone || info.phone || '',
                description: catDescriptions[id] || '',
                coverImageUrl: existingDesc?.coverImageUrl || ''
              };
            }),
            subCategoryDetails: formData.subCategoryIds.map((id: number) => {
              const existingDesc = info.descriptions?.find((d: any) => d.categoryId === id);
              return {
                categoryId: id,
                phone: existingDesc?.phone || info.phone || '',
                description: catDescriptions[id] || '',
                coverImageUrl: existingDesc?.coverImageUrl || ''
              };
            }),
            name: formData.name,
            description: allCategories.length > 0 ? (catDescriptions[allCategories[0].id] || '') : formData.description,
            phone: formData.phone,
            email: formData.email.trim() === "" ? null : formData.email.trim(),
            city: formData.city,
            address: formData.address,
            latitude: Number(formData.latitude),
            longitude: Number(formData.longitude),
            altitude: (info as any).altitude || null
          }
        }, {
          onSuccess: async () => {
            // Save translations for gym name and category descriptions
            await saveGymTranslations();
            setIsEditing(false);
            setShowSuccessModal(true);
          }
        });
      } else {
        // Even if no AZ data changed, translations may have changed
        await saveGymTranslations();
        setIsEditing(false);
        setShowSuccessModal(true);
      }
    } catch (err: any) {
      toast.error(err?.message || "Otaq adlarının yenilənməsində xəta baş verdi");
    }
  };

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">{lt.loading}</div>;
  if (!gymInfo) return <div className="p-8 text-center text-muted-foreground">{lt.dataNotFound}</div>;

  return (
    <div className="w-full rounded-[12px] bg-white border border-[#ececed] flex flex-col items-start p-4 sm:p-5 gap-8 text-left text-sm text-foreground font-sans shadow-sm">
      
      {/* Zal məlumatları Group */}
      <div className="self-stretch flex flex-col items-start gap-[28px]">
        
      {/* Header */}
      <div className="self-stretch border-b border-[#ececed] flex items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <div className="text-base font-semibold text-[#101828] font-sans tracking-tight">{lt.gymInfo}</div>
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
          >
            <Pencil size={18} className={isEditing ? "text-[#00B4CC]" : "text-[#6a7282]"} />
          </button>
        </div>
      </div>

        {/* Inputs */}
        <div className="self-stretch flex flex-col items-start gap-5">
          
          {/* Kateqoriyalar (Əsas və Alt) */}
          <div className="flex flex-col md:flex-row gap-4 w-full">
            {/* Əsas Kateqoriya */}
            <div className={cn(styles.kateqoriyaParent, "flex-1")} ref={mainDropdownRef}>
              <div className={styles.kateqoriya}>{lt.category}</div>
              
              {isEditing ? (
                <>
                  <div 
                    className={styles.frameWrapper}
                    onClick={() => {
                      setIsMainDropdownOpen(!isMainDropdownOpen);
                      setIsSubDropdownOpen(false);
                    }}
                  >
                    <div className={styles.frameParent}>
                      <div className={styles.frameGroup}>
                        {formData.mainCategoryIds.length === 0 ? (
                          <span className={styles.placeholder}>{lt.select}</span>
                        ) : (
                          (() => {
                            const selectedCats = categoriesData?.items?.filter(c => formData.mainCategoryIds.includes(c.id)) || [];
                            return selectedCats.length > 0 ? (
                              <div className="flex flex-wrap gap-1.5 max-w-full overflow-hidden">
                                {selectedCats.map(cat => (
                                  <div key={cat.id} className={styles.frameContainer}>
                                    <div className={styles.yogaWrapper}>
                                      <span className={styles.yoga}>{cat.name}</span>
                                    </div>
                                    <div 
                                      className={styles.x}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        selectMainCategory(cat.id);
                                      }}
                                    >
                                      <div className={styles.x2}>
                                        <Image 
                                          className={styles.vectorIcon} 
                                          width={15} 
                                          height={15} 
                                          sizes="100vw" 
                                          alt="Remove"
                                          src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PGxpbmUgeDE9IjE4IiB5MT0iNiIgeDI9IjYiIHkyPSIxOCI+PC9saW5lPjxsaW5lIHgxPSI2IiB5MT0iNiIgeDI9IjE4IiB5Mj0iMTgiPjwvbGluZT48L3N2Zz4="
                                        />
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span className={styles.placeholder}>{lt.loading}</span>
                            );
                          })()
                        )}
                      </div>
                      <div className={styles.x}>
                        <Image 
                          className={styles.vuesaxlineararrowDownIcon} 
                          width={24} 
                          height={24} 
                          sizes="100vw" 
                          alt="Open"
                          src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMTAxODI4IiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PHBhdGggZD0iTTUgOGw3IDcgNy03Ii8+PC9zdmc+"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {isMainDropdownOpen && (
                    <div className={styles.dropdownMenu}>
                      {categoriesData?.items && categoriesData.items.length > 0 ? (
                        categoriesData.items
                          .filter(cat => !formData.subCategoryIds.includes(cat.id))
                          .map((cat) => {
                            const isSelected = formData.mainCategoryIds.includes(cat.id);
                            return (
                              <div
                                key={cat.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  selectMainCategory(cat.id);
                                }}
                                className={cn(
                                  styles.dropdownItem,
                                  isSelected && styles.dropdownItemActive
                                )}
                              >
                                <div className="flex items-center gap-3">
                                  <div className={cn(
                                    styles.checkbox,
                                    isSelected && styles.checkboxActive
                                  )}>
                                    {isSelected && (
                                      <svg className={styles.checkboxIcon} viewBox="0 0 24 24">
                                        <polyline points="20 6 9 17 4 12" />
                                      </svg>
                                    )}
                                  </div>
                                  <span>{cat.name}</span>
                                </div>
                              </div>
                            );
                          })
                      ) : (
                        <div className="p-4 text-center text-sm text-black/40">
                          {lt.notSpecified}
                        </div>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div className={styles.frameWrapper}>
                  <div className={styles.frameParent}>
                    <div className={styles.frameGroup}>
                      {(() => {
                        const mainIds = gymInfo.mainCategories?.map((c: any) => c.id) || (gymInfo.category ? [gymInfo.category.id] : []);
                        const selectedCats = categoriesData?.items?.filter(c => mainIds.includes(c.id)) || gymInfo.mainCategories || (gymInfo.category ? [gymInfo.category] : []);
                        return selectedCats && selectedCats.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {selectedCats.map((cat: any) => (
                              <div key={cat.id} className={styles.frameContainer}>
                                <div className={styles.yogaWrapper}>
                                  <div className={styles.yoga}>{cat.name}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className={styles.placeholder}>{lt.notSpecified}</span>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Alt Kateqoriya */}
            <div className={cn(styles.kateqoriyaParent, "flex-1")} ref={subDropdownRef}>
              <div className={styles.kateqoriya}>
                {locale === "AZ" ? "Alt kateqoriya" : locale === "RU" ? "Подкатегория" : "Subcategory"}
              </div>
              
              {isEditing ? (
                <>
                  <div 
                    className={styles.frameWrapper}
                    onClick={() => {
                      setIsSubDropdownOpen(!isSubDropdownOpen);
                      setIsMainDropdownOpen(false);
                    }}
                  >
                    <div className={styles.frameParent}>
                      <div className={styles.frameGroup}>
                        {formData.subCategoryIds.length === 0 ? (
                          <span className={styles.placeholder}>{lt.select}</span>
                        ) : (
                          (() => {
                            const selectedCats = categoriesData?.items?.filter(c => formData.subCategoryIds.includes(c.id)) || [];
                            return selectedCats.length > 0 ? (
                              <div className="flex flex-wrap gap-1.5 max-w-full overflow-hidden">
                                {selectedCats.map(cat => (
                                  <div key={cat.id} className={styles.frameContainer}>
                                    <div className={styles.yogaWrapper}>
                                      <span className={styles.yoga}>{cat.name}</span>
                                    </div>
                                    <div 
                                      className={styles.x}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        selectSubCategory(cat.id);
                                      }}
                                    >
                                      <div className={styles.x2}>
                                        <Image 
                                          className={styles.vectorIcon} 
                                          width={15} 
                                          height={15} 
                                          sizes="100vw" 
                                          alt="Remove"
                                          src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PGxpbmUgeDE9IjE4IiB5MT0iNiIgeDI9IjYiIHkyPSIxOCI+PC9saW5lPjxsaW5lIHgxPSI2IiB5MT0iNiIgeDI9IjE4IiB5Mj0iMTgiPjwvbGluZT48L3N2Zz4="
                                        />
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span className={styles.placeholder}>{lt.loading}</span>
                            );
                          })()
                        )}
                      </div>
                      <div className={styles.x}>
                        <Image 
                          className={styles.vuesaxlineararrowDownIcon} 
                          width={24} 
                          height={24} 
                          sizes="100vw" 
                          alt="Open"
                          src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMTAxODI4IiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PHBhdGggZD0iTTUgOGw3IDcgNy03Ii8+PC9zdmc+"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {isSubDropdownOpen && (
                    <div className={styles.dropdownMenu}>
                      {categoriesData?.items && categoriesData.items.length > 0 ? (
                        categoriesData.items
                          .filter(cat => !formData.mainCategoryIds.includes(cat.id))
                          .map((cat) => {
                            const isSelected = formData.subCategoryIds.includes(cat.id);
                            return (
                              <div
                                key={cat.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  selectSubCategory(cat.id);
                                }}
                                className={cn(
                                  styles.dropdownItem,
                                  isSelected && styles.dropdownItemActive
                                )}
                              >
                                <div className="flex items-center gap-3">
                                  <div className={cn(
                                    styles.checkbox,
                                    isSelected && styles.checkboxActive
                                  )}>
                                    {isSelected && (
                                      <svg className={styles.checkboxIcon} viewBox="0 0 24 24">
                                        <polyline points="20 6 9 17 4 12" />
                                      </svg>
                                    )}
                                  </div>
                                  <span>{cat.name}</span>
                                </div>
                              </div>
                            );
                          })
                      ) : (
                        <div className="p-4 text-center text-sm text-black/40">
                          {lt.notSpecified}
                        </div>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div className={styles.frameWrapper}>
                  <div className={styles.frameParent}>
                    <div className={styles.frameGroup}>
                      {(() => {
                        const subIds = gymInfo.subCategories?.map((c: any) => c.id) || (gymInfo.subCategory ? [gymInfo.subCategory.id] : []);
                        const selectedCats = categoriesData?.items?.filter(c => subIds.includes(c.id)) || gymInfo.subCategories || (gymInfo.subCategory ? [gymInfo.subCategory] : []);
                        return selectedCats && selectedCats.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {selectedCats.map((cat: any) => (
                              <div key={cat.id} className={styles.frameContainer}>
                                <div className={styles.yogaWrapper}>
                                  <div className={styles.yoga}>{cat.name}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className={styles.placeholder}>{lt.notSpecified}</span>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Language Tabs (only in edit mode) */}
          {isEditing && (
            <div className="w-full flex items-center border-b border-[#ececed] gap-1">
              {languages.map((lang) => (
                <button key={lang} type="button" onClick={() => setInfoLangTab(lang)}
                  className={`px-4 py-2 text-[13px] font-semibold transition-all border-b-2 ${
                    infoLangTab === lang ? "border-[#00b4cc] text-[#00b4cc]" : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}>{lang}</button>
              ))}
            </div>
          )}

          {/* Zal adı */}
          <div className="flex flex-col items-start gap-3 w-full">
            <div className="self-stretch relative leading-[24px]">{lt.gymName} {isEditing && infoLangTab !== primaryLang ? `(${infoLangTab})` : ""}</div>
            <div className={cn(
              "self-stretch h-[44px] rounded-lg border flex items-center p-[0px_12px] text-sm transition-colors",
              isEditing ? "bg-white border-[#ececed] focus-within:border-[#00B4CC]" : "bg-[#fafafa] border-[#ececed]"
            )}>
              <input 
                type="text" 
                name="name"
                value={infoLangTab === primaryLang ? formData.name : (gymNames[infoLangTab] || "")}
                onChange={(e) => {
                  if (infoLangTab === primaryLang) {
                    handleChange(e);
                  } else {
                    setGymNames(prev => ({ ...prev, [infoLangTab]: e.target.value }));
                  }
                }}
                readOnly={!isEditing}
                placeholder={infoLangTab === primaryLang ? "" : `Name (${infoLangTab})`}
                className="bg-transparent text-foreground outline-none w-full h-full"
              />
            </div>
          </div>

          {/* Haqqında */}
          <div className="self-stretch flex flex-col items-start gap-3 w-full">
            <div className="self-stretch relative leading-[24px]">{lt.about} {isEditing && infoLangTab !== primaryLang ? `(${infoLangTab})` : ""}</div>
            
            {/* Category selection inside description if there are categories */}
            {allCategories.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-1">
                {allCategories.map(cat => {
                  const isActive = activeCategoryId === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setActiveCategoryId(cat.id)}
                      className={cn(
                        "h-8 px-4 rounded-full text-xs font-semibold transition-all border",
                        isActive 
                          ? "bg-[#00B4CC] border-[#00B4CC] text-white" 
                          : "bg-white border-[#ececed] text-[#4a5565] hover:bg-slate-50"
                      )}
                    >
                      {cat.name}
                    </button>
                  );
                })}
              </div>
            )}

            {activeCategoryId !== null ? (
              <div className={cn(
                "self-stretch min-h-[80px] rounded-lg border flex flex-col items-start p-[8px_12px] text-sm transition-colors w-full",
                isEditing ? "bg-white border-[#ececed] focus-within:border-[#00B4CC]" : "bg-[#fafafa] border-[#ececed]"
              )}>
                <textarea 
                  name="description"
                  value={infoLangTab === primaryLang
                    ? (catDescriptions[activeCategoryId] || "")
                    : (gymCatDescs[infoLangTab]?.[activeCategoryId] || "")}
                  onChange={(e) => {
                    if (infoLangTab === primaryLang) {
                      setCatDescriptions(prev => ({ ...prev, [activeCategoryId!]: e.target.value }));
                    } else {
                      setGymCatDescs(prev => ({
                        ...prev,
                        [infoLangTab]: { ...prev[infoLangTab], [activeCategoryId!]: e.target.value }
                      }));
                    }
                  }}
                  readOnly={!isEditing}
                  placeholder={infoLangTab === primaryLang
                    ? `${allCategories.find(c => c.id === activeCategoryId)?.name} haqqında məlumat...`
                    : `Description (${infoLangTab})...`}
                  className="bg-transparent text-foreground outline-none w-full h-full min-h-[64px] resize-none"
                />
              </div>
            ) : (
              <div className={cn(
                "self-stretch min-h-[80px] rounded-lg border flex flex-col items-start p-[8px_12px] text-sm transition-colors w-full",
                isEditing ? "bg-white border-[#ececed] focus-within:border-[#00B4CC]" : "bg-[#fafafa] border-[#ececed]"
              )}>
                <textarea 
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  readOnly={!isEditing}
                  className="bg-transparent text-foreground outline-none w-full h-full min-h-[64px] resize-none"
                />
              </div>
            )}
          </div>


        </div>
      </div>




      {/* Ünvan Group */}
      <div className="self-stretch flex flex-col items-start gap-[28px]">
        <div className="self-stretch border-b border-[#ececed] flex items-center justify-between pb-1">
          <div className="relative leading-[24px] font-semibold text-base">{lt.address}</div>
        </div>

        <div className="self-stretch flex flex-col items-start gap-5">
          <div className="self-stretch flex flex-col sm:flex-row items-center justify-between gap-5">
            {/* Şəhər */}
            <div className="flex-1 w-full flex flex-col items-start gap-3 relative">
              <div className="self-stretch relative leading-[24px]">{lt.city}</div>
              <div className={cn(
                "self-stretch h-[44px] rounded-lg border flex items-center p-[0px_12px] text-sm transition-colors relative",
                isEditing ? "bg-white border-[#ececed] focus-within:border-[#00B4CC]" : "bg-[#fafafa] border-[#ececed]"
              )}>
                <input 
                  type="text" 
                  name="city"
                  value={formData.city}
                  onChange={(e) => {
                    handleChange(e);
                    if (isEditing) debouncedSearch(e.target.value, "city");
                  }}
                  readOnly={!isEditing}
                  className="bg-transparent text-foreground outline-none w-full h-full"
                  autoComplete="off"
                />
                {isSearching && activeSearchField === "city" && <Loader2 size={18} className="absolute right-4 animate-spin text-[#00B4CC]" />}
              </div>

              {/* Suggestions Dropdown for City */}
              {isEditing && suggestions.length > 0 && activeSearchField === "city" && (
                <div className="absolute top-[90px] left-0 right-0 z-[1000] bg-white border border-[#ECECED] rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2">
                  {suggestions.map((s, i) => {
                    const text = s.addressText || s.display_name || "";
                    const shortText = text.split(',')[0] || text;
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleSelectSuggestion(s)}
                        className="w-full text-left px-4 py-3 text-sm font-medium hover:bg-slate-50 border-b border-slate-100 last:border-0 transition-colors flex flex-col gap-0.5"
                      >
                        <span className="text-slate-800">{shortText}</span>
                        <span className="text-xs text-slate-400 truncate">{text}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Ünvan */}
            <div className="flex-1 w-full flex flex-col items-start gap-3 relative">
              <div className="self-stretch relative leading-[24px]">{lt.address}</div>
              <div className={cn(
                "self-stretch h-[44px] rounded-lg border flex items-center p-[0px_12px] text-sm transition-colors relative",
                isEditing ? "bg-white border-[#ececed] focus-within:border-[#00B4CC]" : "bg-[#fafafa] border-[#ececed]"
              )}>
                <input 
                  type="text" 
                  name="address"
                  value={formData.address}
                  onChange={(e) => {
                    handleChange(e);
                    if (isEditing) debouncedSearch(e.target.value, "address");
                  }}
                  readOnly={!isEditing}
                  className="bg-transparent text-foreground outline-none w-full h-full"
                  autoComplete="off"
                />
                {isSearching && activeSearchField === "address" && <Loader2 size={18} className="absolute right-4 animate-spin text-[#00B4CC]" />}
              </div>

              {/* Suggestions Dropdown for Address */}
              {isEditing && suggestions.length > 0 && activeSearchField === "address" && (
                <div className="absolute top-[90px] left-0 right-0 z-[1000] bg-white border border-[#ECECED] rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2">
                  {suggestions.map((s, i) => {
                    const text = s.addressText || s.display_name || "";
                    const shortText = text.split(',')[0] || text;
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleSelectSuggestion(s)}
                        className="w-full text-left px-4 py-3 text-sm font-medium hover:bg-slate-50 border-b border-slate-100 last:border-0 transition-colors flex flex-col gap-0.5"
                      >
                        <span className="text-slate-800">{shortText}</span>
                        <span className="text-xs text-slate-400 truncate">{text}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Map */}
          <div className="self-stretch rounded-xl overflow-hidden border border-[#ececed] w-full mt-4">
            <LocationPickerMap
              lat={formData.latitude}
              lng={formData.longitude}
              height="320px"
              disabled={!isEditing}
              onLocationSelect={(lat, lng) => {
                setFormData(prev => ({ ...prev, latitude: lat, longitude: lng, address: "", city: "" }));
                setIsUpdatingFromCoords(true);
              }}
            />
          </div>
        </div>
      </div>

      {/* Yaradılma tarixi */}
      <div className="self-stretch flex items-start text-sm">
        <div className="flex-1 flex flex-col items-start gap-2">
          <div className="self-stretch relative leading-[20px]">{lt.creationDate}</div>
          <div className="self-stretch h-[44px] rounded-lg bg-[#fafafa] border border-[#ececed] flex items-center p-[0px_12px] text-sm">
            <div className="relative leading-[24px] font-semibold">{gymInfo.createdAt || "---"}</div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {isEditing && (
        <div className="self-stretch flex items-center justify-end mt-10 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => {
                setIsEditing(false);
                if (gymInfo) {
                  setFormData({
                    mainCategoryIds: gymInfo.mainCategories?.map((c: any) => c.id) || (gymInfo.category ? [gymInfo.category.id] : []),
                    subCategoryIds: gymInfo.subCategories?.map((c: any) => c.id) || (gymInfo.subCategory ? [gymInfo.subCategory.id] : []),
                    name: gymInfo.name || "",
                    description: gymInfo.description || "",
                    phone: gymInfo.phone || "",
                    email: gymInfo.email || "",
                    city: gymInfo.city || "",
                    address: gymInfo.address || "",
                    latitude: gymInfo.latitude || 0,
                    longitude: gymInfo.longitude || 0,
                  });
                  if (gymInfo.rooms) {
                    const names: Record<number, string> = {};
                    gymInfo.rooms.forEach(r => {
                      names[r.id] = r.name || "";
                    });
                    setRoomNames(names);
                  }
                }
              }}
              className="h-[44px] px-8 rounded-lg border border-[#ececed] bg-white text-[14px] font-medium text-[#101828] hover:bg-slate-50 transition-colors"
            >
              {lt.cancel}
            </button>
            <button 
              onClick={handleSave}
              disabled={isPending || !hasChanges}
              className={cn(
                "h-[44px] w-[220px] rounded-lg flex items-center justify-center text-[14px] font-semibold text-white transition-all shadow-sm",
                hasChanges ? "bg-[#00B4CC] hover:bg-[#009DB3]" : "bg-[#c1c1cc]"
              )}
            >
              {isPending ? <Loader2 size={18} className="animate-spin" /> : lt.save}
            </button>
          </div>
        </div>
      )}

      <SuccessAnimationModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        message={lt.successMessage}
      />
    </div>
  );
}
