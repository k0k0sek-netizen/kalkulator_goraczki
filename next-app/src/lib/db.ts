import Dexie, { type EntityTable } from 'dexie';
import type { Profile, HistoryItem } from '@/types';

/**
 * IndexedDB Database for Kalkulator Gorączki
 * Stores profiles and history locally (privacy-first)
 */
class FeverCalcDatabase extends Dexie {
    profiles!: EntityTable<Profile, 'id'>;
    history!: EntityTable<HistoryItem, 'id'>;

    constructor() {
        super('FeverCalcDB');

        // Schema version 1
        this.version(1).stores({
            profiles: 'id, name, weight, createdAt',
            history: 'id, timestamp, drug, type',
        });
    }
}

// Singleton instance (SSR safe check)
// Creating the instance is generally safe in Dexie, but we want to avoid side effects on server
const createDb = () => new FeverCalcDatabase();

export const db = globalThis.window ? createDb() : ({} as FeverCalcDatabase);

// Migration helper for localStorage → IndexedDB (if needed)
export async function migrateFromLocalStorage(): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
        const oldData = localStorage.getItem('fever-calc-profiles');
        if (!oldData) return;

        const parsed = JSON.parse(oldData);
        if (!Array.isArray(parsed)) return;

        // Check if DB is empty
        const count = await db.profiles.count();
        if (count > 0) {
            console.log('DB already populated, skipping migration');
            return;
        }

        // Migrate profiles
        for (const profile of parsed) {
            await db.profiles.add({
                ...profile,
                createdAt: new Date(profile.createdAt || Date.now()),
                updatedAt: new Date(profile.updatedAt || Date.now()),
                history: profile.history || [],
            });
        }

        console.log(`Migrated ${parsed.length} profiles from localStorage`);

        // Optionally clear localStorage after successful migration
        // localStorage.removeItem('fever-calc-profiles');
    } catch (error) {
        console.error('Migration failed:', error);
    }
}
