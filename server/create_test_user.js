const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');

async function createTestUser() {
  const email = 'test@jobladder.com';
  const password = 'password123';
  const passwordHash = await bcrypt.hash(password, 10);
  
  await prisma.user.upsert({
    where: { email },
    update: { passwordHash, isVerified: true },
    create: {
      email,
      name: 'Frontend Test User',
      passwordHash,
      isVerified: true
    }
  });
  console.log(`Created/Updated test user: ${email} / ${password}`);
}

createTestUser().catch(console.error).finally(() => prisma.$disconnect());
