'use client';

import { useState } from 'react';
import SettingsPanel from '@/components/SettingsPanel';
import BillingTab from "@/components/BillingTab";

export default function SettingsPage() {
    return (
        <div style={{ background: 'var(--bg)', minHeight: '100vh', color: 'var(--tx)' }}>
            <div style={{ padding: '32px 16px', maxWidth: 1200, margin: '0 auto' }}>
                <a href="/" style={{ color: 'var(--mu)', fontSize: 13, marginBottom: 20, display: 'inline-block' }}>← Retour au Dashboard</a>
                <div style={{ background: 'var(--sf)', borderRadius: 20, border: '1px solid var(--bd)', overflow: 'hidden' }}>
                    <SettingsPanel onSave={() => { }} />
                </div>
            </div>
        </div>
    );
}
