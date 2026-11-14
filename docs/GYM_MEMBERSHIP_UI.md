# Gym Subscription / Services UI

The gym detail Subscription / Services tab now uses the membership v4 API and matches the four supplied reference screens. The gym creation wizard continues to use its existing flow.

## What changed

- Four package rows with inclusion, primary-gym availability, per-entry and monthly prices. Actual package IDs are resolved from the package directory; zero is a valid price. An unconfigured v4 policy imports existing v2 package prices and service names without silently enabling primary selection.
- Time rules with day selection, inclusive minute ranges, admitted packages, price tiers, working-hour defaults, rule removal, and an interactive access preview. Validation detects invalid amounts, missing prices, overlapping ranges, gaps, ranges outside work hours and unsupported package combinations. The catalog’s English, Azerbaijani and Russian day names are normalized before validation. Overnight work hours are split across days when generating defaults.
- Package-specific category chips with add, rename, suggestions from existing gym services, duplicate protection and remove. Removing a chip changes that package only; it does not delete a global service or its icon.
- A reviewed primary-disable flow with affected subscribers, search, pagination, optional notifications, AZ/EN/RU text and the backend title/body limits. Notification review saves the complete draft, with the current optimistic version, in one request. Subscribers are filtered to packages losing primary eligibility, including inherited tiers. The existing API is queried in bounded 100-row batches before client pagination to preserve accurate affected-only totals.
- Inline errors, explicit version-conflict recovery, loading states, saving state and success feedback. Background query refetches do not overwrite the draft. In-memory drafts survive locale-driven remounts. Accessible discard dialogs protect tab/link navigation; leaving/reloading the browser also warns about unsaved edits.
- A customer primary-gym card with subscription-month usage, permitted hours, selection source, history, lock reason and a gym search/change dialog. Selection is checked against the customer's actual package and the backend's eligibility response. The server's `canChange` flag controls availability.
- Separate AZ/EN/RU membership translations; existing locale files and unrelated campaign work are unchanged.
- A new cookie-authenticated `/api/v4/[...path]` Next.js proxy, preserving the existing authorization, language, streaming and response-status forwarding pattern. Internal order-service calls remain behind the backend's service-key boundary; no service key is exposed in frontend code.

## Routes used

| Purpose | Endpoint |
|---|---|
| Load/save gym policy | `GET/PUT /api/v4/admin/gyms/{gymId}/membership-policy` |
| Affected subscribers | `GET /api/v4/admin/gyms/{gymId}/primary-subscribers` |
| Customer primary status/change | `GET/PUT /api/v4/admin/users/{userId}/primary-gym` |
| Target-gym eligibility | `GET /api/v4/gyms/{gymId}/membership-quote?packageId=...` |

Existing package-name, work-hour, gym-search, service and v2 subscription read APIs supply the initial data. Existing backend endpoints were not changed for this frontend task. No new frontend dependency was added.

The backend membership migrations, primary-gym service key and Kafka configuration still need to be provisioned through the normal backend deployment process. Frontend error states distinguish missing policy, service failure and conflicting writes; a missing v4 policy is not treated as a network outage.

## Verification

- `node --test tests/membership-policy.test.cjs`: 23 passing tests for money, real package IDs, hierarchy, disable impact, inclusive rule boundaries, overlap/gap detection, overnight/rest-day handling, timezone-safe end dates and draft/discard behavior.
- `node node_modules/typescript/bin/tsc --noEmit --incremental false`: passes. This is run separately because the repository's Next configuration skips type validation during builds.
- `npm run build`: passes, including the new v4 proxy route.
- Browser checks on the actual built frontend against a loopback synthetic backend: load policy; disable review/subscriber list; translated notification payload/save; overlapping-rule rejection; category editor; customer usage/history and locked state; replacement gym eligibility and confirmed change; English labels; mobile card layout with no page-wide horizontal overflow.

All subscribers, credentials and membership edits used during visual verification were synthetic and local. No real notifications or customer changes were sent. Existing baseline middleware/localStorage warnings were observed; no new TypeScript or build failures remain.
