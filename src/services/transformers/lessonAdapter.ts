import { TimeLessonEntry } from '@services/transformers/timetableExport';
import { LessonRecord } from '@models/LessonRecord';
import { AbstractTimetableAdapter } from '@services/transformers/AbstractTimetableAdapter';

export class LessonAdapter extends AbstractTimetableAdapter<LessonRecord> {
  transform(entry: LessonRecord): TimeLessonEntry {
    const lesson = entry.timetableEntry === null ? entry : entry.timetableEntry;
    if (lesson === null) {
      throw new Error('Lesson record is missing timetable entry');
    }

    const teacher = lesson.teacher;
    const subject = lesson.subject;
    const classData = lesson.class;
    const subClass = lesson.subClass;
    const room = lesson.room;
    const dayInWeek = lesson.dayInWeek;
    const hourInDay = lesson.hourInDay;

    if (!teacher || !subject || !classData || !room) {
      throw new Error('Lesson record is missing required fields');
    }

    const result: TimeLessonEntry = {
      dayInWeek: dayInWeek as number,
      hourInDay: hourInDay as number,
      teacher: {
        name: teacher.name,
        surname: teacher.surname,
        abbreviation: teacher.abbreviation || ''
      },
      subject: {
        name: subject.name,
        abbreviation: subject.abbreviation
      },
      class: { name: classData.name },
      ...(subClass !== null && { subClass: { name: subClass.name } }),
      room: { name: room.name },
      ...(entry.type !== null && { type: entry.type })
    };

    return { lessonId: entry.lessonId, ...result };
  }
}
