import { Context } from 'koa';
import * as classService from '@services/classService';
import Joi from 'joi';
import { ClassDTO } from '@repositories/classRepository';
import { getIdFromParam, handleCreationError } from '../lib/controllerTools';

// Schema for creating and updating a class
const classSchema: Joi.ObjectSchema<ClassDTO> = Joi.object({
  name: Joi.string().required().min(1).max(50),
  validFrom: Joi.date().required(),
  validTo: Joi.date().required(),
  roomId: Joi.number().required(),
  employeeId: Joi.number().required()
});
/**
 * Create a new class
 */
export const createClass = async (ctx: Context) => {
  // Validate request
  const { error, value } = classSchema.validate(ctx.request.body);

  if (error) {
    ctx.status = 400;
    ctx.body = { error: error.details[0].message };
    return;
  }

  try {
    const classObj = await classService.createClass(value);
    ctx.status = 201;
    ctx.body = classObj;
  } catch (error) {
    handleCreationError(ctx, error);
  }
};

/**
 * Get all classes
 */
export const getAllClasses = async (ctx: Context) => {
  // Pagination
  const page = parseInt(ctx.query.page as string) || 1;
  const limit = parseInt(ctx.query.limit as string) || 10;

  const classes = await classService.getAllClasses(page, limit);

  ctx.status = 200;
  ctx.body = {
    data: classes.rows,
    meta: {
      total: classes.count,
      page,
      limit
    }
  };
};

/**
 * Get class with the specified ID
 */
export const getClassById = async (ctx: Context) => {
  const classId = await getIdFromParam(ctx.params.id as string);

  const classObj = await classService.getClassById(classId);

  if (!classObj) {
    ctx.status = 404;
    ctx.body = { error: 'Class not found' };
    return;
  }

  ctx.status = 200;
  ctx.body = classObj;
};
/**
 * Get all classes at the specified time
 */
export const getClassesAtTime = async (ctx: Context) => {
  const { time } = ctx.params;

  if (!time) {
    ctx.status = 400;
    ctx.body = { error: 'Time is required' };
    return;
  }

  try {
    const classes = await classService.getClassesAtTime(time);

    if (!classes || classes.length === 0) {
      ctx.status = 404;
      ctx.body = { error: 'No classes found at the specified time' };
      return;
    }

    ctx.status = 200;
    ctx.body = classes;
  } catch (error) {
    handleCreationError(ctx, error);
  }
};

export const updateClass = async (ctx: Context) => {
  const classId = await getIdFromParam(ctx.params.id as string);

  // Validate request
  const { error, value } = classSchema.validate(ctx.request.body);

  if (error) {
    ctx.status = 400;
    ctx.body = { error: error.details[0].message };
    return;
  }

  try {
    const [affectedCount] = await classService.updateClass(classId, value);

    if (affectedCount > 0) {
      ctx.status = 200;
      ctx.body = { message: 'Class updated' };
    } else {
      ctx.status = 404;
      ctx.body = { error: 'Class not found' };
    }
  } catch (error) {
    handleCreationError(ctx, error);
  }
};

/**
 * Delete class with the specified ID
 */
export const deleteClass = async (ctx: Context) => {
  const classId = await getIdFromParam(ctx.params.id as string);

  const deletedCount = await classService.deleteClass(classId);

  if (deletedCount === 0) {
    ctx.status = 404;
    ctx.body = { error: 'Class not found' };
    return;
  }

  ctx.status = 204;
};
