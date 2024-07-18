import Router from 'koa-router';
import { Class } from '../models/Class';
import { Op } from 'sequelize';

const router = new Router();

// GET /classes
router.get('/classes', async (ctx) => {
  const { page = 1, limit = 10 } = ctx.query;
  const offset = (Number(page) - 1) * Number(limit);

  // Fetch classes
  const classes = await Class.findAndCountAll({
    limit: Number(limit),
    offset: offset,
    attributes: ['name', 'dateFrom', 'dateTo'],
    where: {
      dateFrom: {
        [Op.gte]: new Date()
      }
    }
  });

  ctx.body = {
    data: classes.rows,
    meta: {
      total: classes.count,
      page: Number(page),
      limit: Number(limit)
    }
  };
});

// GET /classes/:id
router.get('/classes/:id', async (ctx) => {
  const classId = ctx.params.id;

  // Fetch class
  const classObj = await Class.findByPk(classId, {
    attributes: [
      'classId',
      'name',
      'dateFrom',
      'dateTo',
      'roomId',
      ['employeeId', 'classTeacherId']
    ]
  });

  if (!classObj) {
    ctx.status = 404;
    ctx.body = { error: 'Class not found' };
    return;
  }

  ctx.body = classObj;
});

export default router;
