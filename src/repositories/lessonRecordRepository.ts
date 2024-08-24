import { Op, WhereOptions } from 'sequelize';
import { LessonRecord } from '@models/LessonRecord';
import { TimetableSet } from '@models/TimetableSet';
import { TimetableEntry } from '@models/TimetableEntry';
import { Employee } from '@models/Employee';
import { Subject } from '@models/Subject';
import { Class } from '@models/Class';
import { SubClass } from '@models/SubClass';
import { Room } from '@models/Room';
import { timetableEntryInclude } from '@repositories/timetableRepository';

export interface LessonRecordDTO {
  classId: number;
  subClassId?: number;
  dayInWeek: number;
  hourInDay: number;
  subjectId?: number;
  teacherId?: number;
  roomId?: number;
  date: Date;
}

/*
export const findCurrentTimetableEntry = async(teacherId: number, currentDay: number, currentHour: number): Promise<LessonRecord | null> => {
  return await timeTableRepository.getTimetableByParam({teacherId: teacherId, dayInWeek: currentDay, hourInDay: currentHour});
}
*/

export const findOrCreateLessonRecord = async (
  data: LessonRecordDTO
): Promise<LessonRecord> => {
  const timetableEntry = await LessonRecord.findOne({
    where: {
      classId: data.classId,
      subClassId: data.subClassId,
      dayInWeek: data.dayInWeek,
      hourInDay: data.hourInDay
    }
  });

  if (timetableEntry) {
    return await LessonRecord.create({
      ...data,
      timetableEntryId: timetableEntry.timetableEntryId
    } as LessonRecord);
  } else {
    return await LessonRecord.create({
      ...data,
      timetableEntryId: null
    } as LessonRecord);
  }
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
