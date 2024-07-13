import Router from 'koa-router';
import { Subject } from '../models/Subject';

const router = new Router();

// All subjects
router.get('/subjects', async (ctx) => {
  const { page = 1, limit = 10 } = ctx.query;
  const offset = (Number(page) - 1) * Number(limit);

  const subjects = await Subject.findAndCountAll({
    limit: Number(limit),
    offset: offset,
  });

  ctx.body = {
    data: subjects.rows,
    meta: {
      total: subjects.count,
      page: Number(page),
      limit: Number(limit),
    },
  };
});

export default router;
