import React, { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router';
import { authApi } from '@/services/api';
import { useToast } from '@/context/ToastContext';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const { addToast } = useToast();
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Đang xác thực email của bạn...');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Token không hợp lệ hoặc đã hết hạn.');
      return;
    }

    const verify = async () => {
      try {
        await authApi.verifyEmail({ token });
        setStatus('success');
        setMessage('Xác thực email thành công! Bạn có thể đăng nhập ngay bây giờ.');
        addToast('success', 'Xác thực email thành công!');
        
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } catch (error: any) {
        setStatus('error');
        setMessage(error.response?.data?.message || 'Có lỗi xảy ra khi xác thực email.');
        addToast('error', 'Xác thực thất bại.');
      }
    };

    verify();
  }, [token, navigate, addToast]);

  return (
    <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-64px)] p-4 bg-[#0a0a0a]">
      <div className="w-full max-w-md bg-[#1a1a1a] rounded-3xl p-8 border border-white/10 shadow-2xl flex flex-col items-center text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="w-16 h-16 text-purple-500 animate-spin mb-6" />
            <h2 className="text-2xl font-bold text-white mb-2">Đang xác thực</h2>
          </>
        )}
        
        {status === 'success' && (
          <>
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Thành công!</h2>
          </>
        )}
        
        {status === 'error' && (
          <>
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-6">
              <XCircle className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Xác thực thất bại</h2>
          </>
        )}

        <p className="text-gray-400 mb-8">{message}</p>

        {(status === 'success' || status === 'error') && (
          <Button variant="primary" onClick={() => navigate('/login')} className="w-full">
            Quay lại trang Đăng nhập
          </Button>
        )}
      </div>
    </div>
  );
}
