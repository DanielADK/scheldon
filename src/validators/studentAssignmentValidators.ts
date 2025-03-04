import { Study } from '@models/Study';
import { Op } from 'sequelize';

/**
 * Validate studentGroup belongs to class
 * @param instance
 */
export const validatestudentGroupBelongsToClass = async (instance: Study) => {
  if (!instance.studentGroup) {
    instance.studentGroup = await instance.$get('studentGroup');
  }

  if (
    instance.studentGroup &&
    instance.studentGroup.classId !== instance.classId
  ) {
    throw new Error('studentGroup must belong to the class');
  }
};

/**
 * Validate class dates
 * @param instance
 */
export const validateClassDates = async (instance: Study) => {
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

export const validateExclusiveClassAssignment = async (instance: Study) => {
  const actualAssignments = await Study.findOne({
    where: {
      studentId: instance.studentId,
      studentGroupId: { [Op.is]: null },
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

export const validateClassExistsWhenstudentGroup = async (instance: Study) => {
  const actualAssignments = await Study.findAll({
    where: {
      studentId: instance.studentId,
      classId: instance.classId,
      studentGroupId: { [Op.is]: null },
      validTo: {
        [Op.gte]: instance.validFrom
      },
      validFrom: {
        [Op.lte]: instance.validTo
      }
    }
  });
  // Find assignment where classId is number and studentGroupId is null
  const assignment = actualAssignments.find(
    (assignment) => assignment.classId && !assignment.studentGroupId
  );
  if (!assignment) {
    throw new Error('Student is not assigned to the class');
  }
};
