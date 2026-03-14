import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function check() {
    const users = await prisma.user.count();
    const workspaces = await prisma.workspace.count();
    const memberships = await prisma.membership.count();

    console.log('--- DATABASE STATUS ---');
    console.log(`Users: ${users}`);
    console.log(`Workspaces: ${workspaces}`);
    console.log(`Memberships: ${memberships}`);

    if (users > 0 && workspaces > 0 && memberships > 0) {
        console.log('✅ Seed validation successful.');
    } else {
        console.log('❌ Seed validation failed.');
    }
}

check()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
