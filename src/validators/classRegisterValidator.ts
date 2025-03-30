import Joi from 'joi';
import { ClassRegister } from '@models/ClassRegister';
import { validator } from '@validators/genericValidators';
import { SubstitutionEntry } from '@models/SubstitutionEntry';
import { TimetableEntry } from '@models/TimetableEntry';
import { QueryOptions } from '@models/types/QueryOptions';
import { Op, WhereOptions } from 'sequelize';

export const validateXORIdentifiers: validator<ClassRegister> = async (instance: ClassRegister) => {
  const schema = Joi.object({
    timetableEntryId: Joi.string().optional(),
    substitutionEntryId: Joi.string().optional()
  }).xor('timetableEntryId', 'substitutionEntryId'); // Enforces XOR rule

  const { error } = schema.validate({
    timetableEntryId: instance.timetableEntryId,
    substitutionEntryId: instance.substitutionEntryId
  });

  if (!error) throw new Error('Timetable entry and Substitution entry cannot be used together');
};

/**
 * Retrieves information about a timetable or substitution entry associated with the given instance.
 * Determines the type of entry (timetable or substitution) and fetches the corresponding data.
 *
 * @param {ClassRegister} instance - The instance containing details about the timetable or substitution entry.
 * @param {QueryOptions|null} [options] - Optional Sequelize query options to customize the data retrieval process.
 * @returns {Promise<Object>} A promise that resolves to an object containing entry details:
 * - `teacherId` {number} - The ID of the teacher associated with the entry.
 * - `roomId` {number} - The ID of the room associated with the entry.
 * - `classId` {number} - The ID of the class associated with the entry.
 * - `studentGroupId` {number|null} - The ID of the student group associated with the entry, or null if not applicable.
 * - `dayInWeek` {number} - The day in the week associated with the entry (e.g., 1 for Monday, 7 for Sunday).
 * - `hourInDay` {number} - The hour in the day associated with the entry.
 * - `date` {Date|undefined} - The date of the substitution entry, if applicable.
 *
 * @throws {Error} Throws an error if no associated timetable or substitution entry is found,
 * or if the referenced entry cannot be retrieved.
 */
const getEntryInfo = async (
  instance: ClassRegister,
  options?: QueryOptions | null
): Promise<{
  teacherId: number;
  roomId: number;
  classId: number;
  studentGroupId: number | null;
  dayInWeek: number;
  hourInDay: number;
  date?: Date;
}> => {
  // For TimetableEntry
  if (instance.timetableEntryId) {
    if (!instance.timetableEntry) {
      instance.timetableEntry = await instance.$get('timetableEntry', options || undefined);
    }
    if (!instance.timetableEntry) {
      throw new Error('Timetable entry not found');
    }

    return {
      teacherId: instance.timetableEntry.teacherId,
      roomId: instance.timetableEntry.roomId,
      classId: instance.timetableEntry.classId,
      studentGroupId: instance.timetableEntry.studentGroupId,
      dayInWeek: instance.timetableEntry.dayInWeek,
      hourInDay: instance.timetableEntry.hourInDay
    };
  }

  // For SubstitutionEntry
  if (instance.substitutionEntryId) {
    if (!instance.substitutionEntry) {
      instance.substitutionEntry = await instance.$get('substitutionEntry', options || undefined);
    }
    if (!instance.substitutionEntry) {
      throw new Error('Substitution entry not found');
    }

    return {
      teacherId: instance.substitutionEntry.teacherId,
      roomId: instance.substitutionEntry.roomId,
      classId: instance.substitutionEntry.classId,
      studentGroupId: instance.substitutionEntry.studentGroupId,
      dayInWeek: instance.substitutionEntry.dayInWeek,
      hourInDay: instance.substitutionEntry.hourInDay,
      date: instance.date
    };
  }

  throw new Error('No entry reference found');
};
/**
 * Validate teacher availability for the class register
 */
export const validateTeacherAvailability: validator<ClassRegister> = async (
  instance: ClassRegister,
  options?: QueryOptions | null
): Promise<void> => {
  const entryInfo = await getEntryInfo(instance, options);

  // Base query conditions
  const whereConditions: WhereOptions = {
    teacherId: entryInfo.teacherId,
    dayInWeek: entryInfo.dayInWeek,
    hourInDay: entryInfo.hourInDay
  };

  // If from substitution entry and has date, check for conflicts on that specific date
  if (entryInfo.date) {
    // Check for conflicts with other substitution entries on the same date
    const substitutionConflict = await ClassRegister.findOne({
      where: {
        date: entryInfo.date,
        substitutionEntryId: {
          [Op.ne]: instance.substitutionEntryId || 0 // Exclude the current entry
        }
      },
      include: [
        {
          model: SubstitutionEntry,
          where: whereConditions
        }
      ],
      ...options
    });

    if (substitutionConflict) {
      throw new Error('Teacher is already assigned to another entry at the same date, day and hour');
    }

    // For specific date, also check class registers for conflicts
    const registerConflict = await ClassRegister.findOne({
      include: [
        {
          model: SubstitutionEntry,
          where: {
            teacherId: entryInfo.teacherId,
            dayInWeek: entryInfo.dayInWeek,
            hourInDay: entryInfo.hourInDay,
            date: entryInfo.date
          },
          required: true
        }
      ],
      where: {
        lessonId: {
          [Op.ne]: instance.lessonId || 0 // Exclude the current register
        }
      },
      ...options
    });

    if (registerConflict) {
      throw new Error('Teacher is already assigned to another class register at the same date, day and hour');
    }
  } else {
    // If from timetable entry (no specific date), check for conflicts in timetable
    const timetableConflict = await TimetableEntry.findOne({
      where: {
        ...whereConditions,
        timetableEntryId: {
          [Op.ne]: instance.timetableEntryId || 0 // Exclude the current entry
        }
      },
      ...options
    });

    if (timetableConflict) {
      throw new Error('Teacher is already assigned to another entry at the same day and hour');
    }
  }
};

/**
 * Validate room availability for the class register
 */
export const validateRoomAvailability: validator<ClassRegister> = async (
  instance: ClassRegister,
  options?: QueryOptions | null
): Promise<void> => {
  const entryInfo = await getEntryInfo(instance, options);

  // Base query conditions
  const whereConditions: WhereOptions = {
    roomId: entryInfo.roomId,
    dayInWeek: entryInfo.dayInWeek,
    hourInDay: entryInfo.hourInDay
  };

  // If from substitution entry and has date, check for conflicts on that specific date
  if (entryInfo.date) {
    // Find ClassRegisters with substitution entries that have conflicts
    const registerConflicts = await ClassRegister.findAll({
      where: {
        date: entryInfo.date,
        lessonId: {
          [Op.ne]: instance.lessonId || 0 // Exclude the current register
        }
      },
      include: [
        {
          model: SubstitutionEntry,
          where: {
            roomId: entryInfo.roomId,
            dayInWeek: entryInfo.dayInWeek,
            hourInDay: entryInfo.hourInDay
          },
          required: true
        }
      ],
      ...options
    });

    if (registerConflicts.length > 0) {
      throw new Error('Room is already assigned to another class register at the same date, day and hour');
    }
  } else {
    // If from timetable entry (no specific date), check for conflicts in timetable
    const timetableConflict = await TimetableEntry.findOne({
      where: {
        ...whereConditions,
        timetableEntryId: {
          [Op.ne]: instance.timetableEntryId || 0 // Exclude the current entry
        }
      },
      ...options
    });

    if (timetableConflict) {
      throw new Error('Room is already assigned to another entry at the same day and hour');
    }
  }
};

/**
 * Validate class availability for the class register
 */
export const validateClassAvailability: validator<ClassRegister> = async (
  instance: ClassRegister,
  options?: QueryOptions | null
): Promise<void> => {
  const entryInfo = await getEntryInfo(instance, options);

  // If student group is specified, no validation needed as multiple entries can exist for different groups
  if (entryInfo.studentGroupId) {
    return;
  }

  // Base query conditions
  const whereConditions: WhereOptions = {
    classId: entryInfo.classId,
    studentGroupId: null, // Only check whole-class entries
    dayInWeek: entryInfo.dayInWeek,
    hourInDay: entryInfo.hourInDay
  };

  // If from substitution entry and has date, check for conflicts on that specific date
  if (entryInfo.date) {
    // Find ClassRegisters with substitution entries that have conflicts
    const registerConflicts = await ClassRegister.findAll({
      where: {
        date: entryInfo.date,
        lessonId: {
          [Op.ne]: instance.lessonId || 0 // Exclude the current register
        }
      },
      include: [
        {
          model: SubstitutionEntry,
          where: {
            classId: entryInfo.classId,
            studentGroupId: null,
            dayInWeek: entryInfo.dayInWeek,
            hourInDay: entryInfo.hourInDay
          },
          required: true
        }
      ],
      ...options
    });

    if (registerConflicts.length > 0) {
      throw new Error('Class is already assigned to another class register at the same date, day and hour');
    }
  } else {
    // If from timetable entry (no specific date), check for conflicts in timetable
    const timetableConflict = await TimetableEntry.findOne({
      where: {
        ...whereConditions,
        timetableEntryId: {
          [Op.ne]: instance.timetableEntryId || 0 // Exclude the current entry
        }
      },
      ...options
    });

    if (timetableConflict) {
      throw new Error('Class is already assigned to another entry at the same day and hour');
    }
  }
};

/**
 * Validate student group availability for the class register
 */
export const validateStudentGroupAvailability: validator<ClassRegister> = async (
  instance: ClassRegister,
  options?: QueryOptions | null
): Promise<void> => {
  const entryInfo = await getEntryInfo(instance, options);

  // If no student group is specified, no need for this validation
  if (!entryInfo.studentGroupId) {
    return;
  }

  // Base query conditions
  const whereConditions: WhereOptions = {
    studentGroupId: entryInfo.studentGroupId,
    dayInWeek: entryInfo.dayInWeek,
    hourInDay: entryInfo.hourInDay
  };

  // If from substitution entry and has date, check for conflicts on that specific date
  if (entryInfo.date) {
    // Find ClassRegisters with substitution entries that have conflicts
    const registerConflicts = await ClassRegister.findAll({
      where: {
        date: entryInfo.date,
        lessonId: {
          [Op.ne]: instance.lessonId || 0 // Exclude the current register
        }
      },
      include: [
        {
          model: SubstitutionEntry,
          where: {
            studentGroupId: entryInfo.studentGroupId,
            dayInWeek: entryInfo.dayInWeek,
            hourInDay: entryInfo.hourInDay
          },
          required: true
        }
      ],
      ...options
    });

    if (registerConflicts.length > 0) {
      throw new Error('Student group is already assigned to another class register at the same date, day and hour');
    }
  } else {
    // If from timetable entry (no specific date), check for conflicts in timetable
    const timetableConflict = await TimetableEntry.findOne({
      where: {
        ...whereConditions,
        timetableEntryId: {
          [Op.ne]: instance.timetableEntryId || 0 // Exclude the current entry
        }
      },
      ...options
    });

    if (timetableConflict) {
      throw new Error('Student group is already assigned to another entry at the same day and hour');
    }
  }
};

/**
 * Validate class and student group conflict
 */
export const validateClassStudentGroupConflict: validator<ClassRegister> = async (
  instance: ClassRegister,
  options?: QueryOptions | null
): Promise<void> => {
  const entryInfo = await getEntryInfo(instance, options);

  // If student group is specified, check for whole-class entries at the same time
  if (entryInfo.studentGroupId) {
    const whereConditions: WhereOptions = {
      classId: entryInfo.classId,
      studentGroupId: null, // Look for whole-class entries
      dayInWeek: entryInfo.dayInWeek,
      hourInDay: entryInfo.hourInDay
    };

    // If from substitution entry with date, check for conflicts on that specific date
    if (entryInfo.date) {
      // Find ClassRegisters with whole-class substitution entries that conflict
      const registerConflicts = await ClassRegister.findAll({
        where: {
          date: entryInfo.date
        },
        include: [
          {
            model: SubstitutionEntry,
            where: whereConditions,
            required: true
          }
        ],
        ...options
      });

      if (registerConflicts.length > 0) {
        throw new Error('Student group entry conflicts with a whole-class register at the same date, day and hour');
      }
    } else {
      // Check conflicts with timetable entries
      const timetableConflict = await TimetableEntry.findOne({
        where: whereConditions,
        ...options
      });

      if (timetableConflict) {
        throw new Error('Student group entry conflicts with a whole-class entry at the same day and hour');
      }
    }
  }
};
