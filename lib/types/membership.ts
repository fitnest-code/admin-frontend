export const TIERS = ["BRONZE", "SILVER", "GOLD", "PLATINUM"] as const;
export type Tier = (typeof TIERS)[number];
export const DAYS = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
] as const;
export type Day = (typeof DAYS)[number];
export type NoticeLanguage = "AZ" | "EN" | "RU";
export interface PackageRule {
  packageId: number;
  tier: Tier;
  included: boolean;
  primaryEnabled: boolean;
  entryPrice: number;
  primaryMonthlyPrice: number | null;
  categories: string[];
  primaryDisabledAt?: string | null;
}
export interface TimeRule {
  days: Day[];
  start: string;
  end: string;
  allowedTiers: Tier[];
  priceTier: Tier;
}
export interface MembershipPolicy {
  version: number;
  timeRulesEnabled: boolean;
  packages: PackageRule[];
  timeRules: TimeRule[];
}
export interface PackageDraft
  extends Omit<PackageRule, "entryPrice" | "primaryMonthlyPrice"> {
  entryPrice: string;
  primaryMonthlyPrice: string;
}
export interface PolicyDraft extends Omit<MembershipPolicy, "packages"> {
  packages: PackageDraft[];
}
export interface NotificationContent {
  title: string;
  body: string;
}
export type NotificationTexts = Record<NoticeLanguage, NotificationContent>;
export interface PolicyUpdate {
  policy: MembershipPolicy;
  notifySubscribers: boolean;
  notification?: NotificationTexts;
}
export interface Subscriber {
  userId: number;
  fullName: string;
  phone: string | null;
  subscriptionId: number;
  packageId: number;
  packageName: string;
  selectedAt: string;
  expiresAt: string;
  cycleVisits: number;
}
export interface SubscriberPage {
  content: Subscriber[];
  total: number;
  page: number;
  size: number;
}
export interface AccessWindow {
  days: Day[];
  start: string;
  end: string;
  priceTier: Tier;
  entryPrice: number;
  primaryMonthlyPrice: number | null;
}
export interface PrimaryGymStatus {
  subscriptionId: number;
  packageId: number;
  cycle: { start: string; end: string };
  gymId: number | null;
  gymName: string | null;
  selectedAt: string | null;
  source: string | null;
  expiresAt: string | null;
  primaryVisits: number;
  primaryLimit: number;
  generalVisits: number;
  generalLimit: number;
  canChange: boolean;
  accessibleHours: AccessWindow[];
  history: {
    id: number;
    gymId: number;
    gymName: string;
    selectedAt: string;
    endedAt: string | null;
    source: string;
    endReason: string | null;
  }[];
}
export interface MembershipQuote {
  gymId: number;
  gymName: string;
  primaryEnabled: boolean;
  allowed: boolean;
  reason: string | null;
  entryPrice: number;
  primaryMonthlyPrice: number | null;
  accessWindows: AccessWindow[];
}
export interface WorkingHours {
  generalWorkHours?: {
    period: string;
    from?: string | number[];
    to?: string | number[];
    fromTime?: string;
    toTime?: string;
  }[];
  restDays?: (string | { period: string })[];
}
