import { Op } from 'sequelize';
import { Class } from '@models/Class';
import { Room } from '@models/Room';
import { Employee } from '@models/Employee';
import { QueryOptions } from '@models/types/QueryOptions';
import { validator } from '@validators/genericValidators';

/**
 * Validate class dates
 * @param instance
 */
export const validateClassDates: validator<Class> = async (instance: Class) => {
  if (new Date(instance.validFrom) > new Date(instance.validTo)) {
    throw new Error('The validation start date must be earlier than the validation end date');
  }
};

/**
 * Validate class name
 * @param instance
 * @param options
 */
export const validateClassName: validator<Class> = async (instance: Class, options?: QueryOptions | null) => {
  const existingClass = await Class.findOne({
    where: {
      name: instance.name,
      validFrom: {
        [Op.lte]: instance.validTo
      },
      validTo: {
        [Op.gte]: instance.validFrom
      },
      classId: {
        [Op.ne]: instance.classId
      }
    },
    ...options
  });

  if (existingClass) {
    throw new Error('Class name already exists within the validity period of another class');
  }
};

/**
 * Validate class interval
 * @param instance
 * @param options
 */
export const validateClassInterval: validator<Class> = async (instance: Class, options?: QueryOptions | null) => {
  const existingClass = await Class.findOne({
    where: {
      name: instance.name,
      roomId: instance.roomId,
      employeeId: instance.employeeId,
      validFrom: {
        [Op.lte]: instance.validTo
      },
      validTo: {
        [Op.gte]: instance.validFrom
      },
      classId: {
        [Op.ne]: instance.classId // Ignore current instance during update
      }
    },
    ...options
  });

  if (existingClass) {
    throw new Error('Class interval is overlapping with another class');
  }
};

/**
 * Validate employee existence
 * @param instance
 * @param options
 */
export const validateTeacherExistence: validator<Class> = async (instance: Class, options?: QueryOptions | null) => {
  const teacher = await Employee.findOne({
    where: { employeeId: instance.employeeId, isTeacher: true },
    ...options
  });

  if (!teacher) {
    throw new Error('Teacher does not exist');
  }
};

/**
 * Validate employee schedule
 * @param instance
 * @param options
 */
export const validateTeacherSchedule: validator<Class> = async (instance: Class, options?: QueryOptions | null) => {
  const existingTeacher = await Class.findOne({
    where: {
      employeeId: instance.employeeId,
      validFrom: {
        [Op.lte]: instance.validTo
      },
      validTo: {
        [Op.gte]: instance.validFrom
      },
      classId: {
        [Op.ne]: instance.classId // Ignore current instance during update
      }
    },
    ...options
  });

  if (existingTeacher) {
    throw new Error('Teacher is already assigned to another class within the validity period');
  }
};

/**
 * Validate room existence
 * @param instance
 * @param options
 */
export const validateRoomExistence: validator<Class> = async (instance: Class, options?: QueryOptions | null) => {
  const room = await Room.findOne({
    where: {
      roomId: instance.roomId,
      type: 'classroom'
    },
    ...options
  });

  if (!room) {
    throw new Error('Room does not exist');
  }
};

/**
 * Validate room schedule
 * @param instance
 * @param options
 */
export const validateRoomSchedule: validator<Class> = async (instance: Class, options?: QueryOptions | null) => {
  const existingRoom = await Class.findOne({
    where: {
      roomId: instance.roomId,
      validFrom: { [Op.lte]: instance.validTo },
      validTo: { [Op.gte]: instance.validFrom },
      classId: { [Op.ne]: instance.classId }
    },
    ...options
  });

  if (existingRoom) {
    throw new Error('Room is already assigned to another class within the validity period');
  }
};
