import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Sparkles, Eye, Search, Loader2, User, Building2, ShieldAlert } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { authApi } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { addToast } = useToast();

  const from = (location.state as any)?.from?.pathname || '/';

  const handleLogin = async (e?: React.FormEvent, customEmail?: string, customPass?: string) => {
    if (e) e.preventDefault();
    const loginEmail = customEmail || email;
    const loginPass = customPass || password;

    if (!loginEmail || !loginPass) {
      addToast('error', 'Vui lòng nhập email và mật khẩu.');
      return;
    }

    try {
      setLoading(true);
      const res = await authApi.login({ email: loginEmail, password: loginPass });
      login(res.data.token, res.data.user);
      navigate(from, { replace: true });
    } catch (error: any) {
      if (error.response?.data?.code === 'UNVERIFIED') {
        addToast('error', error.response.data.message);
      } else {
        addToast('error', error.response?.data?.message || 'Thông tin đăng nhập không chính xác.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password123');
    handleLogin(undefined, demoEmail, 'password123');
  };

  return (
    <div className="flex-1 w-full min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-0 rounded-[2rem] overflow-hidden bg-[#101010] border border-white/10 shadow-2xl">
        
        {/* Left: Form */}
        <div className="p-8 md:p-12 flex flex-col justify-center">
          <Link to="/" className="text-sm font-medium text-gray-400 flex items-center gap-2 hover:text-white transition-colors mb-10 w-fit">
            <ArrowLeft className="w-4 h-4" /> Quay lại Trang chủ
          </Link>
          
          <h1 className="text-3xl font-display font-bold text-white mb-8">Đăng nhập tài khoản</h1>

          <form className="space-y-6" onSubmit={handleLogin}>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Email</label>
              <Input type="email" placeholder="Nhập Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Mật khẩu</label>
              <div className="relative">
                <Input type={showPassword ? "text" : "password"} placeholder="Nhập Mật khẩu" className="pr-10" value={password} onChange={(e) => setPassword(e.target.value)} required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                  <Eye className="w-5 h-5" />
                </button>
              </div>
            </div>

            <Button type="submit" disabled={loading} variant="outline" className="w-full border-cyan-500/50 hover:bg-cyan-500/10 hover:text-cyan-400 text-cyan-500 flex justify-center items-center gap-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </Button>
            
            <div className="text-center mt-4">
              <a href="#" className="text-sm font-medium text-gray-400 hover:text-white">Quên mật khẩu?</a>
            </div>
            
            <div className="text-center text-sm text-gray-400">
              Chưa có tài khoản? <Link to="/register" className="text-cyan-400 font-bold hover:text-cyan-300">Đăng ký ngay</Link>
            </div>
          </form>

          {/* Quick Demo Accounts */}
          <div className="mt-6 pt-6 border-t border-white/10 space-y-2.5">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider text-center">
              Đăng nhập thử nghiệm 1-Click:
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('demo@jobladder.tech')}
                className="p-2.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-semibold flex flex-col items-center gap-1 transition-all cursor-pointer hover:scale-[1.02]"
              >
                <User className="w-4 h-4 text-purple-400" />
                <span>Ứng Viên</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('employer@jobladder.tech')}
                className="p-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-semibold flex flex-col items-center gap-1 transition-all cursor-pointer hover:scale-[1.02]"
              >
                <Building2 className="w-4 h-4 text-cyan-400" />
                <span>Tuyển Dụng</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@jobladder.tech')}
                className="p-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-300 text-xs font-semibold flex flex-col items-center gap-1 transition-all cursor-pointer hover:scale-[1.02]"
              >
                <ShieldAlert className="w-4 h-4 text-red-400" />
                <span>Quản Trị</span>
              </button>
            </div>
          </div>

          <Button variant="primary" className="w-full bg-[#1a73e8] hover:bg-[#1557b0] text-white flex items-center justify-center gap-3 rounded-md h-12">
            <div className="w-6 h-6 bg-white rounded-sm flex items-center justify-center">
              {/* Fake Google Logo G */}
              <span className="text-[#1a73e8] font-bold text-lg leading-none">G</span>
            </div>
            Đăng nhập bằng Google
          </Button>
        </div>

        {/* Right: Showcase */}
        <div className="hidden md:flex flex-col justify-center p-12 bg-gradient-to-br from-[#0a0a0a] to-[#101010] border-l border-white/10 relative overflow-hidden">
          {/* Background Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 blur-[80px] rounded-full pointer-events-none"></div>
          
          <div className="relative z-10 flex items-center gap-2 mb-12">
            <img src="/jobladder-icon.png" alt="JobLadder" className="w-8 h-8 object-contain opacity-80" />
            <span className="font-bold text-xl tracking-tight text-white">JOBLADDER</span>
          </div>

          {/* Search Mockup */}
          <div className="w-full bg-white rounded-xl shadow-lg p-2 flex items-center h-14 mb-8">
            <div className="pl-3 text-gray-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-purple-500" />
            </div>
            <input 
              type="text" 
              value="Tìm việc làm với AI" 
              readOnly
              className="flex-1 h-full px-3 text-gray-800 font-medium focus:outline-none bg-transparent"
            />
            <button className="w-10 h-10 rounded-lg bg-black flex items-center justify-center text-white">
              <Search className="w-5 h-5" />
            </button>
          </div>

          <div className="flex gap-2 mb-12">
            <Badge variant="default" className="bg-[#1a1a1a] text-gray-300 py-1.5 px-3">Cộng đồng làm việc lành mạnh</Badge>
            <Badge variant="default" className="bg-[#1a1a1a] text-gray-300 py-1.5 px-3">Ưu tiên tiện ích người dùng</Badge>
          </div>

          <Card className="p-6 border-white/5 bg-[#1a1a1a]/80">
            <p className="text-gray-300 italic mb-6 text-sm leading-relaxed">
              "Chúng tôi làm việc với niềm tin rằng mỗi người đều có tiềm năng vươn xa hơn. AI chỉ là công cụ - còn sức mạnh thật sự đến từ chính bạn khi dám bắt đầu và dám tiến lên."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#222] border border-white/10 flex items-center justify-center text-sm font-bold text-white">
                TD
              </div>
              <div>
                <h4 className="text-white font-bold text-sm">Thùy Dương</h4>
                <p className="text-gray-500 text-xs">Marketing Team</p>
              </div>
            </div>
          </Card>

          <div className="mt-8">
            <Button variant="primary" className="w-full justify-between px-6 bg-purple-500/80 hover:bg-purple-500">
              Tìm hiểu về JobLadder <span className="text-lg">→</span>
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}
