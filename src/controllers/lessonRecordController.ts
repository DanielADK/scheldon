import Joi from 'joi';
import { Context } from 'koa';
import * as lessonRecordService from '@services/lessonRecordService';
import { handleError } from '../lib/controllerTools';

// Schema for administratively creating a lesson record
const createLessonRecordSchema = Joi.object({
  classId: Joi.number().required(),
  subClassId: Joi.number().optional(),
  dayInWeek: Joi.number().required().min(0).max(4),
  hourInDay: Joi.number().required().min(0).max(10),
  subjectId: Joi.number().optional(),
  teacherId: Joi.number().optional(),
  roomId: Joi.number().optional(),
  date: Joi.date().required()
});

export const administrativeCreateLessonRecord = async (
  ctx: Context
): Promise<void> => {
  const { error, value } = createLessonRecordSchema.validate(ctx.request.body);

  if (error) {
    ctx.status = 400;
    ctx.body = { error: error.details[0].message };
    return;
  }

  try {
    const lessonRecord =
      await lessonRecordService.administrativeCreateLessonRecord(value);
    ctx.status = 201;
    ctx.body = lessonRecord;
  } catch (error) {
    handleError(ctx, error);
  }
};
