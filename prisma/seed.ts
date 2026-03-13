import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Début du seed de la base de données...')

    // 1. Créer un Workspace de Démo
    const demoWorkspace = await prisma.workspace.upsert({
        where: { slug: 'datagn-demo' },
        update: {},
        create: {
            name: 'DataGN Démo',
            slug: 'datagn-demo',
        },
    })

    console.log(`✅ Workspace créé: ${demoWorkspace.name} (${demoWorkspace.id})`)

    // 2. Créer un Utilisateur Administrateur par défaut avec mot de passe (Fail-safe)
    const adminUser = await prisma.user.upsert({
        where: { email: 'admin@datagn.com' },
        update: {
            password: '$2b$12$dn.0fCS4BcUEUUtAzYjU7OU/zJ/EgQNlWdHZ1geEFPpCG9xMvUdmi', // admin123
        },
        create: {
            email: 'admin@datagn.com',
            name: 'Admin DataGN',
            password: '$2b$12$dn.0fCS4BcUEUUtAzYjU7OU/zJ/EgQNlWdHZ1geEFPpCG9xMvUdmi', // admin123
            externalId: 'keycloak-admin-sub-placeholder',
        },
    })

    console.log(`✅ Utilisateur créé: ${adminUser.email}`)

    // 3. Associer l'utilisateur au Workspace (Owner)
    await prisma.membership.upsert({
        where: {
            userId_workspaceId: {
                userId: adminUser.id,
                workspaceId: demoWorkspace.id,
            }
        },
        update: {},
        create: {
            userId: adminUser.id,
            workspaceId: demoWorkspace.id,
            role: 'owner',
        },
    })

    console.log(`✅ Membership Owner créé pour ${adminUser.email} dans ${demoWorkspace.name}`)

    console.log('✅ Seed terminé avec succès !')
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
