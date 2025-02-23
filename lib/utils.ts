import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility functions for the application
 * Currently provides className merging functionality using clsx and tailwind-merge
 */

// Merges class names while handling Tailwind conflicts
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
