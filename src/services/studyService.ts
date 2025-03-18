import * as studentAssignmentRepository from '@repositories/studyRepository';
import { StudyDTO } from '@repositories/studyRepository';
import * as classRepository from '@repositories/classRepository';

/**
 * Create a new student assignment
 * @param studentId
 * @param data
 */
export const startStudy = async (studentId: number, data: StudyDTO) => {
  const classInfo = await classRepository.getClassById(data.classId);
  if (!classInfo) {
    throw new Error('Class not found');
  }

  // If validFrom is not provided, set now
  const validFrom = data.validFrom ? new Date(data.validFrom) : new Date();
  // If validTo is not provided, set it to the classes default validTo
  const validTo = data.validTo ? new Date(data.validTo) : new Date(classInfo.validTo);

  // Check if student is not already assigned to the class in the validity period

  return await studentAssignmentRepository.createAssignment(studentId, {
    classId: data.classId,
    validFrom: validFrom,
    validTo: validTo
  } as StudyDTO);
};

/**
 * Terminate a student assignment
 * @param studentId
 * @param data
 */
export const stopStudy = async (studentId: number, data: StudyDTO) => {
  const classInfo = await classRepository.getClassById(data.classId);
  if (!classInfo) {
    throw new Error('Class not found');
  }
  // If validTo is not provided, set it to the classes default validTo
  const validTo = data.validTo ? new Date(data.validTo) : new Date();

  // If studentGroupId is not provided, terminate all assignments for the class
  if (!data.studentGroupId) {
    return await studentAssignmentRepository.terminateAllAssignments(studentId, {
      classId: data.classId,
      validTo: validTo
    });
  }
  // Else terminate only the assignment for the studentGroup
  return await studentAssignmentRepository.terminateAssignment(studentId, {
    classId: data.classId,
    studentGroupId: data.studentGroupId,
    validTo: validTo
  });
};
