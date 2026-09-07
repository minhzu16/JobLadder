const API_URL = 'http://localhost:5000/api';

async function testFullProject() {
  console.log('--- BẮT ĐẦU TEST END-TO-END PROJECT ---');
  
  try {
    const uniqueId = Date.now();
    const testUser = {
      name: 'Test User ' + uniqueId,
      email: `test${uniqueId}@example.com`,
      password: 'password123'
    };

    console.log('\n1. Đăng ký tài khoản mới trực tiếp qua Prisma (để skip verify)');
    const { PrismaClient } = require('@prisma/client');
    const jwt = require('jsonwebtoken');
    const prisma = new PrismaClient();
    const user = await prisma.user.create({
      data: {
        name: testUser.name,
        email: testUser.email,
        passwordHash: testUser.password,
        isVerified: true
      }
    });
    
    const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
    console.log('=> Đăng ký thành công. Token:', token.substring(0, 20) + '...');

    const headers = { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` 
    };

    console.log('\n2. Tải CV lên (Cập nhật Resume Text)');
    const cvUploadRes = await fetch(`${API_URL}/ai/upload-cv`, {
      method: 'POST', headers,
      body: JSON.stringify({
        cvText: 'Kinh nghiệm: 3 năm làm ReactJS, 2 năm làm Node.js. Kỹ năng: JavaScript, TypeScript, HTML, CSS, RESTful API.'
      })
    });
    const cvUploadData = await cvUploadRes.json();
    if (!cvUploadRes.ok) throw new Error(JSON.stringify(cvUploadData));
    console.log('=>', cvUploadData.message);

    console.log('\n3. Phân tích CV ATS (Tính vào Credit CV)');
    const cvAnalyzeRes = await fetch(`${API_URL}/ai/cv-analyze`, {
      method: 'POST', headers,
      body: JSON.stringify({
        resumeText: 'Kinh nghiệm: 3 năm làm ReactJS, 2 năm làm Node.js. Kỹ năng: JavaScript, TypeScript, HTML, CSS, RESTful API.',
        jobDescription: 'Cần tuyển Frontend Developer có kinh nghiệm ReactJS, TypeScript và kiến thức UI/UX.'
      })
    });
    const cvAnalyzeData = await cvAnalyzeRes.json();
    if (!cvAnalyzeRes.ok) throw new Error(JSON.stringify(cvAnalyzeData));
    console.log('=> CV Score:', cvAnalyzeData.data.score);
    console.log('=> Lời khuyên:', cvAnalyzeData.data.feedback.substring(0, 100) + '...');

    console.log('\n4. Bắt đầu Mock Interview (Tính vào Credit Interview)');
    const interviewStartRes = await fetch(`${API_URL}/interview/start`, {
      method: 'POST', headers,
      body: JSON.stringify({
        jobTitle: 'Frontend Developer',
        jobDescription: 'Cần tuyển Frontend Developer có kinh nghiệm ReactJS, TypeScript.'
      })
    });
    const interviewStartData = await interviewStartRes.json();
    if (!interviewStartRes.ok) throw new Error(JSON.stringify(interviewStartData));
    const sessionId = interviewStartData.data.sessionId;
    const questions = interviewStartData.data.questions;
    console.log('=> Đã tạo Session ID:', sessionId);
    console.log('=> Câu hỏi đầu tiên:', questions[0]);

    console.log('\n5. Trả lời câu hỏi Mock Interview');
    const answerRes = await fetch(`${API_URL}/interview/${sessionId}/answer`, {
      method: 'POST', headers,
      body: JSON.stringify({
        questionIndex: 0,
        answer: 'Tôi có 3 năm kinh nghiệm với React, đã từng build hệ thống Dashboard dùng Redux và Tailwind CSS.'
      })
    });
    const answerData = await answerRes.json();
    if (!answerRes.ok) throw new Error(JSON.stringify(answerData));
    console.log('=> Điểm cho câu trả lời:', answerData.data.score, '/10');
    console.log('=> Điểm mạnh:', answerData.data.strengths);

    console.log('\n6. Lấy dữ liệu Dashboard (Kiểm tra Credit Limits)');
    const dashboardRes = await fetch(`${API_URL}/dashboard`, { headers });
    const dashboardData = await dashboardRes.json();
    if (!dashboardRes.ok) throw new Error(JSON.stringify(dashboardData));
    
    const usage = dashboardData.data.subscription.usage;
    console.log('=> Dashboard Data Lấy thành công!');
    console.log('=> CV Limit Used:', usage.cv.used, '/', usage.cv.limit);
    console.log('=> Interview Limit Used:', usage.interview.used, '/', usage.interview.limit);

    console.log('\n--- TẤT CẢ API CHẠY THÀNH CÔNG ---');
  } catch (error) {
    console.error('\n!!! TEST THẤT BẠI !!!');
    console.error('Lỗi hệ thống:', error.message || error);
  }
}

testFullProject();
