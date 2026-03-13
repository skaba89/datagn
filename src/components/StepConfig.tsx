'use client';
// ────────────────────────────────────────────────────────────────
// StepConfig.tsx — Formulaire de configuration de la source
// ────────────────────────────────────────────────────────────────
import { useState, useRef, useEffect, DragEvent, ChangeEvent } from 'react';
import { SourceType, SourceConfig, loadSource, uploadDataset } from '@/lib/fetcher';
import { Row } from '@/lib/parser';
import { useI18n } from '@/i18n/I18nContext';

interface Props {
  sourceType: SourceType;
  initialCfg?: SourceConfig;
  workspaceId?: string | null;
  onBack: () => void;
  onLoaded: (data: Row[], cfg: SourceConfig, file?: File) => void;
  initialError?: string;
}

export default function StepConfig({ sourceType, initialCfg, workspaceId, onBack, onLoaded, initialError }: Props) {
  const { t } = useI18n();

  // ── Tips sécurisés (sans dangerouslySetInnerHTML) ──────────────
  const TIPS: Record<SourceType, any | null> = {
    gsheets: {
      title: t.onboarding.config.tips.gsheets?.title,
      color: '#0F9D58',
      lines: (t.onboarding.config.tips.gsheets?.lines || []).map((l: string) => ({ text: l })),
    },
    csv: null,
    kobo: {
      title: t.onboarding.config.tips.kobo?.title,
      color: '#3B82F6',
      lines: [
        { text: t.onboarding.config.tips.kobo?.lines?.[0], bold: false },
        { text: t.onboarding.config.tips.kobo?.lines?.[1], bold: true },
        { text: t.onboarding.config.tips.kobo?.lines?.[2] },
      ],
    },
    api: {
      title: t.onboarding.config.tips.api?.title,
      color: '#8B5CF6',
      lines: [
        { text: t.onboarding.config.tips.api?.lines?.[0] },
        { text: t.onboarding.config.tips.api?.lines?.[1], code: true },
        { text: t.onboarding.config.tips.api?.lines?.[2] },
      ],
    },
    dhis2: {
      title: t.onboarding.config.tips.dhis2?.title,
      color: '#004A99',
      lines: (t.onboarding.config.tips.dhis2?.lines || []).map((l: string) => ({ text: l })),
    },
    db: {
      title: 'Base de Données Distante',
      color: '#E0234E',
      lines: [
        { text: 'PostgreSQL, MySQL ou SQL Server supportés via connection string.' },
        { text: 'Privilégiez une vue au lieu d\'une table brute.', bold: true }
      ]
    }
  };

  const META: Record<SourceType, {
    icon: string;
    label: string;
    color: string;
    fields: { key: keyof SourceConfig; label: string; placeholder: string; type: string }[];
  }> = {
    gsheets: {
      icon: '📊', label: t.onboarding.sources.gsheets?.label, color: '#0F9D58',
      fields: [
        { key: 'url', label: t.onboarding.config.fields?.url, placeholder: t.onboarding.config.placeholders?.url, type: 'text' },
        { key: 'refresh', label: t.onboarding.config.fields?.refresh, placeholder: t.onboarding.config.placeholders?.refresh, type: 'number' },
      ],
    },
    csv: {
      icon: '📁', label: t.onboarding.sources.csv?.label, color: '#EDB025',
      fields: [],
    },
    ['upload' as any]: {
      icon: '📁', label: t.onboarding.sources.csv?.label, color: '#EDB025',
      fields: [],
    },
    kobo: {
      icon: '📋', label: t.onboarding.sources.kobo?.label, color: '#3B82F6',
      fields: [
        { key: 'token', label: t.onboarding.config.fields?.token, placeholder: t.onboarding.config.placeholders?.token, type: 'password' },
        { key: 'formId', label: t.onboarding.config.fields?.formId, placeholder: t.onboarding.config.placeholders?.formId, type: 'text' },
        { key: 'server', label: t.onboarding.config.fields?.server, placeholder: t.onboarding.config.placeholders?.server, type: 'text' },
        { key: 'refresh', label: t.onboarding.config.fields?.refresh, placeholder: t.onboarding.config.placeholders?.refresh, type: 'number' },
      ],
    },
    api: {
      icon: '🗄️', label: t.onboarding.sources.api?.label, color: '#8B5CF6',
      fields: [
        { key: 'endpoint', label: t.onboarding.config.fields?.endpoint, placeholder: t.onboarding.config.placeholders?.endpoint, type: 'text' },
        { key: 'apiKey', label: t.onboarding.config.fields?.apiKey, placeholder: t.onboarding.config.placeholders?.apiKey, type: 'password' },
        { key: 'refresh', label: t.onboarding.config.fields?.refresh, placeholder: t.onboarding.config.placeholders?.refresh, type: 'number' },
      ],
    },
    dhis2: {
      icon: '🏥', label: t.onboarding.sources.dhis2?.label, color: '#004A99',
      fields: [
        { key: 'baseUrl', label: t.onboarding.config.fields?.baseUrl, placeholder: t.onboarding.config.placeholders?.baseUrl, type: 'text' },
        { key: 'username', label: t.onboarding.config.fields?.username, placeholder: t.onboarding.config.placeholders?.username, type: 'text' },
        { key: 'password', label: t.onboarding.config.fields?.password, placeholder: t.onboarding.config.placeholders?.password, type: 'password' },
        { key: 'dataSet', label: t.onboarding.config.fields?.dataSet, placeholder: t.onboarding.config.placeholders?.dataSet, type: 'text' },
        { key: 'orgUnit', label: t.onboarding.config.fields?.orgUnit, placeholder: t.onboarding.config.placeholders?.orgUnit, type: 'text' },
        { key: 'period', label: t.onboarding.config.fields?.period, placeholder: t.onboarding.config.placeholders?.period, type: 'text' },
        { key: 'refresh', label: t.onboarding.config.fields?.refresh, placeholder: t.onboarding.config.placeholders?.refresh, type: 'number' },
      ],
    },
    db: {
      icon: '💽', label: 'Base de Données', color: '#E0234E',
      fields: [
        { key: 'dbUrl', label: 'URL de Connexion', placeholder: 'postgresql://user:pass@host:5432/dbname', type: 'text' },
        { key: 'dbTable', label: 'Table / Vue ciblée', placeholder: 'public.donnees', type: 'text' },
        { key: 'refresh', label: t.onboarding.config.fields?.refresh, placeholder: t.onboarding.config.placeholders?.refresh, type: 'number' },
      ],
    },
  };

  const INP: React.CSSProperties = {
    width: '100%',
    background: 'var(--cd)',
    border: '1px solid var(--bd)',
    borderRadius: 8,
    padding: '11px 14px',
    color: 'var(--tx)',
    fontSize: 13,
    marginBottom: 14,
    transition: 'border .2s',
  };

  const m = META[sourceType];
  const [cfg, setCfg] = useState<SourceConfig>(initialCfg || {});

  // Sécurité si sourceType est inconnu
  if (!m) {
    return (
      <div style={{
        minHeight: 'calc(100vh - 80px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
        background: 'var(--bg)'
      }}>
        <div className="fu glass-panel" style={{
          background: 'var(--sf)',
          borderRadius: 32,
          padding: 40,
          maxWidth: 550,
          width: '100%',
          textAlign: 'center',
          border: '1px solid var(--bd)'
        }}>
          <div style={{ fontSize: 48, marginBottom: 20 }}>⚠️</div>
          <h2 style={{ color: 'var(--tx)', marginBottom: 12 }}>Source inconnue</h2>
          <p style={{ color: 'var(--mu)', marginBottom: 24 }}>Le type de source "{sourceType}" n'est pas reconnu par le système.</p>
          <button
            onClick={onBack}
            style={{
              background: 'var(--cd)', border: '1px solid var(--bd)',
              color: 'var(--tx)', padding: '12px 24px', borderRadius: 12,
              fontWeight: 700, cursor: 'pointer'
            }}
          >
            Retourner au choix
          </button>
        </div>
      </div>
    );
  }

  // Auto-chargement si initialCfg est fourni et complet (ex: pour dashboards sauvegardés)
  useEffect(() => {
    if (initialCfg && Object.keys(initialCfg).length > 0) {
      // Pour GSheets/API/Kobo, si les champs requis sont là, on peut auto-charger
      const fields = m.fields.map(f => f.key);
      const isComplete = fields.every(f => !!(initialCfg as any)[f]);
      if (isComplete && sourceType !== 'csv') {
        submit();
      }
    }
  }, []);

  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [exploring, setExploring] = useState(false);
  const [schema, setSchema] = useState<any>(null);
  const [error, setError] = useState(initialError || '');
  const [dragging, setDrag] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const folderRef = useRef<HTMLInputElement>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const set = (key: keyof SourceConfig | string, val: string | number | any[]) =>
    setCfg(prev => ({ ...prev, [key]: val }));

  const handleFiles = (fList: FileList | File[]) => {
    const arr = Array.from(fList).filter(f => f.name.match(/\.(csv|tsv|txt)$/i));
    if (arr.length > 0) {
      setFiles(arr);
      setError('');
    }
  };

  const handleExplore = async () => {
    if (!cfg.dbUrl) return;
    setExploring(true);
    setError('');
    try {
      const resp = await fetch('/api/sql-schema', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dbUrl: cfg.dbUrl })
      });
      const data = await resp.json();
      if (data.error) throw new Error(data.error);
      setSchema(data.tables);
    } catch (e: any) {
      setError("Exploration échouée: " + e.message);
    } finally {
      setExploring(false);
    }
  };

  const submit = async () => {
    setError('');
    setLoading(true);
    try {
      let finalCfg = { ...cfg };

      // Phase S3 : Si c'est un CSV et qu'on a un workspaceId, on upload pour persister
      if (sourceType === 'csv' && files.length > 0 && workspaceId) {
        try {
          const datasetId = await uploadDataset(files, workspaceId);
          finalCfg.datasetId = datasetId;
        } catch (uploadErr) {
          console.error("Upload non bloquant échoué:", uploadErr);
          // On continue quand même en local si l'upload échoue, 
          // mais le dashboard ne sera pas persistent au rafraîchissement.
        }
      }

      const data = await loadSource(sourceType, finalCfg, files.length > 0 ? files : undefined);
      if (!data.length) throw new Error(t.onboarding.config.error_empty);
      onLoaded(data, finalCfg, files[0]); // On passe le premier fichier pour la compatibilité ascendante métier locale
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : t.common.error);
    } finally {
      setLoading(false);
    }
  };

  const onDragOver = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setDrag(true); };
  const onDragLeave = () => setDrag(false);
  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault(); setDrag(false);
    if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 80px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      background: 'var(--bg)',
      transition: 'background 0.3s'
    }}>
      <div className="fu glass-panel" style={{
        background: 'var(--sf)',
        border: `1px solid ${m.color}30`,
        borderRadius: 32,
        padding: 40,
        maxWidth: 550,
        width: '100%',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 4px 30px rgba(0,0,0,0.15)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}>
        {/* Barre couleur haut */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0,
          height: 4,
          background: `linear-gradient(90deg, transparent, ${m.color}, transparent)`,
        }} />

        {/* Retour */}
        <button
          onClick={onBack}
          aria-label="Retour au choix de la source"
          style={{
            background: 'var(--cd)', border: '1px solid var(--bd)',
            color: 'var(--mu)', fontSize: 12,
            cursor: 'pointer', display: 'flex',
            alignItems: 'center', gap: 8,
            padding: '6px 14px', borderRadius: 20, marginBottom: 24,
            fontWeight: 700, transition: 'all 0.2s'
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--gl)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--bd)'}
        >
          <span>←</span> {t.onboarding.config.back}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
          <div style={{
            fontSize: 40, width: 72, height: 72, borderRadius: 20,
            background: `${m.color}15`, display: 'flex', alignItems: 'center',
            justifyContent: 'center', border: `1px solid ${m.color}30`
          }}>{m.icon}</div>
          <div>
            <h2 style={{
              fontSize: 24, fontWeight: 900, color: 'var(--tx)',
              marginBottom: 4, letterSpacing: '-0.8px'
            }}>{m.label}</h2>
            <div style={{ fontSize: 13, color: 'var(--mu)', fontWeight: 500 }}>Configuration de la source</div>
          </div>
        </div>

        {/* Champs texte */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 24 }}>
          {m.fields.map(f => (
            <div key={f.key}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
                <div style={{ flex: 1 }}>
                  <label style={{
                    display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--mu)',
                    textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 8
                  }}>{f.label}</label>
                  <input
                    type={f.type}
                    placeholder={f.placeholder}
                    value={(cfg as any)[f.key] || ''}
                    style={{
                      width: '100%', background: 'var(--cd)', border: '1px solid var(--bd)',
                      borderRadius: 12, padding: '14px 18px', color: 'var(--tx)',
                      fontSize: 14, transition: 'all .2s'
                    }}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      set(f.key, f.type === 'number' ? Number(e.target.value) : e.target.value);
                    }}
                    onFocus={e => { e.target.style.borderColor = m.color; e.target.style.boxShadow = `0 0 0 4px ${m.color}10`; }}
                    onBlur={e => { e.target.style.borderColor = 'var(--bd)'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>
                {f.key === 'dbUrl' && (
                  <button
                    onClick={handleExplore}
                    disabled={exploring || !cfg.dbUrl}
                    style={{
                      marginBottom: 0, padding: '14px 20px', borderRadius: 12,
                      background: 'var(--cd)', border: '1px solid var(--bd)',
                      color: 'var(--tx)', fontWeight: 800, fontSize: 13, cursor: 'pointer',
                      height: 48, transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = m.color}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--bd)'}
                  >
                    {exploring ? '...' : '🔍 Explorer'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Visual SQL Table Selector */}
        {schema && (
          <div style={{ background: 'var(--cd)', borderRadius: 20, padding: 24, marginBottom: 24, border: '1px solid var(--bd)' }}>
            <div style={{ fontSize: 11, color: 'var(--mu)', fontWeight: 800, textTransform: 'uppercase', marginBottom: 16, letterSpacing: '1px' }}>SÉLECTION ANALYTIQUE</div>

            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 10, color: 'var(--gl)', fontWeight: 900, marginBottom: 8, textTransform: 'uppercase' }}>1. TABLE DE FAIT</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 150, overflowY: 'auto', paddingRight: 4 }}>
                {Object.keys(schema).map(tableName => (
                  <div
                    key={tableName}
                    onClick={() => set('dbTable', tableName)}
                    style={{
                      padding: '12px 16px', background: cfg.dbTable === tableName ? 'var(--gl)' : 'var(--bg)',
                      color: cfg.dbTable === tableName ? '#000' : 'var(--tx)',
                      borderRadius: 12, fontSize: 14, cursor: 'pointer', fontWeight: 700,
                      border: `1px solid ${cfg.dbTable === tableName ? 'var(--gl)' : 'var(--bd)'}`,
                      transition: 'all 0.2s'
                    }}
                  >
                    📌 {tableName}
                  </div>
                ))}
              </div>
            </div>

            {cfg.dbTable && schema[cfg.dbTable]?.joins?.length > 0 && (
              <div>
                <div style={{ fontSize: 10, color: 'var(--gl)', fontWeight: 900, marginBottom: 8, textTransform: 'uppercase' }}>2. DIMENSIONS</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {schema[cfg.dbTable].joins.map((j: any, idx: number) => {
                    const isSelected = (cfg as any).joins?.some((sj: any) => sj.toTable === j.toTable);
                    return (
                      <div
                        key={idx}
                        onClick={() => {
                          const currentJoins: any[] = (cfg as any).joins || [];
                          if (isSelected) {
                            set('joins', currentJoins.filter((sj: any) => sj.toTable !== j.toTable));
                          } else {
                            set('joins', [...currentJoins, j]);
                          }
                        }}
                        style={{
                          padding: '12px 16px', background: isSelected ? 'var(--gl-10)' : 'var(--bg)',
                          color: isSelected ? 'var(--gl)' : 'var(--tx)',
                          borderRadius: 12, fontSize: 13, cursor: 'pointer',
                          border: `1px solid ${isSelected ? 'var(--gl)' : 'var(--bd)'}`,
                          display: 'flex', justifyContent: 'space-between', fontWeight: 600,
                          transition: 'all 0.2s'
                        }}
                      >
                        <span>🔗 {j.toTable}</span>
                        <span style={{ fontSize: 11, opacity: 0.6 }}>via {j.col}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Zone drop CSV / Dossier */}
        {sourceType === 'csv' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
            <div
              onClick={() => fileRef.current?.click()}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              style={{
                border: `2px dashed ${dragging || files.length ? m.color : 'var(--bd)'}`,
                borderRadius: 24, padding: '48px 24px', textAlign: 'center', cursor: 'pointer',
                background: files.length ? `${m.color}05` : 'transparent', transition: 'all .3s'
              }}
              onMouseEnter={e => !files.length && (e.currentTarget.style.borderColor = m.color)}
              onMouseLeave={e => !files.length && (e.currentTarget.style.borderColor = 'var(--bd)')}
            >
              <input
                ref={fileRef}
                type="file"
                accept=".csv,.tsv,.txt"
                multiple
                style={{ display: 'none' }}
                onChange={e => { const f = e.target.files; if (f) handleFiles(f); }}
              />
              <div style={{ fontSize: 48, marginBottom: 16 }}>{files.length ? '✅' : '📥'}</div>
              <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 8, color: 'var(--tx)' }}>
                {files.length ? `${files.length} fichier(s) sélectionnés` : t.onboarding.config.csv_drop}
              </div>
              <div style={{ fontSize: 13, color: 'var(--mu)', fontWeight: 400 }}>
                {files.length
                  ? `${(files.reduce((acc, f) => acc + f.size, 0) / 1024).toFixed(1)} KB à analyser`
                  : "Glissez vos fichiers ici ou cliquez pour parcourir"}
              </div>
            </div>

            <button
              type="button"
              onClick={(e) => { e.preventDefault(); folderRef.current?.click(); }}
              style={{
                background: 'var(--cd)', border: '1px solid var(--bd)', borderRadius: 16,
                padding: '12px', fontSize: 13, cursor: 'pointer', color: 'var(--tx)',
                fontWeight: 800, display: 'flex', gap: 10, alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--gl)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--bd)'}
            >
              <span>🗂️</span> Importer un dossier complet
            </button>
            <input
              ref={folderRef}
              type="file"
              /* @ts-ignore */
              webkitdirectory="true"
              directory="true"
              multiple
              style={{ display: 'none' }}
              onChange={e => { const f = e.target.files; if (f) handleFiles(f); }}
            />
          </div>
        )}

        {/* Tip */}
        {TIPS[sourceType] && (() => {
          const tip = TIPS[sourceType]!;
          return (
            <div style={{
              background: 'var(--cd)', border: `1px solid var(--bd)`,
              borderRadius: 20, padding: 20, marginBottom: 24, boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
            }}>
              <div style={{ color: tip.color, fontWeight: 900, marginBottom: 10, fontSize: 12, textTransform: 'uppercase', letterSpacing: '1px' }}>💡 {tip.title}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {tip.lines.map((l: any, i: number) =>
                  l.code
                    ? <code key={i} style={{ display: 'block', color: 'var(--gn)', background: 'var(--bg)', padding: '8px 12px', borderRadius: 8, fontFamily: 'var(--ff-mono)', fontSize: 11, margin: '4px 0', border: '1px solid var(--bd)' }}>{l.text}</code>
                    : <div key={i} style={{ fontSize: 13, color: 'var(--mu)', lineHeight: 1.6 }}>{l.bold ? <strong style={{ color: 'var(--tx)' }}>{l.text}</strong> : l.text}</div>
                )}
              </div>
            </div>
          );
        })()}

        {/* Erreur */}
        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: 16, padding: '16px 20px', marginBottom: 20,
            fontSize: 14, color: '#EF4444', fontWeight: 600, display: 'flex', gap: 12,
            flexDirection: 'column'
          }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <span style={{ fontSize: 18 }}>⚠️</span> <span>{error}</span>
            </div>
            {error.includes("identifiant de dataset") ? (
              <div style={{
                fontSize: 12, color: 'var(--mu)', marginTop: 8, fontWeight: 400,
                padding: '8px 12px', background: 'rgba(0,0,0,0.1)', borderRadius: 10,
                lineHeight: 1.5, borderLeft: '3px solid #EF4444'
              }}>
                <strong style={{ color: 'var(--tx)' }}>💡 Pourquoi cette erreur ?</strong> Les fichiers CSV sont stockés temporairement.
                Glissez-déposez à nouveau votre fichier ci-dessous pour restaurer la persistance.
              </div>
            ) : (
              <div style={{
                fontSize: 12, color: 'var(--mu)', marginTop: 8, fontWeight: 400,
                padding: '8px 12px', background: 'rgba(0,0,0,0.1)', borderRadius: 10,
                lineHeight: 1.5, borderLeft: '3px solid #EF4444'
              }}>
                <strong style={{ color: 'var(--tx)' }}>💡 Conseil :</strong> {
                  sourceType === 'gsheets' ? "Vérifiez que votre feuille est bien 'Publiée sur le web' au format CSV." :
                    sourceType === 'api' ? "Vérifiez l'URL de l'endpoint et assurez-vous que le serveur autorise les requêtes externes (CORS)." :
                      "Vérifiez vos identifiants de connexion et la disponibilité de la source distante."
                }
              </div>
            )}
          </div>
        )}

        {/* Bouton */}
        <button
          onClick={submit}
          disabled={loading}
          className="fu"
          style={{
            width: '100%', padding: 18, borderRadius: 16, border: 'none',
            background: loading ? 'var(--cd)' : `linear-gradient(135deg, ${m.color}, ${srcColorDark(m.color)})`,
            color: '#fff', fontSize: 16, fontWeight: 800, display: 'flex',
            alignItems: 'center', justifyContent: 'center', gap: 12,
            cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: loading ? 'none' : `0 10px 25px ${m.color}40`,
          }}
          onMouseEnter={e => !loading && (e.currentTarget.style.transform = 'translateY(-2px)', e.currentTarget.style.boxShadow = `0 8px 25px ${m.color}30`)}
          onMouseLeave={e => !loading && (e.currentTarget.style.transform = 'translateY(0)', e.currentTarget.style.boxShadow = `0 4px 20px rgba(0,0,0,0.15)`)}
        >
          {loading ? (
            <>
              <div className="spinner" style={{ width: 20, height: 20, borderTopColor: '#fff' }} />
              {t.onboarding.config.loading}
            </>
          ) : (
            <>
              {t.onboarding.config.load_btn}
              <span style={{ fontSize: 20 }}>→</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// Helper pour assombrir la couleur du gradient
function srcColorDark(hex: string) {
  // Version simplifiée pour le style
  return hex + 'cc';
}
