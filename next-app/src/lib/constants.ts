import type { DrugConfigs, SafetyLimits } from '@/types';

/**
 * Safety limits and thresholds
 */
export const SAFETY_LIMITS: SafetyLimits = {
    weightWarningThreshold: 40, // kg - pediatric vs adult
    minAge: 0,
    maxTempThreshold: 42, // °C
    minTempThreshold: 35, // °C
} as const;

/**
 * Drug configuration - Paracetamol & Ibuprofen
 * Based on Polish pediatric guidelines
 */
export const DRUG_CONFIG: DrugConfigs = {
    paracetamol: {
        label: 'Paracetamol',
        description: ['Przeciwbólowy', 'Przeciwgorączkowy'],
        pediatric: {
            label: 'Paracetamol',
            concentrations: [
                // Syropy
                { label: 'Syrop standard 120mg/5ml (Apap, Panadol)', mg: 120, ml: 5, form: 'syrop' },
                { label: 'Syrop 240mg/5ml (Pedicetamol)', mg: 240, ml: 5, form: 'syrop' },
                // Czopki
                { label: 'Czopek 80mg (dla małych dzieci)', mg: 80, ml: 1, form: 'czopek' },
                { label: 'Czopek 125mg', mg: 125, ml: 1, form: 'czopek' },
                { label: 'Czopek 250mg', mg: 250, ml: 1, form: 'czopek' },
                { label: 'Czopek 500mg (starsze dzieci)', mg: 500, ml: 1, form: 'czopek' },
                // Krople
                { label: 'Krople 100mg/ml (Pedicetamol, Codipar)', mg: 100, ml: 1, form: 'krople' },
            ],
            dosage: {
                minPerKg: 10,
                maxPerKg: 15,
                maxDaily: 60, // mg/kg/24h
                hoursInterval: 4,
            },
        },
        adult: {
            label: 'Paracetamol (Dorośli)',
            concentrations: [
                { label: 'Tabletka 500mg (Apap, Panadol)', mg: 500, ml: 1, form: 'tabletka' },
                { label: 'Tabletka 1000mg', mg: 1000, ml: 1, form: 'tabletka' },
            ],
            dosage: {
                minPerKg: 0, // Fixed dose for adults
                maxPerKg: 0,
                maxDaily: 4000, // mg total (not per kg)
                hoursInterval: 6,
            },
        },
    },

    ibuprofen: {
        label: 'Ibuprofen',
        description: ['Przeciwbólowy', 'Przeciwgorączkowy', 'Przeciwzapalny'],
        pediatric: {
            label: 'Ibuprofen',
            concentrations: [
                // Syropy
                { label: 'Syrop 100mg/5ml (Ibum, Nurofen, Ibufen)', mg: 100, ml: 5, form: 'syrop' },
                { label: 'Syrop 200mg/5ml (Ibum Forte, Nurofen dla dzieci)', mg: 200, ml: 5, form: 'syrop' },
                // Czopki
                { label: 'Czopek 60mg (dla małych dzieci)', mg: 60, ml: 1, form: 'czopek' },
                { label: 'Czopek 125mg', mg: 125, ml: 1, form: 'czopek' },
            ],
            dosage: {
                minPerKg: 5,
                maxPerKg: 10,
                maxDaily: 30, // mg/kg/24h
                hoursInterval: 6,
            },
        },
        adult: {
            label: 'Ibuprofen (Dorośli)',
            concentrations: [
                { label: 'Tabletka 200mg (Ibuprom, Nurofen)', mg: 200, ml: 1, form: 'tabletka' },
                { label: 'Tabletka 400mg', mg: 400, ml: 1, form: 'tabletka' },
            ],
            dosage: {
                minPerKg: 0, // Fixed dose for adults
                maxPerKg: 0,
                maxDaily: 1200, // mg total (not per kg)
                hoursInterval: 8,
            },
        },
    },
} as const;
