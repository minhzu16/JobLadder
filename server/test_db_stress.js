const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');

const API_URL = 'http://localhost:5000/api';
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

async function setupTestUser() {
  const email = 'stress_test@jobladder.com';
  // Ensure user has exactly 3 CV credits
  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, name: 'Stress Test User', passwordHash: 'test', isVerified: true }
  });

  await prisma.userSubscription.upsert({
    where: { userId: user.id },
    update: { planId: 'FREE', cvAnalysisUsed: 0, interviewUsed: 0 },
    create: { userId: user.id, planId: 'FREE', cvAnalysisUsed: 0, interviewUsed: 0 }
  });

  return jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });
}

async function testRaceCondition() {
  console.log("=== BẮT ĐẦU TEST DATABASE RACE CONDITION ===");
  const token = await setupTestUser();

  console.log("Bắn 10 request đồng thời (Concurrent)...");
  
  // Create 10 concurrent requests
  const promises = Array.from({ length: 10 }).map(async (_, i) => {
    try {
      const res = await fetch(`${API_URL}/ai/cv-analyze`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ resumeText: "Dummy CV text" })
      });
      return res.status;
    } catch (e) {
      return 'error';
    }
  });

  const statuses = await Promise.all(promises);
  console.log("Trạng thái HTTP trả về của 10 request:", statuses);

  // Check database after
  const user = await prisma.user.findUnique({ where: { email: 'stress_test@jobladder.com' } });
  const sub = await prisma.userSubscription.findUnique({ where: { userId: user.id } });

  console.log(`Credit đã sử dụng (Expected max: 3): ${sub.cvAnalysisUsed}`);
  if (sub.cvAnalysisUsed > 3) {
    console.log("❌ FAIL: LỖI RACE CONDITION! DB vượt quá giới hạn 3.");
  } else {
    console.log("✅ PASS: Hệ thống chặn hoàn hảo, không bị Race Condition.");
  }

  console.log("=== KẾT THÚC TEST ===");
  await prisma.$disconnect();
}

testRaceCondition();
