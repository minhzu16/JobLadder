import React, { useState, useEffect } from 'react';
import { adminApi } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import {
  ShieldAlert, Users, Briefcase, FileCheck, CheckCircle2,
  XCircle, Search, Trash2, Shield, Sparkles, Building2,
  TrendingUp, BarChart3, Loader2, ArrowUpRight, Crown
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Link } from 'react-router';

export function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<'stats' | 'users' | 'jobs'>('stats');
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [userQuery, setUserQuery] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('ALL');
  const [jobQuery, setJobQuery] = useState('');
  const [jobStatusFilter, setJobStatusFilter] = useState('all');

  // Loading states for actions
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const { user } = useAuth();
  const { addToast } = useToast();

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'jobs') fetchJobs();
  }, [activeTab]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getStats();
      setStats(res.data.data);
    } catch (err) {
      console.error(err);
      addToast('error', 'Không thể tải số liệu thống kê hệ thống');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await adminApi.getUsers({
        q: userQuery || undefined,
        role: userRoleFilter !== 'ALL' ? userRoleFilter : undefined,
      });
      setUsers(res.data.data);
    } catch (err) {
      console.error(err);
      addToast('error', 'Lỗi khi tải danh sách người dùng');
    }
  };

  const fetchJobs = async () => {
    try {
      const res = await adminApi.getJobs({
        q: jobQuery || undefined,
        status: jobStatusFilter !== 'all' ? jobStatusFilter : undefined,
      });
      setJobs(res.data.data);
    } catch (err) {
      console.error(err);
      addToast('error', 'Lỗi khi tải danh sách tin kiểm duyệt');
    }
  };

  const handleUpdateRole = async (userId: string, newRole: string) => {
    setActionLoadingId(`role-${userId}`);
    try {
      await adminApi.updateUserRole(userId, newRole);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
      addToast('success', `Đã cập nhật vai trò thành ${newRole}`);
    } catch (err) {
      console.error(err);
      addToast('error', 'Lỗi khi cập nhật vai trò');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleUpdatePlan = async (userId: string, newPlanId: string) => {
    setActionLoadingId(`plan-${userId}`);
    try {
      await adminApi.updateUserPlan(userId, newPlanId);
      setUsers(prev => prev.map(u => {
        if (u.id === userId) {
          return { ...u, subscription: { ...u.subscription, planId: newPlanId } };
        }
        return u;
      }));
      addToast('success', `Đã cấp gói ${newPlanId.toUpperCase()} cho người dùng!`);
    } catch (err) {
      console.error(err);
      addToast('error', 'Lỗi khi nâng cấp gói cước');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleToggleJobStatus = async (jobId: string) => {
    setActionLoadingId(`job-${jobId}`);
    try {
      const res = await adminApi.toggleJobStatus(jobId);
      const updatedJob = res.data.data;
      setJobs(prev => prev.map(j => j.id === jobId ? { ...j, isActive: updatedJob.isActive } : j));
      addToast('success', res.data.message);
    } catch (err) {
      console.error(err);
      addToast('error', 'Lỗi khi kiểm duyệt tin tuyển dụng');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa vĩnh viễn tin tuyển dụng này?')) return;
    setActionLoadingId(`del-${jobId}`);
    try {
      await adminApi.deleteJob(jobId);
      setJobs(prev => prev.filter(j => j.id !== jobId));
      addToast('success', 'Đã xóa tin tuyển dụng vi phạm thành công');
    } catch (err) {
      console.error(err);
      addToast('error', 'Lỗi khi xóa tin');
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="flex-1 bg-[#0a0a0a] min-h-[calc(100vh-64px)] py-8 px-4 md:px-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Top Header */}
        <div className="bg-gradient-to-r from-red-950/40 via-purple-950/30 to-black p-6 md:p-8 rounded-3xl border border-red-500/20 shadow-2xl backdrop-blur-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="orange" className="text-xs uppercase tracking-wider font-bold bg-red-500/20 text-red-400 border-red-500/40">
                System Administration
              </Badge>
              <span className="text-gray-500 text-xs">•</span>
              <span className="text-gray-400 text-xs">JobLadder Core Management Console</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white flex items-center gap-2.5">
              <ShieldAlert className="w-8 h-8 text-red-400" /> Bảng Điều Khiển Quản Trị Viên
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Kiểm duyệt tin tuyển dụng, quản lý tài khoản người dùng, phân quyền và giám sát hệ sinh thái AI toàn diện.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/employer/jobs">
              <Button variant="secondary" size="sm" className="border-white/10 text-xs">
                Kênh Tuyển Dụng
              </Button>
            </Link>
            <Link to="/jobs">
              <Button variant="ghost" size="sm" className="border-white/10 text-xs text-gray-300">
                Xem Trang Tìm Việc
              </Button>
            </Link>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-3 border-b border-white/10 pb-3">
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'stats'
                ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <BarChart3 className="w-4 h-4" /> Tổng Quan Hệ Sinh Thái
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'users'
                ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-400 border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.2)]'
                : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <Users className="w-4 h-4" /> Quản Lý Người Dùng
          </button>

          <button
            onClick={() => setActiveTab('jobs')}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'jobs'
                ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-400 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <Briefcase className="w-4 h-4" /> Kiểm Duyệt Tin Tuyển Dụng
          </button>
        </div>

        {/* TAB 1: ECOSYSTEM KPI & STATS */}
        {activeTab === 'stats' && (
          <div className="space-y-6 animate-in fade-in">
            {loading || !stats ? (
              <div className="py-20 text-center">
                <Loader2 className="w-8 h-8 animate-spin text-cyan-400 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">Đang tải báo cáo tổng hợp...</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  <Card className="p-6 border-cyan-500/20 bg-gradient-to-br from-cyan-950/20 to-black/60">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Tổng người dùng</p>
                        <h3 className="text-3xl font-black text-white mt-2">{stats.totalUsers}</h3>
                        <p className="text-xs text-cyan-400 mt-1 font-medium">
                          {stats.totalEmployers} Nhà tuyển dụng
                        </p>
                      </div>
                      <div className="p-3 bg-cyan-500/10 rounded-2xl text-cyan-400">
                        <Users className="w-6 h-6" />
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6 border-purple-500/20 bg-gradient-to-br from-purple-950/20 to-black/60">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Tin tuyển dụng</p>
                        <h3 className="text-3xl font-black text-white mt-2">{stats.totalJobs}</h3>
                        <p className="text-xs text-purple-400 mt-1 font-medium flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> {stats.activeJobs} tin đang kích hoạt
                        </p>
                      </div>
                      <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-400">
                        <Briefcase className="w-6 h-6" />
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6 border-emerald-500/20 bg-gradient-to-br from-emerald-950/20 to-black/60">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Hồ sơ ứng tuyển</p>
                        <h3 className="text-3xl font-black text-white mt-2">{stats.totalApplications}</h3>
                        <p className="text-xs text-emerald-400 mt-1 font-medium">
                          Điểm match TB: <strong className="text-white">{stats.avgMatchScore}%</strong>
                        </p>
                      </div>
                      <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-400">
                        <FileCheck className="w-6 h-6" />
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6 border-orange-500/20 bg-gradient-to-br from-orange-950/20 to-black/60">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Phỏng vấn Nova AI</p>
                        <h3 className="text-3xl font-black text-white mt-2">{stats.totalInterviews}</h3>
                        <p className="text-xs text-orange-400 mt-1 font-medium">
                          Voice TTS & Scorecard thật
                        </p>
                      </div>
                      <div className="p-3 bg-orange-500/10 rounded-2xl text-orange-400">
                        <TrendingUp className="w-6 h-6" />
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Plan Distribution Breakdown */}
                <Card className="p-6 md:p-8 border-white/10">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Crown className="w-5 h-5 text-yellow-400" /> Phân Bổ Gói Cước Người Dùng
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                      <span className="text-xs text-gray-400 block">Gói Miễn Phí (Free)</span>
                      <span className="text-2xl font-black text-white">{stats.planStats?.free || 0}</span>
                      <span className="text-xs text-gray-500 block mt-1">Tài khoản trải nghiệm</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20">
                      <span className="text-xs text-cyan-400 block font-semibold">Gói Nâng Cao (Advanced Pro)</span>
                      <span className="text-2xl font-black text-cyan-300">{stats.planStats?.advanced || 0}</span>
                      <span className="text-xs text-gray-400 block mt-1">Hạn mức AI mở rộng</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20">
                      <span className="text-xs text-purple-400 block font-semibold">Gói Thượng Hạng (Premium)</span>
                      <span className="text-2xl font-black text-purple-300">{stats.planStats?.premium || 0}</span>
                      <span className="text-xs text-gray-400 block mt-1">Full tính năng không giới hạn</span>
                    </div>
                  </div>
                </Card>
              </>
            )}
          </div>
        )}

        {/* TAB 2: USER MANAGEMENT */}
        {activeTab === 'users' && (
          <div className="space-y-4 animate-in fade-in">
            {/* Search & Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tìm kiếm theo tên hoặc email..."
                  value={userQuery}
                  onChange={(e) => setUserQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
                  className="w-full bg-black/60 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <select
                value={userRoleFilter}
                onChange={(e) => {
                  setUserRoleFilter(e.target.value);
                  setTimeout(fetchUsers, 0);
                }}
                className="bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="ALL">Tất cả vai trò</option>
                <option value="USER">Ứng viên (USER)</option>
                <option value="EMPLOYER">Nhà tuyển dụng (EMPLOYER)</option>
                <option value="ADMIN">Quản trị viên (ADMIN)</option>
              </select>

              <Button onClick={fetchUsers} className="bg-cyan-600 hover:bg-cyan-700 text-white font-semibold text-sm">
                Tìm kiếm
              </Button>
            </div>

            {/* Users Table */}
            <Card className="border-white/10 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-300">
                  <thead className="bg-white/[0.03] text-xs uppercase font-bold text-gray-400 border-b border-white/10">
                    <tr>
                      <th className="p-4">Người dùng</th>
                      <th className="p-4">Vai trò (Role)</th>
                      <th className="p-4">Gói cước (Plan)</th>
                      <th className="p-4">Hoạt động</th>
                      <th className="p-4 text-right">Phân quyền</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
                              {u.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div>
                              <div className="font-semibold text-white">{u.name}</div>
                              <div className="text-xs text-gray-400">{u.email}</div>
                            </div>
                          </div>
                        </td>

                        <td className="p-4">
                          <Badge
                            className={
                              u.role === 'ADMIN'
                                ? 'bg-red-500/20 text-red-400 border-red-500/30'
                                : u.role === 'EMPLOYER'
                                ? 'bg-purple-500/20 text-purple-400 border-purple-500/30'
                                : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                            }
                          >
                            {u.role}
                          </Badge>
                        </td>

                        <td className="p-4">
                          <span className="capitalize text-xs font-semibold text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-lg border border-cyan-500/20">
                            {u.subscription?.planId || 'free'}
                          </span>
                        </td>

                        <td className="p-4 text-xs text-gray-400 space-y-0.5">
                          <div>{u._count?.createdJobs || 0} tin đăng</div>
                          <div>{u._count?.applications || 0} đơn nộp</div>
                        </td>

                        <td className="p-4 text-right space-x-2">
                          {/* Role selector */}
                          <select
                            value={u.role}
                            disabled={actionLoadingId === `role-${u.id}`}
                            onChange={(e) => handleUpdateRole(u.id, e.target.value)}
                            className="bg-black/60 border border-white/10 rounded-lg text-xs text-white px-2 py-1.5 focus:outline-none focus:border-cyan-500"
                          >
                            <option value="USER">USER</option>
                            <option value="EMPLOYER">EMPLOYER</option>
                            <option value="ADMIN">ADMIN</option>
                          </select>

                          {/* Quick Plan upgrade button */}
                          <select
                            value={u.subscription?.planId || 'free'}
                            disabled={actionLoadingId === `plan-${u.id}`}
                            onChange={(e) => handleUpdatePlan(u.id, e.target.value)}
                            className="bg-purple-950/40 border border-purple-500/30 rounded-lg text-xs text-purple-300 px-2 py-1.5 focus:outline-none focus:border-purple-500"
                          >
                            <option value="free">Free</option>
                            <option value="advanced">Advanced</option>
                            <option value="premium">Premium</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* TAB 3: JOBS MODERATION */}
        {activeTab === 'jobs' && (
          <div className="space-y-4 animate-in fade-in">
            {/* Search & Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tìm theo chức danh hoặc tên công ty..."
                  value={jobQuery}
                  onChange={(e) => setJobQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchJobs()}
                  className="w-full bg-black/60 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <select
                value={jobStatusFilter}
                onChange={(e) => {
                  setJobStatusFilter(e.target.value);
                  setTimeout(fetchJobs, 0);
                }}
                className="bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Đang mở tuyển</option>
                <option value="closed">Đã tạm đóng</option>
              </select>

              <Button onClick={fetchJobs} className="bg-cyan-600 hover:bg-cyan-700 text-white font-semibold text-sm">
                Tìm kiếm
              </Button>
            </div>

            {/* Jobs Moderation List */}
            <div className="space-y-3">
              {jobs.map((job) => (
                <Card
                  key={job.id}
                  className="p-5 border-white/10 hover:border-cyan-500/30 transition-all bg-black/40 flex flex-col md:flex-row justify-between md:items-center gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <Link
                        to={`/jobs/${job.slug}`}
                        target="_blank"
                        className="text-base font-bold text-white hover:text-cyan-400 transition-colors flex items-center gap-1"
                      >
                        {job.title} <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                      <Badge
                        className={
                          job.isActive
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                            : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                        }
                      >
                        {job.isActive ? 'ĐANG MỞ TUYỂN' : 'TẠM ĐÓNG'}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1 text-gray-300 font-medium">
                        <Building2 className="w-3.5 h-3.5 text-cyan-400" /> {job.company.name}
                      </span>
                      <span>•</span>
                      <span>{job.location}</span>
                      <span>•</span>
                      <span>{job._count?.applications || 0} ứng viên</span>
                      <span>•</span>
                      <span>Đăng bởi: <strong className="text-gray-300">{job.creator?.name || 'Hệ thống'}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleJobStatus(job.id)}
                      disabled={actionLoadingId === `job-${job.id}`}
                      className={`text-xs h-9 px-3 rounded-xl border ${
                        job.isActive
                          ? 'border-white/10 text-gray-300 hover:text-yellow-400 hover:bg-yellow-500/10'
                          : 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10'
                      }`}
                    >
                      {actionLoadingId === `job-${job.id}` ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : job.isActive ? (
                        <span className="flex items-center gap-1"><XCircle className="w-3.5 h-3.5" /> Tạm dừng tin</span>
                      ) : (
                        <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Duyệt mở tin</span>
                      )}
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteJob(job.id)}
                      disabled={actionLoadingId === `del-${job.id}`}
                      className="text-xs h-9 px-3 rounded-xl border border-red-500/20 text-red-400 hover:bg-red-500/10"
                    >
                      {actionLoadingId === `del-${job.id}` ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
