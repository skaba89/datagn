import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient().$extends({
    query: {
        $allModels: {
            async $allOperations({ model, operation, args, query }) {
                const context = (args as any).context;
                if (context?.workspaceId) {
                    await (prisma as any).$executeRawUnsafe(`SET app.current_workspace_id = '${context.workspaceId}'`);
                } else {
                    // Try to reset, but it might fail because we removed the 'true' in SQL if not set
                    try {
                        await (prisma as any).$executeRawUnsafe(`RESET app.current_workspace_id`);
                    } catch (e) {}
                }
                const { context: _, ...actualArgs } = args as any;
                return query(actualArgs);
            },
        },
    },
});

async function main() {
    console.log("🚀 Starting RLS Verification...");

    const uniqueId = Date.now();
    const ws1 = await (prisma as any).workspace.create({
        data: { name: "Workspace 1", slug: "ws1-" + uniqueId },
        context: { workspaceId: "temp" } // We need a context to bypass since we made it strict
    } as any).catch(async () => {
        // Fallback for creation: set it manually once for the session start
        await (prisma as any).$executeRawUnsafe(`SET app.current_workspace_id = 'initial'`);
        return await (prisma as any).workspace.create({
            data: { name: "Workspace 1", slug: "ws1-" + uniqueId }
        });
    });

    // After creation, we need to allow the session to see its own workspace for further setup
    await (prisma as any).$executeRawUnsafe(`SET app.current_workspace_id = '${ws1.id}'`);

    const ws2 = await (prisma as any).workspace.create({
        data: { name: "Workspace 2", slug: "ws2-" + uniqueId }
    });

    console.log(`✅ Created ${ws1.name} (${ws1.id}) and ${ws2.name} (${ws2.id})`);

    // 2. Create datasets
    await (prisma as any).dataset.create({
        data: { name: "WS1 Dataset " + uniqueId, workspaceId: ws1.id, sourceType: 'upload' },
        context: { workspaceId: ws1.id }
    });

    await (prisma as any).dataset.create({
        data: { name: "WS2 Dataset " + uniqueId, workspaceId: ws2.id, sourceType: 'upload' },
        context: { workspaceId: ws2.id }
    });

    console.log("✅ Created datasets for both workspaces.");

    // 4. Test RLS for Workspace 1
    console.log("\n🔍 Testing RLS context for Workspace 1...");
    const ws1Data = await (prisma as any).dataset.findMany({
        where: { name: { contains: uniqueId.toString() } },
        context: { workspaceId: ws1.id }
    } as any);

    console.log(`Results for WS1: ${ws1Data.length} records found.`);
    ws1Data.forEach((d: any) => console.log(` - ${d.name}`));

    if (ws1Data.length === 1 && ws1Data[0].name.includes("WS1 Dataset")) {
        console.log("✨ PASS: RLS isolation works for Workspace 1.");
    } else {
        console.error("❌ FAIL: RLS isolation failed for Workspace 1.");
    }

    // 5. Test RLS for Workspace 2
    console.log("\n🔍 Testing RLS context for Workspace 2...");
    const ws2Data = await (prisma as any).dataset.findMany({
        where: { name: { contains: uniqueId.toString() } },
        context: { workspaceId: ws2.id }
    } as any);

    console.log(`Results for WS2: ${ws2Data.length} records found.`);
    ws2Data.forEach((d: any) => console.log(` - ${d.name}`));

    if (ws2Data.length === 1 && ws2Data[0].name.includes("WS2 Dataset")) {
        console.log("✨ PASS: RLS isolation works for Workspace 2.");
    } else {
        console.error("❌ FAIL: RLS isolation failed for Workspace 2.");
    }
}

main()
    .then(async () => {
        await (prisma as any).$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await (prisma as any).$disconnect();
        process.exit(1);
    });
