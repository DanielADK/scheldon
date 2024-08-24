import { TimetableEntrySet } from '@models/TimetableEntrySet';
import { TimeLessonEntry } from '@services/transformers/timetableExport';
import { AbstractTimetableAdapter } from '@services/transformers/AbstractTimetableAdapter';

export class TimetableAdapter extends AbstractTimetableAdapter<TimetableEntrySet> {
  transform(entry: TimetableEntrySet): TimeLessonEntry {
    return {
      dayInWeek: entry.timetableEntry.dayInWeek,
      hourInDay: entry.timetableEntry.hourInDay,
      teacher: {
        name: entry.timetableEntry.teacher.name,
        surname: entry.timetableEntry.teacher.surname,
        abbreviation: entry.timetableEntry.teacher.abbreviation || ''
      },
      subject: {
        name: entry.timetableEntry.subject.name,
        abbreviation: entry.timetableEntry.subject.abbreviation
      },
      class: { name: entry.timetableEntry.class.name },
      subClass: { name: entry.timetableEntry.subClass?.name || '' },
      room: { name: entry.timetableEntry.room.name }
    } as TimeLessonEntry;
  }
}
