import React from 'react';
import { PenLine, MessageSquare, Settings, PanelLeftClose, PanelLeftOpen, Map, FileText } from 'lucide-react';
import { Link } from 'react-router';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  return (
    <aside 
      className={`h-[calc(100dvh-64px)] bg-[#101010] border-r border-[#222] flex flex-col transition-all duration-300 relative z-30 shrink-0 ${
        isCollapsed ? 'w-0 overflow-hidden border-r-0' : 'w-[260px]'
      } hidden lg:flex`}
    >
      {/* Top: New Chat + Collapse */}
      <div className="p-3 flex items-center justify-between">
        <div className="flex items-center gap-2 w-full">
          <button className="flex items-center gap-2 text-gray-200 hover:bg-white/10 px-3 py-2 rounded-md transition-colors w-full text-sm font-medium">
            <PenLine className="w-4 h-4" />
            Đoạn chat mới
          </button>
        </div>
        <button 
          onClick={onToggle}
          className="text-gray-400 hover:text-white hover:bg-white/10 p-2 border border-transparent rounded-md transition-colors"
        >
          <PanelLeftClose className="w-4 h-4" />
        </button>
      </div>

      {/* Phân tích của tôi */}
      <div className="px-3 pb-2">
        <button className="flex items-center gap-2 text-gray-300 hover:bg-white/10 px-3 py-2 rounded-md transition-colors w-full text-sm">
          <MessageSquare className="w-4 h-4" />
          Phân tích của tôi
        </button>
      </div>

      <div className="px-5 pt-3 pb-2 flex items-center justify-between group/history">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Công cụ AI</h3>
      </div>
      <div className="px-3 space-y-1 mb-2 border-b border-[#222] pb-4">
        <Link to="/roadmap" className="flex items-center gap-2 text-gray-300 hover:bg-white/10 px-3 py-2 rounded-md transition-colors w-full text-sm font-medium">
          <Map className="w-4 h-4" />
          Lộ trình sự nghiệp
        </Link>
        <Link to="/cv-analysis" className="flex items-center gap-2 text-gray-300 hover:bg-white/10 px-3 py-2 rounded-md transition-colors w-full text-sm font-medium">
          <FileText className="w-4 h-4" />
          Phân tích CV ATS
        </Link>
        <Link to="/mock-interview" className="flex items-center gap-2 text-gray-300 hover:bg-white/10 px-3 py-2 rounded-md transition-colors w-full text-sm font-medium">
          <MessageSquare className="w-4 h-4" />
          Phỏng vấn giả lập
        </Link>
      </div>

      {/* Lịch sử chat */}
      <div className="px-5 pt-3 pb-2 flex items-center justify-between group/history">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Lịch sử chat</h3>
      </div>
      <div className="flex-1 overflow-y-auto px-3 space-y-0.5 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">
        <p className="text-xs text-gray-500 px-3 py-2 italic">Chưa có đoạn chat nào</p>
      </div>

      {/* Bottom: Settings */}
      <div className="p-3 border-t border-[#222]">
        <button className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-[#202020] rounded-lg transition-colors">
          <Settings className="w-4 h-4" />
          Cài đặt và trợ giúp
        </button>
      </div>
    </aside>
  );
}

/** Floating button to reopen sidebar when collapsed */
export function SidebarToggleButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="absolute top-3 left-3 z-40 text-gray-400 hover:text-white hover:bg-white/10 p-2 rounded-md transition-colors lg:flex hidden"
    >
      <PanelLeftOpen className="w-4 h-4" />
    </button>
  );
}
