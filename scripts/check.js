const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

async function main() {
    const users = await prisma.user.findMany();
    console.log(users.map(u => ({ email: u.email, pwd: u.password })));

    if (users.length > 0) {
        const match = await bcrypt.compare('password123', users[0].password);
        console.log("Password match for", users[0].email, ":", match);
    }
}
main().finally(() => prisma.$disconnect());
