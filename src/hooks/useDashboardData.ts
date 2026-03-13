import { useState, useMemo, useEffect, useCallback } from 'react';
import { Row, detectCols, buildViz, VizData } from '@/lib/parser';
import { SourceType, SourceConfig, loadSource } from '@/lib/fetcher';

export interface SCDConfig {
    primaryCol: string;
    sortCol: string;
    view: 'active' | 'all';
}

interface UseDashboardDataProps {
    initData: Row[];
    initViz: VizData;
    sourceType: SourceType;
    cfg: SourceConfig;
    customKPIs: any[];
    hiddenKPIs: string[];
    scdConfig?: SCDConfig | null;
}

export function useDashboardData({
    initData,
    initViz,
    sourceType,
    cfg,
    customKPIs,
    hiddenKPIs,
    scdConfig
}: UseDashboardDataProps) {
    const [unfilteredData, setUnfilteredData] = useState<Row[]>(initData);
    const [data, setData] = useState<Row[]>(initData);
    const [viz, setViz] = useState<VizData>(initViz);
    const [syncing, setSyncing] = useState(false);
    const [crossFilter, setCrossFilter] = useState<{ col: string; value: any } | null>(null);

    // ── 1. Augmented Data (Custom KPIs + SCD historisation) ──────────
    const augmentedData = useMemo((): Row[] => {
        // Phase A: Apply calculated KPIs
        let withKPIs: Row[] = unfilteredData;
        if (customKPIs.length > 0) {
            withKPIs = unfilteredData.map(row => {
                const newRow = { ...row };
                customKPIs.forEach((kpi: any) => {
                    const valA = Number(row[kpi.colA]) || 0;
                    const valB = isNaN(Number(kpi.colB))
                        ? (Number(row[kpi.colB]) || 0)
                        : Number(kpi.colB);
                    let res = 0;
                    if (kpi.op === '+') res = valA + valB;
                    if (kpi.op === '-') res = valA - valB;
                    if (kpi.op === '*') res = valA * valB;
                    if (kpi.op === '/') res = valB !== 0 ? valA / valB : 0;
                    newRow[kpi.name] = res;
                });
                return newRow;
            });
        }

        // Phase B: Apply SCD Type 2 historisation
        if (scdConfig?.primaryCol && scdConfig?.sortCol) {
            // Build a map: primaryKey -> latest sortValue
            const latestMap = new Map<string | number, string | number>();

            withKPIs.forEach(row => {
                const pk = row[scdConfig.primaryCol];
                const sv = row[scdConfig.sortCol];
                if (pk !== undefined && sv !== undefined) {
                    const existing = latestMap.get(pk as string | number);
                    if (!existing || String(sv) > String(existing)) {
                        latestMap.set(pk as string | number, sv as string | number);
                    }
                }
            });

            // Tag rows with _is_active
            withKPIs = withKPIs.map(row => {
                const pk = row[scdConfig.primaryCol];
                const sv = row[scdConfig.sortCol];
                const isActive =
                    pk !== undefined &&
                    String(sv) === String(latestMap.get(pk as string | number));
                return { ...row, _is_active: isActive ? 'true' : 'false' };
            });

            // Filter to active-only rows if requested
            if (scdConfig.view === 'active') {
                return withKPIs.filter(r => r['_is_active'] === 'true');
            }
        }

        return withKPIs;
    }, [unfilteredData, customKPIs, scdConfig]);

    // ── Detected Columns ───────────────────────────────────────────
    const cols = useMemo(() => detectCols(augmentedData), [augmentedData]);

    // ── 2. Worker/Main Thread Sync on Augmented Data Changes ───────
    useEffect(() => {
        const targets: Record<string, number> = {};
        customKPIs.forEach((k: any) => { if (k.target) targets[k.name] = k.target; });

        if (typeof window !== 'undefined' && window.Worker && augmentedData.length > 500) {
            const worker = new Worker(new URL('../lib/worker.ts', import.meta.url));
            worker.onmessage = (e) => {
                if (e.data.type === 'SUCCESS') {
                    setData(augmentedData);
                    setViz(e.data.viz);
                }
            };
            worker.postMessage({ type: 'PROCESS_DATA', data: augmentedData, targets });
            return () => worker.terminate();
        } else {
            setData(augmentedData);
            const builtViz = buildViz(augmentedData, detectCols(augmentedData), targets);
            builtViz.kpis = builtViz.kpis.filter(k => !hiddenKPIs.includes(k.col));
            setViz(builtViz);
        }
    }, [augmentedData, customKPIs, hiddenKPIs]);

    // ── 3. Handlers ─────────────────────────────────────────────────
    const handleFilter = useCallback((filtered: Row[]) => {
        const targets: Record<string, number> = {};
        customKPIs.forEach((k: any) => { if (k.target) targets[k.name] = k.target; });
        setData(filtered);
        const builtViz = buildViz(filtered, cols, targets);
        builtViz.kpis = builtViz.kpis.filter(k => !hiddenKPIs.includes(k.col));
        setViz(builtViz);
        setCrossFilter(null);
    }, [cols, customKPIs, hiddenKPIs]);

    const handleCrossFilter = useCallback((col: string, value: any) => {
        const targets: Record<string, number> = {};
        customKPIs.forEach((k: any) => { if (k.target) targets[k.name] = k.target; });
        if (crossFilter?.col === col && crossFilter?.value === value) {
            setCrossFilter(null);
            setData(augmentedData);
            setViz(buildViz(augmentedData, cols, targets));
        } else {
            setCrossFilter({ col, value });
            const filtered = augmentedData.filter(r => r[col] == value);
            setData(filtered);
            const builtViz = buildViz(filtered, cols, targets);
            builtViz.kpis = builtViz.kpis.filter(k => !hiddenKPIs.includes(k.col));
            setViz(builtViz);
        }
    }, [augmentedData, cols, crossFilter, customKPIs, hiddenKPIs]);

    const reload = useCallback(async () => {
        if (sourceType === 'csv') return;
        setSyncing(true);
        try {
            const rows = await loadSource(sourceType, cfg);
            setUnfilteredData(rows);
        } catch (e) {
            console.error('Sync error:', e);
        } finally {
            setSyncing(false);
        }
    }, [sourceType, cfg]);

    return {
        unfilteredData,
        setUnfilteredData,
        data,
        setData,
        viz,
        setViz,
        augmentedData,
        cols,
        syncing,
        crossFilter,
        handleFilter,
        handleCrossFilter,
        reload
    };
}
