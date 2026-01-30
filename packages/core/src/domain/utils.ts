/**
 * XPGains Utility Functions
 * Unit conversion and helper functions
 */

/**
 * Convert kilograms to pounds
 * @param kg - Weight in kilograms
 * @returns Weight in pounds (rounded to 1 decimal place)
 */
export function kgToLbs(kg: number): number {
  return Math.round(kg * 2.20462 * 10) / 10;
}

/**
 * Convert pounds to kilograms
 * @param lbs - Weight in pounds
 * @returns Weight in kilograms (rounded to 1 decimal place)
 */
export function lbsToKg(lbs: number): number {
  return Math.round((lbs / 2.20462) * 10) / 10;
}

/**
 * Format weight for display
 * @param weightKg - Weight in kilograms (internal storage unit)
 * @param displayUnit - Display unit ('kg' or 'lbs')
 * @returns Formatted weight string
 */
export function formatWeight(
  weightKg: number,
  displayUnit: 'kg' | 'lbs'
): string {
  if (displayUnit === 'lbs') {
    return `${kgToLbs(weightKg)} lbs`;
  }
  return `${weightKg} kg`;
}

/**
 * Parse weight input to kilograms
 * @param value - Weight value
 * @param inputUnit - Unit of the input value
 * @returns Weight in kilograms
 */
export function parseWeightToKg(
  value: number,
  inputUnit: 'kg' | 'lbs'
): number {
  if (inputUnit === 'lbs') {
    return lbsToKg(value);
  }
  return value;
}

/**
 * Clamp a value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Generate a random integer between min and max (inclusive)
 */
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Format a date for display
 * @param date - Date or ISO string
 * @param style - Display style
 */
export function formatDate(
  date: Date | string,
  style: 'short' | 'long' | 'relative' = 'short'
): string {
  const d = typeof date === 'string' ? new Date(date) : date;

  if (style === 'relative') {
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  }

  if (style === 'long') {
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format duration in seconds to display string
 * @param seconds - Duration in seconds
 * @returns Formatted duration string
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }
  return `${secs}s`;
}

/**
 * Group an array by a key
 */
export function groupBy<T, K extends string | number>(
  array: T[],
  keyFn: (item: T) => K
): Record<K, T[]> {
  return array.reduce(
    (result, item) => {
      const key = keyFn(item);
      if (!result[key]) {
        result[key] = [];
      }
      result[key].push(item);
      return result;
    },
    {} as Record<K, T[]>
  );
}

/**
 * Get the start of day for a date
 */
export function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Check if two dates are the same day
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return startOfDay(date1).getTime() === startOfDay(date2).getTime();
}

/**
 * Get XP bar color based on progress percentage
 * Interpolates from red -> orange -> yellow -> green
 * @param percentage - Progress percentage (0-100)
 * @returns Color hex string
 */
export function getXpBarColor(percentage: number): string {
  const stops = [
    { pct: 0, color: '#ff3b30' },    // Red
    { pct: 33, color: '#ff9500' },   // Orange
    { pct: 66, color: '#ffcc00' },   // Yellow
    { pct: 100, color: '#34c759' },  // Green
  ];

  // Find the two color stops to interpolate between
  let lower = stops[0];
  let upper = stops[stops.length - 1];

  for (let i = 0; i < stops.length - 1; i++) {
    if (percentage >= stops[i].pct && percentage <= stops[i + 1].pct) {
      lower = stops[i];
      upper = stops[i + 1];
      break;
    }
  }

  // Interpolate between the two colors
  const range = upper.pct - lower.pct;
  const ratio = range > 0 ? (percentage - lower.pct) / range : 0;

  const lowerRgb = hexToRgb(lower.color);
  const upperRgb = hexToRgb(upper.color);

  const r = Math.round(lowerRgb.r + (upperRgb.r - lowerRgb.r) * ratio);
  const g = Math.round(lowerRgb.g + (upperRgb.g - lowerRgb.g) * ratio);
  const b = Math.round(lowerRgb.b + (upperRgb.b - lowerRgb.b) * ratio);

  return rgbToHex(r, g, b);
}

/**
 * Convert hex color to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
}

/**
 * Convert RGB to hex color
 */
function rgbToHex(r: number, g: number, b: number): string {
  return (
    '#' +
    [r, g, b]
      .map(x => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      })
      .join('')
  );
}
