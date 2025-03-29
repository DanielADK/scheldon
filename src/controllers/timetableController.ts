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

export const updateTimetableSetSchema: Joi.ObjectSchema<TimetableSetDTO> = Joi.object({
  name: Joi.string().min(3).max(50),
  validFrom: Joi.date(),
  validTo: Joi.date()
});

/**
 * Schema for creating a timetable entry
 */
export const timetableEntrySchema: Joi.ObjectSchema<TimetableEntryDTO> = Joi.object({
  classId: Joi.number().required(),
  studentGroupId: Joi.number().optional().allow(null),
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
  studentGroupId: Joi.number().optional().allow(null),
  hourInDay: Joi.number().required(),
  subjectId: Joi.number().required(),
  teacherId: Joi.number().required(),
  roomId: Joi.number().required(),
  date: Joi.date().iso().required(),
  type: Joi.string()
    .valid(...Object.values(SubstitutionType))
    .required()
});

type idGetterService = (id: number) => Promise<TimetableExport | null>;
type idAtGetterService = (id: number, date: Date) => Promise<TimetableExport | null>;

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

    const { entry, isNew } = await timetableService.createTEntry(tsetId, value);

    ctx.status = isNew ? 200 : 201;
    ctx.body = entry;
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
export const getTimetableByIdController = async (ctx: Context, getterService: idGetterService) => {
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

/**
 * Get timetable by ID and date using a getterService
 * @param ctx Context
 * @param idAtGetterService
 */
export const getTimetableByIdAndDateController = async (ctx: Context, idAtGetterService: idAtGetterService): Promise<void> => {
  try {
    const id: number = await getIdFromParam(ctx.params.id);
    const date: string = ctx.params.date;

    // Validate date format
    const dateValidationSchema = Joi.date().iso().required();
    const { value, error } = dateValidationSchema.validate(date);

    if (error) {
      ctx.status = 400;
      ctx.body = { error: 'Invalid date format. Use YYYY-MM-DD format.' };
      return;
    }

    const timetable: TimetableExport | null = await idAtGetterService(id, value);

    if (!timetable) {
      ctx.status = 404;
      ctx.body = { error: 'Timetable not found for the given ID and date' };
      return;
    }

    ctx.status = 200;
    ctx.body = timetable;
  } catch (error) {
    handleError(ctx, error);
  }
};

/**
 * Retrieves timetable entries associated with a specific set and sends them in the response body.
 *
 * @param {Context} ctx - The Koa context object containing request and response data. It should include
 * the set identifier in the request parameters under `ctx.params.id`.
 * @return {Promise<void>} A promise that resolves when the operation is complete. The response contains
 * the retrieved entries or an error if the operation fails.
 */
export async function getEntriesBySet(ctx: Context): Promise<void> {
  try {
    const tsetId: number = await getIdFromParam(ctx.params.id);

    const entries = await timetableService.getEntriesBySet(tsetId);

    ctx.status = 200;
    ctx.body = entries;
  } catch (error) {
    handleError(ctx, error);
  }
}

/**
 * Fetches all sets and sends the result in the response body.
 *
 * @param {Context} ctx - The Koa request/response context.
 * @return {Promise<void>} A promise that resolves when the response has been sent.
 */
export async function getAllSets(ctx: Context): Promise<void> {
  try {
    const allSets = await timetableService.getAllSets();

    ctx.status = 200;
    ctx.body = allSets;
  } catch (error) {
    handleError(ctx, error);
  }
}

/**
 * Deletes a timetable set based on the provided ID in the context parameters.
 *
 * @param {Context} ctx - The context object containing the request and response information. The timetable set ID is extracted from `ctx.params.id`.
 * @return {Promise<void>} A Promise that resolves when the timetable set is successfully deleted. Sets the HTTP response status to 204.
 */
export async function deleteTSet(ctx: Context): Promise<void> {
  try {
    const timetableSetId = parseInt(ctx.params.id);

    if (isNaN(timetableSetId)) {
      throw new Error('Invalid timetable set ID');
    }

    await timetableService.deleteTSetById(timetableSetId);

    ctx.status = 204;
    ctx.body = { message: 'Timetable set successfully deleted' };
  } catch (error) {
    handleError(ctx, error);
  }
}

export async function deleteTEntry(ctx: Context): Promise<void> {
  try {
    const tentryId = parseInt(ctx.params.id);

    if (isNaN(tentryId)) {
      throw new Error('Invalid timetable entry ID');
    }

    await timetableService.deleteTEntryById(tentryId);

    ctx.status = 204;
  } catch (error) {
    handleError(ctx, error);
  }
}

export async function updateTSet(ctx: Context): Promise<void> {
  try {
    const updateId = await getIdFromParam(ctx.params.id as string);

    const { error, value } = updateTimetableSetSchema.validate(ctx.request.body, {
      allowUnknown: false,
      stripUnknown: true
    });

    if (error) {
      ctx.status = 400;
      ctx.body = { error: error.details[0].message };
      return;
    }

    const updatedSet = await timetableService.updateTSet(updateId, value);

    if (!updatedSet) {
      throw new Error('Timetable set not found');
    }
    ctx.status = 200;
    ctx.body = updatedSet;
  } catch (error) {
    handleError(ctx, error);
  }
}

export async function getTimetableSetById(ctx: Context): Promise<void> {
  try {
    const setId = await getIdFromParam(ctx.params.id as string);

    const set = await timetableService.getTSetById(setId);

    if (!set) {
      throw new Error('Timetable set not found');
    }

    ctx.status = 200;
    ctx.body = set;
  } catch (error) {
    handleError(ctx, error);
  }
}

export async function getTimetableEntryById(ctx: Context): Promise<void> {
  try {
    const entryId = await getIdFromParam(ctx.params.id as string);

    const entry = await timetableService.getTEntryById(entryId);

    if (!entry) {
      throw new Error('Timetable entry not found');
    }

    ctx.status = 200;
    ctx.body = entry;
  } catch (error) {
    handleError(ctx, error);
  }
}
