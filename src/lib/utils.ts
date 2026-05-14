import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatLocalTime(isoString: string): string {
  const date = new Date(isoString)
  if (isNaN(date.getTime())) return isoString
  const offsetMs = 8 * 60 * 60 * 1000
  const local = new Date(date.getTime() + offsetMs)
  const y = local.getUTCFullYear()
  const m = String(local.getUTCMonth() + 1).padStart(2, "0")
  const d = String(local.getUTCDate()).padStart(2, "0")
  const h = String(local.getUTCHours()).padStart(2, "0")
  const min = String(local.getUTCMinutes()).padStart(2, "0")
  const s = String(local.getUTCSeconds()).padStart(2, "0")
  return `${y}/${m}/${d} ${h}:${min}:${s}`
}

export function formatLocalDate(isoString: string): string {
  const date = new Date(isoString)
  if (isNaN(date.getTime())) return isoString
  const offsetMs = 8 * 60 * 60 * 1000
  const local = new Date(date.getTime() + offsetMs)
  const y = local.getUTCFullYear()
  const m = String(local.getUTCMonth() + 1).padStart(2, "0")
  const d = String(local.getUTCDate()).padStart(2, "0")
  return `${y}/${m}/${d}`
}
