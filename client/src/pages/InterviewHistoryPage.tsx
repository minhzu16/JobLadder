import React, { useState, useEffect } from 'react';
import { interviewApi } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Mic, History, Calendar, Award, ChevronRight,
  Volume2, VolumeX, Sparkles, CheckCircle2, AlertCircle,
  Clock, ArrowLeft, Loader2
} from 'lucide-react';
import { Link } from 'react-router';

export function InterviewHistoryPage() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<any | null>(null);

  // Audio TTS playback state
  const [playingAudioIdx, setPlayingAudioIdx] = useState<number | null>(null);
  const [audioLoading, setAudioLoading] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);

  const { isAuthenticated } = useAuth();
  const { addToast } = useToast();

  useEffect(() => {
    if (isAuthenticated) {
      fetchHistory();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await interviewApi.getHistory();
      setHistory(res.data.data || []);
    } catch (err) {
      console.error(err);
      addToast('error', 'Không thể tải lịch sử phỏng vấn.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDetails = async (session: any) => {
    try {
      const res = await interviewApi.getSession(session.id);
      setSelectedSession(res.data.data);
    } catch (err) {
      console.error(err);
      addToast('error', 'Lỗi khi tải chi tiết phiên phỏng vấn.');
    }
  };

  const playTTS = (text: string, idx: number) => {
    if (currentAudio) {
      currentAudio.pause();
      setCurrentAudio(null);
    }

    if (playingAudioIdx === idx) {
      setPlayingAudioIdx(null);
      return;
    }

    setAudioLoading(true);
    setPlayingAudioIdx(idx);

    const audio = new Audio(`/api/ai/tts?text=${encodeURIComponent(text)}`);
    audio.oncanplaythrough = () => {
      setAudioLoading(false);
      audio.play().catch(console.error);
    };
    audio.onended = () => {
      setPlayingAudioIdx(null);
      setCurrentAudio(null);
    };
    audio.onerror = () => {
      setAudioLoading(false);
      setPlayingAudioIdx(null);
      addToast('error', 'Lỗi phát âm thanh voice.');
    };
    setCurrentAudio(audio);
  };

  return (
    <div className="flex-1 bg-[#0a0a0a] min-h-[calc(100vh-64px)] py-8 px-4 md:px-8">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Hero Banner */}
        <div className="bg-gradient-to-r from-purple-950/40 via-cyan-950/30 to-black p-6 md:p-8 rounded-3xl border border-purple-500/20 shadow-2xl backdrop-blur-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="purple" className="text-xs uppercase tracking-wider font-bold">
                Mock Interview Archive
              </Badge>
              <span className="text-gray-500 text-xs">•</span>
              <span className="text-gray-400 text-xs">Nova AI Voice Performance History</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white flex items-center gap-3">
              <History className="w-8 h-8 text-purple-400" /> Lịch Sử Phỏng Vấn Thử Nghiệm
            </h1>
            <p className="text-sm text-gray-400 mt-1 max-w-2xl leading-relaxed">
              Xem lại toàn bộ các câu hỏi phỏng vấn, câu trả lời, nhận xét chi tiết và scorecard đánh giá từ Nova AI.
            </p>
          </div>

          <Link to="/mock-interview">
            <Button className="bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-700 hover:to-cyan-600 text-white font-bold text-sm shadow-lg shadow-purple-500/20">
              <Mic className="w-4 h-4 mr-2" /> Bắt đầu buổi mới
            </Button>
          </Link>
        </div>

        {/* Sessions list */}
        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-purple-400 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">Đang tải lịch sử các phiên phỏng vấn...</p>
          </div>
        ) : history.length === 0 ? (
          <Card className="p-12 border-white/10 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mx-auto text-purple-400">
              <Mic className="w-8 h-8" />
            </div>
            <h2 className="text-lg font-bold text-white">Chưa có phiên phỏng vấn nào</h2>
            <p className="text-sm text-gray-400 max-w-md mx-auto">
              Hãy tham gia một buổi phỏng vấn thử nghiệm cùng Nova AI để luyện phản xạ và nhận báo cáo năng lực chi tiết.
            </p>
            <Link to="/mock-interview">
              <Button className="mt-2 bg-purple-600 hover:bg-purple-700 text-white text-sm">
                Phỏng vấn thử ngay
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-4">
            {history.map((session) => (
              <Card
                key={session.id}
                className="p-6 border-white/10 hover:border-purple-500/40 transition-all bg-black/40 flex flex-col sm:flex-row justify-between sm:items-center gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h2 className="text-base font-bold text-white">{session.jobTitle}</h2>
                    <Badge
                      className={
                        session.status === 'completed'
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                          : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                      }
                    >
                      {session.status === 'completed' ? 'Hoàn thành' : 'Đang thực hiện'}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-purple-400" />
                      {new Date(session.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                    <span>•</span>
                    <span>{session._count?.answers || session.answers?.length || 0} câu trả lời</span>
                    {session.overallScore !== null && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-cyan-400 font-bold">
                          <Award className="w-3.5 h-3.5" /> Điểm tổng: {session.overallScore}/10
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleOpenDetails(session)}
                  className="shrink-0 text-xs border-white/10 text-purple-300 hover:bg-purple-500/10 self-end sm:self-center"
                >
                  Xem Scorecard <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </Card>
            ))}
          </div>
        )}

        {/* Detailed Scorecard Modal */}
        {selectedSession && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-[#141414] border border-purple-500/30 rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden my-8 animate-in zoom-in-95">
              
              {/* Modal Header */}
              <div className="p-6 border-b border-white/10 flex justify-between items-center bg-gradient-to-r from-purple-950/40 to-cyan-950/40">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Award className="w-5 h-5 text-purple-400" /> Báo Cáo Phỏng Vấn: {selectedSession.jobTitle}
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Ngày: {new Date(selectedSession.createdAt).toLocaleString('vi-VN')} • Tổng kết: <strong className="text-cyan-400">{selectedSession.overallScore || 'N/A'}/10</strong>
                  </p>
                </div>

                <button
                  onClick={() => setSelectedSession(null)}
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                {/* Overall Feedback */}
                {selectedSession.feedback && (
                  <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-200 leading-relaxed">
                    <span className="font-bold text-purple-300 block mb-1">Đánh giá chung từ Nova AI:</span>
                    {selectedSession.feedback}
                  </div>
                )}

                {/* Answers list */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Chi Tiết Từng Câu Hỏi & Phản Hồi ({selectedSession.answers?.length || 0})
                  </h3>

                  {selectedSession.answers?.map((ans: any, i: number) => (
                    <Card key={ans.id || i} className="p-5 border-white/10 bg-black/40 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1 flex-1">
                          <span className="text-[11px] font-bold text-purple-400 uppercase">
                            Câu hỏi #{i + 1}
                          </span>
                          <p className="text-sm font-semibold text-white">{ans.question}</p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {ans.score !== null && (
                            <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30 text-xs font-bold">
                              {ans.score}/10 Điểm
                            </Badge>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => playTTS(ans.question, i)}
                            className="w-8 h-8 p-0 text-cyan-400 hover:bg-cyan-500/10 rounded-full"
                          >
                            {playingAudioIdx === i ? (
                              <VolumeX className="w-4 h-4 text-red-400" />
                            ) : (
                              <Volume2 className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </div>

                      {/* Candidate Answer */}
                      <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 text-xs text-gray-300 leading-relaxed">
                        <span className="text-gray-500 font-semibold block text-[10px] uppercase mb-1">
                          Câu trả lời của bạn:
                        </span>
                        {ans.answer}
                      </div>

                      {/* Strengths & Improvements */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        {ans.strengths && (
                          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-200">
                            <span className="font-bold text-emerald-400 flex items-center gap-1 mb-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Điểm cộng:
                            </span>
                            {ans.strengths}
                          </div>
                        )}

                        {ans.improvements && (
                          <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-200">
                            <span className="font-bold text-orange-400 flex items-center gap-1 mb-1">
                              <AlertCircle className="w-3.5 h-3.5" /> Cần cải thiện:
                            </span>
                            {ans.improvements}
                          </div>
                        )}
                      </div>

                      {/* Suggested Answer */}
                      {ans.suggestedAnswer && (
                        <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-200">
                          <span className="font-bold text-cyan-400 flex items-center gap-1 mb-1">
                            <Sparkles className="w-3.5 h-3.5" /> Gợi ý trả lời mẫu:
                          </span>
                          {ans.suggestedAnswer}
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-white/10 flex justify-end bg-white/[0.02]">
                <Button
                  variant="ghost"
                  onClick={() => setSelectedSession(null)}
                  className="text-gray-400 hover:text-white text-xs"
                >
                  Đóng
                </Button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
