import React, { useState, useEffect } from 'react';
import { aiApi } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { 
  Loader2, Route, Target, Clock, ArrowRight, CheckCircle2, 
  Circle, BookOpen, ExternalLink, Sparkles, Trophy, Award 
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface Task {
  id: string;
  text: string;
  completed: boolean;
}

interface RoadmapNode {
  title: string;
  description: string;
  duration: string;
  course?: string;
  matchImpact?: number;
  tasks: Task[];
}

export function CareerRoadmapPage() {
  const [goal, setGoal] = useState('');
  const [roadmapId, setRoadmapId] = useState<string | null>(null);
  const [roadmap, setRoadmap] = useState<RoadmapNode[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Dynamic Match Score tracking
  const [startingScore, setStartingScore] = useState(65);
  const [targetScore, setTargetScore] = useState(95);
  const [currentMatchScore, setCurrentMatchScore] = useState(65);

  const { isAuthenticated } = useAuth();
  const { addToast } = useToast();

  // Helper to extract tasks from sentences if AI returns string array
  const formatTasks = (rawTasks: any[] | undefined, fallbackDesc: string, nodeIdx: number): Task[] => {
    if (Array.isArray(rawTasks) && rawTasks.length > 0) {
      return rawTasks.map((t, idx) => ({
        id: typeof t === 'object' && t.id ? t.id : `task-${nodeIdx}-${idx}`,
        text: typeof t === 'object' && t.text ? t.text : String(t),
        completed: typeof t === 'object' && t.completed ? Boolean(t.completed) : false,
      }));
    }
    const sentences = fallbackDesc.split('. ').filter((s) => s.trim().length > 5);
    return sentences.map((s, idx) => ({
      id: `task-${nodeIdx}-${idx}`,
      text: s.trim() + (s.endsWith('.') ? '' : '.'),
      completed: false,
    }));
  };

  // Load existing active roadmap for user
  useEffect(() => {
    if (isAuthenticated) {
      setIsInitialLoading(true);
      aiApi.getActiveRoadmap()
        .then((res) => {
          if (res.data.data) {
            const row = res.data.data;
            setRoadmapId(row.id);
            setGoal(row.goal);

            try {
              const parsed = typeof row.roadmap === 'string' ? JSON.parse(row.roadmap) : row.roadmap;
              const start = parsed.startingScore || 65;
              const target = parsed.targetScore || 95;
              setStartingScore(start);
              setTargetScore(target);

              const nodesFormatted: RoadmapNode[] = (parsed.nodes || []).map((node: any, nodeIdx: number) => ({
                title: node.title,
                description: node.description,
                duration: node.duration || 'Tuần 1',
                course: node.course,
                matchImpact: node.matchImpact || 10,
                tasks: formatTasks(node.tasks, node.description, nodeIdx),
              }));

              setRoadmap(nodesFormatted);

              // Calculate current match score based on completed tasks
              const total = nodesFormatted.reduce((acc, n) => acc + n.tasks.length, 0);
              const done = nodesFormatted.reduce((acc, n) => acc + n.tasks.filter((t) => t.completed).length, 0);
              const score = total > 0 ? start + Math.round(((target - start) * done) / total) : start;
              setCurrentMatchScore(score);
            } catch (err) {
              console.error('Error parsing saved roadmap JSON:', err);
            }
          }
        })
        .catch((err) => {
          console.error('Failed to load active roadmap:', err);
        })
        .finally(() => setIsInitialLoading(false));
    } else {
      setIsInitialLoading(false);
    }
  }, [isAuthenticated]);

  const handleGenerate = async () => {
    if (!goal.trim()) {
      addToast('error', 'Vui lòng nhập mục tiêu nghề nghiệp của bạn!');
      return;
    }
    if (!isAuthenticated) {
      addToast('error', 'Vui lòng đăng nhập để tạo và lưu lộ trình sự nghiệp!');
      return;
    }

    setIsLoading(true);

    try {
      const res = await aiApi.generateRoadmap(goal);
      const row = res.data.data;
      setRoadmapId(row.id);

      const parsed = typeof row.roadmap === 'string' ? JSON.parse(row.roadmap) : row.roadmap;
      const start = parsed.startingScore || 65;
      const target = parsed.targetScore || 95;
      setStartingScore(start);
      setTargetScore(target);
      setCurrentMatchScore(start);

      const nodesFormatted: RoadmapNode[] = (parsed.nodes || []).map((node: any, nodeIdx: number) => ({
        title: node.title,
        description: node.description,
        duration: node.duration || 'Tuần 1',
        course: node.course,
        matchImpact: node.matchImpact || 10,
        tasks: formatTasks(node.tasks, node.description, nodeIdx),
      }));

      setRoadmap(nodesFormatted);
      addToast('success', 'Gemini AI đã thiết kế lộ trình thành công!');
    } catch (error: any) {
      console.error('Generate roadmap error:', error);
      const msg = error.response?.data?.message || 'Lỗi khi tạo lộ trình. Vui lòng thử lại sau.';
      addToast('error', msg);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTask = (nodeIndex: number, taskId: string) => {
    setRoadmap((prev) => {
      const newRoadmap = prev.map((node, nIdx) => {
        if (nIdx !== nodeIndex) return node;
        return {
          ...node,
          tasks: node.tasks.map((task) => {
            if (task.id !== taskId) return task;
            return { ...task, completed: !task.completed };
          }),
        };
      });

      const targetNode = newRoadmap[nodeIndex];
      const targetTask = targetNode?.tasks.find((t) => t.id === taskId);
      const willBeCompleted = targetTask ? targetTask.completed : false;

      // Calculate new dynamic match score
      const total = newRoadmap.reduce((acc, n) => acc + n.tasks.length, 0);
      const done = newRoadmap.reduce((acc, n) => acc + n.tasks.filter((t) => t.completed).length, 0);
      const newScore = total > 0 ? startingScore + Math.round(((targetScore - startingScore) * done) / total) : startingScore;
      setCurrentMatchScore(newScore);

      if (willBeCompleted) {
        addToast('success', `Đã hoàn thành! Điểm phù hợp của bạn tăng lên ${newScore}%.`);
      }

      // Persist progress to backend
      if (roadmapId) {
        const payload = {
          startingScore,
          targetScore,
          currentScore: newScore,
          nodes: newRoadmap,
        };
        aiApi.updateRoadmapProgress(roadmapId, payload).catch((err) => {
          console.error('Failed to sync progress:', err);
        });
      }

      return newRoadmap;
    });
  };

  const totalTasks = roadmap.reduce((acc, node) => acc + node.tasks.length, 0);
  const completedTasks = roadmap.reduce((acc, node) => acc + node.tasks.filter((t) => t.completed).length, 0);
  const progressPercent = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  if (isInitialLoading) {
    return (
      <div className="flex-1 bg-[#0a0a0a] min-h-[calc(100vh-64px)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
          <p className="text-gray-400 text-sm">Đang tải lộ trình sự nghiệp...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#0a0a0a] min-h-[calc(100vh-64px)] overflow-y-auto py-10 px-4">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-purple-500/10 rounded-full mb-3">
            <Route className="w-8 h-8 text-purple-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Lộ Trình Sự Nghiệp & Tiến Độ Học Tập</h1>
          <p className="text-gray-400 max-w-2xl mx-auto text-sm">
            Gemini AI thiết kế lộ trình từng bước theo tuần dựa trên CV hiện tại. Tick chọn các nhiệm vụ đã hoàn thành để theo dõi điểm số năng lực tăng trưởng theo thời gian thực!
          </p>
        </div>

        {/* Input Form */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 md:p-6 mb-8 shadow-xl backdrop-blur-sm">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Mục tiêu sự nghiệp của bạn (Ví dụ: Trở thành Senior Java Backend / Solution Architect)
              </label>
              <div className="relative">
                <Target className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  placeholder="Nhập mục tiêu sự nghiệp..."
                  className="w-full bg-black/50 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-purple-500 transition-colors text-sm"
                />
              </div>
            </div>
            <Button
              onClick={handleGenerate}
              disabled={isLoading || !goal.trim()}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2 h-[48px] w-full md:w-auto shrink-0 shadow-[0_0_15px_rgba(168,85,247,0.3)]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Gemini đang thiết kế...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  {roadmap.length > 0 ? 'Tạo lộ trình mới' : 'Thiết kế lộ trình'}
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Global Dynamic Score & Progress Tracking Header */}
        {roadmap.length > 0 && (
          <div className="bg-gradient-to-r from-purple-950/40 via-blue-950/30 to-black border border-purple-500/30 rounded-3xl p-6 mb-10 shadow-2xl backdrop-blur-md">
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              
              {/* Progress column */}
              <div className="md:col-span-2 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-cyan-400" /> Tiến Độ Hoàn Thành Lộ Trình
                  </h3>
                  <span className="text-xs font-bold text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/20">
                    {progressPercent}% Hoàn tất
                  </span>
                </div>

                <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden p-0.5">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-cyan-400 h-full rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]"
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>

                <div className="flex justify-between text-xs text-gray-400">
                  <span>{completedTasks} / {totalTasks} Nhiệm vụ đã hoàn thành</span>
                  <span>Mục tiêu: {goal}</span>
                </div>
              </div>

              {/* Dynamic Match Score column */}
              <div className="bg-black/50 border border-white/10 rounded-2xl p-4 text-center">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                  Điểm Phù Hợp Tăng Động
                </span>
                <div className="flex items-baseline justify-center gap-1 my-1">
                  <span className="text-4xl font-black text-green-400 transition-all duration-300">
                    {currentMatchScore}
                  </span>
                  <span className="text-lg font-bold text-green-400/60">%</span>
                </div>
                <div className="text-[10px] text-gray-500 flex items-center justify-center gap-2">
                  <span>Ban đầu: {startingScore}%</span>
                  <span>→</span>
                  <span className="text-cyan-400 font-semibold">Kỳ vọng: {targetScore}%</span>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* Roadmap Nodes List */}
        {roadmap.length > 0 && (
          <div className="relative">
            {/* Timeline Vertical Line */}
            <div className="absolute left-[27px] top-6 bottom-6 w-0.5 bg-gradient-to-b from-purple-500 to-cyan-500 opacity-20 hidden md:block"></div>
            
            <div className="space-y-8 relative">
              {roadmap.map((node, idx) => {
                const nodeCompleted = node.tasks.length > 0 && node.tasks.every((t) => t.completed);

                return (
                  <div key={idx} className="flex flex-col md:flex-row gap-6 relative group">
                    
                    {/* Step Circle Badge */}
                    <div className={`hidden md:flex w-14 h-14 shrink-0 rounded-full items-center justify-center relative z-10 transition-colors shadow-lg border ${
                      nodeCompleted 
                        ? 'bg-green-500/20 border-green-500 text-green-400' 
                        : 'bg-[#0a0a0a] border-white/10 text-purple-400 group-hover:border-purple-500'
                    }`}>
                      {nodeCompleted ? (
                        <CheckCircle2 className="w-6 h-6 text-green-400" />
                      ) : (
                        <span className="font-bold text-base">{idx + 1}</span>
                      )}
                    </div>
                    
                    {/* Node Card */}
                    <div className={`flex-1 bg-white/[0.03] border rounded-2xl p-6 transition-all duration-200 ${
                      nodeCompleted ? 'border-green-500/30 bg-green-500/[0.02]' : 'border-white/10 hover:border-purple-500/30 hover:bg-white/[0.05]'
                    }`}>
                      
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 gap-2">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                          <span className="md:hidden text-purple-400 bg-purple-400/10 w-6 h-6 rounded-full flex items-center justify-center text-xs">
                            {idx + 1}
                          </span>
                          {node.title}
                        </h3>
                        <div className="flex items-center gap-2">
                          {node.matchImpact && (
                            <Badge variant="green" className="text-[10px] font-bold">
                              +{node.matchImpact}% Match
                            </Badge>
                          )}
                          <div className="flex items-center gap-1.5 text-xs font-medium text-cyan-400 bg-cyan-400/10 px-3 py-1 rounded-full shrink-0">
                            <Clock className="w-3.5 h-3.5" />
                            {node.duration}
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-gray-300 leading-relaxed text-sm mb-4">
                        {node.description}
                      </p>

                      {/* Course / Resource Recommendation */}
                      {node.course && (
                        <div className="mb-5 p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <BookOpen className="w-4 h-4 text-purple-400 shrink-0" />
                            <div className="truncate">
                              <span className="text-[11px] text-gray-400 uppercase font-semibold block">Khóa học / Tài liệu gợi ý:</span>
                              <span className="text-xs text-white font-medium truncate block">{node.course}</span>
                            </div>
                          </div>
                          <a
                            href={`https://www.google.com/search?q=${encodeURIComponent(node.course)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1 rounded-lg bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 text-xs font-medium flex items-center gap-1 shrink-0 transition-colors"
                          >
                            Tìm học <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      )}
                      
                      {/* Tasks Checkbox List */}
                      <div className="space-y-2.5 pt-4 border-t border-white/10">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                            Nhiệm vụ cần thực hiện ({node.tasks.filter((t) => t.completed).length}/{node.tasks.length})
                          </h4>
                        </div>

                        {node.tasks.map((task) => (
                          <button
                            type="button"
                            key={task.id} 
                            onClick={() => toggleTask(idx, task.id)}
                            className={`w-full text-left flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer outline-none ${
                              task.completed 
                                ? 'bg-green-500/10 border-green-500/30 text-gray-400' 
                                : 'bg-black/30 border-white/5 hover:border-white/20 text-gray-200 hover:bg-white/[0.04]'
                            }`}
                          >
                            <span className="mt-0.5 shrink-0">
                              {task.completed ? (
                                <CheckCircle2 className="w-5 h-5 text-green-400" />
                              ) : (
                                <Circle className="w-5 h-5 text-gray-500 hover:text-white" />
                              )}
                            </span>
                            <span className={`text-sm leading-relaxed ${task.completed ? 'line-through text-gray-500' : 'text-gray-200'}`}>
                              {task.text}
                            </span>
                          </button>
                        ))}
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-14 p-6 text-center border border-dashed border-purple-500/30 rounded-3xl bg-purple-500/[0.02]">
              <Award className="w-10 h-10 text-yellow-400 mx-auto mb-2 animate-bounce" />
              <h4 className="text-base font-bold text-white mb-1">Mục Tiêu Đạt Đến Đỉnh Cao</h4>
              <p className="text-xs text-gray-400 max-w-md mx-auto">
                Hoàn thành tất cả các tuần học để nâng mức độ phù hợp hồ sơ lên {targetScore}%, sẵn sàng ứng tuyển các vị trí cao cấp!
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
