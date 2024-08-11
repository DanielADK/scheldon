import { StudentAssignment } from '@models/StudentAssignment';
import { Op } from 'sequelize';

/**
 * Validate subclass belongs to class
 * @param instance
 */
export const validateSubClassBelongsToClass = async (
  instance: StudentAssignment
) => {
  if (!instance.subClass) {
    instance.subClass = await instance.$get('subClass');
  }

  if (instance.subClass && instance.subClass.classId !== instance.classId) {
    throw new Error('Subclass must belong to the class');
  }
};

/**
 * Validate class dates
 * @param instance
 */
export const validateClassDates = async (instance: StudentAssignment) => {
  const fetchedClass = await instance.$get('class');
  if (!fetchedClass) {
    throw new Error('Class not found');
  }
  instance.class = fetchedClass;

  if (new Date(instance.validFrom) > new Date(instance.validTo)) {
    throw new Error('validFrom must be less than validTo');
  }

  if (new Date(instance.validFrom) < new Date(instance.class.validFrom)) {
    throw new Error('validFrom must be greater than class validFrom');
  }
  if (new Date(instance.validTo) > new Date(instance.class.validTo)) {
    throw new Error('validTo must be less than class validTo');
  }
};

export const validateExclusiveClassAssignment = async (
  instance: StudentAssignment
) => {
  const actualAssignments = await StudentAssignment.findOne({
    where: {
      studentId: instance.studentId,
      subClassId: { [Op.is]: null },
      validTo: {
        [Op.gte]: instance.validFrom
      },
      validFrom: {
        [Op.lte]: instance.validTo
      }
    }
  });

  if (actualAssignments) {
    throw new Error('Assignment already exists in the validity period');
  }
};

export const validateClassExistsWhenSubClass = async (
  instance: StudentAssignment
) => {
  const actualAssignments = await StudentAssignment.findAll({
    where: {
      studentId: instance.studentId,
      classId: instance.classId,
      subClassId: { [Op.is]: null },
      validTo: {
        [Op.gte]: instance.validFrom
      },
      validFrom: {
        [Op.lte]: instance.validTo
      }
    }
  });
  // Find assignment where classId is number and subclassId is null
  const assignment = actualAssignments.find(
    (assignment) => assignment.classId && !assignment.subClassId
  );
  if (!assignment) {
    throw new Error('Student is not assigned to the class');
  }
};
