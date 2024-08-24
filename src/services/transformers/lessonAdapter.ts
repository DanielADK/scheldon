import { TimeLessonEntry } from '@services/transformers/timetableExport';
import { LessonRecord } from '@models/LessonRecord';
import { AbstractTimetableAdapter } from '@services/transformers/AbstractTimetableAdapter';

export class LessonAdapter extends AbstractTimetableAdapter<LessonRecord> {
  transform(entry: LessonRecord): TimeLessonEntry {
    const isTemporaryLesson = entry.timetableEntry === null;

    const teacher = isTemporaryLesson
      ? entry.teacher
      : entry.timetableEntry?.teacher;
    const subject = isTemporaryLesson
      ? entry.subject
      : entry.timetableEntry?.subject;
    const classData = isTemporaryLesson
      ? entry.class
      : entry.timetableEntry?.class;
    const subClass = isTemporaryLesson
      ? entry.subClass
      : entry.timetableEntry?.subClass;
    const room = isTemporaryLesson ? entry.room : entry.timetableEntry?.room;

    if (!teacher || !subject || !classData || !room) {
      throw new Error('Lesson record is missing required fields');
    }

    const result: TimeLessonEntry = {
      dayInWeek: isTemporaryLesson
        ? (entry.dayInWeek as number)
        : (entry.timetableEntry?.dayInWeek as number),
      hourInDay: isTemporaryLesson
        ? (entry.hourInDay as number)
        : (entry.timetableEntry?.hourInDay as number),
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
      subClass: { name: subClass?.name || '' },
      room: { name: room.name }
    };

    return { lessonId: entry.lessonId, ...result };
  }
}
