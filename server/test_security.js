const jwt = require('jsonwebtoken');

const API_URL = 'http://localhost:5000/api';
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

async function testSecurity() {
  console.log("=== BẮT ĐẦU TEST BẢO MẬT & XÁC THỰC ===");

  // 1. Request không có token
  try {
    const res = await fetch(`${API_URL}/ai/cv-analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resumeText: "Test" })
    });
    if (res.status === 401) {
      console.log("✅ PASS: Đã chặn request không có token (401 Unauthorized)");
    } else {
      console.log("❌ FAIL: API trả về mã lỗi khác hoặc thành công!", res.status);
    }
  } catch (error) {
    console.log("❓ Lỗi mạng:", error.message);
  }

  // 2. Request với token giả/hết hạn
  const fakeToken = jwt.sign({ userId: 'fake_id' }, JWT_SECRET, { expiresIn: '-1h' });
  try {
    const res = await fetch(`${API_URL}/ai/cv-analyze`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${fakeToken}`
      },
      body: JSON.stringify({ resumeText: "Test" })
    });
    if (res.status === 401 || res.status === 403) {
      console.log("✅ PASS: Đã chặn token giả/hết hạn (401/403)");
    } else {
      console.log("❌ FAIL: API cho phép token hết hạn!", res.status);
    }
  } catch (error) {
    console.log("❓ Lỗi mạng:", error.message);
  }

  console.log("=== KẾT THÚC TEST BẢO MẬT ===");
}

testSecurity();
