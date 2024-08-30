import { Op, Transaction, WhereOptions } from 'sequelize';
import { LessonRecord } from '@models/LessonRecord';
import { TimetableSet } from '@models/TimetableSet';
import { TimetableEntry } from '@models/TimetableEntry';
import { Employee } from '@models/Employee';
import { Subject } from '@models/Subject';
import { Class } from '@models/Class';
import { SubClass } from '@models/SubClass';
import { Room } from '@models/Room';
import { timetableEntryInclude } from '@repositories/timetableRepository';
import { LessonType } from '@models/types/LessonType';
import { sequelize } from '../index';

import { getWeekRange } from '../lib/timeLib';

export interface LessonRecordDTO {
  classId: number;
  subClassId?: number;
  dayInWeek: number;
  hourInDay: number;
  subjectId?: number;
  teacherId?: number;
  roomId?: number;
  date: string;
  type: string;
}

/**
 * Find or create a lesson record in the timetable
 * If lesson record exists, remove standard TimetableEntry, update new lesson identifiers
 * If lesson record does not exist, create a new lesson record with custom identifiers
 * @param data LessonRecordDTO
 */
export const createCustomLesson = async (
  data: LessonRecordDTO
): Promise<LessonRecord> => {
  // Dropped with DELETE method
  if (data.type === LessonType.DROPPED) {
    throw new Error('Use DELETE method for dropping lessons');
  }

  const whereClause: WhereOptions = {
    dayInWeek: data.dayInWeek,
    hourInDay: data.hourInDay,
    classId: data.classId
  };
  // Only include subClassId in the where clause if it's defined
  if (data.subClassId !== undefined) {
    whereClause.subClassId = data.subClassId ?? { [Op.is]: null };
  }

  // Start a transaction
  const transaction = await sequelize.transaction();
  // Step 1: Check if the lesson already exists
  const existingLesson = await LessonRecord.findOne({
    where: {
      date: data.date,
      [Op.or]: [
        {
          // Case 1: timetableEntryId is null, search in LessonRecord fields
          timetableEntryId: null,
          date: data.date,
          ...whereClause
        },
        {
          // Case 2: timetableEntryId is not null, search in the related TimetableEntry
          timetableEntryId: { [Op.ne]: null }
        }
      ]
    },
    include: [
      {
        model: TimetableEntry,
        where: whereClause,
        required: false // Allow null TimetableEntry for Case 1
      }
    ],
    transaction: transaction
  });

  // Define the lesson record
  let lr = {
    timetableEntryId: null,
    classId: data.classId,
    subClassId: data.subClassId,
    subjectId: data.subjectId,
    teacherId: data.teacherId,
    roomId: data.roomId,
    type: data.type as LessonType,
    date: new Date(data.date)
  } as LessonRecord;

  if (existingLesson) {
    // Check if the lesson is already filled
    if (existingLesson.isFilled()) {
      await transaction.rollback();
      throw new Error('Lesson record is already filled, cannot update.');
    }

    // Step 2: If the lesson exists, update it with custom identifiers
    lr = await existingLesson.update(lr);
  } else {
    // Step 3: If the lesson does not exist, create a new lesson record
    await LessonRecord.generateUniqueLessonId(lr);

    lr = await LessonRecord.create(lr);
  }

  // Commit transaction
  await transaction.commit();
  return lr;
};

/**
 * Delete a lesson record from the timetable
 * Sets timetableEntryId to default value from TEntry
 * @param id string
 */
export const deleteLessonRecord = async (id: string): Promise<void> => {
  // Start a transaction
  const transaction = await sequelize.transaction();

  try {
    // Find the lesson record by ID
    const lessonRecord = await LessonRecord.findByPk(id, { transaction });
    if (!lessonRecord) {
      throw new Error('Lesson record not found');
    }

    // If timetableEntryId is already null, nothing to restore
    if (!lessonRecord.timetableEntryId) {
      throw new Error(
        'This lesson record is already in a custom state, cannot restore.'
      );
    }

    // Find the default timetable entry for the lesson record
    const defaultTimetableEntry = await findDefaultTimetableEntry(
      lessonRecord.classId!,
      lessonRecord.subClassId,
      lessonRecord.dayInWeek!,
      lessonRecord.hourInDay!,
      transaction
    );

    if (!defaultTimetableEntry) {
      throw new Error(
        'No default standard timetable found for this lesson record'
      );
    }

    // Update the lesson record with the default timetable entry
    await lessonRecord.update(
      {
        timetableEntryId: defaultTimetableEntry.timetableEntryId,
        teacherId: defaultTimetableEntry.teacherId,
        subjectId: defaultTimetableEntry.subjectId,
        roomId: defaultTimetableEntry.roomId,
        type: null // Reset the lesson type since it's now a standard lesson
      },
      { transaction }
    );

    // Commit the transaction
    await transaction.commit();
  } catch (error) {
    // Rollback the transaction in case of an error
    await transaction.rollback();
    throw error;
  }
};

/**
 * Find the default timetable entry for a lesson record
 * @param classId number - Class ID
 * @param subClassId number | null - SubClass ID
 * @param dayInWeek number - Day in week (0-6)
 * @param hourInDay number - Hour in day
 * @param transaction
 * @returns Promise<TimetableEntry | null>
 */
export const findDefaultTimetableEntry = async (
  classId: number,
  subClassId: number | null,
  dayInWeek: number,
  hourInDay: number,
  transaction: Transaction | null = null
): Promise<TimetableEntry | null> => {
  // Build the where clause for TimetableEntry
  const whereClause: WhereOptions = {
    classId: classId,
    dayInWeek: dayInWeek,
    hourInDay: hourInDay
  };

  // Add subClassId to where clause if it's provided
  if (subClassId !== null) {
    whereClause.subClassId = subClassId;
  } else {
    whereClause.subClassId = { [Op.is]: null }; // Handle null subClassId
  }

  // Find the default TimetableEntry based on the given parameters
  return await TimetableEntry.findOne({
    where: whereClause,
    ...(transaction !== null && { transaction: transaction })
  });
};

/**
 * Create lessons in the timetable set validity period
 * @param tset TimetableSet
 * @param data TimetableEntryDTO
 */
export const getLessonBulkInTSetPeriod = async (
  tset: TimetableSet,
  data: TimetableEntry
): Promise<LessonRecord[]> => {
  const lessons: LessonRecord[] = [];
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
      date: new Date(date),
      lessonId: await LessonRecord.generateLessonId()
    } as LessonRecord);

    // Add week to date
    date.setDate(date.getDate() + 7);
  }

  return lessons;
};

/**
 * Get current week timetable selected by WHERE parameters
 * @param where WhereOptions
 * @param time Date
 */
export const getCurrentWeekTimetableByParam = async (
  where: WhereOptions = {},
  time: Date = new Date()
): Promise<LessonRecord[] | null> => {
  const { start, end } = getWeekRange(time);

  return await LessonRecord.findAll({
    where: {
      [Op.and]: {
        date: {
          [Op.between]: [start, end]
        },
        [Op.or]: [
          // Temporary lesson - null TEntryID, identifiers in LessonRecord
          { timetableEntryId: { [Op.is]: null }, ...where },
          // Permanent lesson - TEntryID, identifiers in TimetableEntry
          { timetableEntryId: { [Op.not]: null } }
        ]
      }
    },
    include: [
      {
        model: TimetableEntry,
        include: timetableEntryInclude,
        attributes: ['dayInWeek', 'hourInDay'],
        // Where clause for TimetableEntry identifiers
        ...where
      },
      {
        model: Employee,
        attributes: ['name', 'surname', 'abbreviation']
      },
      {
        model: Subject,
        attributes: ['name', 'abbreviation']
      },
      {
        model: Class,
        attributes: ['name']
      },
      {
        model: SubClass,
        attributes: ['name']
      },
      {
        model: Room,
        attributes: ['name']
      }
    ],
    attributes: [
      'lessonId',
      'dayInWeek',
      'hourInDay',
      'classId',
      'subClassId',
      'subjectId',
      'teacherId',
      'roomId',
      'date',
      'type'
    ]
  });
};
