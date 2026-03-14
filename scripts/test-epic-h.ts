import { PrismaClient } from "@prisma/client";
import { randomBytes } from "crypto";

const prisma = new PrismaClient();

async function testEpicH() {
    console.log("🧪 Testing Epic H — Dashboard Builder V2 + Partage\n");

    // 1. Get workspace
    const ws = await prisma.workspace.findFirst();
    if (!ws) { console.error("❌ No workspace found!"); process.exit(1); }
    console.log(`✅ Workspace: ${ws.name} (${ws.id})`);

    // 2. Create a Dashboard
    const dashboard = await prisma.dashboard.create({
        data: {
            name: "Dashboard V2 Test",
            description: "Test Epic H",
            workspaceId: ws.id,
        },
    });
    console.log(`✅ Dashboard created: ${dashboard.name} (${dashboard.id})`);

    // 3. Create a ShareLink
    const token = randomBytes(16).toString("hex");
    const shareLink = await prisma.shareLink.create({
        data: {
            token,
            dashboardId: dashboard.id,
            expiresAt: new Date(Date.now() + 7 * 86400000),
        },
    });
    console.log(`✅ ShareLink created: /p/${shareLink.token}`);

    // 4. Query Dashboard with relations
    const full = await prisma.dashboard.findUnique({
        where: { id: dashboard.id },
        include: {
            shareLinks: true,
            charts: { include: { chart: true } },
        },
    });
    console.log(`✅ Dashboard queried with ${full?.shareLinks.length} share links and ${full?.charts.length} charts`);

    // 5. Cleanup
    await prisma.shareLink.delete({ where: { id: shareLink.id } });
    await prisma.dashboard.delete({ where: { id: dashboard.id } });
    console.log("✅ Cleanup done");

    console.log("\n✅ Epic H — Dashboard Builder V2 Test PASSED! ✅");
}

testEpicH()
    .then(() => prisma.$disconnect())
    .catch(async (e) => {
        console.error("❌ Test FAILED:", e);
        await prisma.$disconnect();
        process.exit(1);
    });
