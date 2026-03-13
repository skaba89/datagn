import { NextResponse } from "next/server";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import s3Client from "@/lib/storage/s3";
import { auth } from "@/auth";

export async function POST(req: Request) {
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { filename, contentType, workspaceId } = await req.json();

        if (!filename || !contentType || !workspaceId) {
            return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
        }

        // On génère une clé unique pour l'objet dans S3
        const objectKey = `workspaces/${workspaceId}/datasets/${Date.now()}-${filename}`;

        const command = new PutObjectCommand({
            Bucket: process.env.S3_BUCKET || "datagn",
            Key: objectKey,
            ContentType: contentType,
        });

        const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

        return NextResponse.json({ uploadUrl, objectKey });
    } catch (error) {
        console.error("[PRESIGN_ERROR]", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
