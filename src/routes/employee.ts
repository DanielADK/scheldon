import Router from 'koa-router';
import { Employee } from '../models/Employee';

const router = new Router();

/**
 * GET /employees
 * Fetches a paginated list of all active employees.
 *
 * Query parameters:
 * - page: The page number to fetch. Defaults to 1.
 * - limit: The number of employees per page. Defaults to 10.
 *
 * Response:
 * - data: An array of the fetched employees.
 * - meta: An object containing pagination information.
 */
router.get('/employees', async (ctx) => {
    const { page = 1, limit = 10 } = ctx.query;
    const offset = (Number(page) - 1) * Number(limit);

    const employees = await Employee.findAndCountAll({
        limit: Number(limit),
        offset: offset,
        where: {
            isActive: true
        }
    });

    ctx.body = {
        data: employees.rows,
        meta: {
            total: employees.count,
            page: Number(page),
            limit: Number(limit),
        },
    };
});

/**
 * GET /employees
 * Fetches a paginated list of all active employees.
 *
 * Query parameters:
 * - page: The page number to fetch. Defaults to 1.
 * - limit: The number of employees per page. Defaults to 10.
 *
 * Response:
 * - data: An array of the fetched employees.
 * - meta: An object containing pagination information.
 */
router.get('/employees/teachers', async (ctx) => {
    const { page = 1, limit = 10 } = ctx.query;
    const offset = (Number(page) - 1) * Number(limit);

    const employees = await Employee.findAndCountAll({
        limit: Number(limit),
        offset: offset,
        where: {
            isActive: true,
            isTeacher: true,
        }
    });

    ctx.body = {
        data: employees.rows,
        meta: {
            total: employees.count,
            page: Number(page),
            limit: Number(limit),
        },
    };
});

export default router;
