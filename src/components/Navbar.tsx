import React, { useState } from "react";
import { 
  LayoutDashboard, 
  Users, 
  CheckSquare, 
  GraduationCap, 
  Calendar, 
  BookOpen, 
  Award, 
  Sparkles, 
  Settings,
  Cloud,
  RefreshCw,
  Menu,
  X,
  Plus,
  Bell,
  Clock,
  ShieldCheck,
  ChevronRight
} from "lucide-react";
import { ClassInfo } from "../types";

export type NavTab = 
  | 'dashboard'
  | 'students'
  | 'attendance'
  | 'grades'
  | 'timetable'
  | 'reports'
  | 'rewards'
  | 'ai_assistant';

interface NavbarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  classInfo: ClassInfo;
  onOpenSettings: () => void;
  isSynced: boolean;
  onSyncNow: () => void;
  isSyncing: boolean;
  onQuickAddStudent?: () => void;
  onOpenAI?: (prompt?: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  classInfo,
  onOpenSettings,
  isSynced,
  onSyncNow,
  isSyncing,
  onQuickAddStudent,
  onOpenAI,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Grouped Navigation Items matching High Density Spec
  const navSections = [
    {
      title: "Quản lý chính",
      items: [
        { id: "dashboard" as NavTab, label: "Bảng điều khiển", icon: LayoutDashboard },
        { id: "students" as NavTab, label: "Danh sách lớp", icon: Users },
        { id: "attendance" as NavTab, label: "Điểm danh chuyên cần", icon: CheckSquare },
      ]
    },
    {
      title: "Học tập & Đánh giá",
      items: [
        { id: "grades" as NavTab, label: "Sổ điểm TT27", icon: GraduationCap },
        { id: "reports" as NavTab, label: "Sổ liên lạc học bạ", icon: BookOpen },
        { id: "timetable" as NavTab, label: "Thời khóa biểu", icon: Calendar },
        { id: "rewards" as NavTab, label: "Thi đua khen thưởng", icon: Award },
      ]
    },
    {
      title: "Hệ thống & AI",
      items: [
        { id: "ai_assistant" as NavTab, label: "Trợ lý AI Thông tư 27", icon: Sparkles, highlight: true },
      ]
    }
  ];

  // Helper for teacher initials
  const getInitials = (name: string) => {
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // Formatted date string in Vietnamese
  const todayDate = new Date();
  const daysOfWeek = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
  const dayName = daysOfWeek[todayDate.getDay()];
  const formattedDate = `${dayName}, ${todayDate.getDate()} Tháng ${todayDate.getMonth() + 1}, ${todayDate.getFullYear()}`;

  const handleTabClick = (tab: NavTab) => {
    onSelectTab(tab);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* ================= DESKTOP & TABLET SIDEBAR ================= */}
      <aside className="hidden lg:flex w-60 bg-slate-900 flex-col h-screen fixed inset-y-0 left-0 z-30 border-r border-slate-800 text-slate-400 select-none">
        {/* Brand Header */}
        <div className="h-14 px-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-blue-600 rounded flex items-center justify-center text-xs font-bold text-white shadow-xs">
              E
            </div>
            <div>
              <div className="text-white font-bold text-sm tracking-tight flex items-center gap-1.5">
                EduManage <span className="text-[10px] font-semibold text-blue-400 bg-blue-950/80 px-1.5 py-0.5 rounded border border-blue-800/60">4.0</span>
              </div>
            </div>
          </div>
          <button
            id="btn-sidebar-settings"
            onClick={onOpenSettings}
            title="Cài đặt hệ thống"
            className="p-1 rounded text-slate-500 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Sections */}
        <nav className="flex-1 px-3 py-3 space-y-4 overflow-y-auto scrollbar-none text-xs">
          {navSections.map((sec, secIdx) => (
            <div key={secIdx}>
              <div className="px-3 mb-1.5 text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                {sec.title}
              </div>
              <div className="space-y-0.5">
                {sec.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.id;
                  return (
                    <button
                      key={item.id}
                      id={`sidebar-nav-${item.id}`}
                      onClick={() => handleTabClick(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-md font-medium transition cursor-pointer text-left ${
                        isActive
                          ? "bg-blue-600 text-white font-semibold shadow-xs"
                          : "text-slate-400 hover:text-white hover:bg-slate-800/70"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 ${isActive ? "text-white" : item.highlight ? "text-blue-400" : "text-slate-400"}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.highlight && (
                        <span className="flex h-2 w-2 relative">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Sidebar Footer / Teacher Profile */}
        <div className="p-3 border-t border-slate-800 bg-slate-900/95">
          <div className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-800/70 border border-slate-700/60">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-600 to-orange-500 flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-xs">
              {getInitials(classInfo.teacherName || "Nguyễn A")}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs text-white font-semibold truncate leading-tight">
                {classInfo.teacherName}
              </div>
              <div className="text-[10px] text-slate-400 truncate mt-0.5">
                GVCN {classInfo.name} • {classInfo.school?.split("-")[0] || "Tiểu học"}
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* ================= TOP HEADER BAR ================= */}
      <header className="lg:pl-60 h-14 bg-white border-b border-slate-200 sticky top-0 z-20 flex items-center justify-between px-4 sm:px-6 shadow-xs select-none">
        {/* Left: Hamburger & Class Info */}
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            id="btn-mobile-menu-toggle"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-1.5 rounded-md text-slate-600 hover:bg-slate-100 cursor-pointer"
            aria-label="Mở menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-2.5 text-xs sm:text-sm">
            <span className="font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded border border-slate-200 font-mono">
              {classInfo.name}
            </span>
            <span className="text-slate-300 hidden sm:inline">|</span>
            <span className="text-slate-500 text-xs hidden sm:inline truncate max-w-xs font-medium">
              {formattedDate}
            </span>
          </div>
        </div>

        {/* Right: Status Badges & Quick Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Current Period / Live Indicator */}
          <div className="hidden md:flex items-center gap-1.5 bg-emerald-50 border border-emerald-200/80 text-emerald-700 px-2.5 py-1 rounded-full text-[11px] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Đang diễn ra: Tiết 3 (Toán)</span>
          </div>

          {/* Cloud Sync Button */}
          <button
            id="btn-sync-cloud-header"
            onClick={onSyncNow}
            disabled={isSyncing}
            title={isSynced ? "Đã đồng bộ thời gian thực với Firestore" : "Nhấn để đồng bộ dữ liệu đám mây"}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border border-slate-200 hover:bg-slate-50 text-slate-700 transition cursor-pointer"
          >
            {isSyncing ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 text-blue-600 animate-spin" />
                <span className="hidden sm:inline text-[11px]">Đang lưu...</span>
              </>
            ) : isSynced ? (
              <>
                <Cloud className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden sm:inline text-[11px] text-emerald-700 font-medium">Đã đồng bộ</span>
              </>
            ) : (
              <>
                <Cloud className="w-3.5 h-3.5 text-amber-500" />
                <span className="hidden sm:inline text-[11px]">Lưu đám mây</span>
              </>
            )}
          </button>

          {/* Quick AI Action Button */}
          <button
            id="btn-header-quick-ai"
            onClick={() => {
              if (onOpenAI) onOpenAI();
              else onSelectTab("ai_assistant");
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 shadow-xs transition cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Trợ lý AI TT27</span>
          </button>
        </div>
      </header>

      {/* ================= MOBILE DRAWER ================= */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" 
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          {/* Drawer Content */}
          <div className="relative w-64 bg-slate-900 text-slate-400 flex flex-col h-full z-50 shadow-2xl border-r border-slate-800">
            {/* Drawer Header */}
            <div className="h-14 px-4 border-b border-slate-800 flex items-center justify-between bg-slate-900">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-blue-600 rounded flex items-center justify-center text-xs font-bold text-white">
                  E
                </div>
                <span className="text-white font-bold text-sm">EduManage Lớp 4</span>
              </div>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Nav sections */}
            <nav className="flex-1 px-3 py-3 space-y-4 overflow-y-auto text-xs">
              {navSections.map((sec, secIdx) => (
                <div key={secIdx}>
                  <div className="px-3 mb-1.5 text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                    {sec.title}
                  </div>
                  <div className="space-y-0.5">
                    {sec.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = currentTab === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleTabClick(item.id)}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-md font-medium text-left ${
                            isActive
                              ? "bg-blue-600 text-white font-semibold"
                              : "text-slate-400 hover:text-white hover:bg-slate-800"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <Icon className="w-4 h-4" />
                            <span>{item.label}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>

            {/* Drawer Footer */}
            <div className="p-3 border-t border-slate-800 bg-slate-950">
              <button
                onClick={() => {
                  onOpenSettings();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded bg-slate-800 text-slate-300 hover:text-white text-xs font-medium"
              >
                <Settings className="w-4 h-4" />
                <span>Cài đặt thông tin lớp</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

