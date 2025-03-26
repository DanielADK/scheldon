import { FindAttributeOptions, Op, Transaction } from 'sequelize';
import { Class } from '@models/Class';
import { StudentGroup } from '@models/StudentGroup';

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

const classAttributes: FindAttributeOptions = ['classId', 'name', 'validFrom', 'validTo', 'roomId', 'employeeId'];

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
export const getClasses = async (limit: number, offset: number): Promise<{ rows: Class[]; count: number }> => {
  const { rows, count } = await Class.findAndCountAll({
    limit,
    offset,
    attributes: classAttributes,
    where: {
      validFrom: { [Op.lte]: new Date() },
      validTo: { [Op.gte]: new Date() }
    },
    include: [
      {
        model: StudentGroup,
        as: 'studentGroups',
        required: false
      }
    ]
  });

  return { rows, count };
};

/**
 * Get a class by ID
 * @param classId
 * @param transaction
 */
export const getClassById = async (classId: number, transaction: Transaction | null = null): Promise<Class | null> => {
  return await Class.findOne({
    where: { classId: classId },
    attributes: classAttributes,
    include: [
      {
        model: StudentGroup,
        as: 'studentGroups',
        attributes: ['studentGroupId', 'name']
      }
    ],
    transaction
  });
};

/**
 * Get classes at time
 * @param time
 */
export const getClassesAtTime = async (time: string): Promise<Class[] | null> => {
  return await Class.findAll({
    where: {
      validFrom: { [Op.lte]: time },
      validTo: { [Op.gte]: time }
    },
    attributes: classAttributes,
    include: [
      {
        model: StudentGroup,
        as: 'studentGroups',
        attributes: ['studentGroupId', 'name']
      }
    ]
  });
};

/**
 * Update a class
 * @param classId
 * @param data
 */
export const updateClass = async (classId: number, data: ClassDTO): Promise<[number]> => {
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
    where: { classId: classId },
    individualHooks: true
  });
};
