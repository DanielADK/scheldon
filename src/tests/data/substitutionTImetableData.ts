import { LessonRecordDTO } from '@repositories/lessonRecordRepository';
import { addDays, startOfWeek } from '../scripts/lib';

export const temporaryLessons: LessonRecordDTO[] = [
  {
    classId: 1,
    dayInWeek: 0,
    hourInDay: 0,
    subjectId: 2,
    teacherId: 2,
    roomId: 2,
    date: addDays(startOfWeek(new Date()), 0).toISOString(),
    type: 'A'
  },
  {
    classId: 1,
    dayInWeek: 0,
    hourInDay: 1,
    date: addDays(startOfWeek(new Date()), 0).toISOString(),
    type: 'M'
  },
  {
    classId: 1,
    dayInWeek: 1,
    hourInDay: 2,
    subjectId: 5,
    teacherId: 2,
    roomId: 2,
    date: addDays(startOfWeek(new Date()), 1).toISOString(),
    type: 'A'
  }
];
