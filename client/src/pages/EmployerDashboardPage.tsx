import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { employerApi } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import {
  Briefcase, Plus, Users, Clock, CheckCircle2, XCircle,
  Building2, MapPin, DollarSign, ChevronRight, Eye, ToggleLeft, ToggleRight,
  Loader2, AlertCircle, ArrowUpRight
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface JobData {
  id: string;
  title: string;
  slug: string;
  location: string;
  workType: string;
  workMode: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency: string;
  experience: string;
  industry: string;
  isActive: boolean;
  postedAt: string;
  company: {
    name: string;
    logoUrl?: string;
  };
  _count: {
    applications: number;
    savedBy: number;
  };
}

export function EmployerDashboardPage() {
  const [jobs, setJobs] = useState<JobData[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingJobId, setTogglingJobId] = useState<string | null>(null);

  const { isAuthenticated, user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchJobs();
  }, [isAuthenticated]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await employerApi.getMyJobs();
      setJobs(res.data.data || []);
    } catch (err) {
      console.error(err);
      addToast('error', 'Không thể tải danh sách tin tuyển dụng');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (job: JobData) => {
    setTogglingJobId(job.id);
    try {
      const updatedActive = !job.isActive;
      await employerApi.updateJob(job.id, { isActive: updatedActive });
      setJobs(prev => prev.map(j => j.id === job.id ? { ...j, isActive: updatedActive } : j));
      addToast(
        'success',
        updatedActive ? 'Đã kích hoạt lại tin tuyển dụng' : 'Đã tạm dừng nhận hồ sơ cho tin tuyển dụng'
      );
    } catch (err) {
      console.error(err);
      addToast('error', 'Lỗi khi cập nhật trạng thái tin');
    } finally {
      setTogglingJobId(null);
    }
  };

  const formatSalary = (min?: number, max?: number, currency = 'VND') => {
    if (!min && !max) return 'Thoả thuận';
    if (min && !max) return `Từ ${(min / 1000000).toLocaleString('vi-VN')} Tr ${currency}`;
    if (!min && max) return `Đến ${(max / 1000000).toLocaleString('vi-VN')} Tr ${currency}`;
    return `${(min! / 1000000).toLocaleString('vi-VN')} - ${(max! / 1000000).toLocaleString('vi-VN')} Tr ${currency}`;
  };

  // Summary Metrics
  const totalJobs = jobs.length;
  const activeJobs = jobs.filter(j => j.isActive).length;
  const totalApplications = jobs.reduce((sum, j) => sum + (j._count?.applications || 0), 0);

  if (loading) {
    return (
      <div className="flex-1 bg-[#0a0a0a] min-h-[calc(100vh-64px)] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-cyan-400 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">Đang tải trung tâm nhà tuyển dụng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#0a0a0a] min-h-[calc(100vh-64px)] py-8 px-4 md:px-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Top Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-cyan-950/40 via-blue-950/20 to-black p-6 md:p-8 rounded-3xl border border-cyan-500/20 shadow-2xl backdrop-blur-md">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="cyan" className="text-xs uppercase tracking-wider font-bold">
                Employer Portal
              </Badge>
              <span className="text-gray-500 text-xs">•</span>
              <span className="text-gray-400 text-xs">Quản lý tuyển dụng doanh nghiệp</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white">
              Cổng Tuyển Dụng & Ứng Viên
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Đăng tin tuyển dụng, sàng lọc CV tự động bằng Gemini AI và quản lý quy trình phỏng vấn theo thời gian thực.
            </p>
          </div>

          <Link to="/employer/jobs/new">
            <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold h-11 px-6 rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.3)] flex items-center gap-2 shrink-0">
              <Plus className="w-4 h-4" /> Đăng Tin Tuyển Dụng Mới
            </Button>
          </Link>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <Card className="p-6 border-cyan-500/20 bg-gradient-to-br from-cyan-950/20 to-black/60">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Tổng tin đã đăng</p>
                <h3 className="text-3xl font-black text-white mt-2">{totalJobs}</h3>
                <p className="text-xs text-cyan-400 mt-1 flex items-center gap-1 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {activeJobs} tin đang mở tuyển
                </p>
              </div>
              <div className="p-3 bg-cyan-500/10 rounded-2xl text-cyan-400">
                <Briefcase className="w-6 h-6" />
              </div>
            </div>
          </Card>

          <Card className="p-6 border-purple-500/20 bg-gradient-to-br from-purple-950/20 to-black/60">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Tổng hồ sơ ứng tuyển</p>
                <h3 className="text-3xl font-black text-white mt-2">{totalApplications}</h3>
                <p className="text-xs text-purple-400 mt-1 flex items-center gap-1 font-medium">
                  <Users className="w-3.5 h-3.5" /> Đã kết nối với ứng viên
                </p>
              </div>
              <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-400">
                <Users className="w-6 h-6" />
              </div>
            </div>
          </Card>

          <Card className="p-6 border-emerald-500/20 bg-gradient-to-br from-emerald-950/20 to-black/60">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Công nghệ tuyển dụng</p>
                <h3 className="text-3xl font-black text-white mt-2">AI ATS</h3>
                <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Gemini 3.6 Sàng lọc tự động
                </p>
              </div>
              <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>
          </Card>
        </div>

        {/* Job Listings Management Table */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-cyan-400" /> Danh Sách Tin Tuyển Dụng ({jobs.length})
            </h2>
            <Link to="/jobs" target="_blank" className="text-xs text-gray-400 hover:text-cyan-400 flex items-center gap-1 transition-colors">
              Xem trang tìm việc công khai <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {jobs.length === 0 ? (
            <Card className="p-12 text-center border-white/10">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-500">
                <Briefcase className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">Chưa có tin tuyển dụng nào</h3>
              <p className="text-gray-400 text-sm max-w-md mx-auto mb-6">
                Bắt đầu đăng tin tuyển dụng đầu tiên của bạn để tiếp cận hàng nghìn ứng viên tài năng trên hệ thống JobLadder AI.
              </p>
              <Link to="/employer/jobs/new">
                <Button className="bg-cyan-600 hover:bg-cyan-700 text-white font-semibold">
                  <Plus className="w-4 h-4 mr-1.5" /> Tạo tin tuyển dụng ngay
                </Button>
              </Link>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {jobs.map((job) => (
                <Card
                  key={job.id}
                  className="p-5 md:p-6 border-white/10 hover:border-cyan-500/30 transition-all bg-black/40 hover:bg-black/60"
                >
                  <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4">
                    {/* Left: Job Info */}
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                        {job.company.logoUrl ? (
                          <img src={job.company.logoUrl} alt={job.company.name} className="w-full h-full object-cover" />
                        ) : (
                          <Building2 className="w-6 h-6 text-gray-400" />
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <Link
                            to={`/employer/jobs/${job.id}/applications`}
                            className="text-lg font-bold text-white hover:text-cyan-400 transition-colors"
                          >
                            {job.title}
                          </Link>
                          <span
                            className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${
                              job.isActive
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                : 'bg-gray-500/10 text-gray-400 border-gray-500/30'
                            }`}
                          >
                            {job.isActive ? 'ĐANG MỞ TUYỂN' : 'TẠM ĐÓNG'}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
                          <span className="flex items-center gap-1 font-medium text-gray-300">
                            <Building2 className="w-3.5 h-3.5 text-cyan-400" /> {job.company.name}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" /> {job.location}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                            <DollarSign className="w-3.5 h-3.5" /> {formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" /> {new Date(job.postedAt).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Applications Count & Action Buttons */}
                    <div className="flex items-center gap-3 self-end lg:self-center shrink-0">
                      {/* Application count button */}
                      <Link to={`/employer/jobs/${job.id}/applications`}>
                        <Button
                          variant="secondary"
                          className="h-10 px-4 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-xl flex items-center gap-2"
                        >
                          <Users className="w-4 h-4 text-purple-400" />
                          <span className="font-bold">{job._count?.applications || 0}</span> Ứng viên
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Button>
                      </Link>

                      {/* Toggle active button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleActive(job)}
                        disabled={togglingJobId === job.id}
                        className={`h-10 px-3 rounded-xl border ${
                          job.isActive
                            ? 'border-white/10 text-gray-300 hover:text-red-400 hover:bg-red-500/10'
                            : 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10'
                        }`}
                        title={job.isActive ? 'Tạm đóng tin tuyển dụng' : 'Kích hoạt lại tin'}
                      >
                        {togglingJobId === job.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : job.isActive ? (
                          <span className="text-xs flex items-center gap-1"><XCircle className="w-3.5 h-3.5" /> Đóng tin</span>
                        ) : (
                          <span className="text-xs flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Mở lại</span>
                        )}
                      </Button>

                      {/* Public view button */}
                      <Link to={`/jobs/${job.slug}`} target="_blank">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-10 w-10 p-0 rounded-xl border border-white/10 text-gray-400 hover:text-white"
                          title="Xem trang tuyển dụng công khai"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
