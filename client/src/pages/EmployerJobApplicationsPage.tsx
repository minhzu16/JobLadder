import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import { employerApi } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import {
  Briefcase, Users, CheckCircle2, Clock, AlertTriangle, ChevronLeft,
  Mail, Phone, FileText, Sparkles, Loader2, ArrowUpRight, Check,
  Building2, MapPin, DollarSign, MessageSquare, ShieldCheck, XCircle, Send
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface ApplicantData {
  id: string;
  userId: string;
  cvUrl?: string;
  status: string;
  matchScore?: number;
  notes?: string;
  appliedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    bio?: string;
    targetRole?: string;
    resumeText?: string;
    avatarUrl?: string;
  };
}

interface JobDetail {
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
  description: string;
  company: {
    name: string;
    logoUrl?: string;
  };
  applications: ApplicantData[];
}

export function EmployerJobApplicationsPage() {
  const { id } = useParams<{ id: string }>();
  const [job, setJob] = useState<JobDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  // Selected applicant for CV modal
  const [viewingCvApplicant, setViewingCvApplicant] = useState<ApplicantData | null>(null);
  
  // Loading states for actions
  const [updatingAppId, setUpdatingAppId] = useState<string | null>(null);
  const [analyzingAppId, setAnalyzingAppId] = useState<string | null>(null);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<{ [appId: string]: any }>({});

  const { isAuthenticated } = useAuth();
  const { addToast } = useToast();

  useEffect(() => {
    if (id) fetchJobApplications();
  }, [id]);

  const fetchJobApplications = async () => {
    setLoading(true);
    try {
      const res = await employerApi.getJobApplications(id!);
      setJob(res.data.data);
    } catch (err) {
      console.error(err);
      addToast('error', 'Không thể tải danh sách ứng viên');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (appId: string, newStatus: string) => {
    setUpdatingAppId(appId);
    try {
      const res = await employerApi.updateApplicationStatus(appId, newStatus);
      setJob(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          applications: prev.applications.map(app =>
            app.id === appId ? { ...app, status: newStatus } : app
          )
        };
      });
      addToast('success', res.data.message || 'Cập nhật trạng thái thành công');
    } catch (err) {
      console.error(err);
      addToast('error', 'Lỗi khi cập nhật trạng thái ứng viên');
    } finally {
      setUpdatingAppId(null);
    }
  };

  const handleAnalyzeWithAI = async (applicant: ApplicantData) => {
    setAnalyzingAppId(applicant.id);
    try {
      const res = await employerApi.analyzeApplicant(applicant.id);
      const data = res.data.data;
      
      // Update state
      setAiAnalysisResult(prev => ({ ...prev, [applicant.id]: data }));
      setJob(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          applications: prev.applications.map(app =>
            app.id === applicant.id ? { ...app, matchScore: data.matchScore } : app
          )
        };
      });

      addToast('success', `AI đã chấm điểm: ${data.matchScore}% phù hợp!`);
    } catch (err: any) {
      console.error(err);
      const msg = err?.response?.data?.message || 'Lỗi khi chấm điểm CV bằng AI.';
      addToast('error', msg);
    } finally {
      setAnalyzingAppId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'reviewing':
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Đang xem xét</Badge>;
      case 'interview':
        return <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">Mời phỏng vấn</Badge>;
      case 'offered':
        return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Đã gửi Offer</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Không phù hợp</Badge>;
      default:
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Chờ xử lý</Badge>;
    }
  };

  const filteredApplications = job?.applications.filter(app => {
    if (filterStatus === 'all') return true;
    return app.status === filterStatus;
  }) || [];

  if (loading) {
    return (
      <div className="flex-1 bg-[#0a0a0a] min-h-[calc(100vh-64px)] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-cyan-400 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">Đang tải hồ sơ ứng viên...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="flex-1 bg-[#0a0a0a] min-h-[calc(100vh-64px)] p-8 text-center">
        <h2 className="text-xl font-bold text-white mb-2">Không tìm thấy tin tuyển dụng</h2>
        <Link to="/employer/jobs" className="text-cyan-400 text-sm hover:underline">
          Quay lại danh sách tin tuyển dụng
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#0a0a0a] min-h-[calc(100vh-64px)] py-8 px-4 md:px-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Back link */}
        <Link
          to="/employer/jobs"
          className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-cyan-400 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Quay lại danh sách tin tuyển dụng
        </Link>

        {/* Job Summary Banner */}
        <div className="bg-gradient-to-r from-cyan-950/40 via-blue-950/20 to-black p-6 md:p-8 rounded-3xl border border-cyan-500/20 shadow-2xl backdrop-blur-md">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="cyan" className="text-xs uppercase tracking-wider font-bold">
                  Quản lý ứng viên
                </Badge>
                <span className="text-gray-500">•</span>
                <span className="text-gray-400 text-xs">{job.company.name}</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-white">{job.title}</h1>
              <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400 pt-1">
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-cyan-400" /> {job.location}</span>
                <span>•</span>
                <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" /> {job.workMode}</span>
                <span>•</span>
                <span className="flex items-center gap-1 text-emerald-400 font-medium"><DollarSign className="w-3.5 h-3.5" /> Lương cạnh tranh</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs text-gray-400">Tổng ứng viên</p>
                <p className="text-2xl font-black text-white">{job.applications.length}</p>
              </div>
              <Link to={`/jobs/${job.slug}`} target="_blank">
                <Button variant="ghost" size="sm" className="border border-white/10 text-gray-300 hover:text-white">
                  Xem tin công khai <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-white/10 text-sm">
          {[
            { key: 'all', label: 'Tất cả ứng viên', count: job.applications.length },
            { key: 'pending', label: 'Chờ xử lý', count: job.applications.filter(a => a.status === 'pending').length },
            { key: 'reviewing', label: 'Đang xem xét', count: job.applications.filter(a => a.status === 'reviewing').length },
            { key: 'interview', label: 'Mời phỏng vấn', count: job.applications.filter(a => a.status === 'interview').length },
            { key: 'offered', label: 'Đã gửi Offer', count: job.applications.filter(a => a.status === 'offered').length },
            { key: 'rejected', label: 'Không phù hợp', count: job.applications.filter(a => a.status === 'rejected').length },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilterStatus(tab.key)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap flex items-center gap-2 ${
                filterStatus === tab.key
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              {tab.label} <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/10">{tab.count}</span>
            </button>
          ))}
        </div>

        {/* Candidate List */}
        {filteredApplications.length === 0 ? (
          <Card className="p-12 text-center border-white/10">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-500">
              <Users className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">Chưa có ứng viên trong mục này</h3>
            <p className="text-gray-400 text-sm">
              Ứng viên nộp hồ sơ sẽ xuất hiện tại đây theo thời gian thực.
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredApplications.map((app) => (
              <Card
                key={app.id}
                className="p-5 md:p-6 border-white/10 hover:border-cyan-500/30 transition-all bg-black/40"
              >
                <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6">

                  {/* Left: Applicant Bio */}
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-md shrink-0">
                        {app.user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <h3 className="text-lg font-bold text-white">{app.user.name}</h3>
                          {getStatusBadge(app.status)}
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {new Date(app.appliedAt).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                        <p className="text-xs text-cyan-400 font-medium">
                          {app.user.targetRole || 'Ứng viên tiềm năng'}
                        </p>
                      </div>
                    </div>

                    {/* Contacts & Bio snippet */}
                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400 pt-1">
                      <span className="flex items-center gap-1 hover:text-white">
                        <Mail className="w-3.5 h-3.5 text-cyan-400" /> {app.user.email}
                      </span>
                      {app.user.phone && (
                        <span className="flex items-center gap-1 hover:text-white">
                          <Phone className="w-3.5 h-3.5 text-cyan-400" /> {app.user.phone}
                        </span>
                      )}
                    </div>

                    {app.user.bio && (
                      <p className="text-xs text-gray-400 italic line-clamp-2 pt-1 border-l-2 border-cyan-500/30 pl-3">
                        "{app.user.bio}"
                      </p>
                    )}
                  </div>

                  {/* Center: ATS Score & AI Screening */}
                  <div className="shrink-0 flex flex-col items-center justify-center p-3 rounded-2xl bg-white/[0.03] border border-white/10 min-w-[170px]">
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                      Điểm Phù Hợp ATS
                    </span>
                    {app.matchScore ? (
                      <div className="text-center">
                        <div className={`text-2xl font-black ${
                          app.matchScore >= 75 ? 'text-emerald-400' : app.matchScore >= 50 ? 'text-yellow-400' : 'text-red-400'
                        }`}>
                          {app.matchScore}%
                        </div>
                        <span className="text-[10px] text-gray-500">Đã thẩm định bằng AI</span>
                      </div>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleAnalyzeWithAI(app)}
                        disabled={analyzingAppId === app.id}
                        className="text-xs bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 h-8 px-3 rounded-lg flex items-center gap-1.5"
                      >
                        {analyzingAppId === app.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Sparkles className="w-3.5 h-3.5" />
                        )}
                        Chấm điểm AI ATS
                      </Button>
                    )}
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-col sm:flex-row lg:flex-col gap-2 shrink-0 justify-center">
                    {/* View Full CV Button */}
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setViewingCvApplicant(app)}
                      className="h-9 text-xs flex items-center gap-1.5 bg-white/5 hover:bg-white/10 text-white border border-white/10"
                    >
                      <FileText className="w-3.5 h-3.5 text-cyan-400" /> Xem Nội Dung CV
                    </Button>

                    {/* Status Changer Actions */}
                    <div className="flex items-center gap-1">
                      <select
                        value={app.status}
                        onChange={(e) => handleStatusChange(app.id, e.target.value)}
                        disabled={updatingAppId === app.id}
                        className="bg-black/60 border border-white/10 rounded-lg text-xs text-white px-2.5 py-2 focus:outline-none focus:border-cyan-500 transition-colors"
                      >
                        <option value="pending">Chờ xử lý</option>
                        <option value="reviewing">Đang xem xét</option>
                        <option value="interview">Mời phỏng vấn</option>
                        <option value="offered">Gửi Offer</option>
                        <option value="rejected">Không phù hợp</option>
                      </select>

                      {updatingAppId === app.id && (
                        <Loader2 className="w-4 h-4 animate-spin text-cyan-400 ml-1" />
                      )}
                    </div>
                  </div>

                </div>

                {/* AI Screening Breakdown Expandable (if freshly analyzed) */}
                {aiAnalysisResult[app.id] && (
                  <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs animate-in fade-in">
                    <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl">
                      <span className="font-bold text-emerald-400 block mb-1 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Điểm mạnh nổi bật
                      </span>
                      <ul className="space-y-1 text-gray-300">
                        {aiAnalysisResult[app.id].strengths?.map((s: any, idx: number) => (
                          <li key={idx}>• <strong className="text-white">{s.skill}:</strong> {s.reasonExplain}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-yellow-500/10 border border-yellow-500/20 p-3 rounded-xl">
                      <span className="font-bold text-yellow-400 block mb-1 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> Kỹ năng còn thiếu
                      </span>
                      <ul className="space-y-1 text-gray-300">
                        {aiAnalysisResult[app.id].gaps?.map((g: any, idx: number) => (
                          <li key={idx}>• <strong className="text-white">{g.skill}:</strong> {g.reasonExplain}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}

        {/* Modal: View Full Candidate CV */}
        {viewingCvApplicant && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#121212] border border-white/10 rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95">
              {/* Header */}
              <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-cyan-400" />
                    Hồ Sơ CV của {viewingCvApplicant.user.name}
                  </h3>
                  <p className="text-xs text-gray-400">Ứng tuyển vị trí {job.title}</p>
                </div>
                <button
                  onClick={() => setViewingCvApplicant(null)}
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              {/* CV Body */}
              <div className="p-6 overflow-y-auto space-y-4 text-sm text-gray-300 leading-relaxed font-sans">
                {viewingCvApplicant.user.resumeText ? (
                  <div className="bg-black/50 p-5 rounded-2xl border border-white/5 whitespace-pre-line text-xs md:text-sm font-mono leading-relaxed">
                    {viewingCvApplicant.user.resumeText}
                  </div>
                ) : (
                  <div className="text-center py-10 text-gray-500">
                    Ứng viên chưa cập nhật bản text của CV.
                  </div>
                )}

                {viewingCvApplicant.cvUrl && (
                  <div className="pt-2">
                    <a
                      href={viewingCvApplicant.cvUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:underline"
                    >
                      <ArrowUpRight className="w-4 h-4" /> Tải về file đính kèm gốc (PDF/Word)
                    </a>
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              <div className="p-4 border-t border-white/10 flex justify-end gap-3 bg-white/[0.02]">
                <Button
                  variant="ghost"
                  onClick={() => setViewingCvApplicant(null)}
                  className="text-gray-400 hover:text-white"
                >
                  Đóng
                </Button>
                <Button
                  onClick={() => {
                    handleStatusChange(viewingCvApplicant.id, 'interview');
                    setViewingCvApplicant(null);
                  }}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" /> Gửi Lời Mời Phỏng Vấn
                </Button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
