import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { auth } from '@/auth';

// Helper pour vérifier le membership
async function checkMembership(session: any, workspaceId: string | null) {
    if (!session?.user || !workspaceId) return false;
    const membership = await prisma.membership.findUnique({
        where: { userId_workspaceId: { userId: (session.user as any).id, workspaceId } }
    });
    return !!membership;
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/annotations?dashboardId=xxx&workspaceId=yyy
// ─────────────────────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const dashboardId = searchParams.get('dashboardId');
    const workspaceId = searchParams.get('workspaceId');

    if (!dashboardId) {
        return NextResponse.json({ error: 'dashboardId est requis' }, { status: 400 });
    }

    try {
        const session = await auth();
        // annotations publiques si le dashboard est public,
        // mais ici on suit la logique de workspaceId pour la sécurité.
        if (workspaceId) {
            const hasAccess = await checkMembership(session, workspaceId);
            if (!hasAccess) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
        }

        const annotations = await (prisma as any).annotation.findMany({
            where: { dashboardId },
            orderBy: { createdAt: 'desc' },
        });
        return NextResponse.json(annotations);
    } catch (err: any) {
        console.error('[GET /api/annotations]', err);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/annotations
// { dashboardId, point, text, user, workspaceId }
// ─────────────────────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        const body = await req.json();
        const { dashboardId, point, text, user, workspaceId } = body;

        if (!dashboardId || !point || !text) {
            return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 });
        }

        if (workspaceId) {
            const hasAccess = await checkMembership(session, workspaceId);
            if (!hasAccess) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
        }

        const annotation = await (prisma as any).annotation.create({
            data: {
                dashboardId,
                point,
                text,
                userName: (session?.user?.name || user || 'Utilisateur Anonyme'),
            },
        });

        return NextResponse.json(annotation, { status: 201 });
    } catch (err: any) {
        console.error('[POST /api/annotations]', err);
        return NextResponse.json({ error: 'Erreur Serveur' }, { status: 500 });
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/annotations?id=xxx&workspaceId=yyy
// ─────────────────────────────────────────────────────────────────────────────
export async function DELETE(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const workspaceId = searchParams.get('workspaceId');

    if (!id) {
        return NextResponse.json({ error: 'id est requis' }, { status: 400 });
    }

    try {
        const session = await auth();
        if (workspaceId) {
            const hasAccess = await checkMembership(session, workspaceId);
            if (!hasAccess) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
        }

        await (prisma as any).annotation.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (err: any) {
        console.error('[DELETE /api/annotations]', err);
        return NextResponse.json({ error: 'Annotation introuvable ou déjà supprimée' }, { status: 404 });
    }
}
