import { Room } from '@models/Room';
import * as roomRepository from '@repositories/roomRepository';
import { RoomDTO } from '@repositories/roomRepository';

/**
 * Create a new room
 * @param data Room data
 */
export const createRoom = async (data: RoomDTO): Promise<Room> => {
  return await roomRepository.createRoom(data);
};

/**
 * Get all rooms
 */
export const getAllRooms = async (page: number, limit: number): Promise<{ rows: Room[]; count: number }> => {
  const offset: number = (page - 1) * limit;
  return await roomRepository.getAllRooms(limit, offset);
};

/**
 * Get room by id
 * @param id Room ID
 */
export const getRoomById = async (id: number): Promise<Room | null> => {
  return await roomRepository.getRoomById(id);
};

/**
 * Update a room
 * @param roomId
 * @param data
 */
export const updateRoom = async (roomId: number, data: RoomDTO): Promise<[affectedCount: number]> => {
  return await roomRepository.updateRoom(roomId, data);
};

/**
 * Delete a room
 * @param roomId
 */
export const deleteRoom = async (roomId: number): Promise<number> => {
  return await roomRepository.deleteRoom(roomId);
};
