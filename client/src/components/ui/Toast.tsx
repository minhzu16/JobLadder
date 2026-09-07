import React from 'react';
import { useToast } from '@/context/ToastContext';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';
import { cn } from '@/utils/cn';

export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed top-5 right-5 z-[100] flex flex-col gap-3 max-w-md w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "flex items-start gap-3 p-4 rounded-xl shadow-lg border pointer-events-auto transition-all animate-in slide-in-from-right-full fade-in duration-300",
            toast.type === 'success' ? 'bg-[#0f291e] border-green-500/30 text-green-400' :
            toast.type === 'error' ? 'bg-[#2a0e12] border-red-500/30 text-red-400' :
            'bg-[#101010] border-gray-500/30 text-gray-300'
          )}
        >
          <div className="shrink-0 mt-0.5">
            {toast.type === 'success' && <CheckCircle className="w-5 h-5" />}
            {toast.type === 'error' && <XCircle className="w-5 h-5" />}
            {toast.type === 'info' && <Info className="w-5 h-5" />}
          </div>
          <p className="flex-1 text-sm font-medium pt-0.5">{toast.message}</p>
          <button 
            onClick={() => removeToast(toast.id)}
            className="shrink-0 text-gray-500 hover:text-white transition-colors p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
