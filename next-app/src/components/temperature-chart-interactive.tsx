'use client';

import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Thermometer } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import type { HistoryItem } from '@/types';

interface TemperatureChartProps {
    history: HistoryItem[];
}

export function TemperatureChartInteractive({ history }: TemperatureChartProps) {
    // Filter only items with temperature and sort chronologically for chart
    const data = history
        .filter(h => h.temperature !== undefined)
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
        .map(h => ({
            date: new Date(h.timestamp),
            time: formatDate(new Date(h.timestamp), { timeStyle: 'short' }),
            fullDate: formatDate(new Date(h.timestamp), { dateStyle: 'short', timeStyle: 'short' }),
            temp: h.temperature,
            drug: h.drug !== 'Pomiar' ? h.drug : null,
            notes: h.notes
        }))
        .slice(-10); // Show last 10 points

    if (data.length === 0) return null;

    // Calculate domain padding
    const minTemp = Math.min(...data.map(d => d.temp || 36));
    const maxTemp = Math.max(...data.map(d => d.temp || 38));

    const domainMin = Math.floor(minTemp - 0.5);
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
            <CardContent className="h-[250px] p-0 pb-4">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={data}
                        margin={{
                            top: 20,
                            right: 20,
                            left: -20,
                            bottom: 0,
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
                            dataKey="time"
                            stroke="#94a3b8"
                            fontSize={12}
                            tickMargin={10}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            domain={['auto', 'auto']} // Let it auto-scale to emphasize the gradient
                            stroke="#94a3b8"
                            fontSize={12}
                            tickCount={5}
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
