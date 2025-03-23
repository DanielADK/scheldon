import { Study } from '@models/Study';
import { Op } from 'sequelize';
import { StudentGroup } from '@models/StudentGroup';

/**
 * Validate studentGroup belongs to class
 * @param instance
 */
export const validatestudentGroupBelongsToClass = async (instance: Study) => {
  if (!instance.studentGroup) {
    instance.studentGroup = await instance.$get('studentGroup');
  }

  if (instance.studentGroup && instance.studentGroup.classId !== instance.classId) {
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
  const actualAssignments = await Study.findAll({
    where: {
      studentId: instance.studentId,
      studentGroupId: { [Op.is]: null },
      validTo: { [Op.gte]: instance.validFrom },
      validFrom: { [Op.lte]: instance.validTo }
    }
  });

  if (actualAssignments.length > 0) {
    throw new Error('Conflicting assignment exists in the validity period');
  }
};

export const validateUniqueStudentGroupAssignment = async (instance: Study) => {
  const existingAssignments = await Study.findOne({
    where: {
      studentId: instance.studentId,
      classId: instance.classId,
      studentGroupId: instance.studentGroupId,
      validTo: { [Op.gte]: instance.validFrom },
      validFrom: { [Op.lte]: instance.validTo }
    }
  });

  if (existingAssignments) {
    throw new Error('Student is already assigned to this student group');
  }
};

export const validateClassExistsWhenStudentGroup = async (instance: Study) => {
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
  const assignment = actualAssignments.find((assignment) => assignment.classId && !assignment.studentGroupId);
  if (!assignment) {
    throw new Error('Student is not assigned to the class');
  }
};

export const validateStudentGroupCategoryDisjunction = async (instance: Study) => {
  if (!instance.studentGroupId) {
    return;
  }
  // Fetch the current studentGroup for the instance
  const studentGroup = instance.studentGroup || (await instance.$get('studentGroup'));
  if (!studentGroup) {
    throw new Error('Student group not found');
  }

  // Skip validation if the studentGroup does not have a category
  if (!studentGroup.categoryId) {
    return;
  }

  // Check if the student is assigned to another studentGroup in the same groupCategory
  const conflictingAssignments = await Study.findOne({
    where: {
      studentId: instance.studentId,
      studentGroupId: { [Op.ne]: studentGroup.studentGroupId },
      validTo: { [Op.gte]: instance.validFrom },
      validFrom: { [Op.lte]: instance.validTo }
    },
    include: [
      {
        model: StudentGroup,
        required: true,
        where: {
          categoryId: studentGroup.categoryId
        }
      }
    ]
  });

  if (conflictingAssignments) {
    throw new Error('Student is already assigned to another student group in the same group category');
  }
};

export const validateValidToWithinClassValidTo = async (instance: Study) => {
  const fetchedClass = await instance.$get('class');
  if (!fetchedClass) {
    throw new Error('Class not found');
  }

  if (new Date(instance.validTo) > new Date(fetchedClass.validTo)) {
    throw new Error('End of study must be less than or equal to class end');
  }
};
