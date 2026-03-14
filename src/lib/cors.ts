// ─────────────────────────────────────────────────────────────────
// lib/cors.ts — Helpers CORS partagés entre API Routes
// ─────────────────────────────────────────────────────────────────

/**
 * Liste blanche des origines autorisées à appeler /api/*
 * En production : définir ALLOWED_ORIGINS=https://app.datagn.com,https://datagn.com
 */
export const ALLOWED_ORIGINS: string[] = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map(s => s.trim())
    : [
        'http://localhost:3000',
        'http://localhost:8081',
        'https://datagn.com',
        'https://www.datagn.com',
        'https://app.datagn.com',
    ];

/**
 * Retourne les headers CORS appropriés selon l'origin de la requête.
 * Seuls les origines whitelistées reçoivent l'header Allow-Origin.
 */
export function getCorsHeaders(origin: string | null): Record<string, string> {
    const headers: Record<string, string> = {
        'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Vary': 'Origin',
    };

    if (origin && ALLOWED_ORIGINS.includes(origin)) {
        headers['Access-Control-Allow-Origin'] = origin;
    }

    return headers;
}
