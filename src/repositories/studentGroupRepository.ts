import { StudentGroup } from '@models/StudentGroup';

/**
 * studentGroupDTO interface
 */
export interface studentGroupDTO {
  name: string;
  classId: number;
}

/**
 * Create a new studentGroup
 * @param data
 */
export const createstudentGroup = async (
  data: studentGroupDTO
): Promise<StudentGroup> => {
  return await StudentGroup.create(data as StudentGroup);
};

/**
 * Get all studentGroupes
 */
export const getstudentGroupes = async (): Promise<StudentGroup[]> => {
  return await StudentGroup.findAll();
};

/**
 * Get a studentGroup by ID
 * @param studentGroupId
 */
export const getstudentGroupById = async (
  studentGroupId: number
): Promise<StudentGroup | null> => {
  return await StudentGroup.findByPk(studentGroupId);
};

/**
 * Get all studentGroupes of a specific class
 * @param classId
 */
export const getstudentGroupesByClassId = async (
  classId: number
): Promise<StudentGroup[]> => {
  return await StudentGroup.findAll({
    where: { classId }
  });
};

/**
 * Update a studentGroup by ID
 * @param studentGroupId
 * @param data
 */
export const updatestudentGroup = async (
  studentGroupId: number,
  data: Partial<studentGroupDTO>
): Promise<[number, StudentGroup[]]> => {
  return await StudentGroup.update(data, {
    where: { studentGroupId },
    returning: true
  });
};

/**
 * Delete a studentGroup by ID
 * @param studentGroupId
 */
export const deletestudentGroup = async (
  studentGroupId: number
): Promise<number> => {
  return await StudentGroup.destroy({
    where: { studentGroupId }
  });
};
