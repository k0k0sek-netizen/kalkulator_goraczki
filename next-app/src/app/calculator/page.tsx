'use client';

import { useState, useEffect } from 'react';
import { DrugCard } from '@/components/drug-card';
import { DoseModal } from '@/components/dose-modal'; // New Modal
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Thermometer } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { isPediatric } from '@/lib/calculations';
import { DRUG_CONFIG } from '@/lib/constants';
import type { Profile, HistoryItem, DrugType, DoseUnit } from '@/types';
import { generateId } from '@/lib/utils';

export default function CalculatorPage() {
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [activeProfileId, setActiveProfileId] = useState<string | null>(null);
    const [temperature, setTemperature] = useState('');

    // Modal state
    const [editingDose, setEditingDose] = useState<{
        isOpen: boolean;
        drugName: string;
        doseMl: number;
        amountPerMl: number;
        unit: string;
        interval: number;
        initialTemp?: number;
    } | null>(null);

    const activeProfile = profiles.find(p => p.id === activeProfileId);

    // Load from localStorage
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
                console.error('Parse error', e);
            }
        }
    }, []);

    const handleInitiateMeasurement = () => {
        if (!activeProfile || !temperature) {
            toast.error('Wprowadź temperaturę');
            return;
        }

        const temp = parseFloat(temperature);
        if (isNaN(temp) || temp < 35 || temp > 43) {
            toast.error('Nieprawidłowa temperatura (35-43°C)');
            return;
        }

        // Open Modal for Measurement
        setEditingDose({
            isOpen: true,
            drugName: 'Pomiar',
            doseMl: 0,
            amountPerMl: 0,
            unit: '',
            interval: 0
        });
        // We don't clear temperature yet, we pass it to modal via editingDose state?
        // Actually DoseModal doesn't take 'initialTemperature' from 'editingDose' state directly in the current implementation in Page?
        // Wait, handleConfirmDose receives data.
        // I need to make sure DoseModal gets the temperature I just typed.
        // My DoseModal implementation takes 'initialTemperature' prop.
        // So I need to add 'initialTemperature' to 'editingDose' state or pass it separately.
        // Let's modify 'editingDose' state type to include optional initialTemp.
    };

    // Instead of saving directly, we open the modal
    const handleInitiateDose = (drugName: string, dose: { doseMl: number; doseMg: number; unit: string }) => {
        // Calculate amountPerMl to reverse engineer mg from ml for the modal logic
        // doseMg = doseMl * amountPerMl => amountPerMl = doseMg / doseMl
        // Guard against division by zero
        const amountPerMl = dose.doseMl > 0 ? dose.doseMg / dose.doseMl : 0;
        const interval = drugName === 'Paracetamol' ? 4 : 6;

        setEditingDose({
            isOpen: true,
            drugName,
            doseMl: dose.doseMl,
            amountPerMl,
            unit: dose.unit,
            interval
        });
    };

    const handleConfirmDose = (data: {
        timestamp: Date;
        doseMl: number;
        doseMg: number;
        temperature?: number;
        notes?: string;
        symptoms?: string[];
    }) => {
        if (!activeProfile || !editingDose) return;

        // Note: We use data.timestamp from modal (user might have changed time)
        // If temperature was added in modal, we incorporate it here.
        // If a global temperature input was also filled, we should probably prefer the modal one or Merge?
        // Let's rely on modal data.

        const newHistoryItem: HistoryItem = {
            id: generateId(),
            timestamp: data.timestamp,
            drug: editingDose.drugName as DrugType,
            doseMl: data.doseMl,
            doseMg: data.doseMg,
            unit: editingDose.unit as DoseUnit,
            temperature: data.temperature,
            type: 'dose', // Logic: it is a dose entry (maybe with temp)
            hoursInterval: editingDose.interval,
            notes: data.notes,
            symptoms: data.symptoms
        };

        const updatedHistory = [newHistoryItem, ...activeProfile.history].sort((a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );

        const updatedProfile = { ...activeProfile, history: updatedHistory, updatedAt: new Date() };
        const updatedProfiles = profiles.map(p => p.id === activeProfile.id ? updatedProfile : p);

        setProfiles(updatedProfiles);
        localStorage.setItem('fever-calc-profiles', JSON.stringify(updatedProfiles));

        toast.success(`Zapisano podanie: ${editingDose.drugName}`);
        setEditingDose(null);
        setTemperature(''); // Clear global temp if set
    };

    if (!activeProfile) {
        return (
            <div className="min-h-screen p-4 flex items-center justify-center">
                <Card>
                    <CardContent className="p-8 text-center">
                        <p className="text-slate-400 mb-4">Brak profili. Utwórz profil aby kontynuować.</p>
                        <Link href="/">
                            <Button>Powrót do strony głównej</Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const isPed = isPediatric(activeProfile.weight);

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
                <h1 className="text-2xl font-bold mb-2">Kalkulator Dawek</h1>
                <div className="flex items-center gap-2 text-sm text-slate-400">
                    <span className="font-medium text-emerald-400">{activeProfile.name}</span>
                    <span>•</span>
                    <span>{activeProfile.weight} kg</span>
                    <span>•</span>
                    <span className="capitalize">{isPed ? 'Pediatryczny' : 'Dorosły'}</span>
                </div>
            </div>

            {/* Temperature input with Save Button */}
            <Card className="mb-6 border-emerald-500/20 bg-slate-800/50">
                <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                        <Thermometer className="h-5 w-5 text-emerald-500" />
                        Wpisz temperaturę
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <input
                                type="number"
                                step="0.1"
                                value={temperature}
                                onChange={(e) => setTemperature(e.target.value)}
                                placeholder="np. 38.5"
                                className="w-full h-10 px-3 pr-8 rounded-md bg-slate-900 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                            <span className="absolute right-3 top-2.5 text-slate-400 text-sm">°C</span>
                        </div>
                        <Button
                            onClick={handleInitiateMeasurement}
                            disabled={!temperature}
                            variant="secondary"
                            className="whitespace-nowrap"
                        >
                            Zapisz pomiar
                        </Button>
                    </div>
                    <p className="text-xs text-slate-400 mt-2">
                        💡 Aby zapisać <strong>lek z temperaturą</strong>: kliknij "Zapisz podanie" poniżej – tam też możesz dodać temperaturę.
                    </p>
                </CardContent>
            </Card>

            {/* Drug Cards */}
            <div className="space-y-4">
                <DrugCard
                    weight={activeProfile.weight}
                    config={isPed ? DRUG_CONFIG.paracetamol.pediatric : DRUG_CONFIG.paracetamol.adult}
                    drugName="Paracetamol"
                    color="blue"
                    onDoseCalculated={(dose) => handleInitiateDose('Paracetamol', dose)}
                    history={activeProfile.history}
                />

                <DrugCard
                    weight={activeProfile.weight}
                    config={isPed ? DRUG_CONFIG.ibuprofen.pediatric : DRUG_CONFIG.ibuprofen.adult}
                    drugName="Ibuprofen"
                    color="orange"
                    onDoseCalculated={(dose) => handleInitiateDose('Ibuprofen', dose)}
                    history={activeProfile.history}
                />
            </div>

            {/* Modal */}
            {editingDose && (
                <DoseModal
                    isOpen={editingDose.isOpen}
                    onClose={() => setEditingDose(null)}
                    onConfirm={handleConfirmDose}
                    drugName={editingDose.drugName}
                    initialDoseMl={editingDose.doseMl}
                    amountPerMl={editingDose.amountPerMl}
                    unit={editingDose.unit}
                    initialTemperature={editingDose.initialTemp || (temperature ? parseFloat(temperature) : undefined)}
                />
            )}

            {/* Quick link to history */}
            <Link href="/history">
                <Button variant="outline" className="w-full mt-6">
                    Zobacz historię podań
                </Button>
            </Link>
        </div>
    );
}
