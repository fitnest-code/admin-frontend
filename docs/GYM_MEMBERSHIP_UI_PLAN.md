# Gym membership UI implementation

Implement the supplied gym Subscription/Services screenshots and the customer primary-gym view on the existing admin frontend. Use the established UI components, authentication proxy, React Query and AZ/EN/RU language selection.

1. Add typed v4 contracts, a cookie-authenticated v4 proxy and query/mutation hooks. Keep legacy requests available for initialization and the gym creation wizard.
2. Replace the existing gym detail plans tab with a package table, default/primary prices, time-rule editor and category editor. Resolve actual package IDs from the directory; import existing prices/services only when no v4 policy exists.
3. Prefill rules from actual work hours, validate inclusive minute coverage/overlap and preview price/access consequences. Save the full policy with its optimistic version. Require review of primary disabling before saving, including affected subscribers and optional translated notification text.
4. Add the primary-gym card/history and change dialog to the customer subscription tab. Respect server change restrictions and validate the target gym before submission.
5. Check domain helpers, TypeScript/build, desktop/mobile layouts and key interactions. Preserve unrelated uncommitted work; merge the isolated feature branch into development when verified.

UX requirements: accessible labeled controls/dialogs; no fake subscriber rows or fabricated package IDs; preserve zero prices; distinguish absent policy from backend outage; no destructive global service deletion for removing a package category; no draft loss on query refetch; saving indicators, errors, conflict reload, unsaved-change warning; AZ/EN/RU UI text.

Completed: implementation and validation are documented in [GYM_MEMBERSHIP_UI.md](GYM_MEMBERSHIP_UI.md).
