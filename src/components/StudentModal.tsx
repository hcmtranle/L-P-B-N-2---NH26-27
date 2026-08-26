import React, { useState, useEffect } from "react";
import { X, UserPlus, Save, AlertCircle } from "lucide-react";
import { Student, Gender, ClassPosition, StudentStatus } from "../types";

interface StudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (student: Student) => void;
  initialData?: Student | null;
  totalStudents: number;
}

export const StudentModal: React.FC<StudentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  totalStudents,
}) => {
  const [formData, setFormData] = useState<Partial<Student>>({
    code: `HS4${String(totalStudents + 1).padStart(2, "0")}`,
    fullName: "",
    gender: "Nam",
    dob: "2016-01-01",
    parentName: "",
    parentPhone: "",
    parentEmail: "",
    address: "Hà Nội",
    group: "Tổ 1",
    position: "Thành viên",
    status: "Đang học",
    healthNote: "Bình thường",
    strengths: "",
    weaknesses: "",
    rewardStars: 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        code: `HS4${String(totalStudents + 1).padStart(2, "0")}`,
        fullName: "",
        gender: "Nam",
        dob: "2016-01-01",
        parentName: "",
        parentPhone: "",
        parentEmail: "",
        address: "Hà Nội",
        group: "Tổ 1",
        position: "Thành viên",
        status: "Đang học",
        healthNote: "Bình thường",
        strengths: "",
        weaknesses: "",
        rewardStars: 0,
      });
    }
    setErrors({});
  }, [initialData, totalStudents, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.fullName?.trim()) {
      newErrors.fullName = "Vui lòng nhập họ và tên học sinh";
    }
    if (!formData.code?.trim()) {
      newErrors.code = "Vui lòng nhập mã học sinh";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const studentToSave: Student = {
      id: initialData?.id || `std_${Date.now()}`,
      code: formData.code || `HS400`,
      fullName: formData.fullName || "",
      gender: (formData.gender as Gender) || "Nam",
      dob: formData.dob || "2016-01-01",
      parentName: formData.parentName || "Chưa cập nhật",
      parentPhone: formData.parentPhone || "",
      parentEmail: formData.parentEmail || "",
      address: formData.address || "",
      group: formData.group || "Tổ 1",
      position: (formData.position as ClassPosition) || "Thành viên",
      status: (formData.status as StudentStatus) || "Đang học",
      healthNote: formData.healthNote || "",
      strengths: formData.strengths || "",
      weaknesses: formData.weaknesses || "",
      rewardStars: formData.rewardStars || 0,
      createdAt: initialData?.createdAt || new Date().toISOString().slice(0, 10),
    };

    onSave(studentToSave);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {initialData ? "Chỉnh sửa hồ sơ học sinh" : "Thêm học sinh mới vào Lớp 4"}
              </h3>
              <p className="text-xs text-slate-500">Thông tin cá nhân, liên hệ phụ huynh và đặc điểm học tập</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-sm flex-1">
          {/* Section: Thông tin học sinh */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
              1. Thông tin học sinh
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Mã học sinh *</label>
                <input
                  type="text"
                  value={formData.code || ""}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="Ví dụ: HS401"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                />
                {errors.code && <p className="text-xs text-rose-500 mt-1">{errors.code}</p>}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Họ và tên học sinh *</label>
                <input
                  type="text"
                  value={formData.fullName || ""}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Ví dụ: Nguyễn Minh An"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium"
                />
                {errors.fullName && <p className="text-xs text-rose-500 mt-1">{errors.fullName}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Giới tính</label>
                <select
                  value={formData.gender || "Nam"}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value as Gender })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                >
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Ngày sinh</label>
                <input
                  type="date"
                  value={formData.dob || "2016-01-01"}
                  onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tổ sinh hoạt</label>
                <select
                  value={formData.group || "Tổ 1"}
                  onChange={(e) => setFormData({ ...formData, group: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                >
                  <option value="Tổ 1">Tổ 1</option>
                  <option value="Tổ 2">Tổ 2</option>
                  <option value="Tổ 3">Tổ 3</option>
                  <option value="Tổ 4">Tổ 4</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Chức vụ trong lớp</label>
                <select
                  value={formData.position || "Thành viên"}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value as ClassPosition })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                >
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

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Trạng thái học</label>
                <select
                  value={formData.status || "Đang học"}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as StudentStatus })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                >
                  <option value="Đang học">Đang học</option>
                  <option value="Chuyển trường">Chuyển trường</option>
                  <option value="Nghỉ học">Nghỉ học</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Số sao / Hoa điểm 10</label>
                <input
                  type="number"
                  min="0"
                  value={formData.rewardStars || 0}
                  onChange={(e) => setFormData({ ...formData, rewardStars: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Section: Thông tin gia đình & liên hệ */}
          <div className="pt-2 border-t border-slate-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
              2. Thông tin Phụ huynh & Liên lạc
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Họ tên Phụ huynh</label>
                <input
                  type="text"
                  value={formData.parentName || ""}
                  onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                  placeholder="Ví dụ: Nguyễn Văn Hùng"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Số điện thoại (Zalo nhận tin)</label>
                <input
                  type="tel"
                  value={formData.parentPhone || ""}
                  onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                  placeholder="09xx xxx xxx"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Địa chỉ cư trú</label>
                <input
                  type="text"
                  value={formData.address || ""}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Số nhà, phố, phường, quận/huyện..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Section: Đặc điểm học tập & Sức khỏe */}
          <div className="pt-2 border-t border-slate-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
              3. Sức khỏe & Đặc điểm tâm lý
            </h4>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Lưu ý sức khỏe (Cận thị, dị ứng, thể trạng)</label>
                <input
                  type="text"
                  value={formData.healthNote || ""}
                  onChange={(e) => setFormData({ ...formData, healthNote: e.target.value })}
                  placeholder="Ví dụ: Cận thị 1.5 độ (ưu tiên bàn 1), dị ứng đậu phộng..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Điểm mạnh / Năng khiếu</label>
                  <textarea
                    rows={2}
                    value={formData.strengths || ""}
                    onChange={(e) => setFormData({ ...formData, strengths: e.target.value })}
                    placeholder="Tính toán nhanh, viết chữ đẹp, vẽ đẹp, tự tin..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Điểm cần rèn luyện thêm</label>
                  <textarea
                    rows={2}
                    value={formData.weaknesses || ""}
                    onChange={(e) => setFormData({ ...formData, weaknesses: e.target.value })}
                    placeholder="Cần tập trung nghe giảng, rèn chữ, tự tin phát biểu..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm resize-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-700 hover:bg-slate-100 font-medium transition cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center space-x-1.5 shadow-sm transition cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{initialData ? "Lưu thay đổi" : "Thêm học sinh"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
