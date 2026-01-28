'use client';

import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine,
    Brush
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Thermometer } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import type { HistoryItem } from '@/types';

interface TemperatureChartProps {
    history: HistoryItem[];
}

export function TemperatureChartInteractive({ history }: TemperatureChartProps) {
    // 1. Prepare raw data (sorted)
    const rawData = history
        .filter(h => h.temperature !== undefined)
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    if (rawData.length === 0) return null;

    // 2. Check if span is > 24h
    const hasMultiDay = rawData.length > 1 &&
        (new Date(rawData[rawData.length - 1]!.timestamp).getTime() - new Date(rawData[0]!.timestamp).getTime() > 86400000);

    // 3. Map to Chart Format
    const chartData = rawData.map(h => {
        const date = new Date(h.timestamp);
        return {
            timestamp: date.getTime(),
            // Smart Label: Show Date + Time if > 24h span, else just Time
            displayLabel: hasMultiDay
                ? formatDate(date, { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                : formatDate(date, { timeStyle: 'short' }),
            fullDate: formatDate(date, { dateStyle: 'short', timeStyle: 'short' }),
            temp: h.temperature,
            drug: h.drug !== 'Pomiar' ? h.drug : null,
            notes: h.notes
        };
    });

    // Calculate domain padding with more space at bottom for touch targets
    const minTemp = Math.min(...chartData.map(d => d.temp || 36));
    const maxTemp = Math.max(...chartData.map(d => d.temp || 38));

    const domainMin = Math.floor(minTemp - 0.8); // More padding at bottom
    const domainMax = Math.ceil(maxTemp + 0.5);

    return (
        <Card className="border-emerald-500/20 bg-slate-900/40 backdrop-blur-md">
            <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Thermometer className="h-5 w-5 text-emerald-500" />
                        Wykres Temperatury
                    </div>
                    <span className="text-xs font-normal text-slate-400">Ostatnie pomiary</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="h-[280px] p-0 pb-4">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={chartData}
                        margin={{
                            top: 20,
                            right: 20,
                            left: -20,
                            bottom: 5, // Added bottom margin
                        }}
                    >
                        <defs>
                            <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                                {/* Top of chart (High temp) -> Red */}
                                <stop offset="0%" stopColor="#ef4444" stopOpacity={0.8} />
                                {/* Middle (Warning) -> Orange */}
                                <stop offset="50%" stopColor="#f97316" stopOpacity={0.5} />
                                {/* Bottom (Safe) -> Green */}
                                <stop offset="100%" stopColor="#10b981" stopOpacity={0.2} />
                            </linearGradient>
                            <linearGradient id="strokeTemp" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#ef4444" stopOpacity={1} />
                                <stop offset="50%" stopColor="#f97316" stopOpacity={1} />
                                <stop offset="100%" stopColor="#10b981" stopOpacity={1} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.5} />
                        <XAxis
                            dataKey="displayLabel"
                            stroke="#94a3b8"
                            fontSize={11}
                            tickMargin={10}
                            minTickGap={30}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            domain={[domainMin, domainMax]}
                            stroke="#94a3b8"
                            fontSize={12}
                            tickCount={6}
                            tickLine={false}
                            axisLine={false}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                                borderColor: '#334155',
                                borderRadius: '8px',
                                color: '#f8fafc',
                                fontSize: '12px'
                            }}
                            labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
                            cursor={{ stroke: '#f97316', strokeWidth: 1, strokeDasharray: '4 4' }}
                            itemStyle={{ color: '#f97316' }}
                            formatter={(value: any) => [`${value}°C`, 'Temperatura']}
                            labelFormatter={(label, active) => {
                                if (active && active[0]) return active[0].payload.fullDate;
                                return label;
                            }}
                            wrapperStyle={{ outline: 'none' }}
                        />
                        <ReferenceLine y={38} stroke="#ef4444" strokeDasharray="3 3" label={{ position: 'right', value: '38°', fill: '#ef4444', fontSize: 10 }} />
                        <Brush
                            dataKey="displayLabel"
                            height={30}
                            stroke="#10b981"
                            fill="#0f172a"
                            tickFormatter={() => ''}
                        />
                        <Area
                            type="monotone"
                            dataKey="temp"
                            stroke="url(#strokeTemp)"
                            strokeWidth={4}
                            fillOpacity={1}
                            fill="url(#colorTemp)"
                            animationDuration={1500}
                            animationEasing="ease-out"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
