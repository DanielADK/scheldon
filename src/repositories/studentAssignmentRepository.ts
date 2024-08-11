import { StudentAssignment } from '@models/StudentAssignment';
import { Op } from 'sequelize';

export interface StudentAssignmentDTO {
  classId: number;
  subClassId?: number;
  validFrom?: Date;
  validTo?: Date;
}

/**
 * End all ongoing assignments
 * @param studentId
 * @param data
 */
export const terminateAssignment = async (
  studentId: number,
  data: StudentAssignmentDTO
) => {
  // End all ongoing assignments
  await StudentAssignment.update(
    {
      validTo: new Date(new Date().getTime() - 1).toISOString()
    },
    {
      where: {
        studentId: studentId,
        classId: data.classId,
        subClassId: data.subClassId
      }
    }
  );
};

export const terminateAllAssignments = async (
  studentId: number,
  data: StudentAssignmentDTO
) => {
  // End all ongoing assignments
  await StudentAssignment.update(
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

export const createAssignment = async (
  studentId: number,
  data: StudentAssignmentDTO
) => {
  return await StudentAssignment.create({
    studentId: studentId,
    classId: data.classId,
    subClassId: null,
    validFrom: data.validFrom,
    validTo: data.validTo
  } as unknown as StudentAssignment);
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
export const getAssignmentsByStudentAtTime = async (
  studentId: number,
  validFrom: Date,
  validTo: Date
) => {
  return await StudentAssignment.findAll({
    where: {
      studentId: studentId,
      validFrom: { [Op.lte]: validTo },
      validTo: { [Op.gte]: validFrom }
    }
  });
};
