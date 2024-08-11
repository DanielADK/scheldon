import { FindAttributeOptions } from 'sequelize';
import { Class } from '@models/Class';
import { SubClass } from '@models/SubClass';

/**
 * ClassDTO interface
 */
export interface ClassDTO {
  name: string;
  validFrom: string;
  validTo: string;
  roomId: number;
  employeeId: number;
  createdAt?: string;
}

const classAttributes: FindAttributeOptions = [
  ['classId', 'id'],
  'name',
  'validFrom',
  'validTo',
  'roomId',
  ['employeeId', 'classTeacherId']
];

/**
 * Create a new class
 * @param data
 */
export const createClass = async (data: ClassDTO): Promise<Class> => {
  return await Class.create(data as Class);
};

/**
 * Get all classes now
 */
export const getClasses = async (
  limit: number,
  offset: number
): Promise<{ rows: Class[]; count: number }> => {
  const { rows, count } = await Class.findAndCountAll({
    limit,
    offset,
    attributes: classAttributes,
    where: {
      validFrom: { lte: new Date() },
      validTo: { gte: new Date() }
    },
    include: [
      {
        model: SubClass,
        as: 'subClasses'
      }
    ]
  });

  return { rows, count };
};

/**
 * Get a class by ID
 * @param classId
 */
export const getClassById = async (classId: number): Promise<Class | null> => {
  return await Class.findOne({
    where: { classId: classId },
    attributes: classAttributes,
    include: [
      {
        model: SubClass,
        as: 'subClasses',
        attributes: ['subClassId', 'name']
      }
    ]
  });
};

/**
 * Get classes at time
 * @param time
 */
export const getClassesAtTime = async (
  time: string
): Promise<Class[] | null> => {
  return await Class.findAll({
    where: {
      validFrom: { lte: time },
      validTo: { gte: time }
    },
    attributes: classAttributes,
    include: [
      {
        model: SubClass,
        as: 'subClasses'
      }
    ]
  });
};

/**
 * Update a class
 * @param classId
 * @param data
 */
export const updateClass = async (
  classId: number,
  data: ClassDTO
): Promise<[number]> => {
  return await Class.update(data, {
    where: { classId: classId }
  });
};

/**
 * Delete a class
 * @param classId
 */
export const deleteClass = async (classId: number): Promise<number> => {
  return await Class.destroy({
    where: { classId: classId }
  });
};
