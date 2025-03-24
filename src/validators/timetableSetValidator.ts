import { TimetableSet } from '@models/TimetableSet';
import { Op } from 'sequelize';
import { validator } from '@validators/genericValidators';
import { QueryOptions } from '@models/types/QueryOptions';

/**
 * Validate validation dates
 * @param instance
 */
export const validateDates: validator<TimetableSet> = async (instance: TimetableSet): Promise<void> => {
  if (new Date(instance.validFrom) > new Date(instance.validTo)) {
    throw new Error('validFrom must be less than validTo');
  }
};

/**
 * Validate unique interval
 * @param instance
 * @param options
 */
export const validateUniqueInterval: validator<TimetableSet> = async (
  instance: TimetableSet,
  options?: QueryOptions | null
): Promise<void> => {
  const existingSet = await TimetableSet.findOne({
    where: {
      validFrom: { [Op.lte]: instance.validTo },
      validTo: { [Op.gte]: instance.validFrom },
      timetableSetId: { [Op.ne]: instance.timetableSetId }
    },
    ...options
  });

  if (existingSet) {
    throw new Error('Timetable set already exists within the validity period of another timetable set');
  }
};
