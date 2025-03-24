import { StudentGroup } from '@models/StudentGroup';
import { validator } from '@validators/genericValidators';
import { QueryOptions } from '@models/types/QueryOptions';

/**
 * Validate unique combination of classId and name
 */
export const validatestudentGroupNameAndClass: validator<StudentGroup> = async (instance: StudentGroup, options?: QueryOptions | null) => {
  const existingstudentGroup = await StudentGroup.findOne({
    where: {
      name: instance.name,
      classId: instance.classId
    },
    ...options
  });

  if (existingstudentGroup) {
    throw new Error('studentGroup name already exists within the class');
  }
};
