import Router from 'koa-router';
import { Student } from '../models/Student';

const router = new Router();

router.get('/students', async (ctx) => {
  const { page = 1, limit = 10 } = ctx.query;
  const offset = (Number(page) - 1) * Number(limit);

  const students = await Student.findAndCountAll({
    limit: Number(limit),
    offset: offset,
  });

  ctx.body = {
    data: students.rows,
    meta: {
      total: students.count,
      page: Number(page),
      limit: Number(limit),
    },
  };
});

export default router;
