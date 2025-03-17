import { TimetableEntrySet } from '@models/TimetableEntrySet';
import { ClassRegister } from '@models/ClassRegister';
import { TimeLessonEntry } from '@services/transformers/timetableExport';

export type TimetableModels = TimetableEntrySet | ClassRegister;
/**
 * Abstract class for transforming timetable entries
 */
export abstract class AbstractTimetableAdapter<T extends TimetableModels> {
  /**
   * Transform a timetable entry
   * @param entry T
   * @returns TimeLessonEntry
   */
  abstract transform(entry: T): TimeLessonEntry;

  transformAll = async (entries: T[]): Promise<TimeLessonEntry[]> => {
    return entries.map((entry) => this.transform(entry));
  };
}
