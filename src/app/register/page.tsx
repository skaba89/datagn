"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";

export default function RegisterPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [workspace, setWorkspace] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        if (password.length < 8) {
            setError("Le mot de passe doit contenir au moins 8 caractères.");
            setLoading(false);
            return;
        }

        if (password !== confirmPassword) {
            setError("Les mots de passe ne correspondent pas.");
            setLoading(false);
            return;
        }

        try {
            const res = await fetch("/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password, workspaceName: workspace }),
            });

            if (res.ok) {
                router.push("/login?registered=true");
            } else {
                const data = await res.json();
                setError(data.error || "Une erreur est survenue lors de l'inscription.");
            }
        } catch (err) {
            setError("Une erreur est survenue.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--bg)',
            padding: '20px',
            position: 'relative',
            overflow: 'hidden'
        }}>
            <div className="mesh-gradient-bg" />

            <div className="fu glass-panel" style={{
                width: '100%',
                maxWidth: '480px',
                borderRadius: '40px',
                padding: '50px 48px',
                position: 'relative',
                zIndex: 1,
                overflow: 'hidden',
                boxShadow: '0 50px 150px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(255,255,255,0.05)'
            }}>
                {/* Orbital Decoration */}
                <div style={{
                    position: 'absolute', bottom: -60, right: -60, width: 220, height: 220,
                    border: '1px dashed var(--gn-20)', borderRadius: '50%', opacity: 0.3,
                    animation: 'spin 45s infinite linear reverse'
                }} />

                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <div style={{
                        width: '70px', height: '70px',
                        background: 'linear-gradient(135deg, var(--gn), var(--gl))',
                        borderRadius: '20px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '36px',
                        margin: '0 auto 24px',
                        boxShadow: '0 12px 28px rgba(16, 185, 129, 0.3)',
                        animation: 'orbit 10s infinite ease-in-out'
                    }}>
                        💎
                    </div>
                    <h1 style={{
                        fontFamily: 'var(--ff-heading)',
                        fontSize: '30px',
                        color: 'var(--tx)',
                        fontWeight: 900,
                        marginBottom: '8px',
                        letterSpacing: '-1px'
                    }}>DataGN Elite</h1>
                    <p style={{ color: 'var(--mu)', fontSize: '15px', opacity: 0.8 }}>Créez votre compte SaaS Expert</p>
                </div>

                {error && (
                    <div style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        borderRadius: '8px',
                        padding: '12px',
                        color: '#ef4444',
                        fontSize: '13px',
                        marginBottom: '20px'
                    }}>⚠️ {error}</div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--mu)', textTransform: 'uppercase', marginBottom: '8px' }}>Nom complet</label>
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Jean Dupont"
                                style={{
                                    width: '100%', padding: '12px', background: 'var(--cd)', border: '1px solid var(--bd)', borderRadius: '8px', color: 'var(--tx)', fontSize: '14px'
                                }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--mu)', textTransform: 'uppercase', marginBottom: '8px' }}>Organisation</label>
                            <input
                                type="text"
                                required
                                value={workspace}
                                onChange={(e) => setWorkspace(e.target.value)}
                                placeholder="DataGN Africa"
                                style={{
                                    width: '100%', padding: '12px', background: 'var(--cd)', border: '1px solid var(--bd)', borderRadius: '8px', color: 'var(--tx)', fontSize: '14px'
                                }}
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--mu)', textTransform: 'uppercase', marginBottom: '8px' }}>Email professionnel</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="votre@organisation.com"
                            style={{
                                width: '100%', padding: '12px', background: 'var(--cd)', border: '1px solid var(--bd)', borderRadius: '8px', color: 'var(--tx)', fontSize: '14px'
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--mu)', textTransform: 'uppercase', marginBottom: '8px' }}>Mot de passe</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            style={{
                                width: '100%', padding: '12px', background: 'var(--cd)', border: '1px solid var(--bd)', borderRadius: '8px', color: 'var(--tx)', fontSize: '14px'
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: '32px' }}>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--mu)', textTransform: 'uppercase', marginBottom: '8px' }}>Confirmer le mot de passe</label>
                        <input
                            type="password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="••••••••"
                            style={{
                                width: '100%', padding: '12px', background: 'var(--cd)', border: '1px solid var(--bd)', borderRadius: '8px', color: 'var(--tx)', fontSize: '14px'
                            }}
                        />
                    </div>

                    <button
                        disabled={loading}
                        style={{
                            width: '100%', padding: '14px', background: loading ? 'var(--cd)' : 'var(--gl)', color: '#000', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s'
                        }}
                    >
                        {loading ? "Création en cours..." : "Créer le compte et démarrer →"}
                    </button>
                </form>

                <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '13px', color: 'var(--mu)' }}>
                    Vous avez déjà un compte ? <Link href="/login" style={{ color: 'var(--gn)', fontWeight: 600 }}>Se connecter</Link>
                </div>
            </div>
        </div>
    );
}
