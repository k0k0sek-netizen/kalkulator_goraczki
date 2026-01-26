'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pill, AlertCircle } from 'lucide-react';
import type { DrugCategoryConfig, Concentration, HistoryItem } from '@/types';
import { calculateDose } from '@/lib/calculations';
import { cn } from '@/lib/utils';

interface DrugCardProps {
    weight: number;
    config: DrugCategoryConfig;
    drugName: string;
    color: 'blue' | 'orange';
    onDoseCalculated?: (dose: { doseMl: number; doseMg: number; unit: string }) => void;
    history?: HistoryItem[];
}

export function DrugCard({ weight, config, drugName, color, onDoseCalculated, history = [] }: DrugCardProps) {
    const [selectedConcentration, setSelectedConcentration] = useState<Concentration>(
        config.concentrations[0]!
    );

    const dose = useMemo(
        () => calculateDose(weight, config, selectedConcentration),
        [weight, config, selectedConcentration]
    );

    const colorClasses = {
        blue: {
            bg: 'bg-blue-950 border-blue-800',
            text: 'text-blue-400',
            button: 'bg-blue-600 hover:bg-blue-700',
        },
        orange: {
            bg: 'bg-orange-950 border-orange-800',
            text: 'text-orange-400',
            button: 'bg-orange-600 hover:bg-orange-700',
        },
    };

    const classes = colorClasses[color];

    // Calculate daily usage
    const usedMg24h = useMemo(() => {
        const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
        return history
            .filter(h =>
                h.drug === drugName &&
                new Date(h.timestamp).getTime() > oneDayAgo
            )
            .reduce((acc, curr) => acc + (curr.doseMg || 0), 0);
    }, [history, drugName]);

    const dailyMaxMg = weight * 90; // Approx max if not provided (safe fallback)
    // Actually better to use dose.dailyLimit which is calculated correctly based on logic
    const limit = dose.dailyLimit;
    const percentUsed = Math.min(100, (usedMg24h / limit) * 100);
    const isLimitNear = percentUsed > 75;

    const handleConfirm = () => {
        if (onDoseCalculated) {
            const avgDose = (dose.volumeMin + dose.volumeMax) / 2;
            const avgDoseMg = (dose.doseMin + dose.doseMax) / 2;

            onDoseCalculated({
                doseMl: Number(avgDose.toFixed(1)),
                doseMg: Math.round(avgDoseMg),
                unit: selectedConcentration.form === 'syrop' || selectedConcentration.form === 'krople' ? 'ml' :
                    selectedConcentration.form === 'czopek' ? 'czopek' : 'szt.',
            });
        }
    };

    return (
        <Card className={cn(classes.bg)}>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Pill className={cn('h-5 w-5', classes.text)} />
                    {drugName}
                </CardTitle>
                <CardDescription className="text-slate-300">
                    {config.label}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* 24h Limit Progress */}
                <div className="mb-2">
                    <div className="flex justify-between text-[10px] uppercase font-bold text-slate-400 mb-1">
                        <span>Limit dobowy (24h)</span>
                        <span className={cn(isLimitNear && 'text-red-400')}>
                            {Math.round(usedMg24h)} / {Math.round(limit)} mg
                        </span>
                    </div>
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                        <div
                            className={cn(
                                "h-full rounded-full transition-all duration-500",
                                isLimitNear ? "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" : "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                            )}
                            style={{ width: `${percentUsed}%` }}
                        ></div>
                    </div>
                    {isLimitNear && (
                        <div className="text-[10px] text-red-400 mt-1 font-bold flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" /> Zbliżasz się do limitu!
                        </div>
                    )}
                </div>

                {/* Concentration selector */}
                <div>
                    <label className="block text-sm font-medium mb-2">Wybierz stężenie:</label>
                    <select
                        value={config.concentrations.indexOf(selectedConcentration)}
                        onChange={(e) => setSelectedConcentration(config.concentrations[Number(e.target.value)]!)}
                        className="w-full px-3 py-2 rounded-md bg-slate-800 border border-slate-700 text-sm"
                    >
                        {config.concentrations.map((c, idx) => (
                            <option key={idx} value={idx}>
                                {c.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Dose calculation result */}
                <div className={cn('p-4 rounded-lg border-2', `border-${color}-600`)}>
                    <div className="text-center">
                        <div className="text-sm text-slate-400 mb-1">Zalecana dawka</div>
                        <div className={cn('text-3xl font-bold', classes.text)}>
                            {dose.volumeMin} - {dose.volumeMax}{' '}
                            {selectedConcentration.form === 'tabletka' ? 'szt.' : 'ml'}
                        </div>
                        <div className="text-xs text-slate-400 mt-1">
                            ({dose.doseMin}-{dose.doseMax}mg)
                        </div>
                    </div>
                </div>

                {/* Info */}
                <div className="text-xs text-slate-400 space-y-1">
                    <div className="flex items-center gap-2">
                        <AlertCircle className="h-3 w-3" />
                        <span>Interwał: co {dose.interval}h</span>
                    </div>
                    <div>Max dobowy: {dose.dailyLimit}mg{dose.isPediatric ? '/kg' : ''}</div>
                </div>

                {/* Action button */}
                <Button onClick={handleConfirm} className={cn('w-full', classes.button)}>
                    Zapisz podanie
                </Button>
            </CardContent>
        </Card>
    );
}
