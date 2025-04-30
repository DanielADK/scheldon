import { AbstractAdapter, InputModels } from '@services/transformers/AbstractAdapter';
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
export type maskService = (entry: SimpleLessonEntry) => SimpleLessonEntry;

/**
 * Transformer of TimeTableEntry to by-class-interested format
 * @param entry TimetableEntry
 */
export const classMask = (entry: SimpleLessonEntry): SimpleLessonEntry => {
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
export const employeeMask = (entry: SimpleLessonEntry): SimpleLessonEntry => {
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
export const roomMask = (entry: SimpleLessonEntry): SimpleLessonEntry => {
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
export const droppedMask = (entry: SimpleLessonEntry): SimpleLessonEntry => {
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
export const transformAndMask = async <T extends InputModels, R extends TimeLessonEntry>(
  entrySet: T[] | null,
  adapter: AbstractAdapter<T, R>,
  maskService: maskService
): Promise<TimetableExport | null> => {
  if (!entrySet) {
    return null;
  }
  // Transform the timetable entries into a common format
  const commonFormat = await adapter.transformAll(entrySet);

  // Transform the timetable into a 2D object
  return transformTimetable(commonFormat, maskService);
};

/**
 * Transform the timetable into a 2D object
 * @param timetable TimetableEntrySet[]
 * @param transformerFunction entryTransformer function to transform the entries into the desired format
 */
export const transformTimetable = (timetable: TimeLessonEntry[], transformerFunction: maskService) => {
  // Transform the results into a 2D object
  const timetable2D: TimetableExport = {};

  // Helper function to process an individual entry
  const processEntry = (day: number, hour: number, lesson: SimpleLessonEntry) => {
    const transformedLesson = lesson.substitutionType === SubstitutionType.DROPPED ? droppedMask(lesson) : lesson;

    if (Array.isArray(timetable2D[day][hour])) {
      timetable2D[day][hour].push(transformedLesson);
    } else if (timetable2D[day][hour]) {
      timetable2D[day][hour] = [timetable2D[day][hour], transformedLesson];
    } else {
      timetable2D[day][hour] = transformedLesson;
    }
  };

  // Iterate over the timetable entries
  for (const entry of timetable) {
    const day = entry.dayInWeek;
    const hour = entry.hourInDay;

    if (!(day in timetable2D)) {
      timetable2D[day] = {};
    }

    const lesson: SimpleLessonEntry = transformerFunction(entry);
    processEntry(day, hour, lesson);
  }

  return timetable2D;
};
