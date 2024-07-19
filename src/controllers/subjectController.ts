import * as subjectService from '../services/subjectService';
import { Context } from 'koa';
import Joi from 'joi';

// Schema for creating a subject
const createSubjectSchema = Joi.object({
  name: Joi.string().required().alphanum().min(3).max(30),
  abbreviation: Joi.string().required().alphanum().min(1).max(3)
});

/**
 * Create a new subject
 * POST /subjects
 */
export const createSubject = async (ctx: Context) => {
  // Validate request
  const { error, value } = createSubjectSchema.validate(ctx.request.body);

  if (error) {
    ctx.status = 400;
    ctx.body = { error: error.details[0].message };
    return;
  }

  const subject = await subjectService.createSubject(value);

  ctx.status = 201;
  ctx.body = subject;
};

// Schema for getting a subjects
export const getAllSubjects = async (ctx: Context) => {
  // Pagination
  const page = parseInt(ctx.query.page as string) || 1;
  const limit = parseInt(ctx.query.limit as string) || 10;

  // Get all subjects
  const subjects = await subjectService.getAllSubjects(page, limit);

  ctx.status = 201;
  ctx.body = {
    data: subjects.rows,
    total: subjects.count,
    page,
    limit
  };
};
