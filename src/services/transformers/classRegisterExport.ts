import { SimpleLessonEntry } from '@services/transformers/timetableExport';
import { AttendanceType } from '@models/types/AttendanceType';
import { AbstractAdapter, InputModels } from '@services/transformers/AbstractAdapter';

export interface ClassRegisterEntry extends SimpleLessonEntry {
  topic: string;
  date: string;
  fillDate: string | null;
  note: string | null;
}

export interface StudentAttendance {
  student: {
    studentId: number;
    name: string;
    surname: string;
  };
  attendance: AttendanceType;
}

/**
 * Transforms a class register object using a specified adapter.
 *
 * @template T - Represents a type that extends ClassRegisterModels.
 * @param {T | null} entry - The class register object to be transformed. If the value is null, null will be returned.
 * @param {AbstractAdapter<T>} adapter - The adapter used to transform the provided lesson object.
 * @returns {Promise<ClassRegisterEntry | null>} A promise that resolves to a transformed ClassRegisterEntry object or null if the input lesson is null.
 */
export const transformClassRegister = async <T extends InputModels, R extends ClassRegisterEntry>(
  entry: T | null,
  adapter: AbstractAdapter<T, R>
): Promise<R | null> => {
  if (entry === null) return null;

  return adapter.transform(entry);
};
