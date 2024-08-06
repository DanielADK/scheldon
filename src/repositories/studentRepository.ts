import { Student } from '@models/Student';
import { StudentAssignment } from '@models/StudentAssignment';
import { Class } from '@models/Class';
import { SubClass } from '@models/SubClass';
import { Op } from 'sequelize';

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
  return await Student.findByPk(id, {
    include: [
      {
        model: StudentAssignment,
        attributes: ['validFrom', 'validTo'],
        required: false,
        where: {
          validFrom: { [Op.lte]: new Date() },
          validTo: { [Op.gte]: new Date() }
        },
        include: [
          {
            model: Class,
            attributes: ['classId', 'name', 'roomId', 'employeeId']
          },
          {
            model: SubClass,
            attributes: ['subClassId', 'name']
          }
        ]
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
): Promise<StudentAssignment[] | null> => {
  return await StudentAssignment.findAll({
    attributes: ['validFrom', 'validTo'],
    where: {
      studentId: id
    },
    include: [
      {
        model: Class,
        attributes: ['classId', 'name', 'roomId', 'employeeId']
      },
      {
        model: SubClass,
        attributes: ['subClassId', 'name']
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
