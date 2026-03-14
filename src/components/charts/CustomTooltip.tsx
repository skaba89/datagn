'use client';
// ────────────────────────────────────────────────────────────────
// CustomTooltip.tsx — Tooltip personnalisé pour Recharts
// ────────────────────────────────────────────────────────────────
import { TooltipProps } from 'recharts';

export function CustomTooltip({
  active,
  payload,
  label,
}: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;

  return (
    <div style={{
      background:   'var(--cd)',
      border:       '1px solid rgba(255,255,255,.1)',
      borderRadius: 8,
      padding:      '10px 14px',
      fontSize:     12,
      color:        'var(--tx)',
      boxShadow:    '0 8px 24px rgba(0,0,0,.5)',
    }}>
      {label && (
        <div style={{ color: 'var(--mu)', marginBottom: 6, fontSize: 10 }}>
          {String(label)}
        </div>
      )}
      {payload.map((entry, i) => (
        <div key={i} style={{
          display:    'flex',
          alignItems: 'center',
          gap:        8,
          marginBottom: i < payload.length - 1 ? 4 : 0,
        }}>
          <span style={{
            width: 8, height: 8,
            borderRadius: '50%',
            background: String(entry.color ?? '#3CA06A'),
            flexShrink: 0,
          }} />
          <span style={{ color: 'var(--mu)', flex: 1 }}>{entry.name}</span>
          <span style={{
            fontFamily: 'DM Mono, monospace',
            fontWeight: 700,
            color: String(entry.color ?? 'var(--tx)'),
          }}>
            {typeof entry.value === 'number'
              ? entry.value.toLocaleString('fr')
              : String(entry.value ?? '')}
          </span>
        </div>
      ))}
    </div>
  );
}
