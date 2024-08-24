import * as lessonRecordRepository from '@repositories/lessonRecordRepository';
import { LessonRecordDTO } from '@repositories/lessonRecordRepository';
import { LessonRecord } from '@models/LessonRecord';
import {
  classMask,
  employeeMask,
  roomMask,
  TimetableExport,
  transformAndMask
} from '@services/transformers/timetableExport';
import { LessonAdapter } from '@services/transformers/lessonAdapter';

export const administrativeCreateLessonRecord = async (
  data: LessonRecordDTO
): Promise<LessonRecord> => {
  return await lessonRecordRepository.findOrCreateLessonRecord(data);
};

/**
 * Get timetable by class ID
 * @param classId int
 * @param date
 */
export const getTimetableByClassId = async (
  classId: number,
  date: Date = new Date()
): Promise<TimetableExport | null> => {
  const timetable = await lessonRecordRepository.getCurrentWeekTimetableByParam(
    { classId: classId },
    date
  );
  return transformAndMask(timetable, new LessonAdapter(), classMask);
};

/**
 * Get timetable by employee ID
 * @param employeeId int
 * @param date
 */
export const getTimetableByEmployeeId = async (
  employeeId: number,
  date: Date = new Date()
): Promise<TimetableExport | null> => {
  const timetable = await lessonRecordRepository.getCurrentWeekTimetableByParam(
    { teacherId: employeeId },
    date
  );
  return transformAndMask(timetable, new LessonAdapter(), employeeMask);
};

/**
 * Get timetable by room ID
 * @param roomId int
 * @param date
 */
export const getTimetableByRoomId = async (
  roomId: number,
  date: Date = new Date()
): Promise<TimetableExport | null> => {
  const timetable = await lessonRecordRepository.getCurrentWeekTimetableByParam(
    { roomId: roomId },
    date
  );
  return transformAndMask(timetable, new LessonAdapter(), roomMask);
};
