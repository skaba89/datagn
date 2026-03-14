import Anthropic from "@anthropic-ai/sdk";

// Inline prompt (same logic as src/lib/ai/prompts.ts but without path aliases)
const AI_MODEL = "claude-3-5-haiku-latest";
const AI_MAX_TOKENS = 2000;

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const schema = [
    { name: "date", type: "string", null_rate: 0, unique_count: 120, min: null, max: null, top_values: ["2024-01-01", "2024-01-02"] },
    { name: "revenue", type: "numeric", null_rate: 2.5, unique_count: 98, min: 150, max: 45000, top_values: [] },
    { name: "region", type: "string", null_rate: 0, unique_count: 5, min: null, max: null, top_values: ["Conakry", "Kankan", "Kindia"] },
    { name: "category", type: "string", null_rate: 1.2, unique_count: 8, min: null, max: null, top_values: ["Électronique", "Alimentation", "Textile"] },
];
const sample = [
    { date: "2024-01-01", revenue: 3200, region: "Conakry", category: "Électronique" },
    { date: "2024-01-02", revenue: 1800, region: "Kankan", category: "Alimentation" },
    { date: "2024-01-03", revenue: 5400, region: "Conakry", category: "Textile" },
];

const prompt = `Tu es un expert en analyse de données. Réponds UNIQUEMENT en JSON valide.

## Dataset: 500 lignes, 4 colonnes
${schema.map(c => `- ${c.name} (${c.type}): null=${c.null_rate}%, unique=${c.unique_count}`).join('\n')}

## Échantillon:
${JSON.stringify(sample, null, 2)}

## Question: Quelles sont les performances par région?

## Réponse JSON obligatoire:
{"summary":"...","insights":["..."],"anomalies":["..."],"recommended_charts":[{"type":"bar","title":"...","x":"...","y":"...","reason":"..."}],"kpis":[{"label":"...","value":"...","trend":"up|down|stable"}]}`;

async function test() {
    console.log("🤖 Testing structured AI analysis (Epic G)...\n");

    const response = await anthropic.messages.create({
        model: AI_MODEL,
        max_tokens: AI_MAX_TOKENS,
        messages: [{ role: "user", content: prompt }],
    });

    const rawText = (response.content[0] as any)?.text ?? "{}";

    try {
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        const parsed = JSON.parse(jsonMatch?.[0] ?? "{}");
        console.log("✅ JSON structured output VALID!\n");
        console.log("📊 Summary:", parsed.summary);
        console.log("💡 Insights:", parsed.insights);
        console.log("📈 Charts:", parsed.recommended_charts?.map((c: any) => `${c.type}: ${c.title}`));
        console.log("🎯 KPIs:", parsed.kpis?.map((k: any) => `${k.label}: ${k.value}`));
        console.log(`\n🔢 Tokens: in=${response.usage?.input_tokens} out=${response.usage?.output_tokens}`);
        console.log("\n✅ Epic G AI Structured Output Test PASSED! ✅");
    } catch {
        console.error("❌ JSON parse failed. Raw output:\n", rawText);
        process.exit(1);
    }
}

test().catch(err => {
    console.error("❌ Test FAILED:", err.message);
    process.exit(1);
});
