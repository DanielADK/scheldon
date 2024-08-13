import { Context } from 'koa';
import * as timetableService from '@services/timetableService';
import { getIdFromParam } from '../lib/controllerTools';
import {
  TimetableEntryDTO,
  TimetableSetDTO
} from '@repositories/timetableRepository';
import Joi from 'joi';

/**
 * Schema for creating a timetable set
 */
export const timetableSetSchema: Joi.ObjectSchema<TimetableSetDTO> = Joi.object(
  {
    name: Joi.string().required().min(3).max(50),
    validFrom: Joi.date().required(),
    validTo: Joi.date().required()
  }
);

/**
 * Schema for creating a timetable entry
 */
export const timetableEntrySchema: Joi.ObjectSchema<TimetableEntryDTO> =
  Joi.object({
    classId: Joi.number().required(),
    subClassId: Joi.number().optional(),
    dayInWeek: Joi.number().required().min(0).max(6),
    hourInDay: Joi.number().required().min(0).max(10),
    subjectId: Joi.number().required(),
    teacherId: Joi.number().required(),
    roomId: Joi.number().required()
  });

/**
 * Create a new timetable set
 * @param ctx Context
 */
export const createTEntry = async (ctx: Context): Promise<void> => {
  const tsetId: number = await getIdFromParam(ctx.params.id);
  const { error, value } = timetableEntrySchema.validate(ctx.request.body);

  if (error) {
    ctx.status = 400;
    ctx.body = { error: error.details[0].message };
    return;
  }

  try {
    const tentry = await timetableService.createTEntry(tsetId, value);
    ctx.status = 201;
    ctx.body = tentry;
  } catch (error: Error | any) {
    ctx.status = 400;
    ctx.body = { error: error.message };
  }
};

/**
 * Create a new timetable set
 * @param ctx Context
 */
export const createTSet = async (ctx: Context): Promise<void> => {
  const { error, value } = timetableSetSchema.validate(ctx.request.body);

  if (error) {
    ctx.status = 400;
    ctx.body = { error: error.details[0].message };
    return;
  }

  try {
    const tset = await timetableService.createTSet(value);
    ctx.status = 201;
    ctx.body = tset;
  } catch (error: Error | any) {
    ctx.status = 400;
    ctx.body = { error: error.message };
  }
};

/**
 * Create a new timetable set
 * @param ctx Context
 */
export const getTimetableBySetId = async (ctx: Context): Promise<void> => {
  const setId: number = await getIdFromParam(ctx.params.id);

  const timetable = await timetableService.getTimetableBySetId(setId);

  if (!timetable) {
    ctx.status = 404;
    ctx.body = { error: 'Timetable not found' };
  }

  ctx.status = 200;
  ctx.body = timetable;
};

export const getTimetableByClassId = async (ctx: Context): Promise<void> => {
  const classId: number = await getIdFromParam(ctx.params.id);

  const timetable = await timetableService.getTimetableByClassId(classId);

  if (!timetable) {
    ctx.status = 404;
    ctx.body = { error: 'Timetable not found' };
    return;
  }

  ctx.status = 200;
  ctx.body = timetable;
};
