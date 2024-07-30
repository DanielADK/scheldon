import { Room } from '../models/Room';
import { RoomType } from '../models/types/RoomType';

/**
 * RoomDTO interface
 */
export interface RoomDTO {
  name: string;
  type: RoomType;
  floor: number;
  studentCapacity?: number;
  administratorId: number;
}

/**
 * Create a new room
 * @param data
 */
export const createRoom = async (data: RoomDTO): Promise<Room> => {
  const existingRoom = await Room.findOne({
    where: { name: data.name }
  });
  if (existingRoom) {
    throw new Error('This room name is already in use.');
  }
  return await Room.create(data as Room);
};

/**
 * Get a room by ID
 * @param id
 */
export const getRoomById = async (id: number): Promise<Room | null> => {
  return await Room.findByPk(id);
};

/**
 * Get all rooms
 */
export const getAllRooms = async (
  limit: number,
  offset: number
): Promise<{ rows: Room[]; count: number }> => {
  const { rows, count } = await Room.findAndCountAll({
    limit,
    offset
  });

  return { rows, count };
};

/**
 * Update a room
 * @param id
 * @param data
 */
export const updateRoom = async (
  id: number,
  data: Partial<Room>
): Promise<[affectedCount: number]> => {
  return await Room.update(data, { where: { roomId: id } });
};

/**
 * Delete a room
 * @param id
 */
export const deleteRoom = async (id: number): Promise<number> => {
  return await Room.destroy({ where: { roomId: id } });
};
