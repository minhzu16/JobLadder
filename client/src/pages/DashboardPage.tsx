import React, { useEffect, useState } from 'react';
import { dashboardApi } from '@/services/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { User, Activity, FileText, Mic, Map, Loader2, Sparkles, AlertTriangle } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '@/context/AuthContext';

export function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchDashboard = async () => {
      try {
        const res = await dashboardApi.getDashboardData();
        setData(res.data.data);
      } catch (error) {
        console.error('Failed to fetch dashboard', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboard();
  }, [isAuthenticated, navigate]);

  if (isLoading) {
    return (
      <div className="flex-1 bg-[#0a0a0a] min-h-[calc(100vh-64px)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex-1 bg-[#0a0a0a] min-h-[calc(100vh-64px)] flex items-center justify-center text-white">
        Không tải được dữ liệu Dashboard
      </div>
    );
  }

  const { subscription, cvScores, latestRoadmap, recentInterviews } = data;

  const renderUsageBar = (used: number, limit: number, label: string, color: string) => {
    const isUnlimited = limit === -1;
    const percentage = isUnlimited ? 0 : Math.min((used / limit) * 100, 100);
    const isWarning = !isUnlimited && percentage > 80;

    return (
      <div className="mb-4 last:mb-0">
        <div className="flex justify-between text-sm text-gray-400 mb-1">
          <span>{label}</span>
          <span className={isWarning ? 'text-red-400 font-bold' : ''}>
            {isUnlimited ? `${used} / Không giới hạn` : `${used} / ${limit}`}
          </span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
          <div 
            className={`h-1.5 rounded-full ${color}`}
            style={{ width: isUnlimited ? '100%' : `${percentage}%` }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 bg-[#0a0a0a] min-h-[calc(100vh-64px)] overflow-y-auto py-10 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row gap-6 justify-between items-center bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-white/10 p-8 rounded-3xl backdrop-blur-sm">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-3xl font-bold text-white shadow-[0_0_20px_rgba(59,130,246,0.3)]">
              {data.user.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Chào mừng, {data.user.name}</h1>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-semibold text-gray-300 uppercase tracking-wider border border-white/5">
                  Gói {subscription.planId}
                </span>
                {!data.user.resumeReady && (
                  <span className="flex items-center gap-1 text-xs text-yellow-400 bg-yellow-500/10 px-3 py-1 rounded-full border border-yellow-500/20">
                    <AlertTriangle className="w-3 h-3" /> Chưa cập nhật CV
                  </span>
                )}
              </div>
            </div>
          </div>
          <div>
            <Link to="/pricing">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold border-none shadow-[0_0_15px_rgba(59,130,246,0.4)]">
                <Sparkles className="w-4 h-4 mr-2" /> Nâng Cấp Gói
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Col: Credit Usage */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="p-6 border-white/10 bg-white/5 backdrop-blur-md">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-400" />
                Sử dụng trong tháng
              </h2>
              
              {renderUsageBar(subscription.usage.cv.used, subscription.usage.cv.limit, 'Phân Tích CV', 'bg-blue-500')}
              {renderUsageBar(subscription.usage.roadmap.used, subscription.usage.roadmap.limit, 'Tạo Roadmap', 'bg-purple-500')}
              {renderUsageBar(subscription.usage.interview.used, subscription.usage.interview.limit, 'Mock Interview', 'bg-green-500')}
              {renderUsageBar(subscription.usage.chat.used, subscription.usage.chat.limit, 'Chatbot', 'bg-cyan-500')}

              <p className="text-xs text-gray-500 mt-6 text-center">
                Lượt dùng sẽ reset vào {new Date(subscription.resetAt).toLocaleDateString()}
              </p>
            </Card>
          </div>

          {/* Right Col: Activities */}
          <div className="lg:col-span-2 space-y-6">
            {/* CV & Roadmap Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6 border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-400" /> Lần đánh giá CV gần nhất
                </h3>
                {cvScores.length > 0 ? (
                  <div>
                    <div className="text-4xl font-black text-white mb-2">{cvScores[cvScores.length - 1].score} <span className="text-sm font-normal text-gray-400">/ 100</span></div>
                    <p className="text-xs text-gray-500 mb-4">{new Date(cvScores[cvScores.length - 1].createdAt).toLocaleDateString()}</p>
                    <Link to="/cv-analysis">
                      <Button variant="outline" className="w-full text-blue-400 border-blue-500/30 hover:bg-blue-500/10">Phân tích CV mới</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-400 mb-4">Bạn chưa phân tích CV lần nào</p>
                    <Link to="/cv-analysis">
                      <Button className="w-full bg-blue-600 hover:bg-blue-700">Tải CV lên</Button>
                    </Link>
                  </div>
                )}
              </Card>

              <Card className="p-6 border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Map className="w-5 h-5 text-purple-400" /> Roadmap hiện tại
                </h3>
                {latestRoadmap ? (
                  <div>
                    <div className="text-lg font-semibold text-white mb-2 line-clamp-2">{latestRoadmap.goal}</div>
                    <p className="text-xs text-gray-500 mb-4">{new Date(latestRoadmap.createdAt).toLocaleDateString()}</p>
                    <Link to="/roadmap">
                      <Button variant="outline" className="w-full text-purple-400 border-purple-500/30 hover:bg-purple-500/10">Xem Roadmap</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-400 mb-4">Chưa có lộ trình nào</p>
                    <Link to="/roadmap">
                      <Button className="w-full bg-purple-600 hover:bg-purple-700">Tạo Lộ Trình Mới</Button>
                    </Link>
                  </div>
                )}
              </Card>
            </div>

            {/* Recent Interviews */}
            <Card className="p-6 border-white/10 bg-white/5">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Mic className="w-5 h-5 text-green-400" /> Mock Interview gần đây
                </h3>
                <Link to="/mock-interview" className="text-sm text-blue-400 hover:text-blue-300 font-medium">Thực hành mới</Link>
              </div>
              
              {recentInterviews.length > 0 ? (
                <div className="space-y-4">
                  {recentInterviews.map((session: any) => (
                    <div key={session.id} className="bg-black/40 border border-white/5 rounded-xl p-4 flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold text-white">{session.jobTitle}</h4>
                        <p className="text-xs text-gray-500">{new Date(session.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        {session.status === 'completed' ? (
                          <div className="flex items-center gap-2">
                            <span className="text-xl font-bold text-green-400">{session.overallScore}/10</span>
                          </div>
                        ) : (
                          <span className="text-xs font-semibold text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded-md">Đang dở dang</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-6">Chưa có dữ liệu phỏng vấn</p>
              )}
            </Card>
          </div>
        </div>

      </div>
    </div>
  );
}
