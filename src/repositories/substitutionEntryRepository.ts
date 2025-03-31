import { SubstitutionType } from '@models/types/SubstitutionType';
import { SubstitutionEntry } from '@models/SubstitutionEntry';
import { Transaction } from 'sequelize/types';
import { substitutionTimetableEntrySchema } from '@controllers/substitutionEntryController';
import { ClassRegister } from '@models/ClassRegister';
import { Op } from 'sequelize';
import { TimetableEntry } from '@models/TimetableEntry';

export interface SubstitutionTimetableEntryDTO {
  classId: number;
  studentGroupId?: number | null;
  dayInWeek: number;
  hourInDay: number;
  subjectId: number;
  teacherId: number;
  roomId: number;
  type: SubstitutionType;
}

export const validateSubstitutionTimetableEntry = (data: unknown): SubstitutionTimetableEntryDTO => {
  const { error, value } = substitutionTimetableEntrySchema.validate(data);
  if (error) {
    throw new Error(`Validation error: ${error.details.map((x) => x.message).join(', ')}`);
  }
  return value as SubstitutionTimetableEntryDTO;
};

/**
 * Find or create a submission entry based on the provided data.
 *
 * @param {SubstitutionTimetableEntryDTO} data - The data for the submission entry
 * @param {Transaction} transaction - The transaction to use for database operations
 * @returns {Promise<SubstitutionEntry>} The found or created submission entry
 */
export const findOrCreateSubstitutionEntry = async (
  data: SubstitutionTimetableEntryDTO,
  transaction: Transaction
): Promise<SubstitutionEntry> => {
  const [entry, created] = await SubstitutionEntry.findOrCreate({
    where: {
      classId: data.classId,
      studentGroupId: data.studentGroupId || null,
      dayInWeek: data.dayInWeek,
      hourInDay: data.hourInDay,
      subjectId: data.subjectId,
      teacherId: data.teacherId,
      roomId: data.roomId
    },
    defaults: {
      classId: data.classId,
      studentGroupId: data.studentGroupId || null,
      dayInWeek: data.dayInWeek,
      hourInDay: data.hourInDay,
      subjectId: data.subjectId,
      teacherId: data.teacherId,
      roomId: data.roomId
    } as SubstitutionEntry,
    transaction
  });

  return entry;
};

/**
 * Find a substitution entry by its ID.
 *
 * @param {number} id - The ID of the substitution entry to find
 * @param {Transaction} transaction - The transaction to use for database operations
 * @returns {Promise<SubstitutionEntry | null>} The found substitution entry or null
 */
export const findSubstitutionEntryById = async (id: number, transaction?: Transaction): Promise<SubstitutionEntry | null> => {
  return SubstitutionEntry.findByPk(id, { transaction });
};

/**
 * Find class register at a specific date and hour
 *
 * @param {number} classId - The ID of the class
 * @param {Date} date - The date to search for
 * @param {number} hourInDay - The hour in day
 * @param {Transaction} transaction - The transaction to use for database operations
 * @returns {Promise<ClassRegister | null>} The found class register or null
 */
export const findClassRegisterAtDateAndHour = async (
  classId: number,
  date: Date,
  hourInDay: number,
  transaction?: Transaction
): Promise<ClassRegister | null> => {
  return ClassRegister.findOne({
    where: {
      date,
      [Op.or]: [
        { '$timetableEntry.hourInDay$': hourInDay, '$timetableEntry.classId$': classId },
        { '$substitutionEntry.hourInDay$': hourInDay, '$substitutionEntry.classId$': classId }
      ]
    },
    include: [
      { model: SubstitutionEntry, required: false },
      { model: TimetableEntry, required: false }
    ],
    transaction
  });
};
