import { Employee } from '@models/Employee';
import { FindAttributeOptions, Op } from 'sequelize';

/**
 * EmployeeDTO interface
 */
export interface EmployeeDTO {
  username: string;
  name: string;
  surname: string;
  degreePre?: string;
  degreePost?: string;
  abbreviation?: string;
  isTeacher: boolean;
  isActive?: boolean;
}

const employeeAttributes: FindAttributeOptions = [
  ['employeeId', 'id'],
  'username',
  'name',
  'surname',
  'degreePre',
  'degreePost',
  'abbreviation',
  'isTeacher'
];

/**
 * Create a new employee
 * @param data
 */
export const createEmployee = async (data: EmployeeDTO): Promise<Employee> => {
  const existingEmployee = await Employee.findOne({
    where: {
      [Op.or]: { username: data.username, abbreviation: data.abbreviation }
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
    attributes: employeeAttributes,
    where: { isActive: true }
  });

  return { rows, count };
};

/**
 * Get employee by id
 * @param id
 */
export const getEmployeeById = async (id: number): Promise<Employee | null> => {
  return await Employee.findOne({
    where: { employeeId: id },
    attributes: employeeAttributes
  });
};

/**
 * Get employee by username
 * @param username
 */
export const getEmployeeByUsername = async (
  username: string
): Promise<Employee | null> => {
  return await Employee.findOne({
    where: { username: username },
    attributes: employeeAttributes
  });
};

/**
 * Get employee by abbreviation
 * @param abbreviation
 */
export const getEmployeeByAbbreviation = async (
  abbreviation: string
): Promise<Employee | null> => {
  return await Employee.findOne({
    where: { abbreviation: abbreviation },
    attributes: employeeAttributes
  });
};

/**
 * Update an employee
 * @param id
 * @param data
 */
export const updateEmployee = async (
  id: number,
  data: Partial<Employee>
): Promise<[number, Employee[]]> => {
  return await Employee.update(data, {
    where: { employeeId: id },
    returning: true
  });
};

/**
 * Delete an employee
 * @param id
 */
export const deleteEmployee = async (id: string): Promise<number> => {
  return await Employee.destroy({
    where: { employeeId: id }
  });
};
