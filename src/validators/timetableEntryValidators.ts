import { TimetableEntry } from '@models/TimetableEntry';
import { validator } from '@validators/genericValidators';
import { QueryOptions } from '@models/types/QueryOptions';
import { SubstitutionEntry } from '@models/SubstitutionEntry';
import { TimetableSet } from '@models/TimetableSet';
import { Op } from 'sequelize';

/**
 * Ensures timetableSets are loaded for a TimetableEntry instance
 * Throws an error if timetableSets cannot be loaded or are empty
 */
const ensureTimetableSetsLoaded = async (instance: TimetableEntry, options?: QueryOptions | null): Promise<TimetableSet[]> => {
  if (!instance.timetableSets?.length) {
    instance.timetableSets = await instance.$get('timetableSets', options || undefined);
  }

  if (!instance.timetableSets?.length) {
    throw new Error('Timetable set not found');
  }

  return instance.timetableSets;
};

/**
 * Validate employee is a teacher
 */
export const validateTeacherRole: validator<TimetableEntry> = async (
  instance: TimetableEntry,
  options?: QueryOptions | null
): Promise<void> => {
  const fetchedTeacher = await instance.$get('teacher', options || undefined);
  if (!fetchedTeacher) {
    throw new Error('Teacher not found');
  }
  instance.teacher = fetchedTeacher;

  if (!instance.teacher.isTeacher) {
    throw new Error('Employee is not a teacher');
  }
};

/**
 * Validate the studentGroup is in the class
 */
export const validateStudentGroupInClass: validator<TimetableEntry> = async (
  instance: TimetableEntry,
  options?: QueryOptions | null
): Promise<void> => {
  instance.studentGroup ??= await instance.$get('studentGroup', options || undefined);
  if (instance.studentGroup && instance.classId !== instance.studentGroup.classId) {
    throw new Error('studentGroup is not in the class');
  }
};

/**
 * Validate the teacher is teaching the subject
 */
export const validateDayInWeekRange: validator<TimetableEntry | SubstitutionEntry> = async (
  instance: TimetableEntry | SubstitutionEntry
): Promise<void> => {
  if (instance.dayInWeek < 0 || instance.dayInWeek > 6) {
    throw new Error('Day in week is out of range. Expected value between 0 (Mo) and 6 (Su)');
  }
};

/**
 * Validate the hour in day is in range
 */
export const validateHourInDayRange: validator<TimetableEntry | SubstitutionEntry> = async (
  instance: TimetableEntry | SubstitutionEntry
): Promise<void> => {
  if (instance.hourInDay < 0 || instance.hourInDay > 10) {
    throw new Error('Hour in day is out of range. Expected value between 0 and 10');
  }
};

/**
 * Validate teacher availability for the same day and hour in all related TimetableSets
 */
export const validateTeacherAvailability: validator<TimetableEntry> = async (
  instance: TimetableEntry,
  options?: QueryOptions | null
): Promise<void> => {
  const timetableSets = await ensureTimetableSetsLoaded(instance, options);
  const timetableSetIds = timetableSets.map((set) => set.timetableSetId);

  const conflict = await TimetableEntry.findOne({
    include: [
      {
        model: TimetableSet,
        as: 'timetableSets',
        required: true,
        through: {
          where: {
            timetableSetId: {
              [Op.in]: timetableSetIds
            }
          }
        }
      }
    ],
    where: {
      teacherId: instance.teacherId,
      dayInWeek: instance.dayInWeek,
      hourInDay: instance.hourInDay,
      timetableEntryId: {
        [Op.ne]: instance.timetableEntryId || 0 // Exclude the current entry
      }
    },
    ...options
  });

  if (conflict) {
    throw new Error('Teacher is already assigned to another entry at the same day and hour in one of the TimetableSets');
  }
};

/**
 * Validate room availability for the same day and hour in all related TimetableSets
 */
export const validateRoomAvailability: validator<TimetableEntry> = async (
  instance: TimetableEntry,
  options?: QueryOptions | null
): Promise<void> => {
  const timetableSets = await ensureTimetableSetsLoaded(instance, options);
  const timetableSetIds = timetableSets.map((set) => set.timetableSetId);

  const conflict = await TimetableEntry.findOne({
    include: [
      {
        model: TimetableSet,
        as: 'timetableSets',
        required: true,
        through: {
          where: {
            timetableSetId: {
              [Op.in]: timetableSetIds
            }
          }
        }
      }
    ],
    where: {
      roomId: instance.roomId,
      dayInWeek: instance.dayInWeek,
      hourInDay: instance.hourInDay,
      timetableEntryId: {
        [Op.ne]: instance.timetableEntryId || 0 // Exclude the current entry
      }
    },
    ...options
  });

  if (conflict) {
    throw new Error('Room is already assigned to another entry at the same day and hour in one of the TimetableSets');
  }
};

/**
 * Validate class availability for the same day and hour in all related TimetableSets
 */
export const validateClassAvailability: validator<TimetableEntry> = async (
  instance: TimetableEntry,
  options?: QueryOptions | null
): Promise<void> => {
  const timetableSets = await ensureTimetableSetsLoaded(instance, options);
  const timetableSetIds = timetableSets.map((set) => set.timetableSetId);

  const conflict = await TimetableEntry.findOne({
    include: [
      {
        model: TimetableSet,
        as: 'timetableSets',
        required: true,
        through: {
          where: {
            timetableSetId: {
              [Op.in]: timetableSetIds
            }
          }
        }
      }
    ],
    where: {
      classId: instance.classId,
      studentGroupId: null, // Only check for whole-class entries
      dayInWeek: instance.dayInWeek,
      hourInDay: instance.hourInDay,
      timetableEntryId: {
        [Op.ne]: instance.timetableEntryId || 0 // Exclude the current entry
      }
    },
    ...options
  });

  if (conflict) {
    throw new Error('Class is already assigned to another entry at the same day and hour in one of the TimetableSets');
  }
};

/**
 * Validate student group availability for the same day and hour in all related TimetableSets
 */
export const validateStudentGroupAvailability: validator<TimetableEntry> = async (
  instance: TimetableEntry,
  options?: QueryOptions | null
): Promise<void> => {
  if (!instance.classId || !instance.studentGroupId) {
    return;
  }

  const timetableSets = await ensureTimetableSetsLoaded(instance, options);
  const timetableSetIds = timetableSets.map((set) => set.timetableSetId);

  const conflict = await TimetableEntry.findOne({
    include: [
      {
        model: TimetableSet,
        as: 'timetableSets',
        required: true,
        through: {
          where: {
            timetableSetId: {
              [Op.in]: timetableSetIds
            }
          }
        }
      }
    ],
    where: {
      classId: instance.classId,
      studentGroupId: instance.studentGroupId,
      dayInWeek: instance.dayInWeek,
      hourInDay: instance.hourInDay,
      timetableEntryId: {
        [Op.ne]: instance.timetableEntryId || 0 // Exclude the current entry
      }
    },
    ...options
  });

  if (conflict) {
    throw new Error('Student group is already assigned to another entry at the same day and hour in one of the TimetableSets');
  }
};

/**
 * Validate that the timetable entry is within the class's active period
 */
export const validateTimetableSetInClassRange: validator<TimetableEntry> = async (
  instance: TimetableEntry,
  options?: QueryOptions | null
): Promise<void> => {
  const timetableSets = await ensureTimetableSetsLoaded(instance, options);

  // Load class using the correct class relationship
  const classModel = await instance.$get('class', options || undefined);
  if (!classModel) {
    throw new Error('Class not found');
  }

  // Check each timetable set is within the class's active period
  for (const tset of timetableSets) {
    const tsetStart = new Date(tset.validFrom);
    const tsetEnd = new Date(tset.validTo);
    const classStart = new Date(classModel.validFrom);
    const classEnd = new Date(classModel.validTo);

    if (tsetStart < classStart || tsetEnd > classEnd) {
      throw new Error("Timetable set is outside the class's active period");
    }
  }
};

/**
 * Validate that there's no conflict between whole-class entries and student group entries
 * at the same day and hour in the same class
 */
export const validateClassStudentGroupConflict: validator<TimetableEntry> = async (
  instance: TimetableEntry,
  options?: QueryOptions | null
): Promise<void> => {
  const timetableSets = await ensureTimetableSetsLoaded(instance, options);
  const timetableSetIds = timetableSets.map((set) => set.timetableSetId);

  let conflict;

  if (instance.studentGroupId === null) {
    // if this is a whole-class entry, check for conflicts with any student groups in this class
    conflict = await TimetableEntry.findOne({
      include: [
        {
          model: TimetableSet,
          as: 'timetableSets',
          required: true,
          through: {
            where: {
              timetableSetId: {
                [Op.in]: timetableSetIds
              }
            }
          }
        }
      ],
      where: {
        classId: instance.classId,
        studentGroupId: {
          [Op.ne]: null // Look for any student group entries
        },
        dayInWeek: instance.dayInWeek,
        hourInDay: instance.hourInDay,
        timetableEntryId: {
          [Op.ne]: instance.timetableEntryId || 0 // Exclude the current entry
        }
      },
      ...options
    });
  } else {
    // If this is a student group entry, check for conflicts with whole-class entries
    conflict = await TimetableEntry.findOne({
      include: [
        {
          model: TimetableSet,
          as: 'timetableSets',
          required: true,
          through: {
            where: {
              timetableSetId: {
                [Op.in]: timetableSetIds
              }
            }
          }
        }
      ],
      where: {
        classId: instance.classId,
        studentGroupId: null, // Look for whole-class entries
        dayInWeek: instance.dayInWeek,
        hourInDay: instance.hourInDay,
        timetableEntryId: {
          [Op.ne]: instance.timetableEntryId || 0 // Exclude the current entry
        }
      },
      ...options
    });
  }

  if (conflict) {
    if (instance.studentGroupId === null) {
      throw new Error('Cannot create class entry when student groups from this class are already assigned at the same time');
    } else {
      throw new Error('Cannot create student group entry when the whole class is already assigned at the time');
    }
  }
};
