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

/**
 * Validate restriction for deletion if there are dependencies
 */
export const validateStudentGroupOnDelete = async (instance: StudentGroup) => {
  const relatedRecordsCount = await StudentGroup.count({
    where: { studentGroupId: instance.studentGroupId },
    include: [{ all: true }] // Adjust include to load the required relations explicitly
  });

  if (relatedRecordsCount > 0) {
    throw new Error('Cannot delete studentGroup as it has dependent records');
  }
};
