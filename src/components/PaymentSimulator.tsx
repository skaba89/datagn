'use client';

import { useState } from 'react';

interface Props {
    plan: string;
    onClose: () => void;
    onSuccess: () => void;
}

export default function PaymentSimulator({ plan, onClose, onSuccess }: Props) {
    const [step, setStep] = useState<'method' | 'processing' | 'success'>('method');
    const [method, setMethod] = useState<'stripe' | 'orange'>('stripe');

    const handlePay = () => {
        setStep('processing');
        setTimeout(() => {
            setStep('success');
            setTimeout(() => {
                onSuccess();
            }, 1500);
        }, 2000);
    };

    return (
        <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 5000,
            backdropFilter: 'blur(10px)'
        }}>
            <div style={{
                background: 'var(--sf)', padding: 40, borderRadius: 32, width: 440,
                border: '1px solid var(--bd)', boxShadow: '0 50px 100px rgba(0,0,0,0.5)',
                textAlign: 'center'
            }}>
                {step === 'method' && (
                    <>
                        <div style={{ fontSize: 40, marginBottom: 16 }}>💳</div>
                        <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 8 }}>Paiement Sécurisé</h2>
                        <p style={{ color: 'var(--mu)', fontSize: 14, marginBottom: 32 }}>Souscription au plan <strong style={{ color: 'var(--gl)' }}>{plan}</strong></p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
                            <button
                                onClick={() => setMethod('stripe')}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 16, padding: 16,
                                    background: method === 'stripe' ? 'rgba(237, 176, 37, 0.1)' : 'var(--cd)',
                                    border: `2px solid ${method === 'stripe' ? 'var(--gl)' : 'var(--bd)'}`,
                                    borderRadius: 16, cursor: 'pointer', transition: 'all 0.2s'
                                }}
                            >
                                <span style={{ fontSize: 24 }}>🏦</span>
                                <div style={{ textAlign: 'left' }}>
                                    <div style={{ fontWeight: 800, color: 'var(--tx)' }}>Carte Bancaire / Stripe</div>
                                    <div style={{ fontSize: 11, color: 'var(--mu)' }}>Visa, MasterCard, Amex</div>
                                </div>
                            </button>
                            <button
                                onClick={() => setMethod('orange')}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 16, padding: 16,
                                    background: method === 'orange' ? 'rgba(237, 176, 37, 0.1)' : 'var(--cd)',
                                    border: `2px solid ${method === 'orange' ? 'var(--gl)' : 'var(--bd)'}`,
                                    borderRadius: 16, cursor: 'pointer', transition: 'all 0.2s'
                                }}
                            >
                                <span style={{ fontSize: 24 }}>📱</span>
                                <div style={{ textAlign: 'left' }}>
                                    <div style={{ fontWeight: 800, color: 'var(--tx)' }}>Orange Money</div>
                                    <div style={{ fontSize: 11, color: 'var(--mu)' }}>Paiement mobile (Guinée)</div>
                                </div>
                            </button>
                        </div>

                        <div style={{ display: 'flex', gap: 12 }}>
                            <button
                                onClick={handlePay}
                                style={{
                                    flex: 2, padding: 16, background: 'var(--gl)', border: 'none',
                                    borderRadius: 16, color: '#000', fontWeight: 900, cursor: 'pointer'
                                }}
                            >PAYER MAINTENANT</button>
                            <button
                                onClick={onClose}
                                style={{
                                    flex: 1, padding: 16, background: 'transparent',
                                    border: '1px solid var(--bd)', borderRadius: 16, color: 'var(--mu)',
                                    fontWeight: 700, cursor: 'pointer'
                                }}
                            >ANNULER</button>
                        </div>
                    </>
                )}

                {step === 'processing' && (
                    <div style={{ padding: '40px 0' }}>
                        <div className="processing-spinner" style={{
                            width: 60, height: 60, border: '4px solid var(--bd)',
                            borderTopColor: 'var(--gl)', borderRadius: '50%',
                            margin: '0 auto 24px auto', animation: 'spin 1s linear infinite'
                        }} />
                        <h3 style={{ fontSize: 18, fontWeight: 800 }}>Traitement de la transaction...</h3>
                        <p style={{ color: 'var(--mu)', fontSize: 12, marginTop: 8 }}>Veuillez ne pas fermer cette fenêtre.</p>
                    </div>
                )}

                {step === 'success' && (
                    <div style={{ padding: '40px 0', animation: 'scaleUp 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}>
                        <div style={{
                            width: 80, height: 80, background: 'var(--gn)', borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 40, margin: '0 auto 24px auto', color: '#000'
                        }}>✓</div>
                        <h2 style={{ fontSize: 24, fontWeight: 900, color: 'var(--gn)' }}>Paiement Réussi !</h2>
                        <p style={{ color: 'var(--mu)', fontSize: 14, marginTop: 8 }}>Votre plan est maintenant actif. Bienvenue dans l'excellence.</p>
                    </div>
                )}
            </div>

            <style jsx>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes scaleUp { from { transform: scale(0.8); opacity: 0; } to { transform: scale(1); opacity: 1; } }
            `}</style>
        </div>
    );
}
