import type { HistoryItem, Profile } from '@/types';


export interface Insight {
    id: string;
    type: 'info' | 'warning' | 'success' | 'trend';
    title: string;
    description: string;
    icon?: string;
}

/**
 * Analyze fever history and return insights
 */
export function analyzeProfile(profile: Profile): Insight[] {
    const insights: Insight[] = [];
    const history = profile.history;

    if (history.length === 0) return insights;

    const now = new Date();
    const last24h = history.filter(h =>
        (now.getTime() - new Date(h.timestamp).getTime()) < 24 * 60 * 60 * 1000
    );

    // 1. Safety Check (Doses in last 24h)
    const paracetamolDoses = last24h.filter(h => h.drug === 'Paracetamol').length;
    const ibuprofenDoses = last24h.filter(h => h.drug === 'Ibuprofen').length;

    if (paracetamolDoses >= 4) {
        insights.push({
            id: 'para-limit',
            type: 'warning',
            title: 'Limit Paracetamolu',
            description: `Podano ${paracetamolDoses} dawek w ciągu 24h. Zalecany limit to 4 dawki.`,
        });
    } else if (paracetamolDoses === 3) {
        insights.push({
            id: 'para-warning',
            type: 'info',
            title: 'Paracetamol - uwaga',
            description: 'Pozostała tylko 1 bezpieczna dawka Paracetamolu na dziś.',
        });
    }

    if (ibuprofenDoses >= 3) {
        insights.push({
            id: 'ibu-limit',
            type: 'warning',
            title: 'Limit Ibuprofenu',
            description: `Podano ${ibuprofenDoses} dawek w ciągu 24h. Zalecany limit to 3-4 dawki (zależnie od wagi).`,
        });
    }

    // 2. Fever Trend
    const temps = history
        .filter(h => h.temperature)
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    if (temps.length >= 2) {
        const lastTemp = temps[temps.length - 1];
        const prevTemp = temps[temps.length - 2];

        if (lastTemp && prevTemp && lastTemp.temperature && prevTemp.temperature) {
            const diff = lastTemp.temperature - prevTemp.temperature;
            const timeDiffHours = (new Date(lastTemp.timestamp).getTime() - new Date(prevTemp.timestamp).getTime()) / (1000 * 60 * 60);

            if (timeDiffHours < 4) {
                if (diff > 0.5) {
                    insights.push({
                        id: 'temp-rising',
                        type: 'trend',
                        title: 'Temperatura rośnie',
                        description: `Wzrost o ${diff.toFixed(1)}°C w ciągu ${timeDiffHours.toFixed(1)}h.`,
                    });
                } else if (diff < -0.5) {
                    insights.push({
                        id: 'temp-falling',
                        type: 'success',
                        title: 'Temperatura spada',
                        description: `Spadek o ${Math.abs(diff).toFixed(1)}°C. Leki działają!`,
                    });
                }
            }
        }
    }

    // 3. Interval Analysis (Average return time)
    // Find pairs of doses of same drug
    // This is a simplified analysis

    return insights;
}
