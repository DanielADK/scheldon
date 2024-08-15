import { TimetableSet } from '@models/TimetableSet';
import * as timetableRepository from '@repositories/timetableRepository';
import {
  TimetableEntryDTO,
  TimetableSetDTO
} from '@repositories/timetableRepository';
import { TimetableEntry } from '@models/TimetableEntry';
import { TimetableEntrySet } from '@models/TimetableEntrySet';

/**
 * TimetableEntry export interface
 */
interface TimetableDetails {
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
  subClass?: { name: string };
  room?: { name: string };
}

interface Timetable2D {
  [day: number]: {
    [hour: number]: TimetableDetails;
  };
}

/**
 * Timetable as 2D object with day and hour
 */
export interface TimetableExport {
  [day: number]: {
    [hour: number]: TimetableDetails;
  };
}

/**
 * Function type for transformation of TimetableEntries into specified format
 */
type entryTransformer = (entry: TimetableEntry) => Promise<TimetableDetails>;

export const createTEntry = async (
  tsetId: number,
  tentry: TimetableEntryDTO
): Promise<TimetableEntry> => {
  return await timetableRepository.createTEntry(tsetId, tentry);
};

export const createTSet = async (
  tset: TimetableSetDTO
): Promise<TimetableSet> => {
  return await timetableRepository.createTSet(tset);
};

/**
 * Get timetable by set ID
 * @param setId int
 */
export const getTimetableBySetId = async (
  setId: number
): Promise<TimetableSet | null> => {
  return await timetableRepository.getTimetableBySetId(setId);
};

/**
 * Transformer of TimeTableEntry to by-class-interested format
 * @param entry TimetableEntry
 */
const classEntryTransformer = async (
  entry: TimetableEntry
): Promise<TimetableDetails> => {
  return {
    teacher: entry.teacher,
    subject: entry.subject,
    subClass: entry.subClass,
    room: entry.room
  } as TimetableDetails;
};

/**
 * Get timetable by class ID
 * @param classId int
 */
export const getTimetableByClassId = async (
  classId: number
): Promise<TimetableExport | null> => {
  const timetable = await timetableRepository.getTimetableByParam({
    classId: classId
  });

  // Transform the timetable into a 2D object
  return timetable
    ? await transformTimetable(timetable, classEntryTransformer)
    : null;
};

/**
 * Transformer of TimeTableEntry to by-employee-interested format
 * @param entry TimetableEntry
 */
const employeeEntryTransformer = async (
  entry: TimetableEntry
): Promise<TimetableDetails> => {
  return {
    subject: entry.subject,
    class: entry.class,
    subClass: entry.subClass,
    room: entry.room
  } as TimetableDetails;
};

/**
 * Get timetable by employee ID
 * @param employeeId int
 */
export const getTimetableByEmployeeId = async (
  employeeId: number
): Promise<TimetableExport | null> => {
  const timetable = await timetableRepository.getTimetableByParam({
    teacherId: employeeId
  });

  // Transform the timetable into a 2D object
  return timetable
    ? transformTimetable(timetable, employeeEntryTransformer)
    : null;
};

/**
 * Transformer of TimeTableEntry to by-room-interested format
 * @param entry TimetableEntry
 */
const roomEntryTransformer = async (
  entry: TimetableEntry
): Promise<TimetableDetails> => {
  return {
    teacher: entry.teacher,
    subject: entry.subject,
    class: entry.class,
    subClass: entry.subClass
  } as TimetableDetails;
};

/**
 * Get timetable by room ID
 * @param roomId int
 */
export const getTimetableByRoomId = async (
  roomId: number
): Promise<TimetableExport | null> => {
  const timetable = await timetableRepository.getTimetableByParam({
    roomId: roomId
  });

  // Transform the timetable into a 2D object
  return timetable ? transformTimetable(timetable, roomEntryTransformer) : null;
};

/**
 * Transform the timetable into a 2D object
 * @param timetable TimetableEntrySet[]
 * @param transformerFunction entryTransformer function to transform the entries into the desired format
 */
const transformTimetable = async (
  timetable: TimetableEntrySet[],
  transformerFunction: entryTransformer
): Promise<TimetableExport> => {
  // Transform the results into a 2D object
  const timetable2D: Timetable2D = {};

  // Iterate over the timetable entries
  for (const entrySet of timetable) {
    const entry = entrySet.timetableEntry;

    const day = entry.dayInWeek;
    const hour = entry.hourInDay;

    // If the day is not in the timetable, add it
    if (!(day in timetable2D)) {
      timetable2D[day] = {};
    }

    // Add the entry to the timetable
    timetable2D[day][hour] = await transformerFunction(entry);
    // timetable2D[day][hour] = {
    //   teacher: entry.teacher,
    //   subject: entry.subject,
    //   subClass: entry.subClass,
    //   room: entry.room
    // } as TimetableDetails;
  }

  return timetable2D;
};
