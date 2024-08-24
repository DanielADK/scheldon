import { TimetableSet } from '@models/TimetableSet';
import * as timetableRepository from '@repositories/timetableRepository';
import {
  TimetableEntryDTO,
  TimetableSetDTO
} from '@repositories/timetableRepository';
import { TimetableEntry } from '@models/TimetableEntry';
import { TimetableAdapter } from '@services/transformers/timetableAdapter';
import {
  classMask,
  employeeMask,
  roomMask,
  TimetableExport,
  transformAndMask
} from '@services/transformers/timetableExport';

export const createTEntry = async (
  tsetId: number,
  tentry: TimetableEntryDTO
): Promise<TimetableEntry> => {
  // Verify the timetable set exists
  const tset = await TimetableSet.findByPk(tsetId);
  if (!tset) {
    throw new Error('Timetable set not found');
  }

  return await timetableRepository.createTEntry(tset, tentry);
};

export const createTSet = async (
  tset: TimetableSetDTO
): Promise<TimetableSet> => {
  return await timetableRepository.createTSet(tset);
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
  return transformAndMask(timetable, new TimetableAdapter(), classMask);
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
  return transformAndMask(timetable, new TimetableAdapter(), employeeMask);
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
  return transformAndMask(timetable, new TimetableAdapter(), roomMask);
};
