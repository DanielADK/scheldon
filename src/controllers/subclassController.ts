// Schema for creating and updating a subclass
import Joi from 'joi';
import { SubClassDTO } from '@repositories/subclassRepository';
import * as subClassService from '@services/subclassService';
import { Context } from 'koa';
import { getIdFromParam, handleCreationError } from '../lib/controllerTools';

const subClassSchema: Joi.ObjectSchema<SubClassDTO> = Joi.object({
  name: Joi.string().required().min(1).max(100),
  classId: Joi.number().required()
});

/**
 * Create a new subclass
 * @param ctx
 */
export const createSubClass = async (ctx: Context) => {
  const { error, value } = subClassSchema.validate(ctx.request.body);

  if (error) {
    ctx.status = 400;
    ctx.body = { error: error.details[0].message };
    return;
  }

  try {
    const subClass = await subClassService.createSubClass(value);
    ctx.status = 201;
    ctx.body = subClass;
  } catch (error) {
    handleCreationError(ctx, error);
  }
};

/**
 * Get all subclasses
 * @param ctx
 */
export const getSubClasses = async (ctx: Context) => {
  const subClasses = await subClassService.getSubClasses();
  ctx.status = 200;
  ctx.body = subClasses;
};

/**
 * Get a subclass by ID
 * @param ctx
 */
export const getSubClassById = async (ctx: Context) => {
  const subClassId = await getIdFromParam(ctx.params.id as string);

  const subClass = await subClassService.getSubClassById(subClassId);

  if (!subClass) {
    ctx.status = 404;
    ctx.body = { error: 'Subclass not found' };
    return;
  }

  ctx.status = 200;
  ctx.body = subClass;
};

/**
 * Get all subclasses of a specific class
 * @param ctx
 */
export const getSubClassesByClassId = async (ctx: Context) => {
  const classId = await getIdFromParam(ctx.params.classId as string);

  const subClasses = await subClassService.getSubClassesByClassId(classId);

  if (!subClasses.length) {
    ctx.status = 404;
    ctx.body = { error: 'No subclasses found for the given class' };
    return;
  }

  ctx.status = 200;
  ctx.body = subClasses;
};

/**
 * Update a subclass
 * @param ctx
 */
export const updateSubClass = async (ctx: Context) => {
  const subClassId = await getIdFromParam(ctx.params.id as string);
  const { error, value } = subClassSchema.validate(ctx.request.body);

  if (error) {
    ctx.status = 400;
    ctx.body = { error: error.details[0].message };
    return;
  }

  try {
    const [updated] = await subClassService.updateSubClass(subClassId, value);

    if (!updated) {
      ctx.status = 404;
      ctx.body = { error: 'Subclass not found' };
      return;
    }

    ctx.status = 200;
    ctx.body = { message: 'Subclass updated successfully' };
  } catch (error) {
    handleCreationError(ctx, error);
  }
};

/**
 * Delete a subclass
 * @param ctx
 */
export const deleteSubClass = async (ctx: Context) => {
  const subClassId = await getIdFromParam(ctx.params.id as string);

  try {
    const deleted = await subClassService.deleteSubClass(subClassId);

    if (!deleted) {
      ctx.status = 404;
      ctx.body = { error: 'Subclass not found' };
      return;
    }

    ctx.status = 200;
    ctx.body = { message: 'Subclass deleted successfully' };
  } catch (error) {
    handleCreationError(ctx, error);
  }
};
