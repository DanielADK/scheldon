import Joi from 'joi';
import { Context } from 'koa';
import * as studentAssignmentService from '@services/studentAssignmentService';

// Schema for assigning a student to a class/subclass
const assignStudentSchema = Joi.object({
  classId: Joi.number().required(),
  subClassId: Joi.number().optional(),
  validFrom: Joi.date().optional(),
  validTo: Joi.date().optional()
});

const unassignStudentSchema = Joi.object({
  classId: Joi.number().required(),
  subClassId: Joi.number().optional(),
  validTo: Joi.date().optional()
});

/**
 * Assign a student to a class
 * @param {Context} ctx - The Koa request/response context object
 * POST /students/:studentId/assign
 */
export const assignStudent = async (ctx: Context) => {
  const studentId = await getIdFromParam(ctx.params.studentId as string);
  const { error, value } = assignStudentSchema.validate(ctx.request.body);

  if (error) {
    ctx.status = 400;
    ctx.body = { error: error.details[0].message };
    return;
  }

  try {
    const assignment = await studentAssignmentService.createAssignment(
      studentId,
      value
    );

    ctx.status = 201;
    ctx.body = assignment;
  } catch (error: Error | any) {
    ctx.status = 400;
    ctx.body = { error: error.message };
  }
};

/**
 * Unassign a student from a class
 * @param ctx - The Koa request/response context object DELETE /students/:studentId/unassign
 */
export const unassignStudent = async (ctx: Context) => {
  const studentId = await getIdFromParam(ctx.params.studentId as string);
  const { error, value } = unassignStudentSchema.validate(ctx.request.body);

  if (error) {
    ctx.status = 400;
    ctx.body = { error: error.details[0].message };
  }

  try {
    await studentAssignmentService.terminateAssignment(studentId, value);

    ctx.status = 204;
  } catch (error: Error | any) {
    ctx.status = 400;
    ctx.body = { error: error.message };
  }
};

/**
 * Get ID from request.
 * @param id
 * @throws Error if ID is invalid
 */
const getIdFromParam = async (id: string): Promise<number> => {
  const idNum = parseInt(id);
  if (isNaN(idNum)) {
    throw new Error('Invalid ID');
  }
  return idNum;
};
