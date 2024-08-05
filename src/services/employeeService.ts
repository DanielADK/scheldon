import * as employeeRepository from '@repositories/employeeRepository';
import { EmployeeDTO } from '@repositories/employeeRepository';
import { Employee } from '@models/Employee';

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

/**
 * Get employee by identifier
 * @param id
 */
export const getEmployeeById = async (id: string): Promise<Employee | null> => {
  return await employeeRepository.getEmployeeById(id);
};

/**
 * Get employee by username
 * @param username
 */
export const getEmployeeByUsername = async (
  username: string
): Promise<Employee | null> => {
  return await employeeRepository.getEmployeeByUsername(username);
};

/**
 * Get employee by abbreviation
 * @param abbreviation
 */
export const getEmployeeByAbbreviation = async (
  abbreviation: string
): Promise<Employee | null> => {
  return await employeeRepository.getEmployeeByAbbreviation(abbreviation);
};

/**
 * Update an employee
 * @param id
 * @param data
 */
export const updateEmployee = async (
  id: string,
  data: Partial<Employee>
): Promise<[number, Employee[]]> => {
  return await employeeRepository.updateEmployee(id, data);
};

/**
 * Delete an employee
 * @param id
 */
export const deleteEmployee = async (id: string): Promise<number> => {
  return await employeeRepository.deleteEmployee(id);
};
