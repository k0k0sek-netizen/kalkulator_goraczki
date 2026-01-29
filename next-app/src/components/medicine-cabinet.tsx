'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, Calendar, Pill } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';

interface Medicine {
    id: string;
    name: string;
    openDate: string; // ISO Date string
    expiryDays: number; // e.g., 90 days
}

export function MedicineCabinet() {
    const [medicines, setMedicines] = useState<Medicine[]>([]);
    const [newName, setNewName] = useState('');
    const [expiryDays, setExpiryDays] = useState('90'); // Default 3 months
    const [showAdd, setShowAdd] = useState(false);

    // Load from LocalStorage
    useEffect(() => {
        const saved = localStorage.getItem('medicine-cabinet');
        if (saved) {
            try {
                setMedicines(JSON.parse(saved));
            } catch (e) {
                console.error('Failed to load medicines', e);
            }
        }
    }, []);

    // Save to LocalStorage
    useEffect(() => {
        localStorage.setItem('medicine-cabinet', JSON.stringify(medicines));
    }, [medicines]);

    const addMedicine = () => {
        if (!newName.trim()) return;

        const newMed: Medicine = {
            id: Date.now().toString(),
            name: newName,
            openDate: new Date().toISOString(),
            expiryDays: parseInt(expiryDays) || 90
        };

        setMedicines(prev => [...prev, newMed]);
        setNewName('');
        setShowAdd(false);
        toast.success('Dodano lek do apteczki');
    };

    const removeMedicine = (id: string) => {
        setMedicines(prev => prev.filter(m => m.id !== id));
        toast.info('Usunięto lek');
    };

    const getDaysLeft = (med: Medicine) => {
        const open = new Date(med.openDate);
        const expire = new Date(open.getTime() + med.expiryDays * 24 * 60 * 60 * 1000);
        const now = new Date();
        const diff = Math.ceil((expire.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return diff;
    };

    return (
        <Card className="border-emerald-500/20 bg-slate-900/40 backdrop-blur-md">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-base flex items-center gap-2">
                        <Pill className="h-5 w-5 text-purple-400" />
                        Cyfrowa Apteczka
                    </CardTitle>
                    <CardDescription className="text-xs">
                        Śledź daty otwarcia syropów
                    </CardDescription>
                </div>
                <Button size="sm" variant="outline" className="h-8 w-8 p-0" onClick={() => setShowAdd(!showAdd)}>
                    <Plus className={`h-4 w-4 transition-transform ${showAdd ? 'rotate-45' : ''}`} />
                </Button>
            </CardHeader>
            <CardContent>
                {showAdd && (
                    <div className="mb-4 p-3 bg-slate-800/50 rounded-lg space-y-3 animate-in slide-in-from-top-2">
                        <div>
                            <label className="text-xs text-slate-400">Nazwa leku</label>
                            <Input
                                placeholder="np. Nurofen Truskawkowy"
                                value={newName}
                                onChange={e => setNewName(e.target.value)}
                                className="h-8 bg-slate-900 border-slate-700"
                            />
                        </div>
                        <div className="flex gap-2">
                            <div className="flex-1">
                                <label className="text-xs text-slate-400">Ważność (dni)</label>
                                <Input
                                    type="number"
                                    value={expiryDays}
                                    onChange={e => setExpiryDays(e.target.value)}
                                    className="h-8 bg-slate-900 border-slate-700"
                                />
                            </div>
                            <div className="flex items-end">
                                <Button size="sm" onClick={addMedicine} className="h-8 bg-emerald-600 hover:bg-emerald-700">
                                    Zapisz
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="space-y-2">
                    {medicines.length === 0 && !showAdd && (
                        <p className="text-sm text-slate-500 text-center py-4">Pusta apteczka. Dodaj otwarte leki.</p>
                    )}

                    {medicines.map(med => {
                        const daysLeft = getDaysLeft(med);
                        const isExpired = daysLeft < 0;
                        const isWarning = daysLeft < 14;

                        return (
                            <div key={med.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-800/30 border border-slate-700/50">
                                <div className="flex flex-col gap-0.5">
                                    <span className="font-medium text-sm text-slate-200">{med.name}</span>
                                    <div className="flex items-center gap-2 text-xs text-slate-500">
                                        <Calendar className="h-3 w-3" />
                                        <span>Otwarto: {formatDate(new Date(med.openDate), { dateStyle: 'short' })}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className={`text-xs font-bold px-2 py-1 rounded ${isExpired ? 'bg-red-500/20 text-red-400' :
                                            isWarning ? 'bg-orange-500/20 text-orange-400' :
                                                'bg-emerald-500/20 text-emerald-400'
                                        }`}>
                                        {isExpired ? 'Przeterminowany!' : `${daysLeft} dni`}
                                    </div>
                                    <button onClick={() => removeMedicine(med.id)} className="text-slate-500 hover:text-red-400 transition-colors">
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
