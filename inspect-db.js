const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
    try {
        console.log("=== DASHBOARDS INSPECTION ===");
        const dbs = await prisma.dashboard.findMany({
            select: {
                id: true,
                name: true,
                sourceType: true,
                config: true,
                updatedAt: true
            },
            orderBy: { updatedAt: 'desc' }
        });
        
        dbs.forEach(db => {
            console.log(`\nDashboard: ${db.name} (${db.id})`);
            console.log(`Type: ${db.sourceType}`);
            console.log(`Updated: ${db.updatedAt}`);
            console.log(`Has datasetId: ${!!(db.config && db.config.datasetId)}`);
            if (db.config && db.config.datasetId) {
                console.log(`DatasetID: ${db.config.datasetId}`);
            }
        });

        console.log("\n=== DATASETS INSPECTION ===");
        const datasets = await prisma.dataset.findMany({
            include: { versions: { orderBy: { version: 'desc' }, take: 1 } }
        });
        console.log(`Total datasets: ${datasets.length}`);
        datasets.forEach(ds => {
            console.log(`- Dataset: ${ds.name} (${ds.id}) | Key: ${ds.versions[0]?.objectKey}`);
        });

    } catch (e) {
        console.error("Error during inspection:", e);
    } finally {
        await prisma.$disconnect();
    }
}

run();
