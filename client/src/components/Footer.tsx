import React from 'react';

export function Footer() {
  return (
    <footer className="w-full border-t border-white/10 bg-[#0a0a0a] pt-16 pb-8 px-4 text-sm relative z-10">
      <div className="container mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-16">
          <div className="col-span-1 space-y-4">
            <h3 className="text-white font-semibold mb-6">Về website</h3>
            <ul className="space-y-3">
              <li><a className="text-gray-400 hover:text-white transition-colors" href="/about">Về JOBLADDER</a></li>
              <li><a className="text-gray-400 hover:text-white transition-colors" href="#">Câu hỏi thường gặp</a></li>
            </ul>
          </div>
          <div className="col-span-1 space-y-4">
            <h3 className="text-white font-semibold mb-6">Điều khoản</h3>
            <ul className="space-y-3">
              <li><a className="text-gray-400 hover:text-white transition-colors" href="#">Quy định bảo mật</a></li>
              <li><a className="text-gray-400 hover:text-white transition-colors" href="#">Thỏa thuận chung</a></li>
            </ul>
          </div>
          {/* Empty spacer column (hidden on mobile) */}
          <div className="hidden lg:block col-span-1"></div>
          <div className="col-span-1 space-y-4">
            <h3 className="text-white font-semibold mb-6">Dịch vụ</h3>
            <ul className="space-y-3">
              <li><a className="text-gray-400 hover:text-white transition-colors" href="/jobs">Tra cứu việc</a></li>
              <li><a className="text-gray-400 hover:text-white transition-colors" href="#">Đánh giá CV</a></li>
            </ul>
          </div>
          <div className="col-span-1 space-y-4">
            <h3 className="text-white font-semibold mb-6">Liên hệ</h3>
            <ul className="space-y-3">
              <li><a href="mailto:support@jobladder.tech" className="text-gray-400 hover:text-white transition-colors">support@jobladder.tech</a></li>
              <li><a href="tel:+84123456790" className="text-gray-400 hover:text-white transition-colors">(+84) 123456790</a></li>
            </ul>
          </div>
        </div>
        <div className="flex flex-col md:flex-row items-center justify-center pt-8 border-t border-white/10 text-gray-500">
          <p>2026 JOBLADDER Inc All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}
