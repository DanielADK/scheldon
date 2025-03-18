// Schema for creating and updating a studentGroup
import Joi from 'joi';
import * as studentGroupRepository from '@repositories/studentGroupRepository';
import { studentGroupDTO, validateCategoryBelongsToClass } from '@repositories/studentGroupRepository';
import * as groupCategoryService from '@services/groupCategoryService';
import * as studentGroupService from '@services/studentGroupService';
import { Context } from 'koa';
import { getIdFromParam, handleError } from '../lib/controllerTools';
import { Transaction } from 'sequelize';

const studentGroupSchema: Joi.ObjectSchema<studentGroupDTO> = Joi.object({
  name: Joi.string().required().min(1).max(100),
  classId: Joi.number().required(),
  categoryId: Joi.number().allow(null)
});

/**
 * Create a new studentGroup
 * @param ctx
 */
export const createstudentGroup = async (ctx: Context) => {
  const { error, value } = studentGroupSchema.validate(ctx.request.body);

  if (error) {
    ctx.status = 400;
    ctx.body = { error: error.details[0].message };
    return;
  }

  try {
    // check if category belongs to the same class as the group
    if (value.categoryId) {
      const category = await groupCategoryService.getGroupCategoryById(value.categoryId);
      if (!category) {
        ctx.status = 400;
        ctx.body = { error: 'Category not found' };
        return;
      }

      if (category.classId !== value.classId) {
        ctx.status = 400;
        ctx.body = { error: 'Group must be in same class as its category' };
        return;
      }
    }

    const studentGroup = await studentGroupService.createstudentGroup(value);
    ctx.status = 201;
    ctx.body = studentGroup;
  } catch (error) {
    handleError(ctx, error);
  }
};

/**
 * Get all studentGroups
 * @param ctx
 */
export const getstudentGroups = async (ctx: Context) => {
  const studentGroups = await studentGroupService.getstudentGroups();
  ctx.status = 200;
  ctx.body = studentGroups;
};

/**
 * Get a studentGroup by ID
 * @param ctx
 */
export const getstudentGroupById = async (ctx: Context) => {
  const studentGroupId = await getIdFromParam(ctx.params.id as string);

  const studentGroup = await studentGroupService.getstudentGroupById(studentGroupId);

  if (!studentGroup) {
    ctx.status = 404;
    ctx.body = { error: 'studentGroup not found' };
    return;
  }

  ctx.status = 200;
  ctx.body = studentGroup;
};

/**
 * Get all studentGroups of a specific class
 * @param ctx
 */
export const getstudentGroupsByClassId = async (ctx: Context) => {
  const classId = await getIdFromParam(ctx.params.classId as string);

  const studentGroups = await studentGroupService.getstudentGroupsByClassId(classId);

  if (!studentGroups.length) {
    ctx.status = 404;
    ctx.body = { error: 'No studentGroups found for the given class' };
    return;
  }

  ctx.status = 200;
  ctx.body = studentGroups;
};

/**
 * Get all studentGroups of a specific category
 * @param ctx
 */
export const getstudentGroupsByCategoryId = async (ctx: Context) => {
  const categoryId = await getIdFromParam(ctx.params.categoryId as string);

  const studentGroups = await studentGroupService.getstudentGroupsByCategoryId(categoryId);

  ctx.status = 200;
  ctx.body = studentGroups;
};

/**
 * Update a studentGroup
 * @param ctx
 */
export const updatestudentGroup = async (ctx: Context) => {
  const studentGroupId = await getIdFromParam(ctx.params.id as string);

  // Validate request
  const { error, value } = studentGroupSchema.validate(ctx.request.body);

  if (error) {
    ctx.status = 400;
    ctx.body = { error: error.details[0].message };
    return;
  }

  try {
    // Check if updated category belongs to the same class as the group
    if (value.categoryId !== undefined && value.categoryId !== null) {
      await validateCategoryBelongsToClass(value.categoryId, value.classId);
    }

    const [affectedCount] = await studentGroupService.updatestudentGroup(studentGroupId, value);

    if (affectedCount > 0) {
      ctx.status = 200;
      ctx.body = { message: 'studentGroup updated' };
    } else {
      ctx.status = 404;
      ctx.body = { error: 'studentGroup not found' };
    }
  } catch (error) {
    handleError(ctx, error);
  }
};

/**
 * Delete a studentGroup
 * @param ctx
 */
export const deletestudentGroup = async (ctx: Context) => {
  const studentGroupId = await getIdFromParam(ctx.params.id as string);

  try {
    // Check if the group has any students
    const hasStudents = await studentGroupService.hasStudents(studentGroupId);

    if (hasStudents) {
      ctx.status = 400;
      ctx.body = { error: 'studentGroup cannot be deleted because it has students' };
      return;
    }

    const deleted = await studentGroupService.deletestudentGroup(studentGroupId);

    if (!deleted) {
      ctx.status = 404;
      ctx.body = { error: 'studentGroup not found' };
      return;
    }

    ctx.status = 200;
    ctx.body = { message: 'studentGroup deleted successfully' };
  } catch (error) {
    handleError(ctx, error);
  }
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
