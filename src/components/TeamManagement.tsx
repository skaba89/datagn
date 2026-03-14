'use client';

import { useState, useEffect } from 'react';
import { useI18n } from '@/i18n/I18nContext';

interface Member {
    id: string;
    role: string;
    status: string;
    user: {
        id: string;
        name: string | null;
        email: string;
    };
}

const ROLES = [
    { id: 'OWNER', label: 'Propriétaire', desc: 'Contrôle total' },
    { id: 'ADMIN', label: 'Administrateur', desc: 'Gestion de l\'équipe et settings' },
    { id: 'EDITOR', label: 'Éditeur', desc: 'Peut créer et modifier des graphiques' },
    { id: 'VIEWER', label: 'Lecteur', desc: 'Lecture seule' },
];

export default function TeamManagement({ workspace }: { workspace: any }) {
    const { t } = useI18n();
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState('VIEWER');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            const res = await fetch('/api/workspace/members', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: inviteEmail, role: inviteRole })
            });

            const data = await res.json();
            if (res.ok) {
                setMessage({ type: 'success', text: 'Invitation envoyée avec succès !' });
                setInviteEmail('');
                window.location.reload(); // Recharger pour voir le nouveau membre
            } else {
                setMessage({ type: 'error', text: data.error || 'Erreur lors de l\'invitation.' });
            }
        } catch (e) {
            setMessage({ type: 'error', text: 'Erreur réseau.' });
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async (memberId: string) => {
        if (!confirm('Voulez-vous vraiment retirer ce membre ?')) return;

        try {
            const res = await fetch(`/api/workspace/members?id=${memberId}`, { method: 'DELETE' });
            if (res.ok) window.location.reload();
        } catch (e) {
            alert('Erreur lors de la suppression.');
        }
    };

    return (
        <div style={{ animation: 'fadeIn .2s forwards' }}>
            <h3 style={{ fontSize: 18, fontWeight: 900, marginBottom: 12 }}>Gestion de l'Équipe</h3>
            <p style={{ fontSize: 13, color: 'var(--mu)', marginBottom: 24 }}>
                Gérez les accès à votre espace de travail. Le nombre maximal de membres dépend de votre plan actuel.
            </p>

            {/* Invite Form */}
            <form onSubmit={handleInvite} style={{
                background: 'var(--cd)', padding: 20, borderRadius: 12, border: '1px solid var(--bd)',
                marginBottom: 32, display: 'flex', gap: 12, alignItems: 'flex-end'
            }}>
                <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--mu)', textTransform: 'uppercase', marginBottom: 8 }}>Email de l'invité</label>
                    <input
                        type="email"
                        required
                        value={inviteEmail}
                        onChange={e => setInviteEmail(e.target.value)}
                        placeholder="collaborateur@organisation.gn"
                        style={{ width: '100%', background: 'var(--sf)', border: '1px solid var(--bd)', borderRadius: 8, padding: 10, color: 'var(--tx)', fontSize: 13, outline: 'none' }}
                    />
                </div>
                <div style={{ width: 150 }}>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--mu)', textTransform: 'uppercase', marginBottom: 8 }}>Rôle</label>
                    <select
                        value={inviteRole}
                        onChange={e => setInviteRole(e.target.value)}
                        style={{ width: '100%', background: 'var(--sf)', border: '1px solid var(--bd)', borderRadius: 8, padding: 10, color: 'var(--tx)', fontSize: 13, outline: 'none', cursor: 'pointer' }}
                    >
                        {ROLES.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
                    </select>
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    style={{ padding: '10px 20px', background: 'var(--gl)', color: '#000', border: 'none', borderRadius: 8, fontWeight: 900, cursor: 'pointer', height: 40 }}
                >
                    {loading ? '...' : 'Inviter'}
                </button>
            </form>

            {message && (
                <div style={{
                    padding: 12, borderRadius: 8, marginBottom: 20, fontSize: 13, fontWeight: 600,
                    background: message.type === 'success' ? 'rgba(60,160,106,0.1)' : 'rgba(239,68,68,0.1)',
                    color: message.type === 'success' ? '#3CA06A' : '#EF4444',
                    border: `1px solid ${message.type === 'success' ? '#3CA06A' : '#EF4444'}`
                }}>
                    {message.text}
                </div>
            )}

            {/* Members List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {workspace?.members?.map((member: Member) => (
                    <div
                        key={member.id}
                        style={{
                            padding: 16, borderRadius: 12, background: 'var(--cd)', border: '1px solid var(--bd)',
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            transition: 'all .2s'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{
                                width: 36, height: 36, borderRadius: '50%', background: 'var(--gn)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 14
                            }}>
                                {member.user.name?.[0] || member.user.email[0].toUpperCase()}
                            </div>
                            <div>
                                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--tx)' }}>{member.user.name || 'Utilisateur'}</div>
                                <div style={{ fontSize: 12, color: 'var(--mu)' }}>{member.user.email}</div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--gl)', textTransform: 'uppercase' }}>{member.role}</div>
                                <div style={{ fontSize: 10, color: 'var(--mu)' }}>{member.status}</div>
                            </div>
                            {member.role !== 'OWNER' && (
                                <button
                                    onClick={() => handleRemove(member.id)}
                                    style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', fontSize: 16 }}
                                    title="Retirer"
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
