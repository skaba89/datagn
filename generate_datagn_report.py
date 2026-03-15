#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
DataGN - Analyse et Propositions d'Amélioration
Rapport technique généré automatiquement
"""

from reportlab.lib.pagesizes import A4
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, ListFlowable, ListItem
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
from reportlab.lib import colors
from reportlab.lib.units import cm, inch
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase.pdfmetrics import registerFontFamily
import os

# Register fonts
pdfmetrics.registerFont(TTFont('SimHei', '/usr/share/fonts/truetype/chinese/SimHei.ttf'))
pdfmetrics.registerFont(TTFont('Microsoft YaHei', '/usr/share/fonts/truetype/chinese/msyh.ttf'))
pdfmetrics.registerFont(TTFont('Times New Roman', '/usr/share/fonts/truetype/english/Times-New-Roman.ttf'))
pdfmetrics.registerFont(TTFont('DejaVuSans', '/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf'))

# Register font families for bold support
registerFontFamily('Microsoft YaHei', normal='Microsoft YaHei', bold='Microsoft YaHei')
registerFontFamily('SimHei', normal='SimHei', bold='SimHei')
registerFontFamily('Times New Roman', normal='Times New Roman', bold='Times New Roman')

# Colors
PRIMARY_COLOR = colors.HexColor('#10B981')
SECONDARY_COLOR = colors.HexColor('#FBBF24')
HEADER_BG = colors.HexColor('#1F4E79')
LIGHT_GRAY = colors.HexColor('#F5F5F5')
DARK_TEXT = colors.HexColor('#1F2937')

def create_styles():
    styles = getSampleStyleSheet()
    
    # Title style
    styles.add(ParagraphStyle(
        name='MainTitle',
        fontName='Microsoft YaHei',
        fontSize=28,
        textColor=PRIMARY_COLOR,
        alignment=TA_CENTER,
        spaceAfter=30,
        leading=36
    ))
    
    # Subtitle style
    styles.add(ParagraphStyle(
        name='Subtitle',
        fontName='SimHei',
        fontSize=14,
        textColor=DARK_TEXT,
        alignment=TA_CENTER,
        spaceAfter=20,
        leading=20
    ))
    
    # Section heading (H1)
    styles.add(ParagraphStyle(
        name='SectionHeading',
        fontName='Microsoft YaHei',
        fontSize=16,
        textColor=PRIMARY_COLOR,
        alignment=TA_LEFT,
        spaceBefore=24,
        spaceAfter=12,
        leading=22,
        leftIndent=0
    ))
    
    # Subsection heading (H2)
    styles.add(ParagraphStyle(
        name='SubsectionHeading',
        fontName='Microsoft YaHei',
        fontSize=13,
        textColor=HEADER_BG,
        alignment=TA_LEFT,
        spaceBefore=16,
        spaceAfter=8,
        leading=18,
        leftIndent=0
    ))
    
    # Body text
    styles.add(ParagraphStyle(
        name='CNBodyText',
        fontName='SimHei',
        fontSize=10.5,
        textColor=DARK_TEXT,
        alignment=TA_LEFT,
        spaceBefore=0,
        spaceAfter=8,
        leading=18,
        firstLineIndent=20,
        wordWrap='CJK'
    ))
    
    # Code style
    styles.add(ParagraphStyle(
        name='CodeText',
        fontName='DejaVuSans',
        fontSize=9,
        textColor=DARK_TEXT,
        alignment=TA_LEFT,
        spaceBefore=4,
        spaceAfter=4,
        leading=14,
        leftIndent=20,
        backColor=LIGHT_GRAY
    ))
    
    # Table header style
    styles.add(ParagraphStyle(
        name='TableHeader',
        fontName='Microsoft YaHei',
        fontSize=10,
        textColor=colors.white,
        alignment=TA_CENTER
    ))
    
    # Table cell style
    styles.add(ParagraphStyle(
        name='TableCell',
        fontName='SimHei',
        fontSize=9,
        textColor=DARK_TEXT,
        alignment=TA_LEFT,
        wordWrap='CJK'
    ))
    
    # Bullet style
    styles.add(ParagraphStyle(
        name='BulletText',
        fontName='SimHei',
        fontSize=10.5,
        textColor=DARK_TEXT,
        alignment=TA_LEFT,
        spaceBefore=2,
        spaceAfter=4,
        leading=16,
        leftIndent=20,
        wordWrap='CJK'
    ))
    
    return styles

def create_cover_page(story, styles):
    story.append(Spacer(1, 100))
    story.append(Paragraph("DataGN", styles['MainTitle']))
    story.append(Paragraph("Analyse Technique et Propositions d'Amelioration", styles['Subtitle']))
    story.append(Spacer(1, 30))
    story.append(Paragraph("SaaS de Visualisation et Analyse de Donnees avec IA", styles['Subtitle']))
    story.append(Spacer(1, 80))
    
    # Info table
    info_data = [
        [Paragraph("<b>Repository</b>", styles['TableCell']), Paragraph("https://github.com/skaba89/datagn", styles['TableCell'])],
        [Paragraph("<b>Auteur</b>", styles['TableCell']), Paragraph("skaba89", styles['TableCell'])],
        [Paragraph("<b>Date d'analyse</b>", styles['TableCell']), Paragraph("Janvier 2025", styles['TableCell'])],
        [Paragraph("<b>Version analysee</b>", styles['TableCell']), Paragraph("1.0.0 (first commit)", styles['TableCell'])],
    ]
    
    info_table = Table(info_data, colWidths=[4*cm, 10*cm])
    info_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), LIGHT_GRAY),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 10),
        ('RIGHTPADDING', (0, 0), (-1, -1), 10),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(info_table)
    story.append(PageBreak())

def create_executive_summary(story, styles):
    story.append(Paragraph("1. Resume Executif", styles['SectionHeading']))
    
    story.append(Paragraph(
        "DataGN est une plateforme SaaS de visualisation et d'analyse de donnees avec intelligence artificielle, "
        "developpee en Guinee. Le projet presente une architecture moderne et bien pensee, utilisant Next.js 14, "
        "TypeScript, Prisma ORM et l'API Anthropic pour les fonctionnalites IA. Cette analyse identifie les points "
        "forts du projet ainsi que les axes d'amelioration prioritaires pour transformer DataGN en une solution "
        "entreprise robuste et scalable.",
        styles['CNBodyText']
    ))
    
    story.append(Paragraph("1.1 Points Forts Identifies", styles['SubsectionHeading']))
    
    strengths = [
        "Architecture moderne avec separation claire des responsabilites (Next.js App Router, API Routes)",
        "Securite bien implementee (headers HTTP, RLS PostgreSQL, authentification multi-provider)",
        "Design UI/UX premium avec theming dark/light et animations fluides",
        "Support multi-sources de donnees (CSV, Google Sheets, KoboToolbox, DHIS2, API REST)",
        "Integration IA (Kadi) pour l'analyse automatique des donnees",
        "Internationalisation FR/EN implementee",
        "Infrastructure Docker complete pour le developpement local"
    ]
    
    for s in strengths:
        story.append(Paragraph(f"- {s}", styles['BulletText']))
    
    story.append(Paragraph("1.2 Axes d'Amelioration Prioritaires", styles['SubsectionHeading']))
    
    improvements = [
        "Infrastructure CI/CD et automatisation des tests",
        "Couverture de tests et strategie de qualite",
        "Performance et optimisation du frontend",
        "Documentation technique et API",
        "Monitoring, logging et observabilite",
        "Accessibilite (a11y) et conformite RGAA"
    ]
    
    for i, imp in enumerate(improvements, 1):
        story.append(Paragraph(f"{i}. {imp}", styles['BulletText']))

def create_technical_analysis(story, styles):
    story.append(Paragraph("2. Analyse Technique Detaillee", styles['SectionHeading']))
    
    # Stack table
    story.append(Paragraph("2.1 Stack Technologique", styles['SubsectionHeading']))
    
    stack_data = [
        [Paragraph("<b>Couche</b>", styles['TableHeader']), Paragraph("<b>Technologies</b>", styles['TableHeader']), Paragraph("<b>Version</b>", styles['TableHeader'])],
        [Paragraph("Frontend", styles['TableCell']), Paragraph("Next.js, React, TypeScript, Recharts", styles['TableCell']), Paragraph("14.2.5 / 18.3", styles['TableCell'])],
        [Paragraph("Backend", styles['TableCell']), Paragraph("Next.js API Routes, Prisma ORM", styles['TableCell']), Paragraph("6.4.1", styles['TableCell'])],
        [Paragraph("Database", styles['TableCell']), Paragraph("PostgreSQL avec RLS", styles['TableCell']), Paragraph("16", styles['TableCell'])],
        [Paragraph("Auth", styles['TableCell']), Paragraph("NextAuth v5, Keycloak, Credentials", styles['TableCell']), Paragraph("beta.30", styles['TableCell'])],
        [Paragraph("IA", styles['TableCell']), Paragraph("Anthropic API (Claude)", styles['TableCell']), Paragraph("0.78.0", styles['TableCell'])],
        [Paragraph("Jobs", styles['TableCell']), Paragraph("BullMQ, Redis (ioredis)", styles['TableCell']), Paragraph("5.70.2", styles['TableCell'])],
        [Paragraph("Storage", styles['TableCell']), Paragraph("AWS S3 / MinIO", styles['TableCell']), Paragraph("3.1003.0", styles['TableCell'])],
        [Paragraph("Payment", styles['TableCell']), Paragraph("Stripe", styles['TableCell']), Paragraph("20.4.0", styles['TableCell'])],
        [Paragraph("Email", styles['TableCell']), Paragraph("Resend", styles['TableCell']), Paragraph("6.9.3", styles['TableCell'])],
    ]
    
    stack_table = Table(stack_data, colWidths=[3.5*cm, 8*cm, 3*cm])
    stack_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), HEADER_BG),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('BACKGROUND', (0, 1), (-1, 1), colors.white),
        ('BACKGROUND', (0, 2), (-1, 2), LIGHT_GRAY),
        ('BACKGROUND', (0, 3), (-1, 3), colors.white),
        ('BACKGROUND', (0, 4), (-1, 4), LIGHT_GRAY),
        ('BACKGROUND', (0, 5), (-1, 5), colors.white),
        ('BACKGROUND', (0, 6), (-1, 6), LIGHT_GRAY),
        ('BACKGROUND', (0, 7), (-1, 7), colors.white),
        ('BACKGROUND', (0, 8), (-1, 8), LIGHT_GRAY),
        ('BACKGROUND', (0, 9), (-1, 9), colors.white),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(Spacer(1, 12))
    story.append(stack_table)
    story.append(Spacer(1, 18))
    
    # Architecture
    story.append(Paragraph("2.2 Architecture du Projet", styles['SubsectionHeading']))
    
    story.append(Paragraph(
        "Le projet suit une architecture monolithique modulaire avec Next.js, utilisant l'App Router pour une "
        "separation claire entre les routes pages et les routes API. L'architecture implemente le pattern "
        "Repository via Prisma ORM avec une extension personnalisee pour le Row Level Security (RLS), "
        "permettant une isolation des donnees par workspace de maniere transparente.",
        styles['CNBodyText']
    ))
    
    story.append(Paragraph(
        "L'authentification est geree par NextAuth v5 avec support multi-provider (Keycloak pour SSO entreprise, "
        "Credentials pour l'authentification locale). Les donnees sont stockees dans PostgreSQL avec RLS active, "
        "et les fichiers sont stockes dans S3/MinIO avec URLs presignees pour les uploads securises.",
        styles['CNBodyText']
    ))
    
    # Security
    story.append(Paragraph("2.3 Securite", styles['SubsectionHeading']))
    
    story.append(Paragraph(
        "La securite est un point fort du projet. Les headers HTTP sont correctement configures dans next.config.js "
        "avec X-Frame-Options, X-Content-Type-Options, CSP basique et Referrer-Policy. L'authentification utilise "
        "des mots de passe hashes avec bcrypt et supporte l'SSO via Keycloak. Le middleware implemente une protection "
        "des routes avec redirection automatique vers login pour les utilisateurs non authentifies.",
        styles['CNBodyText']
    ))
    
    security_items = [
        "Headers HTTP securises (XSS Protection, Frame Options, Content Type Options)",
        "Row Level Security (RLS) dans PostgreSQL pour l'isolation des donnees",
        "Authentification multi-provider avec sync utilisateur en base",
        "Validation des inputs cote serveur dans les API Routes",
        "URLs presignees pour les uploads S3 (pas d'exposition des credentials)"
    ]
    
    for item in security_items:
        story.append(Paragraph(f"- {item}", styles['BulletText']))

def create_improvements_section(story, styles):
    story.append(PageBreak())
    story.append(Paragraph("3. Propositions d'Amelioration", styles['SectionHeading']))
    
    # CI/CD
    story.append(Paragraph("3.1 Infrastructure CI/CD", styles['SubsectionHeading']))
    
    story.append(Paragraph(
        "Le projet ne dispose pas de pipeline CI/CD. L'ajout d'un workflow GitHub Actions permettrait d'automatiser "
        "les tests, le linting et le deploiement. Voici une configuration recommandee pour un workflow complet :",
        styles['CNBodyText']
    ))
    
    cicd_items = [
        "Workflow de test automatique sur chaque Pull Request",
        "Linting et formatage automatique (ESLint, Prettier)",
        "Build et test de l'image Docker",
        "Deploiement automatique sur staging/production",
        "Scan de securite (dependances, SAST)"
    ]
    
    for item in cicd_items:
        story.append(Paragraph(f"- {item}", styles['BulletText']))
    
    story.append(Paragraph(
        "Le fichier .github/workflows/ci.yml devrait inclure des jobs pour : install, lint, test, build, "
        "et deploy. L'utilisation de caches npm et la parallelisation des jobs permettront de reduire "
        "le temps de pipeline a moins de 10 minutes.",
        styles['CNBodyText']
    ))
    
    # Tests
    story.append(Paragraph("3.2 Strategie de Tests", styles['SubsectionHeading']))
    
    story.append(Paragraph(
        "La couverture de tests actuelle est tres limitee (3 fichiers de test unitaire). Une strategie de tests "
        "complete devrait inclure : tests unitaires, tests d'integration, tests E2E et tests de performance.",
        styles['CNBodyText']
    ))
    
    test_data = [
        [Paragraph("<b>Type</b>", styles['TableHeader']), Paragraph("<b>Outil</b>", styles['TableHeader']), Paragraph("<b>Couverture cible</b>", styles['TableHeader'])],
        [Paragraph("Unitaires", styles['TableCell']), Paragraph("Vitest + Testing Library", styles['TableCell']), Paragraph("80% minimum", styles['TableCell'])],
        [Paragraph("Integration", styles['TableCell']), Paragraph("Vitest + MSW (API mocking)", styles['TableCell']), Paragraph("70% minimum", styles['TableCell'])],
        [Paragraph("E2E", styles['TableCell']), Paragraph("Playwright", styles['TableCell']), Paragraph("Parcours critiques", styles['TableCell'])],
        [Paragraph("Performance", styles['TableCell']), Paragraph("Lighthouse CI, k6", styles['TableCell']), Paragraph("Seuils definis", styles['TableCell'])],
        [Paragraph("Securite", styles['TableCell']), Paragraph("OWASP ZAP, Snyk", styles['TableCell']), Paragraph("Scan automatique", styles['TableCell'])],
    ]
    
    test_table = Table(test_data, colWidths=[3.5*cm, 5.5*cm, 4*cm])
    test_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), HEADER_BG),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('BACKGROUND', (0, 1), (-1, 1), colors.white),
        ('BACKGROUND', (0, 2), (-1, 2), LIGHT_GRAY),
        ('BACKGROUND', (0, 3), (-1, 3), colors.white),
        ('BACKGROUND', (0, 4), (-1, 4), LIGHT_GRAY),
        ('BACKGROUND', (0, 5), (-1, 5), colors.white),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(Spacer(1, 12))
    story.append(test_table)
    story.append(Spacer(1, 18))
    
    # Performance
    story.append(Paragraph("3.3 Optimisation des Performances", styles['SubsectionHeading']))
    
    story.append(Paragraph(
        "L'optimisation des performances est cruciale pour une application de visualisation de donnees. "
        "Plusieurs axes d'amelioration ont ete identifies :",
        styles['CNBodyText']
    ))
    
    perf_items = [
        "Implementation du Server-Side Rendering (SSR) pour les pages publiques",
        "Mise en place de React Query ou SWR pour le cache cote client",
        "Virtualisation des listes longues (react-virtualized) pour les tableaux de donnees",
        "Optimisation des re-renders avec React.memo et useMemo",
        "Lazy loading des composants lourds (deja partiellement fait avec dynamic imports)",
        "Mise en cache Redis pour les resultats d'analyse IA",
        "Compression des reponses HTTP (gzip/brotli)"
    ]
    
    for item in perf_items:
        story.append(Paragraph(f"- {item}", styles['BulletText']))
    
    # Documentation
    story.append(Paragraph("3.4 Documentation Technique", styles['SubsectionHeading']))
    
    story.append(Paragraph(
        "La documentation actuelle se limite a un README basique. Une documentation complete est essentielle "
        "pour la maintenabilite et l'onboarding des nouveaux developpeurs :",
        styles['CNBodyText']
    ))
    
    doc_items = [
        "Documentation API avec OpenAPI/Swagger (tsoa ou next-openapi)",
        "Documentation des composants avec Storybook",
        "Guide de contribution (CONTRIBUTING.md)",
        "Documentation d'architecture (ADR - Architecture Decision Records)",
        "Runbooks pour les operations et le troubleshooting",
        "Changelog automatique base sur conventional commits"
    ]
    
    for item in doc_items:
        story.append(Paragraph(f"- {item}", styles['BulletText']))
    
    # Monitoring
    story.append(Paragraph("3.5 Monitoring et Observabilite", styles['SubsectionHeading']))
    
    story.append(Paragraph(
        "L'absence de monitoring est un point critique. L'implementations d'une solution d'observabilite "
        "permettra de detecter et resoudre les incidents rapidement :",
        styles['CNBodyText']
    ))
    
    monitoring_items = [
        "Application Performance Monitoring (APM) : Sentry ou Datadog",
        "Logging structure avec Pino ou Winston vers ELK/Loki",
        "Metriques metier custom (dashboards, analyses IA, exports)",
        "Alerting sur les erreurs critiques et les seuils de performance",
        "Health checks ameliores avec dependances (DB, Redis, S3)",
        "Tracing distribue pour les appels IA (OpenTelemetry)"
    ]
    
    for item in monitoring_items:
        story.append(Paragraph(f"- {item}", styles['BulletText']))
    
    # Accessibility
    story.append(Paragraph("3.6 Accessibilite (a11y)", styles['SubsectionHeading']))
    
    story.append(Paragraph(
        "L'accessibilite n'est pas implementee, ce qui pourrait poser des problemes de conformite. "
        "Les recommandations incluent :",
        styles['CNBodyText']
    ))
    
    a11y_items = [
        "Ajout d'attributs ARIA pour les composants interactifs",
        "Support de la navigation au clavier (focus management)",
        "Contrastes de couleurs conformes WCAG 2.1 AA",
        "Textes alternatifs pour les graphiques et visualisations",
        "Labels pour tous les champs de formulaire",
        "Tests automatiques avec axe-core et Lighthouse"
    ]
    
    for item in a11y_items:
        story.append(Paragraph(f"- {item}", styles['BulletText']))

def create_code_recommendations(story, styles):
    story.append(PageBreak())
    story.append(Paragraph("4. Recommandations de Code", styles['SectionHeading']))
    
    # Error handling
    story.append(Paragraph("4.1 Gestion des Erreurs", styles['SubsectionHeading']))
    
    story.append(Paragraph(
        "La gestion des erreurs est actuellement basee sur des try/catch avec console.error. "
        "Il est recommande d'implementer une strategy coherente :",
        styles['CNBodyText']
    ))
    
    error_items = [
        "Creer des classes d'erreur customisees (AppError, ValidationError, AuthError)",
        "Implementer un middleware de gestion d'erreurs global",
        "Logger les erreurs avec contexte (userId, requestId, stack trace)",
        "Retourner des messages d'erreur utilisateurs appropriees",
        "Implementer des boundaries d'erreur React pour le frontend"
    ]
    
    for item in error_items:
        story.append(Paragraph(f"- {item}", styles['BulletText']))
    
    # TypeScript
    story.append(Paragraph("4.2 Ameliorations TypeScript", styles['SubsectionHeading']))
    
    story.append(Paragraph(
        "Le projet utilise TypeScript mais plusieurs zones utilisent le type 'any' ou des casts. "
        "Les recommandations incluent :",
        styles['CNBodyText']
    ))
    
    ts_items = [
        "Activer strict mode dans tsconfig.json (strict: true)",
        "Eliminer les types 'any' avec des types specifiques",
        "Creer des types Zod pour la validation des API inputs",
        "Utiliser les types Prisma generes pour les operations DB",
        "Implementer des guards pour les types narrowing"
    ]
    
    for item in ts_items:
        story.append(Paragraph(f"- {item}", styles['BulletText']))
    
    # Component architecture
    story.append(Paragraph("4.3 Architecture des Composants", styles['SubsectionHeading']))
    
    story.append(Paragraph(
        "Certains composants comme Dashboard.tsx sont tres volumineux (770+ lignes). "
        "Les recommandations de refactoring incluent :",
        styles['CNBodyText']
    ))
    
    component_items = [
        "Decomposer les gros composants en sous-composants",
        "Extraire la logique metier dans des hooks personnalises",
        "Utiliser le pattern Container/Presentational",
        "Implementer un state management global (Zustand ou Jotai)",
        "Standardiser les props avec des interfaces TypeScript"
    ]
    
    for item in component_items:
        story.append(Paragraph(f"- {item}", styles['BulletText']))

def create_roadmap(story, styles):
    story.append(PageBreak())
    story.append(Paragraph("5. Feuille de Route Recommandee", styles['SectionHeading']))
    
    story.append(Paragraph(
        "Voici une feuille de route prioritisee pour l'amelioration du projet DataGN, "
        "organisee par phase et impact :",
        styles['CNBodyText']
    ))
    
    roadmap_data = [
        [Paragraph("<b>Phase</b>", styles['TableHeader']), Paragraph("<b>Actions</b>", styles['TableHeader']), Paragraph("<b>Impact</b>", styles['TableHeader']), Paragraph("<b>Effort</b>", styles['TableHeader'])],
        [Paragraph("Phase 1 (S0)", styles['TableCell']), Paragraph("CI/CD, Tests critiques, Sentry", styles['TableCell']), Paragraph("Critique", styles['TableCell']), Paragraph("2 semaines", styles['TableCell'])],
        [Paragraph("Phase 2 (S1)", styles['TableCell']), Paragraph("Documentation API, A11y de base", styles['TableCell']), Paragraph("Eleve", styles['TableCell']), Paragraph("2 semaines", styles['TableCell'])],
        [Paragraph("Phase 3 (S2)", styles['TableCell']), Paragraph("Refactoring composants, Performance", styles['TableCell']), Paragraph("Moyen", styles['TableCell']), Paragraph("3 semaines", styles['TableCell'])],
        [Paragraph("Phase 4 (S3)", styles['TableCell']), Paragraph("Monitoring avance, Tests E2E", styles['TableCell']), Paragraph("Moyen", styles['TableCell']), Paragraph("2 semaines", styles['TableCell'])],
        [Paragraph("Phase 5 (S4)", styles['TableCell']), Paragraph("Storybook, Optimisations avances", styles['TableCell']), Paragraph("Faible", styles['TableCell']), Paragraph("2 semaines", styles['TableCell'])],
    ]
    
    roadmap_table = Table(roadmap_data, colWidths=[3*cm, 6*cm, 2.5*cm, 2.5*cm])
    roadmap_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), HEADER_BG),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('BACKGROUND', (0, 1), (-1, 1), colors.white),
        ('BACKGROUND', (0, 2), (-1, 2), LIGHT_GRAY),
        ('BACKGROUND', (0, 3), (-1, 3), colors.white),
        ('BACKGROUND', (0, 4), (-1, 4), LIGHT_GRAY),
        ('BACKGROUND', (0, 5), (-1, 5), colors.white),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(Spacer(1, 12))
    story.append(roadmap_table)
    story.append(Spacer(1, 18))
    
    story.append(Paragraph("5.1 Priorisation des Actions", styles['SubsectionHeading']))
    
    story.append(Paragraph(
        "La priorisation est basee sur l'impact business et l'effort requis. Les actions de la Phase 1 sont "
        "essentielles pour assurer la stabilite et la maintenabilite du projet avant d'ajouter de nouvelles "
        "fonctionnalites. Le setup CI/CD et l'integration de Sentry permettront de detecter les bugs en production "
        "et d'assurer la qualite des deploiements.",
        styles['CNBodyText']
    ))
    
    story.append(Paragraph(
        "La Phase 2 se concentre sur la documentation et l'accessibilite, essentiels pour l'adoption entreprise "
        "et la conformite. Les phases suivantes optimisent l'experience developpeur et les performances.",
        styles['CNBodyText']
    ))

def create_conclusion(story, styles):
    story.append(Paragraph("6. Conclusion", styles['SectionHeading']))
    
    story.append(Paragraph(
        "DataGN est un projet prometteur avec une architecture solide et des fonctionnalites innovantes. "
        "L'analyse a revele plusieurs points forts, notamment la securite bien implementee, le design premium "
        "et l'integration IA. Les principaux axes d'amelioration concernent l'infrastructure CI/CD, la couverture "
        "de tests, la documentation et l'observabilite.",
        styles['CNBodyText']
    ))
    
    story.append(Paragraph(
        "L'implementation des recommandations proposees permettra de transformer DataGN en une solution "
        "entreprise robuste, scalable et maintenable. La feuille de route suggeree permet une amelioration "
        "progressive avec un retour sur investment rapide des les premieres phases.",
        styles['CNBodyText']
    ))
    
    story.append(Paragraph(
        "Le projet a un potentiel significatif sur le marche africain de la data visualisation, notamment "
        "avec son support DHIS2 et KoboToolbox qui sont des standards dans le secteur humanitaire et sanitaire. "
        "L'amelioration continue de la qualite et de l'experience utilisateur permettra de consolider cette "
        "position.",
        styles['CNBodyText']
    ))

def main():
    output_path = "/home/z/my-project/download/DataGN_Analyse_Technique.pdf"
    
    doc = SimpleDocTemplate(
        output_path,
        pagesize=A4,
        leftMargin=2*cm,
        rightMargin=2*cm,
        topMargin=2*cm,
        bottomMargin=2*cm,
        title="DataGN_Analyse_Technique",
        author="Z.ai",
        creator="Z.ai",
        subject="Analyse technique et propositions d'amelioration du projet DataGN"
    )
    
    styles = create_styles()
    story = []
    
    # Build document
    create_cover_page(story, styles)
    create_executive_summary(story, styles)
    create_technical_analysis(story, styles)
    create_improvements_section(story, styles)
    create_code_recommendations(story, styles)
    create_roadmap(story, styles)
    create_conclusion(story, styles)
    
    doc.build(story)
    print(f"PDF generated: {output_path}")

if __name__ == "__main__":
    main()
