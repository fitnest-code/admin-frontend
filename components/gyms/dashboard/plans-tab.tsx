"use client";
import { useGymStore } from "@/lib/store/gym-store";
import type { Gym } from "@/lib/gyms-data";
import { MembershipPolicyEditor } from "../membership/membership-policy-editor";
import { CategoryOfferingsEditor } from "../category-offerings/category-offerings-editor";

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
    <div className="flex flex-col gap-6">
      <MembershipPolicyEditor
        key={gymId}
        gymId={gymId}
        gymName={gym?.name ?? ""}
        onWorkHours={onWorkHours ?? (() => setCurrentTab("workingHours"))}
      />
      {gymId > 0 ? <CategoryOfferingsEditor gymId={gymId} /> : null}
    </div>
  );
}
