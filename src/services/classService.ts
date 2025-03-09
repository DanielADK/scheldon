import * as classRepository from '@repositories/classRepository';
import { ClassDTO } from '@repositories/classRepository';
import * as studentGroupService from './studentGroupService';
import { Class } from '@models/Class';
import { sequelize } from '../index';
import { Transaction } from 'sequelize';

/**
 * Create a new class
 * @param data
 */
export const createClass = async (data: ClassDTO) => {
  return await classRepository.createClass(data);
};

/**
 * Get all classes
 */
export const getAllClasses = async (page: number, limit: number) => {
  const offset = (page - 1) * limit;
  return await classRepository.getClasses(limit, offset);
};

/**
 * Get a class by ID
 * @param classId
 */
export const getClassById = async (classId: number) => {
  return await classRepository.getClassById(classId);
};

/**
 * Get a class at a specific time
 * @param time
 */
export const getClassesAtTime = async (time: string): Promise<Class[] | null> => {
  return await classRepository.getClassesAtTime(time);
};

/**
 * Update a class
 * @param classId
 * @param data
 */
export const updateClass = async (classId: number, data: ClassDTO): Promise<Class> => {
  const existingClass = await classRepository.getClassById(classId);
  if (!existingClass) {
    throw new Error('Class not found');
  }

  const transaction: Transaction = await sequelize.transaction();
  let updatedClass: Class;

  try {
    const { roomId, employeeId } = data;
    const shouldCreateNewClass = (roomId && roomId !== existingClass.roomId) || (employeeId && employeeId !== existingClass.employeeId);

    if (shouldCreateNewClass) {
      // Check if the existing class is not already expired
      if (new Date(existingClass.validTo) < new Date()) {
        throw new Error('Cannot update an expired class');
      }

      // Create a new class with the updated data
      const newClass = await Class.create(
        {
          name: existingClass.name,
          validFrom: new Date().toISOString(),
          validTo: existingClass.validTo,
          roomId: roomId ?? existingClass.roomId,
          employeeId: employeeId ?? existingClass.employeeId
        } as Class,
        { transaction: transaction }
      );

      // End validity of the existing class
      await existingClass.update('validTo', new Date(new Date().getTime() - 1).toISOString(), {
        transaction: transaction
      });

      // Copy studentGroups and their assignments to the new class
      await studentGroupService.transferstudentGroups(existingClass, newClass, transaction);
      updatedClass = newClass;
    } else {
      // Update the existing class object
      updatedClass = await existingClass.update(data, { transaction });
    }
    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }

  //
  return updatedClass;
};

/**
 * Delete a class
 * @param classId
 */
export const deleteClass = async (classId: number) => {
  return await classRepository.deleteClass(classId);
};
