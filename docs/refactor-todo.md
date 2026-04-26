# Refactor Todo

## Done

- Route all business API calls through `app/api/v1/[...path]`.
- Update API client to send cookies on local API requests.
- Remove persisted access token from Zustand auth store.
- Switch header user chip from hardcoded label to store-backed user data.
- Move stores list page from mock data to `modules/stores` query hook.

## Next

- Add session bootstrap endpoint and hydrate auth user from cookie-backed session.
- Normalize paginated API responses behind shared mappers.
- Migrate subscriptions list from mock state to `modules/subscriptions`.
- Migrate gym/customer/store detail pages away from `lib/*-data` mocks.
- Replace remaining dashboard and tabs mock datasets with query-backed data.
- Tighten query key typing and remove `params as Record<string, unknown>` casts.
