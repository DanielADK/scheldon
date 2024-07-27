import { Employee } from '../models/Employee';
import { Op } from 'sequelize';

/**
 * EmployeeDTO interface
 */
export interface EmployeeDTO {
  username: string;
  name: string;
  surname: string;
  degreePre: string;
  degreePost: string;
  abbreviation: string;
  isTeacher: boolean;
}

export const createEmployee = async (data: EmployeeDTO): Promise<Employee> => {
  const existingEmployee = await Employee.findOne({
    where: {
      [Op.or]: [
        { username: data.username },
        { abbreviation: data.abbreviation }
      ]
    }
  });
  if (existingEmployee) {
    throw new Error('This username or abbreviation is already in use.');
  }
  return await Employee.create(data as Employee);
};

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
      'isTeacher'
    ],
    where: { isActive: true }
  });

  return { rows, count };
};

/**
 * Get employee by username
 * @param identifier
 */
export const getEmployeeById = async (
  identifier: string
): Promise<Employee | null> => {
  return await Employee.findOne({
    where: {
      [Op.or]: {
        username: identifier,
        abbreviation: identifier
      }
    }
  });
};
