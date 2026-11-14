"use client";
import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { usePrimarySubscribers } from "@/lib/query/use-gym-membership";
import { useMembershipCopy } from "@/lib/i18n/membership";
import {
  formatMembershipDate,
  formatMembershipEndDate,
} from "@/lib/membership/policy";
import type { NoticeLanguage, NotificationTexts } from "@/lib/types/membership";
import { Busy, Notice } from "./shared";
import styles from "./membership.module.css";

export function DisablePrimaryDialog({
  gymId,
  gymName,
  affectedIds,
  open,
  pending,
  error,
  onClose,
  onConfirm,
}: {
  gymId: number;
  gymName: string;
  affectedIds: number[];
  open: boolean;
  pending: boolean;
  error: string | null;
  onClose: () => void;
  onConfirm: (notify: boolean, texts: NotificationTexts) => void;
}) {
  const c = useMembershipCopy();
  const [notify, setNotify] = useState(true);
  const [language, setLanguage] = useState<NoticeLanguage>("AZ");
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const [texts, setTexts] = useState<NotificationTexts>(() => ({
    AZ: {
      title: `${gymName}: əsas zal seçimi bağlanır`.slice(0, 65),
      body: "Yeni əsas zal seçimi dayandırılır. Cari abunəlik ayının sonunadək əsas zal imkanın davam edir. Növbəti ay üçün yeni zal seçə bilərsən.",
    },
    EN: {
      title: `${gymName}: primary gym selection is closing`.slice(0, 65),
      body: "New primary gym selections are closing. Your access continues until the end of your current subscription month. You can choose a new gym for the next month.",
    },
    RU: {
      title: `${gymName}: выбор основного зала закрывается`.slice(0, 65),
      body: "Новый выбор основного зала закрывается. Доступ сохранится до конца текущего месяца подписки. На следующий месяц можно выбрать другой зал.",
    },
  }));
  useEffect(() => {
    const timer = setTimeout(() => {
      setQuery(search);
      setPage(0);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);
  const subscribers = usePrimarySubscribers(
    gymId,
    query,
    page,
    open,
    affectedIds,
  );
  const visible =
    subscribers.data?.content.filter((s) =>
      affectedIds.includes(s.packageId),
    ) ?? [];
  const complete = (["AZ", "EN", "RU"] as const).every(
    (l) =>
      texts[l].title.trim() &&
      texts[l].title.length <= 65 &&
      texts[l].body.trim() &&
      texts[l].body.length <= 240,
  );
  const total = subscribers.data?.total ?? 0;
  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!value && !pending) onClose();
      }}
    >
      <DialogContent
        className={`${styles.dialog} sm:max-w-[780px]`}
        showCloseButton={!pending}
      >
        <DialogHeader>
          <DialogTitle className={styles.inline}>
            <AlertTriangle size={20} className="text-amber-600" />
            {gymName} · {c.disableTitle}
          </DialogTitle>
          <DialogDescription className={styles.subtitle}>
            {c.disableHelp}
          </DialogDescription>
        </DialogHeader>
        <div className={styles.modalBody}>
          <label className={styles.inline}>
            <input
              className={styles.check}
              type="checkbox"
              checked={notify}
              disabled={pending}
              onChange={(e) => setNotify(e.target.checked)}
            />
            {c.notify}
          </label>
          {notify && (
            <>
              <div
                className={styles.languages}
                role="tablist"
                aria-label={c.threeLanguages}
              >
                {(["AZ", "EN", "RU"] as const).map((l) => (
                  <button
                    type="button"
                    role="tab"
                    aria-selected={language === l}
                    className={styles.language}
                    key={l}
                    onClick={() => setLanguage(l)}
                  >
                    {l}
                    {(!texts[l].title.trim() || !texts[l].body.trim()) && " *"}
                  </button>
                ))}
              </div>
              <p className={styles.muted}>{c.threeLanguages}</p>
              <label>
                <span className={styles.fieldHead}>
                  <span>{c.noticeTitle} *</span>
                  <span>{texts[language].title.length} / 65</span>
                </span>
                <input
                  className={styles.input}
                  value={texts[language].title}
                  maxLength={65}
                  required
                  disabled={pending}
                  onChange={(e) =>
                    setTexts({
                      ...texts,
                      [language]: { ...texts[language], title: e.target.value },
                    })
                  }
                />
              </label>
              <label>
                <span className={styles.fieldHead}>
                  <span>{c.noticeBody} *</span>
                  <span>{texts[language].body.length} / 240</span>
                </span>
                <textarea
                  className={styles.textarea}
                  value={texts[language].body}
                  maxLength={240}
                  required
                  disabled={pending}
                  onChange={(e) =>
                    setTexts({
                      ...texts,
                      [language]: { ...texts[language], body: e.target.value },
                    })
                  }
                />
              </label>
              {!complete && (
                <Notice tone="warning">{c.notificationInvalid}</Notice>
              )}
            </>
          )}
          <div className={styles.heading} style={{ marginBottom: 0 }}>
            <h3 className="text-sm font-semibold">{c.subscribers}</h3>
            <label className={styles.inline}>
              <Search size={15} />
              <input
                className={styles.input}
                value={search}
                maxLength={100}
                placeholder={c.search}
                aria-label={c.search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </label>
          </div>
          {subscribers.isPending ? (
            <Busy text={c.loading} />
          ) : subscribers.isError ? (
            <Notice tone="error">
              {c.subscriberUnavailable}
              <button
                type="button"
                className={`${styles.link} ml-2`}
                onClick={() => subscribers.refetch()}
              >
                {c.retry}
              </button>
            </Notice>
          ) : (
            <>
              <div className={styles.scroll}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>{c.fullName}</th>
                      <th>{c.phone}</th>
                      <th>{c.package}</th>
                      <th>{c.selected}</th>
                      <th>{c.visits}</th>
                      <th>{c.expires}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visible.map((s) => (
                      <tr key={s.subscriptionId}>
                        <td>{s.fullName || `#${s.userId}`}</td>
                        <td>{s.phone || "—"}</td>
                        <td>{s.packageName}</td>
                        <td>{formatMembershipDate(s.selectedAt)}</td>
                        <td>{s.cycleVisits}</td>
                        <td className="text-amber-700">
                          {formatMembershipEndDate(s.expiresAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!visible.length && (
                  <p className={styles.empty}>{c.noSubscribers}</p>
                )}
              </div>
              {total > 10 && (
                <div className={styles.actions}>
                  <button
                    className={styles.secondary}
                    type="button"
                    disabled={!page || subscribers.isFetching}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    <ChevronLeft size={14} />
                    {c.previous}
                  </button>
                  <span className={styles.muted}>
                    {page + 1} / {Math.ceil(total / 10)}
                  </span>
                  <button
                    className={styles.secondary}
                    type="button"
                    disabled={
                      (page + 1) * 10 >= total || subscribers.isFetching
                    }
                    onClick={() => setPage((p) => p + 1)}
                  >
                    {c.next}
                    <ChevronRight size={14} />
                  </button>
                </div>
              )}
            </>
          )}
          {error && <Notice tone="error">{error}</Notice>}
          <div className={`${styles.actions} justify-end`}>
            <button
              type="button"
              className={styles.secondary}
              onClick={onClose}
              disabled={pending}
            >
              {c.cancel}
            </button>
            <button
              type="button"
              className={styles.button}
              disabled={
                pending ||
                (notify &&
                  (!complete || subscribers.isError || subscribers.isPending))
              }
              onClick={() => onConfirm(notify, texts)}
            >
              {pending && <Loader2 size={15} className="animate-spin" />}
              {c.confirmDisable}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
