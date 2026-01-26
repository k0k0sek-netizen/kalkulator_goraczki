import type { DoseResult, Concentration, DrugCategoryConfig, HistoryItem } from '@/types';
import { SAFETY_LIMITS, DRUG_CONFIG } from './constants';

/**
 * Get last dose of specific drug
 */
export function getLastDose(history: HistoryItem[], drugName: string): HistoryItem | undefined {
    return history
        .filter(h => h.drug === drugName && h.type === 'dose')
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
}

/**
 * Check if weight qualifies for pediatric dosing
 * CRITICAL: This is the source of truth for pediatric logic!
 */
export function isPediatric(weight: number): boolean {
    return weight < SAFETY_LIMITS.weightWarningThreshold;
}

/**
 * Calculate dose range for given weight and drug configuration
 * @param weight Patient weight in kg
 * @param config Drug category configuration (pediatric or adult)
 * @param concentration Selected concentration/form
 * @returns Dose result with min/max in mg and volume
 */
export function calculateDose(
    weight: number,
    config: DrugCategoryConfig,
    concentration: Concentration
): DoseResult {
    const isPed = isPediatric(weight);

    let doseMinMg: number;
    let doseMaxMg: number;

    if (isPed) {
        // Pediatric: calculate based on weight
        doseMinMg = weight * config.dosage.minPerKg;
        doseMaxMg = weight * config.dosage.maxPerKg;
    } else {
        // Adult: fixed dose per administration
        doseMinMg = 500; // Default for Paracetamol
        doseMaxMg = 1000;

        // Adjust for Ibuprofen
        if (config.label.includes('Ibuprofen')) {
            doseMinMg = 200;
            doseMaxMg = 400;
        }
    }

    // Round to whole numbers
    doseMinMg = Math.round(doseMinMg);
    doseMaxMg = Math.round(doseMaxMg);

    // Calculate volume based on concentration
    const volumeMin = (doseMinMg / concentration.mg) * concentration.ml;
    const volumeMax = (doseMaxMg / concentration.mg) * concentration.ml;

    return {
        doseMin: doseMinMg,
        doseMax: doseMaxMg,
        volumeMin: Number(volumeMin.toFixed(1)),
        volumeMax: Number(volumeMax.toFixed(1)),
        isPediatric: isPed,
        dailyLimit: config.dosage.maxDaily,
        interval: config.dosage.hoursInterval,
    };
}

/**
 * Calculate total dose given today for a specific drug
 * @param history Patient history
 * @param drugName Drug name to filter
 * @returns Total mg administered in last 24 hours
 */
export function getDailyDoseTotal(
    history: Array<{ drug: string; doseMg?: number; timestamp: Date }>,
    drugName: string
): number {
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;

    return history
        .filter((item) => {
            const itemTime = new Date(item.timestamp).getTime();
            return item.drug === drugName && itemTime >= oneDayAgo;
        })
        .reduce((total, item) => total + (item.doseMg || 0), 0);
}

/**
 * Get time until next allowed dose
 * @param history Patient history
 * @param drugName Drug name
 * @param intervalHours Required interval in hours
 * @returns Object with canGive (boolean) and nextDoseTime (Date or null)
 */
export function getNextDoseTime(
    history: Array<{ drug: string; timestamp: Date }>,
    drugName: string,
    intervalHours: number
): { canGive: boolean; nextDoseTime: Date | null; hoursLeft: number } {
    // Find last dose
    const lastDose = history
        .filter((item) => item.drug === drugName)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];

    if (!lastDose) {
        return { canGive: true, nextDoseTime: null, hoursLeft: 0 };
    }

    const lastDoseTime = new Date(lastDose.timestamp).getTime();
    const intervalMs = intervalHours * 60 * 60 * 1000;
    const nextDoseTime = new Date(lastDoseTime + intervalMs);
    const now = Date.now();

    const canGive = now >= nextDoseTime.getTime();
    const msLeft = nextDoseTime.getTime() - now;
    const hoursLeft = Math.max(0, msLeft / (60 * 60 * 1000));

    return {
        canGive,
        nextDoseTime: canGive ? null : nextDoseTime,
        hoursLeft: Number(hoursLeft.toFixed(1)),
    };
}

/**
 * Check if dose exceeds daily limit
 * @param currentTotal Current daily total (mg)
 * @param proposedDose Proposed additional dose (mg)
 * @param dailyLimit Maximum daily limit (mg/kg for pediatric, total mg for adult)
 * @param weight Patient weight
 * @param isPediatric Is pediatric dosing
 * @returns True if safe, false if exceeds limit
 */
export function checkDailyLimit(
    currentTotal: number,
    proposedDose: number,
    dailyLimit: number,
    weight: number,
    isPediatric: boolean
): { safe: boolean; percentUsed: number; limitMg: number } {
    const limitMg = isPediatric ? dailyLimit * weight : dailyLimit;
    const newTotal = currentTotal + proposedDose;
    const percentUsed = (newTotal / limitMg) * 100;

    return {
        safe: newTotal <= limitMg,
        percentUsed: Number(percentUsed.toFixed(0)),
        limitMg: Math.round(limitMg),
    };
}
