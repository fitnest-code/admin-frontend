# Integration Architecture (Zustand + TanStack Query)

## Target Structure

```text
app/
  layout.tsx
  providers.tsx

lib/
  api/
    client.ts
  config/
    env.ts
  query/
    query-client.ts
    query-keys.ts
  store/
    auth-store.ts
  types/
    api.ts

modules/
  auth/
    api/auth.service.ts
    hooks/use-login-mutation.ts
    types/auth.types.ts
    index.ts
  gyms/
    api/gyms.service.ts
    hooks/use-gyms-query.ts
    types/gym.types.ts
    index.ts
  customers/
    api/customers.service.ts
    hooks/use-customers-query.ts
    types/customer.types.ts
    index.ts
  stores/
    api/stores.service.ts
    hooks/use-stores-query.ts
    types/store.types.ts
    index.ts
  subscriptions/
    api/subscriptions.service.ts
    hooks/use-subscriptions-query.ts
    types/subscription.types.ts
    index.ts
```

## Rules

1. API calling logic only in `modules/*/api/*.service.ts`.
2. TanStack query/mutation hooks only in `modules/*/hooks`.
3. UI components/pages call hooks, never raw `fetch`.
4. Cross-module utilities live in `lib/*`.
5. Global session state is in Zustand store (`lib/store/auth-store.ts`).
6. Query invalidation uses shared keys from `lib/query/query-keys.ts`.

## Auth Flow (Access + Refresh)

1. `POST /api/auth/login` -> backend `/api/v1/auth/login` call, tokenlər response body-dən parse olunur.
2. Next server access/refresh tokenləri `httpOnly` cookie kimi set edir.
3. Login/refresh cavabından access token Zustand-a yazılır.
4. Business request-lər `lib/api/client.ts` ilə birbaşa backend-ə `Authorization: Bearer <accessToken>` ilə gedir.
5. 401 alanda client `POST /api/auth/refresh` çağırır, yeni access token alır, request-i 1 dəfə retry edir.
6. `POST /api/auth/logout` cookie-ləri serverdə silir və backend logout endpoint-ini çağırır.

## Integration Workflow Per Endpoint

1. Add request/response types under `modules/<domain>/types`.
2. Add service function under `modules/<domain>/api`.
3. Add query/mutation hook under `modules/<domain>/hooks`.
4. Connect page/component to hook.
5. Add invalidate/update strategy for related query keys.
