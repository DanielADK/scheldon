import { TimetableEntrySet } from '@models/TimetableEntrySet';
import { TimeLessonEntry } from '@services/transformers/timetableExport';
import { AbstractTimetableAdapter } from '@services/transformers/AbstractTimetableAdapter';

/**
 * Adapter class to transform `TimetableEntrySet` objects into `TimeLessonEntry` objects.
 * Extends the `AbstractTimetableAdapter` class.
 */
export class TimetableAdapter extends AbstractTimetableAdapter<TimetableEntrySet> {
  /**
   * Transforms a `TimetableEntrySet` object into a `TimeLessonEntry` object.
   *
   * @param {TimetableEntrySet} entry - The timetable entry set to transform.
   * @returns {TimeLessonEntry} The transformed timetable entry.
   */
  transform(entry: TimetableEntrySet): TimeLessonEntry {
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
