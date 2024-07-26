import * as employeeRepository from '../repositories/employeeRepository';
import { EmployeeDTO } from '../repositories/employeeRepository';

/**
 * Create a new employee
 * @param data
 */
export const createEmployee = async (data: EmployeeDTO) => {
  return await employeeRepository.createEmployee(data);
};

/**
 * Create a new employee
 * @param page
 * @param limit
 */
export const getAllEmployees = async (page: number, limit: number) => {
  const offset = (page - 1) * limit;
  return await employeeRepository.getEmployees(limit, offset);
};
