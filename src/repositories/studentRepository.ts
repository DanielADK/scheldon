import { Student } from '@models/Student';
import { StudentAssignment } from '@models/StudentAssignment';
import { Class } from '@models/Class';
import { SubClass } from '@models/SubClass';

/**
 * StudentDTO interface
 */
export interface StudentDTO {
  username: string;
  name: string;
  surname: string;
}

/**
 * Create a new student
 * @param data
 */
export const createStudent = async (data: StudentDTO): Promise<Student> => {
  const existingStudent = await Student.findOne({
    where: { username: data.username }
  });
  if (existingStudent) {
    throw new Error('This username is already in use.');
  }
  return await Student.create(data as Student);
};

/**
 * Get a student by ID
 * @param id
 */
export const getStudentById = async (id: number): Promise<Student | null> => {
  return await Student.findOne({
    where: { studentId: id },
    include: [
      {
        model: StudentAssignment,
        as: 'assignments',
        where: {
          validFrom: { lte: new Date() },
          validTo: { gte: new Date() }
        }
      }
    ]
  });
};

/**
 * Get student's history
 * @param id
 */
export const getStudentsHistory = async (
  id: number
): Promise<StudentAssignment | null> => {
  return await StudentAssignment.findOne({
    where: {
      studentId: id
    },
    include: [
      {
        model: Class,
        as: 'class'
      },
      {
        model: SubClass,
        as: 'subClasses'
      }
    ]
  });
};

/**
 * Update a student by ID
 * @param id
 * @param data
 */
export const updateStudent = async (
  id: number,
  data: StudentDTO
): Promise<[affectedCount: number]> => {
  return await Student.update(data, {
    where: { studentId: id }
  });
};

/**
 * Delete a student by ID
 * @param id
 */
export const deleteStudent = async (id: number): Promise<number> => {
  return await Student.destroy({
    where: { studentId: id }
  });
};
