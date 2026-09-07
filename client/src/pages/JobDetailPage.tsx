import React, { useState, useRef, useEffect } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { 
  ArrowLeft, Bookmark, Sparkles, MapPin, Building, Briefcase, 
  Clock, Calendar, Send, Loader2, CheckCircle, Target, BookOpen, 
  User, AlertTriangle, UploadCloud, X, FileText, Check 
} from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router';
import { jobsApi, userApi } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

export function JobDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToast } = useToast();

  const [job, setJob] = useState<any>(null);
  const [isLoadingJob, setIsLoadingJob] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [isApplied, setIsApplied] = useState(false);

  // Contextual Chat states
  const [chatPrompt, setChatPrompt] = useState('');
  const [chatMessages, setChatMessages] = useState<{ id: string; role: string; content: string }[]>([
    { 
      id: '1', 
      role: 'assistant', 
      content: 'Chào bạn! Tôi là trợ lý AI JobLadder. Bạn có thể hỏi tôi bất kỳ điều gì về yêu cầu công việc, mức độ phù hợp với CV của bạn, hoặc lời khuyên phỏng vấn cho vị trí này.' 
    }
  ]);
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Match Breakdown states
  const [matchData, setMatchData] = useState<any>(null);
  const [isMatchLoading, setIsMatchLoading] = useState(true);
  const [matchError, setMatchError] = useState<string | null>(null);

  // Apply Modal state
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmittingApply, setIsSubmittingApply] = useState(false);
  const [userCVs, setUserCVs] = useState<any[]>([]);
  const [selectedCvMode, setSelectedCvMode] = useState<'saved' | 'upload'>('saved');
  const [selectedCvId, setSelectedCvId] = useState<string>('');
  const [isLoadingCvs, setIsLoadingCvs] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  useEffect(() => {
    if (!slug) return;
    setIsLoadingJob(true);
    setIsMatchLoading(true);
    setMatchError(null);

    jobsApi.getJobBySlug(slug)
      .then((res) => {
        const data = res.data;
        setJob(data);
        setIsSaved(!!data.isSaved);
        setIsApplied(!!data.isApplied);

        // Call real AI match breakdown using the actual job ID
        if (isAuthenticated) {
          jobsApi.getJobMatchBreakdown(data.id)
            .then((matchRes) => {
              setMatchData(matchRes.data.data);
            })
            .catch((err) => {
              const msg = err.response?.data?.message || 'Chưa thể phân tích mức độ phù hợp.';
              setMatchError(msg);
              setMatchData(null);
            })
            .finally(() => setIsMatchLoading(false));
        } else {
          setIsMatchLoading(false);
        }
      })
      .catch((err) => {
        console.error('Job not found:', err);
        setJob(null);
        setIsMatchLoading(false);
      })
      .finally(() => setIsLoadingJob(false));
  }, [slug, isAuthenticated]);

  const handleSendChat = async () => {
    if (!chatPrompt.trim() || !job) return;
    const userText = chatPrompt.trim();
    const newMsg = { id: Date.now().toString(), role: 'user', content: userText };
    setChatMessages((prev) => [...prev, newMsg]);
    setChatPrompt('');
    setIsChatLoading(true);

    try {
      const historyStr = chatMessages
        .map((m) => `${m.role === 'user' ? 'Ứng viên' : 'AI'}: ${m.content}`)
        .join('\n');
      const res = await jobsApi.chatAboutJob(job.id, userText, historyStr);
      const reply = res.data.data.reply;
      setChatMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: 'assistant', content: reply }
      ]);
    } catch (err: any) {
      console.error('Chat error:', err);
      addToast('error', 'Lỗi kết nối với AI cố vấn. Vui lòng thử lại.');
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSendChat();
  };

  const handleToggleBookmark = async () => {
    if (!job) return;
    if (!isAuthenticated) {
      addToast('error', 'Vui lòng đăng nhập để lưu tin tuyển dụng!');
      return;
    }
    try {
      if (isSaved) {
        await jobsApi.unsaveJob(job.id);
        setIsSaved(false);
        addToast('info', 'Đã bỏ lưu tin tuyển dụng.');
      } else {
        await jobsApi.saveJob(job.id);
        setIsSaved(true);
        addToast('success', 'Đã lưu tin tuyển dụng thành công!');
      }
    } catch (err) {
      addToast('error', 'Không thể thay đổi trạng thái lưu tin.');
    }
  };

  const handleOpenApplyModal = async () => {
    if (!isAuthenticated) {
      addToast('error', 'Vui lòng đăng nhập để ứng tuyển công việc này!');
      navigate('/login');
      return;
    }
    if (isApplied) {
      addToast('info', 'Bạn đã nộp hồ sơ ứng tuyển công việc này rồi.');
      return;
    }
    setIsApplyModalOpen(true);
    setIsLoadingCvs(true);
    try {
      const res = await userApi.getUserCVs();
      const cvs = res.data.data || [];
      setUserCVs(cvs);
      if (cvs.length > 0) {
        const defaultCv = cvs.find((c: any) => c.isDefault) || cvs[0];
        setSelectedCvId(defaultCv.id);
        setSelectedCvMode('saved');
      } else {
        setSelectedCvMode('upload');
      }
    } catch (err) {
      console.error('Failed to load user CVs:', err);
      setSelectedCvMode('upload');
    } finally {
      setIsLoadingCvs(false);
    }
  };

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingApply(true);
    try {
      let fileToUpload: File | null = null;
      if (selectedCvMode === 'saved') {
        const chosen = userCVs.find((c) => c.id === selectedCvId);
        if (!chosen || !chosen.extractedText) {
          addToast('error', 'Vui lòng chọn một CV hợp lệ từ danh sách.');
          setIsSubmittingApply(false);
          return;
        }
        const safeTitle = (chosen.title || 'CV-Ung-Tuyen').replace(/[^a-zA-Z0-9_-]/g, '_');
        const blob = new Blob([chosen.extractedText], { type: 'text/plain' });
        fileToUpload = new File([blob], `${safeTitle}.txt`, { type: 'text/plain' });
      } else {
        if (!selectedFile) {
          addToast('error', 'Vui lòng chọn file CV (PDF hoặc DOCX) để nộp.');
          setIsSubmittingApply(false);
          return;
        }
        fileToUpload = selectedFile;
      }

      await jobsApi.applyForJob(job.id, fileToUpload);
      setIsApplied(true);
      setIsApplyModalOpen(false);
      setSelectedFile(null);
      addToast('success', 'Nộp hồ sơ ứng tuyển thành công! Nhà tuyển dụng sẽ phản hồi sớm.');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Nộp hồ sơ thất bại.';
      addToast('error', msg);
    } finally {
      setIsSubmittingApply(false);
    }
  };

  if (isLoadingJob) {
    return (
      <div className="flex-1 w-full bg-[#0a0a0a] min-h-[calc(100vh-64px)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
          <p className="text-gray-400 text-sm">Đang tải thông tin công việc...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="flex-1 w-full bg-[#0a0a0a] min-h-[calc(100vh-64px)] flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-white">Không tìm thấy công việc</h2>
          <p className="text-gray-400 text-sm">Công việc có thể đã hết hạn hoặc đường dẫn không đúng.</p>
          <Link to="/jobs">
            <Button variant="primary">Quay lại danh sách việc làm</Button>
          </Link>
        </div>
      </div>
    );
  }

  const formatSalary = () => {
    if (!job.salaryMin && !job.salaryMax) return 'Thỏa thuận';
    const normMin = job.salaryMin ? (job.salaryMin < 1000 ? job.salaryMin : Math.round(job.salaryMin / 1000000)) : null;
    const normMax = job.salaryMax ? (job.salaryMax < 1000 ? job.salaryMax : Math.round(job.salaryMax / 1000000)) : null;
    if (normMin && normMax) return `${normMin.toLocaleString()} - ${normMax.toLocaleString()} triệu VND`;
    if (normMin) return `Từ ${normMin.toLocaleString()} triệu VND`;
    return `Tới ${normMax!.toLocaleString()} triệu VND`;
  };

  return (
    <div className="flex-1 w-full bg-[#0a0a0a] h-[calc(100dvh-64px)] flex overflow-hidden">
      
      {/* Cột trái: AI Chat theo ngữ cảnh công việc (25%) */}
      <div className="w-full md:w-[25%] h-full flex flex-col bg-[#050505] border-r border-white/10 hidden md:flex">
        <div className="p-4 border-b border-white/10 bg-white/5">
          <Link to="/jobs" className="text-sm font-medium text-gray-400 flex items-center gap-1 hover:text-white transition-colors mb-3">
            <ArrowLeft className="w-4 h-4" /> Danh sách việc làm
          </Link>
          <h2 className="font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" /> Hỏi đáp AI về Job này
          </h2>
          <p className="text-[11px] text-gray-400 mt-1">
            Được hỗ trợ bởi Gemini Flash 3.6 — Đối chiếu trực tiếp JD và CV của bạn.
          </p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-800">
          {chatMessages.map((m) => (
            <div key={m.id} className={`flex w-full ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[90%] rounded-2xl px-4 py-2 text-sm ${
                m.role === 'user' 
                  ? 'bg-[#6D28D9] text-white rounded-br-none' 
                  : 'bg-white/10 text-gray-200 border border-white/5 rounded-bl-none'
              }`}>
                <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>
              </div>
            </div>
          ))}
          {isChatLoading && (
            <div className="flex w-full justify-start">
              <div className="max-w-[85%] rounded-2xl px-4 py-2 bg-white/10 text-gray-200 border border-white/5 rounded-bl-none flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-[#A855F7]" />
                <span className="text-xs">AI đang phân tích câu hỏi...</span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
        
        <div className="p-4 border-t border-white/10 bg-[#050505]">
          <div className="relative">
            <input
              type="text"
              value={chatPrompt}
              onChange={(e) => setChatPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Hỏi về cơ hội, yêu cầu, kinh nghiệm..."
              className="w-full bg-white/5 border border-white/10 rounded-full pl-4 pr-10 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
            />
            <button 
              onClick={handleSendChat} 
              disabled={isChatLoading || !chatPrompt.trim()} 
              className="absolute right-2 top-1/2 -translate-y-1/2 text-purple-400 hover:text-purple-300 disabled:opacity-50 transition-colors p-1"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Cột giữa: Chi tiết công việc thực tế (45%) */}
      <div className="w-full md:w-[45%] h-full overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gray-800 bg-[#0a0a0a]">
        <div className="flex justify-between items-start mb-6 md:hidden">
          <Link to="/jobs" className="text-sm font-medium text-gray-400 flex items-center gap-1 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" /> Trở về
          </Link>
        </div>

        <div className="flex items-start gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 to-cyan-500 flex items-center justify-center shrink-0 shadow-lg text-2xl font-bold text-white overflow-hidden">
            {job.company?.logoUrl ? (
              <img src={job.company.logoUrl} alt={job.company.name} className="w-full h-full object-cover" />
            ) : (
              job.company?.name?.charAt(0) || 'J'
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">{job.title}</h1>
            <p className="text-base text-gray-300 font-medium mb-2">{job.company?.name}</p>
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400">
              <span className="flex items-center gap-1"><MapPin className="w-4 h-4 text-cyan-400" /> {job.location}</span>
              <span className="text-cyan-400 font-semibold">• Lương: {formatSalary()}</span>
            </div>
          </div>
        </div>

        <div className="border border-white/10 rounded-xl p-5 bg-white/5 mb-8">
          <h3 className="text-lg font-bold text-white mb-4">Thông tin chung</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" /> Hình thức</p>
              <p className="text-sm text-gray-300 font-medium">{job.workType || 'Toàn thời gian'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><Building className="w-3.5 h-3.5" /> Kinh nghiệm</p>
              <p className="text-sm text-gray-300 font-medium">{job.experience || 'Không yêu cầu'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Chế độ</p>
              <p className="text-sm text-gray-300 font-medium">{job.workMode || 'Tại văn phòng'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Ngày đăng</p>
              <p className="text-sm text-gray-300 font-medium">{new Date(job.postedAt).toLocaleDateString('vi-VN')}</p>
            </div>
          </div>
        </div>

        <h2 className="text-xl font-bold text-white mb-4">Mô tả công việc</h2>
        <div className="text-gray-300 mb-8 leading-relaxed text-sm md:text-base whitespace-pre-line">
          {job.description}
        </div>

        {job.requirements && (
          <>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
              Yêu cầu ứng viên
              <Badge variant="orange" className="text-[10px]">BẮT BUỘC</Badge>
            </h2>
            <div className="text-gray-300 mb-8 leading-relaxed text-sm md:text-base whitespace-pre-line">
              {job.requirements}
            </div>
          </>
        )}

        {job.benefits && (
          <>
            <h2 className="text-xl font-bold text-white mb-4">Quyền lợi được hưởng</h2>
            <div className="text-gray-300 mb-8 leading-relaxed text-sm md:text-base whitespace-pre-line">
              {job.benefits}
            </div>
          </>
        )}
      </div>

      {/* Cột phải: Bảng đánh giá AI thực tế & Nút Ứng tuyển (30%) */}
      <div className="w-full md:w-[30%] h-full bg-[#050505] border-l border-white/10 flex flex-col hidden md:flex">
        <div className="p-6 flex-1 overflow-y-auto space-y-6 scrollbar-thin scrollbar-thumb-gray-800">
          
          <div className="flex gap-3">
            <Button 
              variant="primary" 
              onClick={handleOpenApplyModal}
              className={`flex-1 font-bold shadow-[0_0_15px_rgba(168,85,247,0.4)] ${isApplied ? 'bg-green-600 hover:bg-green-700' : ''}`}
            >
              {isApplied ? 'Đã Ứng Tuyển ✓' : 'Ứng Tuyển Ngay'}
            </Button>
            <button 
              onClick={handleToggleBookmark}
              title={isSaved ? 'Bỏ lưu tin' : 'Lưu tin tuyển dụng'}
              className={`w-10 h-10 rounded-lg border border-white/10 flex items-center justify-center transition-colors ${
                isSaved ? 'bg-purple-600/30 text-purple-400 border-purple-500/50' : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-purple-400' : ''}`} />
            </button>
          </div>

          {/* Phân tích độ phù hợp AI thật */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden text-center">
            <div className="absolute inset-0 bg-gradient-to-b from-green-500/10 to-transparent pointer-events-none"></div>
            <h3 className="font-bold text-white mb-4 relative z-10">Mức độ phù hợp tổng quan</h3>
            
            {isMatchLoading ? (
              <div className="relative w-28 h-28 mx-auto flex items-center justify-center mb-4 z-10">
                <Loader2 className="w-8 h-8 animate-spin text-green-500" />
              </div>
            ) : matchData ? (
              <>
                <div className="relative w-28 h-28 mx-auto flex items-center justify-center mb-4 z-10">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="56" cy="56" r="48" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/10" />
                    <circle 
                      cx="56" 
                      cy="56" 
                      r="48" 
                      stroke="currentColor" 
                      strokeWidth="8" 
                      fill="transparent" 
                      strokeDasharray="301.59" 
                      strokeDashoffset={301.59 - (301.59 * ((matchData.totalScore || 0) / 100))} 
                      className="text-green-500 transition-all duration-1000 ease-out" 
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-black text-white">{matchData.totalScore || 0}<span className="text-lg">%</span></span>
                  </div>
                </div>
                <p className="text-sm text-green-400 font-medium flex items-center justify-center gap-1 z-10 relative">
                  <CheckCircle className="w-4 h-4" /> Đánh giá tự động theo CV của bạn
                </p>
              </>
            ) : (
              <div className="p-4 space-y-3 z-10 relative">
                <AlertTriangle className="w-8 h-8 text-yellow-500 mx-auto" />
                <p className="text-xs text-gray-300 leading-relaxed">
                  {!isAuthenticated 
                    ? 'Đăng nhập để xem điểm phân tích độ phù hợp từ AI.'
                    : (matchError || 'Vui lòng cập nhật CV để AI tính toán mức độ phù hợp.')}
                </p>
                <Link to="/cv-analysis">
                  <Button variant="outline" size="sm" className="text-xs w-full text-cyan-400 border-cyan-500/30">
                    Cập nhật CV ngay
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Breakdown kỹ năng AI thật */}
          {matchData && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                <Target className="w-4 h-4 text-cyan-400"/> Phân tích Kỹ năng (Gemini ATS)
              </h3>
              
              <div className="space-y-4">
                {matchData.strengths && matchData.strengths.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Điểm cộng</h4>
                    <div className="space-y-2">
                      {matchData.strengths.map((s: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between bg-green-500/10 border border-green-500/20 px-3 py-2 rounded-lg">
                          <span className="text-sm text-green-100 flex items-center gap-1.5">
                            <CheckCircle className="w-3.5 h-3.5 text-green-500"/> {s.skill || s}
                          </span>
                          <Badge variant="green" className="text-[10px] font-bold">
                            {s.impact ? (typeof s.impact === 'number' ? `+${s.impact}%` : s.impact) : '+Match'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {matchData.gaps && matchData.gaps.length > 0 && (
                  <div className="pt-2">
                    <h4 className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Điểm cần bổ sung (Skill Gap)</h4>
                    <div className="space-y-2">
                      {matchData.gaps.map((g: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between bg-yellow-500/10 border border-yellow-500/20 px-3 py-2 rounded-lg">
                          <span className="text-sm text-yellow-100 flex items-center gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5 text-yellow-500"/> {g.skill || g}
                          </span>
                          <Badge variant="orange" className="text-[10px] font-bold">
                            {g.impact ? (typeof g.impact === 'number' ? `${g.impact}%` : g.impact) : '-Gap'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Lối tắt học tập & phỏng vấn */}
          <div className="space-y-3">
            <Link to="/roadmap" className="flex items-center justify-between w-full p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors group">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium text-gray-200">Lộ trình học tập</span>
                  <span className="text-[10px] text-cyan-400 group-hover:text-cyan-300">Cải thiện khoảng trống kỹ năng</span>
                </div>
              </div>
            </Link>
            
            <Link to="/mock-interview" className="flex items-center justify-between w-full p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors group">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <User className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium text-gray-200">Luyện phỏng vấn với Nova AI</span>
              </div>
            </Link>
          </div>

        </div>
      </div>

      {/* Modal Ứng Tuyển Thực Tế */}
      {isApplyModalOpen && (
        <div className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121212] border border-white/10 rounded-2xl w-full max-w-lg p-6 relative shadow-2xl animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setIsApplyModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-white mb-1">Ứng tuyển vị trí</h3>
            <p className="text-sm text-purple-400 font-medium mb-4">{job.title} — {job.company?.name}</p>

            {/* Mode Tabs */}
            <div className="flex rounded-xl bg-white/5 p-1 mb-5 border border-white/10">
              <button
                type="button"
                onClick={() => setSelectedCvMode('saved')}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  selectedCvMode === 'saved'
                    ? 'bg-gradient-to-r from-purple-600 to-cyan-500 text-white shadow'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                Chọn từ Hồ sơ {userCVs.length > 0 ? `(${userCVs.length})` : ''}
              </button>
              <button
                type="button"
                onClick={() => setSelectedCvMode('upload')}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  selectedCvMode === 'upload'
                    ? 'bg-gradient-to-r from-purple-600 to-cyan-500 text-white shadow'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <UploadCloud className="w-3.5 h-3.5" />
                Tải lên tệp mới
              </button>
            </div>

            <form onSubmit={handleSubmitApplication} className="space-y-5">
              {isLoadingCvs ? (
                <div className="py-8 flex flex-col items-center justify-center gap-2">
                  <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
                  <p className="text-xs text-gray-400">Đang tải danh mục CV của bạn...</p>
                </div>
              ) : selectedCvMode === 'saved' ? (
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                    Chọn phiên bản CV nộp cho nhà tuyển dụng:
                  </label>

                  {userCVs.length === 0 ? (
                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 text-center space-y-2">
                      <p className="text-xs text-gray-400">Bạn chưa lưu bản CV nào trong hồ sơ cá nhân.</p>
                      <button
                        type="button"
                        onClick={() => setSelectedCvMode('upload')}
                        className="text-xs text-cyan-400 hover:underline font-semibold cursor-pointer"
                      >
                        Tải lên tệp mới ngay tại đây
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                      {userCVs.map((cv) => {
                        const isSelected = selectedCvId === cv.id;
                        return (
                          <div
                            key={cv.id}
                            onClick={() => setSelectedCvId(cv.id)}
                            className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                              isSelected
                                ? 'bg-purple-500/10 border-purple-500/60 shadow-md'
                                : 'bg-white/[0.02] border-white/10 hover:border-white/20'
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                                isSelected ? 'bg-purple-600 text-white' : 'bg-white/5 text-gray-400'
                              }`}>
                                <FileText className="w-4 h-4" />
                              </div>
                              <div className="truncate">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-semibold text-white truncate block">{cv.title}</span>
                                  {cv.isDefault && (
                                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shrink-0">
                                      Mặc định
                                    </span>
                                  )}
                                </div>
                                <span className="text-xs text-gray-400">
                                  {cv.fileName || 'CV Văn bản'} • Cập nhật: {new Date(cv.createdAt).toLocaleDateString('vi-VN')}
                                </span>
                              </div>
                            </div>

                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                              isSelected ? 'border-purple-500 bg-purple-500 text-white' : 'border-white/20'
                            }`}>
                              {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                    Đính kèm tệp CV (PDF / DOCX / TXT) *
                  </label>
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-white/20 hover:border-purple-500/50 rounded-xl p-6 text-center cursor-pointer transition-colors bg-white/[0.02]"
                  >
                    <UploadCloud className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                    {selectedFile ? (
                      <p className="text-sm font-medium text-green-400">{selectedFile.name}</p>
                    ) : (
                      <>
                        <p className="text-sm text-gray-300 font-medium">Bấm để chọn file CV từ máy tính</p>
                        <p className="text-xs text-gray-500 mt-1">Hỗ trợ PDF, DOCX (Dung lượng tối đa 5MB)</p>
                      </>
                    )}
                    <input 
                      ref={fileInputRef}
                      type="file" 
                      accept=".pdf,.doc,.docx,.txt"
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-3 justify-end pt-3 border-t border-white/10">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsApplyModalOpen(false)}
                  disabled={isSubmittingApply}
                >
                  Hủy
                </Button>
                <Button 
                  type="submit" 
                  variant="primary"
                  disabled={isSubmittingApply || (selectedCvMode === 'saved' ? !selectedCvId : !selectedFile)}
                  className="font-bold"
                >
                  {isSubmittingApply ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Xác nhận Nộp Hồ Sơ
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
      
    </div>
  );
}
