import { Context } from 'koa';
import * as classRegisterService from '@services/classRegisterService';
import { handleError } from '../lib/controllerTools';

/**
 * Get the current lesson record by teacher ID
 * @param ctx Koa context
 */
export const getCurrentLessonByTeacherId = async (
  ctx: Context
): Promise<void> => {
  const teacherId: number = parseInt(ctx.params.id);

  try {
    const lessonData =
      await classRegisterService.getCurrentLessonForTeacher(teacherId);

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
export const getCurrentLessonByLessonId = async (
  ctx: Context
): Promise<void> => {
  const lessonId: string = ctx.params.id;

  try {
    const lessonData =
      await classRegisterService.getCurrentLessonByLesson(lessonId);

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
