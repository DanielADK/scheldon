import { Context } from 'koa';
import * as classRegisterService from '@services/classRegisterService';
import { handleError } from '../lib/controllerTools';
import Joi from 'joi';
import { AttendanceType } from '@models/types/AttendanceType';

const createClassRegisterSchema = Joi.object({
  lessonId: Joi.string()
    .required()
    .regex(/^[0-9a-zA-Z]{8}$/),
  topic: Joi.string().required().min(5).max(255),
  studentAttendance: Joi.array().items(
    Joi.object({
      studentId: Joi.number().required(),
      present: Joi.string().required().uppercase().valid(AttendanceType.PRESENT, AttendanceType.NOT_PRESENT, AttendanceType.LATE_ARRIVAL)
    })
  )
});

/**
 * Finish the lesson record with topic and student attendance
 */
export const finishLessonRecord = async (ctx: Context): Promise<void> => {
  console.log(ctx.request.body);
  const { error, value } = createClassRegisterSchema.validate(ctx.request.body);

  if (error) {
    ctx.status = 400;
    ctx.body = { error: error.details[0].message };
    return;
  }

  try {
    await classRegisterService.finishLessonRecord(value);

    ctx.status = 201;
    ctx.body = { message: 'Lesson finished and locked successfully' };
  } catch (error) {
    handleError(ctx, error);
  }
};

/**
 * Get the current lesson record by teacher ID
 * @param ctx Koa context
 */
export const getCurrentLessonByTeacherId = async (ctx: Context): Promise<void> => {
  const teacherId: number = parseInt(ctx.params.id);

  try {
    const lessonData = await classRegisterService.getCurrentLessonForTeacher(teacherId);

    if (!lessonData) {
      ctx.status = 404;
      ctx.body = { error: 'No current lesson found for this teacher' };
      return;
    }

    ctx.status = 200;
    ctx.body = lessonData;
  } catch (error) {
    handleError(ctx, error);
  }
};

/**
 * Get the current lesson record by lessonID
 * @param ctx Koa context
 */
/*export const getCurrentLessonByLessonId = async (
  ctx: Context
): Promise<void> => {
  const lessonId: string = ctx.params.id;

  try {
    const lessonData =
      await classRegisterService.getCurrentLessonByLessonId(lessonId);

    if (!lessonData) {
      ctx.status = 404;
      ctx.body = { error: 'No current lesson found for this teacher' };
      return;
    }

    ctx.status = 200;
    ctx.body = lessonData;
  } catch (error) {
    handleError(ctx, error);
  }
};*/
