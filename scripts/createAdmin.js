const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const username = process.argv[2];
  const password = process.argv[3];
  const isSuper = process.argv[4] === '--super';

  if (!username || !password) {
    console.error('Usage: node scripts/createAdmin.js <username> <password> [--super]');
    process.exit(1);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const admin = await prisma.admin.create({
      data: {
        username,
        password: hashedPassword,
        role: isSuper ? 'SUPER_ADMIN' : 'ADMIN'
      },
    });
    console.log(`Successfully created admin user: ${admin.username}`);
  } catch (err) {
    if (err.code === 'P2002') {
      console.error('An admin with that username already exists.');
    } else {
      console.error('Failed to create admin:', err);
    }
  } finally {
    await prisma.$disconnect();
  }
}

main();
