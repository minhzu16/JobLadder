import React, { useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { 
  BrainCircuit, Target, TrendingUp, Zap, Shield, Users, 
  Check, ChevronDown, ChevronUp, Star 
} from 'lucide-react';
import { cn } from '@/utils/cn';

export function AboutPage() {
  const [isYearly, setIsYearly] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const team = [
    { name: 'Lại Quốc Sơn', role: 'CEO & Co-Founder', bio: 'Hơn 10 năm kinh nghiệm trong ngành tuyển dụng và HR Tech. Người đặt nền móng cho nền tảng.' },
    { name: 'Vũ Tuấn Minh', role: 'CTO & Co-Founder', bio: 'Kỹ sư AI từng làm việc tại Google và Meta. Kiến trúc sư của nền tảng matching AI.' },
    { name: 'Nguyễn Thị Yến Nhi', role: 'Head of Product', bio: 'Designer và PM với tư duy lấy người dùng làm trung tâm. Tạo ra trải nghiệm cho JobLadder.' }
  ];

  const features = [
    { icon: <BrainCircuit className="text-purple-500" />, title: 'Phân tích CV bằng AI', desc: 'Hệ thống đọc và phân tích CV của bạn trong vài giây, xác định điểm mạnh và khoảng trống kỹ năng.' },
    { icon: <Target className="text-cyan-500" />, title: 'Matching thông minh', desc: 'Ghép đôi chính xác giữa hồ sơ và yêu cầu tuyển dụng bằng mô hình ngôn ngữ lớn.' },
    { icon: <TrendingUp className="text-orange-500" />, title: 'Lộ trình phát triển', desc: 'AI tạo ra lộ trình học tập cá nhân hóa giúp bạn nâng cao kỹ năng và tăng tỉ lệ phỏng vấn.' },
    { icon: <Zap className="text-blue-500" />, title: 'Ứng tuyển nhanh', desc: 'Ứng tuyển chỉ với một cú nhấp, hệ thống tự điền thông tin và tạo thư xin việc phù hợp.' },
    { icon: <Shield className="text-red-500" />, title: 'Bảo mật dữ liệu', desc: 'Dữ liệu CV được mã hóa end-to-end. Chúng tôi không bao giờ chia sẻ thông tin cá nhân của bạn.' },
    { icon: <Users className="text-purple-500" />, title: 'Cộng đồng hỗ trợ', desc: 'Tham gia cộng đồng 10K+ ứng viên, chia sẻ kinh nghiệm và nhận tư vấn từ người đi trước.' },
  ];

  const faqs = [
    { q: 'JobLadder AI hoạt động như thế nào?', a: 'JobLadder AI sử dụng mô hình ngôn ngữ lớn (LLM) để phân tích CV của bạn, đối chiếu với hàng triệu mô tả công việc và đưa ra điểm số phù hợp cũng như gợi ý cải thiện cụ thể, cá nhân hóa cho từng vị trí ứng tuyển.' },
    { q: 'Dữ liệu CV của tôi có được bảo mật không?', a: 'Có. Chúng tôi tuân thủ nghiêm ngặt các tiêu chuẩn bảo mật dữ liệu. CV của bạn được mã hóa và không bao giờ được chia sẻ với bên thứ 3 mà không có sự đồng ý của bạn.' },
    { q: 'Tôi có thể hủy gói đăng ký bất cứ lúc nào không?', a: 'Hoàn toàn có thể. Bạn có thể hủy gia hạn tự động bất cứ lúc nào trong phần cài đặt tài khoản mà không phải chịu thêm bất kỳ khoản phí nào.' },
    { q: 'Gói Pro có phù hợp với sinh viên mới ra trường không?', a: 'Rất phù hợp. Gói Pro bao gồm tính năng Lộ trình sự nghiệp và Luyện phỏng vấn AI, những công cụ đắc lực giúp sinh viên tự tin hơn khi bước vào thị trường lao động.' },
  ];

  return (
    <div className="flex-1 w-full flex flex-col items-center">
      
      {/* Hero Section */}
      <section className="w-full max-w-5xl px-4 pt-24 pb-16 flex flex-col items-center text-center">
        <Badge variant="purple" className="mb-6 px-4 py-1">Về chúng tôi – JobLadder</Badge>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-6 max-w-4xl leading-tight">
          Nền tảng <span className="gradient-text">AI đầu tiên</span> giúp bạn chinh phục sự nghiệp
        </h1>
        <p className="text-gray-400 text-lg mb-12 max-w-2xl">
          Chúng tôi ứng dụng trí tuệ nhân tạo để biến quá trình tìm việc đầy mệt mỏi thành một hành trình thú vị và hiệu quả.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full border-y border-white/10 py-12">
          <div>
            <div className="text-4xl font-bold text-white mb-2">10K+</div>
            <div className="text-gray-400">Ứng viên thành công</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-cyan-400 mb-2">100K</div>
            <div className="text-gray-400">Việc làm đang tuyển</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-purple-400 mb-2">1K+</div>
            <div className="text-gray-400">Công ty đối tác</div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="w-full max-w-5xl px-4 py-20 flex flex-col items-center">
        <div className="text-sm font-bold text-purple-500 uppercase tracking-widest mb-4">CON NGƯỜI</div>
        <h2 className="text-3xl md:text-4xl font-display font-bold mb-6 text-center">Đội ngũ của chúng tôi</h2>
        <p className="text-gray-400 text-center max-w-xl mb-16">
          Những người xây dựng JobLadder với niềm đam mê giúp hàng triệu người tìm được công việc xứng đáng.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          {team.map((member, i) => (
            <Card key={i} className="p-8 flex flex-col items-center text-center bg-[#0a0a0a]/50">
              <div className="w-24 h-24 bg-gray-800 rounded-2xl mb-6 overflow-hidden">
                <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${member.name}`} alt={member.name} className="w-full h-full object-cover" />
              </div>
              <h3 className="text-lg font-bold text-white">{member.name}</h3>
              <p className="text-purple-400 text-sm mb-4">{member.role}</p>
              <p className="text-gray-400 text-sm">{member.bio}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full max-w-5xl px-4 py-20 flex flex-col items-center">
        <div className="text-sm font-bold text-purple-500 uppercase tracking-widest mb-4">TÍNH NĂNG</div>
        <div className="flex flex-col md:flex-row justify-between items-end w-full mb-12 gap-6">
          <h2 className="text-3xl md:text-4xl font-display font-bold max-w-lg">
            JobLadder giúp bạn <span className="text-cyan-400">định hướng đúng</span>
          </h2>
          <p className="text-gray-400 max-w-md text-sm md:text-base">
            Không chỉ tìm việc đơn thuần – JobLadder là người đồng hành chiến lược cho từng bước trong sự nghiệp. Từ phân tích CV đến phỏng vấn thực tế, chúng tôi có mặt ở đó.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          {features.map((feature, i) => (
            <Card key={i} className="p-6 hover:border-white/30 transition-colors">
              <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mb-6">
                {feature.icon}
              </div>
              <h3 className="text-lg font-bold text-white mb-3">{feature.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section className="w-full max-w-5xl px-4 py-20 flex flex-col items-center">
        <div className="text-sm font-bold text-purple-500 uppercase tracking-widest mb-4">GIÁ CẢ MINH BẠCH</div>
        <h2 className="text-3xl md:text-4xl font-display font-bold mb-6 text-center">Bảng Dịch vụ</h2>
        <p className="text-gray-400 text-center max-w-xl mb-10">
          Chọn gói phù hợp với nhu cầu của bạn. Không phí ẩn, hủy bất kỳ lúc nào.
        </p>

        <div className="flex items-center gap-4 mb-12">
          <span className={cn("text-sm font-medium", !isYearly ? "text-white" : "text-gray-400")}>Thanh toán hàng tháng</span>
          <button 
            onClick={() => setIsYearly(!isYearly)}
            className="relative w-12 h-6 rounded-full bg-cyan-600/30 border border-cyan-500/50 transition-colors focus:outline-none"
          >
            <div className={cn("absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-cyan-400 rounded-full transition-all", isYearly ? "left-7" : "left-1")} />
          </button>
          <span className={cn("text-sm font-medium flex items-center gap-2", isYearly ? "text-white" : "text-gray-400")}>
            Thanh toán hàng năm <Badge variant="green" className="text-[10px]">TIẾT KIỆM 17%</Badge>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          <Card className="p-8">
            <h3 className="text-xl font-bold text-white mb-2">Miễn phí</h3>
            <div className="flex items-end gap-1 mb-6">
              <span className="text-4xl font-bold text-white">0đ</span>
              <span className="text-gray-400 text-sm mb-1">/tháng</span>
            </div>
            <ul className="space-y-4 mb-8">
              {[
                { name: 'Phân tích & Tối ưu CV', val: '3 lượt/tháng', yes: true },
                { name: 'Luyện phỏng vấn AI', val: 'Không hỗ trợ', yes: false },
                { name: 'Lộ trình sự nghiệp AI', val: 'Không hỗ trợ', yes: false },
                { name: 'So khớp việc làm', val: '10 lượt/ngày', yes: true },
                { name: 'Hỏi đáp nội dung JD', val: 'Không hỗ trợ', yes: false },
              ].map((item, i) => (
                <li key={i} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Check className={cn("w-4 h-4", item.yes ? "text-white" : "text-gray-600")} />
                    <span className={item.yes ? "text-gray-300" : "text-gray-500"}>{item.name}</span>
                  </div>
                  <span className={item.yes ? "font-semibold text-white" : "text-gray-500"}>{item.val}</span>
                </li>
              ))}
            </ul>
            <Button variant="outline" className="w-full">Bắt đầu miễn phí</Button>
          </Card>

          <Card className="p-8 border-cyan-500/30">
            <h3 className="text-xl font-bold text-white mb-2">Gói Advanced</h3>
            <div className="flex items-end gap-1 mb-6">
              <span className="text-4xl font-bold text-white">{isYearly ? '59.000đ' : '69.000đ'}</span>
              <span className="text-gray-400 text-sm mb-1">/tháng</span>
            </div>
            <ul className="space-y-4 mb-8">
              {[
                { name: 'Lộ trình sự nghiệp AI', val: '2 lượt', yes: true },
                { name: 'Luyện phỏng vấn AI', val: '10 lượt', yes: true },
                { name: 'Hỏi đáp nội dung JD', val: '100 lượt', yes: true },
                { name: 'So khớp việc làm', val: '10 lượt', yes: true },
                { name: 'Phân tích & Tối ưu CV', val: '10 lượt', yes: true },
              ].map((item, i) => (
                <li key={i} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-white" />
                    <span className="text-gray-300">{item.name}</span>
                  </div>
                  <span className="font-semibold text-white">{item.val}</span>
                </li>
              ))}
            </ul>
            <Button variant="outline" className="w-full border-purple-500/50 hover:bg-purple-500/10 hover:text-white">Nâng cấp ngay</Button>
          </Card>

          <Card className="p-8 border-purple-500 relative overflow-visible">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <Badge variant="purple" className="bg-purple-500 text-white border-none px-3">Phổ biến nhất</Badge>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Gói Premium</h3>
            <div className="flex items-end gap-1 mb-6">
              <span className="text-4xl font-bold text-purple-400">{isYearly ? '99.000đ' : '129.000đ'}</span>
              <span className="text-gray-400 text-sm mb-1">/tháng</span>
            </div>
            <ul className="space-y-4 mb-8">
              {[
                { name: 'Lộ trình sự nghiệp AI', val: '5 lượt', yes: true },
                { name: 'Luyện phỏng vấn AI', val: '30 lượt', yes: true },
                { name: 'Hỏi đáp nội dung JD', val: 'Không giới hạn', yes: true },
                { name: 'So khớp việc làm', val: 'Không giới hạn', yes: true },
                { name: 'Phân tích & Tối ưu CV', val: 'Không giới hạn', yes: true },
              ].map((item, i) => (
                <li key={i} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-purple-400" />
                    <span className="text-gray-300">{item.name}</span>
                  </div>
                  <span className="font-semibold text-white">{item.val}</span>
                </li>
              ))}
            </ul>
            <Button variant="primary" className="w-full bg-purple-500 hover:bg-purple-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.5)]">Nâng cấp ngay</Button>
          </Card>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="w-full py-20 px-4 bg-[#020f08]">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <p className="text-purple-500 text-sm font-semibold uppercase tracking-widest mb-2">Đánh giá thực tế</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Mọi người nói gì về <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">JobLadder</span>
            </h2>
            <p className="text-gray-400 max-w-lg mx-auto">Hơn 10.000 ứng viên đã tin tưởng sử dụng JobLadder để tìm kiếm công việc mơ ước.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { quote: 'JobLadder đã giúp tôi nhận được offer từ VNG chỉ sau 3 tuần. Hệ thống phân tích CV siêu chính xác và gợi ý đúng những kỹ năng tôi còn thiếu.', name: 'Nguyễn Văn An', role: 'Java Developer @ VNG', seed: 'An', bg: '7c3aed' },
              { quote: 'Tôi từng apply hàng chục công ty mà không có phản hồi. Sau khi dùng JobLadder tối ưu CV, tỉ lệ được gọi phỏng vấn tăng gấp 4 lần!', name: 'Lê Thị Bích', role: 'UX Designer @ Shopee', seed: 'Bich', bg: 'db2777' },
              { quote: 'Lộ trình học tập do AI tạo ra rất thực tế và phù hợp với mục tiêu của tôi. Đây là công cụ tôi ước mình có được sớm hơn.', name: 'Alex Sanchez', role: 'Data Analyst @ Google', seed: 'Alex', bg: '0369a1' },
              { quote: 'Trợ lý phỏng vấn AI của JobLadder đã giúp tôi tự tin hơn hẳn. Câu hỏi rất sát với thực tế và có gợi ý trả lời thông minh.', name: 'Cheng Hao', role: 'Software Engineer @ Foxconn', seed: 'Ha', bg: '047857' },
              { quote: 'Mình làm marketing nhưng muốn chuyển sang product. JobLadder AI đã gợi ý lộ trình chuyển đổi cực kỳ chi tiết và khả thi.', name: 'Trần Tuấn Anh', role: 'Product Manager @ Tiki', seed: 'Tuan', bg: 'b45309' },
              { quote: 'Giao diện đẹp, dễ dùng. Tính năng so khớp CV với JD cho mình biết chính xác cần bổ sung gì trước khi apply.', name: 'Phạm Ngọc Lan', role: 'Frontend Dev @ Momo', seed: 'Lan', bg: '9333ea' },
            ].map((t, i) => (
              <div key={i} className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 hover:border-white/20 hover:bg-white/[0.05] transition-all duration-300">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 fill-amber-400 stroke-amber-400" />)}
                </div>
                <p className="text-gray-300 text-sm leading-relaxed mb-5 italic">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-800 border border-white/10 shrink-0">
                    <img src={`https://api.dicebear.com/9.x/notionists/svg?seed=${t.seed}&backgroundColor=${t.bg}`} alt={t.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold">{t.name}</p>
                    <p className="text-gray-500 text-xs">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="w-full max-w-3xl px-4 py-20 flex flex-col items-center">
        <div className="text-sm font-bold text-purple-500 uppercase tracking-widest mb-4">HỖ TRỢ</div>
        <h2 className="text-3xl md:text-4xl font-display font-bold mb-4 text-center">Câu hỏi thường gặp</h2>
        <p className="text-gray-400 text-center max-w-xl mb-12">
          Không tìm thấy câu trả lời? <span className="text-purple-400 cursor-pointer">Liên hệ với chúng tôi</span>
        </p>

        <div className="w-full space-y-4">
          {faqs.map((faq, i) => (
            <Card key={i} className="overflow-hidden border-white/5 bg-transparent cursor-pointer" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
              <div className="p-6 flex items-center justify-between">
                <h3 className="font-medium text-white">{faq.q}</h3>
                {openFaq === i ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
              </div>
              <div className={cn("px-6 overflow-hidden transition-all duration-300", openFaq === i ? "max-h-40 pb-6 opacity-100" : "max-h-0 opacity-0")}>
                <p className="text-gray-400 text-sm leading-relaxed">{faq.a}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-24 flex flex-col items-center text-center px-4">
        <h2 className="text-4xl md:text-5xl font-display font-bold mb-6 max-w-2xl">
          Sẵn sàng leo lên <span className="text-purple-400">bậc thang sự nghiệp?</span>
        </h2>
        <p className="text-gray-400 mb-10">Tham gia 10K+ ứng viên đang dùng JobLadder AI để tìm công việc xứng đáng.</p>
        <div className="flex gap-4">
          <Button variant="primary" className="bg-purple-500 hover:bg-purple-600 px-8">Bắt đầu miễn phí →</Button>
          <Button variant="outline" className="px-8">Xem demo</Button>
        </div>
      </section>
      
    </div>
  );
}
