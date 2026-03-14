import { useMemo } from 'react';
import { Row } from '@/lib/parser';

interface UseRankingsProps {
    data: Row[];
    cols: { num: string[]; txt: string[] };
}

export function useRankings({ data, cols }: UseRankingsProps) {
    const rankings = useMemo(() => {
        if (!data || !data.length || !cols?.num?.length || !cols?.txt?.length) return { best: [], bad: [] };

        // We base the default ranking on the first numeric column and first text column
        const numCol = cols.num[0];
        const catCol = cols.txt[0];

        const grouped: Record<string, number> = {};
        data.forEach(r => {
            const k = String(r[catCol]);
            grouped[k] = (grouped[k] || 0) + (Number(r[numCol]) || 0);
        });

        const sorted = Object.entries(grouped)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);

        return {
            best: sorted.slice(0, 10),
            bad: [...sorted].reverse().slice(0, 10).filter(v => v.value > 0 || sorted.length < 20)
        };
    }, [data, cols]);

    return rankings;
}
