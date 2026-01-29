'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Activity, Pill, Thermometer, Bot, Sparkles, Plus } from 'lucide-react';
import { toast } from 'sonner';
import type { Profile } from '@/types';
import { generateId } from '@/lib/utils';
import { ProfileSchema } from '@/lib/validations';
import { LiveTimer } from '@/components/timer';
import { AIInsights } from '@/components/ai-insights';
import { getLastDose, isPediatric } from '@/lib/calculations';
import { useProfile } from '@/context/profile-context';
import { DRUG_CONFIG } from '@/lib/constants';
import { TemperatureChartInteractive } from '@/components/temperature-chart-interactive';
import { motion, AnimatePresence } from 'framer-motion';
import { AiChatAssistant } from '@/components/ai-chat-assistant';
import { ChatTrigger } from '@/components/chat-trigger';

export default function Dashboard() {
    const { profiles, activeProfile, activeProfileId, setActiveProfileId, addProfile } = useProfile();
    const [isMenuOpen, setIsMenuOpen] = useState(false); // Used for dropdown toggle

    // New Profile Form State
    const [newProfileName, setNewProfileName] = useState('');
    const [newProfileWeight, setNewProfileWeight] = useState('');
    const [isAddingProfile, setIsAddingProfile] = useState(false);

    // AI Chat State
    const [isAiChatOpen, setIsAiChatOpen] = useState(false);

    const handleCreateProfile = () => {
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

            addProfile(newProfile);
            toast.success(`Profil "${validated.name}" utworzony!`);

            setNewProfileName('');
            setNewProfileWeight('');
            setIsAddingProfile(false);
            setIsMenuOpen(false);
        } catch (error) {
            if (error instanceof Error) toast.error(error.message);
        }
    };

    if (profiles.length === 0 && !isAddingProfile) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4">
                <Card className="w-full max-w-sm border-emerald-500/50 bg-slate-900/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-center text-emerald-400">Witaj!</CardTitle>
                        <CardDescription className="text-center">
                            Dodaj pierwszy profil, aby rozpocząć
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button
                            className="w-full bg-emerald-600 hover:bg-emerald-700"
                            onClick={() => setIsAddingProfile(true)}
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Utwórz profil dziecka
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

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
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-emerald-400 mb-1">
                        🌡️ Kalkulator
                    </h1>
                    <p className="text-slate-400 text-sm">
                        Twoje centrum zarządzania gorączką
                    </p>
                </div>
                {/* AI Assistant Button (Header) - Premium 2026 Trigger */}
                <ChatTrigger onClick={() => setIsAiChatOpen(true)} />
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
                                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                                >
                                    Zmień
                                </Button>
                            </div>
                        </div>

                        {/* Dropdown / Switcher Modal */}
                        <AnimatePresence>
                            {isMenuOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="absolute top-full left-0 right-0 mt-2 z-30 bg-slate-900 border border-slate-700 rounded-xl shadow-xl overflow-hidden"
                                >
                                    <div className="p-2 space-y-1">
                                        {profiles.map(profile => (
                                            <button
                                                key={profile.id}
                                                onClick={() => {
                                                    setActiveProfileId(profile.id);
                                                    setIsMenuOpen(false);
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
                                                setIsAddingProfile(true);
                                                setIsMenuOpen(false);
                                            }}
                                            className="w-full text-left px-3 py-2 rounded-lg text-sm text-emerald-400 hover:bg-emerald-500/10 flex items-center gap-2"
                                        >
                                            <span>+ Dodaj nowy profil</span>
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
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
                /* Empty State safe guard if something goes wrong ActiveProfile is missing */
                <Card className="border-dashed border-2 border-slate-700 bg-slate-800/30">
                    <CardHeader>
                        <CardTitle>Wybierz profil</CardTitle>
                        <CardDescription>
                            Nie wybrano aktywnego profilu.
                        </CardDescription>
                    </CardHeader>
                </Card>
            )}

            {/* New Profile Modal/Form */}
            {isAddingProfile && (
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
                                <Button onClick={handleCreateProfile} className="flex-1">Utwórz</Button>
                                <Button variant="ghost" onClick={() => setIsAddingProfile(false)}>Anuluj</Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* AI Chat Modal */}
            <AiChatAssistant
                isOpen={isAiChatOpen}
                onClose={() => setIsAiChatOpen(false)}
            />
        </div>
    );
}
