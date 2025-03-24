import { validator } from '@validators/genericValidators';
import { QueryOptions } from '@models/types/QueryOptions';
import { SubstitutionEntry } from '@models/SubstitutionEntry';

/**
 * Validate the studentGroup is in the class
 */
export const validateStudentGroupInClass: validator<SubstitutionEntry> = async (
  instance: SubstitutionEntry,
  options?: QueryOptions | null
): Promise<void> => {
  if (!instance.studentGroup) {
    instance.studentGroup = await instance.$get('studentGroup', options || undefined);
  }
  if (instance.studentGroup && instance.classId !== instance.studentGroup.classId) {
    throw new Error('studentGroup is not in the class');
  }
};
