import React, { useState, useEffect, useRef, useCallback } from 'react';
import { interviewApi } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import {
  Loader2, Mic, Play, CheckCircle, ChevronRight, AlertTriangle,
  MicOff, Tag, Timer, Volume2, VolumeX, Award, BarChart3, RefreshCw,
  ArrowRight, Sparkles, Brain, MessageSquare, Target
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface SessionData {
  id: string;
  questions: string[];
  status: string;
  overallScore?: number;
  feedback?: string;
  answers: any[];
}

const TIMER_SECONDS = 90;

export function MockInterviewPage() {
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [session, setSession] = useState<SessionData | null>(null);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isListening, setIsListening] = useState(false);

  // Sprint 3: Timer
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const [timerActive, setTimerActive] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Sprint 3: TTS
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const recognitionRef = useRef<any>(null);
  const submitBtnRef = useRef<HTMLButtonElement>(null);

  const { isAuthenticated } = useAuth();
  const { addToast } = useToast();

  // ──── Speech Recognition Setup ────
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'vi-VN';

        recognitionRef.current.onresult = (event: any) => {
          let finalTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript + ' ';
            }
          }

          if (finalTranscript) {
            setCurrentAnswer(prev => {
              const newAns = prev + finalTranscript;
              if (newAns.toLowerCase().includes('đó là câu trả lời của tôi')) {
                setTimeout(() => {
                  toggleListening(false);
                  submitBtnRef.current?.click();
                }, 500);
              }
              return newAns;
            });
          }
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error', event.error);
          setIsListening(false);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
    }

    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
      stopTimer();
      stopSpeech();
    };
  }, []);

  // ──── Countdown Timer Logic ────
  const startTimer = useCallback(() => {
    stopTimer();
    setTimeLeft(TIMER_SECONDS);
    setTimerActive(true);

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          stopTimer();
          addToast('info', '⏰ Hết thời gian! Câu trả lời đang được gửi tự động.');
          setTimeout(() => submitBtnRef.current?.click(), 300);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setTimerActive(false);
  }, []);

  const stopSpeech = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, []);

  // ──── TTS: Nova reads question aloud with Native Vietnamese Audio Stream ────
  const speakQuestion = useCallback((text: string, force: boolean = false) => {
    if (!ttsEnabled && !force) {
      startTimer();
      return;
    }

    stopSpeech();
    setIsSpeaking(true);

    // Clean text: remove markdown formatting (*, #, _, etc.)
    const cleanText = text
      .replace(/[*#_`~[\]()]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    try {
      // 1. High-Quality Natural Vietnamese Voice via backend stream
      const audioUrl = `/api/ai/tts?text=${encodeURIComponent(cleanText)}`;
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onended = () => {
        setIsSpeaking(false);
        audioRef.current = null;
        startTimer();
      };

      audio.onerror = (e) => {
        console.warn('Backend TTS error, falling back to Web Speech Synthesis...', e);
        audioRef.current = null;

        // 2. Fallback to Web Speech Synthesis
        if (typeof window !== 'undefined' && window.speechSynthesis) {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(cleanText);
          utterance.rate = 0.95;
          utterance.pitch = 1.0;

          // Find Vietnamese voice properly
          const voices = window.speechSynthesis.getVoices();
          const viVoice = voices.find(v =>
            v.lang.toLowerCase().startsWith('vi') ||
            v.lang.toLowerCase().includes('vn') ||
            v.name.toLowerCase().includes('vietnam') ||
            v.name.toLowerCase().includes('tiếng việt')
          );
          if (viVoice) {
            utterance.voice = viVoice;
            utterance.lang = viVoice.lang;
          } else {
            utterance.lang = 'vi-VN';
          }

          utterance.onend = () => {
            setIsSpeaking(false);
            startTimer();
          };
          utterance.onerror = () => {
            setIsSpeaking(false);
            startTimer();
          };

          window.speechSynthesis.speak(utterance);
        } else {
          setIsSpeaking(false);
          startTimer();
        }
      };

      audio.play().catch(err => {
        console.warn('Audio play prevented or blocked:', err);
        setIsSpeaking(false);
        startTimer();
      });
    } catch (err) {
      console.error('Error in speakQuestion:', err);
      setIsSpeaking(false);
      startTimer();
    }
  }, [ttsEnabled, startTimer, stopSpeech]);

  // When question changes, speak it
  useEffect(() => {
    if (session && session.status !== 'completed') {
      const q = session.questions[currentQIndex];
      if (q) {
        const hasAnswered = session.answers.find((a: any) => a.questionIndex === currentQIndex);
        if (!hasAnswered) {
          if (ttsEnabled) {
            speakQuestion(`Câu ${currentQIndex + 1}. ${q}`);
          } else {
            startTimer();
          }
        }
      }
    }
  }, [currentQIndex, session?.id]);

  // ──── Mic toggle ────
  const toggleListening = (forceState?: boolean) => {
    if (!recognitionRef.current) {
      addToast('error', 'Trình duyệt không hỗ trợ nhận diện giọng nói.');
      return;
    }

    const newState = forceState !== undefined ? forceState : !isListening;

    if (newState) {
      setCurrentAnswer('');
      recognitionRef.current.start();
      setIsListening(true);
      addToast('success', 'Mic đã bật. Nói "Đó là câu trả lời của tôi" để gửi.');
    } else {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  // ──── Question category detection ────
  const getQuestionCategory = (question: string) => {
    const qLower = question.toLowerCase();
    if (qLower.includes('tình huống') || qLower.includes('giải quyết') || qLower.includes('khó khăn') || qLower.includes('mâu thuẫn') || qLower.includes('khách hàng'))
      return { label: 'Tình huống', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30', icon: '🎯' };
    if (qLower.includes('công nghệ') || qLower.includes('kỹ thuật') || qLower.includes('framework') || qLower.includes('code') || qLower.includes('ngôn ngữ') || qLower.includes('cơ sở dữ liệu') || qLower.includes('api') || qLower.includes('kiến trúc'))
      return { label: 'Chuyên môn', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: '💻' };
    if (qLower.includes('thành tựu') || qLower.includes('tự hào') || qLower.includes('thành công') || qLower.includes('dự án lớn') || qLower.includes('đóng góp'))
      return { label: 'Thành tựu', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', icon: '🏆' };
    if (qLower.includes('điểm yếu') || qLower.includes('thất bại') || qLower.includes('bài học') || qLower.includes('cải thiện'))
      return { label: 'Tự đánh giá', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30', icon: '🪞' };
    return { label: 'Hành vi', color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30', icon: '🧠' };
  };

  // ──── Start interview ────
  const handleStart = async () => {
    if (!isAuthenticated) { addToast('error', 'Vui lòng đăng nhập!'); return; }
    if (!jobTitle) { addToast('error', 'Vui lòng nhập vị trí ứng tuyển!'); return; }

    setIsLoading(true);
    try {
      const res = await interviewApi.start(jobTitle, jobDescription);
      const data = res.data.data;
      setSession({ id: data.sessionId, questions: data.questions, status: 'in_progress', answers: [] });
      setCurrentQIndex(0);
      setCurrentAnswer('');
      addToast('success', 'Nova đã chuẩn bị bộ câu hỏi. Bắt đầu phỏng vấn!');
    } catch (error: any) {
      console.error(error);
      const msg = error?.response?.data?.message || 'Không thể tạo phiên phỏng vấn. Thử lại sau.';
      addToast('error', msg);
    } finally {
      setIsLoading(false);
    }
  };

  // ──── Submit answer ────
  const handleSubmitAnswer = async () => {
    const cleanedAnswer = currentAnswer.replace(/đó là câu trả lời của tôi/gi, '').trim();
    if (!cleanedAnswer) { addToast('error', 'Vui lòng nhập câu trả lời!'); return; }

    setIsSubmitting(true);
    stopTimer();
    stopSpeech();
    if (isListening) toggleListening(false);

    try {
      const res = await interviewApi.submitAnswer(session!.id, currentQIndex, cleanedAnswer);
      const newAnswerRecord = res.data.data;
      const updatedAnswers = [...session!.answers, newAnswerRecord];
      const isFinished = updatedAnswers.length === session!.questions.length;
      let updatedSession = { ...session!, answers: updatedAnswers };

      if (isFinished) {
        const sessionRes = await interviewApi.getSession(session!.id);
        updatedSession = sessionRes.data.data;
      }

      setSession(updatedSession);
      addToast('success', `Điểm: ${newAnswerRecord.score}/10. Nova đang nhận xét...`);
    } catch (error) {
      console.error(error);
      addToast('error', 'Lỗi khi nộp câu trả lời.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ──── Next question ────
  const handleNextQuestion = () => {
    stopSpeech();
    setCurrentQIndex(prev => prev + 1);
    setCurrentAnswer('');
  };

  // ──── Timer display helper ────
  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const timerColor = timeLeft > 30 ? 'text-green-400' : timeLeft > 10 ? 'text-yellow-400' : 'text-red-400 animate-pulse';

  // ════════════════════════════════════════
  // ──── RENDER: Setup Screen ────
  // ════════════════════════════════════════
  if (!session) {
    return (
      <div className="flex-1 bg-[#0a0a0a] min-h-[calc(100vh-64px)] overflow-y-auto py-10 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center p-3 bg-cyan-500/10 rounded-full mb-4">
              <Mic className="w-8 h-8 text-cyan-400" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-3">Phỏng Vấn Giả Lập Cùng Nova AI</h1>
            <p className="text-gray-400 max-w-xl mx-auto text-sm">
              Luyện phỏng vấn bài bản dưới áp lực thời gian thực. Nova AI đọc câu hỏi bằng giọng nói, đếm ngược 90 giây, và chấm điểm chi tiết theo từng câu trả lời.
            </p>
          </div>

          {/* Feature pills */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            <Badge variant="cyan" className="text-xs flex items-center gap-1.5 px-3 py-1"><Timer className="w-3 h-3" /> Countdown 90s</Badge>
            <Badge variant="green" className="text-xs flex items-center gap-1.5 px-3 py-1"><Volume2 className="w-3 h-3" /> Voice TTS</Badge>
            <Badge variant="purple" className="text-xs flex items-center gap-1.5 px-3 py-1"><Mic className="w-3 h-3" /> Voice STT</Badge>
            <Badge variant="orange" className="text-xs flex items-center gap-1.5 px-3 py-1"><BarChart3 className="w-3 h-3" /> Detailed Scorecard</Badge>
          </div>

          <Card className="p-8 border-cyan-500/20 shadow-[0_0_30px_rgba(6,182,212,0.1)]">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Vị trí ứng tuyển (Bắt buộc) *</label>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="VD: Senior Java Developer, Product Manager..."
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Job Description (Tùy chọn)</label>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Dán nội dung JD vào đây để Nova sinh câu hỏi sát nhất..."
                  className="w-full h-32 bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors resize-none text-sm"
                />
              </div>

              {/* TTS Toggle */}
              <div className="flex items-center justify-between p-3 bg-white/[0.03] border border-white/10 rounded-xl">
                <div className="flex items-center gap-2.5">
                  <Volume2 className="w-4 h-4 text-cyan-400" />
                  <div>
                    <span className="text-sm font-medium text-white block">Nova đọc câu hỏi bằng giọng Tiếng Việt chuẩn</span>
                    <span className="text-[11px] text-gray-500">Giọng AI phát âm chuẩn tự nhiên, ngắt nghỉ theo ngữ điệu</span>
                  </div>
                </div>
                <button
                  onClick={() => setTtsEnabled(!ttsEnabled)}
                  className={`w-11 h-6 rounded-full flex items-center px-0.5 transition-colors ${ttsEnabled ? 'bg-cyan-600 justify-end' : 'bg-gray-700 justify-start'}`}
                >
                  <span className="w-5 h-5 bg-white rounded-full shadow-sm transition-transform" />
                </button>
              </div>

              <Button
                onClick={handleStart}
                disabled={isLoading || !jobTitle}
                className="w-full h-12 bg-cyan-600 hover:bg-cyan-700 text-white font-bold shadow-[0_0_15px_rgba(6,182,212,0.3)]"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : (
                  <span className="flex items-center justify-center gap-2"><Play className="w-4 h-4" /> Bắt Đầu Phỏng Vấn với Nova AI</span>
                )}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════
  // ──── RENDER: Completed Scorecard ────
  // ════════════════════════════════════════
  if (session.status === 'completed') {
    const avgScore = session.overallScore || 0;
    const scoreGrade = avgScore >= 8 ? { label: 'Xuất sắc', color: 'text-green-400', bg: 'border-green-500' }
      : avgScore >= 6 ? { label: 'Khá tốt', color: 'text-cyan-400', bg: 'border-cyan-500' }
      : avgScore >= 4 ? { label: 'Cần cải thiện', color: 'text-yellow-400', bg: 'border-yellow-500' }
      : { label: 'Yếu', color: 'text-red-400', bg: 'border-red-500' };

    // Category breakdown
    const catScores: Record<string, { total: number; count: number }> = {};
    session.answers.forEach((ans: any) => {
      const cat = getQuestionCategory(ans.question);
      if (!catScores[cat.label]) catScores[cat.label] = { total: 0, count: 0 };
      catScores[cat.label].total += (ans.score || 0);
      catScores[cat.label].count += 1;
    });

    return (
      <div className="flex-1 bg-[#0a0a0a] min-h-[calc(100vh-64px)] overflow-y-auto py-10 px-4">
        <div className="max-w-5xl mx-auto space-y-8">

          {/* Scorecard Header */}
          <div className="bg-gradient-to-r from-cyan-950/40 via-blue-950/30 to-black border border-cyan-500/30 rounded-3xl p-8 shadow-2xl backdrop-blur-md">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">

              {/* Overall Score */}
              <div className="text-center">
                <div className={`relative w-36 h-36 mx-auto flex items-center justify-center rounded-full border-8 ${scoreGrade.bg} bg-black/50 shadow-[0_0_40px_rgba(6,182,212,0.2)]`}>
                  <div className="text-center">
                    <span className="text-5xl font-black text-white">{avgScore}</span>
                    <span className="block text-xs text-gray-400 font-bold mt-1">/ 10</span>
                  </div>
                </div>
                <p className={`mt-3 font-bold text-lg ${scoreGrade.color}`}>{scoreGrade.label}</p>
                <p className="text-xs text-gray-500 mt-1">Điểm trung bình tổng quan</p>
              </div>

              {/* Category Breakdown */}
              <div className="md:col-span-2 space-y-3">
                <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2 mb-3">
                  <BarChart3 className="w-4 h-4 text-cyan-400" /> Phân tích theo nhóm câu hỏi
                </h3>
                {Object.entries(catScores).map(([label, data]) => {
                  const avg = Math.round((data.total / data.count) * 10) / 10;
                  const pct = (avg / 10) * 100;
                  return (
                    <div key={label} className="flex items-center gap-3">
                      <span className="text-xs text-gray-300 font-medium w-24 shrink-0 truncate">{label}</span>
                      <div className="flex-1 bg-white/10 rounded-full h-2.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${avg >= 7 ? 'bg-green-500' : avg >= 5 ? 'bg-cyan-500' : 'bg-yellow-500'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-sm font-bold text-white w-12 text-right">{avg}/10</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Feedback */}
            {session.feedback && (
              <div className="mt-6 pt-5 border-t border-white/10">
                <div className="flex items-start gap-3 bg-black/30 rounded-xl p-4 border border-white/5">
                  <Sparkles className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-300 leading-relaxed">{session.feedback}</p>
                </div>
              </div>
            )}
          </div>

          {/* Per-question detail */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-cyan-400" /> Chi Tiết Từng Câu Hỏi ({session.answers.length} câu)
            </h3>

            {session.answers.map((ans: any, idx: number) => {
              const cat = getQuestionCategory(ans.question);
              const scoreColor = (ans.score || 0) >= 7 ? 'text-green-400 bg-green-500/20 border-green-500/30'
                : (ans.score || 0) >= 5 ? 'text-cyan-400 bg-cyan-500/20 border-cyan-500/30'
                : 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';

              return (
                <Card key={idx} className="p-6 border-white/10 hover:border-cyan-500/30 transition-colors">
                  {/* Question header */}
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-3 mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-cyan-400 font-bold text-sm">Câu {idx + 1}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border flex items-center gap-1 ${cat.color}`}>
                          <Tag className="w-2.5 h-2.5" /> {cat.label}
                        </span>
                      </div>
                      <h4 className="text-base font-semibold text-white leading-relaxed">{ans.question}</h4>
                    </div>
                    <span className={`px-3 py-1 rounded-xl font-bold text-sm shrink-0 border ${scoreColor}`}>
                      {ans.score}/10
                    </span>
                  </div>

                  {/* User's answer */}
                  <div className="bg-black/30 p-4 rounded-xl border border-white/5 mb-4 text-gray-300 text-sm italic leading-relaxed">
                    "{ans.answer}"
                  </div>

                  {/* Strengths + Improvements */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="bg-green-500/5 border border-green-500/10 p-4 rounded-xl">
                      <h5 className="font-semibold text-green-400 mb-2 flex items-center gap-2 text-sm"><CheckCircle className="w-4 h-4" /> Điểm mạnh</h5>
                      <p className="text-xs text-gray-300 leading-relaxed">{ans.strengths}</p>
                    </div>
                    <div className="bg-yellow-500/5 border border-yellow-500/10 p-4 rounded-xl">
                      <h5 className="font-semibold text-yellow-400 mb-2 flex items-center gap-2 text-sm"><AlertTriangle className="w-4 h-4" /> Cần cải thiện</h5>
                      <p className="text-xs text-gray-300 leading-relaxed">{ans.improvements}</p>
                    </div>
                  </div>

                  {/* Suggested STAR answer */}
                  {ans.suggestedAnswer && (
                    <div className="p-4 bg-purple-500/5 border border-purple-500/15 rounded-xl">
                      <h5 className="font-semibold text-purple-400 mb-2 flex items-center gap-2 text-sm">
                        <Brain className="w-4 h-4" /> Câu trả lời mẫu (Mô hình STAR)
                      </h5>
                      <p className="text-xs text-gray-300 leading-relaxed whitespace-pre-line">{ans.suggestedAnswer}</p>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>

          <div className="flex justify-center pt-4 pb-8">
            <Button onClick={() => { setSession(null); stopTimer(); }} className="bg-white/10 hover:bg-white/20 text-white font-semibold flex items-center gap-2">
              <RefreshCw className="w-4 h-4" /> Phỏng vấn lại
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════
  // ──── RENDER: Active Interview ────
  // ════════════════════════════════════════
  const currentQuestion = session.questions[currentQIndex];
  const hasAnsweredCurrent = session.answers.find((a: any) => a.questionIndex === currentQIndex);
  const currentCat = getQuestionCategory(currentQuestion);

  return (
    <div className="flex-1 bg-[#0a0a0a] min-h-[calc(100vh-64px)] overflow-y-auto py-10 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span className="font-medium">Phỏng vấn cùng Nova AI</span>
            <span>Câu {currentQIndex + 1} / {session.questions.length}</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-cyan-500 to-purple-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${((currentQIndex + (hasAnsweredCurrent ? 1 : 0)) / session.questions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <Card className="p-6 md:p-8 border-cyan-500/30 shadow-[0_0_40px_rgba(6,182,212,0.12)] mb-6">

          {/* Question Header with Timer & TTS */}
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="flex items-start gap-4 flex-1">
              <div className="shrink-0 w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold">
                Q{currentQIndex + 1}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className={`text-[11px] px-2 py-0.5 rounded-full border flex items-center gap-1 ${currentCat.color}`}>
                    <Tag className="w-3 h-3" /> {currentCat.label}
                  </span>
                  {isSpeaking && (
                    <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center gap-1.5 animate-pulse font-medium">
                      <Volume2 className="w-3.5 h-3.5 text-cyan-400" /> Nova đang đọc (Tiếng Việt)...
                    </span>
                  )}
                </div>
                <h2 className="text-xl md:text-2xl font-semibold text-white leading-relaxed">{currentQuestion}</h2>
              </div>
            </div>

            {/* Timer Display */}
            {!hasAnsweredCurrent && (
              <div className="shrink-0 flex flex-col items-center gap-1">
                <div className={`flex items-center gap-1.5 px-3 py-2 bg-black/50 border border-white/10 rounded-xl ${timerColor}`}>
                  <Timer className="w-4 h-4" />
                  <span className="text-lg font-mono font-bold tabular-nums">{formatTime(timeLeft)}</span>
                </div>
                <button
                  onClick={() => {
                    if (isSpeaking) {
                      stopSpeech();
                      startTimer();
                    } else {
                      speakQuestion(`Câu ${currentQIndex + 1}. ${currentQuestion}`, true);
                    }
                  }}
                  className={`text-[11px] transition-colors flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-medium ${
                    isSpeaking
                      ? 'border-red-500/40 bg-red-500/15 text-red-400 hover:bg-red-500/25'
                      : 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-500/50'
                  }`}
                  title={isSpeaking ? 'Dừng đọc giọng nói' : 'Nghe Nova đọc câu hỏi bằng tiếng Việt'}
                >
                  {isSpeaking ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5 text-cyan-400" />}
                  {isSpeaking ? 'Dừng đọc' : 'Nghe câu hỏi'}
                </button>
              </div>
            )}
          </div>

          {/* Answer Area */}
          {!hasAnsweredCurrent ? (
            <div className="space-y-4">
              <div className="relative">
                <textarea
                  value={currentAnswer}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                  placeholder="Nhập câu trả lời (mô hình STAR: Tình huống → Nhiệm vụ → Hành động → Kết quả). Hoặc bật Mic và nói 'Đó là câu trả lời của tôi' để gửi tự động."
                  className="w-full h-44 bg-black/50 border border-white/10 rounded-xl p-4 pb-14 text-white text-sm focus:outline-none focus:border-cyan-500 resize-none leading-relaxed"
                />
                <div className="absolute bottom-4 left-4 flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleListening()}
                    className={`rounded-full px-3 text-xs ${isListening ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 hover:text-red-300' : 'bg-white/10 text-gray-300 hover:bg-white/20'}`}
                  >
                    {isListening ? (
                      <><Mic className="w-3.5 h-3.5 mr-1.5 animate-pulse" /> Đang ghi âm...</>
                    ) : (
                      <><MicOff className="w-3.5 h-3.5 mr-1.5" /> Bật Mic</>
                    )}
                  </Button>
                </div>
                <div className="absolute bottom-4 right-4 text-[11px] text-gray-600">{currentAnswer.length} ký tự</div>
              </div>
              <div className="flex justify-end">
                <Button
                  ref={submitBtnRef}
                  id="submit-answer-btn"
                  onClick={handleSubmitAnswer}
                  disabled={isSubmitting || (!currentAnswer.trim() && !isListening)}
                  className="bg-cyan-600 hover:bg-cyan-700 text-white font-semibold flex items-center gap-2"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                  Gửi câu trả lời
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2">
              <div className="bg-black/30 p-4 rounded-xl border border-white/5 text-gray-300 italic text-sm">
                "{hasAnsweredCurrent.answer}"
              </div>

              <div className="bg-white/[0.03] rounded-2xl p-6 border border-white/10">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-bold text-white flex items-center gap-2 text-sm">
                    <Sparkles className="w-4 h-4 text-cyan-400" /> Đánh giá từ Nova AI
                  </h4>
                  <span className="bg-cyan-500/20 text-cyan-300 px-3 py-1 rounded-lg font-bold text-sm border border-cyan-500/30">
                    {hasAnsweredCurrent.score}/10
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="bg-green-500/5 border border-green-500/10 p-4 rounded-xl">
                    <h5 className="font-semibold text-green-400 mb-2 flex items-center gap-2 text-sm"><CheckCircle className="w-4 h-4" /> Điểm mạnh</h5>
                    <p className="text-xs text-gray-300">{hasAnsweredCurrent.strengths}</p>
                  </div>
                  <div className="bg-yellow-500/5 border border-yellow-500/10 p-4 rounded-xl">
                    <h5 className="font-semibold text-yellow-400 mb-2 flex items-center gap-2 text-sm"><AlertTriangle className="w-4 h-4" /> Cần cải thiện</h5>
                    <p className="text-xs text-gray-300">{hasAnsweredCurrent.improvements}</p>
                  </div>
                </div>

                {hasAnsweredCurrent.suggestedAnswer && (
                  <div className="p-4 bg-purple-500/5 border border-purple-500/15 rounded-xl">
                    <h5 className="font-semibold text-purple-400 mb-2 flex items-center gap-2 text-sm">
                      <Brain className="w-4 h-4" /> Câu trả lời mẫu STAR
                    </h5>
                    <p className="text-xs text-gray-300 leading-relaxed whitespace-pre-line">{hasAnsweredCurrent.suggestedAnswer}</p>
                  </div>
                )}
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={handleNextQuestion}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-semibold flex items-center gap-2"
                >
                  {currentQIndex === session.questions.length - 1 ? (
                    <><Award className="w-4 h-4" /> Xem bảng điểm tổng kết</>
                  ) : (
                    <><ChevronRight className="w-4 h-4" /> Câu tiếp theo</>
                  )}
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
