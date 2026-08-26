import React, { useState } from "react";
import { 
  Users, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Calendar, 
  Sparkles, 
  Award, 
  ChevronRight, 
  HeartHandshake,
  TrendingUp,
  FileSpreadsheet,
  GraduationCap,
  Plus,
  ArrowUpRight,
  Search,
  BookOpen,
  Filter
} from "lucide-react";
import { Student, ClassInfo, DailyAttendance, TimetableDay, ClassEvent, EvaluationLevel } from "../types";
import { NavTab } from "./Navbar";
import { GRADE_4_SUBJECTS } from "../data/mockData";

interface DashboardProps {
  students: Student[];
  classInfo: ClassInfo;
  todayAttendance: DailyAttendance;
  todayTimetable?: TimetableDay;
  events: ClassEvent[];
  gradesData?: Record<string, Record<string, { score?: number; level: EvaluationLevel; comment?: string }>>;
  onNavigate: (tab: NavTab) => void;
  onQuickAttendance: () => void;
  onOpenAI: (initialPrompt?: string) => void;
  onQuickAddStudent?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  students,
  classInfo,
  todayAttendance,
  todayTimetable,
  events,
  gradesData = {},
  onNavigate,
  onQuickAttendance,
  onOpenAI,
  onQuickAddStudent,
}) => {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("math");
  const [tableSearch, setTableSearch] = useState<string>("");

  const maleCount = students.filter(s => s.gender === 'Nam').length;
  const femaleCount = students.filter(s => s.gender === 'Nữ').length;

  const totalPresent = todayAttendance?.totalPresent || 0;
  const totalLate = todayAttendance?.totalLate || 0;
  const totalExcused = todayAttendance?.totalExcused || 0;
  const totalUnexcused = todayAttendance?.totalUnexcused || 0;

  const totalStars = students.reduce((acc, curr) => acc + (curr.rewardStars || 0), 0);
  const healthAlertStudents = students.filter(s => s.healthNote && s.healthNote.trim() !== "Không có" && s.healthNote.trim() !== "Bình thường");

  // Selected subject grades
  const currentSubjGrades = gradesData[selectedSubjectId] || {};

  const filteredStudents = students.filter(s => 
    s.fullName.toLowerCase().includes(tableSearch.toLowerCase()) ||
    s.code.toLowerCase().includes(tableSearch.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* High Density Metric Cards Row matching High Density Spec */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Total Students */}
        <div 
          onClick={() => onNavigate('students')}
          className="bg-white p-4 border border-slate-200 rounded-md shadow-xs hover:border-blue-400 hover:shadow-sm transition cursor-pointer"
        >
          <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1 flex items-center justify-between">
            <span>Tổng học sinh</span>
            <Users className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 leading-tight">
            {students.length}
          </div>
          <div className="text-[10px] text-emerald-600 font-medium mt-1">
            Nam: {maleCount} • Nữ: {femaleCount}
          </div>
        </div>

        {/* Present Today */}
        <div 
          onClick={() => onNavigate('attendance')}
          className="bg-white p-4 border border-slate-200 rounded-md shadow-xs hover:border-blue-400 hover:shadow-sm transition cursor-pointer"
        >
          <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1 flex items-center justify-between">
            <span>Có mặt hôm nay</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 leading-tight">
            {totalPresent} <span className="text-xs text-slate-400 font-normal">/ {students.length}</span>
          </div>
          <div className="text-[10px] text-slate-400 font-medium mt-1">
            Cập nhật: {todayAttendance?.updatedAt ? new Date(todayAttendance.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "08:15 AM"}
          </div>
        </div>

        {/* Excused / Absent */}
        <div 
          onClick={() => onNavigate('attendance')}
          className="bg-white p-4 border border-slate-200 rounded-md shadow-xs hover:border-red-400 hover:shadow-sm transition cursor-pointer"
        >
          <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1 flex items-center justify-between">
            <span>Nghỉ học (Có phép)</span>
            <AlertCircle className="w-3.5 h-3.5 text-red-500" />
          </div>
          <div className="text-2xl font-bold text-red-600 leading-tight">
            {totalExcused + totalUnexcused}
          </div>
          <div className="text-[10px] text-slate-400 font-medium mt-1 truncate">
            {totalExcused > 0 ? `Có phép: ${totalExcused}` : "Không có học sinh vắng"} {totalUnexcused > 0 && `• Không phép: ${totalUnexcused}`}
          </div>
        </div>

        {/* Đi muộn / Thi đua */}
        <div 
          onClick={() => onNavigate('rewards')}
          className="bg-white p-4 border border-slate-200 rounded-md shadow-xs hover:border-orange-400 hover:shadow-sm transition cursor-pointer"
        >
          <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1 flex items-center justify-between">
            <span>Sao thi đua / Hoa điểm 10</span>
            <Award className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-orange-500 leading-tight">
            {totalStars} <span className="text-xs font-normal text-amber-700">⭐</span>
          </div>
          <div className="text-[10px] text-slate-400 font-medium mt-1">
            {totalLate > 0 ? `Đi muộn hôm nay: ${totalLate} em` : "Nề nếp lớp xuất sắc"}
          </div>
        </div>
      </div>

      {/* Main Grid: 8 cols Left (Grades & Students) + 4 cols Right (Schedule & Notice) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left 8 Cols: High Density Gradebook & Assessment Table */}
        <div className="lg:col-span-8 flex flex-col bg-white border border-slate-200 rounded-md overflow-hidden shadow-xs">
          {/* Table Header Controls */}
          <div className="p-3.5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-slate-50/50">
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-xs uppercase tracking-tight text-slate-700">
                Danh sách điểm số & Đánh giá thường xuyên
              </h2>
              <span className="text-[10px] bg-blue-50 text-blue-700 font-semibold px-2 py-0.5 rounded border border-blue-200/60">
                Thông tư 27
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Search */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tìm học sinh..."
                  value={tableSearch}
                  onChange={(e) => setTableSearch(e.target.value)}
                  className="text-xs border border-slate-200 pl-7 pr-2 py-1 rounded w-36 sm:w-44 focus:outline-none focus:border-blue-500 bg-white"
                />
              </div>

              {/* Subject Select */}
              <select
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="text-xs border border-slate-200 px-2 py-1 rounded bg-white focus:outline-none focus:border-blue-500 text-slate-700"
              >
                {GRADE_4_SUBJECTS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Table Content */}
          <div className="overflow-x-auto max-h-[380px] scrollbar-thin">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 sticky top-0 z-10 border-b border-slate-200">
                <tr>
                  <th className="p-2.5 w-12 text-center">ID</th>
                  <th className="p-2.5">Họ và Tên</th>
                  <th className="p-2.5 text-center">Tổ</th>
                  <th className="p-2.5 text-center">KT Thường xuyên</th>
                  <th className="p-2.5 text-center">KT Định kỳ</th>
                  <th className="p-2.5 text-center">Mức đạt</th>
                  <th className="p-2.5 text-right">Nhận xét</th>
                </tr>
              </thead>
              <tbody className="text-xs divide-y divide-slate-100">
                {filteredStudents.slice(0, 10).map((s, idx) => {
                  const studentGrade = currentSubjGrades[s.id];
                  const score = studentGrade?.score ?? (8.5 - (idx % 4) * 0.8);
                  const level = studentGrade?.level || (score >= 9 ? "T" : score >= 6.5 ? "H" : "C");

                  return (
                    <tr 
                      key={s.id} 
                      className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="p-2.5 font-mono text-slate-400 text-center text-[11px]">
                        {s.code.replace("HS", "")}
                      </td>
                      <td className="p-2.5">
                        <div className="font-medium text-slate-900">{s.fullName}</div>
                        <div className="text-[10px] text-slate-400">{s.gender} • {s.position}</div>
                      </td>
                      <td className="p-2.5 text-center text-slate-500 text-[11px]">
                        {s.group}
                      </td>
                      <td className="p-2.5 text-center text-slate-700 font-mono text-xs">
                        {(score + 0.3).toFixed(1)}, {(score - 0.2).toFixed(1)}
                      </td>
                      <td className="p-2.5 text-center font-bold font-mono text-slate-900">
                        {score.toFixed(1)}
                      </td>
                      <td className="p-2.5 text-center">
                        {score >= 9.0 ? (
                          <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold">
                            Xuất sắc (T)
                          </span>
                        ) : score >= 8.0 ? (
                          <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-bold">
                            Giỏi (T)
                          </span>
                        ) : score >= 6.5 ? (
                          <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-[10px] font-bold">
                            Khá (H)
                          </span>
                        ) : score >= 5.0 ? (
                          <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded text-[10px] font-bold">
                            TB (H)
                          </span>
                        ) : (
                          <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-[10px] font-bold">
                            Cần cố gắng (C)
                          </span>
                        )}
                      </td>
                      <td className="p-2.5 text-right">
                        <button
                          onClick={() => onOpenAI(`Viết lời nhận xét học bạ môn ${GRADE_4_SUBJECTS.find(sub => sub.id === selectedSubjectId)?.name} cho học sinh ${s.fullName} đạt ${score.toFixed(1)} điểm.`)}
                          className="text-blue-600 hover:text-blue-800 text-[11px] font-medium inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Sparkles className="w-3 h-3 text-blue-500" />
                          <span>Gợi ý AI</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="p-2.5 border-t border-slate-200 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
            <span>Hiển thị {Math.min(10, filteredStudents.length)} / {students.length} học sinh</span>
            <button 
              onClick={() => onNavigate('grades')}
              className="text-blue-600 font-semibold hover:underline flex items-center gap-1 cursor-pointer text-xs"
            >
              Xem sổ điểm đầy đủ <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right 4 Cols: Schedule & System Notifications matching Design HTML */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {/* Lịch trình hôm nay */}
          <div className="bg-white border border-slate-200 rounded-md shadow-xs p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">
                Lịch trình hôm nay ({todayTimetable?.dayName || "Hôm nay"})
              </h3>
              <button
                onClick={() => onNavigate('timetable')}
                className="text-[10px] font-semibold text-blue-600 hover:underline cursor-pointer"
              >
                Xem tuần
              </button>
            </div>

            <div className="space-y-3">
              {todayTimetable?.morningSlots && todayTimetable.morningSlots.length > 0 ? (
                <>
                  <div className="flex gap-2.5 items-start">
                    <div className="text-[10px] font-mono text-slate-400 pt-0.5 w-10">07:30</div>
                    <div className="flex-1 border-l-2 border-blue-500 pl-2.5">
                      <div className="text-xs font-bold text-slate-900">
                        {todayTimetable.morningSlots[0]?.subjectName || "Toán học"}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Phòng 402 • GV: {todayTimetable.morningSlots[0]?.teacher || classInfo.teacherName}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2.5 items-start">
                    <div className="text-[10px] font-mono text-slate-400 pt-0.5 w-10">08:15</div>
                    <div className="flex-1 border-l-2 border-emerald-500 pl-2.5">
                      <div className="text-xs font-bold text-slate-900">
                        {todayTimetable.morningSlots[1]?.subjectName || "Tiếng Việt"}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Phòng 402 • Đọc - Hiểu văn bản
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2.5 items-start opacity-70">
                    <div className="text-[10px] font-mono text-slate-400 pt-0.5 w-10">09:00</div>
                    <div className="flex-1 border-l-2 border-slate-300 pl-2.5">
                      <div className="text-xs font-bold text-slate-500">Ra chơi / Thể dục giữa giờ</div>
                      <div className="text-[10px] text-slate-400">Sân trường</div>
                    </div>
                  </div>

                  <div className="flex gap-2.5 items-start">
                    <div className="text-[10px] font-mono text-slate-400 pt-0.5 w-10">09:30</div>
                    <div className="flex-1 border-l-2 border-purple-500 pl-2.5">
                      <div className="text-xs font-bold text-slate-900">
                        {todayTimetable.morningSlots[2]?.subjectName || "Tiếng Anh"}
                      </div>
                      <div className="text-[10px] text-slate-500">Phòng Ngoại ngữ • Unit 8</div>
                    </div>
                  </div>

                  <div className="flex gap-2.5 items-start">
                    <div className="text-[10px] font-mono text-slate-400 pt-0.5 w-10">14:00</div>
                    <div className="flex-1 border-l-2 border-amber-500 pl-2.5">
                      <div className="text-xs font-bold text-slate-900">
                        {todayTimetable.afternoonSlots?.[0]?.subjectName || "Khoa học & Kỹ thuật"}
                      </div>
                      <div className="text-[10px] text-slate-500">Phòng Thực hành</div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-xs text-slate-500 py-3 text-center">Chưa cập nhật thời khóa biểu</div>
              )}
            </div>
          </div>

          {/* Thông báo mới & Trợ lý AI (Dark Slate Widget from Design HTML) */}
          <div className="bg-slate-900 text-white rounded-md p-4 shadow-sm flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">
                  Thông báo & Trợ lý AI TT27
                </h3>
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></span>
              </div>

              <div className="space-y-2.5">
                <div className="p-2.5 bg-white/5 rounded border border-white/10 text-xs">
                  <div className="text-[10px] text-blue-400 font-bold mb-0.5">HỆ THỐNG</div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Hạn cuối hoàn thành đánh giá học bạ Giữa HK2 là 24/05. Vui lòng kiểm tra sổ điểm.
                  </p>
                </div>

                <div className="p-2.5 bg-white/5 rounded border border-white/10 text-xs">
                  <div className="text-[10px] text-orange-400 font-bold mb-0.5">TRỢ LÝ AI SƯ PHẠM</div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Đã sẵn sàng tạo tự động nhận xét phẩm chất, năng lực theo Thông tư 27 cho từng học sinh.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-white/10 flex gap-2">
              <button
                onClick={() => onOpenAI("Soạn 3 câu hỏi kiểm tra bài cũ 5 phút môn Toán Lớp 4")}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-medium py-1.5 px-2 rounded text-center transition cursor-pointer"
              >
                + Gợi ý câu hỏi AI
              </button>
              <button
                onClick={() => onNavigate('reports')}
                className="bg-white/10 hover:bg-white/20 text-white text-[11px] font-medium py-1.5 px-3 rounded text-center transition cursor-pointer"
              >
                Sổ liên lạc
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

