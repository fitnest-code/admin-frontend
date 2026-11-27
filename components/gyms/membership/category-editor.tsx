"use client";
import { useEffect, useMemo, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useMembershipCopy } from "@/lib/i18n/membership";
import { TIERS, type PolicyDraft, type Tier } from "@/lib/types/membership";
import { tierName } from "@/lib/membership/policy";
import styles from "./membership.module.css";

function sameName(a: string, b: string) {
  return a.trim().toLocaleLowerCase() === b.trim().toLocaleLowerCase();
}

export function CategoryEditor({
  draft,
  onChange,
  suggestions,
  disabled,
}: {
  draft: PolicyDraft;
  onChange: (draft: PolicyDraft) => void;
  suggestions: string[];
  disabled: boolean;
}) {
  const c = useMembershipCopy();
  const includedTiers = useMemo(
    () =>
      TIERS.filter((t) => draft.packages.some((p) => p.tier === t && p.included)),
    [draft.packages],
  );
  const [tier, setTier] = useState<Tier>(includedTiers[0] ?? "BRONZE");
  const [editing, setEditing] = useState<number | "new" | null>(null);
  const [name, setName] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  useEffect(() => {
    if (!includedTiers.includes(tier) && includedTiers[0]) {
      setTier(includedTiers[0]);
    }
  }, [includedTiers, tier]);
  const categories =
    draft.packages.find((p) => p.tier === tier)?.categories ?? [];
  const available = suggestions.filter(
    (s) => !categories.some((c) => sameName(c, s)),
  );
  const update = (next: string[]) =>
    onChange({
      ...draft,
      packages: draft.packages.map((p) =>
        p.tier === tier ? { ...p, categories: next } : p,
      ),
    });
  const custom = name.trim();
  const customDuplicate =
    !!custom &&
    (categories.some(
      (value, i) => i !== editing && sameName(value, custom),
    ) ||
      selected.some((s) => sameName(s, custom)));
  const canSave =
    editing === "new"
      ? (selected.length > 0 || !!custom) && !customDuplicate
      : !!custom && !customDuplicate;
  const openNew = () => {
    setName("");
    setSelected([]);
    setEditing("new");
  };
  const openEdit = (index: number, category: string) => {
    setName(category);
    setSelected([]);
    setEditing(index);
  };
  const toggleSuggestion = (suggestion: string) => {
    setSelected((prev) =>
      prev.some((s) => sameName(s, suggestion))
        ? prev.filter((s) => !sameName(s, suggestion))
        : [...prev, suggestion],
    );
  };
  const confirm = () => {
    if (!canSave) return;
    if (editing === "new") {
      const next = [...categories];
      for (const s of selected) {
        if (!next.some((c) => sameName(c, s))) next.push(s);
      }
      if (custom && !next.some((c) => sameName(c, custom))) next.push(custom);
      update(next);
    } else if (typeof editing === "number") {
      update(categories.map((v, i) => (i === editing ? custom : v)));
    }
    setEditing(null);
    setSelected([]);
  };
  return (
    <section className={styles.panel} aria-labelledby="category-heading">
      <div className={styles.heading}>
        <div>
          <h2 id="category-heading" className={styles.title}>
            {c.servicesTitle}
          </h2>
          <p className={styles.subtitle}>
            {tierName(tier)}. {c.servicesSubtitle}
          </p>
        </div>
        <button
          type="button"
          className={styles.button}
          disabled={disabled}
          onClick={openNew}
        >
          <Plus size={15} />
          {c.addService}
        </button>
      </div>
      <div className={styles.tabs} role="tablist" aria-label={c.package}>
        {includedTiers.map((t) => (
          <button
            type="button"
            key={t}
            role="tab"
            aria-selected={t === tier}
            className={styles.tab}
            onClick={() => setTier(t)}
          >
            {tierName(t)}
          </button>
        ))}
      </div>
      <div className={styles.chips}>
        {categories.map((category, i) => (
          <div className={styles.chip} key={`${category}-${i}`}>
            <span>{category}</span>
            <button
              type="button"
              aria-label={`${c.edit}: ${category}`}
              disabled={disabled}
              onClick={() => openEdit(i, category)}
            >
              <Pencil size={12} />
            </button>
            <button
              type="button"
              aria-label={`${c.remove}: ${category}`}
              disabled={disabled}
              onClick={() =>
                update(categories.filter((_, index) => index !== i))
              }
            >
              <Trash2 size={12} />
            </button>
          </div>
        ))}
        {!categories.length && <p className={styles.muted}>{c.noServices}</p>}
      </div>
      <Dialog
        open={editing !== null}
        onOpenChange={(open) => {
          if (!open) {
            setEditing(null);
            setSelected([]);
          }
        }}
      >
        <DialogContent className={styles.dialog}>
          <DialogHeader>
            <DialogTitle>
              {editing === "new" ? c.addService : c.edit}
            </DialogTitle>
            <DialogDescription>
              {tierName(tier)}. {c.servicesSubtitle}
            </DialogDescription>
          </DialogHeader>
          <form
            className={styles.spaced}
            onSubmit={(e) => {
              e.preventDefault();
              confirm();
            }}
          >
            <label className={styles.label}>
              {c.serviceName}
              <input
                className={styles.input}
                value={name}
                maxLength={100}
                autoFocus
                required={editing !== "new" || selected.length === 0}
                placeholder={
                  editing === "new" ? c.serviceOrSelect : undefined
                }
                onChange={(e) => setName(e.target.value)}
              />
            </label>
            {customDuplicate && (
              <p className="text-sm text-red-600" role="alert">
                {c.errorCategory}
              </p>
            )}
            {editing === "new" && available.length > 0 && (
              <div>
                <p className={styles.muted}>{c.selectServices}</p>
                <div
                  className={styles.chips}
                  role="group"
                  aria-label={c.selectServices}
                >
                  {available.map((s) => {
                    const on = selected.some((v) => sameName(v, s));
                    return (
                      <button
                        type="button"
                        className={styles.tab}
                        key={s}
                        aria-pressed={on}
                        aria-selected={on}
                        onClick={() => toggleSuggestion(s)}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            <div className={`${styles.actions} justify-end`}>
              <button
                type="button"
                className={styles.secondary}
                onClick={() => {
                  setEditing(null);
                  setSelected([]);
                }}
              >
                {c.cancel}
              </button>
              <button className={styles.button} disabled={!canSave}>
                {c.save}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
}
