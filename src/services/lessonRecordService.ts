import * as lessonRecordRepository from '@repositories/lessonRecordRepository';
import { LessonRecordDTO } from '@repositories/lessonRecordRepository';
import { LessonRecord } from '@models/LessonRecord';

export const administrativeCreateLessonRecord = async (
  data: LessonRecordDTO
): Promise<LessonRecord> => {
  return await lessonRecordRepository.findOrCreateLessonRecord(data);
};
