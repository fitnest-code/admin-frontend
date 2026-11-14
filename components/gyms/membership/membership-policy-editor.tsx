"use client";
import { useEffect, useMemo, useState } from "react";
import { Check, Save, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { SubscriptionBadge } from "@/components/ui/subscription-badge";
import { useMembershipCopy } from "@/lib/i18n/membership";
import {
  useGymSubscriptionsAdmin,
  useGymWorkHours,
  useSupportedServices,
} from "@/lib/query/gym-query";
import { useSubscriptionPackages } from "@/lib/query/use-subscription-packages";
import {
  useMembershipPolicy,
  useSaveMembership,
} from "@/lib/query/use-gym-membership";
import {
  disabledPackageIds,
  fromDraft,
  importLegacy,
  tierName,
  toDraft,
  validatePolicy,
} from "@/lib/membership/policy";
import type {
  MembershipPolicy,
  PolicyDraft,
  NotificationTexts,
  PackageDraft,
} from "@/lib/types/membership";
import { useMembershipEditorState } from "@/lib/membership/editor-state";
import { ApiError } from "@/lib/api/client";
import { Busy, Notice, issueText, membershipError } from "./shared";
import { TimeRulesEditor } from "./time-rules-editor";
import { CategoryEditor } from "./category-editor";
import { DisablePrimaryDialog } from "./disable-primary-dialog";
import styles from "./membership.module.css";
import { UnsavedChangesDialog } from "./unsaved-changes-dialog";

export function MembershipPolicyEditor({
  gymId,
  gymName,
  onWorkHours,
}: {
  gymId: number;
  gymName: string;
  onWorkHours: () => void;
}) {
  const c = useMembershipCopy();
  const policy = useMembershipPolicy(gymId);
  const legacy = useGymSubscriptionsAdmin(gymId);
  const directory = useSubscriptionPackages();
  const hours = useGymWorkHours(gymId);
  const services = useSupportedServices(gymId);
  const save = useSaveMembership(gymId);
  const [draft, setDraft] = useState<PolicyDraft | null>(null);
  const [baseline, setBaseline] = useState<MembershipPolicy | null>(null);
  const [initialSignature, setInitialSignature] = useState("");
  const [attempted, setAttempted] = useState(false);
  const [review, setReview] = useState(false);
  const [serverError, setServerError] = useState<unknown>(null);
  const initial = useMemo(
    () =>
      policy.data
        ? toDraft(policy.data)
        : policy.data === null && directory.data && legacy.data
          ? importLegacy(directory.data, legacy.data.subscriptions ?? [])
          : null,
    [policy.data, directory.data, legacy.data],
  );
  useEffect(() => {
    if (!draft && initial) {
      const saved = useMembershipEditorState.getState().drafts[gymId];
      setDraft(saved?.draft ?? initial);
      setBaseline(saved ? saved.baseline : (policy.data ?? null));
      setInitialSignature(saved?.signature ?? JSON.stringify(initial));
      if (saved && saved.baseline?.version !== policy.data?.version)
        setServerError(
          new ApiError("POLICY_CHANGED", 409, {
            error: { code: "POLICY_CHANGED" },
          }),
        );
    }
  }, [initial, draft, policy.data, gymId]);
  const dirty = !!draft && JSON.stringify(draft) !== initialSignature;
  useEffect(() => {
    useMembershipEditorState.getState().setDirtyGymId(dirty ? gymId : null);
    return () => useMembershipEditorState.getState().setDirtyGymId(null);
  }, [dirty, gymId, draft]);
  useEffect(() => {
    if (draft)
      useMembershipEditorState
        .getState()
        .setDraft(
          gymId,
          dirty ? { draft, baseline, signature: initialSignature } : null,
        );
  }, [draft, baseline, initialSignature, dirty, gymId]);
  useEffect(() => {
    if (!dirty) return;
    const beforeUnload = (e: BeforeUnloadEvent) => {
      if (useMembershipEditorState.getState().dirtyGymId !== gymId) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", beforeUnload);
    const stopNavigation = (e: MouseEvent) => {
      const target = e.target;
      const link = target instanceof Element ? target.closest("a[href]") : null;
      if (
        link &&
        !e.metaKey &&
        !e.ctrlKey &&
        !link.getAttribute("href")?.startsWith("#")
      ) {
        e.preventDefault();
        e.stopPropagation();
        const href = link.getAttribute("href");
        if (href)
          useMembershipEditorState
            .getState()
            .requestDiscard(() => window.location.assign(href));
      }
    };
    document.addEventListener("click", stopNavigation, true);
    return () => {
      window.removeEventListener("beforeunload", beforeUnload);
      document.removeEventListener("click", stopNavigation, true);
    };
  }, [dirty, gymId]);
  const issues = draft ? validatePolicy(draft, hours.data ?? undefined) : [];
  const affected = draft ? disabledPackageIds(baseline, fromDraft(draft)) : [];
  const update = (next: PolicyDraft) => {
    setDraft(next);
    setServerError(null);
  };
  const patch = (tier: PackageDraft["tier"], values: Partial<PackageDraft>) => {
    if (draft)
      update({
        ...draft,
        packages: draft.packages.map((p) =>
          p.tier === tier ? { ...p, ...values } : p,
        ),
      });
  };
  const persist = async (notify = false, texts?: NotificationTexts) => {
    if (!draft) return;
    setServerError(null);
    try {
      const data = await save.mutateAsync({
        policy: fromDraft(draft),
        notifySubscribers: notify,
        ...(notify && texts ? { notification: texts } : {}),
      });
      const next = toDraft(data);
      setDraft(next);
      setBaseline(data);
      setInitialSignature(JSON.stringify(next));
      setAttempted(false);
      setReview(false);
      toast.success(c.saved);
    } catch (e) {
      setServerError(e);
    }
  };
  const requestSave = () => {
    setAttempted(true);
    if (issues.length) return;
    if (affected.length) setReview(true);
    else void persist();
  };
  const reloadSaved = async () => {
    const fresh = await policy.refetch();
    if (!fresh.isError) {
      useMembershipEditorState.getState().setDraft(gymId, null);
      setDraft(null);
      setAttempted(false);
      setServerError(null);
    }
  };
  const reload = () => {
    if (dirty)
      useMembershipEditorState
        .getState()
        .requestDiscard(() => void reloadSaved());
    else void reloadSaved();
  };
  const conflict =
    serverError instanceof ApiError && serverError.status === 409;
  if (
    !gymId ||
    policy.isPending ||
    (policy.data === null && (directory.isPending || legacy.isPending))
  )
    return (
      <div className={styles.root}>
        <div className={styles.skeleton} />
        <Busy text={c.loading} />
      </div>
    );
  if (
    policy.isError ||
    (policy.data === null && (directory.isError || legacy.isError))
  )
    return (
      <div className={styles.root}>
        <Notice tone="error">{c.failed}</Notice>
        <button
          className={styles.secondary}
          onClick={() => {
            policy.refetch();
            directory.refetch();
            legacy.refetch();
          }}
        >
          {c.retry}
        </button>
      </div>
    );
  if (!draft)
    return (
      <div className={styles.root}>
        <Notice tone="warning">{initial ? c.loading : c.mapping}</Notice>
      </div>
    );
  return (
    <div className={styles.root}>
      <UnsavedChangesDialog />
      {policy.data === null && <Notice>{c.newPolicy}</Notice>}
      <section className={styles.panel} aria-labelledby="membership-heading">
        <div className={styles.heading}>
          <div>
            <h2 id="membership-heading" className={styles.title}>
              {c.title}
            </h2>
            <p className={styles.subtitle}>{c.subtitle}</p>
          </div>
          <span className={styles.pill}>
            <Check size={13} />
            {draft.packages.filter((p) => p.included).length} / 4
          </span>
        </div>
        <div className={styles.scroll}>
          <table className={`${styles.table} ${styles.packages}`}>
            <thead>
              <tr>
                <th>{c.package}</th>
                <th>{c.included}</th>
                <th>{c.selectable}</th>
                <th>{c.entry} · AZN</th>
                <th>{c.monthly} · AZN</th>
              </tr>
            </thead>
            <tbody>
              {draft.packages.map((p) => (
                <tr key={p.tier}>
                  <td>
                    <SubscriptionBadge type={tierName(p.tier)} />
                  </td>
                  <td>
                    <label className={styles.inline}>
                      <input
                        className={styles.check}
                        type="checkbox"
                        aria-label={`${tierName(p.tier)} ${c.included}`}
                        checked={p.included}
                        disabled={save.isPending}
                        onChange={(e) =>
                          patch(p.tier, {
                            included: e.target.checked,
                            primaryEnabled:
                              e.target.checked && p.primaryEnabled,
                          })
                        }
                      />
                      <span className={styles.muted}>
                        {p.included ? c.yes : c.no}
                      </span>
                    </label>
                  </td>
                  <td>
                    <label className={styles.inline}>
                      <Switch
                        aria-label={`${tierName(p.tier)} ${c.primary}`}
                        checked={p.primaryEnabled}
                        disabled={!p.included || save.isPending}
                        onCheckedChange={(value) =>
                          patch(p.tier, { primaryEnabled: value })
                        }
                      />
                      <span className={styles.muted}>
                        {p.primaryEnabled ? c.yes : c.no}
                      </span>
                    </label>
                  </td>
                  <td>
                    <div className={styles.price}>
                      <input
                        aria-label={`${tierName(p.tier)} ${c.entry}`}
                        inputMode="decimal"
                        type="text"
                        placeholder="0.00"
                        disabled={!p.included || save.isPending}
                        value={p.included ? p.entryPrice : ""}
                        onChange={(e) =>
                          patch(p.tier, { entryPrice: e.target.value })
                        }
                      />
                      <span>AZN</span>
                    </div>
                  </td>
                  <td>
                    <div className={styles.price}>
                      <input
                        aria-label={`${tierName(p.tier)} ${c.monthly}`}
                        inputMode="decimal"
                        type="text"
                        placeholder={p.primaryEnabled ? "0.00" : "—"}
                        disabled={
                          !p.included || !p.primaryEnabled || save.isPending
                        }
                        value={p.included ? p.primaryMonthlyPrice : ""}
                        onChange={(e) =>
                          patch(p.tier, { primaryMonthlyPrice: e.target.value })
                        }
                      />
                      <span>AZN</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4">
          <Notice>{c.inheritance}</Notice>
        </div>
        <p className={styles.subtitle}>{c.settlement}</p>
      </section>
      <TimeRulesEditor
        draft={draft}
        hours={hours.data ?? undefined}
        onChange={update}
        onWorkHours={onWorkHours}
        disabled={save.isPending}
      />
      <CategoryEditor
        draft={draft}
        onChange={update}
        suggestions={services.data?.map((s) => s.name) ?? []}
        disabled={save.isPending}
      />
      {attempted && issues.length > 0 && (
        <Notice tone="error">
          <ul className={styles.validation}>
            {issues.map((issue, i) => (
              <li key={i}>
                {issue.tier && `${tierName(issue.tier)}: `}
                {issueText(issue.code, c)}
                {issue.index != null && ` (${issue.index + 1})`}
              </li>
            ))}
          </ul>
        </Notice>
      )}
      {hours.isError && draft.timeRulesEnabled && (
        <Notice tone="warning">
          {c.errorHours}
          <button
            type="button"
            className={`${styles.link} ml-2`}
            onClick={() => hours.refetch()}
          >
            {c.retry}
          </button>
        </Notice>
      )}
      {serverError != null && !review && (
        <Notice tone="error">
          {membershipError(serverError, c)}
          {conflict && (
            <button
              type="button"
              className={`${styles.link} ml-2`}
              onClick={reload}
            >
              {c.reload}
            </button>
          )}
        </Notice>
      )}
      <div className={styles.footer}>
        <span className={styles.muted} role="status">
          {dirty || policy.data === null ? (
            c.unsaved
          ) : (
            <span className={styles.inline}>
              <Check size={14} />
              {c.saved}
            </span>
          )}
        </span>
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.secondary}
            disabled={!dirty || save.isPending}
            onClick={() =>
              useMembershipEditorState.getState().requestDiscard(() => {
                setDraft(initial);
                setInitialSignature(JSON.stringify(initial));
                setBaseline(policy.data ?? null);
                setAttempted(false);
                setServerError(null);
              })
            }
          >
            <RotateCcw size={14} />
            {c.discard}
          </button>
          <button
            type="button"
            className={styles.button}
            disabled={
              save.isPending || (!dirty && policy.data !== null) || conflict
            }
            onClick={requestSave}
          >
            {save.isPending ? (
              <Busy text={c.saving} />
            ) : (
              <>
                <Save size={15} />
                {c.save}
              </>
            )}
          </button>
        </div>
      </div>
      {review && (
        <DisablePrimaryDialog
          key={gymId}
          gymId={gymId}
          gymName={gymName}
          affectedIds={affected}
          open={review}
          pending={save.isPending}
          error={serverError ? membershipError(serverError, c) : null}
          onClose={() => {
            setReview(false);
            if (!conflict) setServerError(null);
          }}
          onConfirm={(notify, texts) => void persist(notify, texts)}
        />
      )}
    </div>
  );
}
