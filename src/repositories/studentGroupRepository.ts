import { StudentGroup } from '@models/StudentGroup';
import { Transaction } from 'sequelize';
import * as groupCategoryService from '@services/groupCategoryService';

/**
 * studentGroupDTO interface
 */
export interface studentGroupDTO {
  name: string;
  classId: number;
  categoryId?: number;
}

/**
 * Create a new studentGroup
 * @param data
 */
export const createstudentGroup = async (data: studentGroupDTO): Promise<StudentGroup> => {
  return await StudentGroup.create(data as StudentGroup);
};

/**
 * Get all studentGroups
 */
export const getstudentGroups = async (): Promise<StudentGroup[]> => {
  return await StudentGroup.findAll();
};

/**
 * Get a studentGroup by ID
 * @param studentGroupId
 */
export const getstudentGroupById = async (studentGroupId: number): Promise<StudentGroup | null> => {
  return await StudentGroup.findByPk(studentGroupId);
};

/**
 * Get all studentGroups of a specific class
 * @param classId
 */
export const getstudentGroupsByClassId = async (classId: number): Promise<StudentGroup[]> => {
  return await StudentGroup.findAll({
    where: { classId }
  });
};

/**
 * Get all studentGroups of a specific category
 * @param categoryId
 */
export const getstudentGroupsByCategoryId = async (categoryId: number): Promise<StudentGroup[]> => {
  return await StudentGroup.findAll({
    where: { categoryId: categoryId }
  });
};

/**
 * Update a studentGroup by ID
 * @param studentGroupId
 * @param data
 * @param transaction
 */
export const updatestudentGroup = async (
  studentGroupId: number,
  data: Partial<studentGroupDTO>,
  transaction?: Transaction | null
): Promise<[affectedRows: number, updatedStudentGroups: StudentGroup[]]> => {
  return await StudentGroup.update(data, {
    where: { studentGroupId: studentGroupId },
    transaction,
    returning: true
  });
};

/**
 * Delete a studentGroup by ID
 * @param studentGroupId
 */
export const deletestudentGroup = async (studentGroupId: number): Promise<number> => {
  return await StudentGroup.destroy({
    where: { studentGroupId }
  });
};

/**
 * Reset category for all studentGroups in a category
 * @param categoryId
 * @param transaction
 */
export const resetCategoryForGroups = async (categoryId: number, transaction?: Transaction): Promise<[number, StudentGroup[]]> => {
  return await StudentGroup.update(
    { categoryId: null },
    {
      where: { categoryId: categoryId },
      transaction,
      returning: true
    }
  );
};

/**
 * Validate if a category belongs to the same class as specified.
 * This function checks whether the provided categoryID exists,
 * and whether it belongs to the same class as the provided classID.
 *
 * @param categoryId - The ID of the category to validate.
 * @param studentGroupId - The ID of the student group to validate against.
 * @throws {Error} - Throws an error if the category is not found or if the class ID does not match.
 */
export const validateCategoryBelongsToSameClass = async (categoryId: number, studentGroupId: number) => {
  const category = await groupCategoryService.getGroupCategoryById(categoryId);
  const studentGroupsClass = await getstudentGroupById(studentGroupId);
  if (!category) {
    throw new Error('Category not found');
  }
  if (!studentGroupsClass) {
    throw new Error('Student group not found');
  }
  if (category.classId !== studentGroupsClass.classId) {
    throw new Error('Group must be in same ßclass as its category');
  }
};
