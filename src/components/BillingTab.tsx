'use client';

import { useState, useEffect } from 'react';
import { useI18n } from '@/i18n/I18nContext';
import PaymentSimulator from './PaymentSimulator';

const PLANS_CONFIG = {
    STARTER: { name: 'Starter', price: 0, members: 3, storage: '500MB', color: '#3B82F6' },
    IMPACT: { name: 'Impact', price: 490000, members: 15, storage: '10GB', color: '#EDB025' }, // en GNF
    ENTERPRISE: { name: 'Enterprise', price: 1500000, members: '∞', storage: '100GB', color: '#3CA06A' } // en GNF
};

const CURRENCY_CONVERSION: Record<string, number> = {
    GNF: 1,
    USD: 1 / 8600,
    EUR: 1 / 9300,
    CFA: 1 / 13
};

export default function BillingTab() {
    const { t } = useI18n();
    const [workspace, setWorkspace] = useState<any>(null);
    const [showPay, setShowPay] = useState<string | null>(null);

    useEffect(() => {
        fetch('/api/workspace')
            .then(r => r.json())
            .then(data => setWorkspace(data));
    }, []);

    const currency = workspace?.currency || 'GNF';
    const rate = CURRENCY_CONVERSION[currency] || 1;

    const formatPrice = (price: number) => {
        if (price === 0) return '0';
        const converted = price * rate;
        if (currency === 'GNF') return converted.toLocaleString() + ' FG';
        return new Intl.NumberFormat('fr-FR', { style: 'currency', currency }).format(converted);
    };

    if (!workspace) return <div style={{ padding: 40, color: 'var(--mu)' }}>{t.billing.loading}</div>;

    const currentPlan = (workspace?.plan || 'STARTER') as keyof typeof PLANS_CONFIG;
    const stats = PLANS_CONFIG[currentPlan];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Current Plan Card */}
            <div style={{
                background: 'var(--sf)', border: '1px solid var(--bd)', borderRadius: 16, padding: 24,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
                <div>
                    <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--mu)', textTransform: 'uppercase', marginBottom: 8 }}>{t.billing.current_title}</div>
                    <div style={{ fontSize: 28, fontWeight: 900, color: stats.color }}>{stats.name}</div>
                    <div style={{ fontSize: 13, color: 'var(--mu)', marginTop: 4 }}>{t.billing.renewal}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 24, fontWeight: 900 }}>{formatPrice(stats.price)}<span style={{ fontSize: 13, color: 'var(--mu)' }}>{t.billing.mo}</span></div>
                    <div style={{ padding: '4px 12px', background: 'rgba(60,160,106,0.1)', color: '#3CA06A', borderRadius: 20, fontSize: 10, fontWeight: 800, marginTop: 8 }}>{t.billing.paid}</div>
                </div>
            </div>

            {/* Quotas & Usage */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                <QuotaCard label="Utilisateurs" used={workspace?.members?.length || 1} limit={stats.members} />
                <QuotaCard label="Stockage" used={workspace?.storageUsed || '0MB'} limit={stats.storage} />
            </div>

            {/* Upgrade Options */}
            <div style={{ marginTop: 20 }}>
                <div style={{ fontSize: 14, fontWeight: 900, marginBottom: 16 }}>{t.billing.upgrade_title}</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    {Object.entries(PLANS_CONFIG).map(([id, p]) => (
                        <div key={id} style={{ background: 'var(--cd)', border: '1px solid var(--bd)', borderRadius: 16, padding: 20 }}>
                            <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 10 }}>{t.billing.upgrade_to.replace('{plan}', p.name)}</div>
                            <ul style={{ paddingLeft: 20, fontSize: 12, color: 'var(--mu)', marginBottom: 20 }}>
                                <li>Jusqu'à {p.members} utilisateurs</li>
                                <li>{p.storage} de stockage</li>
                            </ul>
                            <button
                                onClick={() => setShowPay(id)}
                                style={{
                                    width: '100%', padding: 12, borderRadius: 8,
                                    background: id === currentPlan ? 'var(--mu)' : 'var(--gl)',
                                    border: 'none', color: '#000', fontWeight: 800,
                                    cursor: id === currentPlan ? 'default' : 'pointer'
                                }}
                                disabled={id === currentPlan}
                            >
                                {id === currentPlan ? t.billing.current_plan : t.billing.sub_btn.replace('${price}', formatPrice(p.price))}
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {showPay && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 5000,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <div style={{ background: 'var(--bg)', padding: 40, borderRadius: 24, textAlign: 'center', maxWidth: 400, border: '1px solid var(--bd)' }}>
                        <div style={{ fontSize: 40, marginBottom: 20 }}>💳</div>
                        <h2 style={{ fontSize: 20, fontWeight: 900, marginBottom: 16 }}>Prêt pour le passage à {showPay} ?</h2>
                        <p style={{ color: 'var(--mu)', marginBottom: 32, fontSize: 14 }}>Vous allez être redirigé vers Stripe pour finaliser votre paiement sécurisé.</p>
                        <div style={{ display: 'flex', gap: 12 }}>
                            <button
                                onClick={() => setShowPay(null)}
                                style={{ flex: 1, padding: 14, borderRadius: 12, background: 'var(--cd)', border: 'none', color: 'var(--tx)', fontWeight: 800 }}
                            >Annuler</button>
                            <button
                                onClick={async () => {
                                    try {
                                        const res = await fetch('/api/billing/checkout', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ plan: showPay, workspaceId: workspace.id })
                                        });
                                        const { url } = await res.json();
                                        if (url) window.location.href = url;
                                    } catch (err) {
                                        alert("Erreur lors de la redirection vers le paiement.");
                                    }
                                }}
                                style={{ flex: 1, padding: 14, borderRadius: 12, background: 'var(--gl)', border: 'none', color: '#000', fontWeight: 800 }}
                            >Payer maintenant</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function QuotaCard({ label, used, limit }: { label: string, used: any, limit: any }) {
    const p = typeof used === 'number' && typeof limit === 'number' ? (used / limit) * 100 : 100;
    return (
        <div style={{ background: 'var(--sf)', border: '1px solid var(--bd)', borderRadius: 12, padding: 16 }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--mu)', textTransform: 'uppercase', marginBottom: 12 }}>{label}</div>
            <div style={{ fontSize: 20, fontWeight: 900, marginBottom: 12 }}>{used} / {limit}</div>
            <div style={{ height: 4, background: 'var(--cd)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ width: `${Math.min(p, 100)}%`, height: '100%', background: p > 90 ? '#EF4444' : 'var(--gl)' }} />
            </div>
        </div>
    );
}
