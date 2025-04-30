import { TimetableEntrySet } from '@models/TimetableEntrySet';
import { ClassRegister } from '@models/ClassRegister';
import { TimeLessonEntry } from '@services/transformers/timetableExport';
import { ClassRegisterEntry, StudentAttendance } from '@services/transformers/classRegisterExport';
import { Attendance } from '@models/Attendance';

export type InputModels = TimetableEntrySet | ClassRegister | Attendance;
export type TransformedModels = TimeLessonEntry | ClassRegisterEntry | StudentAttendance;
/**
 * Abstract class for transforming timetable entries
 */
export abstract class AbstractAdapter<T extends InputModels, R extends TransformedModels> {
  /**
   * Transform a timetable entry
   * @param entry T
   * @returns R
   */
  abstract transform(entry: T): Promise<R>;

  transformAll = async (entries: T[]): Promise<R[]> => {
    return Promise.all(entries.map((entry) => this.transform(entry)));
  };
}
