"use client";

import type { CSSProperties, InputHTMLAttributes } from "react";
import { isTime24, toTime24 } from "@/lib/time-24";

export { toTime24 } from "@/lib/time-24";

type Props = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "value" | "onChange" | "inputMode"
> & {
  value: string;
  onChange: (next: string) => void;
  className?: string;
  style?: CSSProperties;
};

/**
 * Always edits/displays 24-hour `HH:mm`. Native `type="time"` follows the OS
 * locale and shows AM/PM on en-US machines — avoid that in admin.
 */
export function TimeInput24({ value, onChange, onBlur, ...rest }: Props) {
  return (
    <input
      {...rest}
      type="text"
      inputMode="numeric"
      autoComplete="off"
      spellCheck={false}
      placeholder="HH:mm"
      lang="az"
      title="HH:mm (24 saat)"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onBlur={(e) => {
        const next = toTime24(e.target.value);
        onChange(isTime24(next) ? next : "");
        onBlur?.(e);
      }}
    />
  );
}
