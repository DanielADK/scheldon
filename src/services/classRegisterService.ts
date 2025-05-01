import {
  assignSubstitutionEntryToClassRegister,
  bulkUpdateAttendanceRecords,
  checkAndRemoveUnusedSubstitutionEntry,
  findAllClassRegistersByTimeAndClass,
  findClassRegisterById,
  findClassRegisterByTimeAndClass,
  getStudentsAtLesson
} from '@repositories/classRegisterRepository';
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
import { ClassRegisterEntry, StudentAttendance, transformClassRegister } from '@services/transformers/classRegisterExport';
import { ClassRegisterAdapter } from '@services/transformers/classRegisterAdapter';
import { transformAttendance } from '@services/transformers/attendanceExport';
import { AttendanceAdapter } from '@services/transformers/attendanceAdapter';
import { Attendance } from '@models/Attendance';
import { AttendanceType } from '@models/types/AttendanceType';
import { AttendanceSchema, UpdateLessonSchema } from '@controllers/classRegisterController';

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

/**
 * Appends a substitution entry to a class register if the specified time slot is not already occupied.
 *
 * @param {Date} date - The date of the substitution.
 * @param {SubstitutionEntry} se - The substitution entry details including hour in day, class ID, and student group ID.
 * @param {AppendSubstitutionDTO} data - Data transfer object containing substitution details like substitution entry ID and note.
 * @param {Transaction} transaction - Database transaction instance for handling the operation.
 * @returns {Promise<ClassRegister>} A promise resolving to the created class register with the appended substitution entry.
 * @throws {Error} If the time slot is already occupied.
 */
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

/**
 * Retrieves a lesson by its ID, transforms it into a standardized format,
 * and returns the resulting `ClassRegisterEntry`. If the lesson is not found, returns `null`.
 *
 * @param {number} lessonId - The unique identifier of the lesson to be retrieved.
 * @returns {Promise<ClassRegisterEntry | null>} A promise resolving to the transformed lesson data
 *                                              as a `ClassRegisterEntry` object or `null` if not found.
 */
export const getLesson = async (lessonId: number): Promise<ClassRegisterEntry | null> => {
  const lesson = await findClassRegisterById(lessonId);
  return transformClassRegister(lesson, new ClassRegisterAdapter());
};

/**
 *  * Retrieves and processes attendance for a specific lesson.
 * Combines attendance data and student list, applying necessary transformations.
 *
 * @param {number} lessonId - The ID of the lesson for which to retrieve the attendance.
 * @param transaction
 * @returns {Promise<StudentAttendance[] | null>} A promise that resolves to an array of student attendance objects or null
 * if the attendance cannot be determined.
 * @throws {Error} If the lesson with the provided ID is not found.
 */
export const getLessonsAttendance = async (lessonId: number, transaction?: Transaction): Promise<StudentAttendance[] | null> => {
  const lesson = await findClassRegisterById(lessonId, transaction);
  if (!lesson) {
    throw new Error(`Lesson with ID ${lessonId} not found`);
  }

  // Parallel fetch
  // eslint-disable-next-line prefer-const
  let [attendance, studentsAtLesson] = await Promise.all([
    getLessonAttendance(lesson.lessonId, true, transaction),
    getStudentsAtLesson(lesson.lessonId, transaction)
  ]);

  // Initialize attendance as empty array if it's null
  attendance ??= [];

  // processed students attendance
  const attendanceStudentIds = new Set<number>((attendance || []).map((item) => item.studentId));

  // Iterate through studentsAtLesson and ensure every student has a default attendance entry
  for (const student of studentsAtLesson) {
    if (!attendanceStudentIds.has(student.studentId)) {
      attendance.push({
        student: student,
        attendance: AttendanceType.PRESENT
      } as Attendance);
    }
  }

  return transformAttendance(attendance, new AttendanceAdapter());
};

/**
 * Updates the attendance records for a lesson.
 *
 * @param {number} lessonId - The lesson ID.
 * @param {AttendanceSchema[]} toUpdate - Attendance records to update.
 * @throws {Error} If the lesson is not found or the update fails.
 * @returns {Promise<void>} Resolves when the update is completed.
 */
export const updateAttendance = async (lessonId: number, toUpdate: AttendanceSchema[]): Promise<void> => {
  const lesson = await findClassRegisterById(lessonId);
  if (!lesson) throw new Error(`Lesson with ID ${lessonId} not found`);

  const transaction = await sequelize.transaction();
  try {
    const currentAttendance: StudentAttendance[] | null = await getLessonsAttendance(lessonId, transaction);

    const currentAttendanceMap = new Map<number, AttendanceType>(
      (currentAttendance ?? []).map((record) => [record.student.studentId, record.attendance])
    );

    const updates: Attendance[] = toUpdate
      .filter((record) => currentAttendanceMap.get(record.studentId) !== record.attendance)
      .map((record) => ({ studentId: record.studentId, attendance: record.attendance, classRegisterId: lesson.lessonId }) as Attendance);

    await bulkUpdateAttendanceRecords(updates, transaction);

    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const updateLesson = async (lessonId: number, data: UpdateLessonSchema): Promise<void> => {
  const lesson = await findClassRegisterById(lessonId);
  if (!lesson) throw new Error(`Lesson with ID ${lessonId} not found`);
  const transaction = await sequelize.transaction();
  try {
    await lesson.update({ ...data, fillDate: new Date() }, { transaction: transaction });
    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};
