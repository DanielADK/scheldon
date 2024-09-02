import {
  getCurrentLessonRecord,
  getStudentsForLesson
} from '@repositories/classRegisterRepository';
import { LessonRecord } from '@models/LessonRecord';
import { getLessonAttendance } from '@repositories/attendanceRepository';
import { AttendanceType } from '@models/types/AttendanceType';
import { Attendance } from '@models/Attendance';
import { Student } from '@models/Student';

/**
 * Get the current lesson data for a specific teacher
 * @param teacherId number
 * @returns Promise<object | null>
 */
export const getCurrentLessonForTeacher = async (
  teacherId: number
): Promise<object | null> => {
  const lessonRecord = await getCurrentLessonRecord(teacherId);
  if (!lessonRecord) {
    return null;
  }

  const students = await getStudentsForLesson(lessonRecord.lessonId);
  return {
    lessonId: lessonRecord.lessonId,
    students: students
  };
};

interface StudentWithAttendance {
  student: Student;
  attendance: AttendanceType;
}

/**
 * Group students by attendance
 * If attendance record is not found, default to PRESENT
 * @param students Student[]
 * @param attendance Attendance[]
 * @returns StudentWithAttendance[]
 */
export const groupStudentsByAttendance = (
  students: Student[],
  attendance: Attendance[] | null
): StudentWithAttendance[] => {
  // Array of StudentWithAttendance
  const studentsWithAttendance: StudentWithAttendance[] = [];

  // If attendance record is not found, default to PRESENT
  if (!attendance) {
    students.forEach((student: Student) => {
      studentsWithAttendance.push({
        student: student,
        attendance: AttendanceType.PRESENT
      });
    });
    return studentsWithAttendance;
  }

  // Map - key: studentId, value: Attendance
  const attendanceMap = new Map<number, Attendance>();
  attendance.forEach((a: Attendance) => {
    attendanceMap.set(a.studentId, a);
  });

  // Group students by attendance
  students.forEach((student: Student) => {
    const studentAttendance = attendanceMap.get(student.studentId);
    studentsWithAttendance.push({
      student: student,
      attendance: studentAttendance
        ? studentAttendance.attendance
        : AttendanceType.PRESENT
    });
  });

  return studentsWithAttendance;
};

interface ClassRegisterExport {
  lesson: {
    lessonId: string;
    topic?: string;
  };
  students: StudentWithAttendance[];
}

/**
 * Get the current lesson data for a specific teacher
 * @param lessonId number
 * @returns Promise<object | null>
 */
export const getCurrentLessonByLesson = async (
  lessonId: string
): Promise<ClassRegisterExport | null> => {
  const students = await getStudentsForLesson(lessonId);
  const attendance = await getLessonAttendance(lessonId, true);
  const lesson = await LessonRecord.findByPk(lessonId);
  if (!lesson) {
    return null;
  }

  const studentsWithAttendance = groupStudentsByAttendance(
    students,
    attendance
  );

  return {
    lesson: {
      lessonId: lessonId,
      ...(lesson.topic !== null && { topic: lesson.topic })
    },
    students: studentsWithAttendance
  } as ClassRegisterExport;
};
