import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getCorsHeaders } from '@/lib/cors';
import { redisGet, redisSet } from '@/lib/redis';

export async function GET(
    req: NextRequest,
    { params }: { params: { token: string } }
) {
    const origin = req.headers.get('origin');
    const corsH = getCorsHeaders(origin);

    const cacheKey = `share:dashboard:${params.token}`;
    try {
        const cached = await redisGet(cacheKey);
        if (cached) {
            const dashboard = JSON.parse(cached);
            return NextResponse.json({ dashboard }, { status: 200, headers: corsH });
        }
    } catch (e) {
        console.warn('[Redis] Cache read error:', e);
    }

    try {
        // En V2, on cherche dans la table ShareLink
        const shareLink = await prisma.shareLink.findUnique({
            where: { token: params.token },
            include: {
                dashboard: {
                    include: {
                        workspace: true,
                        charts: {
                            include: {
                                chart: {
                                    include: {
                                        datasetVersion: true
                                    }
                                }
                            },
                            orderBy: { order: 'asc' }
                        }
                    }
                }
            }
        });

        if (!shareLink) {
            return NextResponse.json({ error: "Lien de partage introuvable" }, { status: 404, headers: corsH });
        }

        // Vérifier l'expiration
        if (shareLink.expiresAt && new Date() > shareLink.expiresAt) {
            return NextResponse.json({ error: "Ce lien de partage a expiré" }, { status: 410, headers: corsH });
        }

        try {
            await redisSet(cacheKey, 60, JSON.stringify(shareLink.dashboard));
        } catch (e) {
            console.warn('[Redis] Cache write error:', e);
        }

        return NextResponse.json({ dashboard: shareLink.dashboard }, { status: 200, headers: corsH });
    } catch (error) {
        console.error('[Share API] Error:', error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500, headers: corsH });
    }
}
