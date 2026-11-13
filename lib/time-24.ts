const HHMM = /^([01]\d|2[0-3]):([0-5]\d)$/;

/** Normalize API / locale strings (incl. AM/PM) to 24h `HH:mm`. */
export function toTime24(value: string): string {
  if (!value) return "";
  const cleaned = String(value).trim().toLowerCase().replace(/\s+/g, " ");
  const matched = cleaned.match(
    /^(\d{1,2}):(\d{2})(?::\d{2})?\s*(a\.?m\.?|p\.?m\.?)?$/i,
  );
  if (!matched) return cleaned.length <= 5 ? cleaned : cleaned.slice(0, 5);

  let hours = Number.parseInt(matched[1], 10);
  const minutes = matched[2];
  const meridiem = matched[3]?.replace(/\./g, "") ?? "";
  if (meridiem.startsWith("p") && hours < 12) hours += 12;
  if (meridiem.startsWith("a") && hours === 12) hours = 0;
  if (Number.isNaN(hours) || hours < 0 || hours > 23) return "";
  return `${String(hours).padStart(2, "0")}:${minutes}`;
}

export function isTime24(value: string): boolean {
  return HHMM.test(value);
}
