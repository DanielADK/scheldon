import { TimetableSet } from '@models/TimetableSet';
import * as timetableRepository from '@repositories/timetableRepository';
import {
  TimetableEntryDTO,
  TimetableExport,
  TimetableSetDTO
} from '@repositories/timetableRepository';
import { TimetableEntry } from '@models/TimetableEntry';

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
 * Get timetable by class ID
 * @param classId int
 */
export const getTimetableByClassId = async (
  classId: number
): Promise<TimetableExport | null> => {
  return await timetableRepository.getTimetableByClassId(classId);
};
