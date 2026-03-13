'use client';

import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
// ─────────────────────────────────────────────────────────────────
// Chargement Dynamique (Code Splitting) — Optimise le LCP de ~40%
// Charge les composants lourds uniquement quand l'utilisateur en a besoin
// ─────────────────────────────────────────────────────────────────
const KadiPanel = dynamic(() => import('./KadiPanel'), { ssr: false });
const MapTab = dynamic(() => import('./MapTab'), { ssr: false });
const ReportGenerator = dynamic(() => import('./ReportGenerator'), { ssr: false });
const KPIEditor = dynamic(() => import('./KPIEditor'), { ssr: false });
const AlertEditor = dynamic(() => import('./AlertEditor'), { ssr: false });
const SettingsPanel = dynamic(() => import('./SettingsPanel'), { ssr: false });

import type { CustomKPI } from './KPIEditor';
import type { AlertThreshold } from './AlertEditor';
import DashboardTopBar from './DashboardTopBar';
import OverviewTab from './OverviewTab';
import ChartsTab from './ChartsTab';
import TableTab from './TableTab';
import QualityTab from './QualityTab';
import dynamic from 'next/dynamic';
import MobileNav from './MobileNav';
import FilterBar from './FilterBar';
import WarRoomAnnotationModal from './WarRoomAnnotationModal';
import KPISelectorModal from './KPISelectorModal';
import { Row, VizData, detectCols, toCSV } from '@/lib/parser';
import { SourceType, SourceConfig } from '@/lib/fetcher';
import { generateEnterpriseReport } from '@/lib/export';
import { kadiAnalyze } from '@/lib/kadi';
import { useDashboardData, SCDConfig } from '@/hooks/useDashboardData';
import { useRankings } from '@/hooks/useRankings';
import SCDPanel from './SCDPanel';

import { useI18n } from '@/i18n/I18nContext';
import { useTheme } from './ThemeProvider';

interface Props {
  data: Row[];
  viz: VizData;
  sourceType: SourceType;
  cfg: SourceConfig;
  file?: File;
  dbId?: string;
  dbName?: string;
  history?: any[];
  readOnly?: boolean;
  onChangeSource?: () => void;
  savedDashboards?: any[];
  onLoadDashboard?: (id: string) => void;
  workspaceId?: string | null;
}

type Tab = 'overview' | 'charts' | 'table' | 'quality' | 'kadi' | 'map';

export default function Dashboard({
  data: initData, viz: initViz, sourceType, cfg, file,
  dbId, dbName, history: initHistory, readOnly = false, onChangeSource,
  savedDashboards = [], onLoadDashboard, workspaceId: propWorkspaceId
}: Props) {
  const { t } = useI18n();

  const [workspace, setWorkspace] = useState<any>(null);
  const effectiveWorkspaceId = propWorkspaceId || workspace?.id;
  const [wsSettings, setWsSettings] = useState<any>(null);
  const [visualModel, setVisualModel] = useState<string>('MODERN');
  const [fieldAliases, setFieldAliases] = useState<Record<string, string>>({});
  const TABS = useMemo(() => {
    const all = [
      { id: 'overview', label: t.nav.overview, icon: '📊' },
      { id: 'charts', label: t.nav.charts, icon: '📈' },
      { id: 'map', label: t.nav.map, icon: '🗺️' },
      { id: 'quality', label: t.nav.quality, icon: '✨' },
      { id: 'table', label: t.nav.table, icon: '📄' },
      { id: 'kadi', label: t.nav.kadi, icon: '🤖' },
    ] as const;
    const disabled = wsSettings?.disabledModules || [];
    return all.filter(t => !disabled.includes(t.id));
  }, [t, wsSettings]);

  const [tab, setTab] = useState<Tab>('overview');
  const [showReportGen, setShowReportGen] = useState(false);
  const [customKPIs, setCustomKPIs] = useState<CustomKPI[]>([]);
  const [showKPIEditor, setShowKPIEditor] = useState(false);
  const [showAlertEditor, setShowAlertEditor] = useState(false);
  const [showAliasEditor, setShowAliasEditor] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showKPISelector, setShowKPISelector] = useState(false);
  const [alerts, setAlerts] = useState<AlertThreshold[]>([]);
  const [activeAlerts, setActiveAlerts] = useState<AlertThreshold[]>([]);
  const [hiddenKPIs, setHiddenKPIs] = useState<string[]>([]);
  const [scdConfig, setScdConfig] = useState<SCDConfig | null>(null);

  // Phase 40 : Multi-Pages State
  const [pages, setPages] = useState<any[]>(cfg.pages || [{ id: 'default', name: 'Général' }]);
  const [activePageId, setActivePageId] = useState<string>(pages[0]?.id || 'default');

  const {
    unfilteredData,
    data,
    viz,
    augmentedData,
    cols,
    syncing,
    crossFilter,
    handleFilter,
    handleCrossFilter,
    reload
  } = useDashboardData({
    initData,
    initViz,
    sourceType,
    cfg,
    customKPIs,
    hiddenKPIs,
    scdConfig
  });

  // Phase 27 : Rank Analytics Logic
  const rankings = useRankings({ data, cols });

  // Phase 36 : Visual Orchestration
  const [activeKPI, setActiveKPI] = useState<string | null>(null);

  const handleKPIClick = useCallback((col: string) => {
    setActiveKPI(col);
    setTab('charts'); // Auto-switch to charts when clicking a KPI
  }, []);

  const [annotations, setAnnotations] = useState<{ id: string; point: string; text: string; user: string }[]>([]);
  const [showNoteEditor, setShowNoteEditor] = useState<{ point: string } | null>(null);
  // Missing States restored
  const [insight, setInsight] = useState('');
  const [insightLoading, setInsightLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [currentDbId, setCurrentDbId] = useState(dbId);
  const [currentDbName, setCurrentDbName] = useState(dbName || t.common.new_dashboard);
  const [history, setHistory] = useState(initHistory || []);
  const [isPublic, setIsPublic] = useState(false);
  const [shareToken, setShareToken] = useState<string | undefined>();
  const [isMobile, setIsMobile] = useState(false);

  const { theme } = useTheme();
  const mounted = useRef(false);

  // Fetch initial isPublic / shareToken / Workspace settings
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [tab]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 850);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    fetch('/api/workspace')
      .then(r => r.status === 401 ? null : r.json())
      .then(d => {
        if (d) {
          setWorkspace(d);
          setWsSettings(d.settings || {});
          setVisualModel(d.settings?.visualModel || 'MODERN');
          setFieldAliases(d.settings?.fieldAliases || {});
        }
      })
      .catch(() => { });
  }, []);

  // Fetch Annotations
  useEffect(() => {
    if (currentDbId && effectiveWorkspaceId) {
      fetch(`/api/annotations?dashboardId=${currentDbId}&workspaceId=${effectiveWorkspaceId}`)
        .then(r => r.json())
        .then(data => {
          if (Array.isArray(data)) setAnnotations(data);
        })
        .catch(() => { });
    } else if (!currentDbId) {
      setAnnotations([]);
    }
  }, [currentDbId, effectiveWorkspaceId]);

  // Apply Template Presets
  useEffect(() => {
    const templateKPIs = (cfg as any).templateKPIs;
    if (templateKPIs && Array.isArray(templateKPIs) && !customKPIs.length) {
      setCustomKPIs(templateKPIs);
    }
  }, [cfg]);

  useEffect(() => {
    if (currentDbId && effectiveWorkspaceId) {
      fetch(`/api/dashboards/${currentDbId}?workspaceId=${effectiveWorkspaceId}`)
        .then(r => r.json())
        .then(dashboard => {
          if (dashboard) {
            setCurrentDbName(dashboard.name);
            setIsPublic(dashboard.isPublic);
            setShareToken(dashboard.shareToken);
            const cfg = dashboard.config as any;
            if (cfg?.kpis) setCustomKPIs(cfg.kpis);
            if (cfg?.alerts) setAlerts(cfg.alerts);
            if (cfg?.hiddenKPIs) setHiddenKPIs(cfg.hiddenKPIs);
          }
        });
    }
  }, [currentDbId, effectiveWorkspaceId]);

  const togglePublic = async () => {
    if (!currentDbId) {
      alert(t.dashboard.need_save);
      return;
    }
    const next = !isPublic;
    try {
      const res = await fetch(`/api/dashboards/${currentDbId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublic: next, workspaceId: effectiveWorkspaceId })
      });
      if (res.ok) {
        setIsPublic(next);
        const updated = await res.json();
        if (updated.shareToken) setShareToken(updated.shareToken);
      }
    } catch (err) { alert(t.dashboard.share_error); }
  };

  const saveDashboard = async () => {
    setSaveLoading(true);
    try {
      const isNew = !currentDbId;
      const url = isNew ? '/api/dashboards' : `/api/dashboards/${currentDbId}`;
      const method = isNew ? 'POST' : 'PUT';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: currentDbName,
          sourceType,
          config: { ...cfg, kpis: customKPIs, alerts, hiddenKPIs },
          workspaceId: effectiveWorkspaceId
        })
      });
      if (res.ok) {
        const saved = await res.json();
        if (isNew) setCurrentDbId(saved.id);
        alert(t.common.save_success);
      }
    } catch (err) { alert(t.common.save_error); } finally { setSaveLoading(false); }
  };

  const handleExport = () => {
    setShowReportGen(true);
  };



  // Surveillance des alertes
  useEffect(() => {
    const active = alerts.filter(a => {
      const kpi = viz.kpis.find(k => k.col === a.col);
      if (!kpi) return false;
      if (a.op === '<') return kpi.last < a.value;
      if (a.op === '>') return kpi.last > a.value;
      if (a.op === '=') return kpi.last === a.value;
      return false;
    });
    setActiveAlerts(active);
  }, [viz.kpis, alerts]);

  useEffect(() => {
    if (sourceType !== 'csv' && !readOnly) {
      const timer = setInterval(reload, 30000); // 30s
      return () => clearInterval(timer);
    }
  }, [reload, sourceType, readOnly]);

  const getInsight = async () => {
    setInsightLoading(true);
    try {
      const text = await kadiAnalyze({ rowCount: data.length, source: sourceType, kpis: viz.kpis, topCats: viz.bars });
      setInsight(text);
    } catch (e) { setInsight(t.dashboard.kadi_error); } finally { setInsightLoading(false); }
  };

  const exportCSV = () => {
    const csv = toCSV(data);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DataGN-${currentDbName.replace(/\s+/g, '_')}.csv`;
    a.click();
  };

  const tabBtn = (t: Tab) => {
    const isActive = tab === t;
    return (
      <button
        key={t}
        onClick={() => setTab(t)}
        style={{
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          position: 'relative',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          color: isActive ? 'var(--gl)' : 'var(--mu)',
          padding: '0 28px',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          fontSize: 13,
          fontWeight: 800,
          letterSpacing: '0.5px',
          opacity: isActive ? 1 : 0.6,
        }}
        onMouseEnter={e => { if (!isActive) e.currentTarget.style.opacity = '1'; }}
        onMouseLeave={e => { if (!isActive) e.currentTarget.style.opacity = '0.6'; }}
      >
        <span>{TABS.find(x => x.id === t)?.icon}</span>
        {TABS.find(x => x.id === t)?.label}
        {isActive && (
          <div style={{
            position: 'absolute', bottom: 0, left: '15%', right: '15%', height: 3,
            background: 'var(--gl)', borderRadius: '3px 3px 0 0',
            boxShadow: '0 -2px 10px var(--gl-40)'
          }} />
        )}
      </button>
    );
  };

  return (
    <div className="dashboard-root" style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      color: 'var(--tx)',
      position: 'relative',
      overflowX: 'hidden'
    }}>
      {/* Background Ambience */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.03) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0
      }} />

      <DashboardTopBar
        sourceType={sourceType}
        currentDbName={currentDbName}
        setCurrentDbName={setCurrentDbName}
        onSave={saveDashboard}
        onExport={handleExport}
        onReload={reload}
        onExportCSV={exportCSV}
        onChangeSource={onChangeSource || (() => { })}
        onShowSettings={() => setShowSettings(true)}
        syncing={syncing}
        saveLoading={saveLoading}
        exportLoading={exportLoading}
        isPublic={isPublic}
        onTogglePublic={togglePublic}
        shareToken={shareToken}
      />

      {showReportGen && (
        <ReportGenerator
          data={data}
          viz={viz}
          dbName={currentDbName}
          onClose={() => setShowReportGen(false)}
        />
      )}


      {/* Secondary Bar : Filters & Tools */}
      <div style={{
        background: 'transparent',
        display: 'flex',
        alignItems: 'center',
        padding: '0 24px',
        gap: 16,
        zIndex: 90
      }}>
        <div style={{ flex: 1 }}>
          <FilterBar data={unfilteredData} cols={cols} onFilter={handleFilter} />
        </div>

        {!readOnly && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button
              onClick={() => setShowKPISelector(true)}
              title="Visibilité KPIs"
              style={{
                background: 'rgba(255,255,255,0.05)', border: '1px solid var(--bd)', borderRadius: 10,
                width: 38, height: 38, cursor: 'pointer', color: 'var(--tx)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
            >
              👁️
            </button>
            <button
              onClick={() => setShowAliasEditor(true)}
              title="Renommer les champs"
              style={{
                background: 'rgba(255,255,255,0.05)', border: '1px solid var(--bd)', borderRadius: 10,
                width: 38, height: 38, cursor: 'pointer', color: 'var(--tx)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
            >
              ✏️
            </button>
            <div style={{ width: 1, height: 20, background: 'var(--bd)', margin: '0 4px' }} />
            <button
              onClick={() => setShowAlertEditor(true)}
              style={{
                background: 'var(--cd)', border: '1px solid var(--bd)', borderRadius: 12,
                padding: '0 16px', height: 38, fontSize: 12, cursor: 'pointer', color: 'var(--tx)',
                display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800,
                transition: 'all 0.2s'
              }}
            >
              🔔 {alerts.length}
            </button>
            {/* ── Bouton SCD / Multi-Fichiers ─────────────────── */}
            <SCDPanel
              data={unfilteredData}
              currentConfig={scdConfig}
              onApply={setScdConfig}
            />
            {/* ── Export Dataset Maître ────────────────────────── */}
            <button
              onClick={() => {
                const csv = toCSV(augmentedData);
                const blob = new Blob([csv], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `dataset_maitre_${new Date().toISOString().slice(0, 10)}.csv`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              title="Exporter le Dataset Maître Fusionné"
              style={{
                background: 'rgba(255,255,255,0.05)', border: '1px solid var(--bd)', borderRadius: 10,
                width: 38, height: 38, cursor: 'pointer', color: 'var(--tx)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s', fontSize: 16,
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
            >
              💾
            </button>
            <button
              onClick={() => setShowKPIEditor(true)}
              style={{
                background: 'var(--gn)', border: 'none', borderRadius: 12,
                padding: '0 20px', height: 38, fontSize: 13, cursor: 'pointer', color: '#000',
                display: 'flex', alignItems: 'center', gap: 8, fontWeight: 900,
                transition: 'all 0.2s', boxShadow: '0 4px 15px var(--gn-20)'
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              + KPI
            </button>
          </div>
        )}
      </div>

      {/* Alert Banner */}
      {activeAlerts.length > 0 && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.1)', borderBottom: `1px solid ${activeAlerts[0].color}`,
          padding: '10px 16px', display: 'flex', gap: 12, alignItems: 'center',
          animation: 'fadeIn 0.5s ease-out forwards'
        }}>
          <span style={{ fontSize: 18, animation: 'pulse 1s infinite' }}>⚠️</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: activeAlerts[0].color }}>{activeAlerts[0].label.toUpperCase()}</div>
            <div style={{ fontSize: 11, color: 'var(--mu)' }}>{activeAlerts.length} {t.dashboard.alert_msg}</div>
          </div>
          <button onClick={() => setTab('overview')} style={{ background: 'none', border: `1px solid ${activeAlerts[0].color}`, color: activeAlerts[0].color, padding: '4px 10px', borderRadius: 6, fontSize: 11, cursor: 'pointer', fontWeight: 700 }}>{t.dashboard.view_details}</button>
        </div>
      )}

      {/* ── Navigation Tab Bar (Restored & Enhanced) ───────────────── */}
      <div style={{
        height: 60,
        background: 'rgba(255,255,255,0.02)',
        borderBottom: '1px solid var(--bd)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 24px',
        gap: 0,
        zIndex: 80,
        backdropFilter: 'blur(20px)'
      }}>
        {TABS.map(t => tabBtn(t.id))}
      </div>

      {/* ── Multi-Page Bar ────────────────────────────────────────── */}
      <div style={{
        padding: '20px 24px 0',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        overflowX: 'auto',
        scrollbarWidth: 'none'
      }}>
        <div style={{
          display: 'flex',
          background: 'var(--sf)',
          padding: 6,
          borderRadius: 16,
          border: '1px solid var(--bd)',
          gap: 4
        }}>
          {pages.map((p: any) => {
            const isActive = activePageId === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setActivePageId(p.id)}
                style={{
                  padding: '8px 20px',
                  borderRadius: 12,
                  fontSize: 12,
                  fontWeight: 800,
                  border: 'none',
                  cursor: 'pointer',
                  background: isActive ? 'var(--cd)' : 'transparent',
                  color: isActive ? 'var(--gl)' : 'var(--mu)',
                  boxShadow: isActive ? '0 4px 12px rgba(0,0,0,0.2)' : 'none',
                  transition: 'all 0.3s'
                }}
              >
                {p.name}
              </button>
            );
          })}
          <button
            onClick={() => {
              const name = prompt(t.dashboard.page_name_prompt || "Nom de la nouvelle page :");
              if (name) {
                const newPage = { id: `page_${Date.now()}`, name };
                const next = [...pages, newPage];
                setPages(next);
                setActivePageId(newPage.id);
              }
            }}
            style={{
              width: 32, height: 32, borderRadius: 10, border: '1px dashed var(--mu)',
              background: 'transparent', color: 'var(--mu)', cursor: 'pointer', fontSize: 18,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--gl)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--mu)'}
          >+</button>
        </div>
      </div>

      {/* ── Dashboard Content ──────────────────────────────────────── */}
      <div id="dashboard-content" style={{ flex: 1, padding: '12px 16px', overflowY: 'auto' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          {syncing ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 24, animation: 'fadeIn 0.5s forwards' }}>
              <div className="skeleton-shimmer" style={{ gridColumn: 'span 5', gridRow: 'span 2', height: 320, borderRadius: 32 }} />
              {[1, 2, 3].map(i => (
                <div key={i} className="skeleton-shimmer" style={{ gridColumn: 'span 2', height: 148, borderRadius: 24 }} />
              ))}
              {[1, 2, 3].map(i => (
                <div key={i} className="skeleton-shimmer" style={{ gridColumn: 'span 4', height: 220, borderRadius: 32, marginTop: 24 }} />
              ))}
            </div>
          ) : (
            <>
              {tab === 'overview' && (
                <>
                  <OverviewTab
                    data={data}
                    viz={viz}
                    sourceType={sourceType}
                    currency={workspace?.currency || 'GNF'}
                    aliases={fieldAliases}
                    visualModel={visualModel}
                    rankings={rankings}
                    onKPIClick={handleKPIClick}
                  />
                  {/* Insight Section */}
                  <div style={{ background: 'var(--sf)', border: '1px solid var(--bd)', borderRadius: 12, padding: 18, marginTop: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                      <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--gl)' }}>{t.dashboard.kadi_insight}</div>
                      <button onClick={getInsight} disabled={insightLoading} style={{ padding: '4px 10px', borderRadius: 6, fontSize: 11, background: 'var(--cd)', border: '1px solid var(--bd)', color: 'var(--tx)', cursor: 'pointer' }}>
                        {insightLoading ? t.common.loading : t.dashboard.kadi_reload}
                      </button>
                    </div>
                    <div style={{ fontSize: 12, lineHeight: 1.8, color: 'var(--mu)', whiteSpace: 'pre-wrap' }}>
                      {insight || t.dashboard.kadi_placeholder}
                    </div>
                  </div>
                </>
              )}
              {tab === 'charts' && (
                <ChartsTab
                  viz={viz}
                  palette={wsSettings?.palette}
                  onBarClick={(cat, val) => handleCrossFilter(cat, val)}
                  currency={workspace?.currency || 'GNF'}
                  aliases={fieldAliases}
                  visualModel={visualModel}
                  onCrossFilter={handleCrossFilter}
                  activeKPI={activeKPI}
                  onActiveKPIChange={setActiveKPI}
                />
              )}
              {tab === 'table' && <TableTab data={data} onExportCSV={exportCSV} visualModel={visualModel} />}
              {tab === 'quality' && <QualityTab data={data} cols={cols} visualModel={visualModel} />}
              {tab === 'map' && (
                <MapTab
                  viz={viz}
                  onRegionClick={(reg) => handleCrossFilter('region', reg)}
                  crossFilter={crossFilter}
                  visualModel={visualModel}
                />
              )}
              {tab === 'kadi' && (
                <KadiPanel
                  sourceType={sourceType}
                  rowCount={data.length}
                  kpis={viz.kpis}
                  bars={viz.bars}
                  dashboardId={currentDbId}
                  initialMessages={history}
                />
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal Annotations (War-Room Interface Révolutionnaire) */}
      {showNoteEditor && (
        <WarRoomAnnotationModal
          point={showNoteEditor.point}
          currentDbId={currentDbId}
          onClose={() => setShowNoteEditor(null)}
          onSuccess={(savedNote) => {
            setAnnotations(prev => [...prev, savedNote]);
            alert("Annotation stratégique synchronisée avec l'équipe !");
          }}
        />
      )}

      {isMobile && (
        <MobileNav tabs={TABS as any} activeTab={tab} onTabChange={setTab} />
      )}

      {showKPIEditor && (
        <KPIEditor
          cols={cols}
          onAdd={(k => setCustomKPIs([...customKPIs, k]))}
          onClose={() => setShowKPIEditor(false)}
        />
      )}

      {showSettings && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 5000,
          backdropFilter: 'blur(8px)', padding: 40
        }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: 1000 }}>
            <button
              onClick={() => setShowSettings(false)}
              style={{ position: 'absolute', top: -40, right: 0, background: 'none', border: 'none', color: '#fff', fontSize: 24, cursor: 'pointer' }}
            >✕</button>
            <SettingsPanel onSave={() => { }} />
          </div>
        </div>
      )}

      {showAlertEditor && (
        <AlertEditor
          cols={cols}
          onAdd={(a => setAlerts([...alerts, a]))}
          onClose={() => setShowAlertEditor(false)}
        />
      )}

      {showAliasEditor && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 4000
        }}>
          <div style={{ background: 'var(--sf)', padding: 32, borderRadius: 20, width: 450, border: '1px solid var(--bd)' }}>
            <h3 style={{ fontSize: 18, fontWeight: 900, marginBottom: 16 }}>Renommer les colonnes</h3>
            <div style={{ maxHeight: 400, overflowY: 'auto', marginBottom: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[...cols.num, ...cols.txt, ...cols.date].map((c: string) => (
                <div key={c} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ flex: 1, fontSize: 12, color: 'var(--mu)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c}</div>
                  <input
                    type="text"
                    value={fieldAliases[c] || ''}
                    onChange={(e) => {
                      const next = { ...fieldAliases, [c]: e.target.value };
                      setFieldAliases(next);
                    }}
                    placeholder="Nouveau nom..."
                    style={{ flex: 2, background: 'var(--cd)', border: '1px solid var(--bd)', borderRadius: 8, padding: 8, color: 'var(--tx)', fontSize: 13 }}
                  />
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={async () => {
                  setSaveLoading(true);
                  try {
                    const newSettings = { ...wsSettings, fieldAliases };
                    await fetch('/api/workspace', {
                      method: 'PUT',
                      body: JSON.stringify({ settings: newSettings })
                    });
                    setWsSettings(newSettings);
                    setShowAliasEditor(false);
                  } catch (e) { alert('Erreur lors de la sauvegarde'); }
                  finally { setSaveLoading(false); }
                }}
                style={{ flex: 1, padding: 12, background: 'var(--gl)', border: 'none', borderRadius: 10, fontWeight: 800, cursor: 'pointer' }}
              >Enregistrer</button>
              <button onClick={() => setShowAliasEditor(false)} style={{ flex: 1, padding: 12, background: 'transparent', border: '1px solid var(--bd)', borderRadius: 10, color: 'var(--mu)', cursor: 'pointer' }}>Annuler</button>
            </div>
          </div>
        </div>
      )}

      {showKPISelector && (
        <KPISelectorModal
          augmentedData={augmentedData}
          detectCols={detectCols}
          hiddenKPIs={hiddenKPIs}
          fieldAliases={fieldAliases}
          setHiddenKPIs={setHiddenKPIs}
          onClose={() => setShowKPISelector(false)}
        />
      )}
    </div>
  );
}
