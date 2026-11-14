"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { MapPin, Search, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuthStore } from "@/lib/store/auth-store";
import { useI18nStore } from "@/lib/i18n";
import {
  membershipDays,
  useMembershipCopy,
  type MembershipCopy,
} from "@/lib/i18n/membership";
import {
  usePrimaryGym,
  useChangePrimaryGym,
  useMembershipQuote,
} from "@/lib/query/use-gym-membership";
import { useAdminGymsQuery } from "@/modules/gyms/hooks/use-gyms-query";
import {
  formatMembershipDate,
  formatMembershipEndDate,
} from "@/lib/membership/policy";
import { DAYS, type PrimaryGymStatus } from "@/lib/types/membership";
import {
  Busy,
  Notice,
  membershipError,
} from "@/components/gyms/membership/shared";
import styles from "@/components/gyms/membership/membership.module.css";

function sourceLabel(source: string, c: MembershipCopy) {
  const labels = {
    FIRST_QR: c.sourceQr,
    SUBSCRIPTION_SCREEN: c.sourceScreen,
    ADMIN: c.sourceAdmin,
  };
  return labels[source as keyof typeof labels] ?? source;
}
function reasonLabel(reason: string | null, c: MembershipCopy) {
  if (!reason) return c.active;
  return (
    {
      OTHER_GYM_CHECKIN: c.reasonOther,
      CHANGED: c.reasonChanged,
      PRIMARY_DISABLED: c.reasonDisabled,
    }[reason] ?? reason
  );
}
function ChangePrimaryDialog({
  userId,
  current,
  onClose,
}: {
  userId: string;
  current: PrimaryGymStatus;
  onClose: () => void;
}) {
  const c = useMembershipCopy();
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [gymId, setGymId] = useState<number | null>(null);
  const [error, setError] = useState<unknown>(null);
  useEffect(() => {
    const timer = setTimeout(() => {
      setQuery(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);
  const gyms = useAdminGymsQuery({
    query,
    page,
    pageSize: 10,
    sort: "name_asc",
  });
  const quote = useMembershipQuote(gymId, current.packageId);
  const change = useChangePrimaryGym(userId);
  const confirm = async () => {
    if (!gymId) return;
    try {
      await change.mutateAsync(gymId);
      toast.success(c.selectionSaved);
      onClose();
    } catch (e) {
      setError(e);
    }
  };
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !change.isPending) onClose();
      }}
    >
      <DialogContent
        className={`${styles.dialog} sm:max-w-[600px]`}
        showCloseButton={!change.isPending}
      >
        <DialogHeader>
          <DialogTitle>
            {current.gymId ? c.changePrimary : c.selectPrimary}
          </DialogTitle>
          <DialogDescription>{c.noPrimaryHelp}</DialogDescription>
        </DialogHeader>
        <div className={styles.modalBody}>
          <label className={styles.inline}>
            <Search size={17} />
            <input
              className={styles.input}
              aria-label={c.searchGym}
              placeholder={c.searchGym}
              value={search}
              maxLength={100}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
          {gyms.isPending ? (
            <Busy text={c.loading} />
          ) : gyms.isError ? (
            <Notice tone="error">
              {c.failed}
              <button className={styles.link} onClick={() => gyms.refetch()}>
                {c.retry}
              </button>
            </Notice>
          ) : (
            <>
              <div className={styles.results}>
                {gyms.data?.items
                  .filter(
                    (g) => g.status === "ACTIVE" && g.id !== current.gymId,
                  )
                  .map((g) => (
                    <button
                      type="button"
                      className={styles.gymOption}
                      key={g.id}
                      aria-pressed={gymId === g.id}
                      disabled={change.isPending}
                      onClick={() => {
                        setGymId(g.id);
                        setError(null);
                      }}
                    >
                      <span className="font-semibold text-sm">{g.name}</span>
                      <span className={styles.muted}>{g.fullAddress}</span>
                    </button>
                  ))}
                {!gyms.data?.items.some(
                  (g) => g.status === "ACTIVE" && g.id !== current.gymId,
                ) && <p className={styles.empty}>{c.noGyms}</p>}
              </div>
              <div className={styles.actions}>
                <button
                  type="button"
                  className={styles.secondary}
                  disabled={page <= 1 || gyms.isFetching}
                  onClick={() => setPage((p) => p - 1)}
                >
                  {c.previous}
                </button>
                <span className={styles.muted}>{page}</span>
                <button
                  type="button"
                  className={styles.secondary}
                  disabled={
                    page * 10 >= (gyms.data?.total ?? 0) || gyms.isFetching
                  }
                  onClick={() => setPage((p) => p + 1)}
                >
                  {c.next}
                </button>
              </div>
            </>
          )}
          {gymId &&
            (quote.isPending ? (
              <Busy text={c.checking} />
            ) : quote.isError ? (
              <Notice tone="error">{membershipError(quote.error, c)}</Notice>
            ) : quote.data?.primaryEnabled ? (
              <Notice tone="success">
                <strong>{quote.data.gymName}</strong> · {quote.data.entryPrice}{" "}
                AZN · {quote.data.primaryMonthlyPrice} AZN {c.perMonth}
              </Notice>
            ) : (
              <Notice tone="warning">{c.notEligible}</Notice>
            ))}
          {error != null && (
            <Notice tone="error">{membershipError(error, c)}</Notice>
          )}
          <div className={`${styles.actions} justify-end`}>
            <button
              type="button"
              className={styles.secondary}
              disabled={change.isPending}
              onClick={onClose}
            >
              {c.cancel}
            </button>
            <button
              type="button"
              className={styles.button}
              disabled={
                !gymId ||
                !quote.data?.primaryEnabled ||
                quote.isFetching ||
                change.isPending
              }
              onClick={confirm}
            >
              {change.isPending ? <Busy text={c.saving} /> : c.confirmSelection}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
function Usage({
  title,
  used,
  limit,
  help,
}: {
  title: string;
  used: number;
  limit: number;
  help: string;
}) {
  return (
    <div className={styles.progressBox}>
      <div className={styles.usageTitle}>
        <span>{title}</span>
        <strong>
          {used} / {limit}
        </strong>
      </div>
      <div
        className={styles.progress}
        role="progressbar"
        aria-label={title}
        aria-valuenow={Math.min(used, limit)}
        aria-valuemax={limit}
        aria-valuemin={0}
        aria-valuetext={`${used} / ${limit}`}
      >
        <div
          style={{
            width: `${limit ? Math.min(100, (used / limit) * 100) : 0}%`,
          }}
        />
      </div>
      <p className={styles.subtitle}>{help}</p>
    </div>
  );
}
export function PrimaryGymCard({ userId }: { userId: string }) {
  const c = useMembershipCopy();
  const locale = useI18nStore((s) => s.locale);
  const role = useAuthStore((s) => s.user?.role)
    ?.toUpperCase()
    .replace(/^ROLE_/, "");
  const admin = role === "ADMIN";
  const primary = usePrimaryGym(userId, admin);
  const [changing, setChanging] = useState(false);
  if (!admin) return null;
  if (primary.isPending)
    return (
      <div className={styles.root}>
        <div className={styles.skeleton} />
      </div>
    );
  if (primary.isError)
    return (
      <div className={styles.root}>
        <section className={styles.panel}>
          <h2 className={styles.title}>{c.primary}</h2>
          <div className="mt-3">
            <Notice tone="error">
              {membershipError(primary.error, c)}
              <button
                type="button"
                className={`${styles.link} ml-2`}
                onClick={() => primary.refetch()}
              >
                {c.retry}
              </button>
            </Notice>
          </div>
        </section>
      </div>
    );
  const data = primary.data;
  if (!data) return null;
  return (
    <div className={styles.root}>
      <section className={styles.panel} style={{ borderColor: "#a4e4ed" }}>
        <div className={styles.heading}>
          <h2 className={`${styles.title} ${styles.inline}`}>
            <ShieldCheck size={19} className="text-cyan-600" />
            {c.primary}
          </h2>
          <span className={styles.pill}>
            {data.gymId
              ? `${c.active} · ${data.primaryLimit} ${c.visitUnit}`
              : c.noPrimary}
          </span>
        </div>
        {data.gymId ? (
          <>
            <dl className={styles.details}>
              <div className={styles.detail}>
                <dt>{c.gym}</dt>
                <dd>
                  <Link
                    className={styles.link}
                    href={`/gyms/${data.gymId}?tab=plans`}
                  >
                    {data.gymName}
                  </Link>
                </dd>
              </div>
              <div className={styles.detail}>
                <dt>{c.selected}</dt>
                <dd>{formatMembershipDate(data.selectedAt)}</dd>
              </div>
              <div className={styles.detail}>
                <dt>{c.source}</dt>
                <dd>{sourceLabel(data.source ?? "", c)}</dd>
              </div>
              <div className={styles.detail}>
                <dt>{c.currentCycle}</dt>
                <dd>
                  {formatMembershipDate(data.cycle.start)} –{" "}
                  {formatMembershipEndDate(data.cycle.end)}
                </dd>
              </div>
            </dl>
            {data.accessibleHours.length > 0 && (
              <div className="mb-4">
                <p className={styles.muted}>{c.hours}</p>
                <div className={`${styles.chips} mt-2`}>
                  {data.accessibleHours.map((w, i) => (
                    <span className={styles.chip} key={i}>
                      {w.days
                        .map((d) => membershipDays[locale][DAYS.indexOf(d)])
                        .join(", ")}{" "}
                      · {w.start.slice(0, 5)}–{w.end.slice(0, 5)}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <Notice>{c.noPrimaryHelp}</Notice>
        )}
        <div className={`${styles.grid2} mt-4`}>
          <Usage
            title={c.primaryUsed}
            used={data.primaryVisits}
            limit={data.primaryLimit}
            help={c.settlement}
          />
          <Usage
            title={c.generalUsed}
            used={data.generalVisits}
            limit={data.generalLimit}
            help={c.generalHelp}
          />
        </div>
        <div className={`${styles.actions} mt-4`}>
          <button
            type="button"
            className={styles.secondary}
            disabled={!data.canChange}
            onClick={() => setChanging(true)}
          >
            <MapPin size={15} />
            {data.gymId ? c.changePrimary : c.selectPrimary}
          </button>
          {!data.canChange && (
            <span className="text-xs text-amber-700">{c.changeLocked}</span>
          )}
        </div>
      </section>
      <section className={styles.panel}>
        <h2 className={`${styles.title} mb-4`}>{c.history}</h2>
        <div className={styles.scroll}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>{c.gym}</th>
                <th>{c.period}</th>
                <th>{c.source}</th>
                <th>{c.reason}</th>
              </tr>
            </thead>
            <tbody>
              {data.history.map((h) => (
                <tr key={h.id}>
                  <td>
                    <Link
                      className={styles.link}
                      href={`/gyms/${h.gymId}?tab=plans`}
                    >
                      {h.gymName}
                    </Link>
                  </td>
                  <td>
                    {formatMembershipDate(h.selectedAt)} –{" "}
                    {h.endedAt ? formatMembershipDate(h.endedAt) : c.active}
                  </td>
                  <td>{sourceLabel(h.source, c)}</td>
                  <td>{reasonLabel(h.endReason, c)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!data.history.length && (
            <p className={styles.empty}>{c.noHistory}</p>
          )}
        </div>
      </section>
      {changing && (
        <ChangePrimaryDialog
          userId={userId}
          current={data}
          onClose={() => setChanging(false)}
        />
      )}
    </div>
  );
}
