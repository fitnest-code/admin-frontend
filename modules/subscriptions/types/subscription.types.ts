export interface SubscriptionListItem {
  id: string
  name: string
  price?: number
  duration?: string
  status?: string
}

export interface GetSubscriptionsParams {
  page?: number
  pageSize?: number
  search?: string
  sort?: string
}
