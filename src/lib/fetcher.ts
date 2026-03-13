// ────────────────────────────────────────────────────────────────
// fetcher.ts — Connecteurs sources (GSheets, KoboToolbox, API, CSV)
// ────────────────────────────────────────────────────────────────
import { parseCSV, Row } from './parser';

export type SourceType = 'gsheets' | 'csv' | 'kobo' | 'api' | 'dhis2' | 'db';

export interface SourceConfig {
  // Google Sheets
  url?: string;
  // KoboToolbox
  token?: string;
  formId?: string;
  server?: string;
  // API
  endpoint?: string;
  apiKey?: string;
  // DHIS2
  baseUrl?: string;
  username?: string;
  password?: string;
  dataSet?: string;
  orgUnit?: string;
  period?: string;
  // DB (Database)
  dbUrl?: string; // Postgres/MySQL connection string
  dbTable?: string;
  // Commun
  refresh?: number;  // secondes
  templateId?: string | null;
  templateKPIs?: any[];
  pages?: any[]; // Phase 40 : Multi-Pages configuration
  scdConfig?: any; // Phase 31 : Historical data configuration
  datasetId?: string; // Phase S3 : Persistance CSV
}

// ── Normaliser URL Google Sheets → export CSV ─────────────────
function normalizeGSheetsUrl(raw: string): string {
  if (raw.includes('/export') || raw.includes('gviz/tq')) return raw;
  const idMatch = raw.match(/\/d\/([a-zA-Z0-9-_]+)/);
  const gidMatch = raw.match(/gid=(\d+)/);
  if (!idMatch) throw new Error('ID de feuille introuvable dans l\'URL');
  const id = idMatch[1];
  const gid = gidMatch?.[1] ?? '0';
  return `https://docs.google.com/spreadsheets/d/${id}/export?format=csv&gid=${gid}`;
}

// ── Nettoyer clés KoboToolbox (enlever préfixes groupes) ─────
function cleanKoboRow(raw: Record<string, unknown>): Row {
  const out: Row = {};
  Object.entries(raw).forEach(([k, v]) => {
    const clean = k.replace(/^.*\//, '').replace(/_/g, ' ').trim();
    const val = typeof v === 'number' ? v : String(v ?? '').trim();
    if (clean && !clean.startsWith('_') && val !== '') out[clean] = val;
  });
  return out;
}

// ── fetchGSheets ─────────────────────────────────────────────
export async function fetchGSheets(cfg: SourceConfig): Promise<Row[]> {
  if (!cfg.url?.trim()) throw new Error('URL Google Sheets manquante');
  const exportUrl = normalizeGSheetsUrl(cfg.url.trim());

  const resp = await fetch(exportUrl, { cache: 'no-store' });
  if (!resp.ok) throw new Error(
    `Erreur ${resp.status} — La feuille n'est peut-être pas publiée.\n` +
    'Fichier → Partager → Publier sur le web → CSV → Publier'
  );
  const text = await resp.text();
  if (text.trim().startsWith('<!')) throw new Error(
    'La feuille n\'est pas publiée en accès public.\n' +
    'Fichier → Publier sur le web → Format CSV → Publier'
  );
  return parseCSV(text);
}

// ── fetchKobo ────────────────────────────────────────────────
export async function fetchKobo(cfg: SourceConfig): Promise<Row[]> {
  const { token, formId, server = 'kf.kobotoolbox.org' } = cfg;
  if (!token) throw new Error('Token API KoboToolbox manquant');
  if (!formId) throw new Error('ID de formulaire KoboToolbox manquant');

  const url = `https://${server}/api/v2/assets/${formId}/data/?format=json&limit=5000`;
  const resp = await fetch(url, {
    headers: { Authorization: `Token ${token}` },
    cache: 'no-store',
  });
  if (!resp.ok) throw new Error(
    `KoboToolbox erreur ${resp.status} — Vérifiez le token et l'ID du formulaire`
  );
  const json = await resp.json() as { results?: Record<string, unknown>[] };
  return (json.results ?? []).map(cleanKoboRow);
}

// ── fetchAPI ─────────────────────────────────────────────────
export async function fetchAPI(cfg: SourceConfig): Promise<Row[]> {
  if (!cfg.endpoint?.trim()) throw new Error('URL de l\'endpoint manquante');

  const headers: Record<string, string> = {};
  if (cfg.apiKey) {
    headers['Authorization'] = cfg.apiKey.startsWith('Bearer')
      ? cfg.apiKey
      : `Bearer ${cfg.apiKey}`;
  }

  const resp = await fetch(cfg.endpoint.trim(), { headers, cache: 'no-store' });
  if (!resp.ok) throw new Error(`API ${resp.status} — ${resp.statusText}`);

  const json = await resp.json();
  const arr: Record<string, unknown>[] = Array.isArray(json)
    ? json
    : (json.data ?? json.results ?? json.items ?? []);

  if (!arr.length) throw new Error('Réponse API vide ou format non reconnu (attendu: tableau JSON)');

  return arr.map(r => {
    const out: Row = {};
    Object.entries(r).forEach(([k, v]) => {
      out[k] = typeof v === 'number' ? v : String(v ?? '').trim();
    });
    return out;
  });
}

// ── fetchDHIS2 ───────────────────────────────────────────────
export async function fetchDHIS2(cfg: SourceConfig): Promise<Row[]> {
  const { baseUrl, username, password, dataSet, orgUnit = 'YOUR_ORG_UNIT', period = '2024' } = cfg;
  if (!baseUrl) throw new Error('URL DHIS2 manquante');
  if (!username) throw new Error('Nom d\'utilisateur DHIS2 manquant');
  if (!password) throw new Error('Mot de passe DHIS2 manquant');
  if (!dataSet) throw new Error('ID de DataSet DHIS2 manquant');

  // Exemple: fetch analytics ou dataValueSets
  const url = `${baseUrl.replace(/\/$/, '')}/api/dataValueSets.json?dataSet=${dataSet}&orgUnit=${orgUnit}&period=${period}`;

  const auth = btoa(`${username}:${password}`);
  const resp = await fetch(url, {
    headers: { Authorization: `Basic ${auth}` },
    cache: 'no-store',
  });

  if (!resp.ok) throw new Error(`DHIS2 ${resp.status} — ${resp.statusText}`);

  const json = await resp.json();
  const dataValues = json.dataValues || [];

  if (!dataValues.length) throw new Error('Aucune donnée trouvée pour ce DataSet DHIS2');

  return dataValues.map((v: any) => ({
    dataElement: v.dataElement,
    period: v.period,
    orgUnit: v.orgUnit,
    value: Number(v.value) || 0,
    categoryOptionCombo: v.categoryOptionCombo,
    attributeOptionCombo: v.attributeOptionCombo,
    storedBy: v.storedBy,
    created: v.created,
    lastUpdated: v.lastUpdated
  }));
}

// ── fetchDB ──────────────────────────────────────────────────
export async function fetchDB(cfg: SourceConfig): Promise<Row[]> {
  const { dbUrl, dbTable } = cfg;
  if (!dbUrl) throw new Error('URL de connexion base de données manquante');
  if (!dbTable) throw new Error('Nom de la table manquant');

  const resp = await fetch('/api/fetch-db', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      dbUrl,
      dbTable,
      joins: (cfg as any).joins || []
    }),
    cache: 'no-store'
  });

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    throw new Error(`Erreur SQL : ${err.error || resp.statusText}`);
  }

  const json = await resp.json();
  if (!Array.isArray(json)) throw new Error('Format de réponse non-conforme (attendu JSON array)');
  if (!json.length) throw new Error('Table vide ou aucune donnée retournée');

  return json.map(r => {
    const out: Row = {};
    Object.entries(r).forEach(([k, v]) => {
      out[k] = typeof v === 'number' ? v : String(v ?? '').trim();
    });
    return out;
  });
}

// ── fetchCSV (File) ──────────────────────────────────────────
export async function fetchCSV(files: File | File[]): Promise<Row[]> {
  const fileList = Array.isArray(files) ? files : [files];
  let allRows: Row[] = [];

  for (const file of fileList) {
    // 🔄 Gestion intelligente de l'encodage (UTF-8 avec fallback ISO-8859-1 pour les accents)
    const buffer = await file.arrayBuffer();
    const decoderUTF8 = new TextDecoder('utf-8', { fatal: true });
    let text = '';

    try {
      text = decoderUTF8.decode(buffer);
    } catch (e) {
      // Si UTF-8 échoue (séquence invalide), c'est probablement du Windows-1252/ISO-8859-1 (Excel FR)
      const decoderISO = new TextDecoder('iso-8859-1');
      text = decoderISO.decode(buffer);
    }

    const rows = parseCSV(text);

    // Ajout des méta-données de source pour l'historisation
    const fileName = file.name;
    const periodMatch = fileName.match(/(\d{4}[-_]\d{2}|\d{2}[-_]\d{4}|janvier|fevrier|mars|avril|mai|juin|juillet|aout|septembre|octobre|novembre|decembre)/i);

    rows.forEach(r => {
      r['_source_file'] = fileName;
      if (periodMatch) {
        r['_period'] = periodMatch[0];
      }
    });

    allRows = allRows.concat(rows);
  }

  if (!allRows.length) throw new Error('Fichier(s) vide(s) ou format(s) non reconnu(s)');
  return allRows;
}

// ── uploadDataset (CSV → S3 → DB) ───────────────────────────
export async function uploadDataset(files: File | File[], workspaceId: string): Promise<string> {
  const fileList = Array.isArray(files) ? files : [files];
  if (!fileList.length) throw new Error("Aucun fichier à uploader");

  const file = fileList[0]; // Pour l'instant on gère le dataset principal

  // 1. Obtenir URL présignée
  const presignResp = await fetch('/api/uploads/presign', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      filename: file.name,
      contentType: file.type || 'text/csv',
      workspaceId
    })
  });
  if (!presignResp.ok) throw new Error("Erreur de préparation de l'upload");
  const { uploadUrl, objectKey } = await presignResp.json();

  // 2. Upload vers S3/MinIO
  const uploadResp = await fetch(uploadUrl, {
    method: 'PUT',
    body: file,
    headers: { 'Content-Type': file.type || 'text/csv' }
  });
  if (!uploadResp.ok) throw new Error("Échec de l'envoi du fichier vers le stockage");

  // 3. Enregistrer en base de données
  const dbResp = await fetch('/api/datasets', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      workspaceId,
      name: file.name,
      sourceType: 'upload',
      objectKey,
      originalName: file.name,
      contentType: file.type || 'text/csv',
      sizeBytes: file.size
    })
  });
  if (!dbResp.ok) throw new Error("Échec de l'enregistrement du dataset");
  const { datasetId } = await dbResp.json();

  return datasetId;
}

// ── Dispatcher principal ─────────────────────────────────────
export async function loadSource(
  type: SourceType,
  cfg: SourceConfig,
  files?: File | File[] | null
): Promise<Row[]> {
  switch (type) {
    case 'gsheets': return fetchGSheets(cfg);
    case 'kobo': return fetchKobo(cfg);
    case 'api': return fetchAPI(cfg);
    case 'dhis2': return fetchDHIS2(cfg);
    case 'db': return fetchDB(cfg);
    case 'csv':
    case 'upload' as any: {
      if (files && (Array.isArray(files) ? files.length > 0 : true)) {
        return fetchCSV(files);
      }
      if (cfg.datasetId) {
        // Chargement distant depuis l'API de proxy
        const workspaceId = (window as any).__DATAGN_WORKSPACE_ID__ || (cfg as any).workspaceId;
        const res = await fetch(`/api/datasets/${cfg.datasetId}/data${workspaceId ? `?workspaceId=${workspaceId}` : ''}`);
        if (!res.ok) throw new Error("Impossible de charger les données distantes du dataset (S3)");
        const text = await res.text();
        return parseCSV(text);
      }
      throw new Error('Aucun fichier CSV fourni et aucun identifiant de dataset trouvé dans la configuration. Veuillez re-sélectionner votre fichier.');
    }
    default: throw new Error('Type de source inconnu');
  }
}
