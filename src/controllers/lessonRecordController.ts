import Joi from 'joi';
import { Context } from 'koa';
import * as lessonRecordService from '@services/lessonRecordService';
import {
  getDateFromParam,
  getIdFromParam,
  handleError
} from '../lib/controllerTools';
import { TimetableExport } from '@services/transformers/timetableExport';

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
