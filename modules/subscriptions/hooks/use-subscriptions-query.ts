'use client'

import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query/query-keys'
import { getSubscriptions } from '@/modules/subscriptions/api/subscriptions.service'
import { useI18nStore } from '@/lib/i18n'
import type { GetSubscriptionsParams } from '@/modules/subscriptions/types/subscription.types'

export function useSubscriptionsQuery(params?: GetSubscriptionsParams) {
  const locale = useI18nStore((s) => s.locale)
  return useQuery({
    queryKey: [...queryKeys.subscriptions.list(params as Record<string, unknown> | undefined), locale],
    queryFn: () => getSubscriptions(params),
  })
}
