import Router from 'koa-router';
import { Class } from '../models/Class';

const router = new Router();

router.get('/classes', async (ctx) => {
  const { page = 1, limit = 10 } = ctx.query;
  const offset = (Number(page) - 1) * Number(limit);

  const classes = await Class.findAndCountAll({
    limit: Number(limit),
    offset: offset,
    attributes: ['fullname', 'date_from', 'date_to'],
  });

  ctx.body = {
    data: classes.rows,
    meta: {
      total: classes.count,
      page: Number(page),
      limit: Number(limit),
    },
  };
});

export default router;
