import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { hashPassword } from "@/lib/auth-helpers";

// POST /api/register — Création de compte + Workspace V2
export async function POST(req: NextRequest) {
    try {
        const { name, email, password, workspaceName } = await req.json();

        if (!email || !workspaceName) {
            return NextResponse.json({ error: "Email et nom de workspace requis" }, { status: 400 });
        }

        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json({ error: "Cet email est déjà utilisé." }, { status: 400 });
        }

        // Note: En mode Keycloak, le mot de passe est géré par l'IAM. 
        // Cette route est conservée pour la compatibilité avec l'UI de démarrage.
        const hashedPassword = password ? await hashPassword(password) : null;

        const slug = workspaceName.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '') + '-' + Math.random().toString(36).substring(2, 5);

        // Transaction Prisma V2
        const result = await prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    name,
                    email,
                    password: hashedPassword,
                    // externalId utilisé pour Keycloak SSO (optionnel en mode local)
                    externalId: `local-${email}`,
                },
            });

            const ws = await tx.workspace.create({
                data: {
                    name: workspaceName,
                    slug: slug,
                },
            });

            // Création du lien Owner
            await tx.membership.create({
                data: {
                    userId: user.id,
                    workspaceId: ws.id,
                    role: "owner",
                }
            });

            return { user, ws };
        });

        return NextResponse.json({ success: true, userId: result.user.id, workspaceId: result.ws.id }, { status: 201 });
    } catch (err) {
        console.error("Register error:", err);
        return NextResponse.json({ error: "Erreur lors de la création du compte." }, { status: 500 });
    }
}
