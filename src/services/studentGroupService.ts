import { Study } from '@models/Study';
import { Class } from '@models/Class';
import { StudentGroup } from '@models/StudentGroup';
import { Transaction } from 'sequelize';
import * as studentGroupRepository from '@repositories/studentGroupRepository';
import { StudentGroupDTO } from '@repositories/studentGroupRepository';

/**
 * Transfer studentGroups from existing Class to new Class
 * @param existingClass - The existing class
 * @param newClass - The new class
 * @param transaction - The transaction
 * @returns Promise<void>
 */
export const transferstudentGroups = async (existingClass: Class, newClass: Class, transaction: Transaction): Promise<void> => {
  // Copy all studentGroups from the existing Class to the new Class
  const studentGroupsToCopy = await StudentGroup.findAll({
    where: { classId: existingClass.classId },
    transaction: transaction
  });

  for (const studentGroup of studentGroupsToCopy) {
    // Create new studentGroup
    const newstudentGroup = await StudentGroup.create(
      {
        name: studentGroup.name,
        classId: newClass.classId
      } as StudentGroup,
      { transaction: transaction }
    );

    // Transfer studentGroup assignments
    await transferstudentGroupAssignments(existingClass, newClass, studentGroup, newstudentGroup, transaction);
  }
};

/**
 * Duplicate studentGroup assignments
 * @param existingClass - The existing class
 * @param newClass - The new class
 * @param existingstudentGroup - The existing studentGroup
 * @param newstudentGroup - The new studentGroup
 * @param transaction - The transaction
 * @returns Promise<void>
 */
export const transferstudentGroupAssignments = async (
  existingClass: Class,
  newClass: Class,
  existingstudentGroup: StudentGroup,
  newstudentGroup: StudentGroup,
  transaction: Transaction
): Promise<void> => {
  // End old existingstudentGroup assignments
  const oldstudentGroupAssignments = await Study.findAll({
    where: {
      classId: existingClass.classId,
      studentGroupId: existingstudentGroup.studentGroupId
    },
    transaction: transaction
  });
  for (const oldstudentGroupAssignment of oldstudentGroupAssignments) {
    await oldstudentGroupAssignment.update({ validTo: new Date(new Date().getTime() - 1).toISOString() }, { transaction: transaction });

    // Create new studentGroup assignment
    await Study.create(
      {
        studentId: oldstudentGroupAssignment.studentId,
        classId: newClass.classId,
        studentGroupId: newstudentGroup.studentGroupId,
        validFrom: new Date().toISOString(),
        validTo: oldstudentGroupAssignment.validTo
      } as Study,
      { transaction: transaction }
    );
  }
};

/**
 * Create a new studentGroup
 * @param data
 */
export const createstudentGroup = async (data: StudentGroupDTO) => {
  return await studentGroupRepository.createstudentGroup(data);
};

/**
 * Get all studentGroups
 */
export const getstudentGroups = async () => {
  return await studentGroupRepository.getstudentGroups();
};

/**
 * Get a studentGroup by ID
 * @param studentGroupId
 */
export const getstudentGroupById = async (studentGroupId: number) => {
  return await studentGroupRepository.getstudentGroupById(studentGroupId);
};

/**
 * Get all studentGroups of a specific class
 * @param classId
 */
export const getstudentGroupsByClassId = async (classId: number) => {
  return await studentGroupRepository.getstudentGroupsByClassId(classId);
};

/**
 * Get all studentGroups of a specific category
 * @param categoryId
 */
export const getstudentGroupsByCategoryId = async (categoryId: number) => {
  return await studentGroupRepository.getstudentGroupsByCategoryId(categoryId);
};

/**
 * Update a studentGroup by ID
 * @param studentGroupId
 * @param data
 */
export const updatestudentGroup = async (studentGroupId: number, data: Partial<StudentGroupDTO>): Promise<StudentGroup | null> => {
  const [count] = await studentGroupRepository.updatestudentGroup(studentGroupId, data);

  if (count === 0) {
    throw new Error('StudentGroup not found or no changes made');
  }

  return await studentGroupRepository.getstudentGroupById(studentGroupId);
};

/**
 * Delete a studentGroup by ID
 * @param studentGroupId
 */
export const deletestudentGroup = async (studentGroupId: number) => {
  return await studentGroupRepository.deletestudentGroup(studentGroupId);
};

/**
 * Reset category for all studentGroups in a category
 * Used when deleting a category
 * @param categoryId
 * @param transaction
 */
export const resetCategoryForGroups = async (categoryId: number, transaction?: Transaction) => {
  return await studentGroupRepository.resetCategoryForGroups(categoryId, transaction);
};

/**
 * Check if a studentGroup has any students
 * @param studentGroupId - The ID of the studentGroup
 * @returns Promise<boolean>
 */
export const hasStudents = async (studentGroupId: number): Promise<boolean> => {
  const studies = await Study.findOne({
    where: { studentGroupId: studentGroupId }
  });

  return !!studies;
};
