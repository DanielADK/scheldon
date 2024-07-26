import { Employee } from '../models/Employee';

/**
 * Get all employees
 * @param limit
 * @param offset
 */
export const getEmployees = async (
  limit: number,
  offset: number
): Promise<{ rows: Employee[]; count: number }> => {
  const { rows, count } = await Employee.findAndCountAll({
    limit,
    offset,
    attributes: [
      ['employeeId', 'id'],
      'degreePre',
      'degreePost',
      'name',
      'surname',
      'username',
      'abbreviation',
      ['isTeacher', 'teacher']
    ],
    where: { isActive: true }
  });

  return { rows, count };
};
