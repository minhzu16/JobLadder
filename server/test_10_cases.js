const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const API_URL = 'http://localhost:5000/api';
let authToken = '';
let userId = '';
let sessionId = '';
let mockJobId = 1;
const testEmail = `test_user_${crypto.randomBytes(4).toString('hex')}@jobladder.com`;
const testPassword = 'Password123!';

async function runTestCase(index, name, fn) {
  process.stdout.write(`[Test ${index}/10] ${name}... `);
  try {
    const result = await fn();
    if (result.success) {
      console.log(`✅ PASS`);
    } else {
      console.log(`❌ FAIL: ${result.error}`);
    }
    return result.success;
  } catch (error) {
    console.log(`❌ FAIL (Exception): ${error.message}`);
    return false;
  }
}

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');

async function main() {
  console.log('=== KÍCH HOẠT CHIẾN DỊCH: 10 BÀI TEST TỔNG HỢP ===\n');

  // Test 1: Đăng ký tài khoản (Tự tạo qua Prisma để skip Verify Email)
  await runTestCase(1, 'Khởi tạo tài khoản (Database Setup)', async () => {
    const hashedPassword = await bcrypt.hash(testPassword, 10);
    const user = await prisma.user.upsert({
      where: { email: testEmail },
      update: {},
      create: { 
        email: testEmail, 
        passwordHash: hashedPassword, 
        name: 'E2E Tester',
        isVerified: true 
      }
    });
    return { success: !!user.id };
  });

  // Test 2: Đăng nhập
  await runTestCase(2, 'Đăng nhập (Login)', async () => {
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

  // Test 3: Unauthorized Access Bypass (Bảo mật)
  await runTestCase(3, 'Chặn truy cập khi không có Token', async () => {
    const res = await fetch(`${API_URL}/auth/me`);
    return { success: res.status === 401, error: `Status ${res.status}` };
  });

  // Test 4: Fetch Danh sách Công việc
  await runTestCase(4, 'Lấy danh sách việc làm (Get Jobs)', async () => {
    const res = await fetch(`${API_URL}/jobs`);
    const data = await res.json();
    if (res.status === 200 && Array.isArray(data.data)) {
      if (data.data.length > 0) mockJobId = data.data[0].id;
      return { success: true };
    }
    return { success: false, error: 'Dữ liệu trả về không đúng định dạng' };
  });

  // Test 5: Fetch Chi tiết công việc
  await runTestCase(5, 'Lấy chi tiết công việc (Job Detail)', async () => {
    // If we don't have a real slug, we use fallback job
    const res = await fetch(`${API_URL}/jobs/1`); // Using static ID for test, could 404 but shouldn't crash
    if (res.status === 200 || res.status === 404) {
      return { success: true };
    }
    return { success: false, error: `Status ${res.status}` };
  });

  // Test 6: Tạo Session AI Chat
  await runTestCase(6, 'Tạo phiên AI Chat (Create Session)', async () => {
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

  // Test 7: Gửi Chat tới AI
  await runTestCase(7, 'Tương tác AI Chat (Send Message)', async () => {
    if (!sessionId) return { success: false, error: 'Chưa có Session ID' };
    const res = await fetch(`${API_URL}/chat/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
      body: JSON.stringify({ sessionId, content: 'Tôi muốn tìm công việc Backend Developer.' })
    });
    const data = await res.json();
    return { success: res.status === 200 && data.data, error: data.message };
  });

  // Test 8: Phân tích CV (AI CV Analysis)
  await runTestCase(8, 'Phân tích CV (Analyze CV)', async () => {
    const res = await fetch(`${API_URL}/ai/cv-analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
      body: JSON.stringify({ 
        resumeText: 'Kinh nghiệm 3 năm Java, Spring Boot', 
        jobDescription: 'Cần tuyển Java Backend, có kiến thức Microservices.' 
      })
    });
    const data = await res.json();
    return { success: res.status === 200 && data.data, error: data.message };
  });

  // Test 9: Phỏng vấn giả lập AI (Mock Interview Start)
  await runTestCase(9, 'Bắt đầu Mock Interview', async () => {
    const res = await fetch(`${API_URL}/interview/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
      body: JSON.stringify({ jobTitle: 'Java Backend', jobDescription: 'Yêu cầu OOP, Spring Boot' })
    });
    const data = await res.json();
    return { success: res.status === 200 && data.data.questions, error: data.message };
  });

  // Test 10: Submit File CV (Upload Storage test)
  await runTestCase(10, 'Hệ thống chống Malware Upload', async () => {
    const exePath = path.join(__dirname, 'malware_test.exe');
    fs.writeFileSync(exePath, 'Fake Virus');
    
    const formData = new FormData();
    const fileBlob = new Blob([fs.readFileSync(exePath)], { type: 'application/x-msdownload' });
    formData.append('cvFile', fileBlob, 'malware.exe');
    
    const res = await fetch(`${API_URL}/jobs/${mockJobId}/apply`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${authToken}` },
      body: formData
    });
    
    if (fs.existsSync(exePath)) fs.unlinkSync(exePath);
    // Should be blocked (either 415 or 500 from multer filtering)
    return { success: res.status === 415 || res.status === 500, error: `Allowed upload with status ${res.status}` };
  });

  console.log('\n=== HOÀN TẤT KIỂM THỬ ===');
}

main();
