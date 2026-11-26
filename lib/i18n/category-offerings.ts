"use client";

import { useI18nStore } from "@/lib/i18n";

const az = {
  emptyCategories:
    "Bu zalda kateqoriya yoxdur. Əvvəlcə “Zal məlumatları”nda kateqoriya əlavə edin.",
  main: "Əsas",
  sub: "Alt",
  prices: "Qiymətlər",
  hours: "İş saatları",
  pricesTitle: "Kateqoriya qiymətləri",
  pricesSubtitle: "Alt kateqoriya qiymətləri QR seçiminə tətbiq olunur.",
  pricesMainOnlyHint:
    "Yalnız əsas kateqoriya var — qiymətlər yuxarıdakı abunəlik cədvəlindən gəlir.",
  mainPriceRowHint: "Abunəlik siyasətindən (yalnız baxış)",
  subPriceRowHint: "Paket üzrə giriş və aylıq qiymət",
  hoursTitle: "Kateqoriya iş saatları",
  hoursSubtitle:
    "Kateqoriya üçün xüsusi saatlar. Boş saxlanılsa, zalın ümumi saatları istifadə olunur.",
  hoursRowHint: "Xüsusi saatları redaktə et",
  editPrices: "Qiymətləri redaktə et",
  editHours: "Saatları redaktə et",
  package: "Paket",
  entry: "Bir giriş",
  monthly: "Aylıq",
  save: "Yadda saxla",
  cancel: "Ləğv et",
  saving: "Saxlanılır…",
  saved: "Yadda saxlanıldı",
  saveFailed: "Yadda saxlamaq mümkün olmadı.",
  loading: "Yüklənir…",
  failed: "Məlumatları yükləmək mümkün olmadı.",
  mainPriceNote:
    "Əsas kateqoriya qiymətləri abunəlik siyasətindən gəlir və burada yalnız oxunur.",
  subPriceHelp: "Hər paket üçün giriş və aylıq qiyməti təyin edin.",
  hoursHelp:
    "Boş saxlayıb yadda saxlasanız, zalın ümumi iş saatlarından istifadə olunur.",
  clearHours: "Saatları təmizlə",
  analyticsTitle: "Kateqoriya üzrə girişlər",
  analyticsSubtitle:
    "QR seçiminə görə girişlər. “Legacy” — kateqoriya seçilməmiş köhnə skanlar.",
  category: "Kateqoriya",
  okScans: "Uğurlu",
  failScans: "Uğursuz",
  revenue: "Məbləğ",
  legacy: "Legacy",
  total: "Cəmi",
  noAnalytics: "Bu dövr üçün kateqoriya məlumatı yoxdur.",
  days: {
    MONDAY: "B.e",
    TUESDAY: "Ç.a",
    WEDNESDAY: "Ç",
    THURSDAY: "C.a",
    FRIDAY: "C",
    SATURDAY: "Ş",
    SUNDAY: "B",
  } as Record<string, string>,
};

const en: typeof az = {
  emptyCategories:
    "This gym has no categories yet. Add them in Info first.",
  main: "Main",
  sub: "Sub",
  prices: "Prices",
  hours: "Work hours",
  pricesTitle: "Category prices",
  pricesSubtitle: "Subcategory prices apply when picked at QR scan.",
  pricesMainOnlyHint:
    "Main category only — prices come from the membership table above.",
  mainPriceRowHint: "From membership policy (view only)",
  subPriceRowHint: "Single entry and monthly per package",
  hoursTitle: "Category work hours",
  hoursSubtitle:
    "Optional hours per category. Leave empty to use the gym’s general hours.",
  hoursRowHint: "Edit custom hours",
  editPrices: "Edit prices",
  editHours: "Edit hours",
  package: "Package",
  entry: "Single entry",
  monthly: "Monthly",
  save: "Save",
  cancel: "Cancel",
  saving: "Saving…",
  saved: "Saved",
  saveFailed: "Could not save changes.",
  loading: "Loading…",
  failed: "Failed to load data.",
  mainPriceNote:
    "Main category prices come from membership policy and are read-only here.",
  subPriceHelp: "Set single-entry and monthly prices per package.",
  hoursHelp:
    "Save empty to fall back to the gym’s general work hours.",
  clearHours: "Clear hours",
  analyticsTitle: "Entries by category",
  analyticsSubtitle:
    "Scans by QR category. “Legacy” = scans without a category picker.",
  category: "Category",
  okScans: "Successful",
  failScans: "Failed",
  revenue: "Revenue",
  legacy: "Legacy",
  total: "Total",
  noAnalytics: "No category breakdown for this period.",
  days: {
    MONDAY: "Mon",
    TUESDAY: "Tue",
    WEDNESDAY: "Wed",
    THURSDAY: "Thu",
    FRIDAY: "Fri",
    SATURDAY: "Sat",
    SUNDAY: "Sun",
  },
};

const ru: typeof az = {
  emptyCategories:
    "У зала ещё нет категорий. Сначала добавьте их во вкладке «Информация».",
  main: "Основная",
  sub: "Под",
  prices: "Цены",
  hours: "Часы работы",
  pricesTitle: "Цены категорий",
  pricesSubtitle: "Цены подкатегории применяются при выборе в QR.",
  pricesMainOnlyHint:
    "Только основная категория — цены из таблицы абонемента выше.",
  mainPriceRowHint: "Из политики абонемента (только просмотр)",
  subPriceRowHint: "Разовый вход и месяц по пакетам",
  hoursTitle: "Часы категорий",
  hoursSubtitle:
    "Опциональные часы для категории. Пусто = общие часы зала.",
  hoursRowHint: "Изменить часы",
  editPrices: "Изменить цены",
  editHours: "Изменить часы",
  package: "Пакет",
  entry: "Разовый вход",
  monthly: "Месячный",
  save: "Сохранить",
  cancel: "Отмена",
  saving: "Сохранение…",
  saved: "Сохранено",
  saveFailed: "Не удалось сохранить.",
  loading: "Загрузка…",
  failed: "Не удалось загрузить данные.",
  mainPriceNote:
    "Цены основной категории берутся из политики абонемента и здесь только для чтения.",
  subPriceHelp: "Укажите разовую и месячную цену для каждого пакета.",
  hoursHelp:
    "Пустой список при сохранении использует общие часы зала.",
  clearHours: "Очистить часы",
  analyticsTitle: "Входы по категориям",
  analyticsSubtitle:
    "Сканы по категории QR. «Legacy» — без выбора категории.",
  category: "Категория",
  okScans: "Успешно",
  failScans: "Ошибки",
  revenue: "Сумма",
  legacy: "Legacy",
  total: "Итого",
  noAnalytics: "Нет разбивки по категориям за этот период.",
  days: {
    MONDAY: "Пн",
    TUESDAY: "Вт",
    WEDNESDAY: "Ср",
    THURSDAY: "Чт",
    FRIDAY: "Пт",
    SATURDAY: "Сб",
    SUNDAY: "Вс",
  },
};

export type CategoryOfferingsCopy = typeof az;

export function useCategoryOfferingsCopy(): CategoryOfferingsCopy {
  const locale = useI18nStore((s) => s.locale);
  return { AZ: az, EN: en, RU: ru }[locale];
}
