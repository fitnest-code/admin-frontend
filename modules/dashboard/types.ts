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

/** Dashboard V2 summary (parallel APIs — does not replace kpi-summary). */
export interface DashboardV2IncomeBlock {
  totalIncome: number
  incomeDeltaPct: number | null
  incomePositiveTrend: boolean
  refundAmount: number
  pendingBnplAmount: number
}

export interface DashboardV2GymRow {
  gymId: number
  gymName: string
  qrCount: number
  amount: number
}

export interface DashboardV2ObligationsBlock {
  totalObligation: number
  gyms: DashboardV2GymRow[]
}

export interface DashboardV2PackageCard {
  packageId: number
  packageName: string
  activeCount: number
  frozenCount: number
}

export interface DashboardV2SubscriptionsBlock {
  activeCount: number
  frozenCount: number
  endedInPeriod: number
  renewedInPeriod: number
  activeDeltaPct: number | null
  activePositiveTrend: boolean
  packageCards: DashboardV2PackageCard[]
}

export interface DashboardV2SummaryResponse {
  income: DashboardV2IncomeBlock | null
  obligations: DashboardV2ObligationsBlock | null
  subscriptions: DashboardV2SubscriptionsBlock | null
  topGyms: DashboardV2GymRow[]
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