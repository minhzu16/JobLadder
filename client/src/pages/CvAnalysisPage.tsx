import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, AlertTriangle, Target, BookOpen, ShieldCheck, 
  Cpu, Sparkles, Loader2, ArrowRight, UploadCloud, RefreshCw, FileText, ExternalLink 
} from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { aiApi, userApi } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

export function CvAnalysisPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToast } = useToast();

  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExtractingFile, setIsExtractingFile] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  // Load existing user CV text if available
  useEffect(() => {
    if (isAuthenticated) {
      userApi.getProfile()
        .then((res) => {
          if (res.data?.data?.resumeText) {
            setResumeText(res.data.data.resumeText);
          }
        })
        .catch(() => {});
    }
  }, [isAuthenticated]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    setIsExtractingFile(true);
    const formData = new FormData();
    formData.append('cvFile', file);

    try {
      const res = await aiApi.extractCvFile(formData);
      const data = res.data.data;
      if (data?.text) {
        setResumeText(data.text);
        addToast('success', `Đã trích xuất ${data.wordCount || 0} từ từ tệp "${data.fileName || file.name}"!`);
      }
    } catch (error: any) {
      console.error('File extract error:', error);
      const msg = error.response?.data?.message || 'Không thể trích xuất văn bản từ tệp này.';
      addToast('error', msg);
    } finally {
      setIsExtractingFile(false);
    }
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!resumeText.trim()) {
      addToast('error', 'Vui lòng nhập hoặc dán nội dung CV của bạn!');
      return;
    }

    if (!isAuthenticated) {
      addToast('error', 'Vui lòng đăng nhập để sử dụng tính năng phân tích CV bằng AI!');
      navigate('/login');
      return;
    }

    setIsLoading(true);
    setAnalysisResult(null);

    try {
      const res = await aiApi.analyzeCV(resumeText.trim(), jobDescription.trim() || undefined);
      const data = res.data.data;
      setAnalysisResult(data);
      addToast('success', 'AI đã hoàn tất phân tích CV của bạn!');
    } catch (error: any) {
      console.error('Analysis error:', error);
      const msg = error.response?.data?.message || 'Có lỗi xảy ra trong quá trình phân tích CV.';
      addToast('error', msg);
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400 stroke-green-500';
    if (score >= 60) return 'text-cyan-400 stroke-cyan-500';
    if (score >= 40) return 'text-yellow-400 stroke-yellow-500';
    return 'text-red-400 stroke-red-500';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return { label: 'Rất Phù Hợp', badge: 'green' };
    if (score >= 60) return { label: 'Khá Phù Hợp', badge: 'cyan' };
    if (score >= 40) return { label: 'Cần Hoàn Thiện Thêm', badge: 'orange' };
    return { label: 'Chưa Đạt Yêu Cầu', badge: 'red' };
  };

  return (
    <div className="flex-1 bg-[#0a0a0a] min-h-[calc(100vh-64px)] overflow-y-auto py-10 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div>
          <Link to="/jobs" className="text-sm font-medium text-purple-400 hover:text-purple-300 transition-colors mb-2 inline-block">
            ← Quay lại danh sách việc làm
          </Link>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-cyan-400 animate-pulse" />
            Hệ Thống Phân Tích CV & ATS Bằng Gemini AI
          </h1>
          <p className="text-gray-400 mt-2">
            Đánh giá độ khớp thực tế, phát hiện kỹ năng còn thiếu (Skill Gap) và nhận gợi ý cải thiện trực tiếp từ trí tuệ nhân tạo.
          </p>
        </div>

        {/* Banner Link to CV Optimizer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-purple-950/40 via-cyan-950/30 to-black border border-cyan-500/20 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Bạn muốn AI viết lại các gạch đầu dòng CV theo chuẩn STAR & Google X-Y-Z?</p>
              <p className="text-xs text-gray-400">Nâng cấp điểm thuyết phục, thêm số liệu đo lường và động từ hành động đắt giá cho hồ sơ.</p>
            </div>
          </div>
          <Link to="/cv-optimizer" className="shrink-0">
            <Button className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md flex items-center gap-1.5 border-none cursor-pointer">
              Tối Ưu Hóa CV Ngay <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>

        {/* Input Form */}
        <Card className="p-6 md:p-8 border-cyan-500/20 shadow-[0_0_30px_rgba(6,182,212,0.05)]">
          <form onSubmit={handleAnalyze} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* CV Input */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-cyan-400" />
                    Nội dung CV của bạn (Bắt buộc) *
                  </label>
                  <label className="text-xs text-purple-400 hover:text-purple-300 cursor-pointer flex items-center gap-1.5 bg-purple-500/10 px-2.5 py-1 rounded-lg border border-purple-500/20 transition-all hover:bg-purple-500/20">
                    {isExtractingFile ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Đang đọc tệp...
                      </>
                    ) : (
                      <>
                        <UploadCloud className="w-3.5 h-3.5" /> Tải PDF / Word / TXT
                      </>
                    )}
                    <input 
                      type="file" 
                      accept=".pdf,.docx,.doc,.txt" 
                      onChange={handleFileUpload} 
                      disabled={isExtractingFile}
                      className="hidden" 
                    />
                  </label>
                </div>
                <textarea
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="Dán toàn bộ nội dung CV của bạn vào đây (Kinh nghiệm, kỹ năng, dự án, học vấn...)"
                  rows={10}
                  className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors font-mono leading-relaxed resize-y"
                />
                <div className="flex justify-between text-[11px] text-gray-500">
                  <span>Dữ liệu sẽ tự động đồng bộ vào hồ sơ của bạn để tính toán độ phù hợp với các Job.</span>
                  <span>{resumeText.length} ký tự</span>
                </div>
              </div>

              {/* JD Input */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-white flex items-center gap-2">
                  <Target className="w-4 h-4 text-purple-400" />
                  Mô tả công việc (Job Description - Tùy chọn)
                </label>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Dán JD vị trí bạn muốn ứng tuyển vào đây để AI đối chiếu trực tiếp. Nếu để trống, AI sẽ đánh giá tổng quan năng lực của CV."
                  rows={10}
                  className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors font-mono leading-relaxed resize-y"
                />
                <div className="text-[11px] text-gray-500">
                  Đối chiếu với JD giúp xác định chính xác từ khóa bị thiếu (Missing Keywords).
                </div>
              </div>

            </div>

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                disabled={isLoading || !resumeText.trim()}
                className="bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 text-white font-bold px-8 h-12 shadow-[0_0_20px_rgba(6,182,212,0.3)] flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Đang phân tích cùng Gemini AI...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Bắt Đầu Phân Tích CV
                  </>
                )}
              </Button>
            </div>
          </form>
        </Card>

        {/* Kết quả Phân tích AI Thật */}
        {analysisResult && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-green-400" />
                Kết Quả Đánh Giá Từ Hệ Thống ATS
              </h2>
              <span className="text-xs text-gray-400">Thời gian đánh giá: Vừa xong</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Cột 1: Điểm ATS & Nhận định tổng quan */}
              <div className="lg:col-span-1 space-y-6">
                
                <Card className="p-6 border-white/10 bg-gradient-to-br from-white/5 to-transparent relative overflow-hidden text-center">
                  <h3 className="text-base font-bold text-gray-300 mb-6">Điểm Đánh Giá ATS (Gemini AI)</h3>
                  
                  <div className="relative w-36 h-36 mx-auto flex items-center justify-center mb-4">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="72" cy="72" r="62" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-white/10" />
                      <circle 
                        cx="72" 
                        cy="72" 
                        r="62" 
                        strokeWidth="10" 
                        fill="transparent" 
                        strokeDasharray="389.5" 
                        strokeDashoffset={389.5 - (389.5 * (analysisResult.score || 0)) / 100} 
                        className={`transition-all duration-1000 ease-out ${getScoreColor(analysisResult.score || 0)}`} 
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-5xl font-black text-white">{analysisResult.score || 0}</span>
                      <span className="text-xs text-gray-400 font-semibold uppercase mt-1">/ 100 Điểm</span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <Badge variant={getScoreLabel(analysisResult.score || 0).badge as any} className="text-sm px-3 py-1 font-bold">
                      {getScoreLabel(analysisResult.score || 0).label}
                    </Badge>
                  </div>
                </Card>

                {/* Từ khóa nhận diện */}
                <Card className="p-6 border-white/10 space-y-5">
                  <div>
                    <h4 className="text-xs font-bold text-green-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4" /> Kỹ năng nổi bật đã khớp ({analysisResult.matchedKeywords?.length || 0})
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {analysisResult.matchedKeywords?.map((kw: string, i: number) => (
                        <span key={i} className="text-xs px-2.5 py-1 bg-green-500/10 text-green-300 border border-green-500/20 rounded-lg">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>

                  {analysisResult.missingKeywords?.length > 0 && (
                    <div className="pt-3 border-t border-white/10">
                      <h4 className="text-xs font-bold text-yellow-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4" /> Từ khóa còn thiếu so với JD ({analysisResult.missingKeywords?.length || 0})
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {analysisResult.missingKeywords.map((kw: string, i: number) => (
                          <span key={i} className="text-xs px-2.5 py-1 bg-yellow-500/10 text-yellow-300 border border-yellow-500/20 rounded-lg">
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {analysisResult.redundantSkills?.length > 0 && (
                    <div className="pt-3 border-t border-white/10">
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                        Kỹ năng ít liên quan
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {analysisResult.redundantSkills.map((kw: string, i: number) => (
                          <span key={i} className="text-xs px-2.5 py-1 bg-white/5 text-gray-400 border border-white/10 rounded-lg">
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>

              </div>

              {/* Cột 2 & 3: Lời khuyên chi tiết & Lộ trình khắc phục Skill Gap */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Lời khuyên của AI */}
                <Card className="p-6 border-white/10 bg-white/5">
                  <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-cyan-400" />
                    Đánh giá chi tiết từ AI Tuyển Dụng
                  </h3>
                  <div className="text-gray-300 text-sm leading-relaxed whitespace-pre-line bg-black/30 p-4 rounded-xl border border-white/5">
                    {analysisResult.feedback}
                  </div>
                </Card>

                {/* Khoảng trống kỹ năng & Khóa học khuyến nghị */}
                <Card className="p-6 border-white/10">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5 text-purple-400" />
                    Khoảng trống kỹ năng (Skill Gap) & Gợi ý cải thiện
                  </h3>

                  {analysisResult.skillGap && analysisResult.skillGap.length > 0 ? (
                    <div className="space-y-4">
                      {analysisResult.skillGap.map((item: any, i: number) => (
                        <div key={i} className="p-4 rounded-xl bg-white/[0.03] border border-white/10 hover:border-purple-500/30 transition-colors">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-semibold text-white text-base flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                              {item.skill}
                            </h4>
                            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${
                              item.priority === 'high' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                              item.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                              'bg-blue-500/20 text-blue-400 border-blue-500/30'
                            }`}>
                              Ưu tiên: {item.priority || 'Trung bình'}
                            </span>
                          </div>
                          {item.suggestedCourse && (
                            <div className="mt-3 p-3 rounded-lg bg-black/40 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <div className="flex items-center gap-2.5 min-w-0">
                                <BookOpen className="w-4 h-4 text-cyan-400 shrink-0" />
                                <div className="truncate">
                                  <span className="text-[10px] uppercase font-bold text-gray-400 block">Khóa học / Chứng chỉ gợi ý:</span>
                                  <span className="text-xs text-white font-medium truncate block">{item.suggestedCourse}</span>
                                </div>
                              </div>
                              <a
                                href={`https://www.google.com/search?q=${encodeURIComponent(item.suggestedCourse + ' course')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/20 text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto transition-colors shrink-0"
                              >
                                Tìm học ngay <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">CV của bạn đáp ứng rất tốt yêu cầu! Không phát hiện khoảng trống kỹ năng đáng kể.</p>
                  )}

                  {/* Lối tắt tạo lộ trình học tập & Tối ưu hóa CV */}
                  <div className="mt-6 pt-4 border-t border-white/10 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-4 p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
                      <div className="flex items-center gap-2.5">
                        <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
                        <div>
                          <p className="text-xs font-semibold text-white">Viết lại câu miêu tả yếu & chuẩn hóa STAR bằng AI</p>
                          <p className="text-[11px] text-gray-400">Tăng mạnh điểm ATS với trợ lý viết lại CV thông minh.</p>
                        </div>
                      </div>
                      <Link to="/cv-optimizer">
                        <Button className="bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-700 hover:to-cyan-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md">
                          Tối Ưu CV Bằng AI <ArrowRight className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
                      <span className="text-xs text-gray-400">
                        Bạn muốn lập kế hoạch học tập từng tuần để bù đắp các kỹ năng này?
                      </span>
                      <Link to="/roadmap">
                        <Button variant="outline" className="border-white/20 text-gray-300 hover:text-white font-semibold text-xs flex items-center gap-2">
                          Tạo Lộ Trình Cá Nhân Hóa <ArrowRight className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>

              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}
