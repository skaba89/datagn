import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/db";

// GET /api/dashboards/[id]?workspaceId=xxx
export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get("workspaceId");
    if (!workspaceId) return NextResponse.json({ error: "workspaceId required" }, { status: 400 });

    const membership = await prisma.membership.findUnique({
        where: { userId_workspaceId: { userId: (session.user as any).id, workspaceId } }
    });
    if (!membership) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const dashboard = await prisma.dashboard.findUnique({
        where: { id: params.id },
        include: {
            charts: { include: { chart: true }, orderBy: { order: "asc" } },
            shareLinks: { select: { token: true, expiresAt: true } },
        },
    });

    if (!dashboard || dashboard.workspaceId !== workspaceId) {
        return NextResponse.json({ error: "Not Found" }, { status: 404 });
    }

    return NextResponse.json(dashboard);
}

// PATCH /api/dashboards/[id] — Renommer / mettre à jour
export async function PATCH(
    req: Request,
    { params }: { params: { id: string } }
) {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { name, description, workspaceId } = await req.json();
    if (!workspaceId) return NextResponse.json({ error: "workspaceId required" }, { status: 400 });

    const membership = await prisma.membership.findUnique({
        where: { userId_workspaceId: { userId: (session.user as any).id, workspaceId } }
    });
    if (!membership || !["owner", "admin", "editor"].includes(membership.role)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updated = await prisma.dashboard.update({
        where: { id: params.id },
        data: { ...(name && { name }), ...(description !== undefined && { description }) },
    });

    return NextResponse.json(updated);
}

// PUT /api/dashboards/[id] — Mise à jour complète (config, sourceType, etc.)
export async function PUT(
    req: Request,
    { params }: { params: { id: string } }
) {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const { name, description, sourceType, config, isPublic, workspaceId } = await req.json();
        
        if (!workspaceId) return NextResponse.json({ error: "workspaceId required" }, { status: 400 });

        // Vérifier membership (editor+)
        const membership = await prisma.membership.findUnique({
            where: { userId_workspaceId: { userId: (session.user as any).id, workspaceId } }
        });
        if (!membership || !["owner", "admin", "editor"].includes(membership.role)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const updated = await prisma.dashboard.update({
            where: { id: params.id },
            data: {
                ...(name && { name }),
                description: description !== undefined ? description : undefined,
                sourceType: sourceType !== undefined ? sourceType : undefined,
                config: config !== undefined ? config : undefined,
                isPublic: isPublic !== undefined ? isPublic : undefined,
            },
        });

        return NextResponse.json(updated);
    } catch (err: any) {
        console.error("[DASHBOARD_PUT_ERROR]", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// DELETE /api/dashboards/[id]
export async function DELETE(
    req: Request,
    { params }: { params: { id: string } }
) {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get("workspaceId");
    if (!workspaceId) return NextResponse.json({ error: "workspaceId required" }, { status: 400 });

    const membership = await prisma.membership.findUnique({
        where: { userId_workspaceId: { userId: (session.user as any).id, workspaceId } }
    });
    if (!membership || !["owner", "admin"].includes(membership.role)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.dashboard.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
}
