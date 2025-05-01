import * as subjectService from '@services/subjectService';
import { Context } from 'koa';
import Joi from 'joi';
import { SubjectDTO } from '@repositories/subjectRepository';
import { getIdFromParam, handleError } from '@lib/controllerTools';

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
  try {
    // Validate request
    const { error, value } = subjectSchema.validate(ctx.request.body);

    if (error) {
      throw new Error(error.details[0].message);
    }

    const subject = await subjectService.createSubject(value);
    ctx.status = 201;
    ctx.body = subject;
  } catch (error) {
    handleError(ctx, error);
  }
};

export const getAllSubjects = async (ctx: Context) => {
  try {
    // Pagination
    const page = parseInt(ctx.query.page as string) || 1;
    const limit = parseInt(ctx.query.limit as string) || 10;

    // Get all subjects
    const subjects = await subjectService.getAllSubjects(page, limit);

    ctx.status = 200;
    ctx.body = {
      data: subjects.rows,
      meta: {
        total: subjects.count,
        page,
        limit
      }
    };
  } catch (error) {
    handleError(ctx, error);
  }
};

export const getSubjectById = async (ctx: Context) => {
  try {
    const subjectId = await getIdFromParam(ctx.params.id as string);

    const subject = await subjectService.getSubjectById(subjectId);

    if (!subject) {
      ctx.status = 404;
      ctx.body = { error: 'Subject not found' };
      return;
    }

    ctx.status = 200;
    ctx.body = subject;
  } catch (error) {
    handleError(ctx, error);
  }
};

export const getSubjectByAbbreviation = async (ctx: Context) => {
  try {
    const abbreviation = ctx.params.abbreviation as string;

    const subject = await subjectService.getSubjectByAbbreviation(abbreviation);

    if (!subject) {
      ctx.status = 404;
      ctx.body = { error: 'Subject not found' };
      return;
    }

    ctx.status = 200;
    ctx.body = subject;
  } catch (error) {
    handleError(ctx, error);
  }
};

export const updateSubject = async (ctx: Context) => {
  try {
    const subjectId = await getIdFromParam(ctx.params.id as string);

    // Validate request
    const { error, value } = subjectSchema.validate(ctx.request.body);

    if (error) {
      throw new Error(error.details[0].message);
    }

    const [affectedCount] = await subjectService.updateSubject(subjectId, value);

    if (affectedCount > 0) {
      ctx.status = 204;
      ctx.body = { message: 'Subject updated' };
    } else {
      ctx.status = 404;
      ctx.body = { error: 'Subject not found' };
    }
  } catch (error) {
    handleError(ctx, error);
  }
};

export const deleteSubject = async (ctx: Context) => {
  try {
    const subjectId = await getIdFromParam(ctx.params.id as string);
    if (isNaN(subjectId)) {
      throw new Error('Invalid subject ID');
    }

    const deletedCount = await subjectService.deleteSubject(subjectId);

    if (deletedCount === 0) {
      ctx.status = 404;
      ctx.body = { error: 'Subject not found' };
      return;
    }

    ctx.status = 204;
  } catch (error) {
    handleError(ctx, error);
  }
};
