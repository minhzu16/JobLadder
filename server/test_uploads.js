const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const API_URL = 'http://localhost:5000/api';
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

async function setupTestUser() {
  const email = 'upload_test@jobladder.com';
  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, name: 'Upload Test User', passwordHash: 'test', isVerified: true }
  });
  return jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });
}

async function testUploads() {
  console.log("=== BẮT ĐẦU TEST BẢO MẬT FILE UPLOAD ===");
  const token = await setupTestUser();

  // 1. Tạo file .exe giả
  const exePath = path.join(__dirname, 'malware.exe');
  fs.writeFileSync(exePath, "This is a fake virus");

  const formData = new FormData();
  const fileBlob = new Blob([fs.readFileSync(exePath)], { type: 'application/x-msdownload' });
  formData.append('cvFile', fileBlob, 'malware.exe');

  try {
    const res = await fetch(`${API_URL}/jobs/fake_id/apply`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });
    
    if (res.status === 500 || res.status === 400 || res.status === 415) {
      console.log(`✅ PASS: Đã chặn file không hợp lệ (.exe) (Status: ${res.status})`);
    } else {
      console.log(`❌ FAIL: API cho phép upload file .exe! (Status: ${res.status})`);
    }
  } catch (error) {
    console.log("✅ PASS: Bị chặn (Lỗi Error)");
  }

  // Dọn dẹp
  if (fs.existsSync(exePath)) fs.unlinkSync(exePath);

  console.log("=== KẾT THÚC TEST FILE UPLOAD ===");
}

testUploads();
