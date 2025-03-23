import { Study } from '@models/Study';
import { Op } from 'sequelize';

/**
 * Retrieves a specific assignment for a student in a given class
 * within a specified validity date range.
 *
 * @param {number} studentId - The unique identifier of the student.
 * @param {number} classId - The unique identifier of the class.
 * @param {Date} validFrom - The start date of the validity range.
 * @param {Date} validTo - The end date of the validity range.
 * @return {Promise<Study|null>} A promise that resolves to the assignment object
 * if found, or null if no matching assignment exists.
 */
export async function getAssignmentByStudentAndClass(
  studentId: number,
  classId: number,
  validFrom: Date,
  validTo: Date
): Promise<Study | null> {
  return await Study.findOne({
    where: {
      studentId: studentId,
      classId: classId,
      validFrom: { [Op.lte]: validTo },
      validTo: { [Op.gte]: validFrom }
    }
  });
}

export interface StudyDTO {
  classId: number;
  studentGroupId?: number;
  validFrom?: Date;
  validTo?: Date;
}

/**
 * End all ongoing assignments
 * @param studentId
 * @param data
 */
export const terminateAssignment = async (studentId: number, data: StudyDTO) => {
  // End all ongoing assignments
  await Study.update(
    {
      validTo: (data.validTo ?? new Date()).toISOString()
    },
    {
      where: {
        studentId: studentId,
        classId: data.classId,
        studentGroupId: data.studentGroupId
      }
    }
  );
};

export const terminateAllAssignments = async (studentId: number, data: StudyDTO) => {
  // End all ongoing assignments
  await Study.update(
    {
      validTo: (data.validTo ?? new Date()).toISOString()
    },
    {
      where: {
        studentId: studentId,
        classId: data.classId
      }
    }
  );
};

export const createAssignment = async (studentId: number, data: StudyDTO) => {
  return await Study.create({
    studentId: studentId,
    classId: data.classId,
    studentGroupId: data.studentGroupId,
    validFrom: data.validFrom,
    validTo: data.validTo
  } as unknown as Study);
};

/**
 * Get all actual assignments by student
 * @param studentId
 */
export const getActualAssignmentsByStudent = async (studentId: number) => {
  return await getAssignmentsByStudentAtTime(studentId, new Date(), new Date());
};

/**
 * Get all student assignments in the validity period
 * @param studentId
 * @param validFrom
 * @param validTo
 */
export const getAssignmentsByStudentAtTime = async (studentId: number, validFrom: Date, validTo: Date) => {
  return await Study.findAll({
    where: {
      studentId: studentId,
      validFrom: { [Op.lte]: validTo },
      validTo: { [Op.gte]: validFrom }
    }
  });
};
