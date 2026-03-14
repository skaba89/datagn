const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('--- SEEDING TEST USERS ---');

    const passwordHash = await bcrypt.hash('password123', 12);

    const users = [
        { email: 'admin@datagn.gn', name: 'Administrateur DataGN', role: 'ADMIN' },
        { email: 'director@datagn.gn', name: 'Directeur Stratégique', role: 'DIRECTOR' },
        { email: 'editor@datagn.gn', name: 'Éditeur Analyste', role: 'USER' }, // Role global USER, mais sera rattaché avec rôle spécifique
        { email: 'viewer@datagn.gn', name: 'Lecteur Curieux', role: 'USER' },
    ];

    for (const u of users) {
        const user = await prisma.user.upsert({
            where: { email: u.email },
            update: { password: passwordHash, role: u.role },
            create: {
                email: u.email,
                name: u.name,
                password: passwordHash,
                role: u.role,
            },
        });
        console.log(`✅ Utilisateur prêt : ${u.email} (Rôle global: ${u.role})`);

        // Créer un workspace automatique pour l'admin
        if (u.email === 'admin@datagn.gn') {
            const ws = await prisma.workspace.upsert({
                where: { id: 'test-workspace-id' },
                update: {},
                create: {
                    id: 'test-workspace-id',
                    name: 'Espace Démo Gouvernement',
                    userId: user.id,
                    plan: 'ENTERPRISE'
                }
            });

            // Ajouter le membre OWNER
            await prisma.workspaceMember.upsert({
                where: { workspaceId_userId: { workspaceId: ws.id, userId: user.id } },
                update: { role: 'OWNER' },
                create: {
                    workspaceId: ws.id,
                    userId: user.id,
                    role: 'OWNER',
                    status: 'ACTIVE'
                }
            });
            console.log(`🏠 Workspace Enterprise créé pour Admin`);
        }
    }

    console.log('--- SEEDING TERMINÉ ---');
    console.log('Identifiants communs :');
    console.log('Email : [un des emails ci-dessus]');
    console.log('Mot de passe : password123');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
