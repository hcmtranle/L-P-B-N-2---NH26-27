import React, { useState } from "react";
import { 
  CheckSquare, 
  Calendar, 
  Download, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  XCircle, 
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  Save,
  FileSpreadsheet,
  UserCheck
} from "lucide-react";
import { Student, DailyAttendance, AttendanceStatus, AttendanceRecord, ClassInfo } from "../types";
import { exportAttendanceToExcel } from "../utils/excel";

interface AttendanceManagerProps {
  students: Student[];
  classInfo: ClassInfo;
  attendanceHistory: Record<string, DailyAttendance>; // date (YYYY-MM-DD) -> DailyAttendance
  onSaveAttendance: (attendance: DailyAttendance) => void;
}

export const AttendanceManager: React.FC<AttendanceManagerProps> = ({
  students,
  classInfo,
  attendanceHistory,
  onSaveAttendance,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [viewTab, setViewTab] = useState<"daily" | "summary">("daily");

  // Get current date's attendance or build default
  const currentDaily: DailyAttendance = attendanceHistory[selectedDate] || {
    id: `att_${selectedDate}`,
    date: selectedDate,
    records: students.reduce((acc, s) => {
      acc[s.id] = { status: "present", note: "" };
      return acc;
    }, {} as Record<string, AttendanceRecord>),
    totalPresent: students.length,
    totalLate: 0,
    totalExcused: 0,
    totalUnexcused: 0,
    note: "",
    updatedAt: new Date().toISOString(),
  };

  const [records, setRecords] = useState<Record<string, AttendanceRecord>>(
    currentDaily.records
  );
  const [dailyNote, setDailyNote] = useState<string>(currentDaily.note || "");
  const [isSavedNotice, setIsSavedNotice] = useState(false);

  // Sync state when date changes
  React.useEffect(() => {
    const existing = attendanceHistory[selectedDate];
    if (existing) {
      setRecords(existing.records);
      setDailyNote(existing.note || "");
    } else {
      const initial: Record<string, AttendanceRecord> = {};
      students.forEach((s) => {
        initial[s.id] = { status: "present", note: "" };
      });
      setRecords(initial);
      setDailyNote("");
    }
  }, [selectedDate, attendanceHistory, students]);

  // Handle status toggle for a student
  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    const updated = {
      ...records,
      [studentId]: {
        ...(records[studentId] || { note: "" }),
        status,
      },
    };
    setRecords(updated);
    saveCurrentState(updated, dailyNote);
  };

  // Handle note change for a student
  const handleNoteChange = (studentId: string, note: string) => {
    const updated = {
      ...records,
      [studentId]: {
        ...(records[studentId] || { status: "present" }),
        note,
      },
    };
    setRecords(updated);
  };

  // Mark all present
  const handleMarkAllPresent = () => {
    const updated: Record<string, AttendanceRecord> = {};
    students.forEach((s) => {
      updated[s.id] = { status: "present", note: "" };
    });
    setRecords(updated);
    saveCurrentState(updated, dailyNote);
  };

  // Calculate totals
  const totalPresent = (Object.values(records) as AttendanceRecord[]).filter((r) => r.status === "present").length;
  const totalLate = (Object.values(records) as AttendanceRecord[]).filter((r) => r.status === "late").length;
  const totalExcused = (Object.values(records) as AttendanceRecord[]).filter((r) => r.status === "excused").length;
  const totalUnexcused = (Object.values(records) as AttendanceRecord[]).filter((r) => r.status === "unexcused").length;

  const saveCurrentState = (
    currentRecords: Record<string, AttendanceRecord>,
    note: string
  ) => {
    const present = (Object.values(currentRecords) as AttendanceRecord[]).filter((r) => r.status === "present").length;
    const late = (Object.values(currentRecords) as AttendanceRecord[]).filter((r) => r.status === "late").length;
    const excused = (Object.values(currentRecords) as AttendanceRecord[]).filter((r) => r.status === "excused").length;
    const unexcused = (Object.values(currentRecords) as AttendanceRecord[]).filter((r) => r.status === "unexcused").length;

    const data: DailyAttendance = {
      id: `att_${selectedDate}`,
      date: selectedDate,
      records: currentRecords,
      totalPresent: present,
      totalLate: late,
      totalExcused: excused,
      totalUnexcused: unexcused,
      note,
      updatedAt: new Date().toISOString(),
    };

    onSaveAttendance(data);
    setIsSavedNotice(true);
    setTimeout(() => setIsSavedNotice(false), 2000);
  };

  // Navigate date by +/- 1 day
  const changeDateBy = (days: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().slice(0, 10));
  };

  return (
    <div className="space-y-3.5">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-3.5 rounded-md border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-sm font-bold uppercase tracking-tight text-slate-800">
              Sổ Điểm Danh & Chuyên Cần Lớp 4
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
              Sĩ số: {students.length} em
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Theo dõi học sinh có mặt, đi trễ, nghỉ học có phép và không phép theo từng buổi học
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 p-0.5 rounded border border-slate-200 text-xs">
            <button
              onClick={() => setViewTab("daily")}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold transition cursor-pointer ${
                viewTab === "daily" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Điểm danh ngày
            </button>
            <button
              onClick={() => setViewTab("summary")}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold transition cursor-pointer ${
                viewTab === "summary" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Bảng tổng hợp
            </button>
          </div>

          <button
            onClick={() => exportAttendanceToExcel(students, Object.values(attendanceHistory), classInfo.name)}
            className="px-2.5 py-1 rounded border border-slate-200 hover:bg-slate-50 text-slate-700 text-[11px] font-medium flex items-center gap-1 transition cursor-pointer bg-white"
            title="Xuất file Excel sổ điểm danh"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Xuất Excel</span>
          </button>
        </div>
      </div>

      {viewTab === "daily" ? (
        <>
          {/* Date Selector & KPI summary */}
          <div className="bg-white p-3 rounded-md border border-slate-200 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              {/* Date navigator */}
              <div className="flex items-center space-x-1.5">
                <button
                  onClick={() => changeDateBy(-1)}
                  className="p-1.5 rounded border border-slate-200 hover:bg-slate-100 text-slate-600 cursor-pointer"
                  title="Ngày trước"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>

                <div className="flex items-center space-x-2 bg-slate-50 px-2.5 py-1 rounded border border-slate-200">
                  <Calendar className="w-3.5 h-3.5 text-blue-600" />
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="bg-transparent text-xs font-semibold text-slate-800 focus:outline-none"
                  />
                </div>

                <button
                  onClick={() => changeDateBy(1)}
                  className="p-1.5 rounded border border-slate-200 hover:bg-slate-100 text-slate-600 cursor-pointer"
                  title="Ngày sau"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => setSelectedDate(new Date().toISOString().slice(0, 10))}
                  className="px-2.5 py-1 rounded text-[11px] font-semibold text-blue-700 hover:bg-blue-50 border border-blue-200 cursor-pointer bg-white"
                >
                  Hôm nay
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleMarkAllPresent}
                  className="px-2.5 py-1 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold flex items-center gap-1 border border-emerald-200 transition cursor-pointer"
                >
                  <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Tất cả có mặt
                </button>

                <button
                  onClick={() => saveCurrentState(records, dailyNote)}
                  className="px-3 py-1 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold flex items-center gap-1 shadow-xs transition cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  {isSavedNotice ? "Đã lưu!" : "Lưu sổ"}
                </button>
              </div>
            </div>

            {/* Attendance Status Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-slate-100 text-xs">
              <div className="bg-emerald-50/70 border border-emerald-200/60 p-2 rounded-md flex items-center justify-between">
                <div>
                  <span className="text-emerald-700 font-semibold block text-[10px] uppercase">Có mặt</span>
                  <span className="text-lg font-black text-emerald-800">{totalPresent}</span>
                </div>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>

              <div className="bg-amber-50/70 border border-amber-200/60 p-2 rounded-md flex items-center justify-between">
                <div>
                  <span className="text-amber-700 font-semibold block text-[10px] uppercase">Đi trễ</span>
                  <span className="text-lg font-black text-amber-800">{totalLate}</span>
                </div>
                <Clock className="w-4 h-4 text-amber-500" />
              </div>

              <div className="bg-blue-50/70 border border-blue-200/60 p-2 rounded-md flex items-center justify-between">
                <div>
                  <span className="text-blue-700 font-semibold block text-[10px] uppercase">Nghỉ có phép</span>
                  <span className="text-lg font-black text-blue-800">{totalExcused}</span>
                </div>
                <AlertTriangle className="w-4 h-4 text-blue-500" />
              </div>

              <div className="bg-rose-50/70 border border-rose-200/60 p-2 rounded-md flex items-center justify-between">
                <div>
                  <span className="text-rose-700 font-semibold block text-[10px] uppercase">Nghỉ không phép</span>
                  <span className="text-lg font-black text-rose-800">{totalUnexcused}</span>
                </div>
                <XCircle className="w-4 h-4 text-rose-500" />
              </div>
            </div>
          </div>

          {/* Student Attendance Table */}
          <div className="bg-white rounded-md border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3 w-12 text-center">STT</th>
                    <th className="py-2.5 px-3 w-28">Mã HS</th>
                    <th className="py-2.5 px-3">Họ và tên</th>
                    <th className="py-2.5 px-3 w-20 text-center">Tổ</th>
                    <th className="py-2.5 px-3 text-center min-w-[260px]">Trạng thái điểm danh</th>
                    <th className="py-2.5 px-3 min-w-[200px]">Ghi chú / Lý do</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {students.map((student, index) => {
                    const rec = records[student.id] || { status: "present", note: "" };
                    return (
                      <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2 px-3 text-center text-slate-400 font-mono text-[11px]">{index + 1}</td>
                        <td className="py-2 px-3 font-mono font-semibold text-slate-700 text-[11px]">{student.code}</td>
                        <td className="py-2 px-3">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-slate-900">{student.fullName}</span>
                            {student.position !== "Thành viên" && (
                              <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-normal">
                                {student.position}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-2 px-3 text-center text-slate-600 text-[11px]">{student.group}</td>
                        <td className="py-2 px-3 text-center">
                          <div className="inline-flex rounded border border-slate-200 bg-slate-50 p-0.5 space-x-0.5">
                            <button
                              type="button"
                              onClick={() => handleStatusChange(student.id, "present")}
                              className={`px-2 py-1 rounded text-[11px] font-bold transition cursor-pointer ${
                                rec.status === "present"
                                  ? "bg-emerald-600 text-white shadow-xs"
                                  : "text-slate-600 hover:text-emerald-700 hover:bg-white"
                              }`}
                            >
                              Có mặt
                            </button>
                            <button
                              type="button"
                              onClick={() => handleStatusChange(student.id, "late")}
                              className={`px-2 py-1 rounded text-[11px] font-bold transition cursor-pointer ${
                                rec.status === "late"
                                  ? "bg-amber-500 text-white shadow-xs"
                                  : "text-slate-600 hover:text-amber-700 hover:bg-white"
                              }`}
                            >
                              Đi trễ
                            </button>
                            <button
                              type="button"
                              onClick={() => handleStatusChange(student.id, "excused")}
                              className={`px-2 py-1 rounded text-[11px] font-bold transition cursor-pointer ${
                                rec.status === "excused"
                                  ? "bg-blue-600 text-white shadow-xs"
                                  : "text-slate-600 hover:text-blue-700 hover:bg-white"
                              }`}
                            >
                              Có phép
                            </button>
                            <button
                              type="button"
                              onClick={() => handleStatusChange(student.id, "unexcused")}
                              className={`px-2 py-1 rounded text-[11px] font-bold transition cursor-pointer ${
                                rec.status === "unexcused"
                                  ? "bg-rose-600 text-white shadow-xs"
                                  : "text-slate-600 hover:text-rose-700 hover:bg-white"
                              }`}
                            >
                              Không phép
                            </button>
                          </div>
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            placeholder="Ghi chú (sốt, có giấy phép...)"
                            value={rec.note || ""}
                            onChange={(e) => handleNoteChange(student.id, e.target.value)}
                            onBlur={() => saveCurrentState(records, dailyNote)}
                            className="w-full px-2 py-1 text-xs rounded border border-slate-200 focus:outline-none focus:border-blue-500 bg-white"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Daily Summary Note */}
            <div className="p-3 bg-slate-50 border-t border-slate-200">
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Ghi chú chung của Giáo viên chủ nhiệm về buổi học hôm nay:
              </label>
              <textarea
                rows={2}
                value={dailyNote}
                onChange={(e) => setDailyNote(e.target.value)}
                onBlur={() => saveCurrentState(records, dailyNote)}
                placeholder="Ví dụ: Lớp học trật tự, chuẩn bị bài tốt. Tiết 2 bạn An sốt nhẹ đã báo phụ huynh đón về..."
                className="w-full p-2 text-xs bg-white rounded border border-slate-300 focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>
          </div>
        </>
      ) : (
        /* Summary History Table */
        <div className="bg-white rounded-md border border-slate-200 shadow-xs p-3.5 space-y-3">
          <div>
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-tight">Tổng hợp Chuyên cần Học sinh</h3>
            <p className="text-[11px] text-slate-500">Thống kê số buổi có mặt, đi trễ và nghỉ học toàn lớp</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3 text-center">STT</th>
                  <th className="py-2.5 px-3">Họ và tên</th>
                  <th className="py-2.5 px-3 text-center">Tổ</th>
                  <th className="py-2.5 px-3 text-center text-emerald-700">Có mặt</th>
                  <th className="py-2.5 px-3 text-center text-amber-700">Đi trễ</th>
                  <th className="py-2.5 px-3 text-center text-blue-700">Có phép</th>
                  <th className="py-2.5 px-3 text-center text-rose-700">Không phép</th>
                  <th className="py-2.5 px-3 text-center">Tỷ lệ chuyên cần</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((student, idx) => {
                  let present = 0, late = 0, excused = 0, unexcused = 0;
                  const allDates: DailyAttendance[] = Object.values(attendanceHistory);
                  allDates.forEach((att) => {
                    const status = att.records?.[student.id]?.status || "present";
                    if (status === "present") present++;
                    else if (status === "late") late++;
                    else if (status === "excused") excused++;
                    else if (status === "unexcused") unexcused++;
                  });

                  const totalDays = allDates.length || 1;
                  const rate = Math.round((present / totalDays) * 100);

                  return (
                    <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2 px-3 text-center text-slate-400 font-mono text-[11px]">{idx + 1}</td>
                      <td className="py-2 px-3 font-bold text-slate-900">{student.fullName}</td>
                      <td className="py-2 px-3 text-center text-slate-600 text-[11px]">{student.group}</td>
                      <td className="py-2 px-3 text-center font-bold text-emerald-700 font-mono">{present}</td>
                      <td className="py-2 px-3 text-center font-bold text-amber-700 font-mono">{late}</td>
                      <td className="py-2 px-3 text-center font-bold text-blue-700 font-mono">{excused}</td>
                      <td className="py-2 px-3 text-center font-bold text-rose-700 font-mono">{unexcused}</td>
                      <td className="py-2 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          rate >= 95 ? "bg-emerald-100 text-emerald-800" : rate >= 80 ? "bg-amber-100 text-amber-800" : "bg-rose-100 text-rose-800"
                        }`}>
                          {rate}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
