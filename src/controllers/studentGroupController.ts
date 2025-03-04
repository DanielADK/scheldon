// Schema for creating and updating a studentGroup
import Joi from 'joi';
import { studentGroupDTO } from '@repositories/studentGroupRepository';
import * as studentGroupService from '@services/studentGroupService';
import { Context } from 'koa';
import { getIdFromParam, handleError } from '../lib/controllerTools';

const studentGroupSchema: Joi.ObjectSchema<studentGroupDTO> = Joi.object({
  name: Joi.string().required().min(1).max(100),
  classId: Joi.number().required()
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
    const studentGroup = await studentGroupService.createstudentGroup(value);
    ctx.status = 201;
    ctx.body = studentGroup;
  } catch (error) {
    handleError(ctx, error);
  }
};

/**
 * Get all studentGroupes
 * @param ctx
 */
export const getstudentGroupes = async (ctx: Context) => {
  const studentGroupes = await studentGroupService.getstudentGroupes();
  ctx.status = 200;
  ctx.body = studentGroupes;
};

/**
 * Get a studentGroup by ID
 * @param ctx
 */
export const getstudentGroupById = async (ctx: Context) => {
  const studentGroupId = await getIdFromParam(ctx.params.id as string);

  const studentGroup =
    await studentGroupService.getstudentGroupById(studentGroupId);

  if (!studentGroup) {
    ctx.status = 404;
    ctx.body = { error: 'studentGroup not found' };
    return;
  }

  ctx.status = 200;
  ctx.body = studentGroup;
};

/**
 * Get all studentGroupes of a specific class
 * @param ctx
 */
export const getstudentGroupesByClassId = async (ctx: Context) => {
  const classId = await getIdFromParam(ctx.params.classId as string);

  const studentGroupes =
    await studentGroupService.getstudentGroupesByClassId(classId);

  if (!studentGroupes.length) {
    ctx.status = 404;
    ctx.body = { error: 'No studentGroupes found for the given class' };
    return;
  }

  ctx.status = 200;
  ctx.body = studentGroupes;
};

/**
 * Update a studentGroup
 * @param ctx
 */
export const updatestudentGroup = async (ctx: Context) => {
  const studentGroupId = await getIdFromParam(ctx.params.id as string);
  const { error, value } = studentGroupSchema.validate(ctx.request.body);

  if (error) {
    ctx.status = 400;
    ctx.body = { error: error.details[0].message };
    return;
  }

  try {
    const [updated] = await studentGroupService.updatestudentGroup(
      studentGroupId,
      value
    );

    if (!updated) {
      ctx.status = 404;
      ctx.body = { error: 'studentGroup not found' };
      return;
    }

    ctx.status = 200;
    ctx.body = { message: 'studentGroup updated successfully' };
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
    const deleted =
      await studentGroupService.deletestudentGroup(studentGroupId);

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
