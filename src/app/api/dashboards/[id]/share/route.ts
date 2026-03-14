import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/db";
import { randomBytes } from "crypto";

// POST /api/dashboards/[id]/share — Génère un lien de partage read-only
export async function POST(
    req: Request,
    { params }: { params: { id: string } }
) {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { workspaceId, expiresInDays } = await req.json();
    if (!workspaceId) return NextResponse.json({ error: "workspaceId required" }, { status: 400 });

    // Vérifier le membership (editor+)
    const membership = await prisma.membership.findUnique({
        where: { userId_workspaceId: { userId: (session.user as any).id, workspaceId } }
    });
    if (!membership || !["owner", "admin", "editor"].includes(membership.role)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Vérifier que le dashboard appartient au workspace
    const dashboard = await prisma.dashboard.findUnique({
        where: { id: params.id },
    });
    if (!dashboard || dashboard.workspaceId !== workspaceId) {
        return NextResponse.json({ error: "Dashboard not found" }, { status: 404 });
    }

    // Générer un token signé unique
    const token = randomBytes(32).toString("hex");
    const expiresAt = expiresInDays
        ? new Date(Date.now() + expiresInDays * 86400000)
        : null;

    const shareLink = await prisma.shareLink.create({
        data: {
            token,
            dashboardId: params.id,
            expiresAt,
        },
    });

    // Audit log
    await prisma.auditLog.create({
        data: {
            workspaceId,
            userId: (session.user as any).id,
            action: "SHARE_DASHBOARD",
            entityType: "Dashboard",
            entityId: params.id,
            metaJson: { token, expiresAt },
        },
    });

    const shareUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/p/${token}`;

    return NextResponse.json({
        token,
        shareUrl,
        expiresAt,
    });
}

// GET /api/dashboards/[id]/share — Liste les liens de partage
export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const links = await prisma.shareLink.findMany({
        where: { dashboardId: params.id },
        orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(links);
}
