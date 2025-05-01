import * as groupCategoryService from '@services/groupCategoryService';
import { Context } from 'koa';
import Joi from 'joi';
import { GroupCategoryDTO } from '@repositories/groupCategoryRepository';
import { getIdFromParam, handleError } from '../lib/controllerTools';

// Schema for creating a group category
const groupCategorySchema: Joi.ObjectSchema<GroupCategoryDTO> = Joi.object({
  name: Joi.string().required().min(3).max(50),
  classId: Joi.number().required()
});

/**
 * Create a new group category
 * POST /group-categories
 */
export const createGroupCategory = async (ctx: Context) => {
  // Validate request
  const { error, value } = groupCategorySchema.validate(ctx.request.body);

  if (error) {
    ctx.status = 400;
    ctx.body = { error: error.details[0].message };
    return;
  }

  try {
    const groupCategory = await groupCategoryService.createGroupCategory(value);
    ctx.status = 201;
    ctx.body = groupCategory;
  } catch (error) {
    handleError(ctx, error);
  }
};

/**
 * Get all group categories
 * GET /group-categories
 */
export const getAllGroupCategories = async (ctx: Context) => {
  try {
    // Pagination
    const page = parseInt(ctx.query.page as string) || 1;
    const limit = parseInt(ctx.query.limit as string) || 10;

    // Get all group categories
    const groupCategories = await groupCategoryService.getAllGroupCategories(page, limit);

    ctx.status = 200;
    ctx.body = {
      data: groupCategories.rows,
      meta: {
        total: groupCategories.count,
        page,
        limit
      }
    };
  } catch (error) {
    handleError(ctx, error);
  }
};

/**
 * Get a group category by ID
 * GET /group-categories/:id
 */
export const getGroupCategoryById = async (ctx: Context) => {
  try {
    const categoryId = await getIdFromParam(ctx.params.id as string);

    const groupCategory = await groupCategoryService.getGroupCategoryById(categoryId);

    if (!groupCategory) {
      ctx.status = 404;
      ctx.body = { error: 'Group category not found' };
      return;
    }

    ctx.status = 200;
    ctx.body = groupCategory;
  } catch (error) {
    handleError(ctx, error);
  }
};

/**
 * Get a group category with student groups
 * GET /group-categories/:id/student-groups
 */
export const getGroupCategoryWithStudentGroups = async (ctx: Context) => {
  try {
    const categoryId = await getIdFromParam(ctx.params.id as string);

    const groupCategory = await groupCategoryService.getGroupCategoryWithStudentGroups(categoryId);

    if (!groupCategory) {
      ctx.status = 404;
      ctx.body = { error: 'Group category not found' };
      return;
    }

    ctx.status = 200;
    ctx.body = groupCategory;
  } catch (error) {
    handleError(ctx, error);
  }
};

/**
 * Update a group category
 * @param ctx
 */
export const updateGroupCategory = async (ctx: Context) => {
  try {
    const categoryId = await getIdFromParam(ctx.params.id as string);

    // Validate request - only name can be updated
    const { error, value } = Joi.object({ name: Joi.string().required().min(3).max(50) }).validate(ctx.request.body);

    if (error) {
      throw new Error(error.details[0].message);
    }

    const existingCategory = await groupCategoryService.getGroupCategoryById(categoryId);

    if (!existingCategory) {
      ctx.status = 404;
      ctx.body = { error: 'Category not found' };
      return;
    }

    const [affectedCount] = await groupCategoryService.updateGroupCategory(categoryId, { name: value.name, classId: value.classId });

    if (affectedCount > 0) {
      ctx.status = 204;
    } else {
      ctx.status = 404;
      ctx.body = { error: 'Category not found' };
    }
  } catch (error) {
    handleError(ctx, error);
  }
};

/**
 * Delete a group category
 * DELETE /group-categories/:id
 */
export const deleteGroupCategory = async (ctx: Context) => {
  try {
    const categoryId = await getIdFromParam(ctx.params.id as string);
    const groupCategory = await groupCategoryService.getGroupCategoryById(categoryId);

    if (!groupCategory) {
      ctx.status = 404;
      ctx.body = { error: 'Group category not found' };
      return;
    }

    const deletedCount = await groupCategoryService.deleteGroupCategory(categoryId);

    if (!deletedCount) {
      ctx.status = 404;
      ctx.body = { error: 'Group category not found' };
      return;
    }

    ctx.status = 204;
  } catch (error) {
    handleError(ctx, error);
  }
};
