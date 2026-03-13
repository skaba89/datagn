import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/db";
import { logAudit } from "@/lib/audit";
import { WorkspaceRole } from "@prisma/client";

// POST /api/workspace/members — Ajouter/Inviter un membre
export async function POST(req: Request) {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    try {
        const { email, role, workspaceId } = await req.json();

        if (!email || !workspaceId) {
            return NextResponse.json({ error: "Email et workspaceId requis" }, { status: 400 });
        }

        // Vérifier les droits du demandeur (OWNER ou ADMIN)
        const requesterMembership = await prisma.membership.findUnique({
            where: {
                userId_workspaceId: {
                    userId: (session.user as any).id,
                    workspaceId: workspaceId,
                }
            }
        });

        if (!requesterMembership || !["owner", "admin"].includes(requesterMembership.role)) {
            return NextResponse.json({ error: "Privilèges insuffisants" }, { status: 403 });
        }

        // Trouver l'utilisateur cible par email
        let targetUser = await prisma.user.findUnique({ where: { email } });

        // En V2, si l'user n'existe pas, on pourrait le créer ou envoyer une invite.
        // Pour l'instant, on suppose qu'il doit exister ou on le crée a minima.
        if (!targetUser) {
            targetUser = await prisma.user.create({
                data: {
                    email,
                    name: email.split('@')[0],
                    externalId: `pending-${Date.now()}` // Placeholder externalId
                }
            });
        }

        // Créer le membership
        const membership = await prisma.membership.create({
            data: {
                workspaceId,
                userId: targetUser.id,
                role: (role as WorkspaceRole) || "viewer",
            }
        });

        // Logger l'audit
        await logAudit(
            (session.user as any).id,
            "INVITE_MEMBER",
            workspaceId,
            "Membership",
            membership.id,
            { target: email, role: membership.role }
        );

        return NextResponse.json(membership, { status: 201 });
    } catch (err: any) {
        if (err.code === 'P2002') return NextResponse.json({ error: "Cet utilisateur est déjà membre." }, { status: 400 });
        console.error("[MEMBERS_POST_ERROR]", err);
        return NextResponse.json({ error: "Erreur lors de l'invitation" }, { status: 500 });
    }
}

// DELETE /api/workspace/members?id=xxx&workspaceId=yyy
export async function DELETE(req: Request) {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const membershipId = searchParams.get("id");
    const workspaceId = searchParams.get("workspaceId");

    if (!membershipId || !workspaceId) {
        return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });
    }

    try {
        const userId = (session.user as any).id;

        // Vérifier les droits du demandeur
        const requesterMembership = await prisma.membership.findUnique({
            where: { userId_workspaceId: { userId, workspaceId } }
        });

        if (!requesterMembership || !["owner", "admin"].includes(requesterMembership.role)) {
            return NextResponse.json({ error: "Privilèges insuffisants" }, { status: 403 });
        }

        // Trouver le membre à supprimer
        const targetMembership = await prisma.membership.findUnique({
            where: { id: membershipId }
        });

        if (!targetMembership || targetMembership.workspaceId !== workspaceId) {
            return NextResponse.json({ error: "Membre non trouvé" }, { status: 404 });
        }

        if (targetMembership.role === "owner") {
            return NextResponse.json({ error: "Impossible de supprimer le propriétaire" }, { status: 403 });
        }

        await prisma.membership.delete({ where: { id: membershipId } });

        // Audit
        await logAudit(userId, "REMOVE_MEMBER", workspaceId, "Membership", membershipId);

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("[MEMBERS_DELETE_ERROR]", err);
        return NextResponse.json({ error: "Erreur lors de la suppression" }, { status: 500 });
    }
}
