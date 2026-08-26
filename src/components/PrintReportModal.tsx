import React, { useRef } from "react";
import { X, Printer, Download, Share2, Copy, Check } from "lucide-react";
import { Student, ClassInfo, StudentTermReport, TermType } from "../types";
import { GRADE_4_SUBJECTS } from "../data/mockData";

interface PrintReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student;
  classInfo: ClassInfo;
  term: TermType;
  report?: Partial<StudentTermReport>;
  grades: Record<string, { score?: number; level: string; comment?: string }>;
  attendanceSummary: { present: number; late: number; excused: number; unexcused: number; rate: number };
}

export const PrintReportModal: React.FC<PrintReportModalProps> = ({
  isOpen,
  onClose,
  student,
  classInfo,
  term,
  report,
  grades,
  attendanceSummary,
}) => {
  const [copied, setCopied] = React.useState(false);
  const printContentRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const termNames: Record<TermType, string> = {
    mid_term1: "GIỮA HỌC KỲ I",
    final_term1: "CUỐI HỌC KỲ I",
    mid_term2: "GIỮA HỌC KỲ II",
    final_term2: "CUỐI HỌC KỲ II (CẢ NĂM)",
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyMessage = () => {
    const text = `[PHIẾU LIÊN LẠC LỚP 4A - ${termNames[term]}]
Kính gửi Phụ huynh em: ${student.fullName} (Mã HS: ${student.code})
- Chuyên cần: Có mặt ${attendanceSummary.present} buổi (Đạt ${attendanceSummary.rate}%)
- Điểm kiểm tra định kỳ:
  + Toán: ${grades["math"]?.score !== undefined ? grades["math"].score : "Hoàn thành"}
  + Tiếng Việt: ${grades["vietnamese"]?.score !== undefined ? grades["vietnamese"].score : "Hoàn thành"}
  + Tiếng Anh: ${grades["english"]?.score !== undefined ? grades["english"].score : "Hoàn thành"}
- Nhận xét của GVCN: ${report?.teacherComment || "Em chăm ngoan, có ý thức học tập tốt."}
- Danh hiệu: ${report?.title || "Học sinh Tiêu biểu"}
- Lời nhắn gửi: ${report?.parentAdvice || "Kính mong phụ huynh tiếp tục động viên con."}

GVCN: ${classInfo.teacherName} (SĐT: ${classInfo.teacherPhone})`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto print:p-0 print:bg-white">
      <div className="bg-white rounded-md max-w-3xl w-full max-h-[95vh] flex flex-col shadow-xl border border-slate-200 print:border-none print:shadow-none print:max-w-none print:max-h-none">
        {/* Header - Hidden on Print */}
        <div className="flex items-center justify-between p-2.5 border-b border-slate-200 print:hidden">
          <div className="flex items-center space-x-1.5">
            <Printer className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-tight">
              Phiếu Liên Lạc Học Sinh - Khổ A4 Chuẩn
            </h3>
          </div>

          <div className="flex items-center space-x-1.5">
            <button
              onClick={handleCopyMessage}
              className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
              title="Sao chép tin nhắn gửi Zalo/SMS cho Phụ huynh"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? "Đã chép!" : "Copy gửi Zalo"}</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold flex items-center gap-1 shadow-xs cursor-pointer"
            >
              <Printer className="w-3 h-3" />
              <span>In Phiếu A4</span>
            </button>

            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Paper Body */}
        <div
          ref={printContentRef}
          className="p-6 sm:p-10 overflow-y-auto text-slate-900 font-serif leading-relaxed text-xs sm:text-sm print:p-6 print:overflow-visible"
        >
          {/* Header Quốc hiệu & Trường */}
          <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4 mb-5">
            <div>
              <p className="font-bold uppercase tracking-wider text-[11px] text-slate-600">{classInfo.school}</p>
              <p className="font-extrabold text-sm sm:text-base text-slate-900 uppercase">
                {classInfo.name} - KHỐI 4
              </p>
              <p className="text-[11px] text-slate-600">Năm học: {classInfo.academicYear}</p>
            </div>

            <div className="text-right">
              <p className="font-bold uppercase text-[11px] tracking-wider text-slate-900">
                CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
              </p>
              <p className="text-[11px] italic font-normal text-slate-700">Độc lập - Tự do - Hạnh phúc</p>
            </div>
          </div>

          {/* Title */}
          <div className="text-center my-4">
            <h1 className="text-lg sm:text-xl font-black uppercase tracking-wide text-slate-900">
              PHIẾU LIÊN LẠC & BÁO CÁO KẾT QUẢ RÈN LUYỆN
            </h1>
            <p className="font-bold text-emerald-800 text-xs sm:text-sm mt-1 uppercase">
              {termNames[term]}
            </p>
          </div>

          {/* Student Info Box */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-slate-50/80 p-3 rounded-lg border border-slate-300 text-xs mb-5 font-sans">
            <div>
              <span className="text-slate-500">Họ và tên:</span>{" "}
              <b className="text-slate-900 font-bold uppercase">{student.fullName}</b>
            </div>
            <div>
              <span className="text-slate-500">Mã HS:</span>{" "}
              <b className="text-slate-900">{student.code}</b>
            </div>
            <div>
              <span className="text-slate-500">Giới tính:</span>{" "}
              <b className="text-slate-900">{student.gender}</b>
            </div>
            <div>
              <span className="text-slate-500">Ngày sinh:</span>{" "}
              <b className="text-slate-900">{student.dob}</b>
            </div>
            <div>
              <span className="text-slate-500">Tổ:</span>{" "}
              <b className="text-slate-900">{student.group}</b>
            </div>
            <div>
              <span className="text-slate-500">Chức vụ:</span>{" "}
              <b className="text-slate-900">{student.position}</b>
            </div>
            <div className="sm:col-span-2">
              <span className="text-slate-500">Phụ huynh:</span>{" "}
              <b className="text-slate-900">{student.parentName}</b> (SĐT: {student.parentPhone})
            </div>
            <div>
              <span className="text-slate-500">Chuyên cần:</span>{" "}
              <b className="text-emerald-700">{attendanceSummary.rate}% (Vắng {attendanceSummary.excused + attendanceSummary.unexcused} buổi)</b>
            </div>
          </div>

          {/* Subject Grades Table */}
          <div className="mb-5">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800 mb-2 font-sans">
              I. KẾT QUẢ ĐÁNH GIÁ CÁC MÔN HỌC & HOẠT ĐỘNG GIÁO DỤC (Thông tư 27)
            </h4>
            <table className="w-full border-collapse border border-slate-400 text-xs text-center font-sans">
              <thead className="bg-slate-100 text-slate-800 font-bold">
                <tr>
                  <th className="border border-slate-400 py-1.5 px-2 w-10">STT</th>
                  <th className="border border-slate-400 py-1.5 px-3 text-left">Môn học / Hoạt động</th>
                  <th className="border border-slate-400 py-1.5 px-2 w-20">Điểm KTĐK</th>
                  <th className="border border-slate-400 py-1.5 px-2 w-24">Mức đạt được</th>
                  <th className="border border-slate-400 py-1.5 px-3 text-left">Nhận xét của Giáo viên</th>
                </tr>
              </thead>
              <tbody>
                {GRADE_4_SUBJECTS.map((subj, idx) => {
                  const entry = grades[subj.id];
                  return (
                    <tr key={subj.id} className="border-b border-slate-300">
                      <td className="border border-slate-400 py-1 px-2">{idx + 1}</td>
                      <td className="border border-slate-400 py-1 px-3 text-left font-medium">{subj.name}</td>
                      <td className="border border-slate-400 py-1 px-2 font-bold">
                        {subj.hasPeriodicScore ? (entry?.score !== undefined ? entry.score : "-") : "ĐG bằng NX"}
                      </td>
                      <td className="border border-slate-400 py-1 px-2 font-bold">
                        {entry?.level === "T" ? "Tốt (T)" : entry?.level === "H" ? "Hoàn thành (H)" : "Cần rèn (C)"}
                      </td>
                      <td className="border border-slate-400 py-1 px-3 text-left text-[11px]">
                        {entry?.comment || "Hoàn thành tốt nhiệm vụ học tập môn học."}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Competencies and Qualities */}
          <div className="mb-5 font-sans">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800 mb-2">
              II. ĐÁNH GIÁ SỰ HÌNH THÀNH VÀ PHÁT TRIỂN NĂNG LỰC, PHẨM CHẤT
            </h4>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="border border-slate-300 rounded-lg p-2.5 bg-slate-50/50">
                <p className="font-bold text-emerald-800 mb-1.5">1. Năng lực (Chung & Đặc thù):</p>
                <ul className="space-y-1 text-[11px] text-slate-700">
                  <li>• Tự chủ và tự học: <b>{report?.competencies?.selfControl === "T" ? "Tốt" : "Đạt"}</b></li>
                  <li>• Giao tiếp và hợp tác: <b>{report?.competencies?.communication === "T" ? "Tốt" : "Đạt"}</b></li>
                  <li>• Giải quyết vấn đề sáng tạo: <b>{report?.competencies?.problemSolving === "T" ? "Tốt" : "Đạt"}</b></li>
                  <li>• Ngôn ngữ & Tính toán: <b>{report?.competencies?.math === "T" ? "Tốt" : "Đạt"}</b></li>
                </ul>
              </div>

              <div className="border border-slate-300 rounded-lg p-2.5 bg-slate-50/50">
                <p className="font-bold text-emerald-800 mb-1.5">2. Phẩm chất chủ yếu:</p>
                <ul className="space-y-1 text-[11px] text-slate-700">
                  <li>• Yêu nước & Nhân ái: <b>Tốt</b></li>
                  <li>• Chăm chỉ & Trung thực: <b>{report?.qualities?.diligence === "T" ? "Tốt" : "Đạt"}</b></li>
                  <li>• Trách nhiệm với việc chung: <b>{report?.qualities?.responsibility === "T" ? "Tốt" : "Đạt"}</b></li>
                  <li>• Số sao / Hoa điểm 10 đạt được: <b className="text-amber-600">{student.rewardStars || 0} ⭐</b></li>
                </ul>
              </div>
            </div>
          </div>

          {/* Teacher Comment Box */}
          <div className="border border-slate-400 rounded-lg p-3.5 mb-5 bg-white font-sans text-xs">
            <h4 className="font-bold text-slate-900 uppercase text-xs mb-1">
              III. NHẬN XÉT CHUNG CỦA GIÁO VIÊN CHỦ NHIỆM
            </h4>
            <p className="text-slate-800 leading-relaxed italic text-[12px]">
              "{report?.teacherComment || "Em có ý thức học tập và rèn luyện rất tốt, lễ phép với thầy cô, chan hòa với bạn bè. Đề nghị gia đình tiếp tục khích lệ và đồng hành cùng em trong học kỳ tiếp theo."}"
            </p>

            <div className="mt-2 pt-2 border-t border-slate-200 flex items-center justify-between text-xs font-bold">
              <span>DANH HIỆU ĐẠT ĐƯỢC:</span>
              <span className="text-emerald-800 uppercase px-2 py-0.5 bg-emerald-50 border border-emerald-300 rounded">
                {report?.title || "Học sinh Tiêu biểu hoàn thành tốt"}
              </span>
            </div>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 text-center pt-4 font-sans text-xs">
            <div>
              <p className="font-bold text-slate-800">Ý KIẾN CỦA PHỤ HUYNH HỌC SINH</p>
              <p className="text-[10px] text-slate-500 italic">(Ký và ghi rõ họ tên)</p>
              <div className="h-16"></div>
            </div>

            <div>
              <p className="text-slate-600 text-[11px] italic">Hà Nội, ngày ..... tháng ..... năm 2026</p>
              <p className="font-bold text-slate-900 mt-0.5">GIÁO VIÊN CHỦ NHIỆM</p>
              <div className="h-16 flex items-center justify-center">
                <span className="italic text-emerald-800 font-serif text-sm font-semibold">{classInfo.teacherName}</span>
              </div>
              <p className="font-bold text-slate-900">{classInfo.teacherName}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
