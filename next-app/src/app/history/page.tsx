'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Trash2, Copy, Pencil, Archive, History as HistoryIcon, ChevronDown, ChevronUp } from 'lucide-react';
import { DoseModal } from '@/components/dose-modal';
import Link from 'next/link';
import { toast } from 'sonner';
import type { Profile, HistoryItem, DoseUnit, PastEpisode } from '@/types';
import { formatDate, generateId } from '@/lib/utils';
import { generatePdfReport } from '@/lib/pdf-generator';
import { motion, AnimatePresence } from 'framer-motion';
import QRCode from "react-qr-code";
import { Scanner } from '@yudiel/react-qr-scanner'; // Import scanner

export default function HistoryPage() {
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [activeProfileId, setActiveProfileId] = useState<string | null>(null);
    const [editingItem, setEditingItem] = useState<HistoryItem | null>(null);
    const [showQr, setShowQr] = useState(false);
    const [showScanner, setShowScanner] = useState(false);
    const [showArchives, setShowArchives] = useState(false); // Toggle for archives view

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

        const updatedItem: HistoryItem = {
            ...editingItem,
            timestamp: data.timestamp,
            doseMl: data.doseMl,
            doseMg: data.doseMg,
            temperature: data.temperature,
            notes: data.notes,
            symptoms: data.symptoms,
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

    // Helper calculate amountPerMl for modal
    const getAmountPerMl = (item: HistoryItem) => {
        if (!item.doseMl || item.doseMl === 0) return 0;
        return (item.doseMg || 0) / item.doseMl;
    };

    // Generate QR Content (JSON for import)
    const getQrContent = () => {
        if (!activeProfile) return '';
        // Export last 20 items to keep QR small enough but useful
        const exportData = {
            v: 1, // version
            n: activeProfile.name,
            w: activeProfile.weight,
            h: activeProfile.history.slice(0, 20)
        };
        return JSON.stringify(exportData);
    };

    const handleScan = (text: string) => {
        if (!text || !activeProfile) return;

        try {
            const data = JSON.parse(text);
            if (!data.v || !data.h) {
                toast.error('Nieprawidłowy kod QR aplikacji');
                return;
            }

            if (confirm(`Wykryto historię pacjenta: ${data.n || 'Nieznany'}. Czy zaimportować ${data.h.length} wpisów?`)) {
                // Merge histories avoiding duplicates by ID
                const currentIds = new Set(activeProfile.history.map(h => h.id));
                const newItems = (data.h as HistoryItem[]).filter(h => !currentIds.has(h.id));

                if (newItems.length === 0) {
                    toast.info('Wszystkie wpisy już istnieją');
                    setShowScanner(false);
                    return;
                }

                const updatedHistory = [...newItems, ...activeProfile.history].sort((a, b) =>
                    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
                );

                const updatedProfile = { ...activeProfile, history: updatedHistory };
                const updatedProfiles = profiles.map(p => p.id === activeProfile.id ? updatedProfile : p);

                setProfiles(updatedProfiles);
                localStorage.setItem('fever-calc-profiles', JSON.stringify(updatedProfiles));
                toast.success(`Zaimportowano ${newItems.length} nowych wpisów`);
                setShowScanner(false);
            }
        } catch (e) {
            console.error(e);
            toast.error('Błąd odczytu kodu QR');
        }
    };

    // Archive current illness
    const archiveHistory = () => {
        if (!activeProfile || activeProfile.history.length === 0) return;

        if (!confirm('Czy na pewno chcesz zakończyć chorobę? Obecna historia zostanie zarchiwizowana, a liczniki wyzerowane.')) return;

        const sortedHistory = [...activeProfile.history].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        const startDate = new Date(sortedHistory[0]!.timestamp);
        const endDate = new Date(sortedHistory[sortedHistory.length - 1]!.timestamp);

        const episode: PastEpisode = {
            id: generateId(),
            startDate,
            endDate,
            history: activeProfile.history,
            summary: `Epizod ${formatDate(startDate, { dateStyle: 'short' })} - ${formatDate(endDate, { dateStyle: 'short' })}`
        };

        const updatedProfile: Profile = {
            ...activeProfile,
            history: [],
            archivedEpisodes: [...(activeProfile.archivedEpisodes || []), episode]
        };

        const updatedProfiles = profiles.map(p => p.id === activeProfile.id ? updatedProfile : p);
        setProfiles(updatedProfiles);
        localStorage.setItem('fever-calc-profiles', JSON.stringify(updatedProfiles));

        toast.success('Choroba zakończona i zarchiwizowana');
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

    const archives = activeProfile.archivedEpisodes || [];

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
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-bold mb-2">Historia Podań</h1>
                        <div className="text-sm text-slate-400">
                            {activeProfile.name} • {activeProfile.weight} kg
                        </div>
                    </div>
                    {/* Archive Button */}
                    {activeProfile.history.length > 0 && (
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={archiveHistory}
                            className="bg-red-500/10 text-red-400 hover:bg-red-500/20 border-red-500/20"
                        >
                            <Archive className="h-4 w-4 mr-2" />
                            Koniec Choroby
                        </Button>
                    )}
                </div>
            </div>

            {/* View Switching Tabs */}
            <div className="flex gap-2 mb-6">
                <Button
                    variant={!showArchives ? "secondary" : "ghost"}
                    className="flex-1"
                    onClick={() => setShowArchives(false)}
                >
                    Bieżąca
                </Button>
                <Button
                    variant={showArchives ? "secondary" : "ghost"}
                    className="flex-1"
                    onClick={() => setShowArchives(true)}
                >
                    <HistoryIcon className="h-4 w-4 mr-2" />
                    Archiwum ({archives.length})
                </Button>
            </div>

            {showArchives ? (
                /* ARCHIVES VIEW */
                <div className="space-y-4">
                    {archives.length === 0 ? (
                        <div className="text-center text-slate-500 py-8">Brak archiwalnych chorób.</div>
                    ) : (
                        archives.map(episode => (
                            <Card key={episode.id} className="bg-slate-900/50 border-slate-800">
                                <CardHeader className="p-4 pb-2">
                                    <CardTitle className="text-sm text-slate-300 flex justify-between">
                                        <span>{formatDate(new Date(episode.startDate), { dateStyle: 'medium' })}</span>
                                        <span className="text-slate-500 text-xs">
                                            {episode.history.length} wpisów
                                        </span>
                                    </CardTitle>
                                    <div className="text-xs text-slate-500">
                                        do {formatDate(new Date(episode.endDate), { dateStyle: 'medium' })}
                                    </div>
                                </CardHeader>
                                <CardContent className="p-4 pt-2">
                                    {/* Collapsed view mainly, maybe expand button later */}
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" className="w-full text-xs h-8" onClick={() => {
                                            // Ideally open modal with details, for now just copying summary
                                            const text = episode.history.map(h => `${formatDate(new Date(h.timestamp))}: ${h.drug} ${h.doseMg}mg`).join('\n');
                                            navigator.clipboard.writeText(text);
                                            toast.success('Skopiowano historię epizodu');
                                        }}>
                                            <Copy className="h-3 w-3 mr-2" />
                                            Kopiuj Historię
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            ) : (
                /* CURRENT HISTORY VIEW */
                <>
                    {/* Export buttons */}
                    {activeProfile.history.length > 0 && (
                        <div className="flex gap-2 mb-4">
                            <Button onClick={downloadPdf} variant="default" className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                                <Copy className="h-4 w-4 mr-2" />
                                PDF
                            </Button>
                            <Button onClick={() => setShowQr(true)} variant="outline" className="flex-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-xl">📤</span>
                                    QR
                                </div>
                            </Button>
                            <Button onClick={() => setShowScanner(true)} variant="outline" className="flex-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-xl">📷</span>
                                    Skanuj
                                </div>
                            </Button>
                            <Button onClick={exportReport} variant="outline" className="flex-1">
                                <Copy className="h-4 w-4 mr-2" />
                                Kopiuj
                            </Button>
                        </div>
                    )}

                    {/* QR Modal (Simple Overlay) */}
                    {showQr && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setShowQr(false)}>
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="bg-white p-6 rounded-xl shadow-2xl max-w-sm w-full text-center"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <h3 className="text-slate-900 font-bold text-lg mb-4">Zeskanuj pomiary</h3>
                                <div className="bg-white p-2 inline-block">
                                    <QRCode value={getQrContent()} size={200} />
                                </div>
                                <p className="text-slate-500 text-xs mt-4">
                                    Pokaż ten kod lekarzowi lub zeskanuj drugim telefonem.
                                </p>
                                <Button onClick={() => setShowQr(false)} className="mt-4 w-full" variant="secondary">
                                    Zamknij
                                </Button>
                            </motion.div>
                        </div>
                    )}

                    {/* History list */}
                    <div className="space-y-3">
                        {sortedHistory.length === 0 ? (
                            <Card>
                                <CardContent className="p-8 text-center text-slate-400">
                                    <p className="mb-4">Brak wpisów w historii. Dodaj pierwszy pomiar lub lek w Kalkulatorze.</p>
                                    <div className="flex gap-2 justify-center">
                                        <Button variant="outline" onClick={() => setShowScanner(true)}>
                                            📷 Skanuj QR
                                        </Button>
                                        <Button variant="outline" onClick={() => setShowQr(true)}>
                                            📤 Generuj QR
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            <AnimatePresence mode='popLayout'>
                                {sortedHistory.map((item) => (
                                    <motion.div
                                        key={item.id}
                                        layout
                                        initial={{ opacity: 0, x: -20, scale: 0.95 }}
                                        animate={{ opacity: 1, x: 0, scale: 1 }}
                                        exit={{ opacity: 0, x: -100, height: 0, marginBottom: 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <Card className="border-l-4 border-l-emerald-500 bg-slate-800/40 hover:bg-slate-800/60 transition-colors">
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
                                                            Temp: <span className="font-medium text-amber-400 text-base">{item.temperature}°C</span>
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
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        )}
                    </div>
                </>
            )}

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
