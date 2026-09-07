import React from 'react';
import { Link, useNavigate } from 'react-router';
import { Sparkles, ChevronDown, Search, Building2, Briefcase, ShieldAlert, FileText, History, Target, Zap, Bot, Wand2 } from 'lucide-react';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { useAuth } from '@/context/AuthContext';
import { NotificationDropdown } from './NotificationDropdown';

export function Header() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  return (
    <header className="sticky top-0 z-50 w-full glass-header">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2">
            <img src="/jobladder-icon.png" alt="JobLadder" className="w-10 h-10 object-contain" />
            <span className="font-bold text-xl tracking-tight text-white">JOBLADDER</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-6 relative">
            <div className="group py-5">
              <Link to="/jobs" className="flex items-center gap-1 text-sm font-medium text-gray-300 group-hover:text-white transition-colors">
                Việc làm <ChevronDown className="w-4 h-4 group-hover:rotate-180 transition-transform" />
              </Link>
              
              {/* Mega Menu */}
              <div className="absolute top-14 left-0 w-[700px] bg-white rounded-2xl shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-left -translate-y-2 group-hover:translate-y-0 z-50 overflow-hidden text-black">
                <div className="flex h-full">
                  <div className="w-[240px] bg-gray-50/50 p-6 border-r border-gray-100 shrink-0">
                    <div className="mb-6">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Việc Làm</p>
                      <ul className="space-y-3">
                        <li>
                          <Link to="/jobs" className="text-sm font-semibold text-purple-600 flex items-center gap-2">
                            <div className="w-6 h-6 rounded bg-purple-100 flex items-center justify-center">
                              <Search className="w-3.5 h-3.5" />
                            </div> 
                            Tìm việc làm
                          </Link>
                        </li>
                        <li><Link to="/saved-jobs" className="text-sm font-medium text-gray-600 hover:text-purple-600 transition-colors px-1">Việc làm đã lưu</Link></li>
                        <li><Link to="/applied-jobs" className="text-sm font-medium text-gray-600 hover:text-purple-600 transition-colors px-1">Việc làm đã ứng tuyển</Link></li>
                        <li><Link to="/jobs" className="text-sm font-medium text-gray-600 hover:text-purple-600 transition-colors px-1">Việc làm phù hợp</Link></li>
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Công Ty</p>
                      <ul className="space-y-3">
                        <li><Link to="/companies" className="text-sm font-medium text-gray-600 hover:text-purple-600 transition-colors px-1">Danh sách công ty</Link></li>
                        <li>
                          <Link to="/companies" className="text-sm font-medium text-gray-600 hover:text-purple-600 transition-colors flex items-center gap-2 px-1">
                            Công ty <Badge variant="orange" className="text-[10px] px-1.5 py-0.5">Pro</Badge>
                          </Link>
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div className="flex-1 p-6">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Việc làm theo vị trí</p>
                    <div className="grid grid-cols-2 gap-y-4 gap-x-4">
                      {['Nhân viên kinh doanh', 'Kế toán', 'Marketing', 'Hành chính nhân sự', 'Chăm sóc khách hàng', 'Ngân hàng', 'IT', 'Lao động phổ thông', 'Senior', 'Kỹ sư xây dựng', 'Thiết kế đồ họa', 'Bất động sản', 'Giáo dục', 'Telesales'].map(job => (
                        <Link key={job} to={`/jobs?keyword=${job}`} className="text-sm text-gray-600 hover:text-purple-600 font-medium transition-colors line-clamp-1">
                          Việc làm {job}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Link to="/companies" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Công ty</Link>
            <Link to="/cv-optimizer" className="text-sm font-medium text-purple-300 hover:text-white transition-colors flex items-center gap-1">
              <Wand2 className="w-3.5 h-3.5 text-purple-400" /> Tối ưu CV
            </Link>
            <Link to="/cv-analysis" className="text-sm font-medium text-cyan-300 hover:text-white transition-colors flex items-center gap-1">
              <Target className="w-3.5 h-3.5 text-cyan-400" /> Phân tích ATS
            </Link>
            <Link to="/cover-letter" className="text-sm font-medium text-gray-300 hover:text-white transition-colors flex items-center gap-1">
              <FileText className="w-3.5 h-3.5" /> Cover Letter
            </Link>
            <Link to="/" className="text-sm font-medium text-gray-300 hover:text-white transition-colors flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#22D3EE] animate-pulse" /> Tìm việc AI
            </Link>
            <Link to="/pricing" className="text-sm font-semibold text-cyan-400 hover:text-cyan-300 transition-colors">Nâng cấp</Link>
            <Link to="/employer/jobs" className="text-sm font-semibold text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20">
              <Building2 className="w-3.5 h-3.5" /> Tuyển Dụng
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-5">
          <NotificationDropdown />
          
          {user ? (
            <div className="relative group py-2">
              <button className="flex items-center gap-2 outline-none">
                <div className="w-9 h-9 rounded-full overflow-hidden bg-gray-800 border border-white/10 shrink-0">
                  <img 
                    src={user.avatarUrl || `https://api.dicebear.com/9.x/notionists/svg?seed=${user.name}&backgroundColor=6D28D9`} 
                    alt={user.name} 
                    className="w-full h-full object-cover" 
                  />
                </div>
                <div className="hidden md:flex flex-col items-start text-left">
                  <span className="text-sm font-semibold text-white leading-none">{user.name}</span>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors ml-1" />
              </button>
              
              <div className="absolute top-12 right-0 w-52 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right -translate-y-2 group-hover:translate-y-0 z-50 overflow-hidden">
                <div className="p-2 border-b border-white/10">
                  <p className="text-sm font-medium text-white truncate">{user.name}</p>
                  <p className="text-xs text-gray-400 truncate">{user.email}</p>
                </div>
                <div className="p-1">
                  <Link to="/employer/jobs" className="flex items-center gap-2 px-3 py-2 text-sm text-purple-400 hover:text-purple-300 hover:bg-white/10 rounded-lg transition-colors font-semibold">
                    <Briefcase className="w-4 h-4" /> Kênh Tuyển Dụng
                  </Link>
                  <Link to="/admin" className="flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-white/10 rounded-lg transition-colors font-semibold">
                    <ShieldAlert className="w-4 h-4" /> Quản Trị Hệ Thống
                  </Link>
                  <Link to="/dashboard" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                    Dashboard
                  </Link>
                  <Link to="/profile" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                    Hồ sơ cá nhân
                  </Link>
                  <Link to="/cv-optimizer" className="flex items-center gap-2 px-3 py-2 text-sm text-purple-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                    <Wand2 className="w-4 h-4 text-purple-400" /> Tối ưu hóa CV AI
                  </Link>
                  <Link to="/cv-analysis" className="flex items-center gap-2 px-3 py-2 text-sm text-cyan-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                    <Target className="w-4 h-4 text-cyan-400" /> Phân tích ATS & Match
                  </Link>
                  <Link to="/interview/history" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                    <History className="w-4 h-4 text-purple-400" /> Lịch sử phỏng vấn
                  </Link>
                  <Link to="/cover-letter" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                    <FileText className="w-4 h-4 text-cyan-400" /> Viết Cover Letter AI
                  </Link>
                  <Link to="/applied-jobs" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                    Việc đã ứng tuyển
                  </Link>
                </div>
                <div className="p-1 border-t border-white/10">
                  <button onClick={logout} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors text-left">
                    Đăng xuất
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Đăng nhập</Link>
              <Button variant="primary" onClick={() => navigate('/register')}>
                Đăng ký
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
