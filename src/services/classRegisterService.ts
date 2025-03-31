import {
  assignSubstitutionEntryToClassRegister,
  checkAndRemoveUnusedSubstitutionEntry,
  classRegisterRecordDTO,
  findClassRegisterById,
  finishLessonRecord as finishLessonRecordInRepository,
  getCurrentLessonRecord,
  getStudentsForLesson,
  removeClassRegister,
  resetToDefaultTimetable
} from '@repositories/classRegisterRepository';
import { AttendanceType } from '@models/types/AttendanceType';
import { Attendance } from '@models/Attendance';
import { Student } from '@models/Student';
import { getLessonAttendance } from '@repositories/attendanceRepository';
import { ClassRegister } from '@models/ClassRegister';
import { SubstitutionType } from '@models/types/SubstitutionType';
import { findDefaultTimetableEntry } from '@repositories/timetableRepository';
import { findSubstitutionEntryById } from '@repositories/substitutionEntryRepository';
import { sequelize } from '../index';

interface ClassRegisterExport {
  lesson: {
    lessonId: number;
    topic?: string;
  };
  students: StudentWithAttendance[];
}

// Interface for the assignSubstitution DTO
interface AssignSubstitutionDTO {
  substitutionEntryId: number;
  date: Date;
  substitutionType: SubstitutionType;
  note?: string;
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

/**
 * Get the current lesson data for a specific teacher
 * @param lesson ClassRegister
 * @returns Promise<ClassRegisterExport | null>
 */
export const getCurrentLessonByLesson = async (lesson: ClassRegister): Promise<ClassRegisterExport | null> => {
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

/**
 * Assigns a substitution entry to a class register at a specific date
 *
 * @param data - The data for assigning a substitution entry
 * @returns Promise<ClassRegister> - The created class register
 * @throws Error if the substitution entry doesn't exist
 */
export const assignSubstitutionToClassRegister = async (date: Date, data: AssignSubstitutionDTO): Promise<ClassRegister> => {
  // Find the substitution entry
  const substitutionEntry = await findSubstitutionEntryById(data.substitutionEntryId);

  if (!substitutionEntry) {
    throw new Error('Substitution entry not found');
  }

  // Create class register with substitution entry
  return await assignSubstitutionEntryToClassRegister(substitutionEntry, {
    substitutionEntryId: data.substitutionEntryId,
    date: date,
    substitutionType: data.substitutionType,
    note: data.note
  });
};

/**
 * Resets a class register to use its default timetable entry
 * by removing the substitution entry and finding the appropriate timetable entry
 *
 * @param lessonId - ID of the class register to reset
 * @returns The updated class register
 */
export const resetClassRegisterToDefault = async (lessonId: number) => {
  const transaction = await sequelize.transaction();
  try {
    // Find the class register
    const classRegister = await findClassRegisterById(lessonId, transaction);

    if (!classRegister) {
      throw new Error(`Class register with ID ${lessonId} not found`);
    }

    // If there's no substitution entry, nothing to reset
    if (!classRegister.substitutionEntryId) {
      return classRegister;
    }

    // Save the substitution ID before nulling it
    const entry = !classRegister.substitutionEntry
      ? classRegister.substitutionEntry
      : await findSubstitutionEntryById(classRegister.substitutionEntryId, transaction);

    if (!entry) {
      throw new Error(`Substitution entry with ID ${classRegister.substitutionEntryId} not found`);
    }

    // Find the default timetable entry based on date, class, and hour
    const defaultTimetableEntry = await findDefaultTimetableEntry(classRegister.date, entry.classId, entry.hourInDay, transaction);

    if (!defaultTimetableEntry) {
      await removeClassRegister(classRegister, transaction);
      return null;
    }

    // Reset the class register - either with default timetable or just remove substitution
    const updatedClassRegister = await resetToDefaultTimetable(classRegister, defaultTimetableEntry, transaction);

    // Check if the substitution entry is used elsewhere, if not, remove it
    await checkAndRemoveUnusedSubstitutionEntry(entry, transaction);
    await transaction.commit();
    return updatedClassRegister;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};
