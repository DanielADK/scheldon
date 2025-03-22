import * as employeeService from '@services/employeeService';
import { Context } from 'koa';
import Joi from 'joi';
import { EmployeeDTO } from '@repositories/employeeRepository';
import { getIdFromParam, handleError } from '../lib/controllerTools';

const employeeSchema: Joi.ObjectSchema<EmployeeDTO> = Joi.object({
  username: Joi.string().required().min(2).max(50),
  name: Joi.string().required().min(2).max(50),
  surname: Joi.string().required().min(2).max(50),
  degreePre: Joi.string().max(20).default(null).allow(null, ''),
  degreePost: Joi.string().max(20).default(null).allow(null, ''),
  abbreviation: Joi.string().max(2).default(null).allow(null, ''),
  isTeacher: Joi.boolean().required(),
  isActive: Joi.boolean().default(true)
});

/**
 * Create a new employee
 * POST /employee
 * @param ctx
 */
export const createEmployee = async (ctx: Context): Promise<void> => {
  try {
    // Validate request
    const { error, value } = employeeSchema.validate(ctx.request.body);

    if (error) {
      ctx.status = 400;
      ctx.body = { error: error.details[0].message };
      return;
    }

    const employee = await employeeService.createEmployee(value);
    ctx.status = 201;
    ctx.body = employee;
  } catch (error) {
    handleError(ctx, error);
  }
};

// Get all employees
export const getAllEmployees = async (ctx: Context): Promise<void> => {
  // Pagination
  const page = parseInt(ctx.query.page as string) || 1;
  const limit = parseInt(ctx.query.limit as string) || 10;

  // Get all employees
  const employees = await employeeService.getAllEmployees(page, limit);

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
  const id = await getIdFromParam(ctx.params.id as string);

  const employee = await employeeService.getEmployeeById(id);

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
export const getEmployeeByAbbreviation = async (ctx: Context): Promise<void> => {
  const abbreviation = ctx.params.abbreviation as string;

  const employee = await employeeService.getEmployeeByAbbreviation(abbreviation);

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
  const id = await getIdFromParam(ctx.params.id as string);

  // Validate request
  const { error, value } = employeeSchema.validate(ctx.request.body);

  if (error) {
    ctx.status = 400;
    ctx.body = { error: error.details[0].message };
    return;
  }

  try {
    const updatedEmployee = await employeeService.updateEmployee(id, value);

    // If employee not found after update
    if (!updatedEmployee) {
      ctx.status = 404;
      ctx.body = { error: 'Update of employee failed.' };
      return;
    }

    ctx.status = 200;
    ctx.body = updatedEmployee;
  } catch (error) {
    handleError(ctx, error);
  }
};

/**
 * Delete an employee
 * @param ctx
 */
export const deleteEmployee = async (ctx: Context): Promise<void> => {
  const id = await getIdFromParam(ctx.params.id as string);

  const deletedCount = await employeeService.deleteEmployee(id);

  if (deletedCount === 0) {
    ctx.status = 404;
    ctx.body = { error: 'Employee not found' };
    return;
  }

  ctx.status = 204;
};
