# DataGN — Plateforme d'Analyse de Données avec IA

[![CI/CD](https://github.com/skaba89/datagn/actions/workflows/ci.yml/badge.svg)](https://github.com/skaba89/datagn/actions/workflows/ci.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14.2-black)](https://nextjs.org/)
[![License](https://img.shields.io/badge/License-Proprietary-red)](LICENSE)

**DataGN** est une plateforme SaaS de visualisation et d'analyse de données avec intelligence artificielle, développée en Guinée pour le marché africain.

## 🚀 Fonctionnalités

### Sources de Données
- **CSV/Excel** — Upload drag & drop avec détection automatique de l'encodage
- **Google Sheets** — Connexion directe aux feuilles publiques
- **KoboToolbox** — Intégration API v2 pour la collecte de données terrain
- **DHIS2** — Support des systèmes d'information sanitaire
- **API REST** — Connexion à n'importe quelle API JSON

### Visualisation & Analyse
- **Tableaux de bord interactifs** avec KPIs auto-générés
- **Graphiques** (lignes, barres, camemberts, cartes)
- **Analyse IA (Kadi)** — Insights automatiques via Claude (Anthropic)
- **Filtrage croisé** et exploration de données
- **Alertes** — Seuils et notifications

### Fonctionnalités Entreprise
- **Multi-workspace** avec isolation des données
- **Authentification** — Local (credentials) + SSO (Keycloak)
- **Rôles** — Owner, Admin, Editor, Viewer
- **Partage** — Liens publics avec expiration
- **Export** — PDF, CSV, rapports automatisés

## 🏗️ Architecture

```
datagn/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API Routes
│   │   ├── (auth)/            # Pages d'authentification
│   │   └── dashboard/         # Dashboard pages
│   ├── components/            # Composants React
│   │   ├── Dashboard.tsx      # Dashboard principal
│   │   ├── KadiPanel.tsx      # Interface IA
│   │   └── ...
│   ├── lib/                   # Utilitaires & services
│   │   ├── db.ts             # Prisma client avec RLS
│   │   ├── parser.ts         # Parseur CSV
│   │   ├── fetcher.ts        # Connecteurs sources
│   │   ├── kadi.ts           # Client IA
│   │   ├── errors.ts         # Gestion d'erreurs
│   │   ├── logger.ts         # Logging structuré
│   │   └── sentry.ts         # Monitoring
│   └── hooks/                 # Hooks React
├── prisma/                    # Schéma & migrations
├── scripts/                   # Scripts utilitaires
└── .github/workflows/         # CI/CD
```

## 🛠️ Stack Technique

| Couche | Technologies |
|--------|--------------|
| **Frontend** | Next.js 14, React 18, TypeScript, Recharts |
| **Backend** | Next.js API Routes, Prisma ORM |
| **Database** | PostgreSQL avec Row Level Security |
| **Auth** | NextAuth v5, Keycloak, bcrypt |
| **IA** | Anthropic API (Claude) |
| **Queue** | BullMQ, Redis |
| **Storage** | AWS S3 / MinIO |
| **Payment** | Stripe |
| **Email** | Resend |
| **Monitoring** | Sentry |

## 📋 Prérequis

- Node.js 20+
- PostgreSQL 16+
- Redis 7+
- MinIO ou AWS S3

## 🚀 Démarrage Rapide

### Avec Docker (Recommandé)

```bash
# Cloner le repository
git clone https://github.com/skaba89/datagn.git
cd datagn

# Configuration
cp .env.example .env.local

# Démarrer les services
docker-compose up -d

# Installer les dépendances et initialiser la DB
npm install
npx prisma migrate dev
npx prisma db seed

# Démarrer en développement
npm run dev
```

### Sans Docker

```bash
# Prérequis: PostgreSQL, Redis, MinIO running

npm install
cp .env.example .env.local
# Éditer .env.local avec vos configurations

npx prisma migrate dev
npx prisma db seed
npm run dev
```

## ⚙️ Configuration

### Variables d'environnement requises

```bash
# Base de données
DATABASE_URL="postgresql://user:password@localhost:5432/datagn"

# Authentification
AUTH_SECRET="your-secret-key-min-32-chars"
NEXTAUTH_URL="http://localhost:3000"

# IA (Anthropic)
ANTHROPIC_API_KEY="sk-ant-api03-..."

# Storage (S3/MinIO)
S3_ENDPOINT="http://localhost:9000"
S3_ACCESS_KEY="minioadmin"
S3_SECRET_KEY="minioadmin"
S3_BUCKET="datagn"
S3_REGION="us-east-1"

# Redis
REDIS_URL="redis://localhost:6379"

# Sentry (optionnel)
NEXT_PUBLIC_SENTRY_DSN="https://..."

# Keycloak (optionnel)
KEYCLOAK_ISSUER="http://localhost:8082/realms/datagn"
KEYCLOAK_CLIENT_ID="datagn-web"
KEYCLOAK_CLIENT_SECRET="your-client-secret"
```

## 🧪 Tests

```bash
# Tests unitaires
npm run test

# Tests avec coverage
npm run test:coverage

# Tests E2E
npm run test:e2e

# Linting
npm run lint

# Type checking
npm run typecheck
```

## 📦 Déploiement

### Vercel (Recommandé)

```bash
# Installer Vercel CLI
npm i -g vercel

# Déployer
vercel

# Configurer les variables d'environnement
vercel env add DATABASE_URL
vercel env add ANTHROPIC_API_KEY
# ...

# Déployer en production
vercel --prod
```

### Docker / Cloud Run

```bash
# Build
docker build -t datagn .

# Run
docker run -p 3000:3000 \
  -e DATABASE_URL=... \
  -e ANTHROPIC_API_KEY=... \
  datagn
```

### Google Cloud Run

```bash
gcloud run deploy datagn \
  --source . \
  --region europe-west1 \
  --allow-unauthenticated \
  --set-env-vars DATABASE_URL=...,ANTHROPIC_API_KEY=...
```

## 📚 Documentation

- [Architecture](./docs/ARCHITECTURE.md)
- [API Reference](./docs/API.md)
- [Contributing](./CONTRIBUTING.md)
- [Security](./docs/SECURITY.md)

## 🤝 Contribuer

Voir [CONTRIBUTING.md](./CONTRIBUTING.md) pour les guidelines de contribution.

## 📄 Licence

Propriétaire — Tous droits réservés.

## 📞 Contact

- **Email**: contact@datagn.com
- **Localisation**: Conakry, Guinée
- **GitHub**: [@skaba89](https://github.com/skaba89)
