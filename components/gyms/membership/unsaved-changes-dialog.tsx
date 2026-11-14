"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useMembershipEditorState } from "@/lib/membership/editor-state";
import { useMembershipCopy } from "@/lib/i18n/membership";
import styles from "./membership.module.css";
export function UnsavedChangesDialog() {
  const c = useMembershipCopy();
  const pending = useMembershipEditorState((s) => !!s.pendingAction);
  const cancel = useMembershipEditorState((s) => s.cancelDiscard);
  const confirm = useMembershipEditorState((s) => s.confirmDiscard);
  return (
    <Dialog
      open={pending}
      onOpenChange={(value) => {
        if (!value) cancel();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{c.unsaved}</DialogTitle>
          <DialogDescription>{c.discardQuestion}</DialogDescription>
        </DialogHeader>
        <div className={`${styles.actions} justify-end`}>
          <button type="button" className={styles.secondary} onClick={cancel}>
            {c.cancel}
          </button>
          <button type="button" className={styles.danger} onClick={confirm}>
            {c.discard}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
