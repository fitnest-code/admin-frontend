import { create } from "zustand";
import type { PolicyDraft, MembershipPolicy } from "../types/membership";
export interface SavedMembershipDraft {
  draft: PolicyDraft;
  baseline: MembershipPolicy | null;
  signature: string;
}
interface EditorState {
  drafts: Record<number, SavedMembershipDraft>;
  setDraft: (gymId: number, draft: SavedMembershipDraft | null) => void;
  dirtyGymId: number | null;
  pendingAction: (() => void) | null;
  setDirtyGymId: (gymId: number | null) => void;
  requestDiscard: (action: () => void) => void;
  cancelDiscard: () => void;
  confirmDiscard: () => void;
}
export const useMembershipEditorState = create<EditorState>((set, get) => ({
  drafts: {},
  setDraft: (gymId, draft) =>
    set((state) => {
      const drafts = { ...state.drafts };
      if (draft) drafts[gymId] = draft;
      else delete drafts[gymId];
      return { drafts };
    }),
  dirtyGymId: null,
  pendingAction: null,
  setDirtyGymId: (dirtyGymId) => set({ dirtyGymId }),
  requestDiscard: (pendingAction) => set({ pendingAction }),
  cancelDiscard: () => set({ pendingAction: null }),
  confirmDiscard: () => {
    const action = get().pendingAction;
    if (!action) return;
    const gymId = get().dirtyGymId;
    if (gymId !== null) get().setDraft(gymId, null);
    set({ pendingAction: null, dirtyGymId: null });
    action?.();
  },
}));
