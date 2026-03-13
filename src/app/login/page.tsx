"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const [loading, setLoading] = useState(false);
    const [devEmail, setDevEmail] = useState("admin@datagn.com");
    const [devMode, setDevMode] = useState(false);
    const [isDev, setIsDev] = useState(false);
    const [password, setPassword] = useState("");
    const [isRegistered, setIsRegistered] = useState(false);
    const [authMethod, setAuthMethod] = useState<'sso' | 'local'>('sso');
    const router = useRouter();

    useEffect(() => {
        setIsDev(process.env.NODE_ENV !== "production");
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('registered')) setIsRegistered(true);
    }, []);

    const handleSSO = async () => {
        setLoading(true);
        await signIn("keycloak", { callbackUrl: "/" });
    };

    const handleLocalLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const res = await signIn("credentials", {
            email: devEmail,
            password: password,
            redirect: false
        });

        if (res?.error) {
            setLoading(false);
            alert("Erreur de connexion : " + (res.error === "CredentialsSignin" ? "Identifiants invalides" : res.error));
        } else {
            window.location.href = "/";
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
                maxWidth: '460px',
                borderRadius: '40px',
                padding: '48px',
                textAlign: 'center',
                position: 'relative',
                zIndex: 1,
                overflow: 'hidden',
                boxShadow: '0 50px 150px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(255,255,255,0.05)'
            }}>
                <div style={{
                    width: '64px', height: '64px',
                    background: 'linear-gradient(135deg, var(--gn), var(--gl))',
                    borderRadius: '20px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '32px',
                    margin: '0 auto 24px',
                    boxShadow: '0 10px 25px rgba(245, 158, 11, 0.3)',
                }}>
                    💎
                </div>

                <h1 style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: '28px',
                    color: 'var(--tx)',
                    fontWeight: 900,
                    marginBottom: '8px',
                    letterSpacing: '-1px'
                }}>DataGN Workspace</h1>

                <p style={{ color: 'var(--mu)', fontSize: '13px', lineHeight: 1.6, marginBottom: '32px' }}>
                    Authentification sécurisée requise
                </p>

                {/* Tabs Selector */}
                <div style={{
                    display: 'flex',
                    background: 'var(--cd)',
                    padding: '4px',
                    borderRadius: '14px',
                    marginBottom: '32px',
                    border: '1px solid var(--bd)'
                }}>
                    <button
                        onClick={() => setAuthMethod('sso')}
                        style={{
                            flex: 1, padding: '10px', borderRadius: '10px', fontSize: '12px', fontWeight: 800,
                            cursor: 'pointer', border: 'none', transition: 'all 0.2s',
                            background: authMethod === 'sso' ? 'var(--bg)' : 'transparent',
                            color: authMethod === 'sso' ? 'var(--gl)' : 'var(--mu)',
                            boxShadow: authMethod === 'sso' ? '0 4px 10px rgba(0,0,0,0.2)' : 'none'
                        }}
                    >
                        🔐 SSO (Entreprise)
                    </button>
                    <button
                        onClick={() => setAuthMethod('local')}
                        style={{
                            flex: 1, padding: '10px', borderRadius: '10px', fontSize: '12px', fontWeight: 800,
                            cursor: 'pointer', border: 'none', transition: 'all 0.2s',
                            background: authMethod === 'local' ? 'var(--bg)' : 'transparent',
                            color: authMethod === 'local' ? 'var(--gl)' : 'var(--mu)',
                            boxShadow: authMethod === 'local' ? '0 4px 10px rgba(0,0,0,0.2)' : 'none'
                        }}
                    >
                        👤 Direct (Email/Pass)
                    </button>
                </div>

                {isRegistered && (
                    <div style={{
                        background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)',
                        borderRadius: '12px', padding: '12px', color: 'var(--gn)', fontSize: '12px', marginBottom: '20px'
                    }}>
                        🎉 Compte créé ! Connectez-vous ci-dessous.
                    </div>
                )}

                {authMethod === 'sso' ? (
                    <div style={{ animation: 'fadeIn 0.3s forwards' }}>
                        <button
                            onClick={handleSSO}
                            disabled={loading}
                            style={{
                                width: '100%', padding: '16px',
                                background: loading ? 'var(--cd)' : 'var(--tx)',
                                color: loading ? 'var(--mu)' : 'var(--bg)',
                                border: 'none', borderRadius: '14px',
                                fontSize: '15px', fontWeight: 700,
                                cursor: loading ? 'default' : 'pointer',
                                transition: 'all 0.2s',
                                boxShadow: loading ? 'none' : '0 8px 20px rgba(255,255,255,0.05)'
                            }}
                        >
                            {loading ? 'Redirection...' : 'Continuer avec Keycloak'}
                        </button>
                        <p style={{ marginTop: 24, fontSize: 11, color: 'var(--mu)', fontStyle: 'italic' }}>
                            Utilisez le badge de votre organisation pour vous connecter.
                        </p>
                    </div>
                ) : (
                    <form onSubmit={handleLocalLogin} style={{ textAlign: 'left', animation: 'fadeIn 0.3s forwards' }}>
                        <div style={{ marginBottom: 16 }}>
                            <label style={{ display: 'block', fontSize: 11, color: 'var(--mu)', fontWeight: 800, marginBottom: 8, textTransform: 'uppercase' }}>Email Professionnel</label>
                            <input
                                type="email"
                                required
                                value={devEmail}
                                onChange={e => setDevEmail(e.target.value)}
                                style={{
                                    width: '100%', padding: '14px',
                                    background: 'var(--cd)', border: '1px solid var(--bd)',
                                    borderRadius: '12px', color: 'var(--tx)', fontSize: '14px', outline: 'none'
                                }}
                                placeholder="exemple@entreprise.com"
                            />
                        </div>
                        <div style={{ marginBottom: 24 }}>
                            <label style={{ display: 'block', fontSize: 11, color: 'var(--mu)', fontWeight: 800, marginBottom: 8, textTransform: 'uppercase' }}>Mot de passe</label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                style={{
                                    width: '100%', padding: '14px',
                                    background: 'var(--cd)', border: '1px solid var(--bd)',
                                    borderRadius: '12px', color: 'var(--tx)', fontSize: '14px', outline: 'none'
                                }}
                                placeholder="••••••••"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: '100%', padding: '16px',
                                background: 'var(--gn)', color: '#000',
                                border: 'none', borderRadius: '14px',
                                fontSize: '15px', fontWeight: 900, cursor: 'pointer',
                                boxShadow: '0 8px 20px var(--gn-20)'
                            }}
                        >
                            {loading ? 'Vérification...' : 'Se connecter'}
                        </button>
                    </form>
                )}

                <div style={{ marginTop: '40px', fontSize: '11px', color: 'var(--mu)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                    <div style={{ display: 'inline-block', width: 6, height: 6, background: '#3CA06A', borderRadius: '50%' }} />
                    Système Datagn v2.4 Safe-Gate
                </div>
            </div>
        </div>
    );
}
