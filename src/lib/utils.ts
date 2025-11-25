import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

// Helper function to safely extract metadata fields
export function getMetadataField(
  metadata: Record<string, unknown> | null,
  fieldName: string,
  defaultValue: string,
): string {
  if (metadata == null) {
    return defaultValue
  }

  const value = metadata[fieldName]

  if (value == null) {
    return defaultValue
  }

  // Convert to string safely
  if (typeof value === 'string') {
    return value
  }

  if (typeof value === 'number') {
    return value.toString()
  }

  if (typeof value === 'boolean') {
    return value.toString()
  }

  // For objects or arrays, try to stringify
  try {
    return JSON.stringify(value)
  } catch {
    return defaultValue
  }
}
