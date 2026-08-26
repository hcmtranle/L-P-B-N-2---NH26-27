import * as XLSX from "xlsx";
import { Student, SubjectInfo, DailyAttendance } from "../types";

// Export Student List to Excel (.xlsx)
export function exportStudentsToExcel(students: Student[], className: string) {
  const worksheetData = students.map((s, index) => ({
    "STT": index + 1,
    "Mã học sinh": s.code,
    "Họ và tên": s.fullName,
    "Giới tính": s.gender,
    "Ngày sinh": s.dob,
    "Tổ": s.group,
    "Chức vụ": s.position,
    "Trạng thái": s.status,
    "Họ tên Phụ huynh": s.parentName,
    "Số điện thoại": s.parentPhone,
    "Email phụ huynh": s.parentEmail || "",
    "Địa chỉ": s.address,
    "Ghi chú sức khỏe": s.healthNote || "",
    "Điểm mạnh / Năng khiếu": s.strengths || "",
    "Số hoa điểm 10": s.rewardStars || 0
  }));

  const worksheet = XLSX.utils.json_to_sheet(worksheetData);
  
  // Set column widths
  worksheet["!cols"] = [
    { wch: 6 },  // STT
    { wch: 12 }, // Mã HS
    { wch: 24 }, // Họ tên
    { wch: 10 }, // Giới tính
    { wch: 14 }, // Ngày sinh
    { wch: 8 },  // Tổ
    { wch: 16 }, // Chức vụ
    { wch: 12 }, // Trạng thái
    { wch: 22 }, // Phụ huynh
    { wch: 14 }, // SĐT
    { wch: 22 }, // Email
    { wch: 32 }, // Địa chỉ
    { wch: 24 }, // Sức khỏe
    { wch: 30 }, // Năng khiếu
    { wch: 14 }, // Sao thưởng
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, `Danh sách ${className}`);

  const fileName = `Danh_Sach_Hoc_Sinh_${className.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}

// Download Excel Template for importing students
export function downloadStudentTemplate() {
  const sampleData = [
    {
      "Mã học sinh": "HS401",
      "Họ và tên": "Nguyễn Minh An",
      "Giới tính": "Nam",
      "Ngày sinh": "2016-03-15",
      "Tổ": "Tổ 1",
      "Chức vụ": "Lớp trưởng",
      "Họ tên Phụ huynh": "Nguyễn Văn Hùng",
      "Số điện thoại": "0903112233",
      "Địa chỉ": "Hà Nội",
      "Ghi chú sức khỏe": "Cận thị nhẹ",
      "Điểm mạnh": "Chăm ngoan, học giỏi"
    },
    {
      "Mã học sinh": "HS402",
      "Họ và tên": "Trần Thùy Linh",
      "Giới tính": "Nữ",
      "Ngày sinh": "2016-07-22",
      "Tổ": "Tổ 1",
      "Chức vụ": "Lớp phó học tập",
      "Họ tên Phụ huynh": "Trần Quang Minh",
      "Số điện thoại": "0918223344",
      "Địa chỉ": "Hà Nội",
      "Ghi chú sức khỏe": "Bình thường",
      "Điểm mạnh": "Chữ đẹp, hát hay"
    }
  ];

  const ws = XLSX.utils.json_to_sheet(sampleData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Mẫu_Nhập_Lớp_4");
  XLSX.writeFile(wb, "Mau_Nhap_Danh_Sach_Hoc_Sinh.xlsx");
}

// Parse imported Excel file
export async function parseStudentsFromExcel(file: File): Promise<Partial<Student>[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet);

        const students: Partial<Student>[] = jsonData.map((row, idx) => ({
          id: `std_${Date.now()}_${idx}`,
          code: row["Mã học sinh"] || `HS4${String(idx + 1).padStart(2, '0')}`,
          fullName: row["Họ và tên"] || row["Họ tên"] || row["Họ và Tên"] || `Học sinh ${idx + 1}`,
          gender: (row["Giới tính"] === "Nữ" || row["Giới tính"] === "Nu") ? "Nữ" : "Nam",
          dob: row["Ngày sinh"] ? String(row["Ngày sinh"]) : "2016-01-01",
          group: row["Tổ"] || "Tổ 1",
          position: (row["Chức vụ"] as any) || "Thành viên",
          status: "Đang học",
          parentName: row["Họ tên Phụ huynh"] || row["Phụ huynh"] || "Chưa cập nhật",
          parentPhone: String(row["Số điện thoại"] || row["SĐT"] || ""),
          address: row["Địa chỉ"] || "Hà Nội",
          healthNote: row["Ghi chú sức khỏe"] || row["Sức khỏe"] || "",
          strengths: row["Điểm mạnh"] || row["Năng khiếu"] || "",
          rewardStars: Number(row["Số hoa điểm 10"]) || 0,
          createdAt: new Date().toISOString().slice(0, 10),
        }));

        resolve(students);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
}

// Export Grades to Excel
export function exportGradesToExcel(
  students: Student[],
  subjects: SubjectInfo[],
  gradesMap: Record<string, Record<string, { score?: number; level: string; comment?: string }>>,
  termName: string,
  className: string
) {
  const rows = students.map((s, index) => {
    const row: any = {
      "STT": index + 1,
      "Mã HS": s.code,
      "Họ và tên": s.fullName,
      "Tổ": s.group,
    };

    subjects.forEach((subj) => {
      const entry = gradesMap[subj.id]?.[s.id];
      if (subj.hasPeriodicScore) {
        row[`${subj.name} (Điểm)`] = entry?.score !== undefined ? entry.score : "-";
      }
      row[`${subj.name} (Mức)`] = entry?.level || "T";
      if (entry?.comment) {
        row[`${subj.name} (Nhận xét)`] = entry.comment;
      }
    });

    return row;
  });

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, `Bảng Điểm ${termName}`);
  XLSX.writeFile(wb, `Bang_Diem_${className.replace(/\s+/g, "_")}_${termName.replace(/\s+/g, "_")}.xlsx`);
}

// Export Attendance History
export function exportAttendanceToExcel(
  students: Student[],
  attendanceList: DailyAttendance[],
  className: string
) {
  const rows = students.map((s, index) => {
    const row: any = {
      "STT": index + 1,
      "Mã HS": s.code,
      "Họ và tên": s.fullName,
      "Tổ": s.group,
    };

    let totalPresent = 0;
    let totalLate = 0;
    let totalExcused = 0;
    let totalUnexcused = 0;

    attendanceList.forEach((att) => {
      const rec = att.records?.[s.id];
      const status = rec?.status || "present";
      if (status === "present") totalPresent++;
      else if (status === "late") totalLate++;
      else if (status === "excused") totalExcused++;
      else if (status === "unexcused") totalUnexcused++;

      const statusMap = {
        present: "V (Có mặt)",
        late: "M (Đi trễ)",
        excused: "P (Có phép)",
        unexcused: "KP (Không phép)",
      };
      row[att.date] = statusMap[status] || "V";
    });

    row["Tổng Có Mặt"] = totalPresent;
    row["Tổng Đi Trễ"] = totalLate;
    row["Tổng Nghỉ Có Phép"] = totalExcused;
    row["Tổng Nghỉ Không Phép"] = totalUnexcused;
    const totalDays = attendanceList.length || 1;
    row["Tỷ lệ chuyên cần"] = `${Math.round((totalPresent / totalDays) * 100)}%`;

    return row;
  });

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Sổ Chuyên Cần");
  XLSX.writeFile(wb, `So_Diem_Danh_${className.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.xlsx`);
}
