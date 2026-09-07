import React from 'react';
import { Navigate, useLocation, Link, Outlet } from 'react-router';
import { useAuth } from '@/context/AuthContext';
import { ShieldAlert, Loader2, ArrowLeft, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ProtectedRouteProps {
  allowedRoles?: ('USER' | 'EMPLOYER' | 'ADMIN')[];
  children?: React.ReactNode;
}

export function ProtectedRoute({ allowedRoles, children }: ProtectedRouteProps) {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex-1 min-h-[calc(100vh-64px)] bg-[#050505] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
          <p className="text-gray-400 text-xs tracking-wider uppercase">Đang xác thực thông tin tài khoản...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role as any)) {
    return (
      <div className="flex-1 min-h-[calc(100vh-64px)] bg-[#050505] flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 rounded-3xl bg-white/[0.02] border border-red-500/20 backdrop-blur-xl text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center justify-center mx-auto shadow-inner">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white tracking-tight">Truy Cập Bị Giới Hạn</h2>
            <p className="text-sm text-gray-400">
              Tài khoản hiện tại của bạn (<span className="text-gray-200 font-semibold">{user.email}</span>) không có quyền truy cập khu vực này.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 text-xs text-gray-400 text-left space-y-1">
            <p><span className="text-gray-300 font-medium">Vai trò yêu cầu:</span> {allowedRoles.join(' hoặc ')}</p>
            <p><span className="text-gray-300 font-medium">Vai trò hiện tại:</span> {user.role}</p>
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <Link to="/">
              <Button variant="primary" className="w-full font-bold text-xs flex items-center justify-center gap-2">
                <ArrowLeft className="w-3.5 h-3.5" /> Trở về Trang chủ
              </Button>
            </Link>
            {user.role === 'USER' && allowedRoles.includes('EMPLOYER') && (
              <Link to="/profile">
                <Button variant="outline" className="w-full text-xs font-semibold border-purple-500/30 text-purple-300">
                  <Building2 className="w-3.5 h-3.5 mr-1" /> Nâng cấp lên Tài khoản Tuyển dụng
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  return children ? <>{children}</> : <Outlet />;
}
