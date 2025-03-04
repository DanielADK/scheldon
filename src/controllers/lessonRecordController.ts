import Joi from 'joi';
import { Context } from 'koa';
import * as lessonRecordService from '@services/lessonRecordService';
import {
  getDateFromParam,
  getIdFromParam,
  handleError
} from '../lib/controllerTools';
import { TimetableExport } from '@services/transformers/timetableExport';
import { SubstitutionType } from '@models/types/SubstitutionType';

// Schema for administratively creating a lesson record
const createLessonRecordSchema = Joi.object({
  classId: Joi.number().required(),
  studentGroupId: Joi.number().optional(),
  dayInWeek: Joi.number().required().min(0).max(4),
  hourInDay: Joi.number().required().min(0).max(10),
  subjectId: Joi.number().optional(),
  teacherId: Joi.number().optional(),
  roomId: Joi.number().optional(),
  date: Joi.date().required(),
  type: Joi.string()
    .normalize()
    .valid(...Object.values(SubstitutionType))
    .required()
});

/**
 * Create a new lesson record/remove a lesson record to/from the standard timetable
 * @param ctx Context
 */
export const createCustomLessonRecord = async (ctx: Context): Promise<void> => {
  const { error, value } = createLessonRecordSchema.validate(ctx.request.body);

  if (error) {
    ctx.status = 400;
    ctx.body = { error: error.details[0].message };
    return;
  }

  try {
    const lessonRecord =
      await lessonRecordService.createCustomLessonRecord(value);
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

type getterService = (
  id: number,
  date: Date
) => Promise<TimetableExport | null>;

export const getCurrentTimetableByIdController = async (
  ctx: Context,
  getterService: getterService
): Promise<void> => {
  try {
    const id: number = await getIdFromParam(ctx.params.id);
    const date: Date =
      ctx.params.date === 'now'
        ? new Date()
        : await getDateFromParam(ctx.params.date);

    const timetable: TimetableExport | null = await getterService(id, date);

    if (!timetable) {
      ctx.status = 404;
      ctx.body = { error: 'Timetable not found' };
    }

    ctx.status = 200;
    ctx.body = timetable;
  } catch (error) {
    handleError(ctx, error);
  }
};
