import * as subjectService from '@services/subjectService';
import { Context } from 'koa';
import Joi from 'joi';
import { SubjectDTO } from '@repositories/subjectRepository';
import { getIdFromParam } from '../lib/controllerTools';

// Schema for creating a subject
const subjectSchema: Joi.ObjectSchema<SubjectDTO> = Joi.object({
  name: Joi.string().required().min(3).max(50),
  abbreviation: Joi.string().required().alphanum().min(1).max(3)
});

/**
 * Create a new subject
 * POST /subjects
 */
export const createSubject = async (ctx: Context) => {
  // Validate request
  const { error, value } = subjectSchema.validate(ctx.request.body);

  if (error) {
    ctx.status = 400;
    ctx.body = { error: error.details[0].message };
    return;
  }

  try {
    const subject = await subjectService.createSubject(value);
    ctx.status = 201;
    ctx.body = subject;
  } catch (error: Error | any) {
    ctx.status = 400;
    ctx.body = { error: error.message };
  }
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
    meta: {
      total: subjects.count,
      page,
      limit
    }
  };
};

// Schema for getting a subject by ID
export const getSubjectById = async (ctx: Context) => {
  const subjectId = await getIdFromParam(ctx.params.id as string);

  const subject = await subjectService.getSubjectById(subjectId);

  if (!subject) {
    ctx.status = 404;
    ctx.body = { error: 'Subject not found' };
    return;
  }

  ctx.status = 200;
  ctx.body = subject;
};

// Schema for getting a subject by abbreviation
export const getSubjectByAbbreviation = async (ctx: Context) => {
  const abbreviation = ctx.params.abbreviation as string;

  const subject = await subjectService.getSubjectByAbbreviation(abbreviation);

  if (!subject) {
    ctx.status = 404;
    ctx.body = { error: 'Subject not found' };
    return;
  }

  ctx.status = 200;
  ctx.body = subject;
};

// Schema for deleting a subject
export const updateSubject = async (ctx: Context) => {
  const subjectId = await getIdFromParam(ctx.params.id as string);
  if (isNaN(subjectId)) {
    ctx.status = 400;
    ctx.body = { error: 'Invalid subject ID' };
    return;
  }

  // Validate request
  const { error, value } = subjectSchema.validate(ctx.request.body);

  if (error) {
    ctx.status = 400;
    ctx.body = { error: error.details[0].message };
    return;
  }

  try {
    const [affectedCount] = await subjectService.updateSubject(
      subjectId,
      value
    );

    if (affectedCount > 0) {
      ctx.status = 200;
      ctx.body = { message: 'Subject updated' };
    } else {
      ctx.status = 404;
      ctx.body = { error: 'Subject not found' };
    }
  } catch (error: Error | any) {
    ctx.status = 400;
    ctx.body = { error: error.message };
  }
};

// Schema for deleting a subject
export const deleteSubject = async (ctx: Context) => {
  const subjectId = await getIdFromParam(ctx.params.id as string);
  if (isNaN(subjectId)) {
    ctx.status = 400;
    ctx.body = { error: 'Invalid subject ID' };
    return;
  }

  const deletedCount = await subjectService.deleteSubject(subjectId);

  if (deletedCount === 0) {
    ctx.status = 404;
    ctx.body = { error: 'Subject not found' };
    return;
  }

  ctx.status = 204;
};
