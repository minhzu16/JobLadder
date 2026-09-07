import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Check, Loader2, QrCode, ShieldCheck, Sparkles, X, ArrowRight } from 'lucide-react';
import { cn } from '@/utils/cn';
import { plansApi } from '@/services/api';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';

export function PricingPage() {
  const [isYearly, setIsYearly] = useState(false);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkoutPlan, setCheckoutPlan] = useState<any | null>(null);
  const [isUpgrading, setIsUpgrading] = useState(false);

  const { isAuthenticated, user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await plansApi.getPlans();
        setPlans(res.data.data);
      } catch (error) {
        addToast('error', 'Không thể tải bảng giá. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, [addToast]);

  const handleStartCheckout = (plan: any) => {
    if (!isAuthenticated) {
      addToast('info', 'Vui lòng đăng nhập để nâng cấp gói cước!');
      navigate('/login');
      return;
    }
    setCheckoutPlan(plan);
  };

  const handleConfirmUpgrade = async () => {
    if (!checkoutPlan) return;
    setIsUpgrading(true);
    try {
      const res = await plansApi.upgradePlan({
        planId: checkoutPlan.id,
        billingCycle: isYearly ? 'yearly' : 'monthly',
      });

      addToast('success', res.data.message || `Đã kích hoạt thành công ${checkoutPlan.name}!`);
      setCheckoutPlan(null);
    } catch (error: any) {
      console.error(error);
      const msg = error?.response?.data?.message || 'Lỗi trong quá trình kích hoạt gói cước.';
      addToast('error', msg);
    } finally {
      setIsUpgrading(false);
    }
  };

  return (
    <div className="flex-1 w-full bg-[#0a0a0a] min-h-screen pt-20 pb-24">
      <div className="max-w-5xl mx-auto px-4 flex flex-col items-center">
        
        <Badge variant="purple" className="mb-6 px-4 py-1">Nâng cấp tài khoản JobLadder</Badge>
        
        <h1 className="text-4xl md:text-5xl font-display font-bold text-white text-center mb-4">
          Mở Khóa Sức Mạnh AI
        </h1>
        <h2 className="text-3xl md:text-4xl font-display font-bold text-center mb-12">
          <span className="gradient-text">Bứt phá sự nghiệp ngay hôm nay</span>
        </h2>

        {/* Yearly vs Monthly Toggle */}
        <div className="flex items-center gap-4 mb-16">
          <span className={cn("text-sm font-medium", !isYearly ? "text-white" : "text-gray-400")}>
            Thanh toán hàng tháng
          </span>
          <button 
            onClick={() => setIsYearly(!isYearly)}
            className="relative w-12 h-6 rounded-full bg-cyan-600/30 border border-cyan-500/50 transition-colors focus:outline-none cursor-pointer"
          >
            <div className={cn("absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-cyan-400 rounded-full transition-all", isYearly ? "left-7" : "left-1")} />
          </button>
          <span className={cn("text-sm font-medium flex items-center gap-2", isYearly ? "text-white" : "text-gray-400")}>
            Thanh toán hàng năm <Badge variant="green" className="text-[10px]">TIẾT KIỆM 17%</Badge>
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 w-full">
            <Loader2 className="w-10 h-10 text-cyan-400 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-3xl">
            {plans.map((plan) => (
              <Card 
                key={plan.id} 
                className={cn(
                  "p-8 transition-all hover:border-cyan-500/50", 
                  plan.isPopular ? "border-purple-500 relative overflow-visible transform md:-translate-y-4 shadow-[0_0_30px_rgba(168,85,247,0.15)]" : "border-cyan-500/30"
                )}
              >
                {plan.isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge variant="purple" className="bg-purple-500 text-white border-none px-4 py-1 text-sm font-bold shadow-lg shadow-purple-500/30">
                      Phổ biến nhất
                    </Badge>
                  </div>
                )}
                
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <div className="flex items-end gap-1 mb-8">
                  <span className={cn("text-5xl font-bold", plan.isPopular ? "text-purple-400" : "text-white")}>
                    {new Intl.NumberFormat('vi-VN').format(isYearly ? plan.priceYearly : plan.priceMonthly)}đ
                  </span>
                  <span className="text-gray-400 mb-1">/tháng</span>
                </div>
                
                <Button 
                  onClick={() => handleStartCheckout(plan)}
                  variant={plan.isPopular ? "primary" : "outline"} 
                  className={cn(
                    "w-full mb-8 h-12 font-bold",
                    plan.isPopular 
                      ? "bg-purple-500 hover:bg-purple-600 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)]"
                      : "border-purple-500/50 hover:bg-purple-500/10 hover:text-white"
                  )}
                >
                  <Sparkles className="w-4 h-4 mr-2" /> Nâng cấp ngay
                </Button>
                
                <ul className="space-y-5">
                  {plan.features.map((item: any, i: number) => (
                    <li key={i} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-3">
                        <Check className={cn("w-5 h-5", plan.isPopular ? "text-purple-400" : "text-cyan-400")} />
                        <span className="text-gray-300">{item.name}</span>
                      </div>
                      <span className="font-semibold text-white">{item.val}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        )}

        {/* Checkout Modal */}
        {checkoutPlan && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-[#141414] border border-cyan-500/30 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden animate-in zoom-in-95">
              {/* Header */}
              <div className="p-6 border-b border-white/10 flex justify-between items-center bg-gradient-to-r from-cyan-950/30 to-purple-950/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Xác Nhận Nâng Cấp Gói Cước</h3>
                    <p className="text-xs text-gray-400">{checkoutPlan.name} • {isYearly ? 'Gói năm' : 'Gói tháng'}</p>
                  </div>
                </div>
                <button
                  onClick={() => setCheckoutPlan(null)}
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-5">
                {/* Total Cost Display */}
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex justify-between items-center">
                  <div>
                    <span className="text-xs text-gray-400 block">Số tiền thanh toán:</span>
                    <span className="text-2xl font-black text-cyan-400">
                      {new Intl.NumberFormat('vi-VN').format(
                        isYearly ? checkoutPlan.priceYearly * 12 : checkoutPlan.priceMonthly
                      )}đ
                    </span>
                    <span className="text-[11px] text-gray-500 ml-1">
                      ({isYearly ? '12 tháng tiết kiệm 17%' : '1 tháng'})
                    </span>
                  </div>
                  <Badge variant="green" className="font-semibold text-xs">
                    Kích hoạt tức thì
                  </Badge>
                </div>

                {/* QR Code Demo Section */}
                <div className="p-4 rounded-2xl bg-black/60 border border-white/10 text-center space-y-3">
                  <p className="text-xs font-semibold text-gray-300">
                    Quét mã VietQR hoặc Chuyển khoản ngân hàng tự động
                  </p>
                  <div className="w-40 h-40 mx-auto bg-white p-2 rounded-xl flex items-center justify-center shadow-lg">
                    {/* QR Code graphic */}
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=247-JOBLADDER-${checkoutPlan.id}-${user?.email || 'user'}`}
                      alt="VietQR Code"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="text-[11px] text-gray-400 space-y-0.5">
                    <p>Ngân hàng: <strong className="text-white">MB Bank (Quân Đội)</strong></p>
                    <p>Số tài khoản: <strong className="text-cyan-400 font-mono">8888.6666.9999</strong></p>
                    <p>Nội dung CK: <strong className="text-purple-400 font-mono">JOBLADDER {user?.email?.split('@')[0]}</strong></p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>Bảo đảm hoàn tiền trong 7 ngày nếu không hài lòng với kết quả AI.</span>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-white/10 flex justify-end gap-3 bg-white/[0.02]">
                <Button
                  variant="ghost"
                  onClick={() => setCheckoutPlan(null)}
                  disabled={isUpgrading}
                  className="text-gray-400 hover:text-white"
                >
                  Đóng
                </Button>

                <Button
                  onClick={handleConfirmUpgrade}
                  disabled={isUpgrading}
                  className="bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-700 hover:to-cyan-600 text-white font-bold px-6 shadow-lg shadow-purple-500/20"
                >
                  {isUpgrading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" /> Đang kích hoạt...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Kích Hoạt Gói Cước Ngay <ArrowRight className="w-4 h-4" />
                    </span>
                  )}
                </Button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
