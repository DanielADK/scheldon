import * as studentAssignmentRepository from '@repositories/studentAssignmentRepository';
import { StudentAssignmentDTO } from '@repositories/studentAssignmentRepository';
import * as classRepository from '@repositories/classRepository';

/**
 * Create a new student assignment
 * @param studentId
 * @param data
 */
export const createAssignment = async (
  studentId: number,
  data: StudentAssignmentDTO
) => {
  const classInfo = await classRepository.getClassById(data.classId);
  if (!classInfo) {
    throw new Error('Class not found');
  }

  // If validFrom is not provided, set it to the classes default validFrom
  const validFrom = data.validFrom
    ? new Date(data.validFrom)
    : new Date(classInfo.validFrom);
  // If validTo is not provided, set it to the classes default validTo
  const validTo = data.validTo
    ? new Date(data.validTo)
    : new Date(classInfo.validTo);

  // Check if student is not already assigned to the class in the validity period

  return await studentAssignmentRepository.createAssignment(studentId, {
    classId: data.classId,
    validFrom: validFrom,
    validTo: validTo
  });
};

/**
 * Terminate a student assignment
 * @param studentId
 * @param data
 */
export const terminateAssignment = async (
  studentId: number,
  data: StudentAssignmentDTO
) => {
  const classInfo = await classRepository.getClassById(data.classId);
  if (!classInfo) {
    throw new Error('Class not found');
  }
  // If validTo is not provided, set it to the classes default validTo
  const validTo = data.validTo ? new Date(data.validTo) : new Date();

  // If subClassId is not provided, terminate all assignments for the class
  if (!data.subClassId) {
    return await studentAssignmentRepository.terminateAllAssignments(
      studentId,
      {
        classId: data.classId,
        validTo: validTo
      }
    );
  }
  // Else terminate only the assignment for the subClass
  return await studentAssignmentRepository.terminateAssignment(studentId, {
    classId: data.classId,
    subClassId: data.subClassId,
    validTo: validTo
  });
};
