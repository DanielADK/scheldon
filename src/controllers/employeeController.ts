import * as employeeService from '../services/employeeService';
import { Context } from 'koa';
import Joi from 'joi';
import { EmployeeDTO } from '../repositories/employeeRepository';

const createEmployeeSchema: Joi.ObjectSchema<EmployeeDTO> = Joi.object({
  username: Joi.string().required().min(3).max(30),
  name: Joi.string().required().min(3).max(50),
  surname: Joi.string().required().min(3).max(40),
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
  const { error, value } = createEmployeeSchema.validate(ctx.request.body);

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

// Get employee by username
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
