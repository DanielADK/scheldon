import {
  assignSubstitutionEntryToClassRegister,
  classRegisterRecordDTO,
  findClassRegisterByTimeAndClass,
  finishLessonRecord as finishLessonRecordInRepository,
  getCurrentLessonRecord,
  getStudentsForLesson
} from '@repositories/classRegisterRepository';
import { AttendanceType } from '@models/types/AttendanceType';
import { Attendance } from '@models/Attendance';
import { Student } from '@models/Student';
import { getLessonAttendance } from '@repositories/attendanceRepository';
import { ClassRegister } from '@models/ClassRegister';
import { SubstitutionType } from '@models/types/SubstitutionType';
import { findSubstitutionEntryById } from '@repositories/substitutionEntryRepository';
import { sequelize } from '../index';
import { findDefaultTimetableEntry } from '@repositories/timetableRepository';
import { getDayInWeek } from '@lib/timeLib';

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
 * @param date
 * @param data - The data for assigning a substitution entry
 * @returns Promise<ClassRegister> - The created class register
 * @throws Error if the substitution entry doesn't exist
 */
export const assignSubstitutionToClassRegister = async (date: Date, data: AssignSubstitutionDTO): Promise<ClassRegister> => {
  const transaction = await sequelize.transaction();

  try {
    // Find the substitution entry
    const substitutionEntry = await findSubstitutionEntryById(data.substitutionEntryId, transaction);

    if (!substitutionEntry) {
      throw new Error('Substitution entry not found');
    }

    // Check if the substitution entry's date matches the provided date and dayInWeek
    if (substitutionEntry.dayInWeek !== getDayInWeek(date)) {
      throw new Error('Substitution entry does not match the provided date');
    }

    // Verify if time slot is not occupied
    const existingEntry = await findClassRegisterByTimeAndClass(
      date,
      substitutionEntry.hourInDay,
      substitutionEntry.classId,
      substitutionEntry.studentGroupId,
      transaction
    );
    if (existingEntry) {
      throw new Error('Class is already occupied at the provided time.');
    }

    // Create class register with substitution entry
    const cr = await assignSubstitutionEntryToClassRegister(
      substitutionEntry,
      {
        substitutionEntryId: data.substitutionEntryId,
        date: date,
        substitutionType: data.substitutionType,
        note: data.note
      },
      transaction
    );
    await transaction.commit();
    return cr;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

/**
 * Reset class register to default timetable entry
 *
 * @param date The date for the class register
 * @param data Information about the class register to reset
 * @returns The updated class register or null if no changes were made
 */
export const resetClassRegisterToDefault = async (
  date: Date,
  data: {
    classId: number;
    studentGroupId: number | null;
    hourInDay: number;
  }
): Promise<ClassRegister | null> => {
  const transaction = await sequelize.transaction();

  try {
    // Find class register for the given parameters
    const classRegister = await findClassRegisterByTimeAndClass(date, data.hourInDay, data.classId, data.studentGroupId, transaction);

    if (!classRegister) {
      throw new Error('Class register not found');
    }
    const entry = classRegister.getEntry();

    // find default
    const defaultTimetableEntry = await findDefaultTimetableEntry(date, entry.hourInDay, entry.classId, entry.studentGroupId, transaction);

    // if default exists, reset to default timetable entry
    if (defaultTimetableEntry) {
      await classRegister.setEntry(defaultTimetableEntry);
    } else {
      // else destroy
      await classRegister.destroy({ transaction: transaction });
    }

    await transaction.commit();
    return classRegister;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};
