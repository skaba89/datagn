import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/db";

// POST /api/datasets — Créer un dataset en base de données post-upload
export async function POST(req: Request) {
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { workspaceId, name, sourceType, objectKey, originalName, contentType, sizeBytes } = await req.json();

        if (!workspaceId || !name || !sourceType || !objectKey) {
            return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
        }

        // Vérifier l'appartenance au workspace
        const membership = await prisma.membership.findUnique({
            where: {
                userId_workspaceId: {
                    userId: (session.user as any).id,
                    workspaceId,
                }
            }
        });

        if (!membership || !['owner', 'admin', 'editor'].includes(membership.role)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Créer le Dataset + la première DatasetVersion
        const dataset = await prisma.dataset.create({
            data: {
                name,
                sourceType,
                workspaceId,
                versions: {
                    create: {
                        version: 1,
                        objectKey,
                        originalName,
                        contentType,
                        sizeBytes: sizeBytes ? BigInt(sizeBytes) : null,
                        status: "uploaded",
                    }
                }
            },
            include: {
                versions: true,
            }
        });

        const datasetVersionId = dataset.versions[0].id;

        return NextResponse.json({
            datasetId: dataset.id,
            datasetVersionId,
        });
    } catch (error) {
        console.error("[DATASETS_CREATE_ERROR]", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// GET /api/datasets?workspaceId=xxx
export async function GET(req: Request) {
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get("workspaceId");

    if (!workspaceId) {
        return NextResponse.json({ error: "workspaceId required" }, { status: 400 });
    }

    // Vérifier l'appartenance
    const membership = await prisma.membership.findUnique({
        where: { userId_workspaceId: { userId: (session.user as any).id, workspaceId } }
    });
    if (!membership) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const datasets = await prisma.dataset.findMany({
        where: { workspaceId },
        include: {
            versions: {
                orderBy: { version: 'desc' },
                take: 1,
            }
        },
        orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(datasets);
}
