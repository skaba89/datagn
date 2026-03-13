'use client';

import { useState, useEffect, useRef } from 'react';
import { useI18n } from '@/i18n/I18nContext';
import TeamManagement from './TeamManagement';

interface WorkspaceSettings {
    logo?: string;
    primaryColor?: string;
    secondaryColor?: string;
    palette?: 'vibrant' | 'pastel' | 'cool' | 'trust';
    hideKadi?: boolean;
    disabledModules?: string[]; // ['map', 'quality', 'kadi']
}

const PALETTES = {
    vibrant: ['#3CA06A', '#EDB025', '#3B82F6', '#8B5CF6', '#EF4444', '#F97316'],
    pastel: ['#A7D7C5', '#F4D35E', '#A9D6E5', '#BDB2FF', '#FFADAD', '#FFD6A5'],
    cool: ['#004A99', '#007ACC', '#4DABF7', '#339AF0', '#228BE6', '#1C7ED6'],
    trust: ['#1A2B3C', '#2C3E50', '#34495E', '#5D6D7E', '#85929E', '#AEB6BF'],
};

export default function SettingsPanel({ onSave }: { onSave: () => void }) {
    const { t } = useI18n();
    const [activeTab, setActiveTab] = useState<'general' | 'branding' | 'modules' | 'team'>('general');
    const [workspace, setWorkspace] = useState<any>(null);
    const [name, setName] = useState('');
    const [currency, setCurrency] = useState('GNF');
    const [visualModel, setVisualModel] = useState('MODERN');
    const [theme, setTheme] = useState<'dark' | 'light'>('dark');
    const [palette, setPalette] = useState<'vibrant' | 'pastel' | 'cool' | 'trust'>('vibrant');
    const [settings, setSettings] = useState<WorkspaceSettings>({
        primaryColor: '#EDB025',
        secondaryColor: '#3CA06A',
        disabledModules: []
    });
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setLoading(true);
        fetch('/api/workspace')
            .then(r => r.json())
            .then(data => {
                if (data) {
                    setWorkspace(data);
                    setName(data.name || '');
                    setCurrency(data.currency || 'GNF');
                    setVisualModel(data.settings?.visualModel || 'MODERN');
                    setTheme(data.settings?.theme || 'dark');
                    setPalette(data.settings?.palette || 'vibrant');
                    if (data.settings) setSettings({
                        ...data.settings,
                        disabledModules: data.settings.disabledModules || []
                    });
                }
            })
            .finally(() => setLoading(false));
    }, []);

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            setSettings({ ...settings, logo: reader.result as string });
        };
        reader.readAsDataURL(file);
    };

    const toggleModule = (modId: string) => {
        const disabled = settings.disabledModules || [];
        if (disabled.includes(modId)) {
            setSettings({ ...settings, disabledModules: disabled.filter(m => m !== modId) });
        } else {
            setSettings({ ...disabled, disabledModules: [...disabled, modId] });
        }
    };

    const save = async () => {
        setSaving(true);
        try {
            const res = await fetch('/api/workspace', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    currency,
                    settings: { ...settings, palette, visualModel, theme }
                })
            });
            if (res.ok) {
                alert(t.settings.save_success);
                onSave();
                window.location.reload();
            }
        } catch (e) {
            alert(t.settings.save_error);
        } finally {
            setSaving(false);
        }
    };

    const TABS = [
        { id: 'general', label: t.settings.tab_general, icon: '🏠' },
        { id: 'branding', label: t.settings.tab_branding, icon: '🎨' },
        { id: 'modules', label: t.settings.tab_services, icon: '🔌' },
        { id: 'team', label: "Équipe", icon: '👥' },
    ] as const;

    if (loading) return <div style={{ padding: 40, color: 'var(--mu)', textAlign: 'center' }}>{t.settings.loading}</div>;

    return (
        <div style={{ display: 'flex', minHeight: 500, background: 'var(--sf)', borderRadius: 16, border: '1px solid var(--bd)', overflow: 'hidden' }}>
            {/* Sidebar Tabs */}
            <div style={{ width: 180, background: 'var(--cd)', borderRight: '1px solid var(--bd)', padding: '20px 0' }}>
                {TABS.map(tab => (
                    <div
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            padding: '12px 20px', cursor: 'pointer', fontSize: 13, fontWeight: 700,
                            color: activeTab === tab.id ? 'var(--gl)' : 'var(--mu)',
                            background: activeTab === tab.id ? 'rgba(237,176,37,.1)' : 'transparent',
                            borderLeft: `3px solid ${activeTab === tab.id ? 'var(--gl)' : 'transparent'}`,
                            display: 'flex', alignItems: 'center', gap: 10, transition: 'all .2s'
                        }}
                    >
                        <span>{tab.icon}</span> {tab.label}
                    </div>
                ))}
            </div>

            {/* Content Area */}
            <div style={{ flex: 1, padding: 32, display: 'flex', flexDirection: 'column' }}>
                <div style={{ flex: 1 }}>
                    {activeTab === 'general' && (
                        <div style={{ animation: 'fadeIn .2s forwards' }}>
                            <h3 style={{ fontSize: 18, fontWeight: 900, marginBottom: 24 }}>{t.settings.tab_general}</h3>
                            <div style={{ marginBottom: 24 }}>
                                <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--mu)', textTransform: 'uppercase', marginBottom: 8 }}>{t.settings.org_name}</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Ex: UNICEF Guinée / Mines S.A"
                                    style={{ width: '100%', background: 'var(--cd)', border: '1px solid var(--bd)', borderRadius: 8, padding: 12, color: 'var(--tx)', fontSize: 14, outline: 'none' }}
                                />
                            </div>

                            <div style={{ marginBottom: 24 }}>
                                <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: 'var(--mu)', textTransform: 'uppercase', marginBottom: 8 }}>Devise par défaut</label>
                                <select
                                    value={currency}
                                    onChange={(e) => setCurrency(e.target.value)}
                                    style={{ width: '100%', background: 'var(--cd)', border: '1px solid var(--bd)', borderRadius: 8, padding: 12, color: 'var(--tx)', fontSize: 14, outline: 'none', cursor: 'pointer' }}
                                >
                                    <option value="GNF">GNF (Franc Guinéen)</option>
                                    <option value="USD">USD (Dollar Américain)</option>
                                    <option value="EUR">EUR (Euro)</option>
                                    <option value="CFA">CFA (Franc CFA)</option>
                                </select>
                            </div>

                            <div style={{ marginBottom: 24 }}>
                                <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: 'var(--mu)', textTransform: 'uppercase', marginBottom: 8 }}>Style Visuel (BI Experience)</label>
                                <select
                                    value={visualModel}
                                    onChange={(e) => setVisualModel(e.target.value)}
                                    style={{ width: '100%', background: 'var(--cd)', border: '1px solid var(--bd)', borderRadius: 8, padding: 12, color: 'var(--tx)', fontSize: 14, outline: 'none', cursor: 'pointer' }}
                                >
                                    <option value="MODERN">Glass Modern (Datadog style)</option>
                                    <option value="NEON">Dark Neon (Cyberpunk/Control Room)</option>
                                    <option value="CORPORATE">Corporate Clean (Tableau/PowerBI)</option>
                                </select>
                            </div>
                        </div>
                    )}

                    {activeTab === 'branding' && (
                        <div style={{ animation: 'fadeIn .2s forwards' }}>
                            <h3 style={{ fontSize: 18, fontWeight: 900, marginBottom: 24 }}>{t.settings.tab_branding}</h3>

                            {/* Logo Section */}
                            <div style={{ marginBottom: 32 }}>
                                <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--mu)', textTransform: 'uppercase', marginBottom: 12 }}>{t.settings.logo_upload}</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                                    <div style={{
                                        width: 100, height: 100, borderRadius: 12, border: '2px dashed var(--bd)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--cd)',
                                        overflow: 'hidden'
                                    }}>
                                        {settings.logo ? (
                                            <img src={settings.logo} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                        ) : (
                                            <span style={{ fontSize: 24 }}>🖼️</span>
                                        )}
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            style={{ padding: '8px 16px', background: 'var(--gl)', color: '#000', border: 'none', borderRadius: 6, fontWeight: 700, cursor: 'pointer', fontSize: 12 }}
                                        >
                                            {t.settings.logo_upload}
                                        </button>
                                        <button
                                            onClick={() => setSettings({ ...settings, logo: '' })}
                                            style={{ padding: '8px 16px', background: 'transparent', color: '#EF4444', border: '1px solid #EF4444', borderRadius: 6, fontWeight: 700, cursor: 'pointer', fontSize: 12 }}
                                        >
                                            {t.common.cancel}
                                        </button>
                                        <input type="file" ref={fileInputRef} onChange={handleLogoUpload} accept="image/*" style={{ display: 'none' }} />
                                    </div>
                                </div>
                            </div>

                            {/* Flavor Section - Theme */}
                            <div style={{ marginBottom: 32 }}>
                                <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--mu)', textTransform: 'uppercase', marginBottom: 16 }}>Thème de l'interface</label>
                                <div style={{ display: 'flex', gap: 12 }}>
                                    {[
                                        { id: 'dark', label: 'Sombre (Nuit)', icon: '🌙' },
                                        { id: 'light', label: 'Clair (Jour)', icon: '☀️' }
                                    ].map(t => (
                                        <div
                                            key={t.id}
                                            onClick={() => setTheme(t.id as 'dark' | 'light')}
                                            style={{
                                                flex: 1, padding: 16, borderRadius: 12, border: `2px solid ${theme === t.id ? 'var(--gl)' : 'var(--bd)'}`,
                                                cursor: 'pointer', background: theme === t.id ? 'rgba(237,176,37,.05)' : 'var(--cd)',
                                                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8
                                            }}
                                        >
                                            <span style={{ fontSize: 24 }}>{t.icon}</span>
                                            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--tx)' }}>{t.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Color Section */}
                            <div style={{ marginBottom: 32 }}>
                                <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--mu)', textTransform: 'uppercase', marginBottom: 16 }}>{t.settings.chart_palette}</label>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                                    {(Object.keys(PALETTES) as Array<keyof typeof PALETTES>).map(p => (
                                        <div
                                            key={p}
                                            onClick={() => setSettings({ ...settings, palette: p })}
                                            style={{
                                                padding: 12, borderRadius: 12, border: `2px solid ${settings.palette === p ? 'var(--gl)' : 'var(--bd)'}`,
                                                cursor: 'pointer', background: settings.palette === p ? 'rgba(237,176,37,.05)' : 'var(--cd)',
                                                transition: 'all .2s'
                                            }}
                                        >
                                            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, textTransform: 'capitalize', color: 'var(--tx)' }}>{t.settings.palettes[p]}</div>
                                            <div style={{ display: 'flex', gap: 4 }}>
                                                {PALETTES[p].map(c => (
                                                    <div key={c} style={{ width: 14, height: 14, borderRadius: '50%', background: c }} />
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'modules' && (
                        <div style={{ animation: 'fadeIn .2s forwards' }}>
                            <h3 style={{ fontSize: 18, fontWeight: 900, marginBottom: 12 }}>{t.settings.modules_title}</h3>
                            <p style={{ fontSize: 13, color: 'var(--mu)', marginBottom: 24 }}>{t.settings.modules_desc}</p>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {[
                                    { id: 'kadi', label: t.settings.enable_kadi, icon: '🤖' },
                                    { id: 'map', label: t.settings.enable_map, icon: '🗺️' },
                                    { id: 'quality', label: t.settings.enable_quality, icon: '🛡️' },
                                ].map(mod => {
                                    const isEnabled = !settings.disabledModules?.includes(mod.id);
                                    return (
                                        <div
                                            key={mod.id}
                                            onClick={() => toggleModule(mod.id)}
                                            style={{
                                                padding: 16, borderRadius: 12, background: 'var(--cd)', border: '1px solid var(--bd)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer',
                                                transition: 'all .2s', opacity: isEnabled ? 1 : 0.6
                                            }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                <span style={{ fontSize: 20 }}>{mod.icon}</span>
                                                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--tx)' }}>{mod.label}</div>
                                            </div>
                                            <div style={{
                                                width: 44, height: 24, borderRadius: 12, background: isEnabled ? 'var(--gl)' : 'var(--dm)',
                                                position: 'relative', transition: 'background .3s'
                                            }}>
                                                <div style={{
                                                    width: 18, height: 18, borderRadius: '50%', background: isEnabled ? '#000' : 'var(--mu)',
                                                    position: 'absolute', top: 3, left: isEnabled ? 23 : 3, transition: 'all .3s'
                                                }} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {activeTab === 'team' && (
                        <TeamManagement workspace={workspace} />
                    )}
                </div>

                <button
                    onClick={save}
                    disabled={saving}
                    style={{
                        marginTop: 24, width: '100%', padding: 14, borderRadius: 10, border: 'none',
                        background: 'var(--gl)', color: '#000', fontWeight: 900, cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(237,176,37,.2)', transition: 'all .2s',
                        fontSize: 14
                    }}
                >
                    {saving ? t.common.saving : t.settings.save_btn}
                </button>
            </div>
        </div>
    );
}
