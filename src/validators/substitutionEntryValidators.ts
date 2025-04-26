import { validator } from '@validators/genericValidators';
import { QueryOptions } from '@models/types/QueryOptions';
import { SubstitutionEntry } from '@models/SubstitutionEntry';
import { Class } from '@models/Class';
import { Room } from '@models/Room';
import { Subject } from '@models/Subject';
import { Employee } from '@models/Employee';

/**
 * Validate the studentGroup is in the class
 */
export const validateStudentGroupInClass: validator<SubstitutionEntry> = async (
  instance: SubstitutionEntry,
  options?: QueryOptions | null
): Promise<void> => {
  instance.studentGroup ??= await instance.$get('studentGroup', options || undefined);
  if (instance.studentGroup && instance.classId !== instance.studentGroup.classId) {
    throw new Error('studentGroup is not in the class');
  }
};

export type FilterType = 'class' | 'employee' | 'room' | 'subject';

/**
 * Validates that the entity exists in the database
 */
export const validateEntity = async (filterType: FilterType, entityId: number): Promise<void> => {
  let exists = false;

  switch (filterType) {
    case 'class':
      exists = !!(await Class.findByPk(entityId));
      break;
    case 'employee':
      exists = !!(await Employee.findByPk(entityId));
      break;
    case 'room':
      exists = !!(await Room.findByPk(entityId));
      break;
    case 'subject':
      exists = !!(await Subject.findByPk(entityId));
      break;
  }

  if (!exists) {
    throw new Error(`${filterType.charAt(0).toUpperCase() + filterType.slice(1)} with ID ${entityId} not found`);
  }
};
