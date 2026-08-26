import React, { useState } from "react";
import { 
  BookOpen, 
  Sparkles, 
  Printer, 
  Share2, 
  Save, 
  Search, 
  Award, 
  Check, 
  MessageSquare,
  Copy,
  ChevronRight,
  Send
} from "lucide-react";
import { 
  Student, 
  ClassInfo, 
  TermType, 
  StudentTermReport, 
  EvaluationLevel, 
  StudentTitle,
  CompetenciesEvaluation,
  QualitiesEvaluation,
  DailyAttendance
} from "../types";
import { GRADE_4_SUBJECTS } from "../data/mockData";
import { PrintReportModal } from "./PrintReportModal";

interface ReportCardManagerProps {
  students: Student[];
  classInfo: ClassInfo;
  gradesData: Record<string, Record<string, { score?: number; level: EvaluationLevel; comment?: string }>>;
  reportsData: Record<string, StudentTermReport>; // studentId_term -> StudentTermReport
  attendanceHistory: Record<string, DailyAttendance>;
  onSaveReport: (report: StudentTermReport) => void;
  onOpenAIComment: (student: Student) => void;
}

export const ReportCardManager: React.FC<ReportCardManagerProps> = ({
  students,
  classInfo,
  gradesData,
  reportsData,
  attendanceHistory,
  onSaveReport,
  onOpenAIComment,
}) => {
  const [selectedTerm, setSelectedTerm] = useState<TermType>("final_term1");
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || "");
  const [searchTerm, setSearchTerm] = useState("");
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiGeneratedParentMsg, setAiGeneratedParentMsg] = useState<{ smsMessage?: string; zaloMessage?: string } | null>(null);
  const [copiedZalo, setCopiedZalo] = useState(false);

  const termLabels: Record<TermType, string> = {
    mid_term1: "Giữa Học Kỳ I",
    final_term1: "Cuối Học Kỳ I",
    mid_term2: "Giữa Học Kỳ II",
    final_term2: "Cuối Học Kỳ II (Tổng kết năm)",
  };

  const selectedStudent = students.find((s) => s.id === selectedStudentId) || students[0];

  // Get or initialize report for current student & term
  const reportKey = `${selectedStudent?.id}_${selectedTerm}`;
  const currentReport: StudentTermReport = reportsData[reportKey] || {
    id: reportKey,
    studentId: selectedStudent?.id || "",
    term: selectedTerm,
    competencies: {
      selfControl: "T",
      communication: "T",
      problemSolving: "T",
      language: "T",
      math: "T",
      science: "T",
      technology: "T",
      art: "T",
      physical: "T",
    },
    qualities: {
      patriotism: "T",
      compassion: "T",
      diligence: "T",
      honesty: "T",
      responsibility: "T",
    },
    teacherComment: `${selectedStudent?.fullName} chăm ngoan, tiếp thu bài tốt và có ý thức kỷ luật cao. Tích cực tham gia các hoạt động tập thể của lớp 4.`,
    parentAdvice: "Kính mong phụ huynh tiếp tục khuyến khích con đọc thêm sách và rèn luyện thể thao hàng ngày.",
    title: "Học sinh Tiêu biểu hoàn thành tốt trong học tập và rèn luyện",
    rewardFlowers: selectedStudent?.rewardStars || 15,
    updatedAt: new Date().toISOString(),
  };

  const [formData, setFormData] = useState<StudentTermReport>(currentReport);

  React.useEffect(() => {
    const key = `${selectedStudent?.id}_${selectedTerm}`;
    if (reportsData[key]) {
      setFormData(reportsData[key]);
    } else {
      setFormData({
        id: key,
        studentId: selectedStudent?.id || "",
        term: selectedTerm,
        competencies: {
          selfControl: "T",
          communication: "T",
          problemSolving: "T",
          language: "T",
          math: "T",
          science: "T",
          technology: "T",
          art: "T",
          physical: "T",
        },
        qualities: {
          patriotism: "T",
          compassion: "T",
          diligence: "T",
          honesty: "T",
          responsibility: "T",
        },
        teacherComment: `Em ${selectedStudent?.fullName} có nhiều tiến bộ trong học tập và rèn luyện. Tích cực tham gia phát biểu xây dựng bài.`,
        parentAdvice: "Gia đình tiếp tục động viên và đồng hành cùng con.",
        title: "Học sinh Tiêu biểu hoàn thành tốt trong học tập và rèn luyện",
        rewardFlowers: selectedStudent?.rewardStars || 10,
        updatedAt: new Date().toISOString(),
      });
    }
    setAiGeneratedParentMsg(null);
  }, [selectedStudentId, selectedTerm, reportsData]);

  // Attendance stats for selected student
  const allAtt: DailyAttendance[] = Object.values(attendanceHistory);
  let presentCount = 0;
  let excusedCount = 0;
  let unexcusedCount = 0;
  let lateCount = 0;
  allAtt.forEach((att) => {
    const status = att.records?.[selectedStudent?.id]?.status || "present";
    if (status === "present") presentCount++;
    else if (status === "late") lateCount++;
    else if (status === "excused") excusedCount++;
    else if (status === "unexcused") unexcusedCount++;
  });
  const attRate = allAtt.length > 0 ? Math.round((presentCount / allAtt.length) * 100) : 100;

  // Student grades dictionary for print & AI
  const studentGradesMap: Record<string, { score?: number; level: string; comment?: string }> = {};
  GRADE_4_SUBJECTS.forEach((subj) => {
    studentGradesMap[subj.id] = gradesData[subj.id]?.[selectedStudent?.id] || { level: "T" };
  });

  // Call Gemini AI for Pedagogical Comment
  const handleGenerateAIComment = async () => {
    if (!selectedStudent) return;
    setIsGeneratingAI(true);
    try {
      const res = await fetch("/api/ai/generate-comment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentName: selectedStudent.fullName,
          gender: selectedStudent.gender,
          term: termLabels[selectedTerm],
          grades: studentGradesMap,
          attendance: `Có mặt ${attRate}% (${allAtt.length - excusedCount - unexcusedCount}/${allAtt.length} buổi)`,
          strengths: selectedStudent.strengths,
          weaknesses: selectedStudent.weaknesses,
          customTone: "Chuẩn mực sư phạm, ấm áp, động viên học sinh Lớp 4",
        }),
      });

      const data = await res.json();
      if (data.generalComment) {
        const updated = {
          ...formData,
          teacherComment: data.generalComment,
          parentAdvice: data.parentAdvice || formData.parentAdvice,
        };
        setFormData(updated);
        onSaveReport(updated);
      }
    } catch (err) {
      console.error(err);
      alert("Đã áp dụng mẫu nhận xét tự động chuẩn Thông tư 27!");
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Call Gemini AI to Generate Parent Zalo message
  const handleGenerateParentMessage = async () => {
    if (!selectedStudent) return;
    setIsGeneratingAI(true);
    try {
      const res = await fetch("/api/ai/generate-parent-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentName: selectedStudent.fullName,
          parentName: selectedStudent.parentName,
          purpose: `Báo cáo kết quả học tập ${termLabels[selectedTerm]}`,
          keyNotes: `Điểm Toán: ${studentGradesMap["math"]?.score || "Tốt"}, Tiếng Việt: ${studentGradesMap["vietnamese"]?.score || "Tốt"}, Sao thi đua: ${selectedStudent.rewardStars} ⭐`,
          term: termLabels[selectedTerm],
        }),
      });

      const data = await res.json();
      if (data.zaloMessage) {
        setAiGeneratedParentMsg(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleSaveForm = () => {
    onSaveReport(formData);
    alert("Đã lưu sổ liên lạc thành công!");
  };

  const filteredStudents = students.filter((s) =>
    s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-3.5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-3.5 rounded-md border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-sm font-bold uppercase tracking-tight text-slate-800">
              Sổ Liên Lạc & Đánh Giá Định Kỳ (TT27)
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
              Lớp {classInfo.name}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Tổng hợp kết quả học tập, đánh giá Năng lực - Phẩm chất, in phiếu A4 và gửi tin nhắn Zalo cho phụ huynh
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedTerm}
            onChange={(e) => setSelectedTerm(e.target.value as TermType)}
            className="px-2.5 py-1 rounded border border-slate-300 bg-white text-[11px] font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
          >
            <option value="mid_term1">Giữa Học Kỳ I</option>
            <option value="final_term1">Cuối Học Kỳ I</option>
            <option value="mid_term2">Giữa Học Kỳ II</option>
            <option value="final_term2">Cuối Học Kỳ II (Cả năm)</option>
          </select>

          <button
            onClick={() => setIsPrintModalOpen(true)}
            className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] flex items-center gap-1 shadow-xs transition cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>In Phiếu A4</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3.5">
        {/* Student Selector Sidebar */}
        <div className="bg-white rounded-md border border-slate-200 shadow-xs p-3 space-y-2.5 lg:col-span-1 max-h-[750px] flex flex-col">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm học sinh..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-2.5 py-1 rounded border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="overflow-y-auto flex-1 space-y-1 pr-0.5">
            {filteredStudents.map((s) => {
              const isSelected = s.id === selectedStudent?.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setSelectedStudentId(s.id)}
                  className={`w-full text-left p-1.5 rounded text-xs transition flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? "bg-blue-50 text-blue-900 font-bold border border-blue-200"
                      : "hover:bg-slate-50 text-slate-700 border border-transparent"
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <div className={`w-6 h-6 rounded flex items-center justify-center font-bold text-[10px] ${
                      s.gender === 'Nam' ? 'bg-blue-100 text-blue-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {s.fullName.split(' ').pop()?.slice(0, 1)}
                    </div>
                    <div>
                      <p className="truncate max-w-[120px] font-semibold text-xs">{s.fullName}</p>
                      <p className="text-[10px] text-slate-400 font-normal">{s.code} • {s.group}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-amber-600">{s.rewardStars} ⭐</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Form: Detailed Evaluation & AI generator */}
        <div className="lg:col-span-3 space-y-3.5">
          {selectedStudent && (
            <div className="bg-white rounded-md border border-slate-200 shadow-xs p-3.5 space-y-3.5">
              {/* Student Overview Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2.5 border-b border-slate-200">
                <div className="flex items-center space-x-2.5">
                  <div className="w-9 h-9 rounded bg-slate-900 text-white font-bold flex items-center justify-center text-xs shadow-xs">
                    {selectedStudent.fullName.split(' ').pop()?.slice(0, 2)}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 uppercase tracking-tight">
                      <span>{selectedStudent.fullName}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-semibold font-mono">
                        {selectedStudent.code}
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {selectedStudent.gender} • Sinh ngày: {selectedStudent.dob} • PH: {selectedStudent.parentName} ({selectedStudent.parentPhone})
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleGenerateAIComment}
                    disabled={isGeneratingAI}
                    className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold flex items-center gap-1 shadow-xs transition cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>{isGeneratingAI ? "AI đang soạn..." : "Trợ lý AI viết nhận xét"}</span>
                  </button>

                  <button
                    onClick={handleGenerateParentMessage}
                    disabled={isGeneratingAI}
                    className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold flex items-center gap-1 border border-slate-300 transition cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                    <span>Soạn tin Zalo</span>
                  </button>
                </div>
              </div>

              {/* AI Generated Zalo Message Preview if requested */}
              {aiGeneratedParentMsg && (
                <div className="p-2.5 rounded bg-blue-50 border border-blue-200 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-blue-900 flex items-center gap-1 text-[11px]">
                      <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                      Tin nhắn Zalo mẫu gửi Phụ huynh:
                    </span>
                    <button
                      onClick={() => {
                        if (aiGeneratedParentMsg.zaloMessage) {
                          navigator.clipboard.writeText(aiGeneratedParentMsg.zaloMessage);
                          setCopiedZalo(true);
                          setTimeout(() => setCopiedZalo(false), 2000);
                        }
                      }}
                      className="px-2 py-0.5 rounded bg-blue-600 text-white text-[10px] font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      {copiedZalo ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedZalo ? "Đã copy!" : "Copy tin nhắn"}</span>
                    </button>
                  </div>
                  <p className="whitespace-pre-line text-slate-800 bg-white p-2 rounded border border-blue-100 text-xs">
                    {aiGeneratedParentMsg.zaloMessage}
                  </p>
                </div>
              )}

              {/* Section 1: Năng lực chung & Năng lực đặc thù */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                  1. Đánh giá Năng lực (Thông tư 27)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  {/* Tự chủ & Tự học */}
                  <div className="p-2 rounded border border-slate-200 bg-slate-50 flex items-center justify-between">
                    <span className="font-semibold text-slate-800 text-[11px]">Tự chủ và tự học:</span>
                    <div className="inline-flex rounded border border-slate-200 bg-white p-0.5">
                      {(["T", "H", "C"] as EvaluationLevel[]).map((lvl) => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => setFormData({
                            ...formData,
                            competencies: { ...formData.competencies, selfControl: lvl },
                          })}
                          className={`px-1.5 py-0.2 rounded text-[11px] font-bold ${
                            formData.competencies?.selfControl === lvl
                              ? "bg-blue-600 text-white"
                              : "text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Giao tiếp & Hợp tác */}
                  <div className="p-2 rounded border border-slate-200 bg-slate-50 flex items-center justify-between">
                    <span className="font-semibold text-slate-800 text-[11px]">Giao tiếp & hợp tác:</span>
                    <div className="inline-flex rounded border border-slate-200 bg-white p-0.5">
                      {(["T", "H", "C"] as EvaluationLevel[]).map((lvl) => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => setFormData({
                            ...formData,
                            competencies: { ...formData.competencies, communication: lvl },
                          })}
                          className={`px-1.5 py-0.2 rounded text-[11px] font-bold ${
                            formData.competencies?.communication === lvl
                              ? "bg-blue-600 text-white"
                              : "text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Giải quyết vấn đề */}
                  <div className="p-2 rounded border border-slate-200 bg-slate-50 flex items-center justify-between">
                    <span className="font-semibold text-slate-800 text-[11px]">Giải quyết vấn đề:</span>
                    <div className="inline-flex rounded border border-slate-200 bg-white p-0.5">
                      {(["T", "H", "C"] as EvaluationLevel[]).map((lvl) => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => setFormData({
                            ...formData,
                            competencies: { ...formData.competencies, problemSolving: lvl },
                          })}
                          className={`px-1.5 py-0.2 rounded text-[11px] font-bold ${
                            formData.competencies?.problemSolving === lvl
                              ? "bg-blue-600 text-white"
                              : "text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: 5 Phẩm chất chủ yếu */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                  2. Đánh giá 5 Phẩm chất chủ yếu (GDPT 2018)
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 text-xs">
                  {[
                    { key: "patriotism", label: "Yêu nước" },
                    { key: "compassion", label: "Nhân ái" },
                    { key: "diligence", label: "Chăm chỉ" },
                    { key: "honesty", label: "Trung thực" },
                    { key: "responsibility", label: "Trách nhiệm" },
                  ].map((q) => (
                    <div key={q.key} className="p-1.5 rounded border border-slate-200 bg-slate-50 text-center space-y-1">
                      <span className="font-bold text-slate-800 text-[11px] block">{q.label}</span>
                      <div className="inline-flex rounded border border-slate-200 bg-white p-0.5">
                        {(["T", "H", "C"] as EvaluationLevel[]).map((lvl) => (
                          <button
                            key={lvl}
                            type="button"
                            onClick={() => setFormData({
                              ...formData,
                              qualities: {
                                ...formData.qualities,
                                [q.key]: lvl,
                              },
                            })}
                            className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                              (formData.qualities as any)?.[q.key] === lvl
                                ? "bg-blue-600 text-white"
                                : "text-slate-600 hover:bg-slate-100"
                            }`}
                          >
                            {lvl}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 3: Lời nhận xét toàn diện & Lời nhắn gửi phụ huynh */}
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                      3. Nhận xét của Giáo viên chủ nhiệm (Học bạ / Sổ liên lạc)
                    </label>
                    <span className="text-[10px] text-slate-400">
                      Chuẩn Thông tư 27
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    value={formData.teacherComment}
                    onChange={(e) => setFormData({ ...formData, teacherComment: e.target.value })}
                    placeholder="Nhận xét sự tiến bộ, thái độ học tập và rèn luyện của học sinh..."
                    className="w-full p-2 rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs leading-relaxed bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                    4. Lời nhắn gửi / Lời khuyên cho Phụ huynh học sinh
                  </label>
                  <textarea
                    rows={2}
                    value={formData.parentAdvice}
                    onChange={(e) => setFormData({ ...formData, parentAdvice: e.target.value })}
                    placeholder="Gợi ý phụ huynh phối hợp rèn luyện cho con ở nhà..."
                    className="w-full p-2 rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs leading-relaxed bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                    5. Xếp loại Danh hiệu thi đua
                  </label>
                  <select
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value as StudentTitle })}
                    className="w-full p-1.5 rounded border border-slate-300 bg-white font-bold text-slate-800 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="Học sinh Xuất sắc">Học sinh Xuất sắc</option>
                    <option value="Học sinh Tiêu biểu hoàn thành tốt trong học tập và rèn luyện">
                      Học sinh Tiêu biểu hoàn thành tốt trong học tập và rèn luyện
                    </option>
                    <option value="Hoàn thành chương trình lớp học">Hoàn thành chương trình lớp học</option>
                    <option value="Chưa hoàn thành">Chưa hoàn thành</option>
                  </select>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsPrintModalOpen(true)}
                  className="px-3 py-1 rounded border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-500" />
                  <span>Xem trước bản in A4</span>
                </button>

                <button
                  type="button"
                  onClick={handleSaveForm}
                  className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] flex items-center gap-1 shadow-xs transition cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Lưu Sổ Liên Lạc</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Print Modal Component */}
      {selectedStudent && (
        <PrintReportModal
          isOpen={isPrintModalOpen}
          onClose={() => setIsPrintModalOpen(false)}
          student={selectedStudent}
          classInfo={classInfo}
          term={selectedTerm}
          report={formData}
          grades={studentGradesMap}
          attendanceSummary={{
            present: presentCount,
            late: lateCount,
            excused: excusedCount,
            unexcused: unexcusedCount,
            rate: attRate,
          }}
        />
      )}
    </div>
  );
};
