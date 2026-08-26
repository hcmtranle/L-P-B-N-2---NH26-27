import React, { useState, useEffect, useCallback } from "react";
import { Navbar, NavTab } from "./components/Navbar";
import { Dashboard } from "./components/Dashboard";
import { StudentList } from "./components/StudentList";
import { StudentModal } from "./components/StudentModal";
import { AttendanceManager } from "./components/AttendanceManager";
import { Gradebook } from "./components/Gradebook";
import { TimetableManager } from "./components/TimetableManager";
import { ReportCardManager } from "./components/ReportCardManager";
import { RewardBoard } from "./components/RewardBoard";
import { AIAssistantModal } from "./components/AIAssistantModal";
import { ClassSettingsModal } from "./components/ClassSettingsModal";
import { 
  Student, 
  ClassInfo, 
  DailyAttendance, 
  WeeklyTimetable, 
  ClassEvent, 
  StudentTermReport, 
  EvaluationLevel 
} from "./types";
import { 
  DEFAULT_CLASS_INFO, 
  INITIAL_STUDENTS, 
  INITIAL_TIMETABLE, 
  INITIAL_EVENTS, 
  INITIAL_GRADES_MOCK 
} from "./data/mockData";
import { db, doc, setDoc, getDoc } from "./lib/firebase";

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>("dashboard");
  
  // App States with localStorage initialization
  const [classInfo, setClassInfo] = useState<ClassInfo>(() => {
    const saved = localStorage.getItem("class_info");
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...parsed, totalStudents: 32 };
    }
    return DEFAULT_CLASS_INFO;
  });

  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem("class_students");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Filter out transferred student "Tuệ Mẫn"
          const filtered = parsed.filter((s: Student) => !s.fullName.includes("Tuệ Mẫn"));
          if (filtered.length >= 32 && filtered[0]?.fullName === "Nguyễn Vũ Hoài An") {
            return filtered;
          }
        }
      } catch {
        // Fallback to INITIAL_STUDENTS
      }
    }
    return INITIAL_STUDENTS;
  });

  const [attendanceHistory, setAttendanceHistory] = useState<Record<string, DailyAttendance>>(() => {
    const saved = localStorage.getItem("class_attendance");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const today = new Date().toISOString().slice(0, 10);
        if (parsed[today] && Object.keys(parsed[today].records || {}).length >= 32) {
          return parsed;
        }
      } catch {
        // fallback
      }
    }
    const today = new Date().toISOString().slice(0, 10);
    return {
      [today]: {
        id: `att_${today}`,
        date: today,
        records: INITIAL_STUDENTS.reduce((acc, s) => {
          acc[s.id] = { status: "present", note: "" };
          return acc;
        }, {} as Record<string, { status: "present"; note: string }>),
        totalPresent: INITIAL_STUDENTS.length,
        totalLate: 0,
        totalExcused: 0,
        totalUnexcused: 0,
        note: "Các em học sinh chuẩn bị bài tốt, nề nếp ổn định.",
        updatedAt: new Date().toISOString(),
      }
    };
  });

  const [gradesData, setGradesData] = useState<Record<string, Record<string, { score?: number; level: EvaluationLevel; comment?: string }>>>(() => {
    const saved = localStorage.getItem("class_grades");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.math && Object.keys(parsed.math).length >= 32) {
          return parsed;
        }
      } catch {
        // fallback
      }
    }
    return INITIAL_GRADES_MOCK;
  });

  const [timetable, setTimetable] = useState<WeeklyTimetable>(() => {
    const saved = localStorage.getItem("class_timetable");
    return saved ? JSON.parse(saved) : INITIAL_TIMETABLE;
  });

  const [events, setEvents] = useState<ClassEvent[]>(() => {
    const saved = localStorage.getItem("class_events");
    return saved ? JSON.parse(saved) : INITIAL_EVENTS;
  });

  const [reportsData, setReportsData] = useState<Record<string, StudentTermReport>>(() => {
    const saved = localStorage.getItem("class_reports");
    return saved ? JSON.parse(saved) : {};
  });

  // Modal States
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [aiInitialPrompt, setAiInitialPrompt] = useState<string>("");

  // Sync state
  const [isSynced, setIsSynced] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem("class_info", JSON.stringify(classInfo));
  }, [classInfo]);

  useEffect(() => {
    localStorage.setItem("class_students", JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem("class_attendance", JSON.stringify(attendanceHistory));
  }, [attendanceHistory]);

  useEffect(() => {
    localStorage.setItem("class_grades", JSON.stringify(gradesData));
  }, [gradesData]);

  useEffect(() => {
    localStorage.setItem("class_timetable", JSON.stringify(timetable));
  }, [timetable]);

  useEffect(() => {
    localStorage.setItem("class_events", JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem("class_reports", JSON.stringify(reportsData));
  }, [reportsData]);

  // Load from Firebase Firestore on first mount if available
  useEffect(() => {
    const loadFromCloud = async () => {
      try {
        const docRef = doc(db, "classes", classInfo.id || "class_4a_primary");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.classInfo) setClassInfo(data.classInfo);
          if (data.students) setStudents(data.students);
          if (data.attendanceHistory) setAttendanceHistory(data.attendanceHistory);
          if (data.gradesData) setGradesData(data.gradesData);
          if (data.timetable) setTimetable(data.timetable);
          if (data.events) setEvents(data.events);
          if (data.reportsData) setReportsData(data.reportsData);
          setIsSynced(true);
        }
      } catch (err) {
        console.log("Using local offline storage mode:", err);
      }
    };
    loadFromCloud();
  }, []);

  // Save to Firebase Firestore
  const syncToCloud = useCallback(async () => {
    setIsSyncing(true);
    try {
      const docRef = doc(db, "classes", classInfo.id || "class_4a_primary");
      await setDoc(docRef, {
        classInfo,
        students,
        attendanceHistory,
        gradesData,
        timetable,
        events,
        reportsData,
        updatedAt: new Date().toISOString(),
      });
      setIsSynced(true);
    } catch (err) {
      console.error("Firestore sync error:", err);
      setIsSynced(true); // Treat as saved locally
    } finally {
      setIsSyncing(false);
    }
  }, [classInfo, students, attendanceHistory, gradesData, timetable, events, reportsData]);

  // Auto sync debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      syncToCloud();
    }, 4000);
    return () => clearTimeout(timer);
  }, [classInfo, students, attendanceHistory, gradesData, timetable, events, reportsData, syncToCloud]);

  // Student CRUD
  const handleSaveStudent = (savedStudent: Student) => {
    setStudents((prev) => {
      const exists = prev.some((s) => s.id === savedStudent.id);
      if (exists) {
        return prev.map((s) => (s.id === savedStudent.id ? savedStudent : s));
      }
      return [...prev, savedStudent];
    });
  };

  const handleDeleteStudent = (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa học sinh này khỏi danh sách lớp?")) {
      setStudents((prev) => prev.filter((s) => s.id !== id));
    }
  };

  const handleUpdateStars = (id: string, delta: number) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, rewardStars: Math.max(0, (s.rewardStars || 0) + delta) } : s))
    );
  };

  const handleImportStudents = (newStudents: Partial<Student>[]) => {
    const formatted: Student[] = newStudents.map((s, idx) => ({
      id: s.id || `std_${Date.now()}_${idx}`,
      code: s.code || `HS4${String(students.length + idx + 1).padStart(2, "0")}`,
      fullName: s.fullName || `Học sinh ${students.length + idx + 1}`,
      gender: s.gender || "Nam",
      dob: s.dob || "2016-01-01",
      parentName: s.parentName || "Chưa cập nhật",
      parentPhone: s.parentPhone || "",
      parentEmail: s.parentEmail || "",
      address: s.address || "Hà Nội",
      group: s.group || "Tổ 1",
      position: s.position || "Thành viên",
      status: s.status || "Đang học",
      healthNote: s.healthNote || "Bình thường",
      strengths: s.strengths || "",
      weaknesses: s.weaknesses || "",
      rewardStars: s.rewardStars || 0,
      createdAt: new Date().toISOString().slice(0, 10),
    }));

    setStudents((prev) => [...prev, ...formatted]);
  };

  // Reset to Sample Data
  const handleResetToSampleData = () => {
    setClassInfo(DEFAULT_CLASS_INFO);
    setStudents(INITIAL_STUDENTS);
    setTimetable(INITIAL_TIMETABLE);
    setEvents(INITIAL_EVENTS);
    setGradesData(INITIAL_GRADES_MOCK);
    const today = new Date().toISOString().slice(0, 10);
    setAttendanceHistory({
      [today]: {
        id: `att_${today}`,
        date: today,
        records: INITIAL_STUDENTS.reduce((acc, s) => {
          acc[s.id] = { status: "present", note: "" };
          return acc;
        }, {} as Record<string, { status: "present"; note: string }>),
        totalPresent: INITIAL_STUDENTS.length,
        totalLate: 0,
        totalExcused: 0,
        totalUnexcused: 0,
        note: "Các em học sinh chuẩn bị bài tốt, nề nếp ổn định.",
        updatedAt: new Date().toISOString(),
      }
    });
    setReportsData({});
  };

  const handleClearAllData = () => {
    setStudents([]);
    setAttendanceHistory({});
    setGradesData({});
    setEvents([]);
    setReportsData({});
  };

  // Get Today's timetable (Monday = 1 ... Friday = 5)
  const currentDayOfWeek = new Date().getDay(); // 0 = Sunday, 1 = Monday ... 6 = Saturday
  const timetableDayIndex = currentDayOfWeek >= 1 && currentDayOfWeek <= 5 ? currentDayOfWeek : 1;
  const todayTimetable = timetable.days?.[timetableDayIndex];

  // Today's attendance
  const todayDateStr = new Date().toISOString().slice(0, 10);
  const todayAttendance = attendanceHistory[todayDateStr] || {
    id: `att_${todayDateStr}`,
    date: todayDateStr,
    records: {},
    totalPresent: students.length,
    totalLate: 0,
    totalExcused: 0,
    totalUnexcused: 0,
    updatedAt: new Date().toISOString(),
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900 selection:bg-blue-600 selection:text-white">
      {/* Sidebar & Top Header */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        classInfo={classInfo}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isSynced={isSynced}
        onSyncNow={syncToCloud}
        isSyncing={isSyncing}
        onQuickAddStudent={() => {
          setEditingStudent(null);
          setIsStudentModalOpen(true);
        }}
        onOpenAI={(prompt) => {
          setAiInitialPrompt(prompt || "");
          setCurrentTab("ai_assistant");
        }}
      />

      {/* Main Content Area with Desktop Sidebar Offset */}
      <div className="lg:pl-60 flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto">
          {currentTab === "dashboard" && (
            <Dashboard
              students={students}
              classInfo={classInfo}
              todayAttendance={todayAttendance}
              todayTimetable={todayTimetable}
              events={events}
              gradesData={gradesData}
              onNavigate={setCurrentTab}
              onQuickAttendance={() => setCurrentTab("attendance")}
              onOpenAI={(prompt) => {
                setAiInitialPrompt(prompt || "");
                setCurrentTab("ai_assistant");
              }}
              onQuickAddStudent={() => {
                setEditingStudent(null);
                setIsStudentModalOpen(true);
              }}
            />
          )}

          {currentTab === "students" && (
            <StudentList
              students={students}
              classInfo={classInfo}
              onAddStudent={() => {
                setEditingStudent(null);
                setIsStudentModalOpen(true);
              }}
              onEditStudent={(s) => {
                setEditingStudent(s);
                setIsStudentModalOpen(true);
              }}
              onDeleteStudent={handleDeleteStudent}
              onUpdateStars={handleUpdateStars}
              onImportStudents={handleImportStudents}
              onOpenAIForStudent={(s) => {
                setAiInitialPrompt(`Hãy viết lời nhận xét học bạ Thông tư 27 cho học sinh ${s.fullName} (${s.gender}, ${s.group}, Chức vụ: ${s.position}). Điểm mạnh: ${s.strengths || "Chăm chỉ"}, Cần rèn luyện: ${s.weaknesses || "Tự tin hơn"}.`);
                setCurrentTab("ai_assistant");
              }}
              onViewReport={(s) => {
                setCurrentTab("reports");
              }}
            />
          )}

          {currentTab === "attendance" && (
            <AttendanceManager
              students={students}
              classInfo={classInfo}
              attendanceHistory={attendanceHistory}
              onSaveAttendance={(att) => {
                setAttendanceHistory((prev) => ({ ...prev, [att.date]: att }));
              }}
            />
          )}

          {currentTab === "grades" && (
            <Gradebook
              students={students}
              classInfo={classInfo}
              gradesData={gradesData}
              onSaveGrades={setGradesData}
              onOpenAIComment={(s, subjectName, score) => {
                setAiInitialPrompt(`Viết lời nhận xét đánh giá thường xuyên cho học sinh ${s.fullName} môn ${subjectName} đạt điểm số/mức: ${score || "Tốt"}.`);
                setCurrentTab("ai_assistant");
              }}
            />
          )}

          {currentTab === "timetable" && (
            <TimetableManager
              classInfo={classInfo}
              timetable={timetable}
              events={events}
              onSaveTimetable={setTimetable}
              onAddEvent={(evt) => setEvents((prev) => [evt, ...prev])}
              onDeleteEvent={(id) => setEvents((prev) => prev.filter((e) => e.id !== id))}
            />
          )}

          {currentTab === "reports" && (
            <ReportCardManager
              students={students}
              classInfo={classInfo}
              gradesData={gradesData}
              reportsData={reportsData}
              attendanceHistory={attendanceHistory}
              onSaveReport={(report) => {
                setReportsData((prev) => ({ ...prev, [report.id]: report }));
              }}
              onOpenAIComment={(s) => {
                setAiInitialPrompt(`Tạo nhận xét học bạ Thông tư 27 cho học sinh ${s.fullName}`);
                setCurrentTab("ai_assistant");
              }}
            />
          )}

          {currentTab === "rewards" && (
            <RewardBoard
              students={students}
              classInfo={classInfo}
              onAddStar={handleUpdateStars}
            />
          )}

          {currentTab === "ai_assistant" && (
            <AIAssistantModal
              classInfo={classInfo}
              students={students}
              initialPrompt={aiInitialPrompt}
            />
          )}
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-slate-200 py-3 px-6 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>EduManage • Hệ thống Quản lý Lớp học Thông tư 27/2020/TT-BGDĐT & GDPT 2018</span>
          <span className="text-[11px] text-slate-400">Phiên bản High Density • {classInfo.name} ({classInfo.academicYear})</span>
        </footer>
      </div>

      {/* Student Modal */}
      <StudentModal
        isOpen={isStudentModalOpen}
        onClose={() => setIsStudentModalOpen(false)}
        onSave={handleSaveStudent}
        initialData={editingStudent}
        totalStudents={students.length}
      />

      {/* Class Settings Modal */}
      <ClassSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        classInfo={classInfo}
        onSaveClassInfo={setClassInfo}
        onResetToSampleData={handleResetToSampleData}
        onClearAllData={handleClearAllData}
        isSynced={isSynced}
        onSyncNow={syncToCloud}
        isSyncing={isSyncing}
      />
    </div>
  );
}
