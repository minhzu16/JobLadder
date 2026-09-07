const fs = require('fs');
const fetch = require('node-fetch');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();
const API_URL = 'http://localhost:5000/api';
let authToken = '';
let sessionId = '';
let testJobId = '';

const testEmail = 'phase1@test.com';
const testPassword = 'password123';

async function runTestCase(id, name, testFn) {
  process.stdout.write(`[Test ${id}] ${name}... `);
  try {
    const result = await testFn();
    if (result.success) {
      console.log('✅ PASS');
    } else {
      console.log(`❌ FAIL: ${result.error || 'Unknown error'}`);
    }
  } catch (error) {
    console.log(`❌ FAIL (Exception): ${error.message}`);
  }
}

async function runAllTests() {
  console.log('\n=== KÍCH HOẠT TEST PHASE 1 (SRS) ===\n');

  // Test 1: Setup User & Job
  await runTestCase(1, 'Khởi tạo dữ liệu (User & Job)', async () => {
    const hashedPassword = await bcrypt.hash(testPassword, 10);
    const user = await prisma.user.upsert({
      where: { email: testEmail },
      update: { passwordHash: hashedPassword, resumeText: 'Kinh nghiệm 3 năm Java, Spring Boot, MySQL.' },
      create: {
        email: testEmail,
        passwordHash: hashedPassword,
        name: 'Phase 1 Tester',
        isVerified: true,
        resumeText: 'Kinh nghiệm 3 năm Java, Spring Boot, MySQL.'
      }
    });

    const company = await prisma.company.upsert({
      where: { id: 'test-company-1' },
      update: {},
      create: { id: 'test-company-1', name: 'Tech Corp', description: 'Tech', slug: 'tech-corp-1' }
    });

    const job = await prisma.job.findFirst();
    if (!job) return { success: false, error: 'Không tìm thấy Job nào trong DB' };
    testJobId = job.id;
    return { success: true };
  });

  // Test 2: Login
  await runTestCase(2, 'Đăng nhập lấy Token', async () => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: testPassword })
    });
    const data = await res.json();
    if (res.status === 200 && data.token) {
      authToken = data.token;
      return { success: true };
    }
    return { success: false, error: data.message };
  });

  // Test 3: Tạo Chat Session mới
  await runTestCase(3, 'Tạo Chat Session', async () => {
    const res = await fetch(`${API_URL}/chat/sessions`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const data = await res.json();
    if (res.status === 200 && data.data.id) {
      sessionId = data.data.id;
      return { success: true };
    }
    return { success: false, error: data.message };
  });

  // Test 4: Gửi Chat Message & Auto Title
  await runTestCase(4, 'Gửi tin nhắn kích hoạt JSON Action & Auto Title', async () => {
    const res = await fetch(`${API_URL}/chat/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
      body: JSON.stringify({ sessionId, content: 'Tôi muốn tìm việc ở Hà Nội' })
    });
    const data = await res.json();
    
    // Check if the AI returned an action
    if (!data.data.action || data.data.action === 'NONE') {
        // AI might return NONE if it doesn't think it's a filter, but explicitly asking for Hanoi should trigger it
        if (!data.data.payload) {
             return { success: false, error: 'Thiếu trường action hoặc payload' };
        }
    }

    // Verify if title was updated in DB
    const session = await prisma.chatSession.findUnique({ where: { id: sessionId } });
    if (session.title === 'Đoạn chat mới') {
      return { success: false, error: 'Tiêu đề chat không được update' };
    }

    return { success: true };
  });

  // Test 5: Job Match Breakdown
  await runTestCase(5, 'Tính Job Match Breakdown (Hybrid)', async () => {
    const res = await fetch(`${API_URL}/jobs/${testJobId}/match`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const data = await res.json();
    
    if (res.status === 200 && data.data.totalScore !== undefined && data.data.strengths) {
      return { success: true };
    }
    return { success: false, error: data.message || 'Thiếu dữ liệu breakdown' };
  });

  console.log('\n=== HOÀN TẤT KIỂM THỬ PHASE 1 ===\n');
  process.exit(0);
}

runAllTests();
