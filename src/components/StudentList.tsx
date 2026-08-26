import React, { useState, useRef } from "react";
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  Download, 
  Upload, 
  Edit2, 
  Trash2, 
  Star, 
  Phone, 
  MapPin, 
  HeartHandshake, 
  Sparkles,
  FileSpreadsheet,
  Check,
  Eye,
  Plus,
  Minus
} from "lucide-react";
import { Student, ClassInfo } from "../types";
import { exportStudentsToExcel, downloadStudentTemplate, parseStudentsFromExcel } from "../utils/excel";

interface StudentListProps {
  students: Student[];
  classInfo: ClassInfo;
  onAddStudent: () => void;
  onEditStudent: (student: Student) => void;
  onDeleteStudent: (id: string) => void;
  onUpdateStars: (id: string, delta: number) => void;
  onImportStudents: (newStudents: Partial<Student>[]) => void;
  onOpenAIForStudent: (student: Student) => void;
  onViewReport: (student: Student) => void;
}

export const StudentList: React.FC<StudentListProps> = ({
  students,
  classInfo,
  onAddStudent,
  onEditStudent,
  onDeleteStudent,
  onUpdateStars,
  onImportStudents,
  onOpenAIForStudent,
  onViewReport,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [groupFilter, setGroupFilter] = useState("all");
  const [genderFilter, setGenderFilter] = useState("all");
  const [positionFilter, setPositionFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"cards" | "table">("table");
  const [selectedStudentDetail, setSelectedStudentDetail] = useState<Student | null>(null);

  // Import Modal State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importPreview, setImportPreview] = useState<Partial<Student>[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter students
  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.parentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.parentPhone.includes(searchTerm);

    const matchesGroup = groupFilter === "all" || s.group === groupFilter;
    const matchesGender = genderFilter === "all" || s.gender === genderFilter;
    const matchesPosition = positionFilter === "all" || s.position === positionFilter;

    return matchesSearch && matchesGroup && matchesGender && matchesPosition;
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsParsing(true);
    try {
      const parsed = await parseStudentsFromExcel(file);
      setImportPreview(parsed);
    } catch (err) {
      alert("Không thể đọc file Excel. Vui lòng kiểm tra lại định dạng file.");
    } finally {
      setIsParsing(false);
    }
  };

  const handleConfirmImport = () => {
    if (importPreview.length === 0) return;
    onImportStudents(importPreview);
    setIsImportModalOpen(false);
    setImportPreview([]);
  };

  return (
    <div className="space-y-3.5">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-3.5 rounded-md border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-sm font-bold uppercase tracking-tight text-slate-800">
              Danh sách Học sinh {classInfo.name}
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
              {students.length} học sinh
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Quản lý hồ sơ, phụ huynh, sức khỏe và điểm thi đua lớp 4
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex bg-slate-100 p-0.5 rounded border border-slate-200 text-xs">
            <button
              onClick={() => setViewMode("table")}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold transition cursor-pointer ${
                viewMode === "table" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Dạng bảng
            </button>
            <button
              onClick={() => setViewMode("cards")}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold transition cursor-pointer ${
                viewMode === "cards" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Thẻ học sinh
            </button>
          </div>

          {/* Excel Actions */}
          <button
            id="btn-export-students-excel"
            onClick={() => exportStudentsToExcel(students, classInfo.name)}
            className="px-2.5 py-1 rounded border border-slate-200 hover:bg-slate-50 text-slate-700 text-[11px] font-medium flex items-center gap-1 transition cursor-pointer bg-white"
            title="Xuất toàn bộ danh sách ra file Excel (.xlsx)"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Xuất Excel</span>
          </button>

          <button
            id="btn-import-students-excel"
            onClick={() => setIsImportModalOpen(true)}
            className="px-2.5 py-1 rounded border border-slate-200 hover:bg-slate-50 text-slate-700 text-[11px] font-medium flex items-center gap-1 transition cursor-pointer bg-white"
            title="Nhập danh sách từ file Excel"
          >
            <Upload className="w-3.5 h-3.5 text-slate-500" />
            <span>Nhập Excel</span>
          </button>

          {/* Add Student Button */}
          <button
            id="btn-add-student"
            onClick={onAddStudent}
            className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold flex items-center gap-1 shadow-xs transition cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>+ Thêm học sinh</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3 rounded-md border border-slate-200 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          {/* Search Input */}
          <div className="lg:col-span-2 relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm họ tên, mã HS, phụ huynh, SĐT..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded border border-slate-200 focus:outline-none focus:border-blue-500 text-xs bg-white text-slate-800"
            />
          </div>

          {/* Group Filter */}
          <div>
            <select
              value={groupFilter}
              onChange={(e) => setGroupFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded border border-slate-200 focus:outline-none focus:border-blue-500 text-xs bg-white text-slate-700"
            >
              <option value="all">Tất cả các tổ</option>
              <option value="Tổ 1">Tổ 1</option>
              <option value="Tổ 2">Tổ 2</option>
              <option value="Tổ 3">Tổ 3</option>
              <option value="Tổ 4">Tổ 4</option>
            </select>
          </div>

          {/* Position Filter */}
          <div>
            <select
              value={positionFilter}
              onChange={(e) => setPositionFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded border border-slate-200 focus:outline-none focus:border-blue-500 text-xs bg-white text-slate-700"
            >
              <option value="all">Tất cả chức vụ</option>
              <option value="Lớp trưởng">Lớp trưởng</option>
              <option value="Lớp phó học tập">Lớp phó học tập</option>
              <option value="Lớp phó lao động">Lớp phó lao động</option>
              <option value="Lớp phó văn thể">Lớp phó văn thể</option>
              <option value="Tổ trưởng">Tổ trưởng</option>
              <option value="Tổ phó">Tổ phó</option>
              <option value="Cờ đỏ">Cờ đỏ</option>
              <option value="Thành viên">Thành viên</option>
            </select>
          </div>

          {/* Gender Filter */}
          <div>
            <select
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded border border-slate-200 focus:outline-none focus:border-blue-500 text-xs bg-white text-slate-700"
            >
              <option value="all">Tất cả giới tính</option>
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
            </select>
          </div>
        </div>
      </div>

      {/* Student List View */}
      {filteredStudents.length === 0 ? (
        <div className="bg-white rounded-md border border-slate-200 p-12 text-center">
          <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-slate-600 font-semibold text-xs">Không tìm thấy học sinh nào phù hợp</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Thử thay đổi từ khóa tìm kiếm hoặc bỏ bộ lọc</p>
        </div>
      ) : viewMode === "table" ? (
        /* High Density Table View */
        <div className="bg-white border border-slate-200 rounded-md overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="p-2.5 w-12 text-center">STT</th>
                  <th className="p-2.5">Mã HS</th>
                  <th className="p-2.5">Họ và Tên</th>
                  <th className="p-2.5 text-center">Giới tính</th>
                  <th className="p-2.5 text-center">Tổ</th>
                  <th className="p-2.5 text-center">Chức vụ</th>
                  <th className="p-2.5">Phụ huynh & SĐT</th>
                  <th className="p-2.5 text-center">Sao thi đua</th>
                  <th className="p-2.5 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="text-xs divide-y divide-slate-100">
                {filteredStudents.map((student, idx) => (
                  <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-2.5 text-center font-mono text-slate-400 text-[11px]">
                      {idx + 1}
                    </td>
                    <td className="p-2.5 font-mono font-medium text-slate-700 text-[11px]">
                      {student.code}
                    </td>
                    <td className="p-2.5">
                      <div 
                        onClick={() => setSelectedStudentDetail(student)}
                        className="font-bold text-slate-900 hover:text-blue-600 cursor-pointer"
                      >
                        {student.fullName}
                      </div>
                      {student.healthNote && student.healthNote !== "Không có" && student.healthNote !== "Bình thường" && (
                        <div className="text-[10px] text-red-600 font-medium truncate max-w-xs">
                          ⚠️ {student.healthNote}
                        </div>
                      )}
                    </td>
                    <td className="p-2.5 text-center">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                        student.gender === 'Nam' ? 'bg-blue-50 text-blue-700' : 'bg-rose-50 text-rose-700'
                      }`}>
                        {student.gender}
                      </span>
                    </td>
                    <td className="p-2.5 text-center text-slate-600 font-medium text-[11px]">
                      {student.group}
                    </td>
                    <td className="p-2.5 text-center">
                      <span className="text-[10px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                        {student.position}
                      </span>
                    </td>
                    <td className="p-2.5">
                      <div className="text-slate-800 text-[11px] font-medium">{student.parentName}</div>
                      <a href={`tel:${student.parentPhone}`} className="text-[10px] text-blue-600 hover:underline">
                        {student.parentPhone}
                      </a>
                    </td>
                    <td className="p-2.5 text-center">
                      <div className="inline-flex items-center gap-1 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                        <button
                          onClick={() => onUpdateStars(student.id, 1)}
                          className="text-amber-500 hover:scale-125 transition cursor-pointer text-xs"
                          title="+1 sao"
                        >
                          ⭐
                        </button>
                        <span className="font-bold text-amber-800 text-xs">{student.rewardStars || 0}</span>
                      </div>
                    </td>
                    <td className="p-2.5 text-right space-x-1 whitespace-nowrap">
                      <button
                        onClick={() => setSelectedStudentDetail(student)}
                        className="p-1 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
                        title="Xem chi tiết"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onEditStudent(student)}
                        className="p-1 rounded text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition cursor-pointer"
                        title="Chỉnh sửa"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onOpenAIForStudent(student)}
                        className="p-1 rounded text-blue-600 hover:bg-blue-50 transition cursor-pointer"
                        title="Nhận xét AI"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteStudent(student.id)}
                        className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                        title="Xóa"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-2.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-[11px] text-slate-500">
            <span>Hiển thị {filteredStudents.length} / {students.length} học sinh</span>
            <span>Trạng thái: Hoạt động bình thường</span>
          </div>
        </div>
      ) : (
        /* High Density Cards View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredStudents.map((student) => (
            <div
              key={student.id}
              className="bg-white rounded-md border border-slate-200 p-3.5 shadow-xs hover:border-blue-400 hover:shadow-sm transition flex flex-col justify-between"
            >
              <div>
                {/* Card Header: Avatar, Name, Position */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className={`w-9 h-9 rounded-md flex items-center justify-center font-bold text-xs text-white shadow-xs ${
                      student.gender === 'Nam' ? 'bg-blue-600' : 'bg-rose-500'
                    }`}>
                      {student.fullName.split(' ').pop()?.slice(0, 2) || "HS"}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-bold text-slate-900 text-xs hover:text-blue-600 cursor-pointer" onClick={() => setSelectedStudentDetail(student)}>
                          {student.fullName}
                        </h3>
                        <span className={`text-[9px] px-1 py-0.2 rounded font-semibold ${
                          student.gender === 'Nam' ? 'bg-blue-50 text-blue-700' : 'bg-rose-50 text-rose-700'
                        }`}>
                          {student.gender}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1.5">
                        <span className="font-mono text-slate-700 font-semibold">{student.code}</span>
                        <span>•</span>
                        <span>{student.group}</span>
                        <span>•</span>
                        <span className="text-amber-700 font-medium">{student.position}</span>
                      </p>
                    </div>
                  </div>

                  {/* Star Counter */}
                  <div className="flex items-center bg-amber-50 border border-amber-200 rounded px-1.5 py-0.5 gap-1">
                    <button
                      onClick={() => onUpdateStars(student.id, 1)}
                      title="Tặng 1 sao khen ngợi"
                      className="text-amber-500 hover:scale-125 transition cursor-pointer text-xs"
                    >
                      ⭐
                    </button>
                    <span className="text-xs font-bold text-amber-800">{student.rewardStars || 0}</span>
                  </div>
                </div>

                {/* Key Details */}
                <div className="mt-3 space-y-1 text-xs text-slate-600 bg-slate-50 p-2 rounded border border-slate-100">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Phụ huynh:</span>
                    <span className="font-medium text-slate-800">{student.parentName}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">SĐT / Zalo:</span>
                    <a href={`tel:${student.parentPhone}`} className="font-medium text-blue-600 hover:underline">
                      {student.parentPhone}
                    </a>
                  </div>
                  {student.healthNote && student.healthNote !== "Không có" && student.healthNote !== "Bình thường" && (
                    <div className="text-[10px] text-red-700 bg-red-50 p-1 rounded border border-red-100 font-medium">
                      ⚠️ Sức khỏe: {student.healthNote}
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => setSelectedStudentDetail(student)}
                    className="p-1 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
                    title="Xem hồ sơ chi tiết"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onEditStudent(student)}
                    className="p-1 rounded text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition cursor-pointer"
                    title="Chỉnh sửa thông tin"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDeleteStudent(student.id)}
                    className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                    title="Xóa học sinh"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => onViewReport(student)}
                    className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold transition cursor-pointer"
                  >
                    Sổ liên lạc
                  </button>
                  <button
                    onClick={() => onOpenAIForStudent(student)}
                    className="px-2 py-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-semibold flex items-center gap-1 transition cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3 text-blue-600" />
                    <span>AI</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Student Detail Modal */}
      {selectedStudentDetail && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-md max-w-lg w-full p-5 shadow-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-10 h-10 rounded bg-blue-600 text-white font-bold flex items-center justify-center text-sm">
                  {selectedStudentDetail.fullName.split(' ').pop()?.slice(0, 2)}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{selectedStudentDetail.fullName}</h3>
                  <p className="text-[11px] text-slate-500">{selectedStudentDetail.code} • {selectedStudentDetail.gender} • Sinh ngày: {selectedStudentDetail.dob}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedStudentDetail(null)}
                className="p-1 text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5 text-xs text-slate-700">
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded border border-slate-200">
                <div>
                  <span className="text-slate-400 block text-[10px]">Tổ sinh hoạt:</span>
                  <span className="font-semibold text-slate-900">{selectedStudentDetail.group}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Chức vụ:</span>
                  <span className="font-semibold text-slate-900">{selectedStudentDetail.position}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Trạng thái:</span>
                  <span className="font-semibold text-emerald-700">{selectedStudentDetail.status}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Hoa điểm 10:</span>
                  <span className="font-bold text-amber-600">{selectedStudentDetail.rewardStars} ⭐</span>
                </div>
              </div>

              <div className="p-2.5 rounded border border-slate-200 space-y-1 bg-white">
                <p className="font-bold text-slate-900 text-[11px]">Thông tin Phụ huynh</p>
                <p className="text-[11px]"><b>Họ tên:</b> {selectedStudentDetail.parentName}</p>
                <p className="text-[11px]"><b>Số điện thoại:</b> {selectedStudentDetail.parentPhone}</p>
                <p className="text-[11px]"><b>Địa chỉ:</b> {selectedStudentDetail.address}</p>
              </div>

              <div className="p-2.5 rounded border border-slate-200 space-y-1 bg-blue-50/30">
                <p className="font-bold text-slate-900 text-[11px]">Đặc điểm học sinh</p>
                <p className="text-[11px]"><b>Lưu ý sức khỏe:</b> {selectedStudentDetail.healthNote || "Bình thường"}</p>
                <p className="text-[11px]"><b>Ưu điểm / Năng khiếu:</b> {selectedStudentDetail.strengths || "Chăm chỉ, ngoan ngoãn"}</p>
                <p className="text-[11px]"><b>Cần rèn luyện:</b> {selectedStudentDetail.weaknesses || "Chưa có lưu ý đặc biệt"}</p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2.5 border-t border-slate-100">
              <button
                onClick={() => {
                  const s = selectedStudentDetail;
                  setSelectedStudentDetail(null);
                  onEditStudent(s);
                }}
                className="px-3 py-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs cursor-pointer"
              >
                Chỉnh sửa
              </button>
              <button
                onClick={() => {
                  const s = selectedStudentDetail;
                  setSelectedStudentDetail(null);
                  onViewReport(s);
                }}
                className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs cursor-pointer"
              >
                Mở Sổ liên lạc
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-md max-w-xl w-full p-5 shadow-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <div className="flex items-center space-x-2">
                <FileSpreadsheet className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-xs">Nhập danh sách học sinh từ Excel</h3>
              </div>
              <button
                onClick={() => {
                  setIsImportModalOpen(false);
                  setImportPreview([]);
                }}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5 text-xs text-slate-600">
              <p>
                Thầy/Cô có thể tải file Excel mẫu chuẩn rồi điền danh sách học sinh, sau đó tải lên để nhập hàng loạt:
              </p>

              <button
                onClick={downloadStudentTemplate}
                className="px-3 py-1.5 rounded bg-blue-50 text-blue-800 border border-blue-200 font-semibold hover:bg-blue-100 flex items-center gap-1.5 cursor-pointer text-xs"
              >
                <Download className="w-3.5 h-3.5" />
                Tải file Excel mẫu (.xlsx)
              </button>

              <div className="border-2 border-dashed border-slate-300 rounded p-4 text-center hover:border-blue-500 transition cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                <p className="font-semibold text-slate-700 text-xs">Bấm vào đây để chọn file Excel</p>
                <p className="text-slate-400 text-[10px] mt-0.5">Hỗ trợ định dạng .xlsx, .xls</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx, .xls"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              {isParsing && <p className="text-center text-blue-600 font-medium">Đang đọc file Excel...</p>}

              {importPreview.length > 0 && (
                <div className="p-2.5 bg-slate-50 rounded border border-slate-200 max-h-36 overflow-y-auto">
                  <p className="font-bold text-slate-900 mb-1 text-xs">
                    Đã nhận diện {importPreview.length} học sinh:
                  </p>
                  <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-600">
                    {importPreview.slice(0, 5).map((s, idx) => (
                      <li key={idx}>
                        {s.code} - {s.fullName} ({s.gender}) - Phụ huynh: {s.parentName}
                      </li>
                    ))}
                    {importPreview.length > 5 && <li>...và {importPreview.length - 5} học sinh khác</li>}
                  </ul>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2.5 border-t border-slate-100">
              <button
                onClick={() => {
                  setIsImportModalOpen(false);
                  setImportPreview([]);
                }}
                className="px-3 py-1.5 rounded text-slate-600 hover:bg-slate-100 font-medium text-xs cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                disabled={importPreview.length === 0}
                onClick={handleConfirmImport}
                className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1 cursor-pointer shadow-xs"
              >
                <Check className="w-3.5 h-3.5" />
                Nhập {importPreview.length} học sinh
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
