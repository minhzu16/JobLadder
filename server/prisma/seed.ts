import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Clean up existing data
  await prisma.notification.deleteMany();
  await prisma.chatMessage.deleteMany();
  await prisma.chatSession.deleteMany();
  await prisma.application.deleteMany();
  await prisma.savedJob.deleteMany();
  await prisma.interviewAnswer.deleteMany();
  await prisma.interviewSession.deleteMany();
  await prisma.cvAnalysis.deleteMany();
  await prisma.careerRoadmap.deleteMany();
  await prisma.userSubscription.deleteMany();
  await prisma.job.deleteMany();
  await prisma.company.deleteMany();
  await prisma.user.deleteMany();

  // Create mock user with realistic developer CV
  const passwordHash = await bcrypt.hash('password123', 10);
  const user = await prisma.user.create({
    data: {
      name: 'Nguyễn Văn Minh',
      email: 'demo@jobladder.tech',
      passwordHash,
      isVerified: true,
      resumeText: `HỌ VÀ TÊN: Nguyễn Văn Minh
VỊ TRÍ: Fullstack / Java Developer (2 năm kinh nghiệm)
EMAIL: demo@jobladder.tech | SĐT: 0987654321 | ĐỊA CHỈ: Cầu Giấy, Hà Nội

MỤC TIÊU NGHỀ NGHIỆP:
Kỹ sư phần mềm đam mê xây dựng các hệ thống Backend phân tán hiệu năng cao, mong muốn phát triển lên vị trí Senior Backend / Solution Architect.

KỸ NĂNG CHUYÊN MÔN:
- Ngôn ngữ: Java (Core, Java 17+), TypeScript, JavaScript, SQL.
- Framework: Spring Boot, Spring Security, Hibernate / JPA, Express.js, React.js.
- Cơ sở dữ liệu: PostgreSQL, MySQL, Redis.
- Công cụ & Khác: Git, Docker, Maven, RESTful API, OOP, Microservices cơ bản, Unit Testing (JUnit, Mockito).

KINH NGHIỆM LÀM VIỆC:
1. Java Backend Developer — Công ty Cổ phần Công nghệ FPT (06/2023 - Nay)
- Phát triển các module API quản lý tài chính và bán hàng sử dụng Spring Boot và PostgreSQL.
- Tối ưu hóa câu truy vấn cơ sở dữ liệu và tích hợp Redis caching giúp giảm 40% thời gian phản hồi API.
- Viết Unit Test và Integration Test đảm bảo độ phủ code đạt >75%.

2. Junior Software Engineer — VTI Cloud (01/2022 - 05/2023)
- Tham gia phát triển hệ thống quản lý nhân sự cho khách hàng Nhật Bản.
- Thiết kế cơ sở dữ liệu quan hệ, xây dựng hơn 30 RESTful APIs.

HỌC VẤN:
- Đại học Bách Khoa Hà Nội — Cử nhân Công nghệ Thông tin (GPA: 3.4/4.0, Tốt nghiệp loại Giỏi).`,
    },
  });
  console.log(`Created user: ${user.email} with sample CV`);

  // Create Initial Notifications for Demo User
  await prisma.notification.create({
    data: {
      userId: user.id,
      title: 'Chào mừng bạn đến với JobLadder AI! 🎉',
      message: 'Hồ sơ của bạn đã sẵn sàng. Hãy khám phá tính năng Phân tích CV và Luyện phỏng vấn AI ngay hôm nay.',
      type: 'info',
      link: '/jobs',
      isRead: false,
    }
  });

  await prisma.notification.create({
    data: {
      userId: user.id,
      title: 'Gợi ý việc làm phù hợp với bạn 💼',
      message: 'Vị trí Java Developer tại Phenikaa-X có độ tương thích cao với kỹ năng của bạn.',
      type: 'application',
      link: '/jobs/java-developer',
      isRead: false,
    }
  });

  // Create companies
  const phenikaa = await prisma.company.create({
    data: {
      name: 'Phenikaa-X',
      slug: 'phenikaa-x',
      description: 'Phenikaa-X là công ty công nghệ tiên phong tại Việt Nam, tập trung phát triển các giải pháp tự hành...',
      industry: 'Công nghệ thông tin',
      workType: '100-500 nhân viên',
      rating: 4.5,
      ratingCount: 120,
    }
  });

  const alpaca = await prisma.company.create({
    data: {
      name: 'Alpaca Solutions',
      slug: 'alpaca-solutions',
      description: 'Công ty chuyên cung cấp các giải pháp phần mềm cho thị trường Nhật Bản.',
      industry: 'Công nghệ thông tin',
      workType: '50-100 nhân viên',
      rating: 4.8,
      ratingCount: 50,
    }
  });

  // Create Jobs
  await prisma.job.create({
    data: {
      title: 'Java Developer',
      slug: 'java-developer',
      description: 'Tham gia phát triển các sản phẩm phần mềm của công ty. Xây dựng và duy trì API Backend bằng Java.',
      requirements: 'Có ít nhất 1 năm kinh nghiệm làm việc với Java Core. Nắm vững OOP, cấu trúc dữ liệu và giải thuật.',
      benefits: 'Mức lương cạnh tranh, review lương 2 lần/năm.',
      location: 'Hà Nội',
      salaryMin: 20000000,
      salaryMax: 40000000,
      workType: 'Toàn thời gian',
      workMode: 'Tại văn phòng (Onsite)',
      experience: 'Dưới 1 năm',
      industry: 'Công nghệ thông tin',
      companyId: phenikaa.id,
    }
  });

  await prisma.job.create({
    data: {
      title: '.NET Core (Junior/Middle/Senior)',
      slug: 'net-core',
      description: 'Yêu cầu: Có kinh nghiệm làm việc với .NET Core. Nắm vững OOP, Design Pattern...',
      requirements: 'Kinh nghiệm .NET 1-3 năm. Hiểu biết về Microservices là điểm cộng.',
      benefits: 'Bảo hiểm PVI, tháng lương thứ 13.',
      location: 'Hồ Chí Minh',
      salaryMax: 40000000,
      workType: 'Toàn thời gian',
      workMode: 'Tại văn phòng (Onsite)',
      experience: 'Từ 1-3 năm',
      industry: 'Công nghệ thông tin',
      companyId: alpaca.id,
    }
  });

  const smartbooks = await prisma.company.create({
    data: {
      name: 'Smartbooks AI',
      slug: 'smartbooks-ai',
      description: 'Công ty công nghệ chuyên giải pháp trí tuệ nhân tạo và EdTech hàng đầu.',
      industry: 'AI / Machine Learning',
      workType: '20-50 nhân viên',
      rating: 4.9,
      ratingCount: 35,
    }
  });

  await prisma.job.create({
    data: {
      title: 'Python AI Engineer (LLMs & RAG)',
      slug: 'python-ai-engineer',
      description: 'Tham gia xây dựng và huấn luyện các mô hình AI/ML, tích hợp Large Language Models (LLM) và hệ thống RAG phục vụ ứng dụng thông minh.',
      requirements: 'Thành thạo Python, PyTorch/TensorFlow, kinh nghiệm triển khai API FastAPI/Docker. Hiểu biết sâu về LangChain, LlamaIndex hoặc Semantic Search.',
      benefits: 'Lương thưởng cạnh tranh 30M - 50M, phụ cấp thiết bị làm việc MacBook Pro M3, làm việc Hybrid linh hoạt.',
      location: 'Đà Nẵng',
      salaryMin: 30000000,
      salaryMax: 50000000,
      workType: 'Toàn thời gian',
      workMode: 'Hybrid',
      experience: '2-5 năm',
      industry: 'Công nghệ thông tin',
      companyId: smartbooks.id,
    }
  });

  await prisma.job.create({
    data: {
      title: 'Senior React / Fullstack Engineer',
      slug: 'senior-react-developer',
      description: 'Chịu trách nhiệm kiến trúc Frontend cho sản phẩm web quy mô lớn, tối ưu hóa Web Vitals, trải nghiệm người dùng hiện đại và hiệu năng cao.',
      requirements: 'Ít nhất 3 năm kinh nghiệm với React, TypeScript, Next.js/Vite, TailwindCSS. Nắm vững State Management, CI/CD và kiến trúc Micro-Frontend.',
      benefits: 'Gói đãi ngộ lên tới 55M, bảo hiểm sức khỏe quốc tế cao cấp, du lịch công ty 2 lần/năm.',
      location: 'Hà Nội',
      salaryMin: 35000000,
      salaryMax: 55000000,
      workType: 'Toàn thời gian',
      workMode: 'Tại văn phòng (Onsite)',
      experience: '3-5 năm',
      industry: 'Công nghệ thông tin',
      companyId: phenikaa.id,
    }
  });

  await prisma.job.create({
    data: {
      title: 'Digital Marketing & Growth Lead',
      slug: 'digital-marketing-lead',
      description: 'Lập kế hoạch và thực thi chiến lược tăng trưởng người dùng đa kênh (Performance Ads, SEO, Content Marketing) cho nền tảng tuyển dụng công nghệ.',
      requirements: 'Có từ 2 năm kinh nghiệm Growth Marketing, thành thạo Google Analytics 4, Meta Ads, TikTok Ads. Kỹ năng phân tích số liệu và tư duy sáng tạo tốt.',
      benefits: 'Lương cứng 20M - 35M + Thưởng KPI hoa hồng hấp dẫn không giới hạn.',
      location: 'Hồ Chí Minh',
      salaryMin: 20000000,
      salaryMax: 35000000,
      workType: 'Toàn thời gian',
      workMode: 'Linh hoạt (Hybrid)',
      experience: '1-3 năm',
      industry: 'Marketing',
      companyId: alpaca.id,
    }
  });

  console.log('Seed completed successfully with realistic jobs!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
