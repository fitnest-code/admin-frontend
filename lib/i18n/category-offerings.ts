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
  pricesSubtitle: "Alt kateqoriya üçün paket üzrə bir giriş qiyməti.",
  pricesMainOnlyHint:
    "Yalnız əsas kateqoriya var. Qiymətlər yuxarıdakı cədvəldən götürülür.",
  mainPriceRowHint: "Abunəlik cədvəlindən, yalnız baxış",
  subPriceRowHint: "Paket üzrə bir giriş qiyməti",
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
  noIncludedPackages:
    "Əvvəlcə yuxarıda ən azı bir paketi daxil edin. Qiymətlər yalnız daxil olan paketlər üçün təyin olunur.",
  subPriceHelp: "Hər paket üçün bir giriş qiymətini yazın.",
  hoursHelp:
    "Boş saxlayıb yadda saxlasanız, zalın ümumi iş saatları istifadə olunur.",
  clearHours: "Saatları təmizlə",
  analyticsTitle: "Kateqoriya üzrə girişlər",
  analyticsSubtitle:
    "QR seçiminə görə girişlər. Kateqoriya seçilmədən baş vermiş skanlar ayrıca göstərilir.",
  category: "Kateqoriya",
  okScans: "Uğurlu",
  failScans: "Uğursuz",
  revenue: "Məbləğ",
  legacy: "Kateqoriya seçilmədən baş vermiş skanlar",
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
  pricesSubtitle: "Single entry price per package for each subcategory.",
  pricesMainOnlyHint:
    "Main category only. Prices come from the table above.",
  mainPriceRowHint: "From membership table, view only",
  subPriceRowHint: "Single entry price per package",
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
  noIncludedPackages:
    "Include at least one package above first. Prices are set only for included packages.",
  subPriceHelp: "Set the single entry price for each package.",
  hoursHelp: "Save empty to use the gym work hours.",
  clearHours: "Clear hours",
  analyticsTitle: "Entries by category",
  analyticsSubtitle:
    "Entries by QR category. Scans without a category are listed separately.",
  category: "Category",
  okScans: "Successful",
  failScans: "Failed",
  revenue: "Revenue",
  legacy: "Scans without a category",
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
  pricesSubtitle: "Разовая цена входа по пакетам для подкатегории.",
  pricesMainOnlyHint:
    "Только основная категория. Цены берутся из таблицы выше.",
  mainPriceRowHint: "Из таблицы абонемента, только просмотр",
  subPriceRowHint: "Разовая цена входа по пакетам",
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
  noIncludedPackages:
    "Сначала включите хотя бы один пакет выше. Цены задаются только для включённых пакетов.",
  subPriceHelp: "Укажите разовую цену входа для каждого пакета.",
  hoursHelp: "Пустой список при сохранении использует общие часы зала.",
  clearHours: "Очистить часы",
  analyticsTitle: "Входы по категориям",
  analyticsSubtitle:
    "Входы по категории QR. Сканы без выбора категории показаны отдельно.",
  category: "Категория",
  okScans: "Успешно",
  failScans: "Ошибки",
  revenue: "Сумма",
  legacy: "Сканы без выбора категории",
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
