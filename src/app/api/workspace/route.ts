import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/db";

// GET /api/workspace — Récupère le workspace de l'utilisateur courant
export async function GET(req: Request) {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    try {
        const userId = (session.user as any).id;
        if (!userId) return NextResponse.json({ error: "Session invalide" }, { status: 401 });

        // Trouver les workspaces de l'utilisateur via membership
        const memberships = await prisma.membership.findMany({
            where: { userId },
            include: {
                workspace: {
                    include: {
                        _count: {
                            select: { dashboards: true, datasets: true, jobs: true }
                        }
                    }
                }
            }
        });

        if (memberships.length === 0) {
            return NextResponse.json({ error: "Aucun workspace associé" }, { status: 404 });
        }

        // Retourner le premier workspace (ou tous si multi-workspace)
        const workspace = memberships[0].workspace;
        const role = memberships[0].role;

        return NextResponse.json({
            ...workspace,
            role,
            memberships: memberships.map(m => ({
                workspaceId: m.workspace.id,
                workspaceName: m.workspace.name,
                role: m.role,
            }))
        });
    } catch (err) {
        console.error("[WORKSPACE_GET_ERROR]", err);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}

// PUT /api/workspace — Met à jour le workspace courant
export async function PUT(req: Request) {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    try {
        const { workspaceId, name } = await req.json();
        const userId = (session.user as any).id;

        if (!workspaceId) return NextResponse.json({ error: "workspaceId required" }, { status: 400 });

        // Vérifier que l'utilisateur a les droits admin/owner
        const membership = await prisma.membership.findUnique({
            where: { userId_workspaceId: { userId, workspaceId } }
        });
        if (!membership || !["owner", "admin"].includes(membership.role)) {
            return NextResponse.json({ error: "Privilèges insuffisants" }, { status: 403 });
        }

        const updated = await prisma.workspace.update({
            where: { id: workspaceId },
            data: { ...(name && { name }) }
        });
        return NextResponse.json(updated);
    } catch (err) {
        console.error("[WORKSPACE_PUT_ERROR]", err);
        return NextResponse.json({ error: "Erreur lors de la mise à jour" }, { status: 500 });
    }
}

// DELETE /api/workspace — Supprime le workspace
export async function DELETE(req: Request) {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get("workspaceId");
    const userId = (session.user as any).id;

    if (!workspaceId) return NextResponse.json({ error: "workspaceId required" }, { status: 400 });

    // Seul l'owner peut supprimer un workspace
    const membership = await prisma.membership.findUnique({
        where: { userId_workspaceId: { userId, workspaceId } }
    });
    if (!membership || membership.role !== "owner") {
        return NextResponse.json({ error: "Seul le propriétaire peut supprimer le workspace" }, { status: 403 });
    }

    await prisma.workspace.delete({ where: { id: workspaceId } });
    return NextResponse.json({ success: true, message: "Workspace supprimé" });
}
