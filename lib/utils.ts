import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function normalizePhoneNumber(phone: string): string {
  if (!phone) return "";
  // Strip all whitespace and symbols
  let cleaned = phone.replace(/[\s()\-]/g, "");
  
  if (!cleaned) return "";

  // If it starts with +994, it is already correct
  if (cleaned.startsWith("+994")) {
    return cleaned;
  }
  
  // If it starts with 994 (without +), prepend +
  if (cleaned.startsWith("994")) {
    return "+" + cleaned;
  }
  
  // If it starts with 0 and has 10 digits (e.g., 0551111111), replace leading 0 with +994
  if (cleaned.startsWith("0") && cleaned.length === 10) {
    return "+994" + cleaned.substring(1);
  }
  
  // If it is 9 digits (e.g., 551111111), prepend +994
  if (cleaned.length === 9) {
    return "+994" + cleaned;
  }
  
  // Fallback (if they enter something else, just return the stripped digits/string)
  return cleaned;
}

