import { Context } from 'koa';
import { getIdFromParam, handleError } from '@lib/controllerTools';
import * as classRegisterService from '@services/classRegisterService';
import Joi from 'joi';
import { AttendanceType } from '@models/types/AttendanceType';

export interface AttendanceSchema {
  classRegisterId: number;
  studentId: number;
  attendance: AttendanceType;
}

export const updateAttendanceSchema = Joi.array().items(
  Joi.object({
    studentId: Joi.number().integer().positive().required(),
    attendance: Joi.string()
      .valid(...Object.values(AttendanceType))
      .required()
  })
);

export interface UpdateLessonSchema {
  topic: string;
  note: string;
}

export const updateLessonSchema = Joi.object({
  topic: Joi.string().max(2048).optional(),
  note: Joi.string().max(2048).optional()
});

export const updateLesson = async (ctx: Context): Promise<void> => {
  try {
    const id = await getIdFromParam(ctx.params.lessonId as string);

    const { error, value } = updateLessonSchema.validate(ctx.request.body);
    if (error) throw new Error(error.details[0].message);

    await classRegisterService.updateLesson(id, value);
    ctx.status = 204;
  } catch (error) {
    handleError(ctx, error);
  }
};

/**
 * Handles updating attendance records for a class.
 *
 * Validates the request parameters and body, retrieves the lesson ID,
 * and updates attendance records. Errors are handled and sent as responses.
 *
 * @param {Context} ctx - The request context.
 * @returns {Promise<void>} Resolves when the operation completes.
 */
export const updateAttendance = async (ctx: Context): Promise<void> => {
  try {
    const id = await getIdFromParam(ctx.params.lessonId as string);

    // Validate request
    const { error, value } = updateAttendanceSchema.validate(ctx.request.body);

    if (error) {
      throw new Error(error.details[0].message);
    }

    await classRegisterService.updateAttendance(id, value);
    ctx.status = 204;
  } catch (error) {
    handleError(ctx, error);
  }
};

/**
 * Retrieves a lesson by its ID and returns it in the response.
 *
 * @param {Context} ctx - The request context.
 * @returns {Promise<void>}
 */
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

/**
 * Retrieves the attendance records for a specified lesson.
 *
 * Fetches attendance details for a lesson based on the provided ID in the request context.
 * Returns the attendance records or an error message if the lesson is not found or the ID is invalid.
 *
 * @param {Context} ctx - Request context containing parameters and response handlers.
 * @returns {Promise<void>}
 */
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
