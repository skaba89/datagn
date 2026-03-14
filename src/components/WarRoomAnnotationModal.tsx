import React, { useState } from 'react';

interface Props {
    point: string;
    currentDbId: string | undefined;
    onClose: () => void;
    onSuccess: (savedNote: any) => void;
}

export default function WarRoomAnnotationModal({ point, currentDbId, onClose, onSuccess }: Props) {
    const [noteText, setNoteText] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!noteText.trim()) return;
        setLoading(true);

        const newNote = {
            dashboardId: currentDbId || 'temp-db',
            point,
            text: noteText,
            user: 'Directeur',
        };

        try {
            const res = await fetch('/api/annotations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newNote),
            });

            if (res.ok) {
                const savedNote = await res.json();
                onSuccess(savedNote);
                onClose();
            } else {
                alert("Erreur lors de la synchronisation de l'annotation.");
            }
        } catch (e) {
            console.error(e);
            alert("Erreur de communication.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(5, 14, 8, 0.85)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 3000,
                backdropFilter: 'blur(12px)',
            }}
        >
            <div
                style={{
                    background: 'var(--sf)',
                    padding: 32,
                    borderRadius: 24,
                    width: 400,
                    border: '1px solid var(--bd)',
                    boxShadow: '0 40px 80px rgba(0,0,0,0.6)',
                }}
            >
                <div style={{ fontSize: 32, marginBottom: 16 }}>📝</div>
                <h3 style={{ fontSize: 20, fontWeight: 900, marginBottom: 8, letterSpacing: '-0.5px' }}>
                    Annotation Stratégique
                </h3>
                <p style={{ fontSize: 13, color: 'var(--mu)', marginBottom: 20 }}>
                    Point analytique : <strong style={{ color: 'var(--gl)' }}>{point}</strong>
                </p>

                <textarea
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="Ex: 'Action requise : Analyse des causes de la baisse de production...'"
                    style={{
                        width: '100%',
                        height: 120,
                        background: 'var(--cd)',
                        border: '1px solid var(--bd)',
                        borderRadius: 12,
                        padding: 14,
                        color: 'var(--tx)',
                        fontSize: 13,
                        marginBottom: 24,
                        resize: 'none',
                        outline: 'none',
                        transition: 'border 0.2s',
                    }}
                    onFocus={(e) => ((e.target as HTMLTextAreaElement).style.borderColor = 'var(--gl)')}
                    onBlur={(e) => ((e.target as HTMLTextAreaElement).style.borderColor = 'var(--bd)')}
                />

                <div style={{ display: 'flex', gap: 12 }}>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        style={{
                            flex: 1,
                            padding: 14,
                            background: loading ? 'var(--cd)' : 'var(--gl)',
                            border: 'none',
                            borderRadius: 12,
                            color: '#000',
                            fontWeight: 800,
                            cursor: loading ? 'not-allowed' : 'pointer',
                            transition: 'transform 0.1s',
                        }}
                        onMouseDown={(e) => {
                            if (!loading) e.currentTarget.style.transform = 'scale(0.98)';
                        }}
                        onMouseUp={(e) => {
                            if (!loading) e.currentTarget.style.transform = 'scale(1)';
                        }}
                    >
                        {loading ? '...' : 'PUBLIER'}
                    </button>
                    <button
                        onClick={onClose}
                        style={{
                            flex: 1,
                            padding: 14,
                            background: 'transparent',
                            border: '1px solid var(--bd)',
                            borderRadius: 12,
                            color: 'var(--mu)',
                            fontWeight: 600,
                            cursor: 'pointer',
                        }}
                    >
                        ANNULER
                    </button>
                </div>
            </div>
        </div>
    );
}
