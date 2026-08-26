import React, { useState } from "react";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Plus, 
  Edit2, 
  Trash2, 
  CheckCircle2, 
  MapPin, 
  User, 
  Sparkles,
  AlertCircle
} from "lucide-react";
import { WeeklyTimetable, TimetableDay, TimetableSlot, ClassEvent, ClassInfo } from "../types";
import { GRADE_4_SUBJECTS } from "../data/mockData";

interface TimetableManagerProps {
  classInfo: ClassInfo;
  timetable: WeeklyTimetable;
  events: ClassEvent[];
  onSaveTimetable: (updatedTimetable: WeeklyTimetable) => void;
  onAddEvent: (event: ClassEvent) => void;
  onDeleteEvent: (id: string) => void;
}

export const TimetableManager: React.FC<TimetableManagerProps> = ({
  classInfo,
  timetable,
  events,
  onSaveTimetable,
  onAddEvent,
  onDeleteEvent,
}) => {
  const [activeDay, setActiveDay] = useState<number>(1); // 1: Thứ 2 ... 5: Thứ 6
  const [editingSlot, setEditingSlot] = useState<{ dayOfWeek: number; isMorning: boolean; slot: TimetableSlot } | null>(null);
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);

  // New Event Form State
  const [eventTitle, setEventTitle] = useState("");
  const [eventDate, setEventDate] = useState(new Date().toISOString().slice(0, 10));
  const [eventTime, setEventTime] = useState("07:30");
  const [eventType, setEventType] = useState<ClassEvent["type"]>("exam");
  const [eventDesc, setEventDesc] = useState("");

  const daysList = [
    { key: 1, label: "Thứ Hai" },
    { key: 2, label: "Thứ Ba" },
    { key: 3, label: "Thứ Tư" },
    { key: 4, label: "Thứ Năm" },
    { key: 5, label: "Thứ Sáu" },
  ];

  const currentDayData: TimetableDay = timetable.days?.[activeDay] || {
    dayOfWeek: activeDay,
    dayName: daysList.find((d) => d.key === activeDay)?.label || "Thứ Hai",
    morningSlots: [],
    afternoonSlots: [],
  };

  const handleSaveSlot = (updatedSlot: TimetableSlot) => {
    if (!editingSlot) return;

    const { dayOfWeek, isMorning } = editingSlot;
    const targetDay = timetable.days[dayOfWeek];
    if (!targetDay) return;

    const newMorning = isMorning
      ? targetDay.morningSlots.map((s) => (s.period === updatedSlot.period ? updatedSlot : s))
      : targetDay.morningSlots;

    const newAfternoon = !isMorning
      ? targetDay.afternoonSlots.map((s) => (s.period === updatedSlot.period ? updatedSlot : s))
      : targetDay.afternoonSlots;

    const updatedTimetable: WeeklyTimetable = {
      ...timetable,
      days: {
        ...timetable.days,
        [dayOfWeek]: {
          ...targetDay,
          morningSlots: newMorning,
          afternoonSlots: newAfternoon,
        },
      },
    };

    onSaveTimetable(updatedTimetable);
    setEditingSlot(null);
  };

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim()) return;

    const newEvent: ClassEvent = {
      id: `evt_${Date.now()}`,
      title: eventTitle,
      date: eventDate,
      time: eventTime,
      type: eventType,
      description: eventDesc,
    };

    onAddEvent(newEvent);
    setEventTitle("");
    setEventDesc("");
    setIsAddEventOpen(false);
  };

  return (
    <div className="space-y-3.5">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-3.5 rounded-md border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-sm font-bold uppercase tracking-tight text-slate-800">
              Thời Khóa Biểu & Lịch Hoạt Động Lớp 4
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
              Phòng {classInfo.room}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Lịch học 2 buổi/ngày (7 tiết), sự kiện kiểm tra định kỳ và hoạt động trải nghiệm của lớp
          </p>
        </div>

        <button
          onClick={() => setIsAddEventOpen(true)}
          className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] flex items-center gap-1 shadow-xs transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Thêm sự kiện / Lịch thi</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5">
        {/* Left 2 Cols: Weekly Timetable */}
        <div className="lg:col-span-2 space-y-3">
          {/* Day selection tabs */}
          <div className="bg-slate-100 p-0.5 rounded border border-slate-200 flex space-x-1">
            {daysList.map((d) => (
              <button
                key={d.key}
                onClick={() => setActiveDay(d.key)}
                className={`flex-1 py-1 rounded text-[11px] font-bold transition cursor-pointer ${
                  activeDay === d.key
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>

          {/* Schedule Content */}
          <div className="bg-white rounded-md border border-slate-200 shadow-xs p-3.5 space-y-4">
            {/* Morning Section */}
            <div>
              <div className="flex items-center justify-between mb-2 border-b border-slate-100 pb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  Buổi Sáng (07:30 - 10:30)
                </span>
                <span className="text-[10px] text-slate-400">4 Tiết học</span>
              </div>

              <div className="space-y-1.5">
                {currentDayData.morningSlots.map((slot) => (
                  <div
                    key={slot.period}
                    className="p-2 rounded border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-blue-300 transition-colors flex items-center justify-between group"
                  >
                    <div className="flex items-center space-x-2.5">
                      <div className="w-6 h-6 rounded bg-white border border-slate-200 flex items-center justify-center font-bold text-xs text-slate-800">
                        {slot.period}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">{slot.subjectName}</p>
                        <p className="text-[10px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <span className="flex items-center gap-0.5"><User className="w-3 h-3 text-slate-400" /> {slot.teacher}</span>
                          <span>•</span>
                          <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3 text-slate-400" /> Phòng {slot.room || "402"}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-[11px] font-mono text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                        {slot.time}
                      </span>
                      <button
                        onClick={() => setEditingSlot({ dayOfWeek: activeDay, isMorning: true, slot })}
                        className="p-1 rounded text-slate-400 hover:text-blue-700 hover:bg-slate-100 transition cursor-pointer"
                        title="Sửa tiết học"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Afternoon Section */}
            <div>
              <div className="flex items-center justify-between mb-2 border-b border-slate-100 pb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  Buổi Chiều (14:00 - 16:05)
                </span>
                <span className="text-[10px] text-slate-400">3 Tiết học</span>
              </div>

              <div className="space-y-1.5">
                {currentDayData.afternoonSlots.map((slot) => (
                  <div
                    key={slot.period}
                    className="p-2 rounded border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-blue-300 transition-colors flex items-center justify-between group"
                  >
                    <div className="flex items-center space-x-2.5">
                      <div className="w-6 h-6 rounded bg-white border border-slate-200 flex items-center justify-center font-bold text-xs text-slate-800">
                        {slot.period}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">{slot.subjectName}</p>
                        <p className="text-[10px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <span className="flex items-center gap-0.5"><User className="w-3 h-3 text-slate-400" /> {slot.teacher}</span>
                          <span>•</span>
                          <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3 text-slate-400" /> Phòng {slot.room || "402"}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-[11px] font-mono text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                        {slot.time}
                      </span>
                      <button
                        onClick={() => setEditingSlot({ dayOfWeek: activeDay, isMorning: false, slot })}
                        className="p-1 rounded text-slate-400 hover:text-blue-700 hover:bg-slate-100 transition cursor-pointer"
                        title="Sửa tiết học"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Events & Reminders */}
        <div className="space-y-3">
          <div className="bg-white rounded-md border border-slate-200 shadow-xs p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5">
                <CalendarIcon className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-xs uppercase tracking-tight">Lịch Lớp & Sự Kiện</h3>
              </div>
              <span className="text-[10px] font-bold text-slate-500">{events.length} sự kiện</span>
            </div>

            <div className="space-y-2 max-h-[550px] overflow-y-auto pr-0.5">
              {events.map((event) => {
                const badgeColor = {
                  exam: "bg-rose-100 text-rose-800 border-rose-200",
                  meeting: "bg-blue-100 text-blue-800 border-blue-200",
                  activity: "bg-emerald-100 text-emerald-800 border-emerald-200",
                  holiday: "bg-amber-100 text-amber-800 border-amber-200",
                  other: "bg-slate-100 text-slate-800 border-slate-200",
                }[event.type] || "bg-slate-100 text-slate-800 border-slate-200";

                const typeName = {
                  exam: "Kiểm tra",
                  meeting: "Họp PH",
                  activity: "Trải nghiệm",
                  holiday: "Nghỉ lễ",
                  other: "Khác",
                }[event.type];

                return (
                  <div
                    key={event.id}
                    className="p-2.5 rounded border border-slate-200 bg-slate-50/50 hover:bg-white transition-colors space-y-1.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${badgeColor}`}>
                        {typeName}
                      </span>
                      <button
                        onClick={() => onDeleteEvent(event.id)}
                        className="text-slate-400 hover:text-rose-600 transition cursor-pointer p-0.5"
                        title="Xóa sự kiện"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-slate-900 leading-snug">{event.title}</h4>
                      <p className="text-[10px] text-blue-700 font-semibold mt-0.5">
                        📅 {event.date} {event.time ? `• ⏰ ${event.time}` : ""}
                      </p>
                    </div>

                    {event.description && (
                      <p className="text-[11px] text-slate-600 leading-relaxed bg-white p-1.5 rounded border border-slate-100">
                        {event.description}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Slot Modal */}
      {editingSlot && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-md max-w-md w-full p-4 shadow-xl border border-slate-200 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-tight text-slate-900">
              Chỉnh sửa Tiết {editingSlot.slot.period}
            </h3>

            <div className="space-y-2.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1 text-[11px]">Môn học</label>
                <select
                  value={editingSlot.slot.subjectId}
                  onChange={(e) => {
                    const found = GRADE_4_SUBJECTS.find((s) => s.id === e.target.value);
                    setEditingSlot({
                      ...editingSlot,
                      slot: {
                        ...editingSlot.slot,
                        subjectId: e.target.value,
                        subjectName: found?.name || editingSlot.slot.subjectName,
                      },
                    });
                  }}
                  className="w-full p-1.5 rounded border border-slate-300 text-xs bg-white"
                >
                  {GRADE_4_SUBJECTS.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1 text-[11px]">Giáo viên giảng dạy</label>
                <input
                  type="text"
                  value={editingSlot.slot.teacher || ""}
                  onChange={(e) =>
                    setEditingSlot({
                      ...editingSlot,
                      slot: { ...editingSlot.slot, teacher: e.target.value },
                    })
                  }
                  className="w-full p-1.5 rounded border border-slate-300 text-xs bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1 text-[11px]">Phòng học</label>
                  <input
                    type="text"
                    value={editingSlot.slot.room || ""}
                    onChange={(e) =>
                      setEditingSlot({
                        ...editingSlot,
                        slot: { ...editingSlot.slot, room: e.target.value },
                      })
                    }
                    className="w-full p-1.5 rounded border border-slate-300 text-xs bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1 text-[11px]">Khung giờ</label>
                  <input
                    type="text"
                    value={editingSlot.slot.time || ""}
                    onChange={(e) =>
                      setEditingSlot({
                        ...editingSlot,
                        slot: { ...editingSlot.slot, time: e.target.value },
                      })
                    }
                    className="w-full p-1.5 rounded border border-slate-300 text-xs bg-white"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2.5 border-t border-slate-100">
              <button
                onClick={() => setEditingSlot(null)}
                className="px-3 py-1 rounded text-slate-600 hover:bg-slate-100 font-semibold text-[11px] cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={() => handleSaveSlot(editingSlot.slot)}
                className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] cursor-pointer shadow-xs"
              >
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Event Modal */}
      {isAddEventOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleCreateEvent} className="bg-white rounded-md max-w-md w-full p-4 shadow-xl border border-slate-200 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-tight text-slate-900">Thêm sự kiện / Lịch thi</h3>

            <div className="space-y-2.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1 text-[11px]">Tiêu đề sự kiện *</label>
                <input
                  type="text"
                  required
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  placeholder="Ví dụ: Kiểm tra giữa kỳ môn Tiếng Việt"
                  className="w-full p-1.5 rounded border border-slate-300 text-xs bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1 text-[11px]">Ngày diễn ra</label>
                  <input
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full p-1.5 rounded border border-slate-300 text-xs bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1 text-[11px]">Giờ</label>
                  <input
                    type="time"
                    value={eventTime}
                    onChange={(e) => setEventTime(e.target.value)}
                    className="w-full p-1.5 rounded border border-slate-300 text-xs bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1 text-[11px]">Loại sự kiện</label>
                <select
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value as ClassEvent["type"])}
                  className="w-full p-1.5 rounded border border-slate-300 text-xs bg-white"
                >
                  <option value="exam">Kiểm tra / Thi cử</option>
                  <option value="meeting">Họp phụ huynh</option>
                  <option value="activity">Hoạt động ngoại khóa / Trải nghiệm</option>
                  <option value="holiday">Nghỉ lễ</option>
                  <option value="other">Khác</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1 text-[11px]">Chi tiết / Dặn dò học sinh</label>
                <textarea
                  rows={3}
                  value={eventDesc}
                  onChange={(e) => setEventDesc(e.target.value)}
                  placeholder="Nội dung chi tiết, chuẩn bị đồ dùng..."
                  className="w-full p-1.5 rounded border border-slate-300 text-xs resize-none bg-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2.5 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsAddEventOpen(false)}
                className="px-3 py-1 rounded text-slate-600 hover:bg-slate-100 font-semibold text-[11px] cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] cursor-pointer shadow-xs"
              >
                Tạo sự kiện
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
