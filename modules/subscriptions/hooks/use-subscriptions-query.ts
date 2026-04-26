'use client'

import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query/query-keys'
import { getSubscriptions } from '@/modules/subscriptions/api/subscriptions.service'
import type { GetSubscriptionsParams } from '@/modules/subscriptions/types/subscription.types'

export function useSubscriptionsQuery(params?: GetSubscriptionsParams) {
  return useQuery({
    queryKey: queryKeys.subscriptions.list(params as Record<string, unknown> | undefined),
    queryFn: () => getSubscriptions(params),
  })
}
