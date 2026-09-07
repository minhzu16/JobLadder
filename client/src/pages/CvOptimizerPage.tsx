import React, { useState, useEffect } from 'react';
import { 
  Sparkles, FileText, CheckCircle2, AlertTriangle, ArrowRight, 
  Copy, Download, RefreshCw, UploadCloud, Target, ShieldCheck, 
  Zap, Award, TrendingUp, Check, Layers, Loader2, BookOpen
} from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { aiApi, authApi, userApi } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

export function CvOptimizerPage() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { addToast } = useToast();

  const [resumeText, setResumeText] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [focusArea, setFocusArea] = useState('comprehensive');
  const [isLoading, setIsLoading] = useState(false);
  const [isExtractingFile, setIsExtractingFile] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [activeTab, setActiveTab] = useState<'rewrites' | 'fullCv'>('rewrites');
  const [result, setResult] = useState<any>(null);

  // Load existing user resume & target role
  useEffect(() => {
    if (isAuthenticated) {
      userApi.getProfile()
        .then((res) => {
          const profile = res.data.data;
          if (profile?.resumeText) {
            setResumeText(profile.resumeText);
          }
          if (profile?.targetRole) {
            setTargetRole(profile.targetRole);
          }
        })
        .catch(() => {});
    }
  }, [isAuthenticated]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input value so user can upload same file again if desired
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

  const handleOptimize = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!resumeText.trim()) {
      addToast('error', 'Vui lòng nhập hoặc tải tệp CV của bạn!');
      return;
    }

    if (!isAuthenticated) {
      addToast('error', 'Vui lòng đăng nhập để sử dụng tính năng tối ưu hóa CV!');
      navigate('/login');
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const res = await aiApi.optimizeCV({
        resumeText: resumeText.trim(),
        targetRole: targetRole.trim() || undefined,
        focusArea,
      });
      setResult(res.data.data);
      addToast('success', 'AI đã hoàn thành tối ưu hóa và viết lại các điểm chạm trong CV của bạn!');
    } catch (error: any) {
      console.error('Optimize error:', error);
      const msg = error.response?.data?.message || 'Có lỗi xảy ra khi tối ưu hóa CV.';
      addToast('error', msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyToMasterResume = async () => {
    if (!result?.fullOptimizedCV) return;

    setIsApplying(true);
    try {
      await userApi.updateProfile({ resumeText: result.fullOptimizedCV });
      try {
        await userApi.createUserCV({
          title: `CV Tối Ưu AI - ${targetRole || 'Bản Chuẩn'} (${new Date().toLocaleDateString('vi-VN')})`,
          extractedText: result.fullOptimizedCV,
          isDefault: true,
        });
      } catch (e) {
        // Ignore if already exists or minor error
      }
      setResumeText(result.fullOptimizedCV);
      addToast('success', 'Đã lưu bản CV tối ưu làm Master Resume và đồng bộ vào kho hồ sơ!');
    } catch (error) {
      console.error('Apply to master error:', error);
      addToast('error', 'Không thể cập nhật hồ sơ.');
    } finally {
      setIsApplying(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    addToast('success', 'Đã sao chép nội dung vào khay nhớ tạm!');
  };

  const handleDownload = (text: string, filename: string) => {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addToast('success', 'Đang tải tệp về máy...');
  };

  return (
    <div className="flex-1 bg-[#020805] text-white min-h-[calc(100vh-64px)] overflow-y-auto py-10 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Navigation & Title */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link to="/cv-analysis" className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors">
              ← Kiểm tra điểm ATS
            </Link>
            <span className="text-gray-600">•</span>
            <Link to="/profile" className="text-xs font-semibold text-purple-400 hover:text-purple-300 transition-colors">
              Hồ sơ cá nhân
            </Link>
          </div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
                <Sparkles className="w-8 h-8 text-cyan-400 animate-pulse" />
                Trợ Lý Tối Ưu Hóa & Viết Lại CV AI
              </h1>
              <p className="text-gray-400 text-sm mt-1 max-w-2xl">
                Nâng cấp từng gạch đầu dòng theo chuẩn <span className="text-cyan-300 font-semibold">Google X-Y-Z & STAR</span>, bổ sung động từ hành động uy lực và chỉ số định lượng giúp hồ sơ của bạn nổi bật trước nhà tuyển dụng.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 flex items-center gap-1.5 font-medium">
                <ShieldCheck className="w-4 h-4 text-cyan-400" /> Chuẩn ATS Quốc Tế
              </span>
            </div>
          </div>
        </div>

        {/* Main Grid: Inputs vs Results */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Form Controls (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <Card className="p-6 border-white/10 bg-white/[0.03] backdrop-blur-xl shadow-2xl space-y-5">
              <form onSubmit={handleOptimize} className="space-y-5">
                
                {/* CV Input & Upload Header */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-gray-200 uppercase tracking-wider flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-cyan-400" /> Nội dung CV gốc *
                    </label>
                    
                    <label className="text-xs font-semibold text-purple-400 hover:text-purple-300 cursor-pointer flex items-center gap-1 bg-purple-500/10 px-2.5 py-1 rounded-lg border border-purple-500/20 transition-all hover:bg-purple-500/20">
                      {isExtractingFile ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Đang đọc tệp...
                        </>
                      ) : (
                        <>
                          <UploadCloud className="w-3.5 h-3.5" /> Tải PDF/Word/TXT
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
                    placeholder="Dán nội dung CV hoặc tải tệp PDF/Word vào đây..."
                    rows={9}
                    className="w-full bg-black/50 border border-white/10 rounded-xl p-3.5 text-xs text-gray-200 focus:outline-none focus:border-cyan-500 transition-colors font-mono leading-relaxed resize-y"
                  />
                  <div className="flex justify-between text-[11px] text-gray-500">
                    <span>Hỗ trợ tệp: .pdf, .docx, .txt (tối đa 5MB)</span>
                    <span>{resumeText.length} ký tự</span>
                  </div>
                </div>

                {/* Target Role Input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-200 uppercase tracking-wider flex items-center gap-1.5">
                    <Target className="w-4 h-4 text-purple-400" /> Vị trí ứng tuyển mục tiêu
                  </label>
                  <input
                    type="text"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    placeholder="VD: Senior Frontend Engineer, Product Manager, Data Analyst..."
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>

                {/* Focus Area Selection */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-200 uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-emerald-400" /> Trọng tâm cải thiện
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'comprehensive', label: 'Toàn diện', desc: 'ATS + STAR + Metrics' },
                      { id: 'metrics', label: 'Lượng hóa số liệu', desc: 'Thêm % KPI & con số' },
                      { id: 'actionVerbs', label: 'Động từ hành động', desc: 'Thay câu bị động' },
                      { id: 'atsFormat', label: 'Chuẩn hóa ATS', desc: 'Bóc tách từ khóa' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setFocusArea(item.id)}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          focusArea === item.id
                            ? 'bg-gradient-to-br from-cyan-950/40 to-purple-950/40 border-cyan-400/60 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                            : 'bg-white/[0.02] border-white/10 hover:border-white/20'
                        }`}
                      >
                        <p className={`text-xs font-bold ${focusArea === item.id ? 'text-cyan-300' : 'text-gray-200'}`}>
                          {item.label}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-0.5 line-clamp-1">{item.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isLoading || isExtractingFile}
                  className="w-full h-12 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-bold text-sm rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all flex items-center justify-center gap-2 cursor-pointer border-none"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Gemini Đang Viết Lại CV...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Tối Ưu Hóa & Viết Lại Bằng AI
                    </>
                  )}
                </Button>
              </form>
            </Card>

            {/* Quick Tips Box */}
            <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/20 space-y-2 text-xs text-gray-300">
              <p className="font-bold text-cyan-300 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-cyan-400" /> Bí quyết CV đạt tỷ lệ gọi phỏng vấn &gt; 90%:
              </p>
              <ul className="space-y-1 text-gray-400 list-disc list-inside">
                <li>Bắt đầu mỗi dòng bằng <span className="text-gray-200 font-semibold">Động từ hành động</span> thay vì "Chịu trách nhiệm".</li>
                <li>Công thức chuẩn Google: <span className="text-cyan-400 font-mono text-[11px]">Đạt được [X] đo bằng [Y] qua [Z]</span>.</li>
                <li>Luôn đưa các con số thực tế: tăng 35% doanh thu, tiết kiệm 10 giờ/tuần...</li>
              </ul>
            </div>
          </div>

          {/* Right Column: AI Results (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {!result && !isLoading && (
              <div className="h-full min-h-[420px] rounded-3xl border border-dashed border-white/15 flex flex-col items-center justify-center p-8 text-center space-y-4 bg-white/[0.01]">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center text-cyan-400">
                  <Sparkles className="w-8 h-8" />
                </div>
                <div className="max-w-md space-y-1">
                  <h3 className="text-base font-bold text-white">Chưa có kết quả tối ưu</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Hãy dán CV hoặc tải tệp lên ở khung bên trái, sau đó nhấn "Tối Ưu Hóa Bằng AI" để nhận bản so sánh Trước / Sau và bản CV đã hoàn thiện.
                  </p>
                </div>
              </div>
            )}

            {isLoading && (
              <div className="h-full min-h-[420px] rounded-3xl border border-white/10 bg-white/[0.02] flex flex-col items-center justify-center p-8 text-center space-y-4">
                <Loader2 className="w-10 h-10 text-cyan-400 animate-spin" />
                <div className="space-y-2">
                  <h3 className="text-base font-bold text-white">Gemini AI đang bóc tách &amp; viết lại từng câu...</h3>
                  <p className="text-xs text-gray-400 max-w-sm">
                    Đang đối chiếu với bộ lọc ATS, áp dụng mô hình STAR và bổ sung số liệu lượng hóa chuyên nghiệp.
                  </p>
                </div>
              </div>
            )}

            {result && (
              <div className="space-y-6 animate-in fade-in duration-500">
                
                {/* Score Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-950/40 to-black border border-cyan-500/30 flex items-center justify-between shadow-lg">
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Điểm Quét ATS</p>
                      <h4 className="text-3xl font-black text-cyan-400 mt-1">{result.atsScore} <span className="text-sm font-normal text-gray-500">/ 100</span></h4>
                      <p className="text-[11px] text-cyan-300/80 mt-0.5">Khả năng vượt qua máy quét tự động</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-950/40 to-black border border-purple-500/30 flex items-center justify-between shadow-lg">
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Chỉ Số Thuyết Phục</p>
                      <h4 className="text-3xl font-black text-purple-400 mt-1">{result.impactScore} <span className="text-sm font-normal text-gray-500">/ 100</span></h4>
                      <p className="text-[11px] text-purple-300/80 mt-0.5">Mức độ ấn tượng với HR &amp; Hiring Manager</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                      <Award className="w-6 h-6" />
                    </div>
                  </div>
                </div>

                {/* Highlights & Weaknesses */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Strengths */}
                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
                    <p className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Điểm mạnh ghi nhận
                    </p>
                    <ul className="space-y-1.5 text-xs text-gray-300">
                      {result.strengths?.map((s: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-emerald-400 mt-0.5">✓</span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Weaknesses */}
                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
                    <p className="text-xs font-bold text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
                      <AlertTriangle className="w-3.5 h-3.5" /> Điểm yếu đã được khắc phục
                    </p>
                    <ul className="space-y-1.5 text-xs text-gray-300">
                      {result.criticalWeaknesses?.map((w: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-amber-400 mt-0.5">⚠</span>
                          <span>{w}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Power Keywords */}
                {result.powerKeywords && result.powerKeywords.length > 0 && (
                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
                    <p className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-cyan-400" /> Từ khóa đắt giá được tối ưu vào CV:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {result.powerKeywords.map((kw: string, idx: number) => (
                        <span key={idx} className="px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-medium">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* View Tabs: Rewrites vs Full CV */}
                <Card className="p-6 border-white/10 bg-white/[0.03] backdrop-blur-xl shadow-2xl space-y-6">
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setActiveTab('rewrites')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          activeTab === 'rewrites'
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                            : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        So Sánh Trước &amp; Sau ({result.bulletPointRewrites?.length || 0})
                      </button>
                      <button
                        onClick={() => setActiveTab('fullCv')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          activeTab === 'fullCv'
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                            : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        Bản CV Hoàn Chỉnh Sau Tối Ưu
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopy(activeTab === 'rewrites' ? JSON.stringify(result.bulletPointRewrites, null, 2) : result.fullOptimizedCV)}
                        className="text-xs text-gray-300 border-white/10 hover:bg-white/10"
                      >
                        <Copy className="w-3.5 h-3.5 mr-1" /> Sao chép
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(result.fullOptimizedCV, `CV_Optimized_${targetRole || 'Candidate'}.txt`)}
                        className="text-xs text-gray-300 border-white/10 hover:bg-white/10"
                      >
                        <Download className="w-3.5 h-3.5 mr-1" /> Tải về
                      </Button>
                    </div>
                  </div>

                  {/* Tab 1: Rewrites list */}
                  {activeTab === 'rewrites' && (
                    <div className="space-y-4">
                      {result.bulletPointRewrites?.map((item: any, idx: number) => (
                        <div key={idx} className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-3">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[11px] font-bold text-gray-400">Gạch đầu dòng #{idx + 1}</span>
                            <div className="flex items-center gap-2">
                              {item.framework && (
                                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20">
                                  {item.framework}
                                </span>
                              )}
                              {item.impactRating && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                                  {item.impactRating}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Before */}
                          <div className="p-3 rounded-xl bg-red-950/20 border border-red-500/20 text-xs">
                            <p className="text-[10px] font-bold text-red-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                              ✗ Bản gốc trong CV:
                            </p>
                            <p className="text-gray-300 italic">"{item.original}"</p>
                          </div>

                          {/* After */}
                          <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-xs space-y-1">
                            <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                              ✓ Bản AI viết lại:
                            </p>
                            <p className="text-white font-medium leading-relaxed">{item.rewritten}</p>
                          </div>

                          {/* Reason */}
                          {item.reason && (
                            <p className="text-[11px] text-gray-400 bg-white/[0.02] p-2.5 rounded-lg border border-white/5">
                              <span className="text-cyan-400 font-semibold">Lý do nâng cấp:</span> {item.reason}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Tab 2: Full Optimized Resume */}
                  {activeTab === 'fullCv' && (
                    <div className="space-y-4">
                      <div className="p-5 rounded-2xl bg-black/60 border border-white/10 font-mono text-xs text-gray-200 whitespace-pre-wrap leading-relaxed max-h-[500px] overflow-y-auto">
                        {result.fullOptimizedCV}
                      </div>

                      {/* Apply 1-click button */}
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 via-cyan-950/30 to-black border border-cyan-500/30">
                        <div>
                          <h4 className="text-xs font-bold text-white">Bạn ưng ý với bản CV này?</h4>
                          <p className="text-[11px] text-gray-400">
                            Cập nhật ngay vào Master Resume để AI tự động tính điểm phù hợp với các tin tuyển dụng.
                          </p>
                        </div>
                        <Button
                          onClick={handleApplyToMasterResume}
                          disabled={isApplying}
                          className="bg-cyan-500 hover:bg-cyan-600 text-black font-bold text-xs px-5 py-2.5 rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.4)] flex items-center gap-2 cursor-pointer shrink-0"
                        >
                          {isApplying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                          Áp dụng vào Master Resume
                        </Button>
                      </div>
                    </div>
                  )}
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
