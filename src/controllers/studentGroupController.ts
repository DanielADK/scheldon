// Schema for creating and updating a studentGroup
import Joi from 'joi';
import * as studentGroupRepository from '@repositories/studentGroupRepository';
import { studentGroupDTO, validateCategoryBelongsToSameClass } from '@repositories/studentGroupRepository';
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

const updateStudentGroupSchema: Joi.ObjectSchema<studentGroupDTO> = Joi.object({
  name: Joi.string().min(1).max(100),
  categoryId: Joi.number()
}).min(1);

/**
 * Create a new studentGroup
 * @param ctx
 */
export const createstudentGroup = async (ctx: Context) => {
  try {
    const { error, value } = studentGroupSchema.validate(ctx.request.body);

    if (error) {
      ctx.status = 400;
      ctx.body = { error: error.details[0].message };
      return;
    }

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
  try {
    const studentGroups = await studentGroupService.getstudentGroups();
    ctx.status = 200;
    ctx.body = studentGroups;
  } catch (error) {
    handleError(ctx, error);
  }
};

/**
 * Get a studentGroup by ID
 * @param ctx
 */
export const getstudentGroupById = async (ctx: Context) => {
  try {
    const studentGroupId = await getIdFromParam(ctx.params.id as string);

    const studentGroup = await studentGroupService.getstudentGroupById(studentGroupId);

    if (!studentGroup) {
      ctx.status = 404;
      ctx.body = { error: 'studentGroup not found' };
      return;
    }

    ctx.status = 200;
    ctx.body = studentGroup;
  } catch (error) {
    handleError(ctx, error);
  }
};

/**
 * Get all studentGroups of a specific class
 * @param ctx
 */
export const getstudentGroupsByClassId = async (ctx: Context) => {
  try {
    const classId = await getIdFromParam(ctx.params.classId as string);

    const studentGroups = await studentGroupService.getstudentGroupsByClassId(classId);

    if (!studentGroups.length) {
      ctx.status = 404;
      ctx.body = { error: 'No studentGroups found for the given class' };
      return;
    }

    ctx.status = 200;
    ctx.body = studentGroups;
  } catch (error) {
    handleError(ctx, error);
  }
};

/**
 * Get all studentGroups of a specific category
 * @param ctx
 */
export const getstudentGroupsByCategoryId = async (ctx: Context) => {
  try {
    const categoryId = await getIdFromParam(ctx.params.categoryId as string);

    const studentGroups = await studentGroupService.getstudentGroupsByCategoryId(categoryId);

    ctx.status = 200;
    ctx.body = studentGroups;
  } catch (error) {
    handleError(ctx, error);
  }
};

/**
 * Update a studentGroup
 * @param ctx
 */
export const updatestudentGroup = async (ctx: Context) => {
  try {
    const studentGroupId = await getIdFromParam(ctx.params.id as string);

    // Validate request
    const { error, value } = updateStudentGroupSchema.validate(ctx.request.body, {
      allowUnknown: false, // Zakázat neznámá pole
      stripUnknown: true // Odstranit neznámá pole místo vracení chyby
    });

    if (error) {
      ctx.status = 400;
      ctx.body = { error: error.details[0].message };
      return;
    }
    // Check if updated category belongs to the same class as the group
    if (value.categoryId !== undefined && value.categoryId !== null) {
      await validateCategoryBelongsToSameClass(value.categoryId, studentGroupId);
    }

    const updatedGroup = await studentGroupService.updatestudentGroup(studentGroupId, value);

    if (!updatedGroup) {
      ctx.status = 404;
      ctx.body = { error: 'Update of employee failed.' };
      return;
    }

    ctx.status = 200;
    ctx.body = updatedGroup;
  } catch (error) {
    handleError(ctx, error);
  }
};

/**
 * Delete a studentGroup
 * @param ctx
 */
export const deletestudentGroup = async (ctx: Context) => {
  try {
    const studentGroupId = await getIdFromParam(ctx.params.id as string);
    // Check if the group has any students
    const hasStudents = await studentGroupService.hasStudents(studentGroupId);

    if (hasStudents) {
      ctx.status = 400;
      ctx.body = { error: 'studentGroup cannot be deleted because it has students' };
      return;
    }

    const deleted = await studentGroupService.deletestudentGroup(studentGroupId as number);

    if (!deleted) {
      ctx.status = 404;
      ctx.body = { error: 'studentGroup not found' };
      return;
    }

    ctx.status = 204;
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
