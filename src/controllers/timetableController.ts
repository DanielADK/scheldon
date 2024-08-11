import { Context } from 'koa';
import * as timetableService from '@services/timetableService';

export const getTimetableBySetId = async (ctx: Context): Promise<void> => {
  const setId: number = await getIdFromParam(ctx.params.setId);

  const timetable = await timetableService.getTimetableBySetId(setId);

  if (!timetable) {
    ctx.status = 404;
    ctx.body = { error: 'Timetable not found' };
    return;
  }

  ctx.status = 200;
  ctx.body = timetable;
};

/**
 * Get ID from request.
 * @param id
 * @throws Error if ID is invalid
 */
const getIdFromParam = async (id: string): Promise<number> => {
  const idNum = parseInt(id);
  if (isNaN(idNum)) {
    throw new Error('Invalid ID');
  }
  return idNum;
};
