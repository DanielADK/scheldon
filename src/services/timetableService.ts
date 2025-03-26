import { TimetableSet } from '@models/TimetableSet';
import * as timetableRepository from '@repositories/timetableRepository';
import { SubstitutionEntryDTO, TimetableEntryDTO, TimetableSetDTO } from '@repositories/timetableRepository';
import { TimetableEntry } from '@models/TimetableEntry';
import { TimetableAdapter } from '@services/transformers/timetableAdapter';
import { classMask, employeeMask, roomMask, TimetableExport, transformAndMask } from '@services/transformers/timetableExport';
import { SubstitutionEntry } from '@models/SubstitutionEntry';
import { sequelize } from '../index';
import { Op, Transaction } from 'sequelize';

/**
 * Check for duplicate timetable entries and handle conflicts
 * @param tsetId The timetable set ID
 * @param tentry The entry details to check
 * @param transaction The current transaction
 * @returns The existing duplicate entry if found, null otherwise
 * @throws Error if there's a conflict between whole-class and student-group entries
 */
async function checkForDuplicateEntries(
  tsetId: number,
  tentry: TimetableEntryDTO,
  transaction: Transaction
): Promise<TimetableEntry | null> {
  // Check for exact duplicates
  const exactDuplicate = await TimetableEntry.findOne({
    where: {
      classId: tentry.classId,
      dayInWeek: tentry.dayInWeek,
      hourInDay: tentry.hourInDay,
      subjectId: tentry.subjectId,
      teacherId: tentry.teacherId,
      roomId: tentry.roomId,
      studentGroupId: tentry.studentGroupId // Can be null or a specific ID
    },
    include: [
      {
        model: TimetableSet,
        as: 'timetableSets',
        where: { timetableSetId: tsetId }
      }
    ],
    transaction
  });

  if (exactDuplicate) {
    // create a new clean object without the timetableSets property
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { timetableSets, ...cleanDuplicate } = exactDuplicate.get({ plain: true });

    // convert back to a TimetableEntry instance
    return cleanDuplicate as TimetableEntry;
  }

  // Check for conflicts between whole-class and student-group entries
  const conflictQuery = {
    classId: tentry.classId,
    dayInWeek: tentry.dayInWeek,
    hourInDay: tentry.hourInDay,
    subjectId: tentry.subjectId,
    teacherId: tentry.teacherId,
    roomId: tentry.roomId,
    studentGroupId: tentry.studentGroupId === null ? { [Op.ne]: null } : null
  };

  const conflict = await TimetableEntry.findOne({
    where: conflictQuery,
    include: [
      {
        model: TimetableSet,
        as: 'timetableSets',
        where: { timetableSetId: tsetId }
      }
    ],
    transaction
  });

  if (conflict) {
    // There's a conflict between a whole-class entry and a student group entry
    if (tentry.studentGroupId === null) {
      throw new Error('Cannot create whole-class entry: one or more student groups from this class already have entries at this time');
    } else {
      throw new Error('Student group is already assigned through a whole-class entry at this time');
    }
  }

  return null; // No duplicates or conflicts found
}

export const createTEntry = async (tsetId: number, tentry: TimetableEntryDTO): Promise<{ entry: TimetableEntry; isNew: boolean }> => {
  const transaction = await sequelize.transaction();
  try {
    // Verify the timetable set exists
    const tset = await TimetableSet.findByPk(tsetId, { transaction });
    if (!tset) {
      throw new Error('Timetable set not found');
    }

    // Check for duplicate entries
    const existingEntry = await checkForDuplicateEntries(tsetId, tentry, transaction);
    if (existingEntry) {
      await transaction.commit();
      return { entry: existingEntry, isNew: true };
    }

    const result = await timetableRepository.createTEntry(tset, tentry, transaction);

    await transaction.commit();
    return { entry: result, isNew: false };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

/**
 * Create a new substitution entry
 * @param sentry
 */

export const createSubstitutionEntry = async (sentry: SubstitutionEntryDTO): Promise<SubstitutionEntry> => {
  return await timetableRepository.createSEntry(sentry);
};

/**
 * Create a new timetable set
 * @param tset TimetableSetDTO
 */
export const createTSet = async (tset: TimetableSetDTO): Promise<TimetableSet> => {
  return await timetableRepository.createTSet(tset);
};

/**
 * Get timetable by class ID
 * @param classId int
 */
export const getTimetableByClassId = async (classId: number): Promise<TimetableExport | null> => {
  const timetable = await timetableRepository.getTimetableByParam({
    classId: classId
  });
  return transformAndMask(timetable, new TimetableAdapter(), classMask);
};

/**
 * Get timetable by class ID and date
 * @param classId int
 * @param date Date
 */
export const getTimetableByClassIdAt = async (classId: number, date: Date): Promise<TimetableExport | null> => {
  const timetable = await timetableRepository.getTimetableByParam(
    {
      classId: classId
    },
    date
  );
  return transformAndMask(timetable, new TimetableAdapter(), classMask);
};

/**
 * Get timetable by employee ID
 * @param employeeId int
 */
export const getTimetableByEmployeeId = async (employeeId: number): Promise<TimetableExport | null> => {
  const timetable = await timetableRepository.getTimetableByParam({
    teacherId: employeeId
  });
  return transformAndMask(timetable, new TimetableAdapter(), employeeMask);
};

/**
 * Get timetable by employee ID and date
 * @param employeeId int
 * @param date Date
 */
export const getTimetableByEmployeeIdAt = async (employeeId: number, date: Date): Promise<TimetableExport | null> => {
  const timetable = await timetableRepository.getTimetableByParam(
    {
      teacherId: employeeId
    },
    date
  );
  return transformAndMask(timetable, new TimetableAdapter(), employeeMask);
};

/**
 * Get timetable by room ID
 * @param roomId int
 */
export const getTimetableByRoomId = async (roomId: number): Promise<TimetableExport | null> => {
  const timetable = await timetableRepository.getTimetableByParam({
    roomId: roomId
  });
  return transformAndMask(timetable, new TimetableAdapter(), roomMask);
};

/**
 * Get timetable by room ID and date
 * @param roomId int
 * @param date Date
 */
export const getTimetableByRoomIdAt = async (roomId: number, date: Date): Promise<TimetableExport | null> => {
  const timetable = await timetableRepository.getTimetableByParam(
    {
      roomId: roomId
    },
    date
  );
  return transformAndMask(timetable, new TimetableAdapter(), roomMask);
};

/**
 * Get timetable set by ID
 * @param tsetId int
 */
export const getTSetById = async (tsetId: number): Promise<TimetableSet | null> => {
  return await TimetableSet.findByPk(tsetId);
};

/**
 * Fetches a timetable entry by its unique identifier.
 *
 * Retrieves a single instance of the TimetableEntry from the database
 * using its primary key. If the entry is not found, this method returns null.
 *
 * @param {number} tentryId - The unique identifier of the timetable entry to retrieve.
 * @returns {Promise<TimetableEntry | null>} A promise that resolves to the found TimetableEntry instance, or null if no entry is found.
 */
export const getTEntryById = async (tentryId: number): Promise<TimetableEntry | null> => {
  return await TimetableEntry.findByPk(tentryId);
};

/**
 * Retrieves a list of entries for a given set.
 *
 * @param {number} tsetId - The unique identifier of the set for which the entries are to be retrieved.
 * @returns {Promise<TimetableEntry[]>} A promise that resolves to an array of entries associated with the specified set ID.
 */
export async function getEntriesBySet(tsetId: number): Promise<TimetableEntry[]> {
  const entries = await timetableRepository.getEntries(tsetId);
  const cleanedEntries = [];

  for (const entry of entries) {
    // create a new clean object without the timetableEntrySet property
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { TimetableEntrySet, ...cleanDuplicate } = entry.get({ plain: true });

    // convert back to a TimetableEntry instance
    cleanedEntries.push(cleanDuplicate as TimetableEntry);
  }

  return cleanedEntries;
}

/**
 * Retrieves all timetable sets from the database.
 *
 * @return {Promise<TimetableSet[]>} A promise that resolves to an array of timetable sets.
 */
export async function getAllSets(): Promise<TimetableSet[]> {
  return await TimetableSet.findAll();
}

/**
 * Deletes a timetable set identified by the provided ID.
 *
 * @param {number} timetableSetId - The unique identifier of the timetable set to be deleted.
 * @return {Promise<void>} A promise that resolves when the timetable set is successfully deleted.
 */
export async function deleteTSetById(timetableSetId: number): Promise<void> {
  return await timetableRepository.deleteTSetById(timetableSetId);
}

/**
 * Deletes a timetable entry specified by its ID.
 *
 * @param {number} timetableEntryId - The unique identifier of the timetable entry to delete.
 * @return {Promise<void>} A promise that resolves when the deletion is completed.
 */
export async function deleteTEntryById(timetableEntryId: number): Promise<void> {
  return await timetableRepository.deleteTEntryById(timetableEntryId);
}

/**
 * Updates a timetable set with the provided data and returns the updated timetable set.
 *
 * @param {number} updateId - The unique identifier of the timetable set to be updated.
 * @param {Partial<TimetableSetDTO>} data - The partial data object to update the timetable set with.
 * @return {Promise<TimetableSetDTO>} A promise that resolves to the updated timetable set.
 * @throws {Error} If no timetable set is found or no changes are made.
 */
export async function updateTSet(updateId: number, data: Partial<TimetableSetDTO>) {
  const [count] = await timetableRepository.updateTSet(updateId, data);

  if (count === 0) {
    throw new Error('Timetable set not found or no changes made');
  }

  return await timetableRepository.getTimetableBySetId(updateId);
}
