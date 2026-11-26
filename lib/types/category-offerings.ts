/** Mirrors catalog-backend dto/v5 category offering admin contracts. */

export type CategoryRole = "MAIN" | "SUB";

export interface GymCategoryChip {
  categoryId: number;
  name: string;
  role: CategoryRole;
}

export interface GymCategoryPriceRow {
  categoryId: number;
  packageId: number;
  packageName?: string | null;
  singlePrice: number | null;
  unlimitedPrice: number | null;
  effectiveFrom?: string | null;
}

export interface GymCategoryPriceRequest {
  packageId: number;
  singlePrice: number | null;
  unlimitedPrice: number | null;
  /** ISO date (yyyy-MM-dd); backend normalizes to month start. */
  effectiveFrom?: string | null;
}

export interface GymCategoryWorkHour {
  period: string;
  from: string | null;
  to: string | null;
}

export interface GymCategoryWorkHoursRequest {
  workHours: GymCategoryWorkHour[];
}

export interface GymCategoryAnalyticsRow {
  categoryKey: string;
  categoryId: number | null;
  categoryName: string;
  successfulScans: number;
  failedScans: number;
  revenue: number;
}

export interface GymCategoryAnalyticsResponse {
  gymId: number;
  totalSuccessfulScans: number;
  totalFailedScans: number;
  totalRevenue: number;
  categories: GymCategoryAnalyticsRow[];
}

export const WORK_HOUR_PERIODS = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
] as const;

export type WorkHourPeriod = (typeof WORK_HOUR_PERIODS)[number];

/** First day of current month in local calendar (matches HomeGym / category price versioning). */
export function monthStartIso(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}-01`;
}
