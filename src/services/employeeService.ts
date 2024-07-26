import * as employeeRepository from '../repositories/employeeRepository';

/**
 * Create a new employee
 * @param page
 * @param limit
 */
export const getAllEmployees = async (page: number, limit: number) => {
  const offset = (page - 1) * limit;
  return await employeeRepository.getEmployees(limit, offset);
};
