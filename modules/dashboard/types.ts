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