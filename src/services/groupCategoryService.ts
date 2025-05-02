import * as groupCategoryRepository from '@repositories/groupCategoryRepository';
import { GroupCategoryDTO } from '@repositories/groupCategoryRepository';
import { getClassById } from '@services/classService';

/**
 * Create a new group category
 * @param data
 */
export const createGroupCategory = async (data: GroupCategoryDTO) => {
  const classEntity = await getClassById(data.classId);
  if (!classEntity) {throw new Error("Class not found")}

  return await groupCategoryRepository.createGroupCategory(data);
};

/**
 * Get all group categories
 */
export const getAllGroupCategories = async (page: number, limit: number) => {
  const offset = (page - 1) * limit;
  return await groupCategoryRepository.getGroupCategories(limit, offset);
};

/**
 * Get a group category by ID
 * @param categoryId
 */
export const getGroupCategoryById = async (categoryId: number) => {
  return await groupCategoryRepository.getGroupCategoryById(categoryId);
};

/**
 * Get a group category with student groups
 * @param categoryId
 */
export const getGroupCategoryWithStudentGroups = async (categoryId: number) => {
  return await groupCategoryRepository.getGroupCategoryWithStudentGroups(categoryId);
};

/**
 * Update a group category
 * @param categoryId
 * @param data
 */
export const updateGroupCategory = async (categoryId: number, data: GroupCategoryDTO) => {
  return await groupCategoryRepository.updateGroupCategory(categoryId, data);
};

/**
 * Delete a group category
 * @param categoryId
 */
export const deleteGroupCategory = async (categoryId: number) => {
  return await groupCategoryRepository.deleteGroupCategory(categoryId);
};
