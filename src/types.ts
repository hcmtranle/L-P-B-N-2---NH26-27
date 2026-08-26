export type Gender = 'Nam' | 'Nữ';

export type StudentStatus = 'Đang học' | 'Chuyển trường' | 'Nghỉ học' | 'Tạm nghỉ';

export type ClassPosition = 'Lớp trưởng' | 'Lớp phó học tập' | 'Lớp phó lao động' | 'Lớp phó văn thể' | 'Tổ trưởng' | 'Tổ phó' | 'Thành viên' | 'Cờ đỏ';

export type EvaluationLevel = 'T' | 'H' | 'C'; // T: Hoàn thành tốt, H: Hoàn thành, C: Chưa hoàn thành

export type StudentTitle = 
  | 'Học sinh Xuất sắc'
  | 'Học sinh Tiêu biểu hoàn thành tốt trong học tập và rèn luyện'
  | 'Hoàn thành chương trình lớp học'
  | 'Chưa hoàn thành';

export interface Student {
  id: string;
  code: string; // Mã số HS (ví dụ: HS401)
  fullName: string;
  gender: Gender;
  dob: string; // YYYY-MM-DD
  avatar?: string;
  parentName: string;
  parentPhone: string;
  parentEmail?: string;
  address: string;
  group: string; // Tổ 1, Tổ 2, Tổ 3, Tổ 4
  position: ClassPosition;
  status: StudentStatus;
  healthNote?: string; // Dị ứng, cận thị, hen suyễn...
  strengths?: string; // Năng khiếu toán, vẽ đẹp, múa hát, viết chữ đẹp...
  weaknesses?: string; // Cần rèn chữ, nhút nhát, tính ẩu...
  rewardStars: number; // Hoa điểm 10 / Ngôi sao thi đua
  createdAt: string;
}

export interface ClassInfo {
  id: string;
  name: string; // Ví dụ: Lớp 4A
  school: string; // Trường Tiểu học Chu Văn An
  academicYear: string; // 2025 - 2026
  gradeLevel: number; // 4
  teacherName: string; // Cô Lê Mai Trang
  teacherPhone: string;
  teacherEmail: string;
  room: string; // Phòng 402
  totalStudents: number;
}

export type AttendanceStatus = 'present' | 'late' | 'excused' | 'unexcused';

export interface AttendanceRecord {
  status: AttendanceStatus;
  note?: string;
  time?: string;
}

export interface DailyAttendance {
  id: string;
  date: string; // YYYY-MM-DD
  records: Record<string, AttendanceRecord>; // studentId -> AttendanceRecord
  totalPresent: number;
  totalLate: number;
  totalExcused: number;
  totalUnexcused: number;
  note?: string;
  updatedAt: string;
}

export interface SubjectInfo {
  id: string;
  name: string;
  code: string;
  hasPeriodicScore: boolean; // Có điểm số định kỳ (Toán, Tiếng Việt, Tiếng Anh, Khoa học, Lịch sử & Địa lí, Tin học & Công nghệ) hay chỉ nhận xét mức T/H/C
  category: 'core' | 'specialized' | 'activity';
  color: string;
  teacher?: string;
}

export type TermType = 'mid_term1' | 'final_term1' | 'mid_term2' | 'final_term2';

export interface GradeEntry {
  score?: number; // 1 to 10
  level: EvaluationLevel; // T, H, C
  regularComment?: string; // Nhận xét thường xuyên
  updatedAt?: string;
}

export interface SubjectGradeBook {
  id: string;
  subjectId: string;
  term: TermType;
  records: Record<string, GradeEntry>; // studentId -> GradeEntry
}

export interface CompetenciesEvaluation {
  // Năng lực chung
  selfControl: EvaluationLevel; // Tự chủ và tự học
  communication: EvaluationLevel; // Giao tiếp và hợp tác
  problemSolving: EvaluationLevel; // Giải quyết vấn đề và sáng tạo
  // Năng lực đặc thù
  language: EvaluationLevel; // Ngôn ngữ
  math: EvaluationLevel; // Tính toán
  science: EvaluationLevel; // Khoa học
  technology: EvaluationLevel; // Công nghệ và Tin học
  art: EvaluationLevel; // Thẩm mĩ (Âm nhạc, Mĩ thuật)
  physical: EvaluationLevel; // Thể chất
}

export interface QualitiesEvaluation {
  // 5 Phẩm chất chủ yếu theo GDPT 2018
  patriotism: EvaluationLevel; // Yêu nước
  compassion: EvaluationLevel; // Nhân ái
  diligence: EvaluationLevel; // Chăm chỉ
  honesty: EvaluationLevel; // Trung thực
  responsibility: EvaluationLevel; // Trách nhiệm
}

export interface StudentTermReport {
  id: string;
  studentId: string;
  term: TermType;
  competencies: CompetenciesEvaluation;
  qualities: QualitiesEvaluation;
  teacherComment: string;
  parentAdvice: string;
  title: StudentTitle;
  rewardFlowers: number;
  parentFeedback?: string;
  updatedAt: string;
}

export interface TimetableSlot {
  period: number; // 1 to 7
  time: string; // 07:30 - 08:05
  subjectId: string;
  subjectName: string;
  room?: string;
  teacher?: string;
  note?: string;
}

export interface TimetableDay {
  dayOfWeek: number; // 1: Thứ 2, 2: Thứ 3, ..., 5: Thứ 6
  dayName: string;
  morningSlots: TimetableSlot[];
  afternoonSlots: TimetableSlot[];
}

export interface WeeklyTimetable {
  id: string;
  classId: string;
  days: Record<number, TimetableDay>; // 1 -> Monday, 2 -> Tuesday...
}

export interface ClassEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time?: string;
  type: 'exam' | 'meeting' | 'activity' | 'holiday' | 'other';
  description: string;
  completed?: boolean;
}

export interface RewardLog {
  id: string;
  studentId: string;
  studentName: string;
  type: 'star' | 'flower' | 'medal';
  amount: number;
  reason: string;
  date: string;
}
