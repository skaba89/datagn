// ──────────────────────────────────────────────────────────────
// lib/redis.ts — Connexion Redis avec fallback gracieux
// Si Redis n'est pas disponible (ex: env local sans Docker),
// les fonctions qui l'utilisent dégradent silencieusement.
// ──────────────────────────────────────────────────────────────
import Redis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL
    || (process.env.REDIS_HOST
        ? `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT || 6379}`
        : null);

// Singleton global pour le Fast Refresh de Next.js
const globalForRedis = global as unknown as { redis: Redis | null };

function createRedisClient(): Redis | null {
    if (!REDIS_URL) {
        console.warn('[Redis] Aucune URL Redis configurée. Les features Redis sont désactivées.');
        return null;
    }

    const client = new Redis(REDIS_URL, {
        // Ne pas retenter indéfiniment en cas d'échec de connexion
        maxRetriesPerRequest: 1,
        enableReadyCheck: false,
        lazyConnect: true, // ← Ne se connecte que lors du 1er appel !
        connectTimeout: 3000, // 3s max avant abandon
        retryStrategy: (times) => {
            if (times > 2) return null; // Abandon après 3 tentatives
            return Math.min(times * 200, 1000);
        }
    });

    client.on('error', (err) => {
        // Ne pas crasher le serveur, juste logger proprement
        if (err.message.includes('ECONNREFUSED')) {
            console.warn('[Redis] Non disponible (ECONNREFUSED) — mode dégradé sans cache.');
        } else {
            console.error('[Redis] Erreur:', err.message);
        }
    });

    return client;
}

export const redis: Redis | null =
    globalForRedis.redis !== undefined
        ? globalForRedis.redis
        : createRedisClient();

if (process.env.NODE_ENV !== 'production') {
    globalForRedis.redis = redis;
}

// ── Helpers avec gestion d'erreur intégrée ───────────────────
export async function redisGet(key: string): Promise<string | null> {
    if (!redis) return null;
    try { return await redis.get(key); }
    catch { return null; }
}

export async function redisSet(key: string, ttlSec: number, value: string): Promise<void> {
    if (!redis) return;
    try { await redis.setex(key, ttlSec, value); }
    catch { /* silencieux */ }
}

export async function redisIncr(key: string): Promise<number> {
    if (!redis) return 0;
    try { return await redis.incr(key); }
    catch { return 0; }
}

export async function redisPExpire(key: string, ms: number): Promise<void> {
    if (!redis) return;
    try { await redis.pexpire(key, ms); }
    catch { /* silencieux */ }
}

export async function redisPTTL(key: string): Promise<number> {
    if (!redis) return -1;
    try { return await redis.pttl(key); }
    catch { return -1; }
}
