import bcrypt from 'bcryptjs';

async function run() {
    const hash = await bcrypt.hash("admin123", 12);
    console.log(hash);
}
run();
