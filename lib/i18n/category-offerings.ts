"use client";

import { useI18nStore } from "@/lib/i18n";

const az = {
  emptyCategories:
    "Bu zalda kateqoriya yoxdur. Əvvəlcə Zal məlumatlarında əlavə edin.",
  main: "Əsas",
  sub: "Alt",
  prices: "Qiymətlər",
  hours: "İş saatları",
  pricesTitle: "Kateqoriya qiymətləri",
  pricesSubtitle: "Alt kateqoriya üçün paket üzrə giriş və aylıq qiymət.",
  pricesMainOnlyHint:
    "Yalnız əsas kateqoriya var. Qiymətlər yuxarıdakı cədvəldən götürülür.",
  mainPriceRowHint: "Abunəlik cədvəlindən, yalnız baxış",
  subPriceRowHint: "Paket üzrə giriş və aylıq qiymət",
  hoursTitle: "Kateqoriya iş saatları",
  hoursSubtitle:
    "Kateqoriya üçün ayrıca saatlar. Boş saxlanılsa, zalın ümumi saatları keçərlidir.",
  hoursRowHint: "Saatları dəyiş",
  editPrices: "Qiymətləri dəyiş",
  editHours: "Saatları dəyiş",
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
    "Əsas kateqoriya qiymətləri abunəlik cədvəlindən gəlir və burada dəyişdirilmir.",
  subPriceHelp: "Hər paket üçün giriş və aylıq qiyməti yazın.",
  hoursHelp:
    "Boş saxlayıb yadda saxlasanız, zalın ümumi iş saatları istifadə olunur.",
  clearHours: "Saatları təmizlə",
  analyticsTitle: "Kateqoriya üzrə girişlər",
  analyticsSubtitle:
    "QR seçiminə görə girişlər. Legacy: kateqoriya seçilməmiş köhnə skanlar.",
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
  emptyCategories: "This gym has no categories yet. Add them under Gym info.",
  main: "Main",
  sub: "Sub",
  prices: "Prices",
  hours: "Work hours",
  pricesTitle: "Category prices",
  pricesSubtitle: "Entry and monthly price per package for each subcategory.",
  pricesMainOnlyHint:
    "Main category only. Prices come from the table above.",
  mainPriceRowHint: "From membership table, view only",
  subPriceRowHint: "Entry and monthly price per package",
  hoursTitle: "Category work hours",
  hoursSubtitle:
    "Optional hours for a category. Empty means the gym work hours apply.",
  hoursRowHint: "Edit hours",
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
    "Main category prices come from the membership table and cannot be edited here.",
  subPriceHelp: "Set entry and monthly price for each package.",
  hoursHelp: "Save empty to use the gym work hours.",
  clearHours: "Clear hours",
  analyticsTitle: "Entries by category",
  analyticsSubtitle:
    "Scans by QR category. Legacy: older scans without a category.",
  category: "Category",
  okScans: "Successful",
  failScans: "Failed",
  revenue: "Revenue",
  legacy: "Legacy",
  total: "Total",
  noAnalytics: "No category data for this period.",
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
    "У зала пока нет категорий. Добавьте их во вкладке «Информация».",
  main: "Основная",
  sub: "Под",
  prices: "Цены",
  hours: "Часы работы",
  pricesTitle: "Цены категорий",
  pricesSubtitle: "Разовая и месячная цена по пакетам для подкатегории.",
  pricesMainOnlyHint:
    "Только основная категория. Цены берутся из таблицы выше.",
  mainPriceRowHint: "Из таблицы абонемента, только просмотр",
  subPriceRowHint: "Разовая и месячная цена по пакетам",
  hoursTitle: "Часы категорий",
  hoursSubtitle:
    "Отдельные часы для категории. Пусто значит общие часы зала.",
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
    "Цены основной категории берутся из таблицы абонемента и здесь не меняются.",
  subPriceHelp: "Укажите разовую и месячную цену для каждого пакета.",
  hoursHelp: "Пустой список при сохранении использует общие часы зала.",
  clearHours: "Очистить часы",
  analyticsTitle: "Входы по категориям",
  analyticsSubtitle:
    "Сканы по категории QR. Legacy: старые сканы без выбора категории.",
  category: "Категория",
  okScans: "Успешно",
  failScans: "Ошибки",
  revenue: "Сумма",
  legacy: "Legacy",
  total: "Итого",
  noAnalytics: "Нет данных по категориям за этот период.",
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
