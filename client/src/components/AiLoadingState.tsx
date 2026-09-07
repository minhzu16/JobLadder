import React, { useState, useEffect } from 'react';
import { Loader2, CheckCircle2, Circle } from 'lucide-react';

const TASKS = [
  "Đọc và trích xuất hồ sơ CV",
  "Xác định điểm mạnh & điểm yếu",
  "Phân tích yêu cầu từ thị trường",
  "Tìm kiếm công việc phù hợp nhất",
  "Xây dựng lộ trình phát triển"
];

export function AiLoadingState() {
  const [progress, setProgress] = useState(0);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);

  useEffect(() => {
    const totalDuration = 4000; // 4 seconds fake loading
    const intervalTime = 50;
    const steps = totalDuration / intervalTime;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const currentProgress = (currentStep / steps) * 100;
      setProgress(currentProgress);

      // Map progress to tasks
      const taskIndex = Math.floor((currentProgress / 100) * TASKS.length);
      if (taskIndex < TASKS.length) {
        setCurrentTaskIndex(taskIndex);
      }

      if (currentStep >= steps) {
        clearInterval(timer);
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto bg-black/40 border border-purple-500/30 rounded-3xl p-8 backdrop-blur-xl shadow-[0_0_40px_rgba(168,85,247,0.15)] flex flex-col items-center">
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-purple-500 rounded-full blur-xl opacity-50 animate-pulse"></div>
        <div className="relative bg-[#0a0a0a] p-4 rounded-full border border-purple-500/50">
          <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
        </div>
      </div>
      
      <h2 className="text-2xl font-bold text-white mb-2">Cố vấn AI đang xử lí thông tin</h2>
      <p className="text-gray-400 mb-8 text-sm">Vui lòng đợi trong giây lát, chúng tôi đang phân tích độ tương thích của bạn.</p>

      <div className="w-full mb-8">
        <div className="flex justify-between text-sm mb-2 font-medium">
          <span className="text-purple-400">Tiến trình</span>
          <span className="text-white">{Math.round(progress)}%</span>
        </div>
        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-purple-600 via-fuchsia-500 to-cyan-400 transition-all duration-75"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="w-full space-y-4">
        {TASKS.map((task, index) => {
          const isCompleted = index < currentTaskIndex || progress >= 100;
          const isCurrent = index === currentTaskIndex && progress < 100;
          
          return (
            <div key={index} className="flex items-center gap-3">
              {isCompleted ? (
                <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
              ) : isCurrent ? (
                <Loader2 className="w-5 h-5 text-purple-400 animate-spin shrink-0" />
              ) : (
                <Circle className="w-5 h-5 text-gray-600 shrink-0" />
              )}
              <span className={`text-sm ${isCompleted ? 'text-gray-300' : isCurrent ? 'text-white font-medium' : 'text-gray-500'}`}>
                {task}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
