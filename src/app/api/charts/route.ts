import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/db";

// POST /api/charts — Créer un chart lié à une version de dataset
export async function POST(req: Request) {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const { name, type, configJson, datasetVersionId, workspaceId } = await req.json();

        if (!name || !type || !datasetVersionId || !workspaceId) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Vérifier le membership (editor+)
        const membership = await prisma.membership.findUnique({
            where: { userId_workspaceId: { userId: (session.user as any).id, workspaceId } }
        });
        if (!membership || !["owner", "admin", "editor"].includes(membership.role)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const chart = await prisma.chart.create({
            data: {
                name,
                type,
                configJson: configJson || {},
                datasetVersionId,
            },
        });

        return NextResponse.json(chart, { status: 201 });
    } catch (err: any) {
        console.error("[CHART_CREATE_ERROR]", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
