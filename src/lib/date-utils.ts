/**
 * Utility functions for safe date handling
 */

/**
 * Safely parse a date value and return a valid Date object or null
 * @param dateValue - The date value to parse (can be Date, string, or any value)
 * @returns Valid Date object or null if invalid
 */
export function safeParseDateToDate(dateValue: unknown): Date | null {
  if (dateValue == null) {
    return null
  }

  // If it's already a Date object
  if (dateValue instanceof Date) {
    return Number.isNaN(dateValue.getTime()) ? null : dateValue
  }

  // Only try to parse strings and numbers
  if (typeof dateValue !== 'string' && typeof dateValue !== 'number') {
    return null
  }

  // Try to parse as Date
  try {
    const parsed = new Date(dateValue)
    return Number.isNaN(parsed.getTime()) ? null : parsed
  } catch {
    return null
  }
}

/**
 * Safely parse a date value and return an ISO date string (YYYY-MM-DD) or null
 * @param dateValue - The date value to parse
 * @returns ISO date string or null if invalid
 */
export function safeParseDateToISOString(dateValue: unknown): string | null {
  const date = safeParseDateToDate(dateValue)
  if (date == null) {
    return null
  }

  try {
    return date.toISOString().split('T')[0]
  } catch {
    return null
  }
}

/**
 * Safely parse a date value and return a formatted time string or null
 * @param dateValue - The date value to parse
 * @returns Time string in HH:MM format or null if invalid
 */
export function safeParseDateToTimeString(dateValue: unknown): string | null {
  const date = safeParseDateToDate(dateValue)
  if (date == null) {
    return null
  }

  try {
    return date.toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      hour12: false,
      minute: '2-digit',
    })
  } catch {
    return null
  }
}

/**
 * Safely check if a date value is valid
 * @param dateValue - The date value to check
 * @returns true if the date is valid, false otherwise
 */
export function isValidDate(dateValue: unknown): boolean {
  return safeParseDateToDate(dateValue) !== null
}

/**
 * Get copyright year display
 * Shows "2025" if current year is 2025, otherwise shows "2025 - {current year}"
 * @returns Copyright year string
 */
export function getCopyrightYear(): string {
  const currentYear = new Date().getFullYear()
  const startYear = 2025

  if (currentYear === startYear) {
    return String(startYear)
  }

  return `${startYear} - ${currentYear}`
}
