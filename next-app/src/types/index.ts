// Core Types & Interfaces

export interface PastEpisode {
    id: string;
    startDate: Date;
    endDate: Date;
    history: HistoryItem[];
    summary?: string; // Optional AI summary or note
}

export interface Profile {
    id: string;
    name: string;
    weight: number; // in kg
    isPediatric: boolean; // NOTE: Not used for logic! Only display preference
    createdAt: Date;
    updatedAt: Date;
    history: HistoryItem[];
    archivedEpisodes?: PastEpisode[]; // New field for past diseases
}

export interface HistoryItem {
    id: string;
    timestamp: Date;
    drug: DrugType;
    doseMl?: number;
    doseMg?: number;
    unit?: DoseUnit;
    temperature?: number; // in Celsius
    type: HistoryType;
    hoursInterval?: number;
    notes?: string;
    symptoms?: string[];
}


export type DrugType = 'Paracetamol' | 'Ibuprofen' | 'Metamizol' | 'Pomiar';
export type HistoryType = 'dose' | 'temp';
export type DoseUnit = 'ml' | 'czopek' | 'szt.';

// Drug Configuration

export interface Concentration {
    label: string;
    mg: number;
    ml: number;
    form: 'syrop' | 'czopek' | 'tabletka' | 'krople' | 'szt.';
}

export interface DrugDosageConfig {
    minPerKg: number;
    maxPerKg: number;
    maxDaily: number;
    hoursInterval: number;
}

export interface DrugCategoryConfig {
    label: string;
    concentrations: Concentration[];
    dosage: DrugDosageConfig;
}

export interface DrugConfig {
    label: string;
    description: string[];
    pediatric: DrugCategoryConfig;
    adult: DrugCategoryConfig;
}

export interface DrugConfigs {
    paracetamol: DrugConfig;
    ibuprofen: DrugConfig;
    metamizole: DrugConfig; // Added Metamizole
}

// Calculation Results

export interface DoseResult {
    doseMin: number; // in mg
    doseMax: number; // in mg
    volumeMin: number; // in ml
    volumeMax: number; // in ml
    isPediatric: boolean;
    dailyLimit: number; // in mg
    interval: number; // in hours
}

// Constants

export interface SafetyLimits {
    weightWarningThreshold: number; // 40kg
    minAge: number;
    maxTempThreshold: number; // 42°C
    minTempThreshold: number; // 35°C
}

export const SAFETY_LIMITS: SafetyLimits = {
    weightWarningThreshold: 40,
    minAge: 0,
    maxTempThreshold: 42,
    minTempThreshold: 35,
} as const;

// Utility Types

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredHistory = Omit<HistoryItem, 'doseMl' | 'doseMg' | 'unit' | 'temperature' | 'hoursInterval'>;

// Filter Types

export type HistoryFilter = 'all' | 'doses' | 'temp';

// Export/Import Format

export interface ExportData {
    version: string;
    exportDate: string;
    profiles: Profile[];
}
