import React, { useState } from "react";
import { X, Settings, Save, RefreshCw, Trash2, Cloud, Database, Check } from "lucide-react";
import { ClassInfo } from "../types";

interface ClassSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  classInfo: ClassInfo;
  onSaveClassInfo: (updated: ClassInfo) => void;
  onResetToSampleData: () => void;
  onClearAllData: () => void;
  isSynced: boolean;
  onSyncNow: () => void;
  isSyncing: boolean;
}

export const ClassSettingsModal: React.FC<ClassSettingsModalProps> = ({
  isOpen,
  onClose,
  classInfo,
  onSaveClassInfo,
  onResetToSampleData,
  onClearAllData,
  isSynced,
  onSyncNow,
  isSyncing,
}) => {
  const [formData, setFormData] = useState<ClassInfo>(classInfo);
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveClassInfo(formData);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Cài Đặt Thông Tin Lớp Học</h3>
              <p className="text-xs text-slate-500">Thông tin trường, lớp, giáo viên chủ nhiệm và đồng bộ</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tên lớp học *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ví dụ: Lớp 4A"
                className="w-full p-2.5 rounded-lg border border-slate-300 font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Niên khóa *</label>
              <input
                type="text"
                required
                value={formData.academicYear}
                onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                placeholder="Ví dụ: 2025 - 2026"
                className="w-full p-2.5 rounded-lg border border-slate-300"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Trường Tiểu học *</label>
              <input
                type="text"
                required
                value={formData.school}
                onChange={(e) => setFormData({ ...formData, school: e.target.value })}
                placeholder="Ví dụ: Trường Tiểu học Chu Văn An"
                className="w-full p-2.5 rounded-lg border border-slate-300 font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Họ tên Giáo viên chủ nhiệm *</label>
              <input
                type="text"
                required
                value={formData.teacherName}
                onChange={(e) => setFormData({ ...formData, teacherName: e.target.value })}
                placeholder="Ví dụ: Cô Lê Mai Trang"
                className="w-full p-2.5 rounded-lg border border-slate-300 font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Số điện thoại GVCN</label>
              <input
                type="tel"
                value={formData.teacherPhone}
                onChange={(e) => setFormData({ ...formData, teacherPhone: e.target.value })}
                placeholder="09xx xxx xxx"
                className="w-full p-2.5 rounded-lg border border-slate-300"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Phòng học</label>
              <input
                type="text"
                value={formData.room}
                onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                placeholder="Ví dụ: Phòng 402 - Tầng 4"
                className="w-full p-2.5 rounded-lg border border-slate-300"
              />
            </div>
          </div>

          {/* Cloud Sync Status */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Cloud className="w-4 h-4 text-emerald-600" />
                <span className="font-bold text-slate-900">Lưu trữ đám mây Firebase</span>
              </div>
              <button
                type="button"
                onClick={onSyncNow}
                disabled={isSyncing}
                className="px-3 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 font-semibold hover:bg-slate-100 flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin text-blue-600" : ""}`} />
                <span>{isSyncing ? "Đang lưu..." : "Đồng bộ ngay"}</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-500">
              Dữ liệu được lưu trữ trực tuyến an toàn, cho phép bạn đăng nhập và truy cập từ bất kỳ máy tính, máy tính bảng hay điện thoại nào.
            </p>
          </div>

          {/* Data Reset Tools */}
          <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200 space-y-2">
            <span className="font-bold text-amber-900 block">Dữ liệu mẫu & Bắt đầu lại</span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  if (confirm("Khôi phục lại dữ liệu mẫu Lớp 4A với 12 học sinh, thời khóa biểu và bảng điểm chuẩn?")) {
                    onResetToSampleData();
                    onClose();
                  }
                }}
                className="px-3 py-1.5 rounded-lg bg-white border border-amber-300 text-amber-800 font-semibold hover:bg-amber-100 cursor-pointer"
              >
                Khôi phục dữ liệu mẫu Lớp 4
              </button>

              <button
                type="button"
                onClick={() => {
                  if (confirm("Bạn có chắc chắn muốn xóa toàn bộ danh sách học sinh để bắt đầu nhập lớp mới từ đầu?")) {
                    onClearAllData();
                    onClose();
                  }
                }}
                className="px-3 py-1.5 rounded-lg bg-white border border-rose-300 text-rose-700 font-semibold hover:bg-rose-50 cursor-pointer"
              >
                Xóa sạch để tạo lớp mới
              </button>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer"
            >
              Đóng
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              {isSaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4 text-white" />}
              <span>{isSaved ? "Đã lưu!" : "Lưu cài đặt"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
