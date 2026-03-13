'use client';
// ────────────────────────────────────────────────────────────────
// KadiPanel.tsx — Panel Kadi IA complet
// ────────────────────────────────────────────────────────────────
import { useState, useRef, useEffect, useMemo } from 'react';
import { kadiCall, kadiReport, KadiMessage, ReportType } from '@/lib/kadi';
import { KpiData, VizData } from '@/lib/parser';
import { SourceType } from '@/lib/fetcher';
import { useI18n } from '@/i18n/I18nContext';

interface Props {
  sourceType: SourceType;
  rowCount: number;
  kpis: KpiData[];
  bars: VizData['bars'];
  dashboardId?: string;
  initialMessages?: KadiMessage[];
}

type PanelTab = 'tickets' | 'maintenance' | 'rapports';

interface Ticket {
  id: string;
  msg: string;
  status: 'en cours' | 'résolu';
  reply?: string;
}

const S = {
  card: {
    background: 'rgba(10, 20, 15, 0.4)',
    backdropFilter: 'blur(16px)',
    border: '1px solid var(--bd)',
    borderRadius: 24,
    overflow: 'hidden',
    boxShadow: '0 12px 40px rgba(0,0,0,0.3)',
  } as React.CSSProperties,
  inp: {
    flex: 1,
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid var(--bd)',
    borderRadius: 12,
    padding: '12px 16px',
    color: 'var(--tx)',
    fontSize: 13,
    outline: 'none',
    transition: 'all 0.2s',
  } as React.CSSProperties,
  sendBtn: {
    background: 'var(--gn)',
    border: 'none',
    borderRadius: 12,
    padding: '0 20px',
    color: '#000',
    fontSize: 14,
    fontWeight: 800,
    cursor: 'pointer',
    fontFamily: 'var(--ff-heading)',
    transition: 'all 0.2s',
    boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)',
  } as React.CSSProperties,
};

export default function KadiPanel({ sourceType, rowCount, kpis, bars, dashboardId, initialMessages }: Props) {
  const { t } = useI18n();

  // Chat
  const [msgs, setMsgs] = useState<KadiMessage[]>(initialMessages || []);
  const [chatInp, setChatInp] = useState('');
  const [docText, setDocText] = useState<string | null>(null);
  const [thinking, setThinking] = useState(false);
  const msgsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialMessages) setMsgs(initialMessages);
  }, [initialMessages]);

  const QUICK_ACTIONS = [
    t.kadi.quick_actions.analyze,
    t.kadi.quick_actions.anomalies,
    t.kadi.quick_actions.report,
    t.kadi.quick_actions.recommend,
  ];

  const MAINTENANCE_ITEMS = [
    { label: t.kadi.maintenance.items.source, desc: 'Connexion active' },
    { label: t.kadi.maintenance.items.parsing, desc: 'Colonnes détectées' },
    { label: t.kadi.maintenance.items.kpis, desc: 'Indicateurs prêts' },
    { label: t.kadi.maintenance.items.charts, desc: '4 visualisations actives' },
    { label: t.kadi.maintenance.items.ia, desc: 'API connectée' },
    { label: t.kadi.maintenance.items.export, desc: 'Disponible' },
  ];

  const REPORT_TYPES: { type: ReportType; icon: string; label: string; desc: string }[] = [
    { type: 'mensuel', icon: '📅', label: t.kadi.reports.types.monthly.label, desc: t.kadi.reports.types.monthly.desc },
    { type: 'alerte', icon: '⚠️', label: t.kadi.reports.types.alert.label, desc: t.kadi.reports.types.alert.desc },
    { type: 'donateur', icon: '🌍', label: t.kadi.reports.types.donor.label, desc: t.kadi.reports.types.donor.desc },
    { type: 'itie', icon: '⛏️', label: t.kadi.reports.types.itie.label, desc: t.kadi.reports.types.itie.desc },
  ];

  // Tabs
  const [panelTab, setPanelTab] = useState<PanelTab>('tickets');

  // Tickets
  const [tickets, setTickets] = useState<Ticket[]>([
    { id: 'T-001', msg: 'Connexion source vérifiée', status: 'résolu', reply: 'Connexion établie avec succès.' },
  ]);
  const [tktInp, setTktInp] = useState('');
  const tktCount = useRef(1);

  // Rapports
  const [rptType, setRptType] = useState<ReportType>('mensuel');
  const [rptOrg, setRptOrg] = useState('');
  const [rptPeriode, setRptPeriode] = useState('');
  const [rptText, setRptText] = useState('');
  const [rptLoading, setRptLoading] = useState(false);

  useEffect(() => {
    if (msgsRef.current) msgsRef.current.scrollTop = msgsRef.current.scrollHeight;
  }, [msgs, thinking]);

  // Context injecté dans chaque message Kadi
  const context = () => {
    const kpiStr = kpis.map(k => `${k.col}=${k.total.toFixed(0)}(${k.trend > 0 ? '+' : ''}${k.trend}%)`).join(', ');
    return `Source: ${sourceType} | Lignes: ${rowCount} | KPIs: ${kpiStr}`;
  };

  // ── CHAT ──────────────────────────────────────────────────────
  const sendChat = async (text: string) => {
    if (!text.trim() || thinking) return;
    const userMsg: KadiMessage = { role: 'user', content: text };
    setMsgs(m => [...m, userMsg]);
    setChatInp('');
    setThinking(true);
    try {
      const reply = await kadiCall([...msgs, userMsg].slice(-12), `${context()} | Extrait Document: ${docText ? docText.substring(0, 3000) : 'Aucun'}`, dashboardId);
      setMsgs(m => [...m, { role: 'assistant', content: reply }]);
    } catch (e: unknown) {
      setMsgs(m => [...m, { role: 'assistant', content: `⚠️ ${e instanceof Error ? e.message : t.common.error}` }]);
    }
    setThinking(false);
  };

  // ── TICKETS ───────────────────────────────────────────────────
  const addTicket = async () => {
    if (!tktInp.trim()) return;
    tktCount.current++;
    const id = `T-${String(tktCount.current).padStart(3, '0')}`;
    const msg = tktInp.trim();
    setTktInp('');
    setTickets(t => [...t, { id, msg, status: 'en cours' }]);
    try {
      const reply = await kadiCall([{
        role: 'user',
        content: `Ticket support: "${msg}"\n\nContexte: ${context()}\n\nDonne la solution concrète.`,
      }]);
      setTickets(t => t.map(tk => tk.id === id ? { ...tk, status: 'résolu', reply } : tk));
    } catch {
      setTickets(t => t.map(tk => tk.id === id ? { ...tk, status: 'résolu', reply: 'Contactez contact@datagn.com' } : tk));
    }
  };

  // ── RAPPORTS ──────────────────────────────────────────────────
  const genReport = async () => {
    setRptLoading(true);
    setRptText('');
    try {
      const text = await kadiReport({
        type: rptType,
        org: rptOrg || 'DataGN Client',
        periode: rptPeriode || 'Mars 2025',
        source: sourceType,
        rowCount,
        kpis,
        topCats: bars.slice(0, 5),
      });
      setRptText(text);
    } catch (e: unknown) {
      setRptText(`⚠️ ${e instanceof Error ? e.message : t.common.error}`);
    }
    setRptLoading(false);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, alignItems: 'start' }}>

      {/* ── CHAT ─────────────────────────────────────────────── */}
      <div style={{ ...S.card, display: 'flex', flexDirection: 'column', height: 580 }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, var(--gn), var(--mg))',
          padding: '13px 16px',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <div style={{
            width: 34, height: 34, borderRadius: '50%',
            background: 'rgba(237,176,37,.18)', border: '2px solid rgba(237,176,37,.35)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, flexShrink: 0,
          }}>🤖</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 13, color: '#fff' }}>{t.kadi.header_title}</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,.55)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#3CA06A', display: 'inline-block', animation: 'pulse 1.8s infinite' }} />
              {t.kadi.header_subtitle}
            </div>
          </div>
        </div>

        {/* Messages */}
        <div ref={msgsRef} style={{ flex: 1, padding: 20, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {msgs.length === 0 && (
            <div className="glass-card" style={{
              borderRadius: '24px 24px 24px 4px', padding: '16px 20px',
              fontSize: 13, lineHeight: 1.75, alignSelf: 'flex-start', maxWidth: '85%',
              border: '1px solid var(--bd)'
            }}>
              👋 {t.kadi.welcome.replace('{rows}', String(rowCount)).replace('{kpis}', String(kpis.length))}
            </div>
          )}
          {msgs.map((m, i) => (
            <div
              key={i}
              className="fu"
              style={{
                maxWidth: '85%',
                padding: '12px 18px',
                borderRadius: m.role === 'user' ? '24px 24px 4px 24px' : '24px 24px 24px 4px',
                background: m.role === 'user' ? 'var(--gn)' : 'rgba(255,255,255,0.04)',
                color: m.role === 'user' ? '#000' : 'var(--tx)',
                border: `1px solid ${m.role === 'user' ? 'transparent' : 'var(--bd)'}`,
                alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                fontSize: 13, lineHeight: 1.6, whiteSpace: 'pre-wrap',
                fontWeight: 500,
                boxShadow: m.role === 'user' ? '0 4px 12px rgba(16, 185, 129, 0.2)' : 'none'
              }}>{m.content}</div>
          ))}
          {thinking && (
            <div style={{ display: 'flex', gap: 6, padding: '12px 18px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--bd)', borderRadius: '24px 24px 24px 4px', alignSelf: 'flex-start', width: 'fit-content' }}>
              {[0, 200, 400].map(d => (
                <span key={d} style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--gn)', display: 'inline-block', animation: `pulse 1.2s ${d}ms infinite` }} />
              ))}
            </div>
          )}
        </div>

        {/* Quick actions */}
        {msgs.length === 0 && (
          <div style={{ padding: '0 20px 14px', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {QUICK_ACTIONS.map(q => (
              <button key={q} onClick={() => sendChat(q)} style={{
                padding: '6px 14px', borderRadius: 20,
                background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)',
                color: 'var(--gn)', fontSize: 11, cursor: 'pointer', fontFamily: 'var(--ff-heading)',
                fontWeight: 700, transition: 'all 0.2s'
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(16, 185, 129, 0.2)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(16, 185, 129, 0.1)'}
              >{q}</button>
            ))}
          </div>
        )}

        {/* Input */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid var(--bd)', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {docText && (
            <div style={{ fontSize: 10, background: 'rgba(60,160,106,0.1)', color: '#3CA06A', padding: '4px 10px', borderRadius: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>📄 Document analysé: {docText.substring(0, 30)}...</span>
              <button onClick={() => setDocText(null)} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', fontWeight: 800 }}>X</button>
            </div>
          )}
          <div style={{ display: 'flex', gap: 10 }}>
            <label style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 42, height: 42, background: 'rgba(255,255,255,0.03)',
              border: '1px solid var(--bd)', borderRadius: 12, cursor: 'pointer', fontSize: 18
            }}>
              📎
              <input
                type="file"
                accept=".pdf,.docx"
                style={{ display: 'none' }}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setThinking(true);
                  try {
                    const formData = new FormData();
                    formData.append('file', file);
                    const res = await fetch('/api/kadi/parse-doc', {
                      method: 'POST',
                      body: formData
                    });
                    const { text } = await res.json();
                    if (text) {
                      setDocText(text);
                      setMsgs(m => [...m, { role: 'assistant', content: `J'ai bien reçu votre document (${file.name}). Je l'utiliserai pour répondre à vos questions.` }]);
                    }
                  } catch (err) {
                    alert("Erreur lors de la lecture du document.");
                  }
                  setThinking(false);
                }}
              />
            </label>
            <input
              value={chatInp}
              onChange={e => setChatInp(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') sendChat(chatInp); }}
              placeholder={t.kadi.chat_placeholder}
              style={S.inp}
            />
            <button
              onClick={() => sendChat(chatInp)}
              style={S.sendBtn}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >→</button>
          </div>
        </div>
      </div>

      {/* ── PANNEAU DROIT ────────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {/* Tabs - Premium Horizontal Switch */}
        <div style={{
          display: 'flex', background: 'rgba(255,255,255,0.03)',
          borderRadius: 16, border: '1px solid var(--bd)',
          padding: 4, gap: 4, marginBottom: 14
        }}>
          {(['tickets', 'maintenance', 'rapports'] as PanelTab[]).map(tabKey => (
            <button key={tabKey} onClick={() => setPanelTab(tabKey)} style={{
              flex: 1, padding: '10px 8px',
              borderRadius: 12,
              background: panelTab === tabKey ? 'rgba(255,255,255,0.06)' : 'transparent',
              border: panelTab === tabKey ? '1px solid var(--bd)' : '1px solid transparent',
              color: panelTab === tabKey ? 'var(--tx)' : 'var(--mu)',
              fontSize: 12, fontWeight: panelTab === tabKey ? 800 : 500,
              cursor: 'pointer', fontFamily: 'var(--ff-heading)',
              textTransform: 'uppercase', letterSpacing: '0.5px',
              transition: 'all 0.2s'
            }}>
              {t.kadi.tabs[tabKey === 'rapports' ? 'reports' : tabKey]}
            </button>
          ))}
        </div>

        <div style={{
          background: 'var(--sf)', border: '1px solid var(--bd)',
          borderTop: 'none', borderRadius: '0 0 10px 10px',
          padding: 14, maxHeight: 548, overflowY: 'auto',
        }}>

          {/* ── TICKETS ─────────────────────────────────────── */}
          {panelTab === 'tickets' && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--mu)', textTransform: 'uppercase', letterSpacing: '.8px', marginBottom: 8 }}>
                {t.kadi.tickets.new}
              </div>
              <div style={{ display: 'flex', gap: 7, marginBottom: 14 }}>
                <input
                  value={tktInp}
                  onChange={e => setTktInp(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') addTicket(); }}
                  placeholder={t.kadi.tickets.placeholder}
                  style={S.inp}
                />
                <button onClick={addTicket} style={S.sendBtn}>→</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                {tickets.map(tk => (
                  <div key={tk.id} style={{
                    background: 'var(--cd)', border: '1px solid var(--bd)',
                    borderRadius: 9, padding: '11px 13px',
                  }}>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                      <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 9, color: 'var(--dm)' }}>{tk.id}</span>
                      <span style={{ fontSize: 12, flex: 1, color: 'var(--tx)' }}>{tk.msg}</span>
                      <span style={{
                        padding: '2px 7px', borderRadius: 9, fontSize: 9, fontWeight: 700,
                        background: tk.status === 'résolu' ? 'rgba(60,160,106,.1)' : 'rgba(237,176,37,.1)',
                        color: tk.status === 'résolu' ? '#3CA06A' : '#EDB025',
                      }}>{tk.status}</span>
                    </div>
                    {tk.status === 'en cours' && (
                      <div style={{ marginTop: 8, fontSize: 11, color: 'var(--mu)', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ width: 10, height: 10, border: '1.5px solid rgba(255,255,255,.15)', borderTop: '1.5px solid var(--gl)', borderRadius: '50%', display: 'inline-block', animation: 'spin 1s linear infinite' }} />
                        {t.kadi.tickets.solving}
                      </div>
                    )}
                    {tk.reply && tk.status === 'résolu' && (
                      <div style={{
                        marginTop: 8, background: 'rgba(26,92,57,.08)',
                        border: '1px solid rgba(60,160,106,.12)', borderRadius: 7,
                        padding: '8px 10px', fontSize: 11, lineHeight: 1.8, color: 'var(--tx)',
                      }}>
                        <div style={{ fontSize: 9, color: '#3CA06A', fontWeight: 700, marginBottom: 4 }}>{t.kadi.tickets.reply}</div>
                        {tk.reply}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── MAINTENANCE ─────────────────────────────────── */}
          {panelTab === 'maintenance' && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--mu)', textTransform: 'uppercase', letterSpacing: '.8px', marginBottom: 10 }}>
                {t.kadi.maintenance.title}
              </div>
              {MAINTENANCE_ITEMS.map(item => (
                <div key={item.label} style={{
                  display: 'flex', justifyContent: 'space-between',
                  alignItems: 'center', padding: '9px 11px',
                  background: 'var(--cd)', border: '1px solid var(--bd)',
                  borderRadius: 8, marginBottom: 7,
                }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600 }}>{item.label}</div>
                    <div style={{ fontSize: 10, color: 'var(--mu)' }}>{item.desc}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: '#3CA06A', fontWeight: 700 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#3CA06A', display: 'inline-block', animation: 'pulse 2s infinite' }} />
                    OK
                  </div>
                </div>
              ))}
              <div style={{
                background: 'rgba(26,92,57,.08)', border: '1px solid rgba(60,160,106,.14)',
                borderRadius: 9, padding: '13px 14px', marginTop: 4,
              }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#3CA06A', marginBottom: 7 }}>{t.kadi.maintenance.auto_monitor}</div>
                {(t.kadi.maintenance.checks || []).map((c: string) => (
                  <div key={c} style={{ fontSize: 11, color: 'var(--mu)', lineHeight: 2 }}>✓ {c}</div>
                ))}
              </div>
            </div>
          )}

          {/* ── RAPPORTS ────────────────────────────────────── */}
          {panelTab === 'rapports' && (
            <div>
              {/* Types rapport */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7, marginBottom: 10 }}>
                {REPORT_TYPES.map(rt => (
                  <button key={rt.type} onClick={() => setRptType(rt.type)} style={{
                    padding: '10px 10px', borderRadius: 8, cursor: 'pointer', textAlign: 'left',
                    border: `1px solid ${rptType === rt.type ? 'rgba(237,176,37,.35)' : 'var(--bd)'}`,
                    background: rptType === rt.type ? 'rgba(237,176,37,.07)' : 'var(--cd)',
                    fontFamily: 'Sora, sans-serif',
                  }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: rptType === rt.type ? 'var(--gl)' : 'var(--tx)' }}>{rt.icon} {rt.label}</div>
                    <div style={{ fontSize: 9, color: 'var(--mu)', marginTop: 2 }}>{rt.desc}</div>
                  </button>
                ))}
              </div>

              {/* Infos */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7, marginBottom: 9 }}>
                {[
                  { val: rptOrg, set: setRptOrg, ph: t.kadi.reports.org_placeholder },
                  { val: rptPeriode, set: setRptPeriode, ph: t.kadi.reports.period_placeholder },
                ].map(f => (
                  <input key={f.ph} value={f.val} onChange={e => f.set(e.target.value)}
                    placeholder={f.ph} style={{ ...S.inp, marginBottom: 0 }} />
                ))}
              </div>

              {/* Bouton */}
              <button onClick={genReport} disabled={rptLoading} style={{
                width: '100%', padding: 12, borderRadius: 9, border: 'none',
                background: 'linear-gradient(135deg, var(--gn), var(--lg))',
                color: '#fff', fontSize: 13, fontWeight: 700, cursor: rptLoading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                opacity: rptLoading ? 0.7 : 1, marginBottom: 10, fontFamily: 'Sora, sans-serif',
              }}>
                {rptLoading ? (
                  <><span style={{ width: 13, height: 13, border: '2px solid rgba(255,255,255,.2)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spin 1s linear infinite', display: 'inline-block' }} /> {t.kadi.reports.loading}</>
                ) : t.kadi.reports.gen_btn}
              </button>

              {/* Résultat */}
              {rptText && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#3CA06A' }}>{t.kadi.reports.success}</span>
                    <button onClick={() => navigator.clipboard.writeText(rptText)} style={{
                      padding: '3px 9px', borderRadius: 5,
                      border: '1px solid rgba(237,176,37,.3)', background: 'rgba(237,176,37,.07)',
                      color: 'var(--gl)', fontSize: 10, fontWeight: 700, cursor: 'pointer', fontFamily: 'Sora, sans-serif',
                    }}>{t.kadi.reports.copy_btn}</button>
                  </div>
                  <div style={{
                    background: 'var(--cd)', border: '1px solid var(--bd)', borderRadius: 8,
                    padding: 13, fontSize: 11, lineHeight: 1.85, whiteSpace: 'pre-wrap',
                    color: 'var(--tx)', maxHeight: 280, overflowY: 'auto',
                  }}>{rptText}</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
