'use client';

import { useMemo } from 'react';
import type { HistoryItem } from '@/types';

interface TemperatureChartProps {
    history: HistoryItem[];
}

export function TemperatureChart({ history }: TemperatureChartProps) {
    const chartData = useMemo(() => {
        // Filter only temperature measurements or doses with temp
        const data = history
            .filter(h => h.temperature !== undefined && h.temperature !== null)
            .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
            // Take last 10 points
            .slice(-10);

        if (data.length === 0) return null;

        const temps = data.map(d => d.temperature!);
        const minTemp = Math.min(...temps, 36);
        const maxTemp = Math.max(...temps, 39);

        const startTime = new Date(data[0]!.timestamp).getTime();
        const endTime = new Date(data[data.length - 1]!.timestamp).getTime();
        const timeRange = endTime - startTime || 1; // avoid division by zero

        return { data, minTemp, maxTemp, startTime, timeRange };
    }, [history]);

    if (!chartData) {
        return (
            <div className="h-48 flex items-center justify-center text-slate-500 border-2 border-dashed border-slate-700 rounded-lg">
                Brak pomiarów temperatury
            </div>
        );
    }

    const { data, minTemp, maxTemp, startTime, timeRange } = chartData;

    // Chart dimensions
    const width = 100;
    const height = 50;
    const padding = 5;
    const chartW = width - padding * 2;
    const chartH = height - padding * 2;

    // Scale functions
    const getX = (timestamp: Date) => {
        const t = timestamp.getTime();
        return padding + ((t - startTime) / timeRange) * chartW;
    };

    const getY = (temp: number) => {
        // Map temp range to height (inverted Y)
        const range = maxTemp - minTemp || 1;
        return padding + chartH - ((temp - minTemp) / range) * chartH;
    };

    // Generate path
    const points = data.map(d => `${getX(new Date(d.timestamp))},${getY(d.temperature!)}`).join(' ');

    return (
        <div className="w-full">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto drop-shadow-lg">
                {/* Background gradient definitions */}
                <defs>
                    <linearGradient id="grid-p-gradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#ef4444" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#10b981" stopOpacity="0.05" />
                    </linearGradient>
                </defs>

                {/* Background */}
                <rect x="0" y="0" width={width} height={height} rx="2" fill="#1e293b" />

                {/* Grid lines (horizontal) */}
                {[37, 38, 39, 40].map(t => {
                    if (t < minTemp || t > maxTemp) return null;
                    const y = getY(t);
                    return (
                        <g key={t}>
                            <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="#334155" strokeWidth="0.2" strokeDasharray="1 1" />
                            <text x={2} y={y + 1} fontSize="2" fill="#64748b">{t}°</text>
                        </g>
                    );
                })}

                {/* Start/End time labels */}
                <text x={padding} y={height - 1} fontSize="2" fill="#64748b">
                    {new Date(startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </text>
                <text x={width - padding} y={height - 1} fontSize="2" fill="#64748b" textAnchor="end">
                    {new Date(data[data.length - 1]!.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </text>

                {/* 38°C Warning Line */}
                {minTemp < 38 && maxTemp > 38 && (
                    <line
                        x1={padding}
                        y1={getY(38)}
                        x2={width - padding}
                        y2={getY(38)}
                        stroke="#ef4444"
                        strokeWidth="0.2"
                        strokeDasharray="2 1"
                        opacity="0.8"
                    />
                )}

                {/* Data Line */}
                <polyline
                    points={points}
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="0.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />

                {/* Data Points */}
                {data.map((d, i) => {
                    const x = getX(new Date(d.timestamp));
                    const y = getY(d.temperature!);
                    const isFever = d.temperature! >= 38;
                    return (
                        <g key={i}>
                            <circle
                                cx={x}
                                cy={y}
                                r="1.2"
                                fill={isFever ? "#ef4444" : "#10b981"}
                                stroke="#1e293b"
                                strokeWidth="0.3"
                            />
                            <text x={x} y={y - 2.5} fontSize="2" fill="white" textAnchor="middle" fontWeight="bold">
                                {d.temperature}
                            </text>
                        </g>
                    );
                })}
            </svg>
        </div>
    );
}
