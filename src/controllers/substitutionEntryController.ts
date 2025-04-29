import { DAY_COUNT, HOUR_COUNT } from '../config/timetableConfig';
import { createSubstitutionEntryAndFindClassRegister } from '@services/substitutionEntryService';
import { handleError } from '@lib/controllerTools';
import { Context } from 'koa';
import Joi from 'joi';
import { SubstitutionType } from '@models/types/SubstitutionType';
import * as classRegisterService from '@services/classRegisterService';
import { resetClassRegisterToDefault } from '@services/classRegisterService';

export const substitutionTimetableEntrySchema = Joi.object({
  classId: Joi.number().integer().positive().required(),
  studentGroupId: Joi.number().integer().positive().allow(null),
  dayInWeek: Joi.number()
    .integer()
    .min(0)
    .max(DAY_COUNT - 1)
    .required(),
  hourInDay: Joi.number()
    .integer()
    .min(0)
    .max(HOUR_COUNT - 1)
    .required(),
  subjectId: Joi.number().integer().positive().required(),
  teacherId: Joi.number().integer().positive().required(),
  roomId: Joi.number().integer().positive().required()
});

// Schema for validating append of substitution entry to class register (=append)
export const appendSubstitutionSchema = Joi.object({
  substitutionEntryId: Joi.number().required(),
  note: Joi.string().max(2048).optional()
});

// Schema for validating assignment of substitution entry to class register (=merge/drop)
export const assignSubstitutionSchema = Joi.object({
  lessonId: Joi.number().required(),
  substitutionType: Joi.string().required().valid(SubstitutionType.MERGED, SubstitutionType.DROPPED),
  note: Joi.string().max(2048).optional()
});

export const resetClassRegisterSchema = Joi.object({
  classId: Joi.number().integer().positive().required(),
  studentGroupId: Joi.number().integer().positive().allow(null),
  hourInDay: Joi.number()
    .integer()
    .min(0)
    .max(HOUR_COUNT - 1)
    .required()
});

export const appendSubstitutionToClassRegister = async (ctx: Context): Promise<void> => {
  try {
    const dateStr = ctx.params.date;
    const date = new Date(dateStr);

    if (isNaN(date.getTime())) {
      ctx.status = 400;
      ctx.body = { error: 'Invalid date format' };
      return;
    }
    const { error, value } = appendSubstitutionSchema.validate(ctx.request.body);

    if (error) {
      ctx.status = 400;
      ctx.body = { error: error.details[0].message };
      return;
    }

    const result = await classRegisterService.appendSubstitutionToClassRegister(date, value);

    ctx.status = 201;
    ctx.body = {
      lessonId: result.lessonId
    };
  } catch (error) {
    handleError(ctx, error);
  }
};

export const assignSubstitutionToClassRegister = async (ctx: Context): Promise<void> => {
  try {
    const dateStr = ctx.params.date;
    const date = new Date(dateStr);

    if (isNaN(date.getTime())) {
      ctx.status = 400;
      ctx.body = { error: 'Invalid date format' };
      return;
    }
    const { error, value } = assignSubstitutionSchema.validate(ctx.request.body);

    if (error) {
      ctx.status = 400;
      ctx.body = { error: error.details[0].message };
      return;
    }

    const result = await classRegisterService.assignSubstitutionToClassRegister(date, value);

    ctx.status = 201;
    ctx.body = {
      lessonId: result.lessonId
    };
  } catch (error) {
    handleError(ctx, error);
  }
};

export const resetSubstitutionInClassRegister = async (ctx: Context): Promise<void> => {
  try {
    const dateStr = ctx.params.date;
    const date = new Date(dateStr);

    if (isNaN(date.getTime())) {
      ctx.status = 400;
      ctx.body = { error: 'Invalid date format' };
      return;
    }

    const { error, value } = resetClassRegisterSchema.validate(ctx.request.body);

    if (error) {
      ctx.status = 400;
      ctx.body = { error: error.details[0].message };
      return;
    }

    const result = await resetClassRegisterToDefault(date, value);
    if (!result) {
      throw new Error('Lesson not found');
    }

    ctx.status = 200;
    ctx.body = result;
  } catch (error) {
    handleError(ctx, error);
  }
};

/**
 * Controller to handle submission entry creation and class register finding
 *
 * @param {Context} ctx - Koa context
 * @returns {Promise<void>}
 */
export const createSubmissionEntryController = async (ctx: Context): Promise<void> => {
  try {
    const { error, value } = substitutionTimetableEntrySchema.validate(ctx.request.body);

    if (error) {
      ctx.status = 400;
      ctx.body = { error: error.details[0].message };
      return;
    }

    // Process the submission entry
    const result = await createSubstitutionEntryAndFindClassRegister(value);

    // Return the results
    ctx.status = 200;
    ctx.body = result;
  } catch (error) {
    handleError(ctx, error);
  }
};
