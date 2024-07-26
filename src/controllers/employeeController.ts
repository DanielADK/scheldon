import * as employeeRepository from '../repositories/employeeRepository';
import { Context } from 'koa';

export const getAllEmployees = async (ctx: Context): Promise<void> => {
  // Pagination
  const page = parseInt(ctx.query.page as string) || 1;
  const limit = parseInt(ctx.query.limit as string) || 10;

  // Get all employees
  const employees = await employeeRepository.getEmployees(
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
