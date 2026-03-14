'use client';

import { useState, useRef, useCallback } from 'react';
import { Row, VizData, prettyName } from '@/lib/parser';
import { useI18n } from '@/i18n/I18nContext';

// ============================================
// Types
// ============================================

interface ReportSection {
  id: string;
  title: string;
  enabled: boolean;
  order: number;
}

interface ReportConfig {
  title: string;
  subtitle: string;
  author: string;
  organization: string;
  logo?: string;
  sections: ReportSection[];
  theme: 'dark' | 'light' | 'professional';
  includeTableOfContents: boolean;
  includePageNumbers: boolean;
  dateFormat: string;
  currency: string;
}

interface EnhancedReportGeneratorProps {
  data: Row[];
  viz: VizData;
  dbName: string;
  onClose: () => void;
  currency?: string;
}

// ============================================
// Default Report Configuration
// ============================================

const DEFAULT_SECTIONS: ReportSection[] = [
  { id: 'cover', title: 'Page de Couverture', enabled: true, order: 1 },
  { id: 'executive', title: 'Résumé Exécutif', enabled: true, order: 2 },
  { id: 'kpis', title: 'Indicateurs Clés', enabled: true, order: 3 },
  { id: 'trends', title: 'Analyse des Tendances', enabled: true, order: 4 },
  { id: 'categories', title: 'Distribution par Catégorie', enabled: true, order: 5 },
  { id: 'insights', title: 'Insights IA', enabled: true, order: 6 },
  { id: 'data', title: 'Données Détaillées', enabled: false, order: 7 },
  { id: 'appendix', title: 'Annexes', enabled: false, order: 8 },
];

// ============================================
// PDF Report Generator Class
// ============================================

class PDFReportBuilder {
  private config: ReportConfig;
  private data: Row[];
  private viz: VizData;

  constructor(config: ReportConfig, data: Row[], viz: VizData) {
    this.config = config;
    this.data = data;
    this.viz = viz;
  }

  // Generate report content as formatted text/blob for download
  generateContent(): string {
    const lines: string[] = [];
    
    // Cover
    if (this.config.sections.find(s => s.id === 'cover')?.enabled) {
      lines.push(this.generateCover());
    }

    // Table of Contents
    if (this.config.includeTableOfContents) {
      lines.push(this.generateTOC());
    }

    // Executive Summary
    if (this.config.sections.find(s => s.id === 'executive')?.enabled) {
      lines.push(this.generateExecutiveSummary());
    }

    // KPIs
    if (this.config.sections.find(s => s.id === 'kpis')?.enabled) {
      lines.push(this.generateKPIs());
    }

    // Trends
    if (this.config.sections.find(s => s.id === 'trends')?.enabled) {
      lines.push(this.generateTrends());
    }

    // Categories
    if (this.config.sections.find(s => s.id === 'categories')?.enabled) {
      lines.push(this.generateCategories());
    }

    // Insights
    if (this.config.sections.find(s => s.id === 'insights')?.enabled) {
      lines.push(this.generateInsights());
    }

    // Data Table
    if (this.config.sections.find(s => s.id === 'data')?.enabled) {
      lines.push(this.generateDataTable());
    }

    return lines.join('\n\n');
  }

  private generateCover(): string {
    return `
═══════════════════════════════════════════════════════════════════════════════
                            ${this.config.title.toUpperCase()}
═══════════════════════════════════════════════════════════════════════════════

${this.config.subtitle}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Auteur: ${this.config.author}
Organisation: ${this.config.organization}
Date: ${new Date().toLocaleDateString('fr-FR', { 
  weekday: 'long', 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric' 
})}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Généré par DataGN - Plateforme de Visualisation de Données
`;
  }

  private generateTOC(): string {
    const enabledSections = this.config.sections
      .filter(s => s.enabled)
      .sort((a, b) => a.order - b.order);

    return `
┌─────────────────────────────────────────────────────────────────────────────┐
│                           TABLE DES MATIÈRES                                 │
├─────────────────────────────────────────────────────────────────────────────┤
${enabledSections.map((s, i) => `│  ${i + 1}. ${s.title.padEnd(60)}│`).join('\n')}
└─────────────────────────────────────────────────────────────────────────────┘
`;
  }

  private generateExecutiveSummary(): string {
    const totalRecords = this.data.length;
    const kpiCount = this.viz.kpis.length;
    const topKPI = this.viz.kpis[0];
    const growthKPIs = this.viz.kpis.filter(k => k.trend > 0).length;
    const declineKPIs = this.viz.kpis.filter(k => k.trend < 0).length;

    return `
╔═════════════════════════════════════════════════════════════════════════════╗
║                            RÉSUMÉ EXÉCUTIF                                   ║
╠═════════════════════════════════════════════════════════════════════════════╣
║                                                                             ║
║  📊 Volume de données analysé: ${totalRecords.toLocaleString().padEnd(40)}║
║  📈 Nombre d'indicateurs: ${kpiCount.toString().padEnd(45)}║
║  ✅ KPIs en croissance: ${growthKPIs.toString().padEnd(46)}║
║  ⚠️  KPIs en baisse: ${declineKPIs.toString().padEnd(49)}║
║                                                                             ║
${topKPI ? `║  💎 Indicateur principal: ${(prettyName(topKPI.col) + ': ' + topKPI.total.toLocaleString()).padEnd(51)}║` : ''}
║                                                                             ║
${topKPI && topKPI.trend !== undefined ? `║  📊 Tendance globale: ${(topKPI.trend >= 0 ? '+' : '') + topKPI.trend.toFixed(1) + '%'.padEnd(49)}║` : ''}
║                                                                             ║
╚═════════════════════════════════════════════════════════════════════════════╝
`;
  }

  private generateKPIs(): string {
    const kpiLines = this.viz.kpis.map((k, i) => {
      const trendIcon = k.trend >= 0 ? '📈' : '📉';
      const trendStr = `${k.trend >= 0 ? '+' : ''}${k.trend.toFixed(1)}%`;
      return `  ${i + 1}. ${(prettyName(k.col)).padEnd(30)} ${k.total.toLocaleString().padStart(15)}  ${trendIcon} ${trendStr}`;
    });

    return `
┌─────────────────────────────────────────────────────────────────────────────┐
│                          INDICATEURS CLÉS (KPIs)                             │
├─────────────────────────────────────────────────────────────────────────────┤
│  #   Indicateur                              Valeur         Tendance        │
├─────────────────────────────────────────────────────────────────────────────┤
${kpiLines.join('\n')}
└─────────────────────────────────────────────────────────────────────────────┘
`;
  }

  private generateTrends(): string {
    const recentData = this.viz.series.slice(-7);
    const trendLines = recentData.map((s, i) => {
      const value = s[this.viz.numCols[0]] || 0;
      return `  ${(s._label || `Période ${i + 1}`).padEnd(20)} │ ${typeof value === 'number' ? value.toLocaleString().padStart(12) : String(value).padStart(12)}`;
    });

    return `
┌─────────────────────────────────────────────────────────────────────────────┐
│                          ANALYSE DES TENDANCES                               │
├─────────────────────────────────────────────────────────────────────────────┤
│  Période               │ Valeur                                              │
├─────────────────────────────────────────────────────────────────────────────┤
${trendLines.join('\n')}
└─────────────────────────────────────────────────────────────────────────────┘
`;
  }

  private generateCategories(): string {
    const catLines = this.viz.bars.slice(0, 10).map((b, i) => {
      const percentage = ((b.value / this.viz.bars.reduce((s, x) => s + x.value, 0)) * 100).toFixed(1);
      const bar = '█'.repeat(Math.round(parseFloat(percentage) / 5));
      return `  ${(i + 1).toString().padStart(2)}. ${(b.name).slice(0, 25).padEnd(25)} ${b.value.toLocaleString().padStart(10)}  ${percentage.padStart(6)}%  ${bar}`;
    });

    return `
┌─────────────────────────────────────────────────────────────────────────────┐
│                       DISTRIBUTION PAR CATÉGORIE                             │
├─────────────────────────────────────────────────────────────────────────────┤
│  #   Catégorie                     Valeur       Part                        │
├─────────────────────────────────────────────────────────────────────────────┤
${catLines.join('\n')}
└─────────────────────────────────────────────────────────────────────────────┘
`;
  }

  private generateInsights(): string {
    const insights: string[] = [];
    
    // Growth insight
    const growingKPIs = this.viz.kpis.filter(k => k.trend > 5);
    if (growingKPIs.length > 0) {
      insights.push(`✅ ${growingKPIs.length} indicateur(s) en forte croissance (+5% ou plus)`);
    }

    // Decline insight
    const decliningKPIs = this.viz.kpis.filter(k => k.trend < -5);
    if (decliningKPIs.length > 0) {
      insights.push(`⚠️ ${decliningKPIs.length} indicateur(s) en baisse significative (-5% ou plus)`);
    }

    // Top performer
    const topPerformer = this.viz.bars[0];
    if (topPerformer) {
      insights.push(`🏆 "${topPerformer.name}" est la catégorie la plus performante`);
    }

    // Data quality
    insights.push(`📊 Analyse basée sur ${this.data.length.toLocaleString()} enregistrements`);

    return `
┌─────────────────────────────────────────────────────────────────────────────┐
│                            INSIGHTS AUTOMATISÉS                              │
├─────────────────────────────────────────────────────────────────────────────┤
${insights.map(i => `│  ${i.padEnd(75)}│`).join('\n')}
└─────────────────────────────────────────────────────────────────────────────┘
`;
  }

  private generateDataTable(): string {
    const headers = Object.keys(this.data[0] || {}).slice(0, 6);
    const rows = this.data.slice(0, 20);
    
    const headerLine = headers.map(h => h.padEnd(15)).join(' │ ');
    const separator = headers.map(() => '─'.repeat(15)).join('─┼─');
    const dataLines = rows.map(row => 
      headers.map(h => String(row[h] || '').slice(0, 15).padEnd(15)).join(' │ ')
    );

    return `
┌─────────────────────────────────────────────────────────────────────────────┐
│                            DONNÉES DÉTAILLÉES                                │
├─────────────────────────────────────────────────────────────────────────────┤
│  ${headerLine}                                                              │
│  ${separator}                                                              │
${dataLines.map(l => `│  ${l}                                                              │`).join('\n')}
│  ... et ${Math.max(0, this.data.length - 20)} lignes supplémentaires                                        │
└─────────────────────────────────────────────────────────────────────────────┘
`;
  }
}

// ============================================
// Main Component
// ============================================

export default function EnhancedReportGenerator({
  data,
  viz,
  dbName,
  onClose,
  currency = 'GNF',
}: EnhancedReportGeneratorProps) {
  const { t, language } = useI18n();
  const [config, setConfig] = useState<ReportConfig>({
    title: dbName,
    subtitle: 'Rapport d\'Analyse de Données',
    author: '',
    organization: '',
    sections: DEFAULT_SECTIONS,
    theme: 'dark',
    includeTableOfContents: true,
    includePageNumbers: true,
    dateFormat: 'DD/MM/YYYY',
    currency,
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'content' | 'style' | 'preview'>('content');

  // Toggle section
  const toggleSection = useCallback((sectionId: string) => {
    setConfig(prev => ({
      ...prev,
      sections: prev.sections.map(s => 
        s.id === sectionId ? { ...s, enabled: !s.enabled } : s
      ),
    }));
  }, []);

  // Move section
  const moveSection = useCallback((sectionId: string, direction: 'up' | 'down') => {
    setConfig(prev => {
      const sections = [...prev.sections];
      const idx = sections.findIndex(s => s.id === sectionId);
      if (idx === -1) return prev;
      
      const newIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (newIdx < 0 || newIdx >= sections.length) return prev;
      
      [sections[idx].order, sections[newIdx].order] = [sections[newIdx].order, sections[idx].order];
      return { ...prev, sections: sections.sort((a, b) => a.order - b.order) };
    });
  }, []);

  // Generate PDF (text format for now)
  const generatePDF = useCallback(async () => {
    setIsGenerating(true);
    try {
      const builder = new PDFReportBuilder(config, data, viz);
      const content = builder.generateContent();
      
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${config.title.replace(/\s+/g, '_')}_rapport.txt`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      alert('Erreur lors de la génération du rapport');
    } finally {
      setIsGenerating(false);
    }
  }, [config, data, viz]);

  // Export CSV
  const exportCSV = useCallback(() => {
    const headers = Object.keys(data[0] || {});
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(h => `"${row[h] || ''}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${config.title.replace(/\s+/g, '_')}_donnees.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [config.title, data]);

  // Export JSON
  const exportJSON = useCallback(() => {
    const exportData = {
      metadata: {
        title: config.title,
        author: config.author,
        organization: config.organization,
        generatedAt: new Date().toISOString(),
        recordCount: data.length,
      },
      kpis: viz.kpis,
      data: data.slice(0, 1000), // Limit for performance
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${config.title.replace(/\s+/g, '_')}_export.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [config, data, viz.kpis]);

  // Export Excel (CSV format compatible)
  const exportExcel = useCallback(() => {
    // Generate a more Excel-friendly CSV with BOM
    const headers = Object.keys(data[0] || {});
    const BOM = '\uFEFF'; // UTF-8 BOM for Excel
    const csvContent = [
      headers.join(';'),
      ...data.map(row => headers.map(h => `"${row[h] || ''}"`).join(';'))
    ].join('\n');
    
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${config.title.replace(/\s+/g, '_')}_donnees.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
  }, [config.title, data]);

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.9)',
      backdropFilter: 'blur(20px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      padding: 20,
    }}>
      <div style={{
        background: 'linear-gradient(135deg, rgba(20, 30, 25, 0.98), rgba(10, 15, 12, 0.99))',
        borderRadius: 32,
        border: '1px solid rgba(255, 255, 255, 0.1)',
        width: '100%',
        maxWidth: 900,
        maxHeight: '90vh',
        overflow: 'hidden',
        boxShadow: '0 50px 100px rgba(0, 0, 0, 0.8)',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '24px 32px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'rgba(255, 255, 255, 0.02)',
        }}>
          <div>
            <h2 style={{ 
              fontSize: 22, 
              fontWeight: 900, 
              color: '#fff', 
              margin: 0,
              letterSpacing: '-0.5px',
            }}>
              📄 Générateur de Rapport Pro
            </h2>
            <p style={{ 
              fontSize: 12, 
              color: 'rgba(255, 255, 255, 0.4)', 
              margin: '4px 0 0 0',
            }}>
              Créez des rapports professionnels en quelques clics
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: 'rgba(255, 255, 255, 0.5)',
              cursor: 'pointer',
              fontSize: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
            }}
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          gap: 4,
          padding: '16px 32px',
          background: 'rgba(255, 255, 255, 0.01)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        }}>
          {[
            { id: 'content', label: '📝 Contenu', icon: '📝' },
            { id: 'style', label: '🎨 Style', icon: '🎨' },
            { id: 'preview', label: '👁️ Aperçu', icon: '👁️' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                padding: '12px 24px',
                borderRadius: 12,
                fontSize: 13,
                fontWeight: 800,
                background: activeTab === tab.id 
                  ? 'rgba(16, 185, 129, 0.15)' 
                  : 'transparent',
                color: activeTab === tab.id ? '#10B981' : 'rgba(255, 255, 255, 0.5)',
                border: activeTab === tab.id 
                  ? '1px solid rgba(16, 185, 129, 0.3)' 
                  : '1px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div style={{
          flex: 1,
          overflow: 'auto',
          padding: '24px 32px',
        }}>
          {activeTab === 'content' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Title & Author */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: 11,
                    fontWeight: 800,
                    color: 'rgba(255, 255, 255, 0.5)',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    marginBottom: 8,
                  }}>
                    Titre du Rapport
                  </label>
                  <input
                    value={config.title}
                    onChange={e => setConfig(prev => ({ ...prev, title: e.target.value }))}
                    style={{
                      width: '100%',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: 12,
                      padding: '14px 18px',
                      color: '#fff',
                      fontSize: 15,
                      fontWeight: 700,
                      outline: 'none',
                    }}
                    placeholder="Rapport d'Analyse"
                  />
                </div>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: 11,
                    fontWeight: 800,
                    color: 'rgba(255, 255, 255, 0.5)',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    marginBottom: 8,
                  }}>
                    Sous-titre
                  </label>
                  <input
                    value={config.subtitle}
                    onChange={e => setConfig(prev => ({ ...prev, subtitle: e.target.value }))}
                    style={{
                      width: '100%',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: 12,
                      padding: '14px 18px',
                      color: '#fff',
                      fontSize: 15,
                      fontWeight: 700,
                      outline: 'none',
                    }}
                    placeholder="Analyse des données"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: 11,
                    fontWeight: 800,
                    color: 'rgba(255, 255, 255, 0.5)',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    marginBottom: 8,
                  }}>
                    Auteur
                  </label>
                  <input
                    value={config.author}
                    onChange={e => setConfig(prev => ({ ...prev, author: e.target.value }))}
                    style={{
                      width: '100%',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: 12,
                      padding: '14px 18px',
                      color: '#fff',
                      fontSize: 14,
                      outline: 'none',
                    }}
                    placeholder="Votre nom"
                  />
                </div>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: 11,
                    fontWeight: 800,
                    color: 'rgba(255, 255, 255, 0.5)',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    marginBottom: 8,
                  }}>
                    Organisation
                  </label>
                  <input
                    value={config.organization}
                    onChange={e => setConfig(prev => ({ ...prev, organization: e.target.value }))}
                    style={{
                      width: '100%',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: 12,
                      padding: '14px 18px',
                      color: '#fff',
                      fontSize: 14,
                      outline: 'none',
                    }}
                    placeholder="Votre organisation"
                  />
                </div>
              </div>

              {/* Sections */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.02)',
                borderRadius: 20,
                padding: 20,
                border: '1px solid rgba(255, 255, 255, 0.05)',
              }}>
                <div style={{
                  fontSize: 13,
                  fontWeight: 800,
                  color: 'rgba(255, 255, 255, 0.7)',
                  marginBottom: 16,
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                }}>
                  Sections du Rapport
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {config.sections.sort((a, b) => a.order - b.order).map(section => (
                    <div
                      key={section.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: '12px 16px',
                        background: section.enabled 
                          ? 'rgba(16, 185, 129, 0.08)' 
                          : 'rgba(255, 255, 255, 0.02)',
                        borderRadius: 12,
                        border: `1px solid ${section.enabled ? 'rgba(16, 185, 129, 0.2)' : 'transparent'}`,
                        transition: 'all 0.2s',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={section.enabled}
                        onChange={() => toggleSection(section.id)}
                        style={{ width: 18, height: 18, cursor: 'pointer' }}
                      />
                      <span style={{
                        flex: 1,
                        fontSize: 14,
                        fontWeight: 600,
                        color: section.enabled ? '#fff' : 'rgba(255, 255, 255, 0.4)',
                      }}>
                        {section.title}
                      </span>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button
                          onClick={() => moveSection(section.id, 'up')}
                          style={{
                            padding: '4px 8px',
                            borderRadius: 6,
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: 'none',
                            color: 'rgba(255, 255, 255, 0.4)',
                            cursor: 'pointer',
                            fontSize: 12,
                          }}
                        >
                          ↑
                        </button>
                        <button
                          onClick={() => moveSection(section.id, 'down')}
                          style={{
                            padding: '4px 8px',
                            borderRadius: 6,
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: 'none',
                            color: 'rgba(255, 255, 255, 0.4)',
                            cursor: 'pointer',
                            fontSize: 12,
                          }}
                        >
                          ↓
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'style' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Theme Selection */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: 11,
                  fontWeight: 800,
                  color: 'rgba(255, 255, 255, 0.5)',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  marginBottom: 12,
                }}>
                  Thème du Rapport
                </label>
                <div style={{ display: 'flex', gap: 12 }}>
                  {[
                    { id: 'dark', label: '🌙 Sombre', color: '#1a1a1a' },
                    { id: 'light', label: '☀️ Clair', color: '#ffffff' },
                    { id: 'professional', label: '💼 Professionnel', color: '#2d3748' },
                  ].map(theme => (
                    <button
                      key={theme.id}
                      onClick={() => setConfig(prev => ({ ...prev, theme: theme.id as any }))}
                      style={{
                        flex: 1,
                        padding: '16px 20px',
                        borderRadius: 16,
                        background: config.theme === theme.id 
                          ? 'rgba(16, 185, 129, 0.15)' 
                          : 'rgba(255, 255, 255, 0.03)',
                        border: config.theme === theme.id 
                          ? '2px solid rgba(16, 185, 129, 0.5)' 
                          : '2px solid transparent',
                        color: '#fff',
                        cursor: 'pointer',
                        fontSize: 14,
                        fontWeight: 700,
                        transition: 'all 0.2s',
                      }}
                    >
                      {theme.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Options */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.02)',
                borderRadius: 20,
                padding: 20,
                border: '1px solid rgba(255, 255, 255, 0.05)',
              }}>
                <div style={{
                  fontSize: 13,
                  fontWeight: 800,
                  color: 'rgba(255, 255, 255, 0.7)',
                  marginBottom: 16,
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                }}>
                  Options
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    cursor: 'pointer',
                  }}>
                    <input
                      type="checkbox"
                      checked={config.includeTableOfContents}
                      onChange={e => setConfig(prev => ({ 
                        ...prev, 
                        includeTableOfContents: e.target.checked 
                      }))}
                      style={{ width: 18, height: 18 }}
                    />
                    <span style={{ color: 'rgba(255, 255, 255, 0.7)', fontWeight: 600 }}>
                      Inclure la table des matières
                    </span>
                  </label>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    cursor: 'pointer',
                  }}>
                    <input
                      type="checkbox"
                      checked={config.includePageNumbers}
                      onChange={e => setConfig(prev => ({ 
                        ...prev, 
                        includePageNumbers: e.target.checked 
                      }))}
                      style={{ width: 18, height: 18 }}
                    />
                    <span style={{ color: 'rgba(255, 255, 255, 0.7)', fontWeight: 600 }}>
                      Inclure les numéros de page
                    </span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'preview' && (
            <div style={{
              background: '#0a0f0c',
              borderRadius: 16,
              padding: 24,
              border: '1px solid rgba(255, 255, 255, 0.05)',
              fontFamily: 'monospace',
              fontSize: 12,
              color: 'rgba(255, 255, 255, 0.8)',
              maxHeight: 400,
              overflow: 'auto',
              whiteSpace: 'pre-wrap',
            }}>
              {new PDFReportBuilder(config, data, viz).generateContent()}
            </div>
          )}
        </div>

        {/* Footer with Actions */}
        <div style={{
          display: 'flex',
          gap: 12,
          padding: '24px 32px',
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
          background: 'rgba(255, 255, 255, 0.02)',
        }}>
          <button
            onClick={generatePDF}
            disabled={isGenerating}
            style={{
              flex: 2,
              padding: '16px 24px',
              borderRadius: 16,
              background: 'linear-gradient(135deg, #10B981, #059669)',
              border: 'none',
              color: '#fff',
              fontSize: 14,
              fontWeight: 900,
              cursor: isGenerating ? 'not-allowed' : 'pointer',
              opacity: isGenerating ? 0.7 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              boxShadow: '0 10px 30px rgba(16, 185, 129, 0.3)',
              transition: 'all 0.2s',
            }}
          >
            📄 {isGenerating ? 'Génération...' : 'Générer Rapport PDF'}
          </button>
          <button
            onClick={exportExcel}
            style={{
              flex: 1,
              padding: '16px 24px',
              borderRadius: 16,
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: '#10B981',
              fontSize: 14,
              fontWeight: 800,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            📊 Excel
          </button>
          <button
            onClick={exportCSV}
            style={{
              flex: 1,
              padding: '16px 24px',
              borderRadius: 16,
              background: 'rgba(251, 191, 36, 0.1)',
              border: '1px solid rgba(251, 191, 36, 0.3)',
              color: '#FBBF24',
              fontSize: 14,
              fontWeight: 800,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            📝 CSV
          </button>
          <button
            onClick={exportJSON}
            style={{
              flex: 1,
              padding: '16px 24px',
              borderRadius: 16,
              background: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              color: '#3B82F6',
              fontSize: 14,
              fontWeight: 800,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            📋 JSON
          </button>
        </div>
      </div>
    </div>
  );
}
