import { Context } from 'koa';
import { Room } from '@models/Room';
import * as roomService from '@services/roomService';
import Joi from 'joi';
import { RoomDTO } from '@repositories/roomRepository';
import { RoomType } from '@models/types/RoomType';
import { getIdFromParam, handleCreationError } from '../lib/controllerTools';

// Schema for creating and updating a room
const roomSchema: Joi.ObjectSchema<RoomDTO> = Joi.object({
  name: Joi.string().required().min(1).max(30),
  type: Joi.string()
    .valid(...Object.values(RoomType))
    .required(),
  floor: Joi.number().required().integer().min(0),
  studentCapacity: Joi.number()
    .integer()
    .min(1)
    .when('type', {
      is: Joi.string().valid(RoomType.OFFICE),
      then: Joi.optional(),
      otherwise: Joi.required()
    }),
  administratorId: Joi.number().required().integer()
});

export const createRoom = async (ctx: Context): Promise<Room | void> => {
  const { error, value } = roomSchema.validate(ctx.request.body);

  if (error) {
    ctx.status = 400;
    ctx.body = { error: error.details[0].message };
    return;
  }

  try {
    const room = await roomService.createRoom(value);
    ctx.status = 201;
    ctx.body = room;
  } catch (error) {
    handleCreationError(ctx, error);
  }
};

/**
 * Get all rooms
 */
export const getAllRooms = async (ctx: Context): Promise<void> => {
  const page: number = parseInt(ctx.query.page as string) || 1;
  const limit: number = parseInt(ctx.query.limit as string) || 10;

  const rooms: { rows: Room[]; count: number } = await roomService.getAllRooms(
    page,
    limit
  );

  ctx.status = 200;
  ctx.body = {
    data: rooms.rows,
    meta: {
      total: rooms.count,
      page: 1,
      limit: 10
    }
  };
};

/**
 * Get room by id
 */
export const getRoomById = async (ctx: Context): Promise<void> => {
  const id: number = await getIdFromParam(ctx.params.id);
  const room: Room | null = await roomService.getRoomById(id);
  if (room) {
    ctx.body = room;
  } else {
    ctx.status = 404;
    ctx.body = { error: 'Room not found' };
  }
};

/**
 * Update room
 */
export const updateRoom = async (ctx: Context): Promise<void> => {
  const id: number = await getIdFromParam(ctx.params.id);
  const { error, value } = roomSchema.validate(ctx.request.body);

  if (error) {
    ctx.status = 400;
    ctx.body = { error: error.details[0].message };
    return;
  }

  try {
    const [affectedCount] = await roomService.updateRoom(id, value);

    if (affectedCount > 0) {
      ctx.status = 200;
      ctx.body = { message: 'Room updated' };
    } else {
      ctx.status = 404;
      ctx.body = { error: 'Room not found' };
    }
  } catch (error) {
    handleCreationError(ctx, error);
  }
};

/**
 * Delete room
 */
export const deleteRoom = async (ctx: Context): Promise<void> => {
  const roomId: number = await getIdFromParam(ctx.params.id);
  const deletedCount = await roomService.deleteRoom(roomId);

  if (deletedCount === 0) {
    ctx.status = 404;
    ctx.body = { error: 'Room not found' };
    return;
  }

  ctx.status = 204;
};
