import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/db";

// GET /api/dashboards?workspaceId=xxx — Liste les dashboards du workspace
export async function GET(req: Request) {
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get("workspaceId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    if (!workspaceId) {
        return NextResponse.json({ error: "workspaceId required" }, { status: 400 });
    }

    // Vérifier membership
    const membership = await prisma.membership.findUnique({
        where: { userId_workspaceId: { userId: (session.user as any).id, workspaceId } }
    });
    if (!membership) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const skip = (page - 1) * limit;

    const [dashboards, total] = await Promise.all([
        prisma.dashboard.findMany({
            where: { workspaceId },
            orderBy: { updatedAt: "desc" },
            skip,
            take: limit,
            include: {
                charts: {
                    include: { chart: true },
                    orderBy: { order: "asc" },
                },
                shareLinks: { select: { token: true, expiresAt: true } },
            },
        }),
        prisma.dashboard.count({ where: { workspaceId } }),
    ]);

    return NextResponse.json({
        dashboards,
        total,
        page,
        totalPages: Math.ceil(total / limit),
    });
}

// POST /api/dashboards — Créer un nouveau dashboard
export async function POST(req: Request) {
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { workspaceId, name, description, sourceType, config } = await req.json();

        if (!workspaceId || !name) {
            return NextResponse.json({ error: "workspaceId and name required" }, { status: 400 });
        }

        // Vérifier membership (editor+)
        const membership = await prisma.membership.findUnique({
            where: { userId_workspaceId: { userId: (session.user as any).id, workspaceId } }
        });
        if (!membership || !["owner", "admin", "editor"].includes(membership.role)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const dashboard = await prisma.dashboard.create({
            data: { 
                name, 
                description, 
                workspaceId,
                sourceType: sourceType || 'csv',
                config: config || {}
            },
        });

        return NextResponse.json(dashboard, { status: 201 });
    } catch (err: any) {
        console.error("[DASHBOARD_CREATE_ERROR]", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
