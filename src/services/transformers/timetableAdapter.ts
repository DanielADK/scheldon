import { TimetableEntrySet } from '@models/TimetableEntrySet';
import { TimeLessonEntry } from '@services/transformers/timetableExport';
import { AbstractAdapter } from '@services/transformers/AbstractAdapter';

/**
 * Adapter class to transform `TimetableEntrySet` objects into `TimeLessonEntry` objects.
 * Extends the `AbstractAdapter` class.
 */
export class TimetableAdapter extends AbstractAdapter<TimetableEntrySet, TimeLessonEntry> {
  /**
   * Transforms a `TimetableEntrySet` object into a `TimeLessonEntry` object.
   *
   * @param {TimetableEntrySet} entry - The timetable entry set to transform.
   * @returns {TimeLessonEntry} The transformed timetable entry.
   */
  async transform(entry: TimetableEntrySet): Promise<TimeLessonEntry> {
    return {
      dayInWeek: entry.timetableEntry.dayInWeek,
      hourInDay: entry.timetableEntry.hourInDay,
      teacher: {
        name: entry.timetableEntry.teacher.name,
        surname: entry.timetableEntry.teacher.surname,
        ...(entry.timetableEntry.teacher.abbreviation !== null && {
          abbreviation: entry.timetableEntry.teacher.abbreviation
        })
      },
      subject: {
        name: entry.timetableEntry.subject.name,
        abbreviation: entry.timetableEntry.subject.abbreviation
      },
      class: { name: entry.timetableEntry.class.name },
      ...(entry.timetableEntry.studentGroup !== null && {
        studentGroup: entry.timetableEntry.studentGroup.name
      }),
      room: { name: entry.timetableEntry.room.name }
    } as TimeLessonEntry;
  }
}
