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
import { LiveTimer } from '@/components/timer';
import { AIInsights } from '@/components/ai-insights';
import { getLastDose, isPediatric } from '@/lib/calculations';
import { DRUG_CONFIG } from '@/lib/constants';
import { TemperatureChartInteractive } from '@/components/temperature-chart-interactive';
import { motion, AnimatePresence } from 'framer-motion';
import { AiChatAssistant } from '@/components/ai-chat-assistant';
import { Bot, Sparkles } from 'lucide-react';

export default function HomePage() {
    const [activeProfileId, setActiveProfileId] = useState<string | null>(null);
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [newProfileName, setNewProfileName] = useState('');
    const [newProfileWeight, setNewProfileWeight] = useState('');
    const [showNewProfile, setShowNewProfile] = useState(false);
    const [showProfileSwitcher, setShowProfileSwitcher] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);

    // Load profiles
    useEffect(() => {
        const saved = localStorage.getItem('fever-calc-profiles');
        if (saved) {
            try {
                const parsed: Profile[] = JSON.parse(saved);
                setProfiles(parsed);
                if (parsed.length > 0) {
                    // Try to restore last active profile or default to first
                    const lastActive = localStorage.getItem('fever-calc-active-id');
                    if (lastActive && parsed.find(p => p.id === lastActive)) {
                        setActiveProfileId(lastActive);
                    } else if (parsed[0]) {
                        setActiveProfileId(parsed[0].id);
                    }
                }
            } catch (e) {
                console.error('Json parse error', e);
            }
        }
    }, []);

    // Update active profile persistence
    useEffect(() => {
        if (activeProfileId) {
            localStorage.setItem('fever-calc-active-id', activeProfileId);
        }
    }, [activeProfileId]);

    const activeProfile = profiles.find(p => p.id === activeProfileId) || null;

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
            setActiveProfileId(newProfile.id);
            localStorage.setItem('fever-calc-profiles', JSON.stringify(updated));

            toast.success(`Profil "${validated.name}" utworzony!`);
            setNewProfileName('');
            setNewProfileWeight('');
            setShowNewProfile(false);
            setShowProfileSwitcher(false);
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
                    {/* Active Profile Info & Switcher */}
                    <div className="relative">
                        <div className="flex items-center justify-between text-sm text-slate-400 bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                            <div className="flex flex-col">
                                <span className="text-xs text-slate-500">Aktywny profil</span>
                                <span className="text-emerald-400 font-medium text-lg">{activeProfile.name}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="bg-slate-900 px-2 py-1 rounded text-xs border border-slate-700">{activeProfile.weight} kg</span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 text-xs border-emerald-500/30 hover:border-emerald-500/50 hover:bg-emerald-500/10"
                                    onClick={() => setShowProfileSwitcher(!showProfileSwitcher)}
                                >
                                    Zmień
                                </Button>
                            </div>
                        </div>

                        {/* Dropdown / Switcher Modal */}
                        {showProfileSwitcher && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="absolute top-full left-0 right-0 mt-2 z-30 bg-slate-900 border border-slate-700 rounded-xl shadow-xl overflow-hidden"
                            >
                                <div className="p-2 space-y-1">
                                    {profiles.map(profile => (
                                        <button
                                            key={profile.id}
                                            onClick={() => {
                                                setActiveProfileId(profile.id);
                                                setShowProfileSwitcher(false);
                                            }}
                                            className={`w-full text-left px-3 py-2 rounded-lg text-sm flex justify-between items-center transition-colors ${activeProfileId === profile.id
                                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20'
                                                : 'hover:bg-slate-800 text-slate-300'
                                                }`}
                                        >
                                            <span>{profile.name}</span>
                                            <span className="text-xs text-slate-500">{profile.weight} kg</span>
                                        </button>
                                    ))}
                                    <div className="h-px bg-slate-800 my-1" />
                                    <button
                                        onClick={() => {
                                            setShowNewProfile(true);
                                            setShowProfileSwitcher(false);
                                        }}
                                        className="w-full text-left px-3 py-2 rounded-lg text-sm text-emerald-400 hover:bg-emerald-500/10 flex items-center gap-2"
                                    >
                                        <span>+ Dodaj nowy profil</span>
                                    </button>
                                </div>
                            </motion.div>
                        )}
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
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                        <AIInsights profile={activeProfile} />
                    </motion.div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-3">
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Card className="bg-slate-800 border-slate-700">
                                <CardContent className="p-3 text-center">
                                    <Activity className="h-5 w-5 mx-auto mb-1 text-emerald-400" />
                                    <div className="text-xl font-bold">{profiles.length}</div>
                                    <div className="text-[10px] text-slate-400 uppercase">Profile</div>
                                </CardContent>
                            </Card>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Card className="bg-slate-800 border-slate-700">
                                <CardContent className="p-3 text-center">
                                    <Pill className="h-5 w-5 mx-auto mb-1 text-blue-400" />
                                    <div className="text-xl font-bold">{medicineCount}</div>
                                    <div className="text-[10px] text-slate-400 uppercase">Dawki</div>
                                </CardContent>
                            </Card>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Card className="bg-slate-800 border-slate-700">
                                <CardContent className="p-3 text-center">
                                    <Thermometer className="h-5 w-5 mx-auto mb-1 text-orange-400" />
                                    <div className="text-xl font-bold">{tempCount}</div>
                                    <div className="text-[10px] text-slate-400 uppercase">Pomiary</div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>

                    {/* Chart */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        <TemperatureChartInteractive history={activeProfile.history} />
                    </motion.div>
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
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <Card className="border-emerald-500/50 w-full max-w-sm relative">
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
                </div>
            )}

            {/* AI Floating Button */}
            <motion.div
                className="fixed bottom-20 right-4 z-40"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
            >
                <Button
                    size="icon"
                    className="h-14 w-14 rounded-full bg-emerald-500 hover:bg-emerald-600 shadow-[0_0_20px_rgba(16,185,129,0.5)] border-2 border-emerald-400"
                    onClick={() => setIsChatOpen(true)}
                >
                    <Bot className="h-8 w-8 text-white" />
                </Button>
            </motion.div>

            {/* AI Chat Modal */}
            <AiChatAssistant
                isOpen={isChatOpen}
                onClose={() => setIsChatOpen(false)}
                activeProfile={activeProfile || undefined}
            />
        </div>
    );
}
