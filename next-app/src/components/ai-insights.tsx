'use client';

import { Lightbulb, TrendingUp, TrendingDown, ShieldAlert, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { type Insight, analyzeProfile } from '@/lib/analysis';
import type { Profile } from '@/types';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

interface AIInsightsProps {
    profile: Profile;
}

export function AIInsights({ profile }: AIInsightsProps) {
    const [insights, setInsights] = useState<Insight[]>([]);

    useEffect(() => {
        setInsights(analyzeProfile(profile));
    }, [profile]);

    if (insights.length === 0) return null;

    return (
        <Card className="border-purple-500/30 bg-purple-950/10 mb-6">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2 text-purple-300">
                    <Lightbulb className="h-5 w-5 text-purple-400" />
                    AI Insights
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {insights.map((insight) => (
                    <div
                        key={insight.id}
                        className={cn(
                            "flex gap-3 p-3 rounded-md border",
                            insight.type === 'warning' && "bg-red-950/20 border-red-900/50 text-red-100",
                            insight.type === 'info' && "bg-blue-950/20 border-blue-900/50 text-blue-100",
                            insight.type === 'success' && "bg-emerald-950/20 border-emerald-900/50 text-emerald-100",
                            insight.type === 'trend' && "bg-amber-950/20 border-amber-900/50 text-amber-100",
                        )}
                    >
                        <div className="mt-0.5">
                            {insight.type === 'warning' && <ShieldAlert className="h-5 w-5 text-red-400" />}
                            {insight.type === 'info' && <Info className="h-5 w-5 text-blue-400" />}
                            {insight.type === 'success' && <TrendingDown className="h-5 w-5 text-emerald-400" />}
                            {insight.type === 'trend' && <TrendingUp className="h-5 w-5 text-amber-400" />}
                        </div>
                        <div>
                            <div className="font-semibold text-sm">{insight.title}</div>
                            <div className="text-xs opacity-90">{insight.description}</div>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
