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
                { label: 'Syrop 240mg/5ml (Pedicetamol, Hasco)', mg: 240, ml: 5, form: 'syrop' },
                // Czopki
                { label: 'Czopek 50mg (noworodki)', mg: 50, ml: 1, form: 'czopek' },
                { label: 'Czopek 80mg (niemowlęta)', mg: 80, ml: 1, form: 'czopek' },
                { label: 'Czopek 125mg', mg: 125, ml: 1, form: 'czopek' },
                { label: 'Czopek 250mg', mg: 250, ml: 1, form: 'czopek' },
                { label: 'Czopek 500mg (starsze dzieci)', mg: 500, ml: 1, form: 'czopek' },
                // Krople
                { label: 'Krople 100mg/ml (Pedicetamol, Codipar)', mg: 100, ml: 1, form: 'krople' },
                // Saszetki/Inne
                { label: 'Saszetka 300mg (Apap Junior)', mg: 300, ml: 1, form: 'szt.' },
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
                { label: 'Saszetka 500mg (Apap Hot, Fervex - paracetamol)', mg: 500, ml: 1, form: 'szt.' },
                { label: 'Saszetka 1000mg (Theraflu - paracetamol)', mg: 1000, ml: 1, form: 'szt.' },
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
                // Kapsułki/Inne
                { label: 'Kapsułka do żucia 100mg (Nurofen Junior)', mg: 100, ml: 1, form: 'szt.' },
                { label: 'Saszetka 200mg', mg: 200, ml: 1, form: 'szt.' },
            ],
            dosage: {
                minPerKg: 5,
                maxPerKg: 10,
                maxDaily: 30, // mg/kg/24h
                hoursInterval: 6, // Standard interval
            },
        },
        adult: {
            label: 'Ibuprofen (Dorośli)',
            concentrations: [
                { label: 'Tabletka 200mg (Ibuprom, Nurofen)', mg: 200, ml: 1, form: 'tabletka' },
                { label: 'Tabletka 400mg (Ibuprom Forte)', mg: 400, ml: 1, form: 'tabletka' },
                { label: 'Kapsułka 400mg (Ibum Sprint)', mg: 400, ml: 1, form: 'tabletka' },
            ],
            dosage: {
                minPerKg: 0, // Fixed dose for adults
                maxPerKg: 0,
                maxDaily: 1200, // mg total (OTC standard)
                hoursInterval: 6, // Changed from 8 to 6 for better control (4 doses/day fits max 1200-1600 depending heavily on doctor advice, strictly OTC ulotki often say 4h with max 1200mg)
            },
        },
    },

    metamizole: {
        label: 'Metamizol (Pyralgina)',
        description: ['Przeciwbólowy', 'Przeciwgorączkowy', 'Lek II rzutu - silny'],
        pediatric: {
            label: 'Metamizol (Dzieci)',
            concentrations: [
                { label: 'Krople 500mg/ml (Pyralgina krople)', mg: 500, ml: 1, form: 'krople' },
            ],
            dosage: {
                minPerKg: 10,
                maxPerKg: 15,
                maxDaily: 45, // approx 3-4 doses max
                hoursInterval: 8, // Strictly regulated usually, 6-8h, sticking to safe 8h for self-medication app
            },
        },
        adult: {
            label: 'Metamizol (Dorośli)',
            concentrations: [
                { label: 'Tabletka 500mg (Pyralgina)', mg: 500, ml: 1, form: 'tabletka' },
            ],
            dosage: {
                minPerKg: 0,
                maxPerKg: 0,
                maxDaily: 3000, // Max 6 tablets usually (3000-4000mg depending on source, 3g is safe limit for app)
                hoursInterval: 6,
            },
        },
    },
} as const;
