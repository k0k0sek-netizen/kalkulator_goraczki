import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind CSS classes with conflict resolution
 * @param inputs Class names to merge
 * @returns Merged class string
 */
export function cn(...inputs: ClassValue[]): string {
    return twMerge(clsx(inputs));
}

/**
 * Format date to Polish locale
 * @param date Date to format
 * @param options Intl.DateTimeFormat options
 */
export function formatDate(
    date: Date | string,
    options?: Intl.DateTimeFormatOptions
): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleString('pl-PL', options);
}

/**
 * Format temperature with °C suffix
 */
export function formatTemperature(temp: number): string {
    return `${temp.toFixed(1)}°C`;
}

/**
 * Generate UUID v4 (SSR safe with fallback)
 */
export function generateId(): string {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    // Fallback for environment without crypto.randomUUID
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

/**
 * Round number to specified decimals
 */
export function roundTo(num: number, decimals: number = 1): number {
    const factor = Math.pow(10, decimals);
    return Math.round(num * factor) / factor;
}

/**
 * Check if weight is pediatric (<40kg)}
 */
export function isPediatricWeight(weight: number): boolean {
    return weight < 40;
}
