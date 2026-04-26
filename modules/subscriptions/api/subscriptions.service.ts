import { apiGet } from '@/lib/api/client'
import type { PaginatedResponse } from '@/lib/types/api'
import type {
  GetSubscriptionsParams,
  SubscriptionListItem,
} from '@/modules/subscriptions/types/subscription.types'

export function getSubscriptions(params?: GetSubscriptionsParams) {
  return apiGet<PaginatedResponse<SubscriptionListItem>>('/api/v1/subscriptions', { params })
}
