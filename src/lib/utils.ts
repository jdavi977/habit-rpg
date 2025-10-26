import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * This is function is a CSS class utility function that combines CSS classes and resolves tailwind conflicts
 * instead of className="px-4 py-2"
 * can do  this cs("px-4 py-2")
 * @param inputs 
 * @returns merged class string
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
