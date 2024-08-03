import { SubClass } from '../models/SubClass';

/**
 * SubClassDTO interface
 */
export interface SubClassDTO {
  name: string;
  classId: number;
}

/**
 * Create a new subclass
 * @param data
 */
export const createSubClass = async (data: SubClassDTO): Promise<SubClass> => {
  return await SubClass.create(data as SubClass);
};

/**
 * Get all subclasses
 */
export const getSubClasses = async (): Promise<SubClass[]> => {
  return await SubClass.findAll();
};

/**
 * Get a subclass by ID
 * @param subClassId
 */
export const getSubClassById = async (
  subClassId: number
): Promise<SubClass | null> => {
  return await SubClass.findByPk(subClassId);
};

/**
 * Get all subclasses of a specific class
 * @param classId
 */
export const getSubClassesByClassId = async (
  classId: number
): Promise<SubClass[]> => {
  return await SubClass.findAll({
    where: { classId }
  });
};

/**
 * Update a subclass by ID
 * @param subClassId
 * @param data
 */
export const updateSubClass = async (
  subClassId: number,
  data: Partial<SubClassDTO>
): Promise<[number, SubClass[]]> => {
  return await SubClass.update(data, {
    where: { subClassId },
    returning: true
  });
};

/**
 * Delete a subclass by ID
 * @param subClassId
 */
export const deleteSubClass = async (subClassId: number): Promise<number> => {
  return await SubClass.destroy({
    where: { subClassId }
  });
};
