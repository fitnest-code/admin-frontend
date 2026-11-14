"use client";
import { useState } from "react";
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
  const [tier, setTier] = useState<Tier>("BRONZE");
  const [editing, setEditing] = useState<number | "new" | null>(null);
  const [name, setName] = useState("");
  const categories =
    draft.packages.find((p) => p.tier === tier)?.categories ?? [];
  const update = (next: string[]) =>
    onChange({
      ...draft,
      packages: draft.packages.map((p) =>
        p.tier === tier ? { ...p, categories: next } : p,
      ),
    });
  const duplicate = categories.some(
    (value, i) =>
      i !== editing &&
      value.trim().toLocaleLowerCase() === name.trim().toLocaleLowerCase(),
  );
  const confirm = () => {
    if (!name.trim() || duplicate) return;
    update(
      editing === "new"
        ? [...categories, name.trim()]
        : categories.map((v, i) => (i === editing ? name.trim() : v)),
    );
    setEditing(null);
  };
  return (
    <section className={styles.panel} aria-labelledby="category-heading">
      <div className={styles.heading}>
        <div>
          <h2 id="category-heading" className={styles.title}>
            {tierName(tier)} · {c.categories}
          </h2>
          <p className={styles.subtitle}>{c.categoryHelp}</p>
        </div>
        <button
          type="button"
          className={styles.button}
          disabled={disabled}
          onClick={() => {
            setName("");
            setEditing("new");
          }}
        >
          <Plus size={15} />
          {c.addCategory}
        </button>
      </div>
      <div className={styles.tabs} role="tablist" aria-label={c.package}>
        {TIERS.map((t) => (
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
              onClick={() => {
                setName(category);
                setEditing(i);
              }}
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
        {!categories.length && <p className={styles.muted}>{c.noCategories}</p>}
      </div>
      <Dialog
        open={editing !== null}
        onOpenChange={(open) => {
          if (!open) setEditing(null);
        }}
      >
        <DialogContent className={styles.dialog}>
          <DialogHeader>
            <DialogTitle>
              {editing === "new" ? c.addCategory : c.edit}
            </DialogTitle>
            <DialogDescription>
              {tierName(tier)} · {c.categoryHelp}
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
              {c.categoryName}
              <input
                className={styles.input}
                value={name}
                maxLength={100}
                autoFocus
                required
                onChange={(e) => setName(e.target.value)}
              />
            </label>
            {duplicate && (
              <p className="text-sm text-red-600" role="alert">
                {c.errorCategory}
              </p>
            )}
            {suggestions.filter((s) => !categories.includes(s)).length > 0 && (
              <div className={styles.chips}>
                {suggestions
                  .filter((s) => !categories.includes(s))
                  .map((s) => (
                    <button
                      type="button"
                      className={styles.tab}
                      key={s}
                      onClick={() => setName(s)}
                    >
                      {s}
                    </button>
                  ))}
              </div>
            )}
            <div className={`${styles.actions} justify-end`}>
              <button
                type="button"
                className={styles.secondary}
                onClick={() => setEditing(null)}
              >
                {c.cancel}
              </button>
              <button
                className={styles.button}
                disabled={!name.trim() || duplicate}
              >
                {c.save}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
}
