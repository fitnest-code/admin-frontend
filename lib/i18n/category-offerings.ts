"use client";

import { useI18nStore } from "@/lib/i18n";

const az = {
  title: "Kateqoriya təklifləri",
  subtitle:
    "Əsas və alt kateqoriyalar üçün qiymət, iş saatı və xidmətlər. Alt kateqoriya qiymətləri QR seçiminə təsir edir.",
  emptyCategories:
    "Bu zalda kateqoriya yoxdur. Əvvəlcə “Zal məlumatları” tabında əsas və ya alt kateqoriya əlavə edin.",
  main: "Əsas",
  sub: "Alt",
  prices: "Qiymətlər",
  hours: "İş saatları",
  services: "Xidmətlər",
  package: "Paket",
  entry: "Bir giriş",
  monthly: "Aylıq",
  save: "Yadda saxla",
  saving: "Saxlanılır…",
  saved: "Yadda saxlanıldı",
  saveFailed: "Yadda saxlamaq mümkün olmadı.",
  loading: "Yüklənir…",
  failed: "Məlumatları yükləmək mümkün olmadı.",
  mainPriceNote:
    "Əsas kateqoriya qiymətləri abunəlik / əsas zal siyasətindən gəlir və burada yalnız oxunur.",
  subPriceHelp: "Hər paket üçün giriş və aylıq qiyməti təyin edin.",
  hoursHelp:
    "Boş saxlayıb yadda saxlasanız, zalın ümumi iş saatlarından istifadə olunur.",
  clearHours: "Kateqoriya saatlarını təmizlə",
  servicesHelp: "Bu kateqoriyaya bağlı xidmətləri seçin.",
  noServices: "Seçilmiş xidmət yoxdur.",
  analyticsTitle: "Kateqoriya üzrə girişlər",
  analyticsSubtitle:
    "QR seçiminə görə uğurlu / uğursuz girişlər və məbləğ. “Legacy” — kateqoriya seçilməmiş köhnə skanlar.",
  category: "Kateqoriya",
  okScans: "Uğurlu",
  failScans: "Uğursuz",
  revenue: "Məbləğ",
  legacy: "Legacy",
  total: "Cəmi",
  noAnalytics: "Bu dövr üçün kateqoriya məlumatı yoxdur.",
  period: "Gün",
  from: "Başlama",
  to: "Bitmə",
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
  title: "Category offerings",
  subtitle:
    "Prices, hours, and services for main and sub categories. Subcategory prices apply when the member picks that category at QR.",
  emptyCategories:
    "This gym has no categories yet. Add main or sub categories in the Info tab first.",
  main: "Main",
  sub: "Sub",
  prices: "Prices",
  hours: "Work hours",
  services: "Services",
  package: "Package",
  entry: "Single entry",
  monthly: "Monthly",
  save: "Save",
  saving: "Saving…",
  saved: "Saved",
  saveFailed: "Could not save changes.",
  loading: "Loading…",
  failed: "Failed to load data.",
  mainPriceNote:
    "Main category prices come from the membership / primary-gym policy and are read-only here.",
  subPriceHelp: "Set single-entry and monthly prices per package.",
  hoursHelp:
    "Save an empty list to fall back to the gym’s general work hours.",
  clearHours: "Clear category hours",
  servicesHelp: "Choose services linked to this category.",
  noServices: "No services selected.",
  analyticsTitle: "Entries by category",
  analyticsSubtitle:
    "Successful / failed scans and revenue by QR category. “Legacy” = scans without a category picker.",
  category: "Category",
  okScans: "Successful",
  failScans: "Failed",
  revenue: "Revenue",
  legacy: "Legacy",
  total: "Total",
  noAnalytics: "No category breakdown for this period.",
  period: "Day",
  from: "From",
  to: "To",
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
  title: "Предложения по категориям",
  subtitle:
    "Цены, часы и услуги для основных и подкатегорий. Цены подкатегории применяются при выборе в QR.",
  emptyCategories:
    "У зала ещё нет категорий. Сначала добавьте основные или подкатегории во вкладке «Информация».",
  main: "Основная",
  sub: "Под",
  prices: "Цены",
  hours: "Часы работы",
  services: "Услуги",
  package: "Пакет",
  entry: "Разовый вход",
  monthly: "Месячный",
  save: "Сохранить",
  saving: "Сохранение…",
  saved: "Сохранено",
  saveFailed: "Не удалось сохранить.",
  loading: "Загрузка…",
  failed: "Не удалось загрузить данные.",
  mainPriceNote:
    "Цены основной категории берутся из политики абонемента / основного зала и здесь только для чтения.",
  subPriceHelp: "Укажите разовую и месячную цену для каждого пакета.",
  hoursHelp:
    "Пустой список при сохранении использует общие часы работы зала.",
  clearHours: "Очистить часы категории",
  servicesHelp: "Выберите услуги, связанные с этой категорией.",
  noServices: "Услуги не выбраны.",
  analyticsTitle: "Входы по категориям",
  analyticsSubtitle:
    "Успешные / неуспешные сканы и сумма по категории QR. «Legacy» — сканы без выбора категории.",
  category: "Категория",
  okScans: "Успешно",
  failScans: "Ошибки",
  revenue: "Сумма",
  legacy: "Legacy",
  total: "Итого",
  noAnalytics: "Нет разбивки по категориям за этот период.",
  period: "День",
  from: "С",
  to: "До",
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
