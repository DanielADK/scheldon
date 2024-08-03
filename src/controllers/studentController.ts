import { Context } from 'koa';
import * as studentService from '../services/studentService';
import Joi from 'joi';
import { StudentDTO } from '../repositories/studentRepository';

// Schema for creating and updating a student
const studentSchema: Joi.ObjectSchema<StudentDTO> = Joi.object({
  username: Joi.string().required().min(3).max(30),
  name: Joi.string().required().min(3).max(50),
  surname: Joi.string().required().min(3).max(50)
});

/**
 * Create a student
 * @param {Context} ctx - The Koa request/response context object
 */
export const createStudent = async (ctx: Context) => {
  const { error, value } = studentSchema.validate(ctx.request.body);

  if (error) {
    ctx.status = 400;
    ctx.body = { error: error.details[0].message };
    return;
  }

  try {
    const student = await studentService.createStudent(value);
    ctx.status = 201;
    ctx.body = student;
  } catch (error: Error | any) {
    ctx.status = 400;
    ctx.body = { error: error.message };
  }
};

/**
 * Get a student by ID
 * @param {Context} ctx - The Koa request/response context object
 */
export const getStudentById = async (ctx: Context) => {
  const studentId = parseInt(ctx.params.id as string);

  const student = await studentService.getStudentById(studentId);

  if (!student) {
    ctx.status = 404;
    ctx.body = { error: 'Student not found' };
    return;
  }

  ctx.status = 200;
  ctx.body = student;
};

export const getStudentsHistory = async (ctx: Context) => {
  const studentId = parseInt(ctx.params.id as string);

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
  }

  ctx.status = 200;
  ctx.body = studentHistory;
};

/**
 * Update a student
 * @param {Context} ctx - The Koa request/response context object
 */
export const updateStudent = async (ctx: Context) => {
  const studentId = parseInt(ctx.params.id as string);
  const { error, value } = studentSchema.validate(ctx.request.body);

  if (error) {
    ctx.status = 400;
    ctx.body = { error: error.details[0].message };
    return;
  }

  try {
    const [updated] = await studentService.updateStudent(studentId, value);

    if (!updated) {
      ctx.status = 404;
      ctx.body = { error: 'Student not found' };
      return;
    }

    ctx.status = 200;
    ctx.body = { message: 'Student updated successfully' };
  } catch (error: Error | any) {
    ctx.status = 400;
    ctx.body = { error: error.message };
  }
};

/**
 * Delete a student
 * @param {Context} ctx - The Koa request/response context object
 */
export const deleteStudent = async (ctx: Context) => {
  const studentId = parseInt(ctx.params.id as string);

  try {
    const deleted = await studentService.deleteStudent(studentId);

    if (!deleted) {
      ctx.status = 404;
      ctx.body = { error: 'Student not found' };
      return;
    }

    ctx.status = 200;
    ctx.body = { message: 'Student deleted successfully' };
  } catch (error: Error | any) {
    ctx.status = 400;
    ctx.body = { error: error.message };
  }
};
