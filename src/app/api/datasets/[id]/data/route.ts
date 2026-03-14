import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/db";
import s3Client from "@/lib/storage/s3";
import { GetObjectCommand } from "@aws-sdk/client-s3";

export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get("workspaceId");

    if (!workspaceId) return NextResponse.json({ error: "workspaceId required" }, { status: 400 });

    try {
        // 1. Vérifier membership
        const membership = await prisma.membership.findUnique({
            where: { userId_workspaceId: { userId: (session.user as any).id, workspaceId } }
        });
        if (!membership) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

        // 2. Trouver la dernière version du dataset
        const dataset = await prisma.dataset.findUnique({
            where: { id: params.id },
            include: {
                versions: {
                    orderBy: { version: 'desc' },
                    take: 1
                }
            }
        });

        if (!dataset || dataset.workspaceId !== workspaceId || !dataset.versions.length) {
            return NextResponse.json({ error: "Dataset not found" }, { status: 404 });
        }

        const version = dataset.versions[0];

        // 3. Récupérer depuis S3
        const command = new GetObjectCommand({
            Bucket: process.env.S3_BUCKET || "datagn",
            Key: version.objectKey,
        });

        const response = await s3Client.send(command);

        if (!response.Body) {
             return NextResponse.json({ error: "Empty body from storage" }, { status: 500 });
        }

        // 4. Renvoyer le flux
        return new Response(response.Body as any, {
            headers: {
                "Content-Type": version.contentType || "text/csv",
                "Content-Disposition": `attachment; filename="${version.originalName || 'data.csv'}"`,
            }
        });

    } catch (err: any) {
        console.error("[DATASET_GET_DATA_ERROR]", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
