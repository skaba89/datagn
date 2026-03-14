import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/db";

// GET /api/jobs/[id] — Status d'un job async
export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const job = await prisma.jobRun.findUnique({
        where: { id: params.id },
        select: {
            id: true,
            type: true,
            status: true,
            createdAt: true,
            startedAt: true,
            finishedAt: true,
            attempts: true,
            error: true,
            resultJson: true,
            workspaceId: true,
        }
    });

    if (!job) {
        return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // Vérifier l'accès via workspace membership
    const membership = await prisma.membership.findUnique({
        where: {
            userId_workspaceId: {
                userId: (session.user as any).id,
                workspaceId: job.workspaceId,
            }
        }
    });

    if (!membership) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(job);
}
