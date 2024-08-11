import { Context } from 'koa';
import * as timetableService from '@services/timetableService';
import { getIdFromParam } from '../lib/controllerTools';

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
