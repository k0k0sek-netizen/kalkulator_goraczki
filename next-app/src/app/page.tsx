'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Activity, Pill, Thermometer } from 'lucide-react';
import { toast } from 'sonner';
import type { Profile } from '@/types';
import { generateId } from '@/lib/utils';
import { ProfileSchema } from '@/lib/validations';
import { TemperatureChart } from '@/components/temperature-chart';
import { LiveTimer } from '@/components/timer';
import { AIInsights } from '@/components/ai-insights';
import { getLastDose, isPediatric } from '@/lib/calculations';
import { DRUG_CONFIG } from '@/lib/constants';

export default function HomePage() {
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [newProfileName, setNewProfileName] = useState('');
    const [newProfileWeight, setNewProfileWeight] = useState('');
    const [showNewProfile, setShowNewProfile] = useState(false);

    // Load profiles
    useEffect(() => {
        const saved = localStorage.getItem('fever-calc-profiles');
        if (saved) {
            try {
                setProfiles(JSON.parse(saved));
            } catch (e) {
                console.error('Json parse error', e);
            }
        }
    }, []);

    const activeProfile = profiles.length > 0 ? profiles[0] : null;

    const createProfile = () => {
        try {
            const weight = parseFloat(newProfileWeight);
            const validated = ProfileSchema.parse({
                name: newProfileName,
                weight,
                isPediatric: weight < 40,
            });

            const newProfile: Profile = {
                id: generateId(),
                name: validated.name,
                weight: validated.weight,
                isPediatric: validated.isPediatric,
                createdAt: new Date(),
                updatedAt: new Date(),
                history: [],
            };

            const updated = [...profiles, newProfile];
            setProfiles(updated);
            localStorage.setItem('fever-calc-profiles', JSON.stringify(updated));

            toast.success(`Profil "${validated.name}" utworzony!`);
            setNewProfileName('');
            setNewProfileWeight('');
            setShowNewProfile(false);
        } catch (error) {
            if (error instanceof Error) toast.error(error.message);
        }
    };

    const medicineCount = activeProfile?.history.filter(h => h.drug !== 'Pomiar').length || 0;
    const tempCount = activeProfile?.history.filter(h => h.drug === 'Pomiar' || h.temperature).length || 0;

    // Timers logic
    const isPed = activeProfile ? isPediatric(activeProfile.weight) : true;
    const lastParacetamol = activeProfile ? getLastDose(activeProfile.history, 'Paracetamol') : undefined;
    const lastIbuprofen = activeProfile ? getLastDose(activeProfile.history, 'Ibuprofen') : undefined;

    const paracetamolInterval = isPed
        ? DRUG_CONFIG.paracetamol.pediatric.dosage.hoursInterval
        : DRUG_CONFIG.paracetamol.adult.dosage.hoursInterval;

    const ibuprofenInterval = isPed
        ? DRUG_CONFIG.ibuprofen.pediatric.dosage.hoursInterval
        : DRUG_CONFIG.ibuprofen.adult.dosage.hoursInterval;

    return (
        <div className="p-4 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-emerald-400 mb-1">
                    🌡️ Kalkulator
                </h1>
                <p className="text-slate-400 text-sm">
                    Twoje centrum zarządzania gorączką
                </p>
            </div>

            {activeProfile ? (
                <>
                    {/* Active Profile Info */}
                    <div className="flex items-center justify-between text-sm text-slate-400 bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                        <span>Aktywny profil: <span className="text-emerald-400 font-medium">{activeProfile.name}</span></span>
                        <span>{activeProfile.weight} kg</span>
                    </div>

                    {/* TIMERS Section */}
                    <div className="grid grid-cols-2 gap-3">
                        <LiveTimer
                            lastDoseTime={lastParacetamol?.timestamp}
                            intervalHours={paracetamolInterval}
                            drugName="Paracetamol"
                        />
                        <LiveTimer
                            lastDoseTime={lastIbuprofen?.timestamp}
                            intervalHours={ibuprofenInterval}
                            drugName="Ibuprofen"
                        />
                    </div>

                    {/* AI Insights */}
                    <AIInsights profile={activeProfile} />

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-3">
                        <Card className="bg-slate-800 border-slate-700">
                            <CardContent className="p-3 text-center">
                                <Activity className="h-5 w-5 mx-auto mb-1 text-emerald-400" />
                                <div className="text-xl font-bold">{profiles.length}</div>
                                <div className="text-[10px] text-slate-400 uppercase">Profile</div>
                            </CardContent>
                        </Card>
                        <Card className="bg-slate-800 border-slate-700">
                            <CardContent className="p-3 text-center">
                                <Pill className="h-5 w-5 mx-auto mb-1 text-blue-400" />
                                <div className="text-xl font-bold">{medicineCount}</div>
                                <div className="text-[10px] text-slate-400 uppercase">Dawki</div>
                            </CardContent>
                        </Card>
                        <Card className="bg-slate-800 border-slate-700">
                            <CardContent className="p-3 text-center">
                                <Thermometer className="h-5 w-5 mx-auto mb-1 text-orange-400" />
                                <div className="text-xl font-bold">{tempCount}</div>
                                <div className="text-[10px] text-slate-400 uppercase">Pomiary</div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Chart */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Activity className="h-5 w-5 text-emerald-500" />
                                Przebieg temperatury
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <TemperatureChart history={activeProfile.history} />
                        </CardContent>
                    </Card>
                </>
            ) : (
                /* Empty State */
                <Card className="border-dashed border-2 border-slate-700 bg-slate-800/30">
                    <CardHeader>
                        <CardTitle>Witaj w aplikacji!</CardTitle>
                        <CardDescription>
                            Zacznij od utworzenia profilu swojego dziecka.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={() => setShowNewProfile(true)} className="w-full">
                            + Utwórz pierwszy profil
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* New Profile Modal/Form */}
            {showNewProfile && (
                <Card className="border-emerald-500/50">
                    <CardHeader>
                        <CardTitle>Nowy Profil</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label className="text-sm font-medium">Imię</label>
                            <Input
                                value={newProfileName}
                                onChange={(e) => setNewProfileName(e.target.value)}
                                placeholder="np. Jaś"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Waga (kg)</label>
                            <Input
                                type="number"
                                value={newProfileWeight}
                                onChange={(e) => setNewProfileWeight(e.target.value)}
                                placeholder="np. 12.5"
                            />
                        </div>
                        <div className="flex gap-2 pt-2">
                            <Button onClick={createProfile} className="flex-1">Utwórz</Button>
                            <Button variant="ghost" onClick={() => setShowNewProfile(false)}>Anuluj</Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
