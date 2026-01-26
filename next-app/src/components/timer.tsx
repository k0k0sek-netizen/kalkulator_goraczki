'use client';

import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';

interface LiveTimerProps {
    lastDoseTime?: Date;
    intervalHours: number;
    drugName: string;
    compact?: boolean;
}

export function LiveTimer({ lastDoseTime, intervalHours, drugName, compact = false }: LiveTimerProps) {
    const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number } | null>(null);
    const [canGive, setCanGive] = useState(true);

    useEffect(() => {
        if (!lastDoseTime) {
            setCanGive(true);
            return;
        }

        const intervalId = setInterval(() => {
            const now = new Date().getTime();
            const last = new Date(lastDoseTime).getTime();
            const nextDose = last + intervalHours * 60 * 60 * 1000;
            const diff = nextDose - now;

            if (diff <= 0) {
                setCanGive(true);
                setTimeLeft(null);
                clearInterval(intervalId);
            } else {
                setCanGive(false);
                const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((diff % (1000 * 60)) / 1000);
                setTimeLeft({ hours, minutes, seconds });
            }
        }, 1000);

        return () => clearInterval(intervalId);
    }, [lastDoseTime, intervalHours]);

    const isParacetamol = drugName.toLowerCase().includes('paracetamol');
    const colorClass = isParacetamol ? 'text-blue-400' : 'text-orange-400';
    const borderClass = isParacetamol ? 'border-blue-900' : 'border-orange-900';
    const bgClass = isParacetamol ? 'bg-blue-950/30' : 'bg-orange-950/30';

    // 1. Never given
    if (!lastDoseTime) {
        if (compact) return null;
        return (
            <Card className={cn("border-l-4 border-emerald-600/30 bg-slate-800/50")}>
                <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                        <span className={cn("font-medium", colorClass)}>{drugName}</span>
                        <span className="text-emerald-400 text-sm font-medium">Możesz podać</span>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // 2. Can give now
    if (canGive) {
        return (
            <Card className={cn("border-l-4 border-emerald-600 bg-emerald-950/20", compact && "border-none bg-transparent shadow-none p-0")}>
                <CardContent className={cn("p-3", compact && "p-0")}>
                    <div className="flex items-center justify-between">
                        <span className={cn("font-medium", colorClass)}>{drugName}</span>
                        <div className="flex items-center gap-2 text-emerald-400">
                            <Clock className="h-4 w-4" />
                            <span className="text-sm font-bold">TERAZ</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // 3. Counting down
    return (
        <Card className={cn("border-l-4", borderClass, bgClass, compact && "border-none bg-transparent shadow-none p-0")}>
            <CardContent className={cn("p-3", compact && "p-0")}>
                <div className="flex items-center justify-between">
                    <span className={cn("font-medium", colorClass)}>{drugName}</span>
                    <div className="text-right">
                        <div className="text-xs text-slate-400">kolejna dawka za:</div>
                        <div className="text-lg font-mono font-bold leading-none">
                            {timeLeft ? (
                                <>
                                    {timeLeft.hours > 0 && <span>{timeLeft.hours}h </span>}
                                    {timeLeft.minutes}m {timeLeft.seconds}s
                                </>
                            ) : (
                                '...'
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
