import Joi from 'joi';
import { Context } from 'koa';
import * as lessonRecordService from '@services/substitutionTimetableService';
import { handleError } from '../lib/controllerTools';
import { SubstitutionType } from '@models/types/SubstitutionType';
import { DAY_COUNT, HOUR_COUNT } from '../config/timetableConfig';
import { TimetableExport } from '@services/transformers/timetableExport';

// Schema for administratively creating a lesson record
const createLessonRecordSchema = Joi.object({
  classId: Joi.number().required(),
  studentGroupId: Joi.number().optional(),
  dayInWeek: Joi.number()
    .required()
    .min(0)
    .max(DAY_COUNT - 1),
  hourInDay: Joi.number()
    .required()
    .min(0)
    .max(HOUR_COUNT - 1),
  subjectId: Joi.number().optional(),
  teacherId: Joi.number().optional(),
  roomId: Joi.number().optional(),
  date: Joi.date().required(),
  type: Joi.string()
    .normalize()
    .valid(...Object.values(SubstitutionType))
    .required()
});

type getterService = (id: number) => Promise<TimetableExport | null>;

/**
 * Create a new lesson record/remove a lesson record to/from the standard timetable
 * @param ctx Context
 */
export const createCustomLessonRecord = async (ctx: Context): Promise<void> => {
  try {
    const { error, value } = createLessonRecordSchema.validate(ctx.request.body);

    if (error) {
      ctx.status = 400;
      ctx.body = { error: error.details[0].message };
      return;
    }

    const lessonRecord = await lessonRecordService.createCustomLessonRecord(value);
    ctx.status = 201;
    ctx.body = lessonRecord;
  } catch (error) {
    handleError(ctx, error);
  }
};

export const deleteLessonRecord = async (ctx: Context): Promise<void> => {
  try {
    await lessonRecordService.deleteLessonRecord(ctx.params.id);
    ctx.status = 204;
  } catch (error) {
    handleError(ctx, error);
  }
};
