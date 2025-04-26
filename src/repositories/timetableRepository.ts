import { TimetableSet } from '@models/TimetableSet';
import { TimetableEntry } from '@models/TimetableEntry';
import { Employee } from '@models/Employee';
import { Class } from '@models/Class';
import { TimetableEntrySet } from '@models/TimetableEntrySet';
import { Op, Transaction, WhereOptions } from 'sequelize';
import { Subject } from '@models/Subject';
import { Room } from '@models/Room';
import { StudentGroup } from '@models/StudentGroup';
import { sequelize } from '../index';
import { getLessonBulkInTSetPeriod, getLessonWithTimetableEntryId } from '@repositories/classRegisterRepository';
import { ClassRegister } from '@models/ClassRegister';
import { SubstitutionEntry } from '@models/SubstitutionEntry';
import { getDayInWeek } from '@lib/timeLib';

export interface TimetableSetDTO {
  name: string;
  validFrom: string;
  validTo: string;
}

export interface EntryDTO {
  classId: number;
  studentGroupId?: number;
  hourInDay: number;
  subjectId: number;
  teacherId: number;
  roomId: number;
}

export interface TimetableEntryDTO extends EntryDTO {
  dayInWeek: number;
}

export interface SubstitutionEntryDTO extends EntryDTO {
  date: Date;
  type: string;
}

export const createTEntry = async (tset: TimetableSet, data: TimetableEntryDTO, transaction: Transaction): Promise<TimetableEntry> => {
  // First, create the TimetableEntry and directly associate it with the TimetableSet using $create
  const tentry = (await tset.$create('timetableEntry', data as TimetableEntry, {
    transaction: transaction,
    hooks: false // Skip initial validation
  })) as TimetableEntry;

  await TimetableEntry.validate(tentry, { transaction: transaction });

  // Create LessonsRecords in TSet validity period
  const lessons: ClassRegister[] = await getLessonBulkInTSetPeriod(tset, tentry);

  await ClassRegister.bulkCreate(lessons, {
    transaction: transaction,
    validate: true
  });

  return tentry;
};

/**
 * Asynchronously creates or updates a substitution entry and its associated class register.
 * This function performs several operations to ensure the proper handling of substitution
 * entries and their integration with existing timetable or substitution data. It operates
 * within a database transaction to ensure atomicity.
 *
 * @param {SubstitutionEntryDTO} data - The data required for creating or updating the substitution entry,
 * including information about the substitution, the class it pertains to, and any associated metadata.
 *
 * @returns {Promise<SubstitutionEntry>} A promise that resolves with the substitution entry used or created.
 * If any error occurs, the transaction is rolled back and the error is thrown.
 *
 * @throws Will throw an error if any operation within the transaction fails, causing the transaction to be rolled back.
 */
export const createSEntry = async (data: SubstitutionEntryDTO): Promise<SubstitutionEntry> => {
  const transaction: Transaction = await sequelize.transaction();

  try {
    // Find or create the substitution entry based on provided data
    const sentry = await findOrCreateSubstitutionEntry(data, transaction);

    // Find if a class register already exists for the provided date and substitution entry
    const classregister = await findClassRegister(data, sentry, transaction);

    if (!classregister) {
      // If no class register exists, create a new one associated with the substitution entry
      await createClassRegisterWithSubstitution(sentry, data, transaction);
    } else {
      if (classregister.timetableEntry) {
        // If there's a linked timetable entry, handle conflicts with the substitution entry
        await handleTimetableEntryConflict(classregister, sentry, transaction);
      } else if (classregister.substitutionEntry) {
        // If there's a linked substitution entry, handle conflicts between the old and new substitution entries
        await handleSubstitutionEntryConflict(classregister, sentry, transaction);
      }
    }

    // If all operations succeed, commit the transaction
    await transaction.commit();

    return sentry;
  } catch (err) {
    // Rollback transaction in case of an error
    await transaction.rollback();
    throw err;
  }
};

/**
 * Finds an existing substitution entry matching the provided data, or creates a new one if none exists.
 *
 * @param {SubstitutionEntryDTO} data - The substitution entry data to find or create.
 * @param {Transaction} transaction - The database transaction used for the operation.
 * @returns {Promise<SubstitutionEntry>} Returns the found or newly created substitution entry.
 */
const findOrCreateSubstitutionEntry = async (data: SubstitutionEntryDTO, transaction: Transaction): Promise<SubstitutionEntry> => {
  // Try to find an existing substitution entry matching the data
  let sentry = await SubstitutionEntry.findOne({
    where: {
      hourInDay: data.hourInDay,
      dayInWeek: getDayInWeek(data.date),
      classId: data.classId,
      studentGroupId: data.studentGroupId,
      subjectId: data.subjectId,
      teacherId: data.teacherId,
      roomId: data.roomId
    },
    transaction: transaction
  });

  // If no entry is found, create a new substitution entry
  if (!sentry) {
    sentry = await SubstitutionEntry.create(data as unknown as SubstitutionEntry, { transaction: transaction });
  }

  return sentry;
};

/**
 * Asynchronously finds a class register for a specific date that is associated with either
 * a timetable entry or a substitution entry based on the provided data.
 *
 * @param {SubstitutionEntryDTO} data - Object containing date information relevant to the class register search.
 * @param {SubstitutionEntry} sentry - Substitution entry information, which includes details like hour in day, class ID, and student group ID.
 * @param {Transaction} transaction - The database transaction within which the query is executed.
 *
 * @returns {Promise<ClassRegister | null>} A promise that resolves to the found class register or null
 * if no matching record is found based on the specified criteria.
 */
const findClassRegister = async (
  data: SubstitutionEntryDTO,
  sentry: SubstitutionEntry,
  transaction: Transaction
): Promise<ClassRegister | null> => {
  // Find if there's already a class register for the given date, linked to a timetable entry or substitution entry
  return await ClassRegister.findOne({
    where: { date: data.date },
    include: [
      {
        model: TimetableEntry,
        required: false,
        where: {
          hourInDay: sentry.hourInDay,
          classId: sentry.classId,
          studentGroupId: sentry.studentGroupId
        }
      },
      {
        model: SubstitutionEntry,
        required: false,
        where: {
          hourInDay: sentry.hourInDay,
          classId: sentry.classId,
          studentGroupId: sentry.studentGroupId
        }
      }
    ],
    having: sequelize.where(
      sequelize.literal(
        '(TimetableEntry IS NOT NULL AND SubstitutionEntry IS NULL) OR (TimetableEntry IS NULL AND SubstitutionEntry IS NOT NULL)'
      ),
      true
    ),
    transaction: transaction
  });
};

/**
 * Creates a new class register and associates it with the provided substitution entry.
 *
 * @param {SubstitutionEntry} sentry - The substitution entry to associate with the class register.
 * @param {SubstitutionEntryDTO} data - The data object containing details for the class register creation.
 * @param {Transaction} transaction - The database transaction object to be used for creating the class register.
 * @returns {Promise<ClassRegister>} A promise that resolves to the newly created class register.
 */
const createClassRegisterWithSubstitution = async (
  sentry: SubstitutionEntry,
  data: SubstitutionEntryDTO,
  transaction: Transaction
): Promise<ClassRegister> => {
  // Create a new class register and associate it with the substitution entry
  return await ClassRegister.create(
    {
      date: data.date,
      timetableEntryId: null,
      substitutionEntryId: sentry.substitutionEntryId
    } as ClassRegister,
    { transaction: transaction }
  );
};

/**
 * Handles conflicts between timetable entries and substitution entries by updating the class register.
 *
 * This asynchronous function nullifies the `timetableEntryId` in the given class register and assigns the provided
 * substitution entry's ID to the `substitutionEntryId` field of the class register.
 * The changes are saved to the database using the specified transaction.
 *
 * @param {ClassRegister} classregister - The class register object to be updated.
 * @param {SubstitutionEntry} sentry - The substitution entry containing the ID to be assigned.
 * @param {Transaction} transaction - The transaction object used for database operations to ensure atomicity.
 * @returns {Promise<void>} A promise that resolves once the class register is updated and saved successfully.
 */
const handleTimetableEntryConflict = async (
  classregister: ClassRegister,
  sentry: SubstitutionEntry,
  transaction: Transaction
): Promise<void> => {
  // Nullify the timetable entry ID in the class register
  classregister.timetableEntryId = null;

  // Assign the substitution entry ID to the class register
  classregister.substitutionEntryId = sentry.substitutionEntryId;

  // Save the updated class register
  await classregister.save({ transaction: transaction });
};

/**
 * Handles the conflict that may arise when updating a substitution entry in a class register.
 *
 * This function assigns a new substitution entry to a class register, while ensuring that any
 * previously associated substitution entry is removed if it is no longer in use. The operation
 * is performed within the context of a database transaction to ensure consistency.
 *
 * @param {ClassRegister} classregister - The class register instance to update with the new substitution entry.
 * @param {SubstitutionEntry} sentry - The new substitution entry to be associated with the class register.
 * @param {Transaction} transaction - The Sequelize transaction object to ensure atomic operation.
 *
 * @throws {Error} If an error occurs during the update, save, or deletion process within the transaction.
 *
 * @async
 * @function
 */
const handleSubstitutionEntryConflict = async (classregister: ClassRegister, sentry: SubstitutionEntry, transaction: Transaction) => {
  const oldSubstitutionEntry = classregister.substitutionEntry;

  // Assign the new substitution entry ID to the class register
  classregister.substitutionEntryId = sentry.substitutionEntryId;

  // Save the updated class register with the new substitution entry ID
  await classregister.save({ transaction: transaction });

  // Check if the old substitution entry is still being referenced by any class registers
  if (oldSubstitutionEntry) {
    const isOldEntryUsed = await ClassRegister.count({
      where: { substitutionEntryId: oldSubstitutionEntry.substitutionEntryId },
      transaction: transaction
    });

    // If the old substitution entry is unused, delete it
    if (isOldEntryUsed === 0) {
      await SubstitutionEntry.destroy({
        where: { substitutionEntryId: oldSubstitutionEntry.substitutionEntryId },
        transaction,
        individualHooks: true
      });
    }
  }
};

export const createTSet = async (data: TimetableSetDTO): Promise<TimetableSet> => {
  return await TimetableSet.create(data as TimetableSet);
};

/**
 * Get timetable by ID
 * @param setId
 */
export const getTimetableBySetId = async (setId: number): Promise<TimetableSet | null> => {
  return await TimetableSet.findByPk(setId);
};

/**
 * Get timetable set at time
 * @param time
 */
export const getTimetableSetAtTime = async (time: Date = new Date()): Promise<TimetableSet | null> => {
  return await TimetableSet.findOne({
    attributes: ['timetableSetId'],
    where: {
      validFrom: { [Op.lte]: time },
      validTo: { [Op.gte]: time }
    }
  });
};

export const timetableEntryInclude = [
  {
    model: Employee,
    attributes: ['name', 'surname', 'abbreviation'],
    required: false
  },
  {
    model: Subject,
    attributes: ['name', 'abbreviation']
  },
  {
    model: Class,
    attributes: ['name']
  },
  {
    model: StudentGroup,
    attributes: ['name']
  },
  {
    model: Room,
    attributes: ['name']
  }
];

/**
 * Get timetable by class ID
 * @param where WhereOptions optional
 * @param time Date optional
 * @param transaction
 */
export const getTimetableByParam = async (
  where: WhereOptions = {},
  time: Date = new Date(),
  transaction: Transaction | null = null
): Promise<TimetableEntrySet[] | null> => {
  // Find the timetable set that is valid at the given time
  const tSet = await getTimetableSetAtTime(time);
  if (!tSet) {
    return null;
  }

  return await TimetableEntrySet.findAll({
    where: {
      timetableSetId: tSet.timetableSetId
    },
    attributes: [],
    include: [
      {
        model: TimetableEntry,
        as: '',
        required: true,
        where: where,
        include: timetableEntryInclude,
        attributes: ['dayInWeek', 'hourInDay']
      }
    ],
    transaction: transaction
  });
};

/**
 * Retrieves timetable entries associated with a specific timetable set ID.
 *
 * @param {number} tsetId - The ID of the timetable set to retrieve entries from.
 * @return {Promise<TimetableEntry[]>} A promise that resolves to an object containing the timetable entries and their total count.
 * @throws {Error} If the timetable set with the specified ID is not found.
 */
export async function getEntries(tsetId: number): Promise<TimetableEntry[]> {
  const timetableSet = await TimetableSet.findByPk(tsetId, {
    include: [
      {
        model: TimetableEntry,
        required: true
      }
    ]
  });

  if (!timetableSet) {
    throw new Error('Timetable set not found');
  }

  return timetableSet.timetableEntries;
}

/**
 * Fetches all timetable sets from the database.
 *
 * @return {Promise<TimetableSet[]>} A promise that resolves to an array of all timetable sets.
 */
export async function getAllSets(): Promise<TimetableSet[]> {
  return await TimetableSet.findAll({});
}

export async function updateTSet(
  tsetId: number,
  data: Partial<TimetableSetDTO>,
  transaction?: Transaction | null
): Promise<[affectedRows: number, updatedTSet: TimetableSet[]]> {
  return await TimetableSet.update(data, {
    where: { timetableSetId: tsetId },
    transaction: transaction,
    returning: true
  });
}

/**
 * Deletes a timetable set by its unique identifier.
 *
 * @param {number} timetableSetId - The unique identifier of the timetable set to be deleted.
 * @return {Promise<void>} Resolves when the deletion is complete. Throws an error if the timetable set does not exist or the transaction fails.
 */
export async function deleteTSetById(timetableSetId: number): Promise<void> {
  const transaction = await sequelize.transaction();

  try {
    const timetableSet = await TimetableSet.findByPk(timetableSetId, { transaction });

    if (!timetableSet) {
      throw new Error('Timetable set not found');
    }

    await TimetableSet.destroy({
      where: { timetableSetId },
      transaction,
      individualHooks: true
    });

    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

/**
 * Deletes a timetable entry by its ID.
 *
 * @param {number} timetableEntryId - the unique identifier of the timetable entry to be deleted.
 * @return {Promise<void>} a promise that resolves when the timetable entry is successfully deleted.
 * @throws will throw an error if the timetable entry is not found or the transaction fails.
 */
export async function deleteTEntryById(timetableEntryId: number): Promise<void> {
  // start a database transaction
  const transaction = await sequelize.transaction();

  try {
    // find the timetable entry by its ID within the transaction
    const tentry = await TimetableEntry.findByPk(timetableEntryId, { transaction });

    // if the timetable entry doesn't exist, throw an error
    if (!tentry) {
      throw new Error('Timetable entry not found');
    }

    // fetch all class registers related to the timetable entry
    const classRegisters = await getLessonWithTimetableEntryId(timetableEntryId, transaction);

    // check if all class registers have a null fillDate
    const allFillDatesNull = classRegisters.every((register) => register.fillDate === null);

    // if all fillDates are null, bulk delete the related class registers
    if (allFillDatesNull) {
      await ClassRegister.destroy({
        where: { timetableEntryId: timetableEntryId },
        transaction,
        individualHooks: true
      });
    }

    // delete the timetable entry
    await TimetableEntry.destroy({
      where: { timetableEntryId: timetableEntryId },
      transaction,
      individualHooks: true
    });

    // commit the transaction if everything is successful
    await transaction.commit();
  } catch (error) {
    // rollback the transaction in case of any errors
    await transaction.rollback();
    throw error;
  }
}

/**
 * Find the default timetable entry for a specific date, class, and hour
 *
 * @param date - The date for which to find the timetable entry
 * @param classId - The ID of the class
 * @param hourInDay - The hour of the day
 * @param studentGroupId
 * @param transaction - The database transaction to use
 * @returns The matching timetable entry or null if not found
 */
export const findDefaultTimetableEntry = async (
  date: Date,
  hourInDay: number,
  classId: number,
  studentGroupId: number | null = null,
  transaction?: Transaction
): Promise<TimetableEntry | null> => {
  const dayOfWeek = (date.getDay() + 6) % 7;

  // Find timetable set that is valid for the given date
  const validTimetableSet = await TimetableSet.findOne({
    where: {
      validFrom: {
        [Op.lte]: date
      },
      validTo: {
        [Op.gte]: date
      }
    },
    transaction
  });

  if (!validTimetableSet) {
    return null;
  }

  // Find timetable entries that match:
  // 1. The day of week
  // 2. The hour of day
  // 3. The class ID
  // 4. Are associated with one of the valid timetable sets
  return await TimetableEntry.findOne({
    where: {
      dayInWeek: dayOfWeek,
      hourInDay: hourInDay,
      classId: classId,
      studentGroupId: studentGroupId
    },
    include: [
      {
        model: TimetableSet,
        where: {
          timetableSetId: validTimetableSet.timetableSetId
        },
        through: {
          attributes: [] // Ensure this only includes valid options; remove `model`
        }
      }
    ],
    transaction
  });
};
