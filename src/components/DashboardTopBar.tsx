'use client';

import { useState, useEffect } from 'react';
import { SourceType } from '@/lib/fetcher';
import LanguageSelector from './LanguageSelector';
import { useI18n } from '@/i18n/I18nContext';

interface Props {
    sourceType: SourceType;
    currentDbName: string;
    setCurrentDbName: (name: string) => void;
    syncing: boolean;
    saveLoading: boolean;
    exportLoading: boolean;
    readOnly?: boolean;
    isPublic?: boolean;
    shareToken?: string;
    onSave: () => void;
    onTogglePublic?: () => void;
    onExport: () => void;
    onReload: () => void;
    onExportCSV: () => void;
    onChangeSource: () => void;
    onShowSettings: () => void;
    savedDashboards?: any[];
    onLoadDashboard?: (dbId: string) => void;
    tabs?: { id: string, label: string, icon: string }[];
    activeTab?: string;
    onTabChange?: (tab: any) => void;
}

const SRC_ICON: Record<SourceType, string> = {
    gsheets: '📊',
    csv: '📎',
    kobo: '📱',
    api: '🔌',
    dhis2: '🏥',
    db: '🗄️'
};

export default function DashboardTopBar({
    sourceType,
    currentDbName,
    setCurrentDbName,
    syncing,
    saveLoading,
    exportLoading,
    readOnly = false,
    isPublic = false,
    shareToken,
    onSave,
    onTogglePublic,
    onExport,
    onReload,
    onExportCSV,
    onChangeSource,
    onShowSettings,
    savedDashboards = [],
    onLoadDashboard,
    tabs,
    activeTab,
    onTabChange
}: Props) {
    const { t } = useI18n();
    const [wsSettings, setWsSettings] = useState<any>(null);
    const [isMobile, setIsMobile] = useState(false);
    const [showMenu, setShowMenu] = useState(false);

    useEffect(() => {
        fetch('/api/workspace')
            .then(r => r.status === 401 ? null : r.json())
            .then(data => {
                if (data && data.settings) setWsSettings(data.settings);
            })
            .catch(() => { });

        const checkMobile = () => setIsMobile(window.innerWidth < 1024); // Increased threshold for tabs
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const copyLink = () => {
        if (!shareToken) return;
        const url = `${window.location.origin}/p/${shareToken}`;
        navigator.clipboard.writeText(url);
        alert(t.dashboard.public_link_copied);
    };

    const actionBtnStyle = (primary = false) => ({
        padding: '8px 14px',
        borderRadius: 10,
        fontSize: 12,
        fontWeight: 800,
        cursor: 'pointer',
        background: primary ? 'linear-gradient(135deg, var(--gn), var(--gl))' : 'rgba(255,255,255,0.04)',
        color: primary ? '#000' : 'var(--tx)',
        border: primary ? 'none' : '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        width: isMobile ? '100%' : 'auto',
        justifyContent: isMobile ? 'flex-start' : 'center',
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: primary ? '0 4px 15px rgba(16, 185, 129, 0.2)' : 'none',
        backdropFilter: 'blur(4px)',
    } as React.CSSProperties);

    return (
        <div
            className="fu glass-panel"
            style={{
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                padding: isMobile ? '8px 16px' : '0 24px',
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                position: 'relative',
                zIndex: 100,
                height: isMobile ? 'auto' : '64px',
                background: 'rgba(10, 20, 15, 0.7)',
                backdropFilter: 'blur(40px)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
            }}
        >
            {/* Logos & Titre */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                    width: 32, height: 32, borderRadius: 8, background: 'var(--gl)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 0 15px var(--gbg)'
                }}>
                    {wsSettings?.logo ? (
                        <img src={wsSettings.logo} alt="Logo" style={{ height: 18, maxWidth: 80, objectFit: 'contain' }} />
                    ) : (
                        <span style={{ fontSize: 18 }}>📊</span>
                    )}
                </div>
                {!isMobile && (
                    <div style={{ fontWeight: 900, fontSize: 16, letterSpacing: '-0.5px', color: 'var(--tx)' }}>
                        {wsSettings?.logo ? '' : 'Data'}<span style={{ color: 'var(--gl)' }}>{wsSettings?.logo ? wsSettings.name : 'GN'}</span>
                    </div>
                )}
            </div>

            {!isMobile && <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.1)', margin: '0 4px' }} />}

            {/* Navigation Tabs - THE REAL ELITE INTEGRATION */}
            {!isMobile && tabs && (
                <div style={{ display: 'flex', gap: 4, height: '100%', alignItems: 'center', margin: '0 auto' }}>
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange?.(tab.id)}
                            style={{
                                background: 'none',
                                border: 'none',
                                padding: '0 16px',
                                height: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                cursor: 'pointer',
                                position: 'relative',
                                color: activeTab === tab.id ? 'var(--tx)' : 'var(--mu)',
                                opacity: activeTab === tab.id ? 1 : 0.6,
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                fontSize: '11px',
                                fontWeight: activeTab === tab.id ? 900 : 600,
                                textTransform: 'uppercase',
                                letterSpacing: '1px'
                            }}
                        >
                            <span style={{ fontSize: 18 }}>{tab.icon}</span>
                            <span>{tab.label}</span>
                            {activeTab === tab.id && (
                                <div style={{
                                    position: 'absolute', bottom: 0, left: 10, right: 10, height: 3,
                                    background: 'var(--gn)', borderRadius: '3px 3px 0 0',
                                    boxShadow: '0 -2px 10px var(--gn)'
                                }} />
                            )}
                        </button>
                    ))}
                </div>
            )}

            {/* Status & Name (Desktop only) */}
            {!isMobile && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {syncing && (
                        <div style={{
                            width: 6, height: 6, borderRadius: '50%', background: 'var(--gl)',
                            boxShadow: '0 0 8px var(--gl)', animation: 'pulse 1.5s infinite'
                        }} />
                    )}
                    <div style={{
                        fontSize: '9px',
                        color: syncing ? 'var(--gl)' : 'var(--gn)',
                        padding: '3px 8px', borderRadius: '6px',
                        background: syncing ? 'rgba(251,191,36,0.1)' : 'rgba(16,185,129,0.1)',
                        border: `1px solid ${syncing ? 'rgba(251,191,36,0.2)' : 'rgba(16,185,129,0.2)'}`,
                        fontWeight: 900, letterSpacing: '1px'
                    }}>
                        {syncing ? 'SYNCING...' : '● LIVE'}
                    </div>

                    {!readOnly && (
                        <input
                            value={currentDbName || ''}
                            onChange={(e) => setCurrentDbName(e.target.value)}
                            style={{
                                background: 'transparent', border: 'none',
                                color: 'var(--tx)', fontSize: 13, fontWeight: 800,
                                padding: '4px 0', width: '120px', outline: 'none'
                            }}
                        />
                    )}
                </div>
            )}

            {/* Actions */}
            <div style={{ marginLeft: isMobile ? 'auto' : 0, display: 'flex', gap: 8, alignItems: 'center' }}>
                {!isMobile && <LanguageSelector />}
                {isMobile ? (
                    <>
                        <LanguageSelector />
                        <button
                            onClick={() => setShowMenu(!showMenu)}
                            style={{
                                background: showMenu ? 'var(--gn)' : 'rgba(255,255,255,0.05)',
                                border: '1px solid var(--bd)',
                                borderRadius: 12, padding: '10px 16px', color: showMenu ? '#000' : 'var(--tx)',
                                fontSize: 14, fontWeight: 800, transition: 'all 0.2s'
                            }}
                        >
                            {showMenu ? '✕' : t.dashboard.topbar.menu}
                        </button>
                    </>
                ) : (
                    <>
                        {!readOnly && (
                            <button
                                onClick={onSave}
                                disabled={saveLoading}
                                style={actionBtnStyle(true)}
                                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                {saveLoading ? '...' : `💾 ${t.common.save}`}
                            </button>
                        )}
                        {!readOnly && currentDbName !== (t.common.new_dashboard) && (
                            <button onClick={onTogglePublic} style={actionBtnStyle()}>{isPublic ? `🌐 ${t.dashboard.public}` : `🔒 ${t.dashboard.private}`}</button>
                        )}
                        <button onClick={onExport} disabled={exportLoading} style={actionBtnStyle()}>{exportLoading ? '...' : `📄 PDF`}</button>
                        <button onClick={onReload} title={t.dashboard.topbar.reload} style={{ ...actionBtnStyle(), padding: '10px' }}>🔄</button>
                        {!readOnly && (
                            <button onClick={onShowSettings} title="Paramètres" style={{ ...actionBtnStyle(), padding: '10px' }}>⚙️</button>
                        )}
                        {!readOnly && (
                            <button
                                onClick={onChangeSource}
                                style={{ ...actionBtnStyle(), color: 'var(--gn)', borderColor: 'rgba(16, 185, 129, 0.3)', background: 'rgba(16, 185, 129, 0.05)' }}
                            >
                                ⚡
                            </button>
                        )}
                    </>
                )}
            </div>

            {/* Mobile Dropdown Menu */}
            {isMobile && showMenu && (
                <div style={{
                    position: 'absolute', top: '100%', left: 0, right: 0,
                    background: 'var(--sf)', borderBottom: '1px solid var(--bd)',
                    padding: '16px', display: 'flex', flexDirection: 'column', gap: 10,
                    boxShadow: '0 10px 30px rgba(0,0,0,0.5)', animation: 'slideDown .2s ease-out'
                }}>
                    <div style={{ fontSize: 11, color: 'var(--mu)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>{t.dashboard.topbar.settings_title}</div>
                    {!readOnly && (
                        <input
                            value={currentDbName}
                            onChange={(e) => setCurrentDbName(e.target.value)}
                            style={{ background: 'var(--cd)', border: '1px solid var(--bd)', borderRadius: 8, padding: '10px', color: 'var(--tx)', fontSize: 14, marginBottom: 10 }}
                        />
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                        {!readOnly && <button onClick={() => { onSave(); setShowMenu(false); }} disabled={saveLoading} style={actionBtnStyle(true)}>{saveLoading ? '...' : `💾 ${t.common.save}`}</button>}
                        <button onClick={() => { onExport(); setShowMenu(false); }} disabled={exportLoading} style={actionBtnStyle()}>{exportLoading ? '...' : `📄 PDF`}</button>
                        <button onClick={() => { onExportCSV(); setShowMenu(false); }} style={actionBtnStyle()}>📥 CSV</button>
                        <button onClick={() => { onReload(); setShowMenu(false); }} style={actionBtnStyle()}>{`🔄 ${t.dashboard.topbar.reload}`}</button>
                        {!readOnly && currentDbName !== (t.common.new_dashboard) && (
                            <button onClick={() => { onTogglePublic?.(); setShowMenu(false); }} style={{ ...actionBtnStyle(), gridColumn: 'span 2' }}>{isPublic ? `🔒 ${t.dashboard.topbar.make_private}` : `🌐 ${t.dashboard.topbar.make_public}`}</button>
                        )}
                        {!readOnly && <button onClick={() => { onChangeSource(); setShowMenu(false); }} style={{ ...actionBtnStyle(), gridColumn: 'span 2', color: '#3CA06A', border: '1px solid rgba(60,160,106,.3)' }}>{`⚡ ${t.dashboard.topbar.change_source}`}</button>}
                    </div>
                </div>
            )}
        </div>
    );
}
