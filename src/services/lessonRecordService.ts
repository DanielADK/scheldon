import * as lessonRecordRepository from '@repositories/lessonRecordRepository';
import {
  getCurrentWeekTimetableByParam,
  LessonRecordDTO
} from '@repositories/lessonRecordRepository';
import { LessonRecord } from '@models/LessonRecord';
import { TimetableEntrySet } from '@models/TimetableEntrySet';
import { TimetableEntry } from '@models/TimetableEntry';
import { Class } from '@models/Class';
import { SubClass } from '@models/SubClass';
import { Employee } from '@models/Employee';
import { Subject } from '@models/Subject';
import { Room } from '@models/Room';
import {
  classEntryTransformer,
  TimetableExport,
  transformTimetable
} from '@services/timetableService';

export const administrativeCreateLessonRecord = async (
  data: LessonRecordDTO
): Promise<LessonRecord> => {
  return await lessonRecordRepository.findOrCreateLessonRecord(data);
};

/**
 * Convert LessonRecord to TimetableSchema, remove null values, unwrap timetableEntryes
 * @param records
 */
export const convertLessonRecordToTimetableSchema = async (
  records: LessonRecord[]
): Promise<Partial<TimetableEntrySet>[]> => {
  const convertedTimetable: Partial<TimetableEntrySet>[] = [];
  let timetableEntry: Partial<TimetableEntry> = {};
  records.forEach((record) => {
    // Remove optimization -> timetableEntry to be unwrapped
    if (record.timetableEntry === null) {
      timetableEntry = {
        dayInWeek: record.dayInWeek as number,
        hourInDay: record.hourInDay as number,
        class: record.class as Class,
        subClass: record.subClass as SubClass,
        subject: record.subject as Subject,
        teacher: record.teacher as Employee,
        room: record.room as Room
      };
    } else {
      timetableEntry = record.timetableEntry;
    }
    convertedTimetable.push({
      timetableEntry: timetableEntry as TimetableEntry
    });
  });
  return convertedTimetable;
};

export const getTimetableAtTime = async (
  id: number,
  date: Date
): Promise<TimetableExport | null> => {
  const timetable = await getCurrentWeekTimetableByParam({ classId: id }, date);
  if (!timetable) {
    return null;
  }
  const converted = await convertLessonRecordToTimetableSchema(timetable);
  return await transformTimetable(converted, classEntryTransformer);
};
