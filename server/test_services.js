require('dotenv').config();
const { AiService } = require('./dist/src/services/ai.service');

async function runTests() {
  console.log("=== BẮT ĐẦU TEST CÁC HÀM AI SERVICE TRONG BACKEND ===");

  try {
    // 1. Chat Response
    console.log("\n1. Test generateChatResponse...");
    const chatRes = await AiService.generateChatResponse("Xin chào, bạn có thể giúp gì cho tôi?", "");
    console.log("   => Result:", chatRes.substring(0, 50) + "...");

    // 2. Career Roadmap
    console.log("\n2. Test generateCareerRoadmap...");
    const roadmapRes = await AiService.generateCareerRoadmap("Trở thành Senior Frontend Developer", "Có 1 năm kinh nghiệm React");
    console.log("   => Result:", JSON.stringify(roadmapRes).substring(0, 100) + "...");

    // 3. Skill Gap Analysis
    console.log("\n3. Test generateSkillGapAnalysis...");
    const skillGapRes = await AiService.generateSkillGapAnalysis("Có kỹ năng HTML, CSS, JS cơ bản", "ReactJS Developer");
    console.log("   => Result:", JSON.stringify(skillGapRes).substring(0, 100) + "...");

    // 4. Interview Questions
    console.log("\n4. Test generateInterviewQuestions...");
    const interviewQs = await AiService.generateInterviewQuestions("Node.js Backend Developer");
    console.log("   => Result:", JSON.stringify(interviewQs).substring(0, 100) + "...");

    // 5. Evaluate Interview Answer
    console.log("\n5. Test evaluateInterviewAnswer...");
    const evalRes = await AiService.evaluateInterviewAnswer(
      "Bạn hiểu thế nào về Event Loop trong Node.js?", 
      "Event loop giúp Node.js xử lý bất đồng bộ mặc dù chạy trên một thread.",
      "Vị trí Junior Node.js Developer"
    );
    console.log("   => Result:", JSON.stringify(evalRes).substring(0, 100) + "...");

    console.log("\n=== TẤT CẢ CÁC HÀM AI HOẠT ĐỘNG TỐT! ===");
  } catch (error) {
    console.error("\n!!! LỖI TEST HÀM AI !!!", error);
  }
}

runTests();
