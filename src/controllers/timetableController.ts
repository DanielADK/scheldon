import { Context } from 'koa';
import * as timetableService from '@services/timetableService';
import { getIdFromParam, handleError } from '../lib/controllerTools';
import { TimetableEntryDTO, TimetableSetDTO } from '@repositories/timetableRepository';
import Joi from 'joi';
import { TimetableExport } from '@services/transformers/timetableExport';
import { SubstitutionType } from '@models/types/SubstitutionType';

/**
 * Schema for creating a timetable set
 */
export const timetableSetSchema: Joi.ObjectSchema<TimetableSetDTO> = Joi.object({
  name: Joi.string().required().min(3).max(50),
  validFrom: Joi.date().required(),
  validTo: Joi.date().required()
});

/**
 * Schema for creating a timetable entry
 */
export const timetableEntrySchema: Joi.ObjectSchema<TimetableEntryDTO> = Joi.object({
  classId: Joi.number().required(),
  studentGroupId: Joi.number().optional(),
  dayInWeek: Joi.number().required().min(0).max(6),
  hourInDay: Joi.number().required().min(0).max(10),
  subjectId: Joi.number().required(),
  teacherId: Joi.number().required(),
  roomId: Joi.number().required()
});

/**
 * Schema for creating a substitution entry
 */
export const substitutionEntrySchema: Joi.ObjectSchema = Joi.object({
  classId: Joi.number().required(),
  studentGroupId: Joi.number().optional(),
  hourInDay: Joi.number().required(),
  subjectId: Joi.number().required(),
  teacherId: Joi.number().required(),
  roomId: Joi.number().required(),
  date: Joi.date().iso().required(),
  type: Joi.string()
    .valid(...Object.values(SubstitutionType))
    .required()
});

type getterService = (id: number) => Promise<TimetableExport | null>;

/**
 * Create a new timetable entry
 * @param ctx Context
 */
export const createTEntry = async (ctx: Context): Promise<void> => {
  try {
    const tsetId: number = await getIdFromParam(ctx.params.id);
    const { error, value } = timetableEntrySchema.validate(ctx.request.body);

    if (error) {
      ctx.status = 400;
      ctx.body = { error: error.details[0].message };
      return;
    }

    const tentry = await timetableService.createTEntry(tsetId, value);
    ctx.status = 201;
    ctx.body = tentry;
  } catch (error) {
    handleError(ctx, error);
  }
};

/**
 * Create a new substitution entry
 * @param ctx Context
 */
export const createSEntry = async (ctx: Context): Promise<void> => {
  try {
    const { error, value } = substitutionEntrySchema.validate(ctx.request.body);

    if (error) {
      ctx.status = 400;
      ctx.body = { error: error.details[0].message };
      return;
    }

    const substitutionEntry = await timetableService.createSubstitutionEntry(value);
    ctx.status = 201;
    ctx.body = substitutionEntry;
  } catch (error) {
    handleError(ctx, error);
  }
};

/**
 * Create a new timetable set
 * @param ctx Context
 */
export const createTSet = async (ctx: Context): Promise<void> => {
  try {
    const { error, value } = timetableSetSchema.validate(ctx.request.body);

    if (error) {
      ctx.status = 400;
      ctx.body = { error: error.details[0].message };
      return;
    }

    const tset = await timetableService.createTSet(value);
    ctx.status = 201;
    ctx.body = tset;
  } catch (error) {
    handleError(ctx, error);
  }
};

/**
 * Get timetable by ID with getterService
 * @param ctx Context
 * @param getterService
 */
export const timetableGetByIdController = async (ctx: Context, getterService: getterService) => {
  try {
    const id: number = await getIdFromParam(ctx.params.id);

    const timetable: TimetableExport | null = await getterService(id);

    if (!timetable) {
      ctx.status = 404;
      ctx.body = { error: 'Timetable not found' };
      return;
    }

    ctx.status = 200;
    ctx.body = timetable;
  } catch (error) {
    handleError(ctx, error);
  }
};
