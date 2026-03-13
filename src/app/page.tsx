'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import StepSource from '@/components/StepSource';
import StepConfig from '@/components/StepConfig';
import Dashboard from '@/components/Dashboard';
import KadiFloat from '@/components/KadiFloat';
import UserMenu from '@/components/UserMenu';
import LandingPage from '@/components/LandingPage';
import TemplateGallery from '@/components/TemplateGallery';
import { SourceType, SourceConfig, loadSource } from '@/lib/fetcher';
import { Row, VizData, buildViz, detectCols } from '@/lib/parser';

type Step = 'source' | 'config' | 'dashboard';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [step, setStep] = useState<Step>('source');
  const [sourceType, setSourceType] = useState<SourceType>('gsheets');
  const [cfg, setCfg] = useState<SourceConfig>({});
  const [file, setFile] = useState<File | undefined>();
  const [data, setData] = useState<Row[]>([]);
  const [viz, setViz] = useState<VizData | null>(null);
  const [savedDashboards, setSavedDashboards] = useState<any[]>([]);
  const [currentDashboardId, setCurrentDashboardId] = useState<string | undefined>();
  const [currentDashboardHistory, setCurrentDashboardHistory] = useState<any[]>([]);
  const [currentDashboardName, setCurrentDashboardName] = useState<string | undefined>();
  const [showTemplates, setShowTemplates] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [selectedTemplateKPIs, setSelectedTemplateKPIs] = useState<any[] | undefined>();
  const [autoLoadError, setAutoLoadError] = useState<string | undefined>();
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);

  // Initialisation via URL au montage
  useEffect(() => {
    const dbId = searchParams.get('db');
    if (dbId) {
      setCurrentDashboardId(dbId);
    }
  }, []);

  // Charger le workspace et les dashboards sauvegardés
  useEffect(() => {
    if (status === 'authenticated') {
      fetch('/api/workspace')
        .then(res => res.json())
        .then(ws => {
          if (ws.id) {
            setWorkspaceId(ws.id);
            if (typeof window !== 'undefined') {
              (window as any).__DATAGN_WORKSPACE_ID__ = ws.id;
            }
            return fetch(`/api/dashboards?workspaceId=${ws.id}`);
          }
          throw new Error('No workspace found');
        })
        .then(res => {
          if (res && (res as Response).ok) return (res as Response).json();
          return { dashboards: [] };
        })
        .then(data => {
          setSavedDashboards(data.dashboards || []);
        })
        .catch(err => console.error("Error loading initial data:", err));
    }
  }, [status]);

  // Charger le dashboard complet par son ID (incluant l'historique Kadi)
  useEffect(() => {
    if (currentDashboardId && workspaceId) {
      fetch(`/api/dashboards/${currentDashboardId}?workspaceId=${workspaceId}`)
        .then(res => {
          if (!res.ok) throw new Error(`Dashboard error: ${res.status}`);
          return res.json();
        })
        .then(async db => {
          const normalizedSourceType = db.sourceType === 'upload' ? 'csv' : db.sourceType;
          setSourceType(normalizedSourceType as SourceType);
          setCfg(db.config as SourceConfig);
          setCurrentDashboardHistory(db.history || []);
          setCurrentDashboardName(db.name);

          // Phase 42 : Bypass 'config' step and load data immediately
          try {
            const rows = await loadSource(normalizedSourceType as SourceType, { ...(db.config as SourceConfig), workspaceId } as any);
            if (rows.length) {
              setData(rows);
              const cols = detectCols(rows);
              setViz(buildViz(rows, cols));
              setStep('dashboard');
              // Update URL
              router.push(`/?db=${currentDashboardId}`, { scroll: false });
            } else {
              setStep('config');
            }
          } catch (e: any) {
            console.error("Auto-load failed, falling back to config", e);
            setAutoLoadError(e.message);
            setStep('config');
          }
        })
        .catch(err => {
          console.error("Error loading dashboard detail:", err);
          // Si le dashboard n'est pas trouvé ou erreur, on reste sur 'source' ou 'config'
        });
    }
  }, [currentDashboardId, workspaceId, router]);

  const handleNewDashboard = () => {
    setCurrentDashboardId(undefined);
    setCurrentDashboardHistory([]);
    setCurrentDashboardName(undefined);
    setData([]);
    setViz(null);
    setStep('source');
    setAutoLoadError(undefined);
    router.push('/', { scroll: false }); // Clean URL
  };

  const handleSelectSource = (type: SourceType) => {
    setSourceType(type);
    setCurrentDashboardId(undefined);
    setCurrentDashboardHistory([]);
    setStep('config');
    setAutoLoadError(undefined);
  };

  const handleLoaded = async (rows: Row[], config: SourceConfig, f?: File, name?: string) => {
    setCfg(config);
    setFile(f);
    setData(rows);
    const cols = detectCols(rows);
    setViz(buildViz(rows, cols));
    setStep('dashboard');

    if (currentDashboardId && workspaceId) {
      // Phase S3 : Persister les changements (ex: nouveau datasetId) immédiatement
      try {
        await fetch(`/api/dashboards/${currentDashboardId}?workspaceId=${workspaceId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            config,
            sourceType: sourceType === 'csv' ? 'upload' : sourceType
          })
        });
        router.push(`/?db=${currentDashboardId}`, { scroll: false });
      } catch (err) {
        console.error("Erreur lors de la sauvegarde auto du dashboard:", err);
      }
    }
  };

  const handleLoadSaved = (db: any) => {
    const id = typeof db === 'string' ? db : db.id;
    setCurrentDashboardId(id);
    router.push(`/?db=${id}`, { scroll: false });
  };

  const handleChangeSource = () => {
    setStep('source');
    setData([]);
    setViz(null);
  };

  if (status === 'unauthenticated') {
    return <LandingPage />;
  }

  if (status === 'loading') {
    return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', color: 'var(--gl)' }}>Chargement de DataGN...</div>;
  }

  return (
    <>
      <div style={{ position: 'fixed', top: 12, right: 12, zIndex: 1000 }}>
        <UserMenu user={session?.user} onSignOut={() => signOut()} />
      </div>

      {step === 'source' && (
        <>
          <StepSource onSelect={handleSelectSource} />
          <div style={{ textAlign: 'center', marginTop: -20, marginBottom: 40 }}>
            <button
              onClick={() => setShowTemplates(true)}
              style={{
                background: 'none', border: 'none', color: 'var(--gl)', fontWeight: 700,
                fontSize: 14, cursor: 'pointer', textDecoration: 'underline'
              }}
            >
              🌍 Explorer les modèles standards internationaux
            </button>
          </div>
          {savedDashboards.length > 0 && (
            <div style={{ maxWidth: 640, margin: '20px auto', padding: '0 20px' }}>
              <h3 style={{ fontSize: 13, color: 'var(--mu)', marginBottom: 12 }}>Dashboards sauvegardés</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
                {savedDashboards.map(db => (
                  <button
                    key={db.id}
                    onClick={() => handleLoadSaved(db)}
                    style={{
                      padding: 12, background: 'var(--sf)', border: '1px solid var(--bd)', borderRadius: 8, color: 'var(--tx)', fontSize: 13, textAlign: 'left', cursor: 'pointer'
                    }}
                  >
                    <strong>{db.name}</strong>
                    <div style={{ fontSize: 11, color: 'var(--mu)', marginTop: 4 }}>{db.sourceType}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {showTemplates && (
        <TemplateGallery
          onSelect={(tmp) => {
            setSelectedTemplateId(tmp.id);
            setSelectedTemplateKPIs(tmp.kpis);
            setShowTemplates(false);
          }}
          onClose={() => setShowTemplates(false)}
        />
      )}

      {step === 'config' && (
        <StepConfig
          sourceType={sourceType}
          onBack={handleNewDashboard}
          onLoaded={handleLoaded}
          initialCfg={cfg}
          initialError={autoLoadError}
          workspaceId={workspaceId}
        />
      )}

      {step === 'dashboard' && viz && (
        <Dashboard
          data={data}
          viz={viz}
          sourceType={sourceType}
          cfg={{ ...cfg, templateId: selectedTemplateId, templateKPIs: selectedTemplateKPIs }}
          file={file}
          dbId={currentDashboardId}
          dbName={currentDashboardName}
          history={currentDashboardHistory}
          savedDashboards={savedDashboards}
          onLoadDashboard={handleLoadSaved}
          onChangeSource={handleNewDashboard}
          workspaceId={workspaceId}
        />
      )}

      <KadiFloat />
    </>
  );
}
