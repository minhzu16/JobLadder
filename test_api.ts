import axios from 'axios';

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

    console.log('\n1. Đăng ký tài khoản mới:', testUser.email);
    const registerRes = await axios.post(`${API_URL}/auth/register`, testUser);
    const token = registerRes.data.data.token;
    console.log('=> Đăng ký thành công. Token:', token.substring(0, 20) + '...');

    const headers = { Authorization: `Bearer ${token}` };

    console.log('\n2. Tải CV lên (Cập nhật Resume Text)');
    const cvUploadRes = await axios.post(`${API_URL}/ai/upload-cv`, {
      cvText: 'Kinh nghiệm: 3 năm làm ReactJS, 2 năm làm Node.js. Kỹ năng: JavaScript, TypeScript, HTML, CSS, RESTful API.'
    }, { headers });
    console.log('=>', cvUploadRes.data.message);

    console.log('\n3. Phân tích CV ATS (Tính vào Credit CV)');
    const cvAnalyzeRes = await axios.post(`${API_URL}/ai/cv-analyze`, {
      resumeText: 'Kinh nghiệm: 3 năm làm ReactJS, 2 năm làm Node.js. Kỹ năng: JavaScript, TypeScript, HTML, CSS, RESTful API.',
      jobDescription: 'Cần tuyển Frontend Developer có kinh nghiệm ReactJS, TypeScript và kiến thức UI/UX.'
    }, { headers });
    console.log('=> CV Score:', cvAnalyzeRes.data.data.score);
    console.log('=> Lời khuyên:', cvAnalyzeRes.data.data.feedback.substring(0, 100) + '...');

    console.log('\n4. Bắt đầu Mock Interview (Tính vào Credit Interview)');
    const interviewStartRes = await axios.post(`${API_URL}/interview/start`, {
      jobTitle: 'Frontend Developer',
      jobDescription: 'Cần tuyển Frontend Developer có kinh nghiệm ReactJS, TypeScript.'
    }, { headers });
    const sessionId = interviewStartRes.data.data.sessionId;
    const questions = interviewStartRes.data.data.questions;
    console.log('=> Đã tạo Session ID:', sessionId);
    console.log('=> Câu hỏi đầu tiên:', questions[0]);

    console.log('\n5. Trả lời câu hỏi Mock Interview');
    const answerRes = await axios.post(`${API_URL}/interview/${sessionId}/answer`, {
      questionIndex: 0,
      answer: 'Tôi có 3 năm kinh nghiệm với React, đã từng build hệ thống Dashboard dùng Redux và Tailwind CSS.'
    }, { headers });
    console.log('=> Điểm cho câu trả lời:', answerRes.data.data.score, '/10');
    console.log('=> Điểm mạnh:', answerRes.data.data.strengths);

    console.log('\n6. Lấy dữ liệu Dashboard (Kiểm tra Credit Limits)');
    const dashboardRes = await axios.get(`${API_URL}/dashboard`, { headers });
    const usage = dashboardRes.data.data.subscription.usage;
    console.log('=> Dashboard Data Lấy thành công!');
    console.log('=> CV Limit Used:', usage.cv.used, '/', usage.cv.limit);
    console.log('=> Interview Limit Used:', usage.interview.used, '/', usage.interview.limit);

    console.log('\n--- TẤT CẢ API CHẠY THÀNH CÔNG ---');
  } catch (error: any) {
    console.error('\n!!! TEST THẤT BẠI !!!');
    if (error.response) {
      console.error('Lỗi từ API:', error.response.status, error.response.data);
    } else {
      console.error('Lỗi hệ thống:', error.message);
    }
  }
}

testFullProject();
