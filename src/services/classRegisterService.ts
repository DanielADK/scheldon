import {
  assignSubstitutionEntryToClassRegister,
  checkAndRemoveUnusedSubstitutionEntry,
  ClassRegisterRecordDTO,
  findAllClassRegistersByTimeAndClass,
  findClassRegisterById,
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
import {
  findOrCreateSubstitutionEntry,
  findSubstitutionEntryById,
  SubstitutionTimetableEntryDTO
} from '@repositories/substitutionEntryRepository';
import { sequelize } from '../index';
import { findDefaultTimetableEntry } from '@repositories/timetableRepository';
import { getDayInWeek } from '@lib/timeLib';
import { SubstitutionEntry } from '@models/SubstitutionEntry';
import { Transaction } from 'sequelize/types';

interface ClassRegisterExport {
  lesson: {
    lessonId: number;
    topic?: string;
  };
  students: StudentWithAttendance[];
}

// Interface for the assignSubstitution DTO
interface AppendSubstitutionDTO {
  substitutionEntryId: number;
  note?: string;
}
// Interface for the assignSubstitution DTO
interface AssignSubstitutionDTO {
  lessonId: number;
  substitutionType: SubstitutionType.DROPPED | SubstitutionType.MERGED;
  note?: string;
}

export const finishLessonRecord = async (data: ClassRegisterRecordDTO): Promise<void> => {
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

export const appendSubstitutionToClassRegister = async (date: Date, data: AppendSubstitutionDTO): Promise<ClassRegister> => {
  const transaction = await sequelize.transaction();

  try {
    // Find the substitution entry
    const se = await findSubstitutionEntryById(data.substitutionEntryId, transaction);

    if (!se) {
      throw new Error('Substitution entry not found');
    }

    // Check if the substitution entry's date matches the provided date and dayInWeek
    if (se.dayInWeek !== getDayInWeek(date)) {
      throw new Error('Substitution entry does not match the provided date');
    }

    const cr = await appendSubstitution(date, se, data, transaction);

    await transaction.commit();
    return cr;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
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
    const cr = await findClassRegisterById(data.lessonId, transaction);

    if (!cr) {
      throw new Error('Lesson not found');
    }

    let newCr: ClassRegister;
    switch (data.substitutionType) {
      case SubstitutionType.MERGED:
        newCr = await mergeSubstitution(date, cr, data, transaction);
        break;
      case SubstitutionType.DROPPED:
        newCr = await dropSubstitution(date, cr, data, transaction);
        break;
      default:
        throw new Error('Invalid substitution type for assignment.');
    }

    await transaction.commit();
    return newCr;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

/**
 * Handles dropping the substitution entry and reverting a class register to an empty state with basic details.
 * This includes removing any associated substitution entry data.
 *
 * @param {Date} date - The date for which the substitution is being dropped.
 * @param lesson
 * @param {AssignSubstitutionDTO} data - Substitution DTO containing details about the substitution to drop.
 * @param {Transaction} transaction - Database transaction for atomicity.
 * @returns {Promise<ClassRegister>} A promise that resolves to the updated class register.
 */
export const dropSubstitution = async (
  date: Date,
  lesson: ClassRegister,
  data: AssignSubstitutionDTO,
  transaction: Transaction
): Promise<ClassRegister> => {
  const entry = await lesson.getEntry();

  // Check if entry is already of type SubstitutionEntry
  if (entry instanceof SubstitutionEntry) {
    throw new Error('Lesson is already substitued. Reset lesson first.');
  }

  // Find or create a SubstitutionEntry with the entry's default values
  const sentry = await findOrCreateSubstitutionEntry(
    {
      classId: entry.classId,
      studentGroupId: entry.studentGroupId ?? null,
      dayInWeek: entry.dayInWeek,
      hourInDay: entry.hourInDay,
      subjectId: entry.subjectId,
      teacherId: entry.teacherId,
      roomId: entry.roomId
    } as SubstitutionTimetableEntryDTO,
    transaction
  );

  // Clear the substitution entry and retain the class register
  return await assignSubstitutionEntryToClassRegister(
    sentry,
    {
      substitutionEntryId: sentry.substitutionEntryId,
      date: date,
      substitutionType: SubstitutionType.DROPPED,
      note: data.note
    },
    transaction
  );
};

/**
 * Handles the merging of a substitution entry into class registers for a specific date, hour, and class/student group combination.
 * This process includes finding all relevant class registers, removing them, and assigning new substitution details to a class register.
 *
 * @param {Date} date - The date for which the substitution is being processed.
 * @param {ClassRegister} lesson - Lesson
 * @param {AssignSubstitutionDTO} data - Data transfer object containing substitution information such as substitution entry ID, type, and notes.
 * @param {Transaction} transaction - The database transaction to ensure all operations are atomic.
 * @returns {Promise<ClassRegister>} A promise that resolves to the class register with the assigned substitution entry.
 * @throws {Error} If no class registers are found for the given parameters.
 */
export const mergeSubstitution = async (
  date: Date,
  lesson: ClassRegister,
  data: AssignSubstitutionDTO,
  transaction: Transaction
): Promise<ClassRegister> => {
  const entry = await lesson.getEntry();
  // Find all class registers for the given time, class, and student group
  const toMerge = await findAllClassRegistersByTimeAndClass(date, entry.hourInDay, entry.classId, transaction);

  if (!toMerge || toMerge.length === 0) {
    throw new Error('No lessons found to merge.');
  }

  // Destroy all class registers
  await ClassRegister.destroy({
    where: {
      lessonId: toMerge.map((cr) => cr.lessonId)
    },
    transaction
  });

  // Find or create a SubstitutionEntry with the entry's default values
  const sentry = await findOrCreateSubstitutionEntry(
    {
      classId: entry.classId,
      studentGroupId: null,
      dayInWeek: entry.dayInWeek,
      hourInDay: entry.hourInDay,
      subjectId: entry.subjectId,
      teacherId: entry.teacherId,
      roomId: entry.roomId
    } as SubstitutionTimetableEntryDTO,
    transaction
  );

  // Assign substitution entry to the first class register
  return await assignSubstitutionEntryToClassRegister(
    sentry,
    {
      substitutionEntryId: sentry.substitutionEntryId,
      date: date,
      substitutionType: data.substitutionType,
      note: data.note
    },
    transaction
  );
};

export const appendSubstitution = async (
  date: Date,
  se: SubstitutionEntry,
  data: AppendSubstitutionDTO,
  transaction: Transaction
): Promise<ClassRegister> => {
  // Verify if time slot is not occupied
  const cr = await findClassRegisterByTimeAndClass(date, se.hourInDay, se.classId, se.studentGroupId, transaction);
  if (cr) {
    throw new Error('Class is already occupied at the provided time.');
  }

  // Create class register with substitution entry
  return await assignSubstitutionEntryToClassRegister(
    se,
    {
      substitutionEntryId: data.substitutionEntryId,
      date: date,
      substitutionType: SubstitutionType.APPEND,
      note: data.note
    },
    transaction
  );
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
    const entry = await classRegister.getEntry();

    // find default
    const defaultTimetableEntry = await findDefaultTimetableEntry(date, entry.hourInDay, entry.classId, entry.studentGroupId, transaction);

    // if default exists, reset to default timetable entry
    if (defaultTimetableEntry) {
      await classRegister.setEntry(defaultTimetableEntry);
    } else {
      // else destroy
      await classRegister.destroy({ transaction: transaction });
    }

    // Remove zombie SEntries
    await checkAndRemoveUnusedSubstitutionEntry(entry.getId(), transaction);

    await transaction.commit();
    return classRegister;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};
