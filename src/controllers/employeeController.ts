import * as employeeService from '../services/employeeService';
import { Context } from 'koa';
import Joi from 'joi';
import { EmployeeDTO } from '../repositories/employeeRepository';

const employeeSchema: Joi.ObjectSchema<EmployeeDTO> = Joi.object({
  username: Joi.string().required().min(2).max(50),
  name: Joi.string().required().min(2).max(50),
  surname: Joi.string().required().min(2).max(50),
  degreePre: Joi.string().allow(null).max(20),
  degreePost: Joi.string().allow(null).max(20),
  abbreviation: Joi.string().allow(null).max(2),
  isTeacher: Joi.boolean().required()
});

/**
 * Create a new employee
 * POST /employee
 * @param ctx
 */
export const createEmployee = async (ctx: Context): Promise<void> => {
  // Validate request
  const { error, value } = employeeSchema.validate(ctx.request.body);

  if (error) {
    ctx.status = 400;
    ctx.body = { error: error.details[0].message };
    return;
  }

  try {
    const employee = await employeeService.createEmployee(value);
    ctx.status = 201;
    ctx.body = employee;
  } catch (error: Error | any) {
    ctx.status = 400;
    ctx.body = { error: error.message };
  }
};

// Get all employees
export const getAllEmployees = async (ctx: Context): Promise<void> => {
  // Pagination
  const page = parseInt(ctx.query.page as string) || 1;
  const limit = parseInt(ctx.query.limit as string) || 10;

  // Get all employees
  const employees = await employeeService.getAllEmployees(
    limit,
    (page - 1) * limit
  );

  ctx.status = 200;
  ctx.body = {
    data: employees.rows,
    meta: {
      total: employees.count,
      page,
      limit
    }
  };
};

// Get employee by id
export const getEmployeeById = async (ctx: Context): Promise<void> => {
  const identifier = ctx.params.id as string;

  const employee = await employeeService.getEmployeeById(identifier);

  if (!employee) {
    ctx.status = 404;
    ctx.body = { error: 'Employee not found' };
    return;
  }

  ctx.status = 200;
  ctx.body = employee;
};

// Get employee by username
export const getEmployeeByUsername = async (ctx: Context): Promise<void> => {
  const username = ctx.params.username as string;

  const employee = await employeeService.getEmployeeByUsername(username);

  if (!employee) {
    ctx.status = 404;
    ctx.body = { error: 'Employee not found' };
    return;
  }

  ctx.status = 200;
  ctx.body = employee;
};

// Get employee by abbreviation
export const getEmployeeByAbbreviation = async (
  ctx: Context
): Promise<void> => {
  const abbreviation = ctx.params.abbreviation as string;

  const employee =
    await employeeService.getEmployeeByAbbreviation(abbreviation);

  if (!employee) {
    ctx.status = 404;
    ctx.body = { error: 'Employee not found' };
    return;
  }

  ctx.status = 200;
  ctx.body = employee;
};

// Update an employee
export const updateEmployee = async (ctx: Context): Promise<void> => {
  const id = ctx.params.id as string;
  const { error, value } = employeeSchema.validate(ctx.request.body);

  if (error) {
    ctx.status = 400;
    ctx.body = { error: error.details[0].message };
    return;
  }

  try {
    const [affectedCount] = await employeeService.updateEmployee(id, value);

    if (affectedCount === 0) {
      ctx.status = 404;
      ctx.body = { error: 'Employee not found' };
      return;
    }

    ctx.status = 204;
  } catch (error: Error | any) {
    ctx.status = 400;
    ctx.body = { error: error.message };
  }
};

// Delete an employee
export const deleteEmployee = async (ctx: Context): Promise<void> => {
  const id = ctx.params.id as string;

  const deletedCount = await employeeService.deleteEmployee(id);

  if (deletedCount === 0) {
    ctx.status = 404;
    ctx.body = { error: 'Employee not found' };
    return;
  }

  ctx.status = 204;
};
