import clsx, { type ClassValue } from "clsx";

/**
 * Combines class names into a single string.
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}