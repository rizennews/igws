const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  await prisma.admin.deleteMany({ where: { username: 'admin' } });
  console.log('Deleted admin');
}

run().catch(console.error).finally(() => prisma.$disconnect());
