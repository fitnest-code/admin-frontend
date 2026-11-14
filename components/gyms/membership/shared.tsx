"use client";
import type { ReactNode } from "react";
import { AlertCircle, Info, Loader2, CheckCircle2 } from "lucide-react";
import { ApiError } from "@/lib/api/client";
import { errorCode } from "@/lib/query/use-gym-membership";
import type { MembershipCopy } from "@/lib/i18n/membership";
import type { PolicyIssue } from "@/lib/membership/policy";
import styles from "./membership.module.css";
export function Notice({
  children,
  tone = "info",
}: {
  children: ReactNode;
  tone?: "info" | "error" | "warning" | "success";
}) {
  const Icon =
    tone === "error" || tone === "warning"
      ? AlertCircle
      : tone === "success"
        ? CheckCircle2
        : Info;
  return (
    <div
      className={`${styles.notice} ${tone === "info" ? "" : styles[tone]}`}
      role={tone === "error" ? "alert" : "status"}
    >
      <Icon size={15} />
      <div>{children}</div>
    </div>
  );
}
export function Busy({ text }: { text: string }) {
  return (
    <div className={styles.inline} role="status">
      <Loader2 size={16} className="animate-spin" />
      {text}
    </div>
  );
}
export function issueText(
  code: PolicyIssue["code"],
  copy: MembershipCopy,
): string {
  const messages = {
    included: copy.errorIncluded,
    price: copy.errorPrice,
    monthly: copy.errorMonthly,
    ranges: copy.errorRanges,
    overlap: copy.errorOverlap,
    coverage: copy.errorCoverage,
    hours: copy.errorHours,
    tier: copy.errorTier,
    category: copy.errorCategory,
  };
  return messages[code];
}
export function membershipError(error: unknown, copy: MembershipCopy): string {
  const code = errorCode(error);
  const messages: Record<string, string> = {
    POLICY_CHANGED: copy.conflict,
    CONCURRENT_UPDATE: copy.conflict,
    PRIMARY_ALREADY_USED_THIS_MONTH: copy.changeLocked,
    PRIMARY_SELECTION_DISABLED: copy.notEligible,
    PRIMARY_GYM_NOT_CONFIGURED: copy.setupRequired,
    INVALID_SERVICE_KEY: copy.setupRequired,
    TIME_RULES_MUST_COVER_WORK_HOURS: copy.errorCoverage,
    OVERLAPPING_TIME_RULES: copy.errorOverlap,
    TIME_PRIMARY_PRICE_REQUIRED: copy.errorMonthly,
    PRIMARY_PRICE_REQUIRED: copy.errorMonthly,
    INVALID_TIME_PRICE_TIER: copy.errorTier,
    NO_ACTIVE_SUBSCRIPTION: copy.noSubscription,
  };
  return (
    (code && messages[code]) ||
    (error instanceof ApiError && error.status === 503
      ? copy.failed
      : error instanceof ApiError && error.status === 404
        ? copy.notEligible
        : copy.failed)
  );
}
