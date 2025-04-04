import { Context } from 'koa';
import * as studentService from '@services/studentService';
import Joi from 'joi';
import { StudentDTO } from '@repositories/studentRepository';
import { getIdFromParam, handleError } from '../lib/controllerTools';

// Schema for creating and updating a student
const studentSchema: Joi.ObjectSchema<StudentDTO> = Joi.object({
  username: Joi.string().required().min(3).max(50),
  name: Joi.string().required().min(3).max(50),
  surname: Joi.string().required().min(3).max(50)
});

/**
 * Create a student
 * @param {Context} ctx - The Koa request/response context object
 */
export const createStudent = async (ctx: Context) => {
  try {
    const { error, value } = studentSchema.validate(ctx.request.body);

    if (error) {
      ctx.status = 400;
      ctx.body = { error: error.details[0].message };
      return;
    }

    const student = await studentService.createStudent(value);
    ctx.status = 201;
    ctx.body = student;
  } catch (error) {
    handleError(ctx, error);
  }
};

/**
 * Get a student by ID
 * @param {Context} ctx - The Koa request/response context object
 */
export const getStudentById = async (ctx: Context) => {
  try {
    const studentId = await getIdFromParam(ctx.params.id as string);

    const student = await studentService.getStudentById(studentId);

    if (!student) {
      ctx.status = 404;
      ctx.body = { error: 'Student not found' };
      return;
    }

    ctx.status = 200;
    ctx.body = student;
  } catch (error) {
    handleError(ctx, error);
  }
};

export const getStudentsHistory = async (ctx: Context) => {
  try {
    const studentId = await getIdFromParam(ctx.params.id as string);

    // Try to get the student
    const student = await studentService.getStudentById(studentId);
    if (!student) {
      ctx.status = 404;
      ctx.body = { error: 'Student not found' };
      return;
    }

    // Get the student's history
    const studentHistory = await studentService.getStudentsHistory(studentId);
    if (!studentHistory) {
      ctx.status = 404;
      ctx.body = { error: 'Student has no history' };
      return;
    }

    ctx.status = 200;
    ctx.body = studentHistory;
  } catch (error) {
    handleError(ctx, error);
  }
};

/**
 * Update a student
 * @param {Context} ctx - The Koa request/response context object
 */
export const updateStudent = async (ctx: Context) => {
  try {
    const studentId = await getIdFromParam(ctx.params.id as string);
    const { error, value } = studentSchema.validate(ctx.request.body);

    if (error) {
      ctx.status = 400;
      ctx.body = { error: error.details[0].message };
      return;
    }

    const [updated] = await studentService.updateStudent(studentId, value);

    if (!updated) {
      ctx.status = 404;
      ctx.body = { error: 'Student not found' };
      return;
    }

    ctx.status = 200;
    ctx.body = { message: 'Student updated successfully' };
  } catch (error) {
    handleError(ctx, error);
  }
};

/**
 * Delete a student
 * @param {Context} ctx - The Koa request/response context object
 */
export const deleteStudent = async (ctx: Context) => {
  try {
    const studentId = await getIdFromParam(ctx.params.id as string);

    const deleted = await studentService.deleteStudent(studentId);

    if (!deleted) {
      ctx.status = 404;
      ctx.body = { error: 'Student not found' };
      return;
    }

    ctx.status = 200;
    ctx.body = { message: 'Student deleted successfully' };
  } catch (error) {
    handleError(ctx, error);
  }
};
