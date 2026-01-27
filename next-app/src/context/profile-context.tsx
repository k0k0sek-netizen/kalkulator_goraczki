'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Profile } from '@/types';
import { toast } from 'sonner';

interface ProfileContextType {
    profiles: Profile[];
    activeProfileId: string | null;
    activeProfile: Profile | undefined;
    setActiveProfileId: (id: string) => void;
    addProfile: (profile: Profile) => void;
    updateProfile: (profile: Profile) => void;
    deleteProfile: (id: string) => void;
    setProfiles: (profiles: Profile[]) => void; // For import/export
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
    const [profiles, setProfilesState] = useState<Profile[]>([]);
    const [activeProfileId, setActiveProfileIdState] = useState<string | null>(null);

    // Initial Load
    useEffect(() => {
        const savedProfiles = localStorage.getItem('fever-calc-profiles');
        const savedActiveId = localStorage.getItem('fever-calc-active-id');

        if (savedProfiles) {
            try {
                const parsed: Profile[] = JSON.parse(savedProfiles);
                setProfilesState(parsed);

                // Validation: ensure active ID exists
                if (savedActiveId && parsed.find(p => p.id === savedActiveId)) {
                    setActiveProfileIdState(savedActiveId);
                } else if (parsed.length > 0 && parsed[0]) {
                    // Default to first if saved invalid
                    setActiveProfileIdState(parsed[0].id);
                }
            } catch (e) {
                console.error("Failed to parse profiles", e);
            }
        }
    }, []);

    // Effect to persist Active ID changes
    useEffect(() => {
        if (activeProfileId) {
            localStorage.setItem('fever-calc-active-id', activeProfileId);
        } else {
            localStorage.removeItem('fever-calc-active-id');
        }
    }, [activeProfileId]);

    // Effect to persist Profiles changes
    useEffect(() => {
        if (profiles.length > 0) {
            localStorage.setItem('fever-calc-profiles', JSON.stringify(profiles));
        } else {
            // Uncomment if we want to clear when empty, usually safer not to unless explicit delete
            // localStorage.removeItem('fever-calc-profiles');
        }
    }, [profiles]);

    const setActiveProfileId = (id: string) => {
        setActiveProfileIdState(id);
    };

    const addProfile = (profile: Profile) => {
        setProfilesState(prev => [...prev, profile]);
        setActiveProfileId(profile.id); // Auto switch
    };

    const updateProfile = (updatedProfile: Profile) => {
        setProfilesState(prev => prev.map(p => p.id === updatedProfile.id ? updatedProfile : p));
    };

    const deleteProfile = (id: string) => {
        setProfilesState(prev => {
            const next = prev.filter(p => p.id !== id);
            // Handle active switch if deleted
            if (activeProfileId === id) {
                if (next.length > 0 && next[0]) {
                    setActiveProfileId(next[0].id);
                } else {
                    setActiveProfileIdState(null);
                }
            }
            // If empty, clear LS
            if (next.length === 0) {
                localStorage.removeItem('fever-calc-profiles');
            }
            return next;
        });
    };

    const setProfiles = (newProfiles: Profile[]) => {
        setProfilesState(newProfiles);
        if (newProfiles.length > 0 && newProfiles[0] && !newProfiles.find(p => p.id === activeProfileId)) {
            setActiveProfileId(newProfiles[0].id);
        }
    };

    const activeProfile = profiles.find(p => p.id === activeProfileId);

    return (
        <ProfileContext.Provider value={{
            profiles,
            activeProfileId,
            activeProfile,
            setActiveProfileId,
            addProfile,
            updateProfile,
            deleteProfile,
            setProfiles
        }}>
            {children}
        </ProfileContext.Provider>
    );
}

export function useProfile() {
    const context = useContext(ProfileContext);
    if (context === undefined) {
        throw new Error('useProfile must be used within a ProfileProvider');
    }
    return context;
}
