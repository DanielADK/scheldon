import { Op, WhereOptions } from 'sequelize';
import { LessonRecord } from '@models/LessonRecord';
import { TimetableSet } from '@models/TimetableSet';
import { TimetableEntry } from '@models/TimetableEntry';
import { Employee } from '@models/Employee';
import { Subject } from '@models/Subject';
import { Class } from '@models/Class';
import { SubClass } from '@models/SubClass';
import { Room } from '@models/Room';
import {
  getTimetableByParam,
  timetableEntryInclude
} from '@repositories/timetableRepository';
import { LessonType } from '@models/types/LessonType';
import { TimetableEntrySet } from '@models/TimetableEntrySet';
import { sequelize } from '../index';

export interface LessonRecordDTO {
  classId: number;
  subClassId?: number;
  dayInWeek: number;
  hourInDay: number;
  subjectId?: number;
  teacherId?: number;
  roomId?: number;
  date: Date;
  type: LessonType;
}

/*
export const findCurrentTimetableEntry = async(teacherId: number, currentDay: number, currentHour: number): Promise<LessonRecord | null> => {
  return await timeTableRepository.getTimetableByParam({teacherId: teacherId, dayInWeek: currentDay, hourInDay: currentHour});
}
*/

/**
 * Find or create a lesson record in the timetable
 * If lesson record exists, remove standard TimetableEntry, update new lesson identifiers
 * If lesson record does not exist, create a new lesson record with custom identifiers
 * @param data LessonRecordDTO
 */
export const createCustomLesson = async (
  data: LessonRecordDTO
): Promise<LessonRecord> => {
  // Check if the lesson is not exists in the timetable
  const lesson = await LessonRecord.findOne({
    where: {
      dayInWeek: data.dayInWeek,
      hourInDay: data.hourInDay,
      date: data.date
    }
  });

  if (lesson) {
    // If the lesson exists, update the lesson with custom identifiers
    return await lesson.update({
      timetableEntryId: null,
      type: data.type,
      classId: data.classId,
      subClassId: data.subClassId,
      dayInWeek: data.dayInWeek,
      hourInDay: data.hourInDay,
      subjectId: data.subjectId,
      teacherId: data.teacherId,
      roomId: data.roomId,
      date: data.date
    });
  } else {
    // If the lesson does not exist, create a new lesson with custom identifiers
    return await LessonRecord.create({
      ...data,
      timetableEntryId: null
    } as LessonRecord);
  }
};

/**
 * Delete a lesson record from the timetable
 * Sets timetableEntryId to default value from TEntry and type to DROPPED
 * @param id string
 */
export const deleteLessonRecord = async (id: string): Promise<void> => {
  const transaction = await sequelize.transaction();
  try {
    const lesson = await LessonRecord.findByPk(id, {
      transaction: transaction
    });

    if (!lesson) {
      throw new Error('Lesson record not found');
    }

    // If the lesson has no timetableEntryId,
    // find the default timetable entry and drop
    if (!lesson.timetableEntryId) {
      const tentrySet: TimetableEntrySet[] | null = await getTimetableByParam({
        where: {
          where: {
            classId: lesson.classId,
            subClassId: lesson.subClassId,
            dayInWeek: lesson.dayInWeek,
            hourInDay: lesson.hourInDay
          }
        },
        time: lesson.date,
        transaction: transaction
      });

      // If the default timetable entry is not found, throw an error
      if (!tentrySet || tentrySet.length != 1) {
        throw new Error('Timetable entry not found');
      }

      // Get the default timetable entry
      const tentry: TimetableEntry = tentrySet[0].timetableEntry;

      // Update the lesson to link it back to the original timetable entry
      await lesson.update(
        {
          timetableEntryId: tentry.timetableEntryId,
          type: LessonType.DROPPED,
          classId: null,
          subClassId: null,
          dayInWeek: null,
          hourInDay: null,
          subjectId: null,
          teacherId: null,
          roomId: null,
          fillDate: new Date()
        },
        { transaction: transaction }
      );
    } else {
      // Otherwise, just update the lesson to mark it as DROPPED
      await lesson.update(
        {
          type: LessonType.DROPPED,
          fillDate: new Date()
        },
        { transaction: transaction }
      );
    }
  } catch (err) {
    await transaction.rollback();
    throw err;
  }

  await transaction.commit();
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
      date: new Date(date)
    } as LessonRecord);

    // Add week to date
    date.setDate(date.getDate() + 7);
  }

  return lessons;
};

/**
 * Get date range Monday to Friday
 * @param time
 */
export const getWeekRange = (time: Date): { start: Date; end: Date } => {
  const date = new Date(time);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(date.setDate(diff));
  const friday = new Date(date.setDate(diff + 4));

  return { start: monday, end: friday };
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
      'date'
    ]
  });
};
