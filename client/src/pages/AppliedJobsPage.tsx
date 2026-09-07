import React, { useState, useEffect } from 'react';
import { Briefcase, MapPin, Loader2, ArrowRight, CheckCircle2, Clock, Calendar } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { jobsApi } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export function AppliedJobsPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const { isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const fetchApplications = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setLoading(true);
    try {
      const res = await jobsApi.getAppliedJobs();
      setApplications(res.data.data || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
      addToast('error', 'Không thể tải danh sách hồ sơ đã ứng tuyển.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [isAuthenticated]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'offered':
        return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Đã nhận Offer 🏆</Badge>;
      case 'interview':
        return <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">Mời phỏng vấn 🎉</Badge>;
      case 'reviewing':
        return <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">Đang xem xét 📄</Badge>;
      case 'rejected':
        return <Badge className="text-red-400 bg-red-500/10 border-red-500/30">Chưa phù hợp</Badge>;
      default:
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Đang chờ xử lý</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex-1 bg-[#0a0a0a] min-h-[calc(100vh-64px)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
          <p className="text-gray-400 text-sm">Đang tải lịch sử ứng tuyển...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#0a0a0a] min-h-[calc(100vh-64px)] overflow-y-auto py-10 px-4">
      <div className="max-w-5xl mx-auto space-y-6">
        
        <div className="flex items-center justify-between border-b border-white/10 pb-5">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
              <Briefcase className="w-7 h-7 text-cyan-400" />
              Việc Làm Đã Ứng Tuyển
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Theo dõi tình trạng xử lý hồ sơ từ các nhà tuyển dụng.
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 rounded-full">
            {applications.length} đơn ứng tuyển
          </span>
        </div>

        {applications.length === 0 ? (
          <div className="text-center py-24 bg-white/[0.02] border border-white/5 rounded-3xl space-y-4">
            <Briefcase className="w-12 h-12 text-gray-600 mx-auto" />
            <h3 className="text-lg font-bold text-white">Bạn chưa ứng tuyển vị trí nào</h3>
            <p className="text-gray-400 text-sm max-w-md mx-auto">
              Hàng trăm cơ hội việc làm hấp dẫn đang chờ đón bạn. Hãy nộp CV ngay hôm nay!
            </p>
            <Link to="/jobs">
              <Button variant="primary" className="font-semibold">
                Khám phá việc làm ngay
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <div
                key={app.id}
                className="bg-white/[0.03] border border-white/10 hover:border-cyan-500/40 rounded-2xl p-5 md:p-6 transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-5 group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center shrink-0 text-xl font-bold text-white overflow-hidden shadow-lg">
                    {app.job?.company?.logoUrl ? (
                      <img src={app.job.company.logoUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      app.job?.company?.name?.charAt(0) || 'J'
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">
                        <Link to={`/jobs/${app.job?.slug || app.job?.id}`}>{app.job?.title}</Link>
                      </h3>
                      {getStatusBadge(app.status)}
                    </div>
                    <p className="text-gray-400 text-sm font-medium mb-2">{app.job?.company?.name}</p>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1 text-cyan-400">
                        <MapPin className="w-3.5 h-3.5" /> {app.job?.location}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" /> Ngày nộp: {new Date(app.appliedAt).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end md:self-center">
                  <Link to={`/jobs/${app.job?.slug || app.job?.id}`}>
                    <Button variant="outline" size="sm" className="font-semibold text-xs flex items-center gap-1.5 border-white/10 hover:border-cyan-500/50">
                      Xem tin tuyển dụng <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
