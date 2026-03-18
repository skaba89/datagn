import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/db";
import { AI_ANALYZE_PROMPT, AI_MAX_TOKENS, AI_MODEL } from "@/lib/ai/prompts";
import { groqJsonAnalysis, isGroqConfigured } from "@/lib/groq";

export async function POST(req: Request) {
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Vérifier que Groq est configuré
    if (!isGroqConfigured()) {
        return NextResponse.json({ 
            error: "Groq API non configurée. Veuillez définir GROQ_API_KEY dans vos variables d'environnement." 
        }, { status: 503 });
    }

    try {
        const { workspaceId, datasetVersionId, question } = await req.json();

        if (!workspaceId || !datasetVersionId) {
            return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
        }

        // Vérifier le membership
        const membership = await prisma.membership.findUnique({
            where: { userId_workspaceId: { userId: (session.user as any).id, workspaceId } }
        });
        if (!membership) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

        // Charger le profiling de la version du dataset
        const version = await prisma.datasetVersion.findUnique({
            where: { id: datasetVersionId },
            select: { schemaJson: true, sampleJson: true, rowCount: true, columnCount: true, status: true }
        });

        if (!version || version.status === "uploaded") {
            return NextResponse.json({
                error: "Dataset not yet profiled. Please wait for PROFILE_DATASET job to complete."
            }, { status: 409 });
        }

        // Construire le prompt structuré
        const prompt = AI_ANALYZE_PROMPT(
            (version.schemaJson as any[]) || [],
            (version.sampleJson as any[]) || [],
            version.rowCount || 0,
            version.columnCount || 0,
            question
        );

        // Appel à Groq avec JSON forcé
        const result = await groqJsonAnalysis({
            prompt,
            model: AI_MODEL,
            maxTokens: AI_MAX_TOKENS,
        });

        const analysisData = result.data;

        // Persister l'analyse en base
        const aiAnalysis = await prisma.aIAnalysis.create({
            data: {
                datasetVersionId,
                prompt,
                responseJson: analysisData,
                model: AI_MODEL,
                tokensIn: result.tokensIn,
                tokensOut: result.tokensOut,
            }
        });

        // Log audit
        await prisma.auditLog.create({
            data: {
                workspaceId,
                userId: (session.user as any).id,
                action: "AI_ANALYZE",
                entityType: "DatasetVersion",
                entityId: datasetVersionId,
                metaJson: { analysisId: aiAnalysis.id, model: AI_MODEL },
            }
        });

        return NextResponse.json({
            analysisId: aiAnalysis.id,
            ...analysisData,
            _meta: {
                tokensIn: result.tokensIn,
                tokensOut: result.tokensOut,
                model: AI_MODEL,
            }
        });

    } catch (error: any) {
        console.error("[AI_ANALYZE_ERROR]", error);
        return NextResponse.json({ error: "Internal Server Error", detail: error.message }, { status: 500 });
    }
}
