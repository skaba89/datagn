# DataGN — Next.js Dashboard

Stack : **Next.js 14** · **TypeScript** · **Recharts** · **Anthropic API**

## Architecture

```
datagn/
├── public/favicon.ico
├── src/
│   ├── app/
│   │   ├── layout.tsx          ← Layout global + métadonnées SEO
│   │   ├── page.tsx            ← Orchestration des 3 étapes
│   │   ├── globals.css         ← Design system complet
│   │   └── api/kadi/route.ts  ← Proxy Anthropic sécurisé (clé côté serveur)
│   ├── components/
│   │   ├── StepSource.tsx      ← Écran choix source
│   │   ├── StepConfig.tsx      ← Formulaire config + drag&drop CSV
│   │   ├── Dashboard.tsx       ← Dashboard 4 onglets (Overview/Charts/Table/Kadi)
│   │   ├── KadiPanel.tsx       ← Chat + Tickets + Maintenance + Rapports
│   │   ├── KadiFloat.tsx       ← Widget flottant présent partout
│   │   └── charts/CustomTooltip.tsx
│   └── lib/
│       ├── parser.ts           ← parseCSV, detectCols, buildViz, toCSV
│       ├── fetcher.ts          ← Google Sheets, KoboToolbox, API, CSV
│       └── kadi.ts             ← kadiCall, kadiAnalyze, kadiReport
├── .env.local                  ← NE PAS COMMITTER
├── .env.example
├── next.config.js              ← output: standalone (Cloud Run)
├── package.json
├── tsconfig.json
├── vercel.json                 ← Vercel config
└── Dockerfile                  ← Google Cloud Run
```

## Démarrage local

```bash
npm install
cp .env.example .env.local
# Éditez .env.local : ANTHROPIC_API_KEY=sk-ant-api03-...
npm run dev
# → http://localhost:3000
```

## Déploiement Vercel (recommandé)

```bash
npm i -g vercel
vercel
vercel env add ANTHROPIC_API_KEY
vercel --prod
```

Ou via **vercel.com** → New Project → Import GitHub → Add ANTHROPIC_API_KEY → Deploy

## Déploiement Google Cloud Run

```bash
gcloud run deploy datagn \
  --source . \
  --region europe-west1 \
  --allow-unauthenticated \
  --set-env-vars ANTHROPIC_API_KEY=sk-ant-api03-... \
  --port 8080
```

## Sources supportées

| Source | Description |
|--------|-------------|
| Google Sheets | Publiez → CSV → URL automatique |
| CSV/Excel | Drag & drop, séparateur auto-détecté |
| KoboToolbox | API v2 avec Token, collecte hors-ligne |
| API REST | Endpoint JSON, Authorization optionnel |

## Sécurité

✅ Clé Anthropic **jamais exposée au client** (Next.js API Route)  
✅ CORS configuré dans next.config.js  
✅ Validation inputs côté serveur  

Contact : contact@datagn.com | Conakry, Guinée
