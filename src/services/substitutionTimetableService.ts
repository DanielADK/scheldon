import * as lessonRecordRepository from '@repositories/lessonRecordRepository';
import { LessonRecordDTO } from '@repositories/lessonRecordRepository';
import { ClassRegister } from '@models/ClassRegister';

/**
 * Create a custom lesson record in the timetable
 * @param data LessonRecordDTO
 */
export const createCustomLessonRecord = async (data: LessonRecordDTO): Promise<ClassRegister> => {
  return await lessonRecordRepository.createCustomLesson(data);
};

/**
 * Delete a lesson record from the timetable
 * @param id string
 */
export const deleteLessonRecord = async (id: string): Promise<void> => {
  return await lessonRecordRepository.deleteLessonRecord(id);
};

/**
 * Get timetable by class ID
 * @param classId int
 * @param date
 */
/*export const getTimetableByClassId = async (classId: number, date: Date = new Date()): Promise<TimetableExport | null> => {
  const timetable = await lessonRecordRepository.getCurrentWeekTimetableByParam({ classId: classId }, date);
  return transformAndMask(timetable, new LessonAdapter(), classMask);
};*/

/**
 * Get timetable by employee ID
 * @param employeeId int
 * @param date
 */
/*export const getTimetableByEmployeeId = async (
  employeeId: number,
  date: Date = new Date()
): Promise<TimetableExport | null> => {
  const timetable = await lessonRecordRepository.getCurrentWeekTimetableByParam(
    { teacherId: employeeId },
    date
  );
  return transformAndMask(timetable, new LessonAdapter(), employeeMask);
};*/

/**
 * Get timetable by room ID
 * @param roomId int
 * @param date
 */
/*export const getTimetableByRoomId = async (
  roomId: number,
  date: Date = new Date()
): Promise<TimetableExport | null> => {
  const timetable = await lessonRecordRepository.getCurrentWeekTimetableByParam(
    { roomId: roomId },
    date
  );
  return transformAndMask(timetable, new LessonAdapter(), roomMask);
};*/
