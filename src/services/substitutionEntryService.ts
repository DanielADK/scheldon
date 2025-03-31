// substitutionEntryService.ts
import { Class } from '@models/Class';
import * as classRegisterRepository from '@repositories/classRegisterRepository';
import { classMask, employeeMask, roomMask, TimetableExport, transformAndMask } from '@services/transformers/timetableExport';
import { SubstitutionTimetableAdapter } from '@services/transformers/substitutionTimetableAdapter';
import { Employee } from '@models/Employee';
import { Room } from '@models/Room';
import { SubstitutionEntry } from '@models/SubstitutionEntry';
import { sequelize } from '../index';
import {
  findOrCreateSubstitutionEntry,
  SubstitutionTimetableEntryDTO,
  validateSubstitutionTimetableEntry
} from '@repositories/substitutionEntryRepository';
import { Transaction } from 'sequelize';
import { StudentGroup } from '@models/StudentGroup';
import { Subject } from '@models/Subject';

/**
 * Get timetable by class ID and date
 * @param classId int
 * @param date Date
 */
export const getTimetableByClassIdAt = async (classId: number, date: Date): Promise<TimetableExport | null> => {
  const classExists = await Class.findByPk(classId);
  if (!classExists) {
    throw new Error(`Class with ID ${classId} not found`);
  }

  const timetable = await classRegisterRepository.getTemporaryTimetable('class', classId, date);
  return transformAndMask(timetable, new SubstitutionTimetableAdapter(), classMask);
};

/**
 * Get timetable by employee ID and date
 * @param employeeId int
 * @param date Date
 */
export const getTimetableByEmployeeIdAt = async (employeeId: number, date: Date): Promise<TimetableExport | null> => {
  const employeeExists = await Employee.findByPk(employeeId);
  if (!employeeExists) {
    throw new Error(`Employee with ID ${employeeId} not found`);
  }

  const timetable = await classRegisterRepository.getTemporaryTimetable('employee', employeeId, date);
  return transformAndMask(timetable, new SubstitutionTimetableAdapter(), employeeMask);
};

/**
 * Get timetable by room ID and date
 * @param roomId int
 * @param date Date
 */
export const getTimetableByRoomIdAt = async (roomId: number, date: Date): Promise<TimetableExport | null> => {
  const roomExists = await Room.findByPk(roomId);
  if (!roomExists) {
    throw new Error(`Room with ID ${roomId} not found`);
  }

  const timetable = await classRegisterRepository.getTemporaryTimetable('room', roomId, date);
  return transformAndMask(timetable, new SubstitutionTimetableAdapter(), roomMask);
};

/**
 * Create a submission entry and find associated class register
 *
 * @param data SubstitutionTimetableEntryDTO
 * @returns SubstitutionEntry The created entry and found class register
 */
export const createSubstitutionEntryAndFindClassRegister = async (data: SubstitutionTimetableEntryDTO): Promise<SubstitutionEntry> => {
  const validatedData = validateSubstitutionTimetableEntry(data);

  const transaction: Transaction = await sequelize.transaction();
  // Check if related entities exist before proceeding
  const classExists = await Class.findByPk(validatedData.classId, { transaction });
  if (!classExists) {
    throw new Error(`Class with ID ${validatedData.classId} not found`);
  }

  if (validatedData.studentGroupId !== null) {
    const studentGroupExists = await StudentGroup.findByPk(validatedData.studentGroupId, {
      transaction
    });
    if (!studentGroupExists) {
      throw new Error(`Student group with ID ${validatedData.studentGroupId} not found`);
    }
  }

  const subjectExists = await Subject.findByPk(validatedData.subjectId, {
    transaction
  });
  if (!subjectExists) {
    throw new Error(`Subject with ID ${validatedData.subjectId} not found`);
  }

  const teacherExists = await Employee.findByPk(validatedData.teacherId, {
    transaction
  });
  if (!teacherExists) {
    throw new Error(`Teacher with ID ${validatedData.teacherId} not found`);
  }

  try {
    // Find or create the submission entry
    const submissionEntry = await findOrCreateSubstitutionEntry(validatedData, transaction);

    await transaction.commit();

    return submissionEntry;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};
