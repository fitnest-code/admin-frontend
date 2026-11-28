export interface MetricCardDto {
  totalValue: number
  percentageChange: number
  isPositiveTrend: boolean
  periodLabel: string
}

export interface KpiSummaryResponse {
  activeCustomers: MetricCardDto
  partners: MetricCardDto
  activeSubscriptions: MetricCardDto
}

export interface QrScansReportResponse {
  count: number
  percentageChange?: number
  isPositiveTrend?: boolean
}

export type IncomeTierKey = 'bronze' | 'silver' | 'gold' | 'platinum'

export interface IncomeTrendPoint {
  periodLabel: string
  tierValues: Record<IncomeTierKey, number>
}

export interface IncomeReportResponse {
  totalIncome: number
  percentageChange: number
  isPositiveTrend: boolean
  trend: IncomeTrendPoint[]
}

export interface CustomerGrowthPoint {
  periodLabel: string
  newCustomers: number
  activeCustomers: number
}

export interface CustomerGrowthResponse {
  chartData: CustomerGrowthPoint[]
  overallGrowthPercentage: number
}

/** Dashboard V2 summary — matches Maliyyə / Müştərilər / Abunəliklər / QR mockups. */
export interface DashboardV2FinanceBlock {
  totalIncome: number
  incomeDeltaPct: number | null
  incomePositiveTrend: boolean
  totalObligation: number
  obligationDeltaPct: number | null
  obligationPositiveTrend: boolean
  netBalance: number
  netDeltaPct: number | null
  netPositiveTrend: boolean
  marginPct: number
  refundAmount: number
  pendingBnplAmount: number
  obligationGyms: Array<{
    gymId: number
    gymName: string
    qrCount: number
    amount: number
  }>
}

export interface DashboardV2CustomersBlock {
  totalCustomers: number
  totalDeltaPct: number | null
  activeCustomers: number
  activeDeltaPct: number | null
  newRegistrations: number
  newDeltaPct: number | null
  conversionPct: number
  conversionDeltaPp: number | null
}

export interface DashboardV2SubscriptionsBlock {
  last7DaysCount: number
  activeCount: number
  frozenCount: number
  endedInPeriod: number
  renewedInPeriod: number
  activeDeltaPct: number | null
  activePositiveTrend: boolean
}

export interface DashboardV2PackageCard {
  packageId: number
  packageName: string
  activeCount: number
  frozenCount: number
  last7DaysCount: number
  endingIn30DaysCount: number
  sharePct: number
  revenue: number | null
}

export interface DashboardV2QrBlock {
  totalScans: number
  totalDeltaPct: number | null
  lightScans: number
  lightDeltaPct: number | null
  darkScans: number
  darkDeltaPct: number | null
}

export interface DashboardV2TopGym {
  gymId: number
  gymName: string
  category: string | null
  packages: string | null
  qrCount: number
  uniqueCustomers: number
  primaryGymSelectors: number
  amount: number
  trendPct: number | null
}

export interface DashboardV2SummaryResponse {
  finance: DashboardV2FinanceBlock | null
  customers: DashboardV2CustomersBlock | null
  subscriptions: DashboardV2SubscriptionsBlock | null
  packageCards: DashboardV2PackageCard[]
  qr: DashboardV2QrBlock | null
  topGyms: DashboardV2TopGym[]
  blockErrors: string[]
  dateFrom: string
  dateTo: string
}

export interface DashboardV2CustomerItem {
  id: number
  fullName: string
  phoneNumber: string
  email: string
  userStatus: string
  subscriptionStatus: string
  role: string
  gymName: string | null
  platform: string | null
  registrationDate: string | null
  purchaseDate: string | null
}

export interface DashboardV2CustomerPage {
  content: DashboardV2CustomerItem[]
  totalElements: number
  page: number
  size: number
}
