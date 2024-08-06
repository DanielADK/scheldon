import { SubClass } from '@models/SubClass';

/**
 * Validate unique combination of classId and name
 */
export const validateSubClassNameAndClass = async (instance: SubClass) => {
  const existingSubClass = await SubClass.findOne({
    where: {
      name: instance.name,
      classId: instance.classId
    }
  });

  if (existingSubClass) {
    throw new Error('Subclass name already exists within the class');
  }
};
