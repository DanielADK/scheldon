import Joi from 'joi';
import { Context } from 'koa';
import * as studyService from '@services/studyService';
import { getIdFromParam, handleError } from '../lib/controllerTools';

// Schema for assigning a student to a class/studentGroup
const startStudySchema = Joi.object({
  classId: Joi.number().required(),
  studentGroupId: Joi.number().optional(),
  validFrom: Joi.date().optional(),
  validTo: Joi.date().optional()
});

const stopStudySchema = Joi.object({
  classId: Joi.number().required(),
  studentGroupId: Joi.number().optional(),
  validTo: Joi.date().optional()
});

/**
 * Start student's study
 * @param {Context} ctx - The Koa request/response context object
 * POST /students/:studentId/start
 */
export const startStudy = async (ctx: Context) => {
  const studentId = await getIdFromParam(ctx.params.studentId as string);
  const { error, value } = startStudySchema.validate(ctx.request.body);

  if (error) {
    ctx.status = 400;
    ctx.body = { error: error.details[0].message };
    return;
  }

  try {
    const study = await studyService.startStudy(studentId, value);

    ctx.status = 201;
    ctx.body = study;
  } catch (error) {
    handleError(ctx, error);
  }
};

/**
 * Stop student's study
 * @param ctx - The Koa request/response context object DELETE /students/:studentId/unassign
 */
export const stopStudy = async (ctx: Context) => {
  const studentId = await getIdFromParam(ctx.params.studentId as string);
  const { error, value } = stopStudySchema.validate(ctx.request.body);

  if (error) {
    ctx.status = 400;
    ctx.body = { error: error.details[0].message };
  }

  try {
    await studyService.stopStudy(studentId, value);

    ctx.status = 204;
  } catch (error) {
    handleError(ctx, error);
  }
};
