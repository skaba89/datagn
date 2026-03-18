import { Worker, Job } from "bullmq";
import prisma from "@/lib/db";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { DataGNJobPayload, redisConnection } from "./queue";
import { groqJsonAnalysis, isGroqConfigured, GROQ_MODELS } from "@/lib/groq";

const s3 = new S3Client({
    region: process.env.S3_REGION || "us-east-1",
    endpoint: process.env.S3_ENDPOINT || "http://localhost:9000",
    forcePathStyle: true,
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY || "minioadmin",
        secretAccessKey: process.env.S3_SECRET_KEY || "minioadmin",
    },
});

// --- Worker unique qui gère tous les types de jobs ---
export const dataGNWorker = new Worker<DataGNJobPayload>(
    "datagn-jobs",
    async (job: Job<DataGNJobPayload>) => {
        const { type, jobRunId } = job.data;

        // Marquer le job comme "running" en DB
        await prisma.jobRun.update({
            where: { id: jobRunId },
            data: { status: "running", startedAt: new Date(), attempts: job.attemptsMade + 1 },
        });

        try {
            let result: object = {};

            if (type === "PROFILE_DATASET") {
                result = await runProfileDataset(job.data);
            } else if (type === "AI_ANALYZE") {
                result = await runAIAnalyze(job.data);
            }

            // Marquer le job comme "success"
            await prisma.jobRun.update({
                where: { id: jobRunId },
                data: { status: "success", finishedAt: new Date(), resultJson: result },
            });

            return result;
        } catch (err: any) {
            // Marquer le job comme "failed"
            await prisma.jobRun.update({
                where: { id: jobRunId },
                data: { status: "failed", finishedAt: new Date(), error: err.message },
            });
            throw err;
        }
    },
    { connection: redisConnection, concurrency: 2 }
);

// --- Logique PROFILE_DATASET ---
async function runProfileDataset(data: DataGNJobPayload) {
    const { datasetVersionId } = data;
    if (!datasetVersionId) throw new Error("No datasetVersionId");

    const version = await prisma.datasetVersion.findUniqueOrThrow({
        where: { id: datasetVersionId },
    });

    // Télécharger le fichier depuis MinIO
    const s3Obj = await s3.send(new GetObjectCommand({ Bucket: process.env.S3_BUCKET || "datagn", Key: version.objectKey }));
    const csvText = await s3Obj.Body!.transformToString();

    const rows = csvText.split("\n").filter(Boolean);
    const headers = rows[0]?.split(",") ?? [];
    const dataRows = rows.slice(1);

    const rowCount = dataRows.length;
    const columnCount = headers.length;

    // Profiling basique par colonne (Optimisé pour éviter les Maps massives)
    const schemaJson = headers.map((col, colIdx) => {
        let nonNullCount = 0;
        let sum = 0;
        let min = Infinity;
        let max = -Infinity;
        const uniqueValues = new Set<string>();
        let isNumeric = true;

        dataRows.forEach(r => {
            const cells = r.split(",");
            const raw = cells[colIdx]?.trim() ?? "";
            if (raw !== "") {
                nonNullCount++;
                uniqueValues.add(raw);
                const n = Number(raw);
                if (!isNaN(n)) {
                    sum += n;
                    if (n < min) min = n;
                    if (n > max) max = n;
                } else {
                    isNumeric = false;
                }
            }
        });

        const nullRate = ((dataRows.length - nonNullCount) / dataRows.length) * 100;

        return {
            name: col.trim(),
            type: isNumeric && nonNullCount > 0 ? "numeric" : "string",
            null_rate: Math.round(nullRate * 10) / 10,
            unique_count: uniqueValues.size,
            min: isNumeric && nonNullCount > 0 ? min : null,
            max: isNumeric && nonNullCount > 0 ? max : null,
            top_values: Array.from(uniqueValues).slice(0, 5),
        };
    });

    const sampleJson = dataRows.slice(0, 10).map((r) => {
        const cells = r.split(",");
        return Object.fromEntries(headers.map((h, i) => [h.trim(), cells[i]?.trim() ?? ""]));
    });

    // Persist le profiling en base
    await prisma.datasetVersion.update({
        where: { id: datasetVersionId },
        data: {
            rowCount, columnCount,
            schemaJson, sampleJson,
            profileJson: { profiled_at: new Date().toISOString() },
            status: "profiled",
        },
    });

    return { rowCount, columnCount, columnsProfiled: schemaJson.length };
}

// --- Logique AI_ANALYZE (avec Groq) ---
async function runAIAnalyze(data: DataGNJobPayload) {
    const { datasetVersionId, question } = data;
    if (!datasetVersionId) throw new Error("No datasetVersionId");

    // Vérifier que Groq est configuré
    if (!isGroqConfigured()) {
        throw new Error("Groq API non configurée. Veuillez définir GROQ_API_KEY.");
    }

    const version = await prisma.datasetVersion.findUniqueOrThrow({
        where: { id: datasetVersionId },
        select: { schemaJson: true, sampleJson: true, rowCount: true, columnCount: true }
    });

    const prompt = `Tu es un expert en analyse de données. Voici le profil statistique d'un dataset:
- Lignes: ${version.rowCount}, Colonnes: ${version.columnCount}
- Schéma: ${JSON.stringify(version.schemaJson, null, 2)}
- Échantillon (10 lignes): ${JSON.stringify(version.sampleJson, null, 2)}

Question: ${question || "Donne une analyse générale, 3 insights clés, et recommande des types de graphiques adaptés."}

Réponds en JSON avec ce format exact:
{
  "summary": "Résumé en 2-3 phrases",
  "insights": ["insight 1", "insight 2", "insight 3"],
  "anomalies": ["anomalie 1 ou null"],
  "recommended_charts": [
    {"type": "bar|line|pie|scatter", "x": "nom_col", "y": "nom_col", "reason": "pourquoi"}
  ]
}`;

    const result = await groqJsonAnalysis({
        prompt,
        model: GROQ_MODELS.LLAMA_70B,
        maxTokens: 1500,
    });

    const responseJson = result.data;

    // Stocker l'analyse en base
    await prisma.aIAnalysis.create({
        data: {
            datasetVersionId,
            prompt,
            responseJson,
            model: GROQ_MODELS.LLAMA_70B,
            tokensIn: result.tokensIn,
            tokensOut: result.tokensOut,
        },
    });

    return responseJson;
}
