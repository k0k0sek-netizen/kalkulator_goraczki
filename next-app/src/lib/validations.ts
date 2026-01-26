import { z } from 'zod';

/**
 * Validation schemas using Zod
 */

export const ProfileSchema = z.object({
    name: z
        .string()
        .min(1, 'Imię jest wymagane')
        .max(50, 'Imię zbyt długie'),
    weight: z
        .number()
        .min(3, 'Waga musi być >= 3kg')
        .max(150, 'Waga musi być <= 150kg'),
    isPediatric: z.boolean().default(true),
});

export const TemperatureSchema = z
    .number()
    .min(35, 'Temperatura poniżej 35°C - skontaktuj się z lekarzem!')
    .max(42, 'Temperatura powyżej 42°C - natychmiast dzwoń na pogotowie!');

export const DoseSchema = z.object({
    drug: z.enum(['Paracetamol', 'Ibuprofen']),
    doseMl: z.number().positive('Dawka musi być > 0'),
    doseMg: z.number().positive('Dawka musi być > 0'),
    unit: z.enum(['ml', 'czopek', 'szt.']),
    temperature: TemperatureSchema.optional(),
});

export const HistoryItemSchema = z.object({
    drug: z.enum(['Paracetamol', 'Ibuprofen', 'Pomiar']),
    timestamp: z.date(),
    doseMl: z.number().optional(),
    doseMg: z.number().optional(),
    unit: z.enum(['ml', 'czopek', 'szt.']).optional(),
    temperature: TemperatureSchema.optional(),
    type: z.enum(['dose', 'temp']),
    hoursInterval: z.number().positive().optional(),
});

// Export inferred types
export type ProfileInput = z.infer<typeof ProfileSchema>;
export type DoseInput = z.infer<typeof DoseSchema>;
export type HistoryItemInput = z.infer<typeof HistoryItemSchema>;
