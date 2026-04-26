export const queryKeys = {
  auth: {
    me: ['auth', 'me'] as const,
  },
  gyms: {
    all: ['gyms'] as const,
    list: (params?: Record<string, unknown>) => ['gyms', 'list', params ?? {}] as const,
    byId: (id: string) => ['gyms', id] as const,
  },
  customers: {
    all: ['customers'] as const,
    list: (params?: Record<string, unknown>) => ['customers', 'list', params ?? {}] as const,
    packageNames: ['customers', 'package-names'] as const,
    statistics: ['customers', 'statistics'] as const,
    byId: (id: string) => ['customers', id] as const,
  },
  stores: {
    all: ['stores'] as const,
    list: (params?: Record<string, unknown>) => ['stores', 'list', params ?? {}] as const,
    byId: (id: string) => ['stores', id] as const,
  },
  subscriptions: {
    all: ['subscriptions'] as const,
    list: (params?: Record<string, unknown>) => ['subscriptions', 'list', params ?? {}] as const,
    byId: (id: string) => ['subscriptions', id] as const,
  },
} as const
