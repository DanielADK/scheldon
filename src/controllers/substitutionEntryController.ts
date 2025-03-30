import { DAY_COUNT, HOUR_COUNT } from '../config/timetableConfig';
import { createSubstitutionEntryAndFindClassRegister } from '@services/substitutionEntryService';
import { handleError } from '@lib/controllerTools';
import { Context } from 'koa';
import Joi from 'joi';

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

/**
 * Controller to handle submission entry creation and class register finding
 *
 * @param {Context} ctx - Koa context
 * @returns {Promise<void>}
 */
export const createSubmissionEntryController = async (ctx: Context): Promise<void> => {
  try {
    const dateStr = ctx.params.date;

    const { error, value } = substitutionTimetableEntrySchema.validate(ctx.request.body);

    if (error) {
      ctx.status = 400;
      ctx.body = { error: error.details[0].message };
      return;
    }

    // Process the submission entry
    const result = await createSubstitutionEntryAndFindClassRegister(dateStr, value);

    // Return the results
    ctx.status = 200;
    ctx.body = result;
  } catch (error) {
    handleError(ctx, error);
  }
};
