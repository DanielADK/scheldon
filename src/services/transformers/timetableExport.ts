import { AbstractTimetableAdapter, TimetableModels } from '@services/transformers/AbstractTimetableAdapter';
import { SubstitutionType } from '@models/types/SubstitutionType';

/**
 * Single lesson entry format
 */
export interface SimpleLessonEntry {
  lessonId?: number;
  teacher?: {
    name: string;
    surname: string;
    abbreviation: string;
  };
  subject?: {
    name: string;
    abbreviation: string;
  };
  class?: { name: string };
  studentGroup?: { name: string };
  room?: { name: string };
  // type of
  substitutionType?: SubstitutionType;
}

/**
 * Single lesson entry format with day and hour
 */
export interface TimeLessonEntry extends SimpleLessonEntry {
  dayInWeek: number;
  hourInDay: number;
}

/**
 * Timetable as 2D object with day and hour
 */
export interface TimetableExport {
  [day: number]: {
    [hour: number]: SimpleLessonEntry | SimpleLessonEntry[];
  };
}

/**
 * Function type for transformation of TimetableEntries into specified format
 */
export type maskService = (entry: SimpleLessonEntry) => Promise<SimpleLessonEntry>;

/**
 * Transformer of TimeTableEntry to by-class-interested format
 * @param entry TimetableEntry
 */
export const classMask = async (entry: SimpleLessonEntry): Promise<SimpleLessonEntry> => {
  return {
    ...(entry.lessonId !== null && { lessonId: entry.lessonId }),
    teacher: entry.teacher,
    subject: entry.subject,
    ...(entry.studentGroup !== null && { studentGroup: entry.studentGroup }),
    room: entry.room,
    ...(entry.substitutionType !== null && { type: entry.substitutionType })
  } as SimpleLessonEntry;
};

/**
 * Transformer of TimeTableEntry to by-employee-interested format
 * @param entry TimetableEntry
 */
export const employeeMask = async (entry: SimpleLessonEntry): Promise<SimpleLessonEntry> => {
  return {
    ...(entry.lessonId !== null && { lessonId: entry.lessonId }),
    subject: entry.subject,
    class: entry.class,
    ...(entry.studentGroup !== null && { studentGroup: entry.studentGroup }),
    room: entry.room,
    ...(entry.substitutionType !== null && { type: entry.substitutionType })
  } as SimpleLessonEntry;
};

/**
 * Transformer of TimeTableEntry to by-room-interested format
 * @param entry TimetableEntry
 */
export const roomMask = async (entry: SimpleLessonEntry): Promise<SimpleLessonEntry> => {
  return {
    ...(entry.lessonId !== null && { lessonId: entry.lessonId }),
    teacher: entry.teacher,
    subject: entry.subject,
    class: entry.class,
    ...(entry.studentGroup !== null && { studentGroup: entry.studentGroup }),
    ...(entry.substitutionType !== null && { type: entry.substitutionType })
  } as SimpleLessonEntry;
};

/**
 * Mask the dropped lessons
 * @param entry TimetableEntry
 */
export const droppedMask = async (entry: SimpleLessonEntry): Promise<SimpleLessonEntry> => {
  return {
    lessonId: entry.lessonId,
    class: entry.class,
    ...(entry.studentGroup !== null && { studentGroup: entry.studentGroup }),
    substitutionType: entry.substitutionType
  } as SimpleLessonEntry;
};

/**
 * Transforms timetable to common format and masks unwanted data
 * @param entrySet TimetableEntrySet[] | null - Timetable entries
 * @param adapter
 * @param maskService maskService - Masking service
 */
export const transformAndMask = async <T extends TimetableModels>(
  entrySet: T[] | null,
  adapter: AbstractTimetableAdapter<T>,
  maskService: maskService
): Promise<TimetableExport | null> => {
  if (!entrySet) {
    return null;
  }
  // Transform the timetable entries into a common format
  const commonFormat: TimeLessonEntry[] = await adapter.transformAll(entrySet);

  // Transform the timetable into a 2D object
  return transformTimetable(commonFormat, maskService);
};

/**
 * Transform the timetable into a 2D object
 * @param timetable TimetableEntrySet[]
 * @param transformerFunction entryTransformer function to transform the entries into the desired format
 */
export const transformTimetable = async (timetable: TimeLessonEntry[], transformerFunction: maskService): Promise<TimetableExport> => {
  // Transform the results into a 2D object
  const timetable2D: TimetableExport = {};

  // Iterate over the timetable entries
  for (const entry of timetable) {
    const day = entry.dayInWeek;
    const hour = entry.hourInDay;

    // If the day is not in the timetable, add it
    if (!(day in timetable2D)) {
      timetable2D[day] = {};
    }

    // Add the entry to the timetable
    const lesson: SimpleLessonEntry = await transformerFunction(entry);

    // check if the hour already contains an array, append to it
    if (Array.isArray(timetable2D[day][hour])) {
      timetable2D[day][hour].push(lesson.substitutionType === SubstitutionType.DROPPED ? await droppedMask(lesson) : lesson);
    }
    // if the hour has a single entry, convert to array and append the new entry
    else if (timetable2D[day][hour]) {
      timetable2D[day][hour] = [
        timetable2D[day][hour],
        lesson.substitutionType === SubstitutionType.DROPPED ? await droppedMask(lesson) : lesson
      ];
    }
    // otherwise, simply set the entry
    else {
      timetable2D[day][hour] = lesson.substitutionType === SubstitutionType.DROPPED ? await droppedMask(lesson) : lesson;
    }
  }

  return timetable2D;
};
