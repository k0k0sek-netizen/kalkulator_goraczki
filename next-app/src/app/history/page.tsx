'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Trash2, Copy, Pencil } from 'lucide-react';
import { DoseModal } from '@/components/dose-modal';
import Link from 'next/link';
import { toast } from 'sonner';
import type { Profile, HistoryItem, DoseUnit } from '@/types';
import { formatDate } from '@/lib/utils';
import { generatePdfReport } from '@/lib/pdf-generator';

export default function HistoryPage() {
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [activeProfileId, setActiveProfileId] = useState<string | null>(null);
    const [editingItem, setEditingItem] = useState<HistoryItem | null>(null);

    const activeProfile = profiles.find(p => p.id === activeProfileId);

    useEffect(() => {
        const saved = localStorage.getItem('fever-calc-profiles');
        if (saved) {
            try {
                const parsed: Profile[] = JSON.parse(saved);
                setProfiles(parsed);
                if (parsed.length > 0) {
                    setActiveProfileId(parsed[0]!.id);
                }
            } catch (e) {
                console.error(e);
            }
        }
    }, []);

    const deleteHistoryItem = (itemId: string) => {
        if (!activeProfile) return;

        if (confirm('Czy na pewno chcesz usunąć ten wpis?')) {
            const updatedProfile = {
                ...activeProfile,
                history: activeProfile.history.filter(h => h.id !== itemId),
            };

            const updatedProfiles = profiles.map(p =>
                p.id === activeProfile.id ? updatedProfile : p
            );

            setProfiles(updatedProfiles);
            localStorage.setItem('fever-calc-profiles', JSON.stringify(updatedProfiles));
            toast.success('Wpis usunięty');
        }
    };

    const handleUpdateItem = (data: {
        timestamp: Date;
        doseMl: number;
        doseMg: number;
        temperature?: number;
        notes?: string;
        symptoms?: string[];
    }) => {
        if (!activeProfile || !editingItem) return;

        // Merge logic
        const updatedItem: HistoryItem = {
            ...editingItem,
            timestamp: data.timestamp,
            doseMl: data.doseMl,
            doseMg: data.doseMg,
            temperature: data.temperature,
            notes: data.notes,
            symptoms: data.symptoms,
            // Keep unit, drug, type from original or allow edit?
            // For now assume drug type is fixed, but ml could change, thus mg changes.
        };

        const updatedHistory = activeProfile.history.map(h =>
            h.id === editingItem.id ? updatedItem : h
        ).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        const updatedProfile = {
            ...activeProfile,
            history: updatedHistory,
            updatedAt: new Date()
        };

        const updatedProfiles = profiles.map(p => p.id === activeProfile.id ? updatedProfile : p);
        setProfiles(updatedProfiles);
        localStorage.setItem('fever-calc-profiles', JSON.stringify(updatedProfiles));

        toast.success('Wpis zaktualizowany');
        setEditingItem(null);
    };

    const openEditModal = (item: HistoryItem) => {
        setEditingItem(item);
    };

    const exportReport = () => {
        if (!activeProfile) return;

        const doses = activeProfile.history
            .filter(h => h.drug !== 'Pomiar')
            .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

        let report = `📋 Raport Leków - ${activeProfile.name}\n\n`;
        doses.forEach(h => {
            const date = formatDate(new Date(h.timestamp));
            report += `${date}: ${h.drug} ${h.doseMl}${h.unit} (${h.doseMg}mg)`;
            if (h.temperature) report += ` - Temp: ${h.temperature}°C`;
            report += `\n`;
        });

        navigator.clipboard.writeText(report);
        toast.success('✅ Skopiowano tekst do schowka!');
    };

    const downloadPdf = () => {
        if (!activeProfile) return;
        try {
            generatePdfReport(activeProfile);
            toast.success('✅ Raport PDF pobrany!');
        } catch (error) {
            console.error(error);
            toast.error('Błąd generowania PDF');
        }
    };

    if (!activeProfile) {
        return (
            <div className="min-h-screen p-4 flex items-center justify-center">
                <Card>
                    <CardContent className="p-8 text-center">
                        <p className="text-slate-400 mb-4">Brak profili.</p>
                        <Link href="/">
                            <Button>Powrót</Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const sortedHistory = [...activeProfile.history].sort((a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    // Helper calculate amountPerMl for modal
    const getAmountPerMl = (item: HistoryItem) => {
        // Caution: division by zero
        if (!item.doseMl || item.doseMl === 0) return 0;
        return (item.doseMg || 0) / item.doseMl;
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
                <h1 className="text-2xl font-bold mb-2">Historia Podań</h1>
                <div className="text-sm text-slate-400">
                    {activeProfile.name} • {activeProfile.weight} kg
                </div>
            </div>

            {/* Export buttons */}
            {activeProfile.history.length > 0 && (
                <div className="flex gap-2 mb-4">
                    <Button onClick={downloadPdf} variant="default" className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                        <Copy className="h-4 w-4 mr-2" />
                        Pobierz PDF
                    </Button>
                    <Button onClick={exportReport} variant="outline" className="flex-1">
                        <Copy className="h-4 w-4 mr-2" />
                        Kopiuj tekst
                    </Button>
                </div>
            )}

            {/* History list */}
            <div className="space-y-3">
                {sortedHistory.length === 0 ? (
                    <Card>
                        <CardContent className="p-8 text-center text-slate-400">
                            Brak wpisów w historii. Dodaj pierwszy pomiar lub lek w Kalkulatorze.
                        </CardContent>
                    </Card>
                ) : (
                    sortedHistory.map((item) => (
                        <Card key={item.id} className="border-l-4 border-l-emerald-500 bg-slate-800/40">
                            <CardHeader className="pb-2 p-3">
                                <CardTitle className="text-base flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className={
                                            item.drug === 'Paracetamol' ? 'text-blue-400' :
                                                item.drug === 'Ibuprofen' ? 'text-orange-400' :
                                                    'text-emerald-400'
                                        }>
                                            {item.drug}
                                        </span>
                                        <span className="text-xs text-slate-500 font-normal">
                                            {formatDate(new Date(item.timestamp), {
                                                dateStyle: 'short',
                                                timeStyle: 'short',
                                            })}
                                        </span>
                                    </div>
                                    <div className="flex gap-1">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0 text-slate-400 hover:text-emerald-400"
                                            onClick={() => openEditModal(item)}
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0 text-slate-400 hover:text-red-400"
                                            onClick={() => deleteHistoryItem(item.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="text-sm space-y-2 p-3 pt-0">
                                <div className="flex flex-wrap gap-x-4 gap-y-1">
                                    {item.doseMl !== undefined && (
                                        <div>
                                            Dawka: <span className="font-medium text-slate-200">{item.doseMl}{item.unit}</span>
                                            <span className="text-slate-500 text-xs ml-1">({item.doseMg}mg)</span>
                                        </div>
                                    )}
                                    {item.temperature && (
                                        <div>
                                            Temp: <span className="font-medium text-amber-400">{item.temperature}°C</span>
                                        </div>
                                    )}
                                </div>

                                {/* Notes & Symptoms Display */}
                                {(item.notes || (item.symptoms && item.symptoms.length > 0)) && (
                                    <div className="mt-2 text-xs bg-slate-900/50 p-2 rounded border border-slate-700/50">
                                        {item.symptoms && item.symptoms.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mb-1">
                                                {item.symptoms.map(s => (
                                                    <span key={s} className="bg-emerald-900/30 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-800/30">
                                                        {s}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                        {item.notes && (
                                            <div className="text-slate-300 italic">"{item.notes}"</div>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* Edit Modal */}
            {editingItem && (
                <DoseModal
                    isOpen={true}
                    onClose={() => setEditingItem(null)}
                    onConfirm={handleUpdateItem}
                    drugName={editingItem.drug}
                    initialDoseMl={editingItem.doseMl || 0}
                    amountPerMl={getAmountPerMl(editingItem)}
                    unit={editingItem.unit || ''}
                    initialDate={new Date(editingItem.timestamp)}
                    initialTemperature={editingItem.temperature}
                    initialNotes={editingItem.notes}
                    initialSymptoms={editingItem.symptoms}
                    title="Edytuj wpis"
                />
            )}
        </div>
    );
}
