export type DashboardPeriod = 'daily' | 'weekly' | 'monthly' | 'yearly'

export type DashboardPeriodApi = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY'

export function toApiPeriod(period: DashboardPeriod): DashboardPeriodApi {
  return period.toUpperCase() as DashboardPeriodApi
}

function formatISO(date: Date, isStart: boolean): string {
  const d = new Date(date)
  if (isStart) {
    d.setHours(0, 0, 0, 0)
  } else {
    d.setHours(23, 59, 59, 999)
  }
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

export interface DateRangeParams {
  startDate: string
  endDate: string
}

export interface LocalDateRangeParams {
  dateFrom: string
  dateTo: string
}

/** Inclusive LocalDate window (Asia/Baku calendar days) for Dashboard V2 APIs. */
export function getLocalDateRangeForPeriod(period: DashboardPeriod): LocalDateRangeParams {
  const end = new Date()
  const start = new Date()

  switch (period) {
    case 'daily':
      start.setDate(end.getDate() - 1)
      break
    case 'weekly':
      start.setDate(end.getDate() - 7)
      break
    case 'monthly':
      start.setDate(end.getDate() - 29)
      break
    case 'yearly':
      start.setFullYear(end.getFullYear() - 1)
      break
  }

  const pad = (n: number) => String(n).padStart(2, '0')
  const toLocalDate = (d: Date) =>
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

  return {
    dateFrom: toLocalDate(start),
    dateTo: toLocalDate(end),
  }
}

/** Date windows for income / QR report queries (ISO LocalDateTime). */
export function getDateRangeForPeriod(period: DashboardPeriod): DateRangeParams {
  const end = new Date()
  const start = new Date()

  switch (period) {
    case 'daily':
      start.setDate(end.getDate() - 1)
      break
    case 'weekly':
      start.setDate(end.getDate() - 7)
      break
    case 'monthly':
      start.setMonth(end.getMonth() - 5)
      break
    case 'yearly':
      start.setMonth(end.getMonth() - 12)
      break
  }

  return {
    startDate: formatISO(start, true),
    endDate: formatISO(end, false),
  }
}

export function formatDashboardValue(value: number): string {
  const abs = Math.abs(value)
  if (abs >= 10_000) {
    return `${Math.round(value / 1000)}k`
  }
  if (abs >= 1000) {
    const k = value / 1000
    return Number.isInteger(k) ? `${k}k` : `${k.toFixed(1)}k`
  }
  return String(Math.round(value))
}

export function formatCurrencyCompact(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`
  }
  if (value >= 1000) {
    return formatDashboardValue(value)
  }
  return value.toLocaleString(undefined, { maximumFractionDigits: 0 })
}

export function signedPercentageChange(
  percentageChange: number,
  isPositiveTrend: boolean,
): number {
  const magnitude = Math.abs(percentageChange)
  return isPositiveTrend ? magnitude : -magnitude
}