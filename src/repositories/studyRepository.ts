import { Study } from '@models/Study';
import { Op } from 'sequelize';

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
      validTo: new Date(new Date().getTime() - 1).toISOString()
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
      validTo: new Date(new Date().getTime() - 1).toISOString()
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
    studentGroupId: null,
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
