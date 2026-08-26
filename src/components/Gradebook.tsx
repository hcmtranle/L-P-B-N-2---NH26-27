import React, { useState } from "react";
import { 
  GraduationCap, 
  Download, 
  Sparkles, 
  Save, 
  Check, 
  HelpCircle,
  Calculator,
  BookOpen,
  Award,
  ChevronDown
} from "lucide-react";
import { Student, SubjectInfo, TermType, EvaluationLevel, ClassInfo } from "../types";
import { GRADE_4_SUBJECTS } from "../data/mockData";
import { exportGradesToExcel } from "../utils/excel";

interface GradebookProps {
  students: Student[];
  classInfo: ClassInfo;
  gradesData: Record<string, Record<string, { score?: number; level: EvaluationLevel; comment?: string }>>;
  onSaveGrades: (updatedGrades: Record<string, Record<string, { score?: number; level: EvaluationLevel; comment?: string }>>) => void;
  onOpenAIComment: (student: Student, subjectName: string, score?: number) => void;
}

export const Gradebook: React.FC<GradebookProps> = ({
  students,
  classInfo,
  gradesData,
  onSaveGrades,
  onOpenAIComment,
}) => {
  const [selectedTerm, setSelectedTerm] = useState<TermType>("final_term1");
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("math");
  const [viewMode, setViewMode] = useState<"single_subject" | "matrix">("single_subject");
  const [localGrades, setLocalGrades] = useState(gradesData);
  const [isSavedNotice, setIsSavedNotice] = useState(false);

  // Sync state when parent changes
  React.useEffect(() => {
    setLocalGrades(gradesData);
  }, [gradesData]);

  const selectedSubject = GRADE_4_SUBJECTS.find((s) => s.id === selectedSubjectId) || GRADE_4_SUBJECTS[0];

  const termLabels: Record<TermType, string> = {
    mid_term1: "Giữa Học Kỳ I",
    final_term1: "Cuối Học Kỳ I",
    mid_term2: "Giữa Học Kỳ II",
    final_term2: "Cuối Học Kỳ II",
  };

  const handleScoreChange = (studentId: string, scoreStr: string) => {
    const num = parseFloat(scoreStr);
    let level: EvaluationLevel = "H";
    if (!isNaN(num)) {
      if (num >= 9.0) level = "T";
      else if (num >= 5.0) level = "H";
      else level = "C";
    }

    const currentSubj = localGrades[selectedSubjectId] || {};
    const updated = {
      ...localGrades,
      [selectedSubjectId]: {
        ...currentSubj,
        [studentId]: {
          ...(currentSubj[studentId] || { comment: "" }),
          score: isNaN(num) ? undefined : Math.min(10, Math.max(0, num)),
          level: isNaN(num) ? (currentSubj[studentId]?.level || "H") : level,
        },
      },
    };

    setLocalGrades(updated);
    onSaveGrades(updated);
  };

  const handleLevelChange = (studentId: string, level: EvaluationLevel) => {
    const currentSubj = localGrades[selectedSubjectId] || {};
    const updated = {
      ...localGrades,
      [selectedSubjectId]: {
        ...currentSubj,
        [studentId]: {
          ...(currentSubj[studentId] || {}),
          level,
        },
      },
    };

    setLocalGrades(updated);
    onSaveGrades(updated);
  };

  const handleCommentChange = (studentId: string, comment: string) => {
    const currentSubj = localGrades[selectedSubjectId] || {};
    const updated = {
      ...localGrades,
      [selectedSubjectId]: {
        ...currentSubj,
        [studentId]: {
          ...(currentSubj[studentId] || { level: "T" }),
          comment,
        },
      },
    };

    setLocalGrades(updated);
  };

  const handleSaveAll = () => {
    onSaveGrades(localGrades);
    setIsSavedNotice(true);
    setTimeout(() => setIsSavedNotice(false), 2000);
  };

  // Quick Preset comments for primary students
  const presetComments = [
    "Tiếp thu bài nhanh, tư duy tốt, tích cực phát biểu.",
    "Chăm chỉ làm bài, chữ viết cẩn thận, cần rèn thêm tốc độ.",
    "Hoàn thành tốt nội dung bài học, có năng khiếu sáng tạo.",
    "Cần chú ý lắng nghe cô hướng dẫn và luyện tập thêm ở nhà."
  ];

  return (
    <div className="space-y-3.5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-3.5 rounded-md border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-sm font-bold uppercase tracking-tight text-slate-800">
              Sổ Điểm & Đánh Giá Học Sinh (Thông tư 27)
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
              Khối 4
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Đánh giá thường xuyên và định kỳ các môn học: Mức Hoàn thành tốt (T), Hoàn thành (H), Chưa hoàn thành (C)
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Term selector */}
          <select
            value={selectedTerm}
            onChange={(e) => setSelectedTerm(e.target.value as TermType)}
            className="px-2.5 py-1 rounded border border-slate-300 bg-slate-50 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="mid_term1">Giữa Học Kỳ I</option>
            <option value="final_term1">Cuối Học Kỳ I</option>
            <option value="mid_term2">Giữa Học Kỳ II</option>
            <option value="final_term2">Cuối Học Kỳ II</option>
          </select>

          {/* Matrix view toggle */}
          <div className="flex bg-slate-100 p-0.5 rounded border border-slate-200 text-xs">
            <button
              onClick={() => setViewMode("single_subject")}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold transition cursor-pointer ${
                viewMode === "single_subject" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Theo môn
            </button>
            <button
              onClick={() => setViewMode("matrix")}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold transition cursor-pointer ${
                viewMode === "matrix" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Bảng tổng hợp
            </button>
          </div>

          {/* Excel Export */}
          <button
            onClick={() => exportGradesToExcel(students, GRADE_4_SUBJECTS, localGrades, termLabels[selectedTerm], classInfo.name)}
            className="px-2.5 py-1 rounded border border-slate-200 hover:bg-slate-50 text-slate-700 text-[11px] font-medium flex items-center gap-1 transition cursor-pointer bg-white"
            title="Xuất bảng điểm ra file Excel"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Xuất Excel</span>
          </button>
        </div>
      </div>

      {viewMode === "single_subject" ? (
        <>
          {/* Subject Pills Slider */}
          <div className="bg-white p-2 rounded-md border border-slate-200 shadow-xs overflow-x-auto">
            <div className="flex space-x-1.5 min-w-max">
              {GRADE_4_SUBJECTS.map((subj) => {
                const isSelected = subj.id === selectedSubjectId;
                return (
                  <button
                    key={subj.id}
                    onClick={() => setSelectedSubjectId(subj.id)}
                    className={`px-2.5 py-1 rounded text-[11px] font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? "bg-blue-600 text-white shadow-xs"
                        : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200"
                    }`}
                  >
                    <span>{subj.name}</span>
                    {subj.hasPeriodicScore && (
                      <span className={`text-[9px] px-1 py-0.2 rounded font-normal ${
                        isSelected ? "bg-blue-500 text-white" : "bg-slate-200 text-slate-600"
                      }`}>
                        Điểm
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Subject Detail Header & Note */}
          <div className="bg-white p-3 rounded-md border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-xs font-bold uppercase tracking-tight text-slate-900">
                  Môn {selectedSubject.name} • {termLabels[selectedTerm]}
                </h3>
                <span className="text-[11px] text-slate-500 font-medium">({selectedSubject.teacher})</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {selectedSubject.hasPeriodicScore 
                  ? "Môn học đánh giá Điểm số (1-10) và Mức đạt được (T: Hoàn thành tốt, H: Hoàn thành, C: Chưa hoàn thành)."
                  : "Môn học đánh giá nhận xét và Mức đạt được (T / H / C)."}
              </p>
            </div>

            <button
              onClick={handleSaveAll}
              className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] flex items-center gap-1 shadow-xs transition cursor-pointer self-start sm:self-auto"
            >
              <Save className="w-3.5 h-3.5" />
              {isSavedNotice ? "Đã lưu!" : "Lưu bảng điểm"}
            </button>
          </div>

          {/* Grades Table */}
          <div className="bg-white rounded-md border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3 w-12 text-center">STT</th>
                    <th className="py-2.5 px-3 w-28">Mã HS</th>
                    <th className="py-2.5 px-3">Họ và tên</th>
                    <th className="py-2.5 px-3 w-20 text-center">Tổ</th>
                    {selectedSubject.hasPeriodicScore && (
                      <th className="py-2.5 px-3 w-28 text-center">Điểm KT (1-10)</th>
                    )}
                    <th className="py-2.5 px-3 w-36 text-center">Mức đạt được</th>
                    <th className="py-2.5 px-3 min-w-[240px]">Nhận xét thường xuyên</th>
                    <th className="py-2.5 px-3 w-20 text-center">Trợ lý AI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students.map((student, idx) => {
                    const entry = localGrades[selectedSubjectId]?.[student.id] || { level: "T", comment: "" };
                    return (
                      <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2 px-3 text-center text-slate-400 font-mono text-[11px]">{idx + 1}</td>
                        <td className="py-2 px-3 font-mono font-semibold text-slate-700 text-[11px]">{student.code}</td>
                        <td className="py-2 px-3 font-bold text-slate-900">{student.fullName}</td>
                        <td className="py-2 px-3 text-center text-slate-600 text-[11px]">{student.group}</td>
                        
                        {/* Score Input (for periodic scored subjects) */}
                        {selectedSubject.hasPeriodicScore && (
                          <td className="py-1.5 px-3 text-center">
                            <input
                              type="number"
                              step="0.5"
                              min="0"
                              max="10"
                              value={entry.score !== undefined ? entry.score : ""}
                              onChange={(e) => handleScoreChange(student.id, e.target.value)}
                              placeholder="10"
                              className="w-14 px-1.5 py-0.5 text-center font-bold text-blue-700 bg-blue-50/50 border border-blue-200 rounded focus:outline-none focus:border-blue-500 text-xs"
                            />
                          </td>
                        )}

                        {/* Level selector (T / H / C) */}
                        <td className="py-1.5 px-3 text-center">
                          <div className="inline-flex rounded border border-slate-200 bg-slate-50 p-0.5 space-x-0.5">
                            <button
                              type="button"
                              onClick={() => handleLevelChange(student.id, "T")}
                              className={`px-2 py-0.5 rounded text-[11px] font-bold transition cursor-pointer ${
                                entry.level === "T"
                                  ? "bg-emerald-600 text-white shadow-xs"
                                  : "text-slate-600 hover:text-emerald-700"
                              }`}
                              title="Hoàn thành tốt"
                            >
                              T
                            </button>
                            <button
                              type="button"
                              onClick={() => handleLevelChange(student.id, "H")}
                              className={`px-2 py-0.5 rounded text-[11px] font-bold transition cursor-pointer ${
                                entry.level === "H"
                                  ? "bg-blue-600 text-white shadow-xs"
                                  : "text-slate-600 hover:text-blue-700"
                              }`}
                              title="Hoàn thành"
                            >
                              H
                            </button>
                            <button
                              type="button"
                              onClick={() => handleLevelChange(student.id, "C")}
                              className={`px-2 py-0.5 rounded text-[11px] font-bold transition cursor-pointer ${
                                entry.level === "C"
                                  ? "bg-rose-600 text-white shadow-xs"
                                  : "text-slate-600 hover:text-rose-700"
                              }`}
                              title="Chưa hoàn thành"
                            >
                              C
                            </button>
                          </div>
                        </td>

                        {/* Regular comment */}
                        <td className="py-1.5 px-3">
                          <input
                            type="text"
                            placeholder="Nhận xét sự tiến bộ, ưu khuyết điểm..."
                            value={entry.comment || ""}
                            onChange={(e) => handleCommentChange(student.id, e.target.value)}
                            onBlur={handleSaveAll}
                            className="w-full px-2 py-1 text-xs rounded border border-slate-200 focus:outline-none focus:border-blue-500 bg-white"
                          />
                        </td>

                        {/* AI Comment Button */}
                        <td className="py-1.5 px-3 text-center">
                          <button
                            onClick={() => onOpenAIComment(student, selectedSubject.name, entry.score)}
                            className="p-1 rounded bg-teal-50 hover:bg-teal-100 text-teal-700 transition cursor-pointer border border-teal-200"
                            title="Tạo nhận xét AI cho môn này"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* Matrix View (All Subjects summary) */
        <div className="bg-white rounded-md border border-slate-200 shadow-xs p-3.5 overflow-hidden space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-tight">Bảng Tổng Hợp Điểm & Đánh Giá Toàn Diện</h3>
            <span className="text-[11px] text-slate-500">{termLabels[selectedTerm]}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3 text-center">STT</th>
                  <th className="py-2.5 px-3 min-w-[150px]">Họ và tên</th>
                  {GRADE_4_SUBJECTS.map((s) => (
                    <th key={s.id} className="py-2.5 px-2 text-center min-w-[65px]">
                      {s.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((student, idx) => (
                  <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2 px-3 text-center text-slate-400 font-mono text-[11px]">{idx + 1}</td>
                    <td className="py-2 px-3 font-bold text-slate-900">{student.fullName}</td>
                    {GRADE_4_SUBJECTS.map((s) => {
                      const entry = localGrades[s.id]?.[student.id];
                      return (
                        <td key={s.id} className="py-2 px-2 text-center">
                          {s.hasPeriodicScore ? (
                            <div>
                              <span className="font-bold text-blue-700 font-mono">
                                {entry?.score !== undefined ? entry.score : "-"}
                              </span>
                              <span className="text-[10px] text-slate-400 ml-0.5">
                                ({entry?.level || "T"})
                              </span>
                            </div>
                          ) : (
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              entry?.level === 'T' ? 'bg-emerald-100 text-emerald-800' : entry?.level === 'H' ? 'bg-blue-100 text-blue-800' : 'bg-rose-100 text-rose-800'
                            }`}>
                              {entry?.level || "T"}
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
