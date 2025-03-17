import { TimetableSet } from '@models/TimetableSet';
import { TimetableEntry } from '@models/TimetableEntry';
import { Student } from '@models/Student';
import { Employee } from '@models/Employee';
import { Class } from '@models/Class';
import { TimetableEntrySet } from '@models/TimetableEntrySet';
import { Op, Transaction, WhereOptions } from 'sequelize';
import { Subject } from '@models/Subject';
import { Room } from '@models/Room';
import { StudentGroup } from '@models/StudentGroup';
import { sequelize } from '../index';
import { getLessonBulkInTSetPeriod } from '@repositories/DEPRlessonRecordRepository';
import { ClassRegister } from '@models/ClassRegister';
import { SubstitutionEntry } from '@models/SubstitutionEntry';
import { getDayInWeek } from '../lib/timeLib';

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

/**
 * Create a new timetable set
 * @param tset TimetableSet
 * @param data TimetableSetDTO
 */
export const createTEntry = async (tset: TimetableSet, data: TimetableEntryDTO): Promise<TimetableEntry> => {
  const transaction: Transaction = await sequelize.transaction();

  try {
    const tentry = await TimetableEntry.create(data as TimetableEntry, {
      transaction: transaction
    });

    // Add TimetableEntry to TimetableSet
    await tset.$add('TimetableEntry', tentry, { transaction: transaction });

    // Create LessonsRecords in TSet validity period
    const lessons: ClassRegister[] = await getLessonBulkInTSetPeriod(tset, tentry);

    await ClassRegister.bulkCreate(lessons, {
      transaction: transaction,
      validate: true
    });

    await transaction.commit();

    return tentry;
  } catch (err) {
    // Rollback if error
    await transaction.rollback();
    throw err;
  }
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
 * @returns {Promise<void>} A promise that resolves when the substitution entry and related operations
 * are successfully completed. If any error occurs, the transaction is rolled back and the error is thrown.
 *
 * @throws Will throw an error if any operation within the transaction fails, causing the transaction to be rolled back.
 */
export const createSEntry = async (data: SubstitutionEntryDTO): Promise<void> => {
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
        await handleTimetableEntryConflict(classregister, data, transaction);
      } else if (classregister.substitutionEntry) {
        // If there's a linked substitution entry, handle conflicts between the old and new substitution entries
        await handleSubstitutionEntryConflict(classregister, data, transaction);
      }
    }

    // If all operations succeed, commit the transaction
    await transaction.commit();
  } catch (err) {
    // Rollback transaction in case of an error
    await transaction.rollback();
    throw err;
  }
};

const findOrCreateSubstitutionEntry = async (data: SubstitutionEntryDTO, transaction: Transaction) => {
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

const findClassRegister = async (data: SubstitutionEntryDTO, sentry: SubstitutionEntry, transaction: Transaction) => {
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

const createClassRegisterWithSubstitution = async (sentry: SubstitutionEntry, data: SubstitutionEntryDTO, transaction: Transaction) => {
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

const handleTimetableEntryConflict = async (classregister: ClassRegister, data: SubstitutionEntryDTO, transaction: Transaction) => {
  // Find or create a substitution entry for the provided data
  const substitutionEntry = await findOrCreateSubstitutionEntry(data, transaction);

  if (substitutionEntry && classregister) {
    // Nullify the timetable entry ID in the class register
    classregister.timetableEntryId = null;

    // Assign the substitution entry ID to the class register
    classregister.substitutionEntryId = substitutionEntry.substitutionEntryId;

    // Save the updated class register
    await classregister.save({ transaction: transaction });
  }
};

const handleSubstitutionEntryConflict = async (classregister: ClassRegister, data: SubstitutionEntryDTO, transaction: Transaction) => {
  const oldSubstitutionEntry = classregister.substitutionEntry;

  // Create a new substitution entry for the updated data
  const newSubstitutionEntry = await SubstitutionEntry.create(data as unknown as SubstitutionEntry, {
    transaction: transaction
  });

  if (newSubstitutionEntry && classregister) {
    // Assign the new substitution entry ID to the class register
    classregister.substitutionEntryId = newSubstitutionEntry.substitutionEntryId;

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
        await oldSubstitutionEntry.destroy({ transaction: transaction });
      }
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
  return await TimetableSet.findByPk(setId, {
    include: [
      {
        model: TimetableEntry,
        include: [Class, Employee, Student]
      }
    ]
  });
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
