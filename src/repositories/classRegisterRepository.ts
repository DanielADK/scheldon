import { ClassRegister } from '@models/ClassRegister';
import { Student } from '@models/Student';
import { attendanceRecordDTO } from '@repositories/attendanceRepository';
import { sequelize } from '../index';
import { Study } from '@models/Study';
import { Class } from '@models/Class';
import { StudentGroup } from '@models/StudentGroup';
import { getCurrentTimetableHour } from '@lib/timeLib';
import { col, fn, Op, where, WhereOptions } from 'sequelize';
import { TimetableEntry } from '@models/TimetableEntry';
import { SubstitutionEntry } from '@models/SubstitutionEntry';
import { TimetableSet } from '@models/TimetableSet';
import { Transaction } from 'sequelize/types';
import { FilterType, validateEntity } from '@validators/substitutionEntryValidators';
import { Employee } from '@models/Employee';
import { Subject } from '@models/Subject';
import { Room } from '@models/Room';
import { AssignSubstitutionRepositoryDTO } from '@controllers/classRegisterController';

export interface classRegisterRecordDTO {
  lessonId: number;
  topic: string;
  studentAttendance: attendanceRecordDTO[];
}

export const finishLessonRecord = async (data: classRegisterRecordDTO): Promise<void> => {
  const transaction = await sequelize.transaction();
  // Find the lesson record
  const lessonRecord = await ClassRegister.findByPk(data.lessonId, {
    transaction: transaction
  });
  if (!lessonRecord) throw new Error('Lesson record not found');

  // Check if the lesson record is already finished
  if (lessonRecord.fillDate) throw new Error('Lesson record already locked&finished');

  // Update the lesson record
  lessonRecord.topic = data.topic;

  // Save the lesson record
  await lessonRecord.save();
};

/**
 * Get the current lesson record for a specific teacher
 * @param teacherId number
 * @returns Promise<ClassRegister | null>
 */
export const getCurrentLessonRecord = async (teacherId: number): Promise<ClassRegister | null> => {
  const currentTime = new Date();
  const currentHour = getCurrentTimetableHour(currentTime);

  return await ClassRegister.findOne({
    where: {
      date: { [Op.lte]: currentTime },
      [Op.and]: [
        // find first lesson record where teacherId matches
        where(fn('COALESCE', col('substitutionEntry.teacherId'), col('timetableEntry.teacherId')), teacherId),
        // find first lesson record where hourInDay matches
        where(fn('COALESCE', col('substitutionEntry.hourInDay'), col('timetableEntry.hourInDay')), currentHour)
      ]
    },
    include: [
      { model: TimetableEntry, as: 'timetableEntry', required: false },
      { model: SubstitutionEntry, as: 'substitutionEntry', required: false }
    ]
  });
};

/**
 * Get the list of students for a given lesson
 * @param lessonId string
 * @returns Promise<Student[]>
 */
export const getStudentsForLesson = async (lessonId: number): Promise<Student[]> => {
  // Find the lesson and include the timetable entry
  const lesson = await ClassRegister.findByPk(lessonId, {
    include: ['timetableEntry', 'substitutionEntry']
  });

  if (!lesson) throw new Error('Lesson not found');

  // Determine the entry source (either TimetableEntry or ClassRegister itself)
  const entry = lesson.substitutionEntry ?? lesson.timetableEntry;
  if (!entry || !entry.classId) {
    throw new Error('Lesson does not have a class assigned');
  }

  const now = new Date();
  const dateWhere: WhereOptions = {
    validFrom: { [Op.lte]: now },
    validTo: { [Op.gte]: now }
  };

  // Find the students based on class and studentGroup
  const study = entry.studentGroupId
    ? await StudentGroup.findByPk(entry.id, {
        include: [
          {
            model: Study,
            include: ['student'],
            where: dateWhere
          }
        ]
      })
    : await Class.findByPk(entry.id, {
        include: [
          {
            model: Study,
            include: ['student'],
            where: dateWhere
          }
        ]
      });

  if (!study) throw new Error('No students found for the lesson');

  return study.studies.map((assignment) => assignment.student);
};

export const getLessonBulkInTSetPeriod = async (tset: TimetableSet, data: TimetableEntry): Promise<ClassRegister[]> => {
  const lessons: ClassRegister[] = [];
  const validTo: Date = new Date(tset.validTo);
  const date: Date = new Date(tset.validFrom);

  // Find first occurrence of TimeTableEntry dayInWeek from validFrom date
  // Convert Sun-Sat to Mon-Sun
  let dayInWeekFrom = date.getDay();
  dayInWeekFrom = dayInWeekFrom === 0 ? 6 : dayInWeekFrom - 1;

  // Calculate the difference between the two days with overflow
  let dateDiff = data.dayInWeek - dayInWeekFrom;
  dateDiff = dateDiff < 0 ? dateDiff + 7 : dateDiff;

  // Set the date to the first occurrence of the dayInWeek
  date.setDate(date.getDate() + dateDiff);

  // Fill the timetable set with lessons between dates
  while (date < validTo) {
    lessons.push({
      timetableEntryId: data.timetableEntryId,
      date: new Date(date)
    } as ClassRegister);

    // Add week to date
    date.setDate(date.getDate() + 7);
  }

  return lessons;
};

/**
 * Get a lesson with a specified timetableEntryId
 * @param timetableEntryId number
 * @param transaction Transaction | null
 * @returns Promise<ClassRegister[]>
 */
export const getLessonWithTimetableEntryId = async (
  timetableEntryId: number,
  transaction: Transaction | null = null
): Promise<ClassRegister[]> => {
  return await ClassRegister.findAll({
    where: { timetableEntryId: timetableEntryId },
    transaction
  });
};

/**
 * Gets temporary timetable entries based on specified filters
 *
 * @param filterType The entity type to filter by ('class', 'teacher', 'room', etc.)
 * @param entityId The ID of the entity to filter
 * @param date The date to filter by
 * @returns Promise with class register
 */
export const getTemporaryTimetable = async (filterType: FilterType, entityId: number, date: Date): Promise<ClassRegister[]> => {
  // validate that the entity exists based on filterType
  await validateEntity(filterType, entityId);

  // map filter type to the field names in SubstitutionEntry and TimetableEntry
  const fieldName = `${filterType}Id`;

  return await ClassRegister.findAll({
    attributes: ['lessonId', 'substitutionType'],
    where: {
      date: date,
      [Op.or]: [
        { substitutionEntryId: { [Op.not]: null }, [`$substitutionEntry.${fieldName}$`]: entityId },
        { timetableEntryId: { [Op.not]: null }, [`$timetableEntry.${fieldName}$`]: entityId }
      ]
    },
    include: [
      {
        model: SubstitutionEntry,
        attributes: ['dayInWeek', 'hourInDay'],
        include: [
          { model: Class, attributes: ['name'] },
          { model: StudentGroup, attributes: ['name'] },
          { model: Employee, attributes: ['name', 'surname', 'abbreviation'] },
          { model: Subject, attributes: ['name', 'abbreviation'] },
          { model: Room, attributes: ['name'] }
        ]
      },
      {
        model: TimetableEntry,
        attributes: ['dayInWeek', 'hourInDay'],
        include: [
          { model: Class, attributes: ['name'] },
          { model: StudentGroup, attributes: ['name'] },
          { model: Employee, attributes: ['name', 'surname', 'abbreviation'] },
          { model: Subject, attributes: ['name', `abbreviation`] },
          { model: Room, attributes: ['name'] }
        ]
      }
    ]
  });
};

/**
 * Find a substitution entry by ID
 *
 * @param id - The ID of the substitution entry
 * @returns Promise<SubstitutionEntry | null> - The found substitution entry or null
 */
export const findSubstitutionEntryById = async (id: number): Promise<SubstitutionEntry | null> => {
  return SubstitutionEntry.findByPk(id);
};

/**
 * Create a class register with a substitution entry
 *
 * @param substitutionEntry
 * @param data - The data for creating a class register with substitution
 * @returns Promise<ClassRegister> - The created class register
 * @throws Error if there is a conflict or validation fails
 */
export const assignSubstitutionEntryToClassRegister = async (
  substitutionEntry: SubstitutionEntry,
  data: AssignSubstitutionRepositoryDTO
): Promise<ClassRegister> => {
  const transaction = await sequelize.transaction();

  try {
    // Check if the substitution entry exists

    if (!substitutionEntry) {
      await transaction.rollback();
      throw new Error('Substitution entry not found');
    }

    // Create the class register with the substitution entry
    const classRegister = await ClassRegister.create(
      {
        substitutionEntryId: data.substitutionEntryId,
        date: data.date,
        substitutionType: data.substitutionType,
        topic: null,
        fillDate: null,
        note: data.note || null,
        timetableEntryId: null
      } as ClassRegister,
      { transaction }
    );

    await transaction.commit();
    return classRegister;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

/**
 * Find class register by its ID with associated entities
 */
export const findClassRegisterById = async (lessonId: number, transaction: Transaction) => {
  return ClassRegister.findByPk(lessonId, {
    include: [{ model: SubstitutionEntry, required: false }],
    transaction
  });
};

/**
 * Reset a class register to use the default timetable entry instead of substitution
 *
 * @param classRegister - ClassRegister object
 * @param timetableEntry - Timetable Entry object
 * @param transaction - Transaction object
 * @returns The updated class register
 */
export const resetToDefaultTimetable = async (classRegister: ClassRegister, timetableEntry: TimetableEntry, transaction: Transaction) => {
  await classRegister.update(
    {
      substitutionEntryId: null,
      timetableEntryId: timetableEntry.timetableEntryId,
      substitutionType: null,
      topic: null,
      fillDate: null,
      note: null
    },
    { transaction }
  );

  return classRegister;
};

/**
 * Check if a substitution entry is used by any class registers
 * If not used, remove it from the database
 *
 * @param substitutionEntry - SubstitutionEntry object to check
 * @param transaction - Transaction object
 */
export const checkAndRemoveUnusedSubstitutionEntry = async (substitutionEntry: SubstitutionEntry, transaction: Transaction) => {
  if (!substitutionEntry.substitutionEntryId) return;

  // Count usages of this substitution entry
  const usageCount = await ClassRegister.count({
    where: {
      substitutionEntryId: substitutionEntry.substitutionEntryId
    },
    transaction
  });

  // If no longer used, delete the substitution entry
  if (usageCount === 0) {
    await SubstitutionEntry.destroy({
      where: { substitutionEntryId: substitutionEntry.substitutionEntryId },
      transaction
    });
  }
};

/**
 * Remove a class register within a transaction
 *
 * @param classRegister - The class register object to remove
 * @param transaction - The transaction object to use
 * @returns Promise<void> - Resolves when the record is deleted
 */
export const removeClassRegister = async (classRegister: ClassRegister, transaction: Transaction): Promise<void> => {
  await classRegister.destroy({ transaction });
};
