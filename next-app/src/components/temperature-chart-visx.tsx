'use client';

import React, { useMemo, useCallback } from 'react';
import { Group } from '@visx/group';
import { AreaClosed, LinePath, Bar } from '@visx/shape';
import { curveMonotoneX } from '@visx/curve';
import { scaleTime, scaleLinear } from '@visx/scale';
import { withTooltip, Tooltip, TooltipWithBounds, defaultStyles } from '@visx/tooltip';
import { LinearGradient } from '@visx/gradient';
import { localPoint } from '@visx/event';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { timeFormat } from 'd3-time-format';
import { ParentSize } from '@visx/responsive';
import { Thermometer } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { HistoryItem } from '@/types';
import { formatDate } from '@/lib/utils'; // Keep our utils for other things

// --- Types ---

interface TemperatureChartProps {
    history: HistoryItem[];
}

interface DataPoint {
    date: Date;
    temp: number | null;
    dose: HistoryItem | null;
    original: HistoryItem;
}

// --- Component ---

const background = 'transparent';
const accentColor = '#10b981'; // Emerald 500
const accentColorDark = '#334155'; // Slate 700
const tooltipStyles = {
    ...defaultStyles,
    background: 'rgba(15, 23, 42, 0.95)',
    border: '1px solid #334155',
    color: '#f8fafc',
    fontSize: '12px',
    padding: '8px 12px',
    borderRadius: '8px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)',
};

const formatDateAxis = timeFormat('%H:%M');
const formatDateFull = timeFormat('%d %b, %H:%M');

function Chart({ width, height, history, showTooltip, hideTooltip, tooltipData, tooltipTop = 0, tooltipLeft = 0 }: any) {
    // 1. Prepare Data
    const data = useMemo(() => {
        return history
            .sort((a: HistoryItem, b: HistoryItem) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
            .map((h: HistoryItem) => ({
                date: new Date(h.timestamp),
                temp: h.type === 'temp' && h.temperature ? h.temperature : null,
                dose: h.type === 'dose' ? h : null,
                original: h
            }));
    }, [history]);

    // Bounds
    const margin = { top: 20, right: 20, bottom: 40, left: 0 }; // Left 0 to hide Y axis line mostly
    const xMax = width - margin.left - margin.right;
    const yMax = height - margin.top - margin.bottom;

    if (width < 10) return null;

    // Scales
    // Filter only valid temps for domain calculation
    const tempValues = data.filter((d: any) => d.temp !== null).map((d: any) => d.temp as number);
    const minTemp = tempValues.length ? Math.min(...tempValues) : 36;
    const maxTemp = tempValues.length ? Math.max(...tempValues) : 38;

    const xScale = useMemo(
        () =>
            scaleTime({
                range: [0, xMax],
                domain: [
                    Math.min(...data.map((d: any) => d.date.getTime())),
                    Math.max(...data.map((d: any) => d.date.getTime())),
                ],
            }),
        [xMax, data],
    );

    const yScale = useMemo(
        () =>
            scaleLinear({
                range: [yMax, 0],
                domain: [minTemp - 0.5, maxTemp + 0.5],
                nice: true,
            }),
        [yMax, minTemp, maxTemp],
    );

    // Accessors
    const getDate = (d: DataPoint) => d.date;
    const getTemp = (d: DataPoint) => d.temp ?? (minTemp - 0.5); // Fallback for area base

    // Tooltip Handler
    const handleTooltip = useCallback(
        (event: React.TouchEvent<SVGRectElement> | React.MouseEvent<SVGRectElement>) => {
            const { x } = localPoint(event) || { x: 0 };
            const x0 = xScale.invert(x);
            // Find closest data point
            let closest = data[0];
            let minDiff = Infinity;
            for (const d of data) {
                const diff = Math.abs(d.date.getTime() - x0.getTime());
                if (diff < minDiff) {
                    minDiff = diff;
                    closest = d;
                }
            }

            if (closest) {
                showTooltip({
                    tooltipData: closest,
                    tooltipLeft: xScale(closest.date),
                    tooltipTop: closest.temp ? yScale(closest.temp) : yMax, // Position at line or bottom
                });
            }
        },
        [showTooltip, yScale, xScale, data, yMax],
    );

    // Filter data for Line path (remove nulls to break line if needed, or connect)
    // For Visx Area/LinePath, we feed it valid data.
    // If we want gaps, we must use defined prop.
    const validTemps = data.filter((d: any) => d.temp !== null);

    return (
        <div>
            <svg width={width} height={height}>
                <LinearGradient id="area-gradient" from="#ef4444" to="#10b981" toOpacity={0.1} fromOpacity={0.6} />
                <LinearGradient id="line-gradient" from="#ef4444" to="#10b981" />

                <rect x={0} y={0} width={width} height={height} fill="url(#area-gradient)" fillOpacity={0.05} rx={14} />

                <Group left={margin.left} top={margin.top}>
                    {/* Grid */}
                    {yScale.ticks(5).map((tickValue, i) => (
                        <line
                            key={i}
                            x1={0}
                            x2={xMax}
                            y1={yScale(tickValue)}
                            y2={yScale(tickValue)}
                            stroke="#334155"
                            strokeWidth={1}
                            strokeOpacity={0.5}
                            strokeDasharray="4 4"
                        />
                    ))}

                    {/* Area */}
                    <AreaClosed<DataPoint>
                        data={validTemps}
                        x={(d) => xScale(getDate(d)) ?? 0}
                        y={(d) => yScale(getTemp(d)) ?? 0}
                        yScale={yScale}
                        strokeWidth={0}
                        curve={curveMonotoneX}
                        fill="url(#area-gradient)"
                    />

                    {/* Line */}
                    <LinePath<DataPoint>
                        data={validTemps}
                        x={(d) => xScale(getDate(d)) ?? 0}
                        y={(d) => yScale(getTemp(d)) ?? 0}
                        stroke="url(#line-gradient)"
                        strokeWidth={3}
                        curve={curveMonotoneX}

                    />

                    {/* Dots for Temperature */}
                    {validTemps.map((d: DataPoint, i: number) => (
                        <circle
                            key={`temp-dot-${i}`}
                            cx={xScale(getDate(d))}
                            cy={yScale(getTemp(d))}
                            r={4}
                            fill="#1e293b"
                            stroke="#f97316"
                            strokeWidth={2}
                        />
                    ))}

                    {/* Dose Markers (At the bottom) */}
                    {data.filter((d: any) => d.dose).map((d: DataPoint, i: number) => {
                        const x = xScale(getDate(d));
                        const y = yMax - 10;
                        const drugColor = d.dose?.drug === 'Ibuprofen' ? '#3b82f6' : '#10b981';
                        return (
                            <g key={`dose-${i}`}>
                                <line x1={x} x2={x} y1={0} y2={yMax} stroke={drugColor} strokeOpacity={0.2} strokeDasharray="2 2" />
                                <circle cx={x} cy={y} r={10} fill={drugColor} fillOpacity={0.2} />
                                <circle cx={x} cy={y} r={6} fill={drugColor} stroke="#fff" strokeWidth={1.5} />
                                <text x={x} y={y} dy={3} textAnchor="middle" fontSize={8} fill="#fff" fontWeight="bold">
                                    {d.dose?.drug?.[0]}
                                </text>
                            </g>
                        );
                    })}


                    {/* Touch Area */}
                    <Bar
                        x={0}
                        y={0}
                        width={xMax}
                        height={yMax}
                        fill="transparent"
                        rx={14}
                        onTouchStart={handleTooltip}
                        onTouchMove={handleTooltip}
                        onMouseMove={handleTooltip}
                        onMouseLeave={() => hideTooltip()}
                    />

                    {/* Axis */}
                    <AxisBottom
                        top={yMax}
                        scale={xScale}
                        numTicks={width > 500 ? 5 : 3}
                        tickFormat={(val) => formatDateAxis(val as Date)}
                        stroke="#94a3b8"
                        tickStroke="#94a3b8"
                        tickLabelProps={() => ({
                            fill: '#94a3b8',
                            fontSize: 11,
                            textAnchor: 'middle',
                        })}
                    />
                    <AxisLeft
                        scale={yScale}
                        numTicks={5}
                        stroke="transparent"
                        tickStroke="transparent"
                        tickLabelProps={() => ({
                            fill: '#64748b',
                            fontSize: 10,
                            textAnchor: 'end',
                            dx: 15,
                            dy: 3
                        })}
                    />

                    {/* Tooltip Cursor */}
                    {tooltipData && (
                        <g>
                            <line
                                x1={tooltipLeft}
                                x2={tooltipLeft}
                                y1={0}
                                y2={yMax}
                                stroke="#f97316"
                                strokeWidth={1}
                                strokeDasharray="4 4"
                                pointerEvents="none"
                            />
                            <circle
                                cx={tooltipLeft}
                                cy={tooltipTop}
                                r={4}
                                fill="#f97316"
                                stroke="#fff"
                                strokeWidth={2}
                                pointerEvents="none"
                            />
                        </g>
                    )}
                </Group>
            </svg>

            {tooltipData && (
                <TooltipWithBounds
                    key={Math.random()}
                    top={tooltipTop + margin.top} // Adjust for margin
                    left={tooltipLeft + margin.left}
                    style={tooltipStyles}
                >
                    <div className="flex flex-col gap-1">
                        <span className="font-bold text-slate-200">
                            {formatDateFull((tooltipData as DataPoint).date)}
                        </span>
                        {(tooltipData as DataPoint).temp && (
                            <div className="flex items-center gap-2 text-emerald-400">
                                <Thermometer className="w-3 h-3" />
                                {Number((tooltipData as DataPoint).temp).toFixed(1)}°C
                            </div>
                        )}
                        {(tooltipData as DataPoint).dose && (
                            <div className="text-blue-400 text-xs mt-1">
                                {(tooltipData as DataPoint).dose?.drug} {(tooltipData as DataPoint).dose?.doseMl}ml
                            </div>
                        )}
                    </div>
                </TooltipWithBounds>
            )}
        </div>
    );
}

const ChartWithTooltip = withTooltip<any, any>(Chart);

export function TemperatureChartVisx({ history }: TemperatureChartProps) {
    if (!history || history.length === 0) return null;

    return (
        <Card className="border-emerald-500/20 bg-slate-900/40 backdrop-blur-md overflow-hidden">
            <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Thermometer className="h-5 w-5 text-emerald-500" />
                        Wykres Temperatury (Visx 2.0)
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent className="h-[280px] w-full p-0 pb-4 relative">
                <ParentSize>
                    {({ width, height }) => (
                        <ChartWithTooltip
                            width={width}
                            height={height}
                            history={history}
                        />
                    )}
                </ParentSize>
            </CardContent>
        </Card>
    );
}
