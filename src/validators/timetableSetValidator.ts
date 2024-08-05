import { TimetableSet } from '@models/TimetableSet';
import { Op } from 'sequelize';

/**
 * Validate validation dates
 * @param instance
 */
export const validateDates = async (instance: TimetableSet): Promise<void> => {
  if (new Date(instance.validFrom) > new Date(instance.validTo)) {
    throw new Error('validFrom must be less than validTo');
  }
};

/**
 * Validate unique interval
 * @param instance
 */
export const validateUniqueInterval = async (
  instance: TimetableSet
): Promise<void> => {
  const existingSet = await TimetableSet.findOne({
    where: {
      validFrom: { [Op.lte]: instance.validTo },
      validTo: { [Op.gte]: instance.validFrom },
      timetableSetId: { [Op.ne]: instance.timetableSetId }
    }
  });

  if (existingSet) {
    throw new Error(
      'Timetable set already exists within the validity period of another timetable set'
    );
  }
};
