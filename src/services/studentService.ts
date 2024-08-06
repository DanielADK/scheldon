import * as studentRepository from '@repositories/studentRepository';
import { StudentDTO } from '@repositories/studentRepository';
import { StudentAssignment } from '@models/StudentAssignment';

/**
 * Create a new student
 * @param data
 */
export const createStudent = async (data: StudentDTO) => {
  return await studentRepository.createStudent(data);
};

/**
 * Get a student by ID
 * @param id
 */
export const getStudentById = async (id: number) => {
  return await studentRepository.getStudentById(id);
};

/**
 * Get student's history
 * @param id
 */
export const getStudentsHistory = async (
  id: number
): Promise<StudentAssignment[] | null> => {
  return await studentRepository.getStudentsHistory(id);
};

/**
 * Update a student by ID
 * @param id
 * @param data
 */
export const updateStudent = async (id: number, data: StudentDTO) => {
  return await studentRepository.updateStudent(id, data);
};

/**
 * Delete a student by ID
 * @param id
 */
export const deleteStudent = async (id: number) => {
  return await studentRepository.deleteStudent(id);
};
