import React, { useState, useEffect } from 'react';
import { aiApi, jobsApi, userApi } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  FileText, Sparkles, Copy, Check, Download,
  Send, RefreshCw, Briefcase, Building2, Lightbulb,
  BookOpen, ChevronRight, ArrowLeft
} from 'lucide-react';
import { Link } from 'react-router';

export function CoverLetterPage() {
  const [jobTitle, setJobTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [tone, setTone] = useState<'professional' | 'creative' | 'confident'>('professional');
  const [useProfileCv, setUseProfileCv] = useState(true);
  const [customResumeText, setCustomResumeText] = useState('');
  const [hasProfileCv, setHasProfileCv] = useState(false);

  // Result state
  const [loading, setLoading] = useState(false);
  const [generatedLetter, setGeneratedLetter] = useState<string>('');
  const [tips, setTips] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  // Suggested jobs
  const [suggestedJobs, setSuggestedJobs] = useState<any[]>([]);

  const { isAuthenticated, user } = useAuth();
  const { addToast } = useToast();

  useEffect(() => {
    // Load profile to check CV
    if (isAuthenticated) {
      userApi.getProfile()
        .then(res => {
          if (res.data?.data?.resumeText) {
            setHasProfileCv(true);
          }
        })
        .catch(console.error);
    }

    // Load some active jobs for quick autofill
    jobsApi.getJobs({ limit: 4 })
      .then(res => {
        if (res.data?.data) {
          setSuggestedJobs(res.data.data);
        }
      })
      .catch(console.error);
  }, [isAuthenticated]);

  const handleSelectJob = (job: any) => {
    setJobTitle(job.title);
    setCompanyName(job.company?.name || '');
    setJobDescription(job.description || '');
    addToast('info', `Đã điền thông tin việc làm "${job.title}"`);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      addToast('error', 'Vui lòng đăng nhập để sử dụng tính năng tạo Cover Letter AI.');
      return;
    }

    if (!jobTitle.trim()) {
      addToast('error', 'Vui lòng nhập chức danh hoặc vị trí ứng tuyển.');
      return;
    }

    if (!useProfileCv && !customResumeText.trim()) {
      addToast('error', 'Vui lòng nhập nội dung CV hoặc chọn dùng CV từ hồ sơ cá nhân.');
      return;
    }

    setLoading(true);
    setGeneratedLetter('');
    setTips([]);

    try {
      const res = await aiApi.generateCoverLetter({
        jobTitle,
        companyName,
        jobDescription,
        tone,
        customResumeText: !useProfileCv ? customResumeText : undefined,
      });

      const data = res.data.data;
      setGeneratedLetter(data.coverLetter);
      setTips(data.tips || []);
      addToast('success', 'Cover Letter đã được Gemini AI khởi tạo thành công! 🎉');
    } catch (error: any) {
      console.error(error);
      const msg = error?.response?.data?.message || 'Không thể tạo Cover Letter. Vui lòng thử lại sau.';
      addToast('error', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!generatedLetter) return;
    navigator.clipboard.writeText(generatedLetter);
    setCopied(true);
    addToast('success', 'Đã sao chép Cover Letter vào Clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!generatedLetter) return;
    const element = document.createElement('a');
    const file = new Blob([generatedLetter], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `Cover_Letter_${jobTitle.replace(/\s+/g, '_')}_JobLadder.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    addToast('success', 'Đã tải tệp Cover Letter về máy!');
  };

  const wordCount = generatedLetter ? generatedLetter.trim().split(/\s+/).length : 0;

  return (
    <div className="flex-1 bg-[#0a0a0a] min-h-[calc(100vh-64px)] py-8 px-4 md:px-8">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Header Hero */}
        <div className="bg-gradient-to-r from-blue-950/40 via-purple-950/30 to-black p-6 md:p-8 rounded-3xl border border-blue-500/20 shadow-2xl backdrop-blur-md">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="purple" className="text-xs uppercase tracking-wider font-bold">
              AI Job Application Suite
            </Badge>
            <span className="text-gray-500 text-xs">•</span>
            <span className="text-gray-400 text-xs">Gemini AI Cover Letter Engine</span>
          </div>
          <h1 className="text-2xl md:text-4xl font-black text-white flex items-center gap-3">
            <FileText className="w-8 h-8 text-cyan-400" /> Trợ Lý Viết Cover Letter AI
          </h1>
          <p className="text-sm text-gray-400 mt-2 max-w-3xl leading-relaxed">
            Tự động đối chiếu kỹ năng trong CV với Mô tả công việc (JD) để tạo ra thư xin việc thuyết phục, chuẩn giọng điệu doanh nghiệp và gây ấn tượng mạnh với nhà tuyển dụng ngay vòng đầu.
          </p>
        </div>

        {/* Quick autofill from top jobs */}
        {suggestedJobs.length > 0 && (
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
            <span className="text-xs text-gray-400 font-semibold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-yellow-400" /> Điền nhanh từ việc làm đang mở tuyển:
            </span>
            <div className="flex flex-wrap gap-2">
              {suggestedJobs.map(job => (
                <button
                  key={job.id}
                  onClick={() => handleSelectJob(job)}
                  className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-cyan-500/20 hover:border-cyan-500/40 border border-white/10 text-xs text-gray-300 hover:text-white transition-all text-left flex items-center gap-1.5"
                >
                  <Briefcase className="w-3 h-3 text-cyan-400" />
                  <span>{job.title}</span>
                  <span className="text-gray-500">({job.company?.name})</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Form Controls */}
          <div className="lg:col-span-5 space-y-6">
            <Card className="p-6 border-white/10 bg-black/40 space-y-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-white/10 pb-3">
                <BookOpen className="w-4 h-4 text-cyan-400" /> Thông Tin Ứng Tuyển
              </h2>

              <form onSubmit={handleGenerate} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    Vị trí ứng tuyển *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Senior React Native Developer"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    Công ty mục tiêu
                  </label>
                  <input
                    type="text"
                    placeholder="VD: VNG Corporation, FPT Software..."
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    Mô tả công việc (JD / Yêu cầu)
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Dán nội dung JD hoặc các yêu cầu chính của vị trí..."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    className="w-full bg-black/60 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-cyan-500 resize-none"
                  />
                </div>

                {/* Tone selection */}
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-2">
                    Giọng điệu thư xin việc (Tone of Voice)
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'professional', label: 'Chuyên nghiệp', desc: 'Lịch sự, trang trọng' },
                      { id: 'confident', label: 'Tự tin', desc: 'Thuyết phục cao' },
                      { id: 'creative', label: 'Nhiệt huyết', desc: 'Sáng tạo, năng động' },
                    ].map(t => (
                      <button
                        type="button"
                        key={t.id}
                        onClick={() => setTone(t.id as any)}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          tone === t.id
                            ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300 shadow-sm'
                            : 'bg-white/[0.02] border-white/10 text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <div className="font-semibold text-xs">{t.label}</div>
                        <div className="text-[10px] text-gray-500 truncate">{t.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Resume Source selection */}
                <div className="pt-2 border-t border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-300">Nguồn hồ sơ cá nhân</span>
                    <button
                      type="button"
                      onClick={() => setUseProfileCv(!useProfileCv)}
                      className="text-xs text-cyan-400 hover:underline"
                    >
                      {useProfileCv ? 'Nhập nội dung CV khác' : 'Dùng CV trong hồ sơ'}
                    </button>
                  </div>

                  {useProfileCv ? (
                    <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-gray-400 flex items-center justify-between">
                      <span>
                        {hasProfileCv ? '✅ Sẽ dùng Master CV đã lưu trong hồ sơ của bạn.' : '⚠️ Chưa có CV trong hồ sơ. Vui lòng nhập thủ công bên dưới.'}
                      </span>
                      <Link to="/profile" className="text-cyan-400 font-semibold hover:underline">
                        Sửa hồ sơ
                      </Link>
                    </div>
                  ) : (
                    <textarea
                      rows={4}
                      placeholder="Dán nội dung tóm tắt kinh nghiệm và kỹ năng của bạn..."
                      value={customResumeText}
                      onChange={(e) => setCustomResumeText(e.target.value)}
                      className="w-full bg-black/60 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-cyan-500 resize-none"
                    />
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-bold text-sm shadow-lg shadow-cyan-500/20"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin" /> Gemini AI đang chắp bút...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4" /> Tạo Thư Xin Việc AI
                    </span>
                  )}
                </Button>
              </form>
            </Card>
          </div>

          {/* Right Column: Generated Cover Letter & Tips */}
          <div className="lg:col-span-7 space-y-6">
            <Card className="p-6 md:p-8 border-white/10 bg-black/40 min-h-[500px] flex flex-col justify-between">
              <div>
                {/* Result Header Bar */}
                <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                  <div>
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <FileText className="w-5 h-5 text-cyan-400" /> Thư Xin Việc Đã Tạo
                    </h2>
                    {generatedLetter && (
                      <span className="text-xs text-gray-400 mt-0.5 block">
                        Độ dài: <strong className="text-cyan-400">{wordCount} từ</strong> • Giọng điệu: <strong className="capitalize text-purple-300">{tone}</strong>
                      </span>
                    )}
                  </div>

                  {generatedLetter && (
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleCopy}
                        className="text-xs border border-white/10 text-gray-300 hover:text-white"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400 mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                        {copied ? 'Đã sao chép' : 'Sao chép'}
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={handleDownload}
                        className="text-xs border-white/10 text-cyan-400 hover:bg-cyan-500/10"
                      >
                        <Download className="w-3.5 h-3.5 mr-1" /> Tải về (.TXT)
                      </Button>
                    </div>
                  )}
                </div>

                {/* Content View */}
                {loading ? (
                  <div className="py-24 text-center space-y-4">
                    <RefreshCw className="w-10 h-10 animate-spin text-cyan-400 mx-auto" />
                    <div className="space-y-1">
                      <p className="text-white font-semibold">Gemini AI đang phân tích CV và viết Cover Letter...</p>
                      <p className="text-xs text-gray-400">Tối ưu hóa câu chữ theo chuẩn ATS và nhấn mạnh các thế mạnh cốt lõi của bạn.</p>
                    </div>
                  </div>
                ) : generatedLetter ? (
                  <div className="space-y-6">
                    <div className="whitespace-pre-line text-sm text-gray-200 leading-relaxed font-serif bg-white/[0.02] p-6 rounded-2xl border border-white/5 selection:bg-cyan-500/30">
                      {generatedLetter}
                    </div>

                    {/* AI Suggestions / Tips */}
                    {tips.length > 0 && (
                      <div className="p-4 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 space-y-2.5">
                        <div className="text-xs font-bold text-yellow-400 flex items-center gap-1.5">
                          <Lightbulb className="w-4 h-4" /> Gợi ý hoàn thiện từ chuyên gia AI:
                        </div>
                        <ul className="space-y-1.5 text-xs text-gray-300 pl-4 list-disc marker:text-yellow-400">
                          {tips.map((tip, idx) => (
                            <li key={idx} className="leading-relaxed">{tip}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-24 text-center space-y-3">
                    <div className="w-14 h-14 mx-auto rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-500">
                      <FileText className="w-7 h-7" />
                    </div>
                    <p className="text-sm font-semibold text-gray-400">Chưa có Cover Letter nào được tạo</p>
                    <p className="text-xs text-gray-500 max-w-sm mx-auto">
                      Điền vị trí ứng tuyển và nhấn nút "Tạo Thư Xin Việc AI" để nhận bản thảo chuyên nghiệp trong vài giây.
                    </p>
                  </div>
                )}
              </div>

              {generatedLetter && (
                <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-gray-500">
                  <span>Mẹo: Bạn có thể chỉnh sửa lại tên người nhận và ngày tháng trước khi gửi.</span>
                  <Link to="/jobs" className="text-cyan-400 hover:underline flex items-center gap-1">
                    Ứng tuyển việc làm ngay <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
            </Card>
          </div>

        </div>

      </div>
    </div>
  );
}
