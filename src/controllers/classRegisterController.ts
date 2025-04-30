import { Context } from 'koa';
import { handleError } from '@lib/controllerTools';
import * as classRegisterService from '@services/classRegisterService';

export const getLesson = async (ctx: Context): Promise<void> => {
  try {
    const lessonId = ctx.params.lessonId;
    if (isNaN(lessonId)) {
      throw new Error('Invalid lesson ID');
    }

    const lesson = await classRegisterService.getLesson(lessonId);
    if (!lesson) {
      throw new Error('Lesson not found');
    }

    ctx.status = 200;
    ctx.body = lesson;
  } catch (error) {
    handleError(ctx, error);
  }
};

export const getLessonAttendance = async (ctx: Context): Promise<void> => {
  try {
    const lessonId = ctx.params.lessonId;
    if (isNaN(lessonId)) {
      throw new Error('Invalid lesson ID');
    }

    const lesson = await classRegisterService.getLessonsAttendance(lessonId);
    if (!lesson) {
      throw new Error('Lesson not found');
    }

    ctx.status = 200;
    ctx.body = lesson;
  } catch (error) {
    handleError(ctx, error);
  }
};
