import { StudentAssignment } from '../models/StudentAssignment';
import { Class } from '../models/Class';
import { SubClass } from '../models/SubClass';
import { Transaction } from 'sequelize';
import * as subClassRepository from '../repositories/subClassRepository';
import { SubClassDTO } from '../repositories/subClassRepository';

/**
 * Transfer subClasses from existing Class to new Class
 * @param existingClass - The existing class
 * @param newClass - The new class
 * @param transaction - The transaction
 * @returns Promise<void>
 */
export const transferSubClasses = async (
  existingClass: Class,
  newClass: Class,
  transaction: Transaction
): Promise<void> => {
  // Copy all subclasses from the existing Class to the new Class
  const subClassesToCopy = await SubClass.findAll({
    where: { classId: existingClass.classId },
    transaction: transaction
  });

  for (const subClass of subClassesToCopy) {
    // Create new subClass
    const newSubClass = await SubClass.create(
      {
        name: subClass.name,
        classId: newClass.classId
      } as SubClass,
      { transaction: transaction }
    );

    // Transfer subClass assignments
    await transferSubClassAssignments(
      existingClass,
      newClass,
      subClass,
      newSubClass,
      transaction
    );
  }
};

/**
 * Duplicate subClass assignments
 * @param existingClass - The existing class
 * @param newClass - The new class
 * @param existingSubClass - The existing subClass
 * @param newSubClass - The new subClass
 * @param transaction - The transaction
 * @returns Promise<void>
 */
export const transferSubClassAssignments = async (
  existingClass: Class,
  newClass: Class,
  existingSubClass: SubClass,
  newSubClass: SubClass,
  transaction: Transaction
): Promise<void> => {
  // End old existingSubClass assignments
  const oldSubClassAssignments = await StudentAssignment.findAll({
    where: {
      classId: existingClass.classId,
      subClassId: existingSubClass.subClassId
    },
    transaction: transaction
  });
  for (const oldSubClassAssignment of oldSubClassAssignments) {
    await oldSubClassAssignment.update(
      { validTo: new Date(new Date().getTime() - 1).toISOString() },
      { transaction: transaction }
    );

    // Create new subClass assignment
    await StudentAssignment.create(
      {
        studentId: oldSubClassAssignment.studentId,
        classId: newClass.classId,
        subClassId: newSubClass.subClassId,
        validFrom: new Date().toISOString(),
        validTo: oldSubClassAssignment.validTo
      } as StudentAssignment,
      { transaction: transaction }
    );
  }
};

/**
 * Create a new subclass
 * @param data
 */
export const createSubClass = async (data: SubClassDTO) => {
  return await subClassRepository.createSubClass(data);
};

/**
 * Get all subclasses
 */
export const getSubClasses = async () => {
  return await subClassRepository.getSubClasses();
};

/**
 * Get a subclass by ID
 * @param subClassId
 */
export const getSubClassById = async (subClassId: number) => {
  return await subClassRepository.getSubClassById(subClassId);
};

/**
 * Get all subclasses of a specific class
 * @param classId
 */
export const getSubClassesByClassId = async (classId: number) => {
  return await subClassRepository.getSubClassesByClassId(classId);
};

/**
 * Update a subclass by ID
 * @param subClassId
 * @param data
 */
export const updateSubClass = async (
  subClassId: number,
  data: Partial<SubClassDTO>
) => {
  return await subClassRepository.updateSubClass(subClassId, data);
};

/**
 * Delete a subclass by ID
 * @param subClassId
 */
export const deleteSubClass = async (subClassId: number) => {
  return await subClassRepository.deleteSubClass(subClassId);
};
