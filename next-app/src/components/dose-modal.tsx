'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ModalPortal } from '@/components/ui/modal-portal';

interface DoseModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (data: {
        timestamp: Date;
        doseMl: number;
        doseMg: number;
        temperature?: number;
        notes?: string;
        symptoms?: string[];
    }) => void;
    drugName: string;
    initialDoseMl: number;
    amountPerMl: number; // mg per unit (ml or tablet)
    unit: string;
    // Edit Mode Props
    initialDate?: Date;
    initialTemperature?: number;
    initialNotes?: string;
    initialSymptoms?: string[];
    title?: string;
}

const COMMON_SYMPTOMS = ['Ból głowy', 'Ból gardła', 'Kaszel', 'Katar', 'Wymioty', 'Biegunka', 'Dreszcze'];

export function DoseModal({
    isOpen,
    onClose,
    onConfirm,
    drugName,
    initialDoseMl,
    amountPerMl,
    unit,
    initialDate,
    initialTemperature,
    initialNotes,
    initialSymptoms,
    title
}: DoseModalProps) {
    // Helpers
    const formatDateTimeLocal = (date: Date) => {
        const pad = (n: number) => n.toString().padStart(2, '0');
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
    };

    const [dateStr, setDateStr] = useState(() => formatDateTimeLocal(initialDate || new Date()));
    const [doseMl, setDoseMl] = useState(initialDoseMl.toString());
    const [temperature, setTemperature] = useState(initialTemperature?.toString() || '');
    const [notes, setNotes] = useState(initialNotes || '');
    const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>(initialSymptoms || []);

    // Reset state when opening with different props
    useEffect(() => {
        if (isOpen) {
            setDateStr(formatDateTimeLocal(initialDate || new Date()));
            setDoseMl(initialDoseMl.toString());
            setTemperature(initialTemperature?.toString() || '');
            setNotes(initialNotes || '');
            setSelectedSymptoms(initialSymptoms || []);
        }
    }, [isOpen, initialDate, initialDoseMl, initialTemperature, initialNotes, initialSymptoms]);


    const toggleSymptom = (s: string) => {
        if (selectedSymptoms.includes(s)) {
            setSelectedSymptoms(prev => prev.filter(x => x !== s));
        } else {
            setSelectedSymptoms(prev => [...prev, s]);
        }
    };

    const handleSave = () => {
        const ml = parseFloat(doseMl);
        // Allow 0 dose only if it's "Pomiar" (measurement only)
        if (drugName !== 'Pomiar' && (isNaN(ml) || ml <= 0)) return;

        const mg = ml * amountPerMl;
        const temp = temperature ? parseFloat(temperature) : undefined;
        const timestamp = new Date(dateStr);

        onConfirm({
            timestamp,
            doseMl: ml,
            doseMg: Math.round(mg),
            temperature: temp,
            notes: notes.trim() || undefined,
            symptoms: selectedSymptoms.length > 0 ? selectedSymptoms : undefined,
        });
        onClose();
    };

    if (!isOpen) return null;

    const isMeasurement = drugName === 'Pomiar';

    return (
        <ModalPortal>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
                <div className="bg-slate-900 border border-slate-700 text-slate-100 rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">

                    {/* Header */}
                    <div className="p-4 border-b border-slate-800 bg-slate-900/50">
                        <h2 className="text-lg font-bold flex items-center gap-2">
                            <Clock className="h-5 w-5 text-emerald-500" />
                            {title || `Zapisz podanie: ${drugName}`}
                        </h2>
                        <p className="text-xs text-slate-400 mt-1">
                            {isMeasurement ? 'Szczegóły pomiaru' : 'Dostosuj szczegóły podania leku'}
                        </p>
                    </div>

                    {/* Body */}
                    <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">

                        {/* Time */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Data i godzina</label>
                            <input
                                type="datetime-local"
                                value={dateStr}
                                onChange={(e) => setDateStr(e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 rounded-md p-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                            />
                        </div>

                        {/* Dose & Temp Row */}
                        <div className="grid grid-cols-2 gap-4">
                            {!isMeasurement && (
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300">Dawka ({unit})</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={doseMl}
                                        onChange={(e) => setDoseMl(e.target.value)}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-md p-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none font-mono"
                                    />
                                    <p className="text-[10px] text-slate-500">
                                        ≈ {(parseFloat(doseMl || '0') * amountPerMl).toFixed(0)} mg
                                    </p>
                                </div>
                            )}

                            <div className={cn("space-y-2", isMeasurement ? "col-span-2" : "")}>
                                <label className="text-sm font-medium text-slate-300">Temp. (°C)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    placeholder="opcjonalnie"
                                    value={temperature}
                                    onChange={(e) => setTemperature(e.target.value)}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-md p-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                                />
                            </div>
                        </div>

                        {/* Symptoms */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Objawy (opcjonalnie)</label>
                            <div className="flex flex-wrap gap-2">
                                {COMMON_SYMPTOMS.map(s => (
                                    <button
                                        key={s}
                                        onClick={() => toggleSymptom(s)}
                                        className={cn(
                                            "text-xs px-2 py-1 rounded-full border transition-colors",
                                            selectedSymptoms.includes(s)
                                                ? "bg-emerald-600 border-emerald-500 text-white"
                                                : "bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600"
                                        )}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Notes */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Notatki</label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="np. wypluł połowę, marudzi..."
                                rows={2}
                                className="w-full bg-slate-800 border border-slate-700 rounded-md p-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                            />
                        </div>

                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t border-slate-800 bg-slate-900/50 flex gap-3 justify-end">
                        <Button variant="ghost" onClick={onClose} className="hover:bg-slate-800">
                            Anuluj
                        </Button>
                        <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                            Zapisz
                        </Button>
                    </div>
                </div>
            </div>
        </ModalPortal>
    );
}
