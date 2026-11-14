"use client";
import { useGymStore } from "@/lib/store/gym-store";
import type { Gym } from "@/lib/gyms-data";
import { MembershipPolicyEditor } from "../membership/membership-policy-editor";

export function PlansTab({
  gym,
  onWorkHours,
}: {
  gym?: Gym;
  onWorkHours?: () => void;
}) {
  const storeId = useGymStore((s) => s.gymId);
  const setCurrentTab = useGymStore((s) => s.setCurrentTab);
  const gymId = Number(gym?.id ?? storeId);
  return (
    <MembershipPolicyEditor
      key={gymId}
      gymId={gymId}
      gymName={gym?.name ?? ""}
      onWorkHours={onWorkHours ?? (() => setCurrentTab("workingHours"))}
    />
  );
}
