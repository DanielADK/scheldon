import { Op } from 'sequelize';
import { Class } from '@models/Class';
import { Room } from '@models/Room';
import { Employee } from '@models/Employee';

/**
 * Validate class dates
 * @param instance
 */
export const validateClassDates = async (instance: Class) => {
  if (new Date(instance.validFrom) > new Date(instance.validTo)) {
    throw new Error('validFrom must be less than validTo');
  }
};

/**
 * Validate class name
 * @param instance
 */
export const validateClassName = async (instance: Class) => {
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
    }
  });

  if (existingClass) {
    throw new Error('Class name already exists within the validity period of another class');
  }
};

/**
 * Validate class interval
 * @param instance
 */
export const validateClassInterval = async (instance: Class) => {
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
    }
  });

  if (existingClass) {
    throw new Error('Class interval is overlapping with another class');
  }
};

/**
 * Validate employee existence
 * @param instance
 */
export const validateTeacherExistence = async (instance: Class) => {
  const teacher = await Employee.findOne({
    where: { employeeId: instance.employeeId, isTeacher: true }
  });

  if (!teacher) {
    throw new Error('Teacher does not exist');
  }
};

/**
 * Validate employee schedule
 * @param instance
 */
export const validateTeacherSchedule = async (instance: Class) => {
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
    }
  });

  if (existingTeacher) {
    throw new Error('Teacher is already assigned to another class within the validity period');
  }
};

/**
 * Validate room existence
 * @param instance
 */
export const validateRoomExistence = async (instance: Class) => {
  const room = await Room.findOne({
    where: {
      roomId: instance.roomId,
      type: 'classroom'
    }
  });

  if (!room) {
    throw new Error('Room does not exist');
  }
};

/**
 * Validate room schedule
 * @param instance
 */
export const validateRoomSchedule = async (instance: Class) => {
  const existingRoom = await Class.findOne({
    where: {
      roomId: instance.roomId,
      validFrom: { [Op.lte]: instance.validTo },
      validTo: { [Op.gte]: instance.validFrom },
      classId: { [Op.ne]: instance.classId }
    }
  });

  if (existingRoom) {
    throw new Error('Room is already assigned to another class within the validity period');
  }
};
