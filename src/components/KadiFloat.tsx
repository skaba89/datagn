'use client';
// ────────────────────────────────────────────────────────────────
// KadiFloat.tsx — Widget Kadi flottant (présent sur toutes les pages)
// ────────────────────────────────────────────────────────────────
import { useState, useRef, useEffect } from 'react';
import { kadiCall, KadiMessage } from '@/lib/kadi';
import { useI18n } from '@/i18n/I18nContext';

export default function KadiFloat() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [history, setHistory] = useState<KadiMessage[]>([]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const msgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (msgRef.current) msgRef.current.scrollTop = msgRef.current.scrollHeight;
  }, [history, thinking]);

  const send = async (text: string) => {
    if (!text.trim() || thinking) return;
    const userMsg: KadiMessage = { role: 'user', content: text };
    setHistory(h => [...h, userMsg]);
    setInput('');
    setThinking(true);
    try {
      const reply = await kadiCall([...history, userMsg].slice(-10));
      setHistory(h => [...h, { role: 'assistant', content: reply }]);
    } catch {
      setHistory(h => [...h, { role: 'assistant', content: t.kadi_float.error_conn }]);
    }
    setThinking(false);
  };

  const QUICK = [
    t.kadi_float.quick.prices,
    t.kadi_float.quick.demo,
    t.kadi_float.quick.connect
  ];

  return (
    <div style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 999 }}>
      {/* Bubble */}
      {open && (
        <div style={{
          position: 'absolute',
          bottom: 64,
          right: 0,
          width: 320,
          background: 'var(--sf)',
          border: '1px solid rgba(237,176,37,.22)',
          borderRadius: 16,
          boxShadow: '0 20px 60px rgba(0,0,0,.7)',
          overflow: 'hidden',
          animation: 'slideUp .22s ease',
          display: 'flex',
          flexDirection: 'column',
        }}>
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, var(--gn), var(--mg))',
            padding: '12px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}>
            <div style={{
              width: 34, height: 34,
              borderRadius: '50%',
              background: 'rgba(237,176,37,.18)',
              border: '2px solid rgba(237,176,37,.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 16,
              flexShrink: 0,
            }}>🤖</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: '#fff' }}>Kadi</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,.55)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#3CA06A', display: 'inline-block', animation: 'pulse 1.8s infinite' }} />
                {t.kadi_float.support_247}
              </div>
            </div>
            <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,.45)', fontSize: 18, cursor: 'pointer', lineHeight: 1 }}>×</button>
          </div>

          {/* Messages */}
          <div ref={msgRef} style={{ padding: 12, height: 260, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {history.length === 0 && (
              <div style={{
                background: 'var(--cd)', border: '1px solid var(--bd)',
                borderRadius: '10px 10px 10px 0', padding: '9px 12px',
                fontSize: 12, lineHeight: 1.7, alignSelf: 'flex-start', maxWidth: '85%',
                whiteSpace: 'pre-wrap'
              }}>
                {t.kadi_float.welcome}
              </div>
            )}
            {history.map((m, i) => (
              <div key={i} style={{
                maxWidth: '85%',
                padding: '9px 12px',
                borderRadius: m.role === 'user' ? '10px 10px 0 10px' : '10px 10px 10px 0',
                background: m.role === 'user' ? 'var(--gn)' : 'var(--cd)',
                border: `1px solid ${m.role === 'user' ? 'rgba(60,160,106,.3)' : 'var(--bd)'}`,
                alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                fontSize: 12,
                lineHeight: 1.7,
                whiteSpace: 'pre-wrap',
              }}>{m.content}</div>
            ))}
            {thinking && (
              <div style={{ display: 'flex', gap: 4, padding: '9px 12px', background: 'var(--cd)', border: '1px solid var(--bd)', borderRadius: '10px 10px 10px 0', alignSelf: 'flex-start', width: 'fit-content' }}>
                {[0, 200, 400].map(d => (
                  <span key={d} style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--gl)', display: 'inline-block', animation: `pulse 1.2s ${d}ms infinite` }} />
                ))}
              </div>
            )}
          </div>

          {/* Quick actions (avant le 1er message) */}
          {history.length === 0 && (
            <div style={{ padding: '0 10px 8px', display: 'flex', gap: 5, flexWrap: 'wrap' }}>
              {QUICK.map(q => (
                <button key={q} onClick={() => send(q)} style={{
                  padding: '4px 9px',
                  borderRadius: 12,
                  background: 'rgba(26,92,57,.2)',
                  border: '1px solid rgba(60,160,106,.2)',
                  color: '#3CA06A',
                  fontSize: 10,
                  cursor: 'pointer',
                  fontFamily: 'Sora, sans-serif',
                }}>{q}</button>
              ))}
            </div>
          )}

          {/* Input */}
          <div style={{ padding: '9px 10px', borderTop: '1px solid var(--bd)', display: 'flex', gap: 7 }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') send(input); }}
              placeholder={t.kadi_float.placeholder}
              style={{
                flex: 1, background: 'var(--cd)',
                border: '1px solid var(--bd)', borderRadius: 6,
                padding: '8px 10px', color: 'var(--tx)', fontSize: 12,
              }}
            />
            <button onClick={() => send(input)} style={{
              background: 'var(--gn)', border: 'none',
              borderRadius: 6, padding: '0 13px',
              color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer',
            }}>→</button>
          </div>
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--gn), var(--lg))',
          border: 'none',
          cursor: 'pointer',
          fontSize: 21,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 6px 20px rgba(26,92,57,.5)',
          animation: 'glow 3s ease-in-out infinite',
          transition: 'transform .2s',
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.08)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = ''; }}
      >
        {open ? '×' : '🤖'}
      </button>
    </div>
  );
}
