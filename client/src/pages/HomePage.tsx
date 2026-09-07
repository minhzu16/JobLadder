import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Paperclip, Send, Loader2, MapPin, Search, CheckCircle, AlertTriangle, ChevronDown, ChevronRight, BookOpen } from 'lucide-react';
import { chatApi } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { AiLoadingState } from '@/components/AiLoadingState';
import { Link } from 'react-router';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export function HomePage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  
  const [viewMode, setViewMode] = useState<'initial' | 'loading' | 'results'>('initial');
  const [isChatLoading, setIsChatLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated } = useAuth();
  const { addToast } = useToast();

  const [location, setLocation] = useState('all');
  const [fileName, setFileName] = useState('');
  const [activeTab, setActiveTab] = useState<'jobs' | 'courses'>('jobs');
  const [expandedAccordion, setExpandedAccordion] = useState<'strengths' | 'weaknesses' | null>('strengths');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, viewMode]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      addToast('success', `Đã đính kèm ${file.name}`);
    }
  };

  const handleSend = async () => {
    if (!prompt.trim()) return;
    if (!isAuthenticated) {
      addToast('error', 'Vui lòng đăng nhập để sử dụng tính năng này!');
      return;
    }

    const newMsg: Message = { id: Date.now().toString(), role: 'user', content: prompt };
    setMessages(prev => [...prev, newMsg]);
    setPrompt('');
    
    if (viewMode === 'initial') {
      setViewMode('loading');
      setTimeout(() => {
        setViewMode('results');
        simulateAiResponse(newMsg.content);
      }, 2000);
    } else {
      setIsChatLoading(true);
      simulateAiResponse(newMsg.content);
    }
  };

  const simulateAiResponse = async (userPrompt: string) => {
    try {
      let currentSessionId = sessionId;
      if (!currentSessionId) {
        const res = await chatApi.createSession();
        currentSessionId = res.data.data.id;
        setSessionId(currentSessionId);
      }
      const res = await chatApi.sendMessage(currentSessionId as string, userPrompt);
      const aiMsg = res.data.data;
      
      // Phase 2: Listen to Backend Action
      if (aiMsg.action === 'UPDATE_FILTER') {
        if (aiMsg.payload?.location) {
          setLocation(aiMsg.payload.location);
          addToast('info', `Đã tự động lọc theo địa điểm: ${aiMsg.payload.location}`);
        }
      } else if (aiMsg.action === 'REFRESH_JOB_RESULTS') {
        addToast('success', 'Đã tải danh sách việc làm mới nhất từ hệ thống!');
      }

      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error(error);
      addToast('error', 'Không thể kết nối đến máy chủ AI. Vui lòng thử lại sau.');
      setMessages(prev => [...prev, { 
        id: Date.now().toString(), 
        role: 'assistant', 
        content: 'Xin lỗi, hiện tại hệ thống AI đang bận hoặc gặp sự cố kết nối. Vui lòng thử lại sau giây lát.' 
      }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // MOCK DATA for Results
  const jobs = [
    { id: '1', title: 'Java Developer', company: 'Phenikaa-X', logoColor: 'bg-green-600', location: location !== 'all' ? location : 'Hà Nội', salary: '20tr - 40tr VND', match: 82, tags: ['Java', 'Spring Boot', 'MySQL'] },
    { id: '2', title: 'Backend Software Engineer', company: 'Alpaca Solutions', logoColor: 'bg-blue-600', location: 'Hồ Chí Minh', salary: 'Tới 40tr VND', match: 75, tags: ['Node.js', 'PostgreSQL'] },
    { id: '3', title: 'Python AI Engineer', company: 'Smartbooks', logoColor: 'bg-purple-600', location: 'Đà Nẵng', salary: '30tr - 50tr VND', match: 60, tags: ['Python', 'AI/ML'] },
  ];

  const courses = [
    { id: 1, title: 'AWS Certified Solutions Architect', provider: 'Coursera', duration: '4 tuần', matchInfo: '+15% Match cho Backend' },
    { id: 2, title: 'Advanced Spring Boot Microservices', provider: 'Udemy', duration: '2 tuần', matchInfo: '+10% Match cho Java' }
  ];

  const cvAnalysis = fileName ? {
    level: 'Mid-Senior',
    exp: '3 năm',
    strengths: ['Nền tảng vững chắc về Backend', 'Kinh nghiệm với RESTful API'],
    weaknesses: ['Thiếu section về dự án cá nhân', 'Chưa mô tả rõ impact'],
  } : null;

  return (
    <div className="flex flex-1 relative overflow-hidden h-[calc(100dvh-64px)] bg-[#0a0a0a]">
      <main className="flex-1 flex w-full transition-all duration-300 relative">
        {/* Background Grid + Glow Blobs */}
        <div className="absolute inset-0 -z-10 bg-[#0a0a0a]">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]"></div>
          <div className="absolute top-1/2 left-1/4 -translate-y-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#6D28D9] rounded-full blur-[140px] opacity-20 pointer-events-none"></div>
          <div className="absolute top-1/2 right-1/4 -translate-y-1/2 translate-x-1/2 w-[500px] h-[500px] bg-[#22D3EE] rounded-full blur-[140px] opacity-10 pointer-events-none"></div>
        </div>

        {/* View Mode: Initial */}
        {viewMode === 'initial' && (
          <div className="w-full h-full flex flex-col justify-center items-center px-4 py-8">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full px-4 py-1.5 bg-[#6D28D9]/20 border border-[#A855F7]/30 text-[#A855F7] font-medium text-sm shadow-[0_0_15px_rgba(109,40,217,0.3)]">
              <Sparkles className="w-4 h-4" />
              <span>Trợ lí AI hỗ trợ</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white mb-6 text-center">
              Tìm việc thật <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6D28D9] via-[#A855F7] to-[#22D3EE]">dễ dàng!</span>
            </h1>
            
            <div className="w-full max-w-3xl bg-white rounded-3xl p-3 shadow-2xl relative mt-8">
              <div className="px-4 py-3 min-h-[100px] flex flex-col gap-2">
                <textarea 
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Tôi muốn tìm một công việc Junior Java Developer..." 
                  className="w-full bg-transparent text-gray-800 text-lg outline-none resize-none placeholder:text-gray-400"
                  rows={3}
                />
              </div>

              <div className="flex flex-wrap items-center justify-between mt-4 border-t border-gray-100 pt-3 px-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <select 
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="appearance-none bg-gray-100 hover:bg-gray-200 text-gray-700 pl-8 pr-8 py-2 rounded-full text-sm font-medium transition-colors outline-none cursor-pointer"
                    >
                      <option value="all">Mọi địa điểm</option>
                      <option value="hn">Hà Nội</option>
                      <option value="hcm">TP. Hồ Chí Minh</option>
                    </select>
                    <MapPin className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>

                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${fileName ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                  >
                    <Paperclip className="w-4 h-4" />
                    {fileName || 'Thêm CV'}
                  </button>
                  <input ref={fileInputRef} type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={handleFileUpload} />
                </div>
                
                <button 
                  onClick={handleSend}
                  disabled={!prompt.trim()}
                  className="w-12 h-12 flex justify-center items-center bg-black hover:bg-gray-800 text-white rounded-full shadow-md transition-transform hover:scale-105 disabled:opacity-50"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="mt-10 flex flex-wrap justify-center gap-3 w-full max-w-3xl">
              <button onClick={() => setPrompt('Tôi là lập trình viên ReactJS 3 năm kinh nghiệm.')} className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/15 text-gray-300 rounded-2xl text-xs transition-all shadow-sm">💻 Java Senior</button>
              <button onClick={() => setPrompt('Tôi muốn tìm việc vị trí UI/UX Designer với Figma.')} className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/15 text-gray-300 rounded-2xl text-xs transition-all shadow-sm">🎨 UI/UX Designer Figma</button>
              <button onClick={() => setPrompt('DevOps Engineer tại Hà Nội.')} className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/15 text-gray-300 rounded-2xl text-xs transition-all shadow-sm">⚙️ DevOps</button>
            </div>
          </div>
        )}

        {/* View Mode: Loading */}
        {viewMode === 'loading' && (
          <div className="w-full h-full flex items-center justify-center p-4">
            <AiLoadingState />
          </div>
        )}

        {/* View Mode: Results (3 Columns) */}
        {viewMode === 'results' && (
          <div className="w-full h-full flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-white/10">
            
            {/* Left Column: Chat */}
            <div className="w-full md:w-[35%] h-1/2 md:h-full flex flex-col bg-[#050505]">
              <div className="p-4 border-b border-white/10 bg-white/5">
                <h2 className="font-bold text-white flex items-center gap-2"><Sparkles className="w-4 h-4 text-purple-400"/> Trợ lý AI</h2>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-800">
                {messages.map((m) => (
                  <div key={m.id} className={`flex w-full ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${m.role === 'user' ? 'bg-[#6D28D9] text-white rounded-br-none' : 'bg-white/10 text-gray-200 border border-white/5 rounded-bl-none'}`}>
                      <p className="whitespace-pre-wrap">{m.content}</p>
                    </div>
                  </div>
                ))}
                {isChatLoading && (
                  <div className="flex w-full justify-start">
                    <div className="max-w-[85%] rounded-2xl px-4 py-2 bg-white/10 text-gray-200 border border-white/5 rounded-bl-none flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-[#A855F7]" />
                      <span className="text-xs">Đang tìm việc làm phù hợp...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
              
              <div className="p-4 border-t border-white/10">
                {/* Phase 2: Quick-reply chips */}
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                  <button onClick={()=>setPrompt('Tôi muốn tìm công việc ở Hà Nội')} className="shrink-0 text-xs px-3 py-1.5 rounded-full border border-purple-500/30 text-purple-300 hover:bg-purple-500/10 transition-colors">📍 Hà Nội</button>
                  <button onClick={()=>setPrompt('Tìm công ty Remote')} className="shrink-0 text-xs px-3 py-1.5 rounded-full border border-purple-500/30 text-purple-300 hover:bg-purple-500/10 transition-colors">🏠 Remote</button>
                  <button onClick={()=>setPrompt('Mức lương mong muốn trên 30 triệu')} className="shrink-0 text-xs px-3 py-1.5 rounded-full border border-purple-500/30 text-purple-300 hover:bg-purple-500/10 transition-colors">💰 {'>'} 30 triệu</button>
                </div>
                <div className="relative mt-2">
                  <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Nhập yêu cầu bổ sung..."
                    className="w-full bg-white/5 border border-white/10 rounded-full pl-4 pr-10 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors"
                  />
                  <button onClick={handleSend} disabled={isChatLoading || !prompt.trim()} className="absolute right-2 top-1/2 -translate-y-1/2 text-purple-400 hover:text-purple-300 disabled:opacity-50">
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Middle Column: Jobs & Courses */}
            <div className="w-full md:w-[40%] h-1/2 md:h-full flex flex-col bg-[#0a0a0a]">
              {/* Phase 2: Tabs */}
              <div className="p-4 border-b border-white/10 flex justify-start items-center gap-4 bg-white/5">
                <button 
                  onClick={() => setActiveTab('jobs')}
                  className={`font-bold flex items-center gap-2 pb-1 border-b-2 transition-colors ${activeTab === 'jobs' ? 'text-white border-cyan-400' : 'text-gray-500 border-transparent hover:text-gray-300'}`}
                >
                  <Search className="w-4 h-4"/> Công việc
                </button>
                <button 
                  onClick={() => setActiveTab('courses')}
                  className={`font-bold flex items-center gap-2 pb-1 border-b-2 transition-colors ${activeTab === 'courses' ? 'text-white border-[#A855F7]' : 'text-gray-500 border-transparent hover:text-gray-300'}`}
                >
                  <BookOpen className="w-4 h-4"/> Khóa học cải thiện
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-800">
                {activeTab === 'jobs' ? (
                  jobs.map(job => (
                    <div key={job.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 hover:border-cyan-500/40 transition-colors relative overflow-hidden group">
                      <div className="flex gap-4">
                        <div className={`w-12 h-12 rounded-xl ${job.logoColor} flex items-center justify-center shrink-0 font-bold text-white`}>
                          {job.company.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <Link to={`/jobs/${job.id}`} className="text-base font-bold text-white group-hover:text-cyan-400">{job.title}</Link>
                          <p className="text-sm text-gray-400">{job.company}</p>
                          
                          <div className="flex items-center gap-4 mt-2 mb-3">
                            <span className="text-xs text-gray-500 flex items-center gap-1"><MapPin className="w-3 h-3"/> {job.location}</span>
                            <span className="text-xs text-cyan-400 font-semibold">{job.salary}</span>
                          </div>
                          
                          <div className="flex flex-wrap gap-1.5">
                            {job.tags.map(t => <span key={t} className="text-[10px] px-2 py-0.5 rounded border border-white/10 bg-white/5 text-gray-300">{t}</span>)}
                          </div>
                        </div>
                      </div>
                      <div className="absolute top-4 right-4 flex flex-col items-center">
                        <div className="relative w-10 h-10 flex items-center justify-center">
                          <svg className="w-full h-full transform -rotate-90">
                            <circle cx="20" cy="20" r="16" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-white/10" />
                            <circle cx="20" cy="20" r="16" stroke="currentColor" strokeWidth="4" fill="transparent" strokeDasharray="100" strokeDashoffset={100 - job.match} className={`${job.match >= 80 ? 'text-green-500' : 'text-yellow-500'}`} />
                          </svg>
                          <span className="absolute text-[10px] font-bold text-white">{job.match}%</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  courses.map(course => (
                    <div key={course.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 hover:border-[#A855F7]/40 transition-colors">
                      <h3 className="text-sm font-bold text-white mb-1">{course.title}</h3>
                      <p className="text-xs text-gray-400">{course.provider} • {course.duration}</p>
                      <div className="mt-3 inline-block bg-[#A855F7]/20 border border-[#A855F7]/30 text-[#A855F7] px-2 py-1 rounded text-[10px] font-semibold">
                        {course.matchInfo}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Right Column: CV Analysis (Phase 2: Accordion & Fallback) */}
            <div className="w-full md:w-[25%] h-1/2 md:h-full flex flex-col bg-[#050505]">
              <div className="p-4 border-b border-white/10 bg-white/5">
                <h2 className="font-bold text-white flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-400"/> Phân tích CV</h2>
              </div>
              <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-gray-800">
                {cvAnalysis ? (
                  <div className="space-y-6">
                    <div className="text-center pb-4 border-b border-white/10">
                      <div className="w-16 h-16 bg-gradient-to-br from-[#6D28D9]/40 to-cyan-500/20 rounded-full mx-auto flex items-center justify-center border border-[#6D28D9]/50 mb-3">
                        <span className="text-2xl font-bold text-white">IT</span>
                      </div>
                      <h3 className="text-white font-bold">Profile Ứng Viên</h3>
                      <p className="text-xs text-gray-400 mt-1">{cvAnalysis.level} • {cvAnalysis.exp} kinh nghiệm</p>
                    </div>

                    {/* Accordion Strengths */}
                    <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                      <button 
                        onClick={() => setExpandedAccordion(expandedAccordion === 'strengths' ? null : 'strengths')}
                        className="w-full flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 transition-colors"
                      >
                        <h4 className="text-sm font-semibold text-[#A855F7] flex items-center gap-2">
                          <CheckCircle className="w-4 h-4"/> Điểm mạnh nổi bật
                        </h4>
                        <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${expandedAccordion === 'strengths' ? 'rotate-90' : ''}`} />
                      </button>
                      
                      {expandedAccordion === 'strengths' && (
                        <div className="p-3 border-t border-white/10">
                          <ul className="space-y-2">
                            {cvAnalysis.strengths.map((s,i) => (
                              <li key={i} className="text-xs text-gray-300 flex items-start gap-2">
                                <span className="text-[#A855F7] mt-0.5">•</span> {s}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Accordion Weaknesses */}
                    <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden mt-3">
                      <button 
                        onClick={() => setExpandedAccordion(expandedAccordion === 'weaknesses' ? null : 'weaknesses')}
                        className="w-full flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 transition-colors"
                      >
                        <h4 className="text-sm font-semibold text-yellow-400 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4"/> Kỹ năng thiếu hụt
                        </h4>
                        <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${expandedAccordion === 'weaknesses' ? 'rotate-90' : ''}`} />
                      </button>
                      
                      {expandedAccordion === 'weaknesses' && (
                        <div className="p-3 border-t border-white/10 bg-yellow-500/5">
                          <ul className="space-y-2">
                            {cvAnalysis.weaknesses.map((w,i) => (
                              <li key={i} className="text-xs text-gray-300 flex items-start gap-2">
                                <span className="text-yellow-500 mt-0.5">•</span> {w}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    <div className="pt-4 mt-4 border-t border-white/10">
                      <Link to="/roadmap" className="flex items-center justify-center w-full py-2 bg-gradient-to-r from-[#6D28D9] to-cyan-600 hover:opacity-90 text-xs font-semibold text-white rounded-lg transition-opacity shadow-lg">
                        Tạo Roadmap Cải Thiện
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-70">
                    <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                      <Paperclip className="w-6 h-6 text-gray-500" />
                    </div>
                    <p className="text-sm text-gray-400 px-4">Tải lên CV của bạn hoặc chọn từ hồ sơ để AI phân tích kỹ năng & đề xuất Roadmap.</p>
                    <button onClick={() => fileInputRef.current?.click()} className="mt-4 px-4 py-2 bg-white/10 hover:bg-white/20 text-xs font-semibold text-white rounded-lg transition-colors border border-white/20">
                      Tải lên CV
                    </button>
                  </div>
                )}
              </div>
            </div>
            
          </div>
        )}

      </main>
    </div>
  );
}
