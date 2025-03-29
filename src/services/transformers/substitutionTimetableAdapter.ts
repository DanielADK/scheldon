import { TimeLessonEntry } from '@services/transformers/timetableExport';
import { ClassRegister } from '@models/ClassRegister';
import { AbstractTimetableAdapter } from '@services/transformers/AbstractTimetableAdapter';
import { TimetableEntry } from '@models/TimetableEntry';
import { SubstitutionEntry } from '@models/SubstitutionEntry';

export class SubstitutionTimetableAdapter extends AbstractTimetableAdapter<ClassRegister> {
  /**
   * Transforms a ClassRegister entry into a TimeLessonEntry object.
   *
   * @param {ClassRegister} entry - The class register entry containing data for transformation.
   *                                This should include timetable or substitution details and related metadata.
   * @return {TimeLessonEntry} The transformed lesson entry containing detailed timetable information
   *                           such as teacher, subject, room, and schedule details.
   * @throws {Error} If the input entry lacks required fields or contains invalid data.
   */
  transform(entry: ClassRegister): TimeLessonEntry {
    const lesson: TimetableEntry | SubstitutionEntry | null =
      (entry.timetableEntry ? 1 : 0) ^ (entry.substitutionEntry ? 1 : 0) ? entry.timetableEntry || entry.substitutionEntry : null;

    if (lesson === null) {
      throw new Error('Error transforming class register: Lesson record is missing');
    }

    const teacher = lesson.teacher;
    const subject = lesson.subject;
    const classData = lesson.class;
    const studentGroup = lesson.studentGroup;
    const room = lesson.room;
    const dayInWeek = lesson.dayInWeek;
    const hourInDay = lesson.hourInDay;

    if (!teacher || !subject || !classData || !room) {
      throw new Error('Timetable is missing required fields');
    }

    const result: TimeLessonEntry = {
      dayInWeek: dayInWeek,
      hourInDay: hourInDay,
      teacher: {
        name: teacher.name,
        surname: teacher.surname,
        ...(teacher.abbreviation !== null && { abbreviation: teacher.abbreviation })
      },
      subject: {
        name: subject.name,
        abbreviation: subject.abbreviation
      },
      class: { name: classData.name },
      ...(studentGroup !== null && { studentGroup: { name: studentGroup.name } }),
      room: { name: room.name },
      ...(lesson instanceof SubstitutionEntry && lesson.type !== null && { substitutionType: lesson.type })
    } as TimeLessonEntry;

    return { lessonId: entry.lessonId, ...result };
  }
}
