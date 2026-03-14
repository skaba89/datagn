import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function check() {
    console.log("--- Diagnostic Auth DataGN ---");
    try {
        const users = await prisma.user.findMany();
        console.log("Nombre d'utilisateurs:", users.length);

        const admin = users.find(u => u.email === 'admin@datagn.com');
        if (!admin) {
            console.error("❌ admin@datagn.com non trouvé !");
        } else {
            console.log("✅ Admin trouvé. ID:", admin.id);
            console.log("✅ Password Hash:", admin.password ? "Présent" : "ABSENT");
            if (admin.password) {
                const match = await bcrypt.compare("admin123", admin.password);
                console.log("✅ Vérification 'admin123':", match);
            }
        }
    } catch (e) {
        console.error("❌ Erreur Prisma:", e);
    } finally {
        await prisma.$disconnect();
    }
}

check();
