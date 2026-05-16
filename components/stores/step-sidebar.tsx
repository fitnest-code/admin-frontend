"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const steps = [
  { id: 1, label: "Mağaza məlumatları" },
  { id: 2, label: "Əlaqə" },
  { id: 3, label: "Paketlər və endirimlər" },
] as const;

interface StepSidebarProps {
  current: number;
  onGo: (step: number) => void;
}

export default function StepSidebar({ current, onGo }: StepSidebarProps) {
  return (
    <aside className="w-full lg:w-[220px] shrink-0 bg-white rounded-xl p-4 shadow-sm border border-[#ececed]/50">
      <div className="flex flex-col items-start px-2">
        {steps.map((step, index) => {
          const isActive = current === step.id;
          const isCompleted = current > step.id;

          return (
            <div key={step.id} className="w-full group">
              <button
                type="button"
                disabled={!isCompleted && !isActive}
                onClick={() => isCompleted && onGo(step.id)}
                className={cn(
                  "w-full text-left",
                  !isCompleted && !isActive && "cursor-not-allowed",
                  isCompleted && "cursor-pointer",
                )}
              >
                <div className="flex items-center gap-3 w-full py-0.5">
                  <div
                    className={cn(
                      "w-9 h-9 rounded-full flex items-center justify-center text-[15px] font-semibold transition-all duration-300 shrink-0",
                      isActive
                        ? "bg-[#00B4CC] text-white shadow-md scale-105"
                        : isCompleted
                          ? "bg-[#00B4CC] text-white group-hover:bg-[#009DB3]"
                          : "bg-[#F3F4F6] text-[#9CA3AF]",
                    )}
                  >
                    {isCompleted ? <Check size={16} strokeWidth={3} /> : step.id}
                  </div>
                  <span
                    className={cn(
                      "text-[15px] font-medium leading-6 transition-colors duration-300",
                      isActive ? "text-black" : "text-[#C9C9C9]",
                    )}
                  >
                    {step.label}
                  </span>
                </div>
              </button>

              {index < steps.length - 1 && (
                <div className="w-9 flex justify-center py-1">
                  <div className="w-[3px] h-[20px] rounded-full bg-[#E8E8E8]" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
