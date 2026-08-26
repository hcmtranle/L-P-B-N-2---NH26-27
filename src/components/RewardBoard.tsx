import React, { useState } from "react";
import { 
  Award, 
  Star, 
  Sparkles, 
  Trophy, 
  Plus, 
  Smile, 
  Heart, 
  CheckCircle2,
  Users
} from "lucide-react";
import { Student, ClassInfo, RewardLog } from "../types";

interface RewardBoardProps {
  students: Student[];
  classInfo: ClassInfo;
  onAddStar: (studentId: string, amount: number, reason: string) => void;
}

export const RewardBoard: React.FC<RewardBoardProps> = ({
  students,
  classInfo,
  onAddStar,
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || "");
  const [starAmount, setStarAmount] = useState<number>(1);
  const [rewardReason, setRewardReason] = useState<string>("Phát biểu xây dựng bài xuất sắc");
  const [isAwardModalOpen, setIsAwardModalOpen] = useState(false);

  // Group statistics (Tổ 1, Tổ 2, Tổ 3, Tổ 4)
  const groupStats = ["Tổ 1", "Tổ 2", "Tổ 3", "Tổ 4"].map((groupName) => {
    const groupStudents = students.filter((s) => s.group === groupName);
    const totalStars = groupStudents.reduce((sum, s) => sum + (s.rewardStars || 0), 0);
    const avgStars = groupStudents.length > 0 ? (totalStars / groupStudents.length).toFixed(1) : "0";
    return {
      name: groupName,
      count: groupStudents.length,
      totalStars,
      avgStars,
      leader: groupStudents.find((s) => s.position === "Tổ trưởng")?.fullName || "Chưa có",
    };
  }).sort((a, b) => b.totalStars - a.totalStars);

  // Top individuals
  const topStudents = [...students].sort((a, b) => (b.rewardStars || 0) - (a.rewardStars || 0));

  const reasonsList = [
    "🌸 Bông hoa điểm 10 môn Toán / Tiếng Việt",
    "🙋 Tích cực hăng hái phát biểu xây dựng bài",
    "✍️ Vở sạch chữ đẹp, trình bày cẩn thận",
    "🤝 Giúp đỡ bạn cùng tiến trong giờ học",
    "🧹 Trực nhật lớp sạch sẽ, bảo vệ của công",
    "🌟 Đạt giải phong trào Sao Nhi Đồng / Thể thao"
  ];

  const handleGiveReward = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId) return;
    onAddStar(selectedStudentId, starAmount, rewardReason);
    setIsAwardModalOpen(false);
  };

  return (
    <div className="space-y-3.5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-3.5 rounded-md border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-sm font-bold uppercase tracking-tight text-slate-800">
              Bảng Thi Đua & Hoa Điểm 10 Lớp 4
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
              Phong trào Chăm Ngoan - Học Tốt
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Khích lệ tinh thần học tập, rèn luyện nề nếp và thi đua giữa các tổ trong lớp
          </p>
        </div>

        <button
          onClick={() => setIsAwardModalOpen(true)}
          className="px-3 py-1 rounded bg-amber-500 hover:bg-amber-600 text-white font-bold text-[11px] flex items-center gap-1 shadow-xs transition cursor-pointer self-start sm:self-auto"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Tặng Hoa Điểm 10 / Sao</span>
        </button>
      </div>

      {/* Group Leaderboard (Tổ Thi Đua) */}
      <div className="bg-white rounded-md border border-slate-200 shadow-xs p-3.5 space-y-3">
        <div className="flex items-center space-x-1.5">
          <Trophy className="w-4 h-4 text-amber-500" />
          <h3 className="font-bold text-slate-900 text-xs uppercase tracking-tight">Bảng Xếp Hạng Thi Đua Giữa Các Tổ</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {groupStats.map((group, idx) => (
            <div
              key={group.name}
              className={`p-2.5 rounded border relative overflow-hidden transition ${
                idx === 0
                  ? "bg-amber-50/60 border-amber-300"
                  : "bg-slate-50/70 border-slate-200"
              }`}
            >
              {idx === 0 && (
                <span className="absolute top-1.5 right-1.5 px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-400 text-white uppercase tracking-wider">
                  Dẫn đầu 🏆
                </span>
              )}

              <div className="flex items-center space-x-1.5">
                <span className={`w-5 h-5 rounded font-black text-[10px] flex items-center justify-center ${
                  idx === 0 ? "bg-amber-400 text-white" : "bg-slate-200 text-slate-700"
                }`}>
                  #{idx + 1}
                </span>
                <h4 className="font-bold text-slate-900 text-xs">{group.name}</h4>
              </div>

              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-xl font-black text-amber-600">{group.totalStars}</span>
                <span className="text-[10px] text-slate-500 font-medium">sao / hoa</span>
              </div>

              <div className="mt-1.5 text-[10px] text-slate-500 space-y-0.5 border-t border-slate-200/60 pt-1.5">
                <p>Sĩ số: <b>{group.count} em</b></p>
                <p>Tổ trưởng: <b>{group.leader}</b></p>
                <p>Trung bình: <b>{group.avgStars} ⭐/em</b></p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Individual Top Students Grid */}
      <div className="bg-white rounded-md border border-slate-200 shadow-xs p-3.5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5">
            <Award className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-tight">Gương Sáng Cá Nhân Tiêu Biểu</h3>
          </div>
          <span className="text-[10px] text-slate-400">Thời gian thực</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {topStudents.map((s, idx) => (
            <div
              key={s.id}
              className="p-2 rounded border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-amber-300 transition-colors flex items-center justify-between"
            >
              <div className="flex items-center space-x-2">
                <div className={`w-6 h-6 rounded flex items-center justify-center font-bold text-[10px] ${
                  idx < 3 ? "bg-amber-400 text-white" : "bg-white border border-slate-200 text-slate-700"
                }`}>
                  {idx + 1}
                </div>
                <div>
                  <p className="font-bold text-xs text-slate-900 truncate max-w-[120px]">{s.fullName}</p>
                  <p className="text-[10px] text-slate-400">{s.group} • {s.position}</p>
                </div>
              </div>

              <div className="flex items-center space-x-0.5 font-bold text-amber-600 text-[11px] bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                <span>{s.rewardStars || 0}</span>
                <span>⭐</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Award Modal */}
      {isAwardModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleGiveReward} className="bg-white rounded-md max-w-md w-full p-4 shadow-xl border border-slate-200 space-y-3">
            <div className="flex items-center space-x-1.5 text-amber-600 font-bold text-xs uppercase tracking-tight">
              <Sparkles className="w-4 h-4" />
              <h3>Tặng Bông Hoa Điểm 10 / Ngôi Sao Khen Ngợi</h3>
            </div>

            <div className="space-y-2.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1 text-[11px]">Chọn học sinh được khen ngợi</label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full p-1.5 rounded border border-slate-300 text-xs font-semibold text-slate-800 bg-white"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.code} - {s.fullName} ({s.group})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1 text-[11px]">Số sao / Hoa tặng (+)</label>
                <div className="flex space-x-1.5">
                  {[1, 2, 3, 5].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setStarAmount(amt)}
                      className={`flex-1 py-1 rounded border text-[11px] font-bold transition cursor-pointer ${
                        starAmount === amt
                          ? "bg-amber-500 text-white border-amber-500 shadow-xs"
                          : "border-slate-200 hover:bg-slate-50 text-slate-700 bg-white"
                      }`}
                    >
                      +{amt} ⭐
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1 text-[11px]">Lý do khen ngợi</label>
                <div className="space-y-1 mb-1.5">
                  {reasonsList.map((r, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setRewardReason(r)}
                      className={`w-full text-left p-1.5 rounded text-[11px] border transition cursor-pointer ${
                        rewardReason === r
                          ? "bg-amber-50 border-amber-300 text-amber-900 font-semibold"
                          : "border-slate-100 hover:bg-slate-50 text-slate-600 bg-white"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={rewardReason}
                  onChange={(e) => setRewardReason(e.target.value)}
                  placeholder="Hoặc nhập lý do khác..."
                  className="w-full p-1.5 rounded border border-slate-300 text-xs bg-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2.5 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsAwardModalOpen(false)}
                className="px-3 py-1 rounded text-slate-600 hover:bg-slate-100 font-semibold text-[11px] cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-3 py-1 rounded bg-amber-500 hover:bg-amber-600 text-white font-bold text-[11px] cursor-pointer shadow-xs"
              >
                Khen thưởng ngay
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
