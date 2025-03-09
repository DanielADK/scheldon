import {
  classRegisterRecordDTO,
  finishLessonRecord as finishLessonRecordInRepository,
  getCurrentLessonRecord,
  getStudentsForLesson
} from '@repositories/classRegisterRepository';
import { AttendanceType } from '@models/types/AttendanceType';
import { Attendance } from '@models/Attendance';
import { Student } from '@models/Student';
import { getLessonAttendance } from '@repositories/attendanceRepository';
import { LessonRecord } from '@models/LessonRecord';

interface ClassRegisterExport {
  lesson: {
    lessonId: number;
    topic?: string;
  };
  students: StudentWithAttendance[];
}

export const finishLessonRecord = async (data: classRegisterRecordDTO): Promise<void> => {
  return await finishLessonRecordInRepository(data);
};

/**
 * Get the current lesson data for a specific teacher
 * @param teacherId number
 * @returns Promise<object | null>
 */
export const getCurrentLessonForTeacher = async (teacherId: number): Promise<ClassRegisterExport | null> => {
  const lesson = await getCurrentLessonRecord(teacherId);
  if (!lesson) {
    return null;
  }

  return getCurrentLessonByLesson(lesson);
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
export const groupStudentsByAttendance = (students: Student[], attendance: Attendance[] | null): StudentWithAttendance[] => {
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
      attendance: studentAttendance ? studentAttendance.attendance : AttendanceType.PRESENT
    });
  });

  return studentsWithAttendance;
};

/*export const getCurrentLessonByLessonId = async (lessonId: string) => {
  // id to lower case
  lessonId = lessonId.toLowerCase();
  // find lesson by id
  const lesson = await LessonRecord.findByPk(lessonId);
  if (!lesson) {
    throw new Error('Lesson not found');
  }
  return getCurrentLessonByLesson(lesson);
};*/

/**
 * Get the current lesson data for a specific teacher
 * @param lesson LessonRecord
 * @returns Promise<ClassRegisterExport | null>
 */
export const getCurrentLessonByLesson = async (lesson: LessonRecord): Promise<ClassRegisterExport | null> => {
  const students = await getStudentsForLesson(lesson.lessonId);
  const attendance = await getLessonAttendance(lesson.lessonId, true);

  const studentsWithAttendance = groupStudentsByAttendance(students, attendance);

  return {
    lesson: {
      lessonId: lesson.lessonId,
      ...(lesson.topic !== null && { topic: lesson.topic })
    },
    students: studentsWithAttendance
  } as ClassRegisterExport;
};
