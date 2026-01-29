'use client';

import {
    ComposedChart,
    Area,
    Line,
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
    // 1. Prepare raw data (sorted)
    const rawData = history
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    if (rawData.length === 0) return null; // Or return a "No data" placeholder

    // Calculate Min/Max Temp for Domain
    const temps = rawData.filter(h => h.type === 'temp').map(h => h.temperature || 36);
    const minTemp = temps.length ? Math.min(...temps) : 36;
    const maxTemp = temps.length ? Math.max(...temps) : 38;

    const domainMin = Math.floor(minTemp - 0.5);
    const domainMax = Math.ceil(maxTemp + 0.5);

    // 2. Map to Chart Format (Numeric Timestamp for X)
    const chartData = rawData.map(h => {
        const date = new Date(h.timestamp);
        return {
            timestamp: date.getTime(), // Numeric X axis key
            fullDate: formatDate(date, { dateStyle: 'short', timeStyle: 'short' }),
            displayTime: formatDate(date, { timeStyle: 'short' }),
            temp: h.type === 'temp' ? h.temperature : null,
            doseY: h.type === 'dose' ? domainMin + 0.2 : null, // Position dots at bottom of graph
            type: h.type,
            drug: h.drug !== 'Pomiar' ? h.drug : null,
            dose: h.doseMl ? `${h.doseMl}ml` : (h.doseMg ? `${h.doseMg}mg` : ''),
            notes: h.notes
        };
    });

    return (
        <Card className="border-emerald-500/20 bg-slate-900/40 backdrop-blur-md">
            <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Thermometer className="h-5 w-5 text-emerald-500" />
                        Wykres Temperatury
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent className="h-[280px] w-full p-0 pb-4">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                        data={chartData}
                        margin={{
                            top: 20,
                            right: 20,
                            left: -20,
                            bottom: 5,
                        }}
                    >
                        <defs>
                            <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#ef4444" stopOpacity={0.8} />
                                <stop offset="50%" stopColor="#f97316" stopOpacity={0.5} />
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
                            dataKey="timestamp"
                            domain={['auto', 'auto']}
                            type="number"
                            scale="time"
                            tickFormatter={(unixTime) => formatDate(new Date(unixTime), { timeStyle: 'short' })}
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
                            labelFormatter={(timestamp) => formatDate(new Date(timestamp), { dateStyle: 'short', timeStyle: 'short' })}
                            formatter={(value: any, name: string | number | undefined, props: any) => {
                                if (props.payload.type === 'dose') return [`${props.payload.dose}`, props.payload.drug];
                                if (name === 'doseY') return [null, null];
                                return [`${value}°C`, 'Temperatura'];
                            }}
                            filterNull={false}
                        />
                        <ReferenceLine y={38} stroke="#ef4444" strokeDasharray="3 3" label={{ position: 'right', value: '38°', fill: '#ef4444', fontSize: 10 }} />

                        {/* Temperature Layer */}
                        <Area
                            type="monotone"
                            dataKey="temp"
                            connectNulls={true}
                            stroke="url(#strokeTemp)"
                            strokeWidth={4}
                            fillOpacity={1}
                            fill="url(#colorTemp)"
                            animationDuration={1500}
                            dot={(props: any) => {
                                const { cx, cy, payload } = props;
                                if (payload.type === 'temp') return <circle cx={cx} cy={cy} r={3} fill="#fff" stroke="#f97316" strokeWidth={2} />;
                                // Return null or path for empty to avoid React error
                                return <circle cx={cx} cy={cy} r={0} />;
                            }}
                        />

                        {/* Doses Layer */}
                        <Line
                            type="monotone"
                            dataKey="doseY"
                            stroke="none"
                            isAnimationActive={false}
                            dot={(props: any) => {
                                const { cx, cy, payload } = props;
                                if (payload.type === 'dose' && payload.drug && cx !== undefined && cy !== undefined) {
                                    return (
                                        <g key={payload.timestamp}>
                                            <circle cx={cx} cy={cy} r={8} fill={payload.drug === 'Ibuprofen' ? '#3b82f6' : '#10b981'} bg-opacity={0.2} />
                                            <circle cx={cx} cy={cy} r={6} fill={payload.drug === 'Ibuprofen' ? '#3b82f6' : '#10b981'} stroke="#fff" strokeWidth={1} />
                                            <text x={cx} y={cy} dy={3} textAnchor="middle" fill="#fff" fontSize={8} fontWeight="bold">
                                                {payload.drug[0]}
                                            </text>
                                        </g>
                                    );
                                }
                                return <circle cx={cx} cy={cy} r={0} />;
                            }}
                        />

                    </ComposedChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
