import { StudentGroup } from '@models/StudentGroup';

/**
 * Validate unique combination of classId and name
 */
export const validatestudentGroupNameAndClass = async (instance: StudentGroup) => {
  const existingstudentGroup = await StudentGroup.findOne({
    where: {
      name: instance.name,
      classId: instance.classId
    }
  });

  if (existingstudentGroup) {
    throw new Error('studentGroup name already exists within the class');
  }
};
