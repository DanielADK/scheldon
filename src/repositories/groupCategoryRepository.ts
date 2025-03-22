import { GroupCategory } from '@models/GroupCategory';
import { FindAttributeOptions } from 'sequelize';

/**
 * GroupCategoryDTO interface
 */
export interface GroupCategoryDTO {
  name?: string;
  classId: number;
}

const groupCategoryAttributes: FindAttributeOptions = ['categoryId', 'name', `classId`];

/**
 * Create a new group category
 * @param data
 */
export const createGroupCategory = async (data: GroupCategoryDTO): Promise<GroupCategory> => {
  const existingCategory = await GroupCategory.findOne({
    where: { name: data.name }
  });
  if (existingCategory) {
    throw new Error('This category name is already in use.');
  }
  return await GroupCategory.create(data as GroupCategory);
};

/**
 * Get all group categories
 */
export const getGroupCategories = async (limit: number, offset: number): Promise<{ rows: GroupCategory[]; count: number }> => {
  const { rows, count } = await GroupCategory.findAndCountAll({
    limit,
    offset,
    attributes: groupCategoryAttributes
  });

  return { rows, count };
};

/**
 * Get a group category by ID
 * @param categoryId
 */
export const getGroupCategoryById = async (categoryId: number): Promise<GroupCategory | null> => {
  return await GroupCategory.findOne({
    where: { categoryId: categoryId },
    attributes: groupCategoryAttributes
  });
};

/**
 * Get a group category with student groups
 * @param categoryId
 */
export const getGroupCategoryWithStudentGroups = async (categoryId: number): Promise<GroupCategory | null> => {
  return await GroupCategory.findOne({
    where: { categoryId: categoryId },
    include: ['studentGroups'],
    attributes: groupCategoryAttributes
  });
};

/**
 * Update a group category
 * @param categoryId
 * @param data
 */
export const updateGroupCategory = async (categoryId: number, data: Partial<GroupCategoryDTO>): Promise<[affectedRows: number]> => {
  return await GroupCategory.update(data, {
    where: { categoryId: categoryId }
  });
};

/**
 * Delete a group category
 * @param categoryId
 */
export const deleteGroupCategory = async (categoryId: number): Promise<number> => {
  return await GroupCategory.destroy({
    where: { categoryId }
  });
};
