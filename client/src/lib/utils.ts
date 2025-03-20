import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a date string into a localized date format
 */
export function formatDate(dateString: string | Date | null | undefined): string {
  if (!dateString) return "-";
  
  const date = typeof dateString === "string" ? new Date(dateString) : dateString;
  
  // Check if date is valid
  if (isNaN(date.getTime())) return "-";
  
  return date.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}
