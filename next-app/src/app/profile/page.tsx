'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, User, Trash2, Save, Download, Upload } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import type { Profile } from '@/types';
import { InstallPrompt } from '@/components/install-prompt';
import { useProfile } from '@/context/profile-context';

export default function ProfilePage() {
    const { profiles, activeProfile, activeProfileId, setActiveProfileId, updateProfile, deleteProfile, setProfiles } = useProfile();
    const [editName, setEditName] = useState('');
    const [editWeight, setEditWeight] = useState('');

    // Sync local edit state with active profile
    useEffect(() => {
        if (activeProfile) {
            setEditName(activeProfile.name);
            setEditWeight(activeProfile.weight.toString());
        }
    }, [activeProfile]);

    const handleProfileSelect = (id: string) => {
        setActiveProfileId(id);
    };

    const handleSave = () => {
        if (!activeProfile) return;

        const weight = parseFloat(editWeight);
        if (isNaN(weight) || weight <= 0) {
            toast.error('Nieprawidłowa waga');
            return;
        }

        const updated = {
            ...activeProfile,
            name: editName,
            weight: weight,
            isPediatric: weight < 40,
            updatedAt: new Date(),
        };

        updateProfile(updated);
        toast.success('Profil zaktualizowany');
    };

    const handleDelete = () => {
        if (!activeProfile) return;
        if (!confirm(`Czy na pewno chcesz usunąć profil ${activeProfile.name}?`)) return;

        deleteProfile(activeProfile.id);
        toast.success('Profil usunięty');
    };

    const exportData = () => {
        const dataStr = JSON.stringify(profiles, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `kalkulator-goraczki-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Dane wyeksportowane');
    };

    const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = e.target?.result as string;
                const parsed = JSON.parse(content);
                if (Array.isArray(parsed)) {
                    setProfiles(parsed);
                    toast.success('Dane zaimportowane pomyślnie');
                } else {
                    toast.error('Nieprawidłowy format pliku');
                }
            } catch (error) {
                console.error(error);
                toast.error('Błąd podczas importu');
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="min-h-screen p-4 pb-24">
            {/* Header */}
            <div className="mb-6">
                <Link href="/">
                    <Button variant="ghost" size="sm" className="mb-4">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Powrót
                    </Button>
                </Link>
                <h1 className="text-2xl font-bold mb-2">Ustawienia i Profile</h1>
            </div>

            {/* PWA Install Prompt */}
            <InstallPrompt />

            {/* Profile Selector */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="text-base">Zarządzanie profilami</CardTitle>
                    <CardDescription>Wybierz profil do edycji (zmienia też aktywny profil).</CardDescription>
                </CardHeader>
                <CardContent className="flex gap-2 overflow-x-auto pb-4">
                    {profiles.map(profile => (
                        <Button
                            key={profile.id}
                            variant={activeProfileId === profile.id ? 'default' : 'outline'}
                            onClick={() => handleProfileSelect(profile.id)}
                            className="whitespace-nowrap"
                        >
                            <User className="h-4 w-4 mr-2" />
                            {profile.name}
                        </Button>
                    ))}
                    {profiles.length === 0 && (
                        <p className="text-sm text-slate-400">Brak profili</p>
                    )}
                </CardContent>
            </Card>

            {/* Edit Form */}
            {activeProfile && (
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Edytuj Profil</CardTitle>
                        <CardDescription>
                            {activeProfile.name} • {activeProfile.weight} kg
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Imię</label>
                            <Input
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Waga (kg)</label>
                            <Input
                                type="number"
                                value={editWeight}
                                onChange={(e) => setEditWeight(e.target.value)}
                            />
                        </div>

                        <div className="flex gap-2 pt-2">
                            <Button onClick={handleSave} className="flex-1">
                                <Save className="h-4 w-4 mr-2" />
                                Zapisz
                            </Button>
                            <Button onClick={handleDelete} variant="destructive" size="icon">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Data Management */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Dane i Kopia Zapasowa</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <Button onClick={exportData} variant="outline" className="w-full">
                        <Download className="h-4 w-4 mr-2" />
                        Eksportuj dane (Backup)
                    </Button>

                    <div className="relative">
                        <Button variant="outline" className="w-full">
                            <Upload className="h-4 w-4 mr-2" />
                            Importuj dane
                        </Button>
                        <input
                            type="file"
                            accept=".json"
                            onChange={importData}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
